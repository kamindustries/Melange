out vec4 fragColor;

uniform float halfInverseCell;

int VELOCITY = 0;
int OBSTACLE_N = 1;  // bounds = {TOP, BOTTOM, LEFT, RIGHT}

vec2 sampleVelocity(ivec2 coord, vec4 bounds) {

    ivec2 cellOffset = ivec2(0, 0);
    vec2 multiplier = vec2(1.0, 1.0);
    
    vec4 oN = texelFetch(sTD2DInputs[OBSTACLE_N], coord, 0);
    

    //free-slip boundary: the average flow across the boundary is restricted to 0
    if (oN.z > 0.0) {
        cellOffset.x = 1;
        multiplier.x = -1.0;
    } else if (oN.w > 0.0) {
        cellOffset.x = -1;
        multiplier.x = -1.0;
    }
    if (oN.y > 0.0) {
        cellOffset.y = 1;
        multiplier.y = -1.0;
    } else if (oN.x > 0.0) {
        cellOffset.y = -1;
        multiplier.y = -1.0;
    }

    // return multiplier * texture2D(velocity, coord + cellOffset * invresolution).xy;
    return multiplier * texelFetchOffset(sTD2DInputs[VELOCITY], coord, 0, cellOffset).xy;

}

void main()
{
    ivec2 T = ivec2(gl_FragCoord.xy);

    vec4 oN = texelFetch(sTD2DInputs[OBSTACLE_N], T, 0);

    vec2 vN = sampleVelocity(T + ivec2(0,1), oN);
    vec2 vS = sampleVelocity(T + ivec2(0,-1), oN);
    vec2 vE = sampleVelocity(T + ivec2(1,0), oN);
    vec2 vW = sampleVelocity(T + ivec2(-1,0), oN);

    fragColor = vec4( halfInverseCell * ((vE.x - vW.x) + (vN.y - vS.y)) );

}
