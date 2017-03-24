out vec4 fragColor;

uniform float gradientScale;
uniform float halfInverseCell;

int VELOCITY = 0;
int PRESSURE = 1;
int OBSTACLE_N = 2;
void main()
{
    ivec2 T = ivec2(gl_FragCoord.xy);

    // Find neighboring pressure:
    vec4 P = vec4(0.);
    P.x = texelFetchOffset(sTD2DInputs[PRESSURE], T, 0, ivec2(0, 1)).r;
    P.y = texelFetchOffset(sTD2DInputs[PRESSURE], T, 0, ivec2(0, -1)).r;
    P.z = texelFetchOffset(sTD2DInputs[PRESSURE], T, 0, ivec2(1, 0)).r;
    P.w = texelFetchOffset(sTD2DInputs[PRESSURE], T, 0, ivec2(-1, 0)).r;

    // pure Neumann pressure boundary
    vec4 oN = texelFetch(sTD2DInputs[OBSTACLE_N], T, 0);

    float pN = mix(P.x, P.y, oN.x);  // if (oT > 0.0) xT = xC;
    float pS = mix(P.y, P.x, oN.y);  // if (oB > 0.0) xB = xC;
    float pE = mix(P.z, P.w, oN.z);  // if (oR > 0.0) xR = xC;
    float pW = mix(P.w, P.z, oN.w);  // if (oL > 0.0) xL = xC;



	ivec2 offsetN = ivec2(0,1);
    ivec2 offsetS = ivec2(0,-1);
    ivec2 offsetE = ivec2(1,0);
    ivec2 offsetW = ivec2(-1,0);
    
	if (oN.x > 0.) offsetN.y = -1; 
    else if (oN.y > 0.) offsetS.y = 1; 
    
    if (oN.z > 0.) offsetE.x = -1; 
    else if (oN.w > 0.) offsetW.x = 1; 
	
	pN = texelFetchOffset(sTD2DInputs[PRESSURE], T, 0, offsetN).r;
	pS = texelFetchOffset(sTD2DInputs[PRESSURE], T, 0, offsetS).r;
	pE = texelFetchOffset(sTD2DInputs[PRESSURE], T, 0, offsetE).r;
	pW = texelFetchOffset(sTD2DInputs[PRESSURE], T, 0, offsetW).r;



    //vec2 grad = vec2(pE - pW, pN - pS) * gradientScale * 1;
    vec2 grad = vec2(pE - pW, pN - pS) * halfInverseCell;
    vec2 oldV = texelFetch(sTD2DInputs[VELOCITY], T, 0).xy;

    fragColor = vec4(oldV - grad, 0., 0.);
}
