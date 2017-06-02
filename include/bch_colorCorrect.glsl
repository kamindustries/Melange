///////////////////////////////////////////////////////////////////////
// BCH COLOR CORRECTION
///////////////////////////////////////////////////////////////////////
// BRIGHTNESS
vec3 Brightness(vec3 _col, float _f){
  vec3 BCH = rgb2bch(_col);
  vec3 b3 = vec3(BCH.x,BCH.x,BCH.x);
  float x = pow((_f + 1.)/2.,2.);
  x = _f;
  _col = _col + (b3 * x)/3.;
  return _col;
}

// CONTRAST
// simple contrast
// needs neighboring brightness values for higher accuracy
vec3 Contrast(vec3 _col, float _f){
  _col = rgb2bch(_col);
    _col.x = _col.x * pow(_col.x * (1.-clamp(_col.y, 0., .999)), _f);
  _col = bch2rgb(_col);
  return _col;
}

vec3 Saturation(vec3 _col, float _f){
  vec3 BCH = rgb2bch(_col);
  BCH.y *= (_f + 1.);
  BCH = bch2rgb(BCH);
  return BCH;
}

// S H A R P E N   
vec3 Sharpen(vec3 _col, float _f, int _n, vec2 _invRes, float _scale){
  if (_n > 0) {
    float b_avg = 0.;
    int n = (_n > 16) ? 16 : _n;
    float n_f = float(n);
    
    vec3 BCH = rgb2bch(_col);

    // get average of pixels in a square kernel around the current pixel
    for (int i = -_n; i < _n; i++){
      for (int j = -_n; j < _n; j++){
        vec2 offset = vec2(_invRes.x * i, _invRes.y * j);
        offset *= _scale;
      
        vec2 coord = vec2( vUV.s+offset.x, vUV.t+offset.y );
        vec4 col_offset = texture(sTD2DInputs[0], coord);
        vec3 def_offset = rgb2def(col_offset.rgb);
        b_avg += getB(def_offset);
      }
    }
    b_avg = b_avg/((n_f*2.)*(n_f*2.));

    BCH.x = b_avg * pow(BCH.x/b_avg, (_f + 1.));
    
    _col.rgb = bch2rgb(BCH);
    return _col;
  } //if n > 0
  else return _col;
}