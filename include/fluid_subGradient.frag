out vec4 fragColor;

uniform float gradientScale;
uniform float halfInverseCell;

int VELOCITY = 0;
int PRESSURE = 1;
int OBSTACLE_N = 2; // bounds = {TOP, BOTTOM, LEFT, RIGHT}

float samplePressure(ivec2 coord, vec4 bounds) {

    ivec2 cellOffset = ivec2(0, 0);

    vec4 oN = texelFetch(sTD2DInputs[OBSTACLE_N], coord, 0);

    if (oN.z > 0.0)      cellOffset.x = 1;
    else if (oN.w > 0.0) cellOffset.x = -1;
    if (oN.y > 0.0)      cellOffset.y = 1;
    else if (oN.x > 0.0) cellOffset.y = -1;

    return texelFetchOffset(sTD2DInputs[PRESSURE], coord, 0, cellOffset).x;

}

void main()
{
    ivec2 T = ivec2(gl_FragCoord.xy);

    // pure Neumann pressure boundary
    vec4 oN = texelFetch(sTD2DInputs[OBSTACLE_N], T, 0);

    float pW = samplePressure(T + ivec2(-1, 0), oN);
    float pE = samplePressure(T + ivec2(1, 0), oN);
    float pS = samplePressure(T + ivec2(0, -1), oN);
    float pN = samplePressure(T + ivec2(0, 1), oN);

    //vec2 grad = vec2(pE - pW, pN - pS) * gradientScale * 1;
    vec2 grad = vec2(pE - pW, pN - pS) * halfInverseCell;
    vec2 oldV = texelFetch(sTD2DInputs[VELOCITY], T, 0).xy;

    fragColor = vec4(oldV - grad, 0., 0.);
}
