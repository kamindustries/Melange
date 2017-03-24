layout(location=0) out vec3 fragColorPos;
layout(location=1) out vec3 fragColorVel;
layout(location=2) out vec4 fragColorCd;
layout(location=3) out float fragColorMass;
layout(location=4) out float fragColorMomentum;
layout(location=5) out float fragColorLife;

uniform float dt;
uniform float ageRate;
uniform int reset;
uniform int fixAttempts;
uniform float absTime;

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
    float life = texture2D(sTD2DInputs[LIFE_OLD], vUV.st).r;

    // bool spawn = life < 0. ? true : false;
    bool spawn = (texture2D(sTD2DInputs[SPAWN_NEW], vUV.st).r > 0) ? true : false;
    bool alive = (life > 0. && life < 1.) ? true : false;
    if (reset > 0) spawn = true;

    vec2 spawnCoord = vUV.st;

    // SPAWN
    if (!spawn && !alive) {
        float try = fixAttempts;
        bool foundNew = false;
        while (try > 0 && !foundNew) {
            vec2 randOffset = vec2(rand(vec2(try + (absTime+.2),try + (absTime+.4))), rand(vec2(try + (absTime+.6),try + (absTime+.8))));
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
        life = 1.0 - ageRate;

        position = texture2D(sTD2DInputs[POS_NEW], spawnCoord).xyz;
        velocity = texture2D(sTD2DInputs[VELOCITY_NEW], spawnCoord).xyz * dt * dt * .1;
        color = texture2D(sTD2DInputs[COLOR_NEW], spawnCoord);
        mass = texture2D(sTD2DInputs[MASS_NEW], spawnCoord).r;
        momentum = texture2D(sTD2DInputs[MOMENTUM_NEW], spawnCoord).r;

    } //SPAWN

    if (alive) {
        
        // vec2 posCoord = fit(position.xy, vec2(-8.,-1.), vec2(8.,1.), vec2(0.), vec2(1.));
        vec2 posCoord = position.xy;
        vec3 velocity_new = texture2D(sTD2DInputs[VELOCITY_NEW], posCoord ).rgb;
        //vec3 velocity_new = vec3(0.0);  // placeholder for new velocity field
        velocity = velocity_new * (mass * .1 * dt ) * dt + velocity * momentum; // how is fluid force related to the *.1?
        
        //velocity *= life;
        
        position += velocity;

        color = texture2D(sTD2DInputs[COLOR_OLD], vUV.st);

        life -= ageRate;

    } //else

    if (life < 0.) {
        velocity = vec3(0.);
        color = vec4(0.);
    }

    fragColorPos = position;
    fragColorVel = velocity;
    fragColorCd = color;
    fragColorMass = mass;
    fragColorMomentum = momentum;
    fragColorLife = life;

} //main
