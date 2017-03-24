///////////////////////////////////////////////////////////////////////
// B C H
///////////////////////////////////////////////////////////////////////
// XYZ = sRGB nonD50
const mat3 RGB2XYZ = mat3(vec3(0.4360747,  0.3850649,  0.1430804), 
                          vec3(0.2225045,  0.7168786,  0.0606169),
                          vec3(0.0139322,  0.0971045,  0.7141733));
const mat3 XYZ2DEF = mat3(vec3(0.2053, 0.7125, 0.4670), 
                          vec3(1.8537, -1.2797, -0.4429),
                          vec3(-0.3655, 1.0120, -0.6104));
const mat3 DEF2XYZ = mat3(vec3(0.6712, 0.4955, 0.1540), 
                          vec3(0.7061, 0.0248, 0.5223),
                          vec3(0.7689, -0.2556, -0.8645));
const mat3 XYZ2RGB = mat3(vec3(3.1338561, -1.6168667, -0.4906146), 
                          vec3(-0.9787684, 1.9161415, 0.0334540),
                          vec3(0.0719453, -0.2289914, 1.4052427));

vec3 rgb2def(vec3 _col){
  vec3 xyz = _col.rgb * RGB2XYZ;
  vec3 def = xyz * XYZ2DEF;
  return def;
}

vec3 def2rgb(vec3 _def){
  vec3 xyz = _def * DEF2XYZ;
  vec3 rgb = xyz * XYZ2RGB;
  return rgb;
}

// Get B, C, H
float getB(vec3 _def){
    return sqrt((_def.r*_def.r) + (_def.g*_def.g) + (_def.b*_def.b));
}
float getC(vec3 _def){
    vec3 def_D = vec3(1.,0.,0.);
    return atan(length(cross(_def,def_D)), dot(_def,def_D));
}
float getH(vec3 _def){
    vec3 def_E_axis = vec3(0.0,1.0,0.0);
    return atan(_def.z, _def.y) - atan(def_E_axis.z, def_E_axis.y) ;
}

vec3 rgb2bch(vec3 _col){
  vec3 DEF = rgb2def(_col);
  return vec3(getB(DEF), getC(DEF), getH(DEF));
}

vec3 bch2rgb(vec3 _bch, vec2 r = vec2(1.0)){
  vec3 def;
  def.x = _bch.x * cos(_bch.y);
  def.y = _bch.x * sin(_bch.y) * cos(_bch.z * r.x);
  def.z = _bch.x * sin(_bch.y) * sin(_bch.z * r.y);
  return def2rgb(def);
}
//BCH


// HSV
// Official HSV to RGB conversion
vec3 hsv2rgb( in vec3 c ){
  vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
	return c.z * mix( vec3(1.0), rgb, c.y);
}

// Smooth HSV to RGB conversion
vec3 hsv2rgb_smooth( in vec3 c ){
  vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
	rgb = rgb*rgb*(3.0-2.0*rgb); // cubic smoothing
	return c.z * mix( vec3(1.0), rgb, c.y);
}
