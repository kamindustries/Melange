out vec4 fragColor;

uniform float dt;
uniform float ambientTemp;
uniform float sigma;
uniform float kappa;

int VELOCITY = 0;
int DENS_TEMP = 1;
int AMB_TEMP = 2;
int BUOY_MASK = 3;

// densTemp.rgba = (densityA, densityB, temperature, -)

void main()
{

  ivec2 TC = ivec2(gl_FragCoord.xy);

  vec4 densTemp = texelFetch(sTD2DInputs[DENS_TEMP], TC, 0);
  vec2 V = texelFetch(sTD2DInputs[VELOCITY], TC, 0).xy;
  float ambTemp = texture(sTD2DInputs[AMB_TEMP], vec2(0.5, 0.5), 0).b;

  // ambTemp = 0.;

  fragColor = vec4(V, 0., 0.);

  if (densTemp.b > ambTemp) {
      // vec2 buoyDirection = texelFetch(sTD2DInputs[BUOY_MASK], TC, 0).xy;
      vec2 buoy = (dt * (densTemp.b - ambTemp) * sigma - densTemp.g * kappa ) * vec2(1.) * vec2(0,-1.);
      fragColor += vec4(buoy, 0., 0.);
  }

}
