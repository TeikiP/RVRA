uniform sampler2D colorMap;

// center of lens for un-distortion (in normalized coordinates between 0 and 1)
uniform vec2 centerCoordinate;

// lens distortion parameters
uniform vec2 K; 

// texture coordinates
varying vec2 vUv;

// basic square function ('x' -> 'x^2')
float square(float x) {
    return x * x;
}

void main() {
  // we find rr (r^2) that will be used in the following steps
  float rr = square(vUv.x - centerCoordinate.x) + square(vUv.y - centerCoordinate.y);
  
  // we find the corrected image points
  float xu = vUv.x + (vUv.x - centerCoordinate.x) * (K.x * rr + K.y * square(rr));
  float yu = vUv.y + (vUv.y - centerCoordinate.y) * (K.x * rr + K.y * square(rr));

  // set appropriate fragment color
  if (xu < 0.0 || xu > 1.0 || yu < 0.0 || yu > 1.0)
    gl_FragColor = vec4(0, 0, 0, 1.0);
    
  else
	  gl_FragColor = texture2D(colorMap, vec2(xu, yu));
}
