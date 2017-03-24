layout(location=0) out vec3 fragColorPosition;
layout(location=1) out vec3 fragColorVelocity;

uniform float dt;
uniform float mass;

const int POSITION = 0;
const int VELOCITY = 1;
const int FORCE = 2;

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

    vec3 pos = texture2D(sTD2DInputs[POSITION], vUV.st).xyz;
    vec3 vel = texture2D(sTD2DInputs[VELOCITY], vUV.st).xyz;
    vec3 force = texture2D(sTD2DInputs[FORCE], vUV.st).xyz;

    vec3 dpdt = vel;
    vec3 dvdt = force/vec3(mass);  // force/mass
    
    pos += dpdt * dt;
    vel += dvdt * dt;

    fragColorPosition = pos;
    fragColorVelocity = vel; 

} //main
