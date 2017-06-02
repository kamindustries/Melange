layout(location=0) out vec3 fragColorPos;
layout(location=1) out vec3 fragColorVel;
layout(location=2) out vec4 fragColorCd;
layout(location=3) out float fragColorMass;
layout(location=4) out float fragColorMomentum;
layout(location=5) out vec4 fragColorLife;

const vec2[4] laplacian = vec2[](vec2(-1.,0.), vec2(1.,0.), vec2(0.,1.), vec2(0.,-1.)); 

uniform float dt;
uniform float constAgeRate;
uniform int reset;
uniform int fixAttempts;
uniform float absTime;
uniform float cellSize;

int POS_NEW = 0;
int VELOCITY_NEW = 1;
int COLOR_NEW = 2;
int MASS_NEW = 3;
int MOMENTUM_NEW = 4;
int SPAWN_NEW = 5;
int POS_OLD = 6;
int VELOCITY_OLD = 7;
int COLOR_OLD = 8;
int MASS_OLD = 9;
int MOMENTUM_OLD = 10;
int LIFE_OLD = 11;
int NOISE = 12;

float bounds = .999;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float luminance(vec3 c){
	return dot(c, vec3(.2126, .7152, .0722));
}

float fit(float val, float inMin, float inMax, float outMin, float outMax) {
    return ((outMax - outMin) * (val - inMin) / (inMax - inMin)) + outMin;
}
vec2 fit(vec2 val, vec2 inMin, vec2 inMax, vec2 outMin, vec2 outMax) {
    return ((outMax - outMin) * (val - inMin) / (inMax - inMin)) + outMin;
}


///////////////////////////////////////////////////////////
// M A I N
///////////////////////////////////////////////////////////
void main() {

    vec3 position = texture2D(sTD2DInputs[POS_OLD], vUV.st).xyz;
    vec3 velocity = texture2D(sTD2DInputs[VELOCITY_OLD], vUV.st).xyz;
    vec4 color = texture2D(sTD2DInputs[COLOR_OLD], vUV.st);
    float mass = texture2D(sTD2DInputs[MASS_OLD], vUV.st).r;
    float momentum = texture2D(sTD2DInputs[MOMENTUM_OLD], vUV.st).r;

    // aging = (life, age rate, -, -)
    vec4 life = texture2D(sTD2DInputs[LIFE_OLD], vUV.st);
    float ageRate = life.y;

    // bool spawn = life < 0. ? true : false;
    bool spawn = (texture2D(sTD2DInputs[SPAWN_NEW], vUV.st).r > 0) ? true : false;
    bool alive = (life.r > 0. && life.r < 1.) ? true : false;
    if (reset > 0) spawn = true;

    vec2 spawnCoord = vUV.st;
    vec2 randOffset = vec2(0.);

    bool stopped = (length(velocity.xy) < .00005) ? true : false;

    // SPAWN
    if (!spawn && stopped) {
        float try = fixAttempts;
        bool foundNew = false;
        while (try > 0 && !foundNew) {
            randOffset = vec2(rand(vec2(try + (absTime+.2),try + (absTime+.4))), rand(vec2(try + (absTime+.6),try + (absTime+.8))));
            spawnCoord = texture(sTD2DInputs[NOISE], vUV.st + randOffset).st;
            float checkSpawn = texture(sTD2DInputs[SPAWN_NEW], spawnCoord).r;
            if (checkSpawn > 0.) {
                spawn = true;
                foundNew = true;
                break;
            }
            try -= 1.;
        }

    }

    // if (spawn && !alive) {
    if (spawn) {
        

        vec4 RANDOM_TX = texture(sTD2DInputs[NOISE], vUV.st);


        position = texture2D(sTD2DInputs[POS_NEW], spawnCoord).xyz;
        velocity = texture2D(sTD2DInputs[VELOCITY_NEW], spawnCoord).xyz * dt * dt * .1;
        color = texture2D(sTD2DInputs[COLOR_NEW], spawnCoord);
        mass = texture2D(sTD2DInputs[MASS_NEW], spawnCoord).r;
        momentum = texture2D(sTD2DInputs[MOMENTUM_NEW], spawnCoord).r;

        position.xy += (RANDOM_TX.xy * .005);

        float selectedAgeRate = constAgeRate;
        selectedAgeRate *= fit(RANDOM_TX.z, 0., 1., .8, 1.2);
        life.r = 1.0 - selectedAgeRate;
        life.g = selectedAgeRate;

    } //SPAWN

    if (alive) {
        
        // vec2 posCoord = fit(position.xy, vec2(-8.,-1.), vec2(8.,1.), vec2(0.), vec2(1.));
        vec2 posCoord = position.xy;
        vec3 velocity_new = texture2D(sTD2DInputs[VELOCITY_NEW], posCoord ).rgb;
        //vec3 velocity_new = vec3(0.0);  // placeholder for new velocity field
        // velocity = velocity_new * (mass * .1  * dt ) * dt + velocity * momentum; // how is fluid force related to the *.1?
        velocity = velocity_new * (mass * pow(1./cellSize, dt * 20.)  ) * dt + velocity * momentum; // how is fluid force related to the *.1?
        // velocity.x *= 1./1.777;
        //velocity *= life;
        
        position += (velocity * vec3(1., 1.777, 1.));

        color = texture2D(sTD2DInputs[COLOR_OLD], vUV.st);
        vec4 cdNew = texture2D(sTD2DInputs[COLOR_NEW], vUV.st);
        color = mix(color, cdNew, .1);

        if (posCoord.x < 0. || posCoord.x > 1. || posCoord.y < 0. || posCoord.y > 1.) {
            life.r = 0.;
        }

        life.r -= ageRate;

    } //else

    if (life.r < 0.) {
        velocity = vec3(0.);
        color = vec4(0.);
        position.x = -1000.;
    }

    fragColorPos = position;
    fragColorVel = velocity;
    fragColorCd = color;
    fragColorMass = mass;
    fragColorMomentum = momentum;
    fragColorLife = life;

} //main
