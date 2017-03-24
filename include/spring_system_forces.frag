layout(location=0) out vec3 fragColorForce;

uniform float dt;
uniform float springConstant;
uniform float restLength;
uniform float dampingConstant;
uniform float viscousDrag;
uniform float anchorForce;
uniform float fluidForce;

vec2 springs[2] = vec2[2](vec2(-1.,0.), vec2(1.,0.));

const int POSITION = 0;
const int VELOCITY = 1;
const int VELOCITY_NEW = 2;
const int ANCHOR = 3;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 fit(vec2 val, vec2 inMin, vec2 inMax, vec2 outMin, vec2 outMax) {
    return ((outMax - outMin) * (val - inMin) / (inMax - inMin)) + outMin;
}



///////////////////////////////////////////////////////////
// M A I N
///////////////////////////////////////////////////////////
void main() {

    // viscous drag
    vec3 p1 = texture2D(sTD2DInputs[POSITION], vUV.st).xyz;
    vec3 v1 = texture2D(sTD2DInputs[VELOCITY], vUV.st).xyz;
    vec3 vel_new = texture2D(sTD2DInputs[VELOCITY_NEW], p1.xy).xyz; 
    vec3 anchor = texture2D(sTD2DInputs[ANCHOR], vUV.st).xyz;
    vec3 force = vec3(0.);

    force -= viscousDrag * v1; // viscous drag * velocity
    force += vel_new * dt * dt * fluidForce;
    force += (anchor-p1) * anchorForce;

    // spring interaction
    float cellSize = uTD2DInfos[POSITION].res.x;

    for (int i = 0; i < 2; i++) {
        vec2 offset = vec2(cellSize, 0.);
        offset *= springs[i];
        vec2 coord = vUV.st + offset;
        
        if (coord.x < 0.) coord.x = 1.-cellSize;
        if (coord.x > 1.) coord.x = 0.+cellSize;

        vec3 p2 = texture2D(sTD2DInputs[POSITION], coord).xyz;
        vec3 v2 = texture2D(sTD2DInputs[VELOCITY], coord).xyz;

        vec3 dx = p1 - p2;
        float len = length(dx);

        vec3 f = vec3(springConstant * (len - restLength)); // spring constant * (magnitude - restLength)
        f += dampingConstant * (v1 - v2) * (dx/vec3(len)); // damping constant * (ve1-vel2) * (dx/magnitude);
        f *= -dx/vec3(len);

        // if (coord.x < 0. || coord.x > 1.) f = vec3(0.);


        force += f;
    }

    fragColorForce = force;

} //main
