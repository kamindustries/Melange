out vec4 fragColor;

uniform float alpha;
uniform float inverseBeta;

int PRESSURE = 0;
int DIVERGENCE = 1;
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
	
    float bC = texelFetch(sTD2DInputs[DIVERGENCE], T, 0).r;
    fragColor = vec4(pW + pE + pS + pN + alpha * bC) * inverseBeta;
}
