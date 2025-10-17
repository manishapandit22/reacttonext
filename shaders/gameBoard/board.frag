//normal mapping and realistic lighting

uniform sampler2D map;
uniform sampler2D heightMap;
uniform sampler2D normalMap;
uniform vec3 lightPosition;
uniform vec3 lightColor;
uniform float roughness;
uniform float metalness;
uniform float normalStrength;
uniform vec3 cameraPosition;

varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;

vec3 getNormalFromMap(){
    vec3 tangentNormal=texture2D(normalMap,vUv).xyz*2.-1.;
    tangentNormal.xy*=normalStrength;
    
    vec3 N=normalize(vNormal);
    vec3 T=normalize(vTangent);
    vec3 B=normalize(vBitangent);
    mat3 TBN=mat3(T,B,N);
    
    return normalize(TBN*tangentNormal);
}

void main(){
    // Sample base color - this should preserve the original image colors
    vec4 baseColor=texture2D(map,vUv);
    
    // Sample height for subtle effects
    float height=texture2D(heightMap,vUv).r;
    
    // Get normal from normal map
    vec3 normal=getNormalFromMap();
    
    // Lighting calculation
    vec3 lightDir=normalize(lightPosition-vWorldPosition);
    vec3 viewDir=normalize(cameraPosition-vWorldPosition);
    
    // Diffuse lighting - keep it moderate
    float NdotL=max(dot(normal,lightDir),0.);
    
    // Specular lighting - keep it subtle
    vec3 halfwayDir=normalize(lightDir+viewDir);
    float NdotH=max(dot(normal,halfwayDir),0.);
    float spec=pow(NdotH,32.)*.1;// Much more subtle specular
    
    // Ambient occlusion from height map - very subtle
    float ao=mix(.85,1.,height);// Less dramatic AO
    
    // Keep lighting subtle to preserve original colors
    vec3 ambient=vec3(.6)*ao;// Higher ambient to preserve base colors
    vec3 diffuse=vec3(.4)*NdotL;// Moderate diffuse contribution
    vec3 specular=lightColor*spec*metalness;
    
    // Combine lighting with base color - preserve original colors
    vec3 result=baseColor.rgb*(ambient+diffuse)+specular;
    
    // Very subtle height-based variation
    result=mix(result,result*mix(.95,1.05,height),.3);
    
    // No tone mapping - preserve original colors
    gl_FragColor=vec4(result,baseColor.a);
}