uniform float time;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 viewMatrix;

attribute vec3 offset;
attribute vec2 scale;
attribute vec4 quaternion;
attribute float rotation;
attribute vec2 uv;
attribute vec4 color;
attribute float blend;
attribute float texture;
attribute vec3 cameraPosition;
attribute vec3 position;

varying vec2 vUv;
varying vec4 vColor;
varying float vBlend;
varying float num;

vec3 localUpVector=vec3(0.,1.,0.);

void main(){
  
  float angle=time*rotation;
  vec3 vRotated=vec3(position.x*scale.x*cos(angle)-position.y*scale.y*sin(angle),position.y*scale.y*cos(angle)+position.x*scale.x*sin(angle),position.z);
  
  vUv=uv;
  vColor=color;
  vBlend=blend;
  num=texture;
  
  vec3 vPosition;
  
  /*
  vec3 vLook=normalize(offset-cameraPosition);
  vec3 vRight=normalize(cross(vLook,localUpVector));
  vec3 vUp=normalize(cross(vLook,vRight));
  vPosition=vRight*vRotated.x+vUp*vRotated.y+vLook*vRotated.z;
  */
  
  vec3 vLook=offset-cameraPosition;
  vec3 vRight=normalize(cross(vLook,localUpVector));
  vPosition=vRotated.x*vRight+vRotated.y*localUpVector+vRotated.z;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(vPosition+offset,1.);
}
