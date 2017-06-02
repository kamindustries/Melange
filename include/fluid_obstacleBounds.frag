// Precompute the obstacle neighborhood to use in Jacobi and gradient subtraction
// Idea taken from PixelFlow, Thomas Diewald (MIT License): https://github.com/diwi/PixelFlow
// bounds = {TOP, BOTTOM, LEFT, RIGHT}
uniform int boundaryRadius;

out vec4 fragColor;

int OBSTACLE = 0;

void main()
{
    ivec2 T = ivec2(gl_FragCoord.xy);

    fragColor = vec4(0.);

    // Find neighboring obstacles:
    vec4 b = vec4(0.);

    for (int i = 1; i < boundaryRadius+1; i++){
        b.x += texelFetchOffset(sTD2DInputs[OBSTACLE], T, 0, ivec2(0, i)).b;
        b.y += texelFetchOffset(sTD2DInputs[OBSTACLE], T, 0, ivec2(0, -i)).b;
        b.z += texelFetchOffset(sTD2DInputs[OBSTACLE], T, 0, ivec2(-i, 0)).b;
        b.w += texelFetchOffset(sTD2DInputs[OBSTACLE], T, 0, ivec2(i, 0)).b;
    }

    fragColor = clamp(b, vec4(0.), vec4(1.));
}
