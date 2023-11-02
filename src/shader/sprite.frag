precision mediump float;

const int count=3;
uniform sampler2D map[count];
varying vec2 vUv;
varying vec4 vColor;
varying float vBlend;
varying float num;

void main(){
  
  if(num==0.){gl_FragColor=texture2D(map[0],vUv)*vColor;}
  else if(num==1.){gl_FragColor=texture2D(map[1],vUv)*vColor;}
  else if(num==2.){gl_FragColor=texture2D(map[2],vUv)*vColor;}
  
  gl_FragColor.rgb*=gl_FragColor.a;
  gl_FragColor.a*=vBlend;
}
