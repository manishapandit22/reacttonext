//tangent spcace calculation

uniform sampler2D heightMap;
uniform float heightScale;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;

void main(){
    vUv=uv;
    
    // Sample height from heightmap
    float height=texture2D(heightMap,uv).r;
    
    // Very subtle displacement
    vec3 newPosition=position+normal*height*heightScale*.05;
    
    // Calculate world position for lighting
    vec4 worldPosition=modelMatrix*vec4(newPosition,1.);
    vWorldPosition=worldPosition.xyz;
    
    // Transform normal to world space
    vNormal=normalize(normalMatrix*normal);
    
    // Calculate tangent and bitangent for normal mapping
    vec3 tangent=normalize(cross(normal,vec3(0.,0.,1.)));
    if(length(tangent)<.1){
        tangent=normalize(cross(normal,vec3(1.,0.,0.)));
    }
    vec3 bitangent=normalize(cross(normal,tangent));
    
    vTangent=normalize(normalMatrix*tangent);
    vBitangent=normalize(normalMatrix*bitangent);
    
    gl_Position=projectionMatrix*modelViewMatrix*vec4(newPosition,1.);

}