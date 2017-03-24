// https://github.com/princemio/ofxMIOFlowGLSL

// uniform sampler2DRect tex0;  
// uniform sampler2DRect tex1;  

out vec4 fragColor;

int tex0 = 0;
int tex1 = 1;

uniform vec2 scale;  
uniform vec2 offset;  
uniform float lambda;   

float gradMult[3] = float[3](1./offset.x, .5, 1.);

vec4 getColorCoded(float x, float y,vec2 scale) {
    vec2 xout = vec2(max(x,0.),abs(min(x,0.)))*scale.x;
    vec2 yout = vec2(max(y,0.),abs(min(y,0.)))*scale.y;
    float dirY = 1;
    if (yout.x > yout.y)  dirY=0.90;
    return vec4(xout.xy,max(yout.x,yout.y),dirY);
}


vec4 getGrayScale(vec4 col) {
    float gray = dot(vec3(col.x, col.y, col.z), vec3(0.3, 0.59, 0.11));
    return vec4(gray,gray,gray,1);
}

vec4 textureGray(int textureIndex, vec2 coord) {
    return getGrayScale(texture(sTD2DInputs[textureIndex], coord * uTD2DInfos[0].res.xy));
}

void main()  
{     
    vec2 texCoord = vUV.st * uTD2DInfos[0].res.zw;

    vec4 a = textureGray(tex0, texCoord);
    vec4 b = textureGray(tex1, texCoord);
    vec2 x1 = vec2(offset.x,0.);
    vec2 y1 = vec2(0.,offset.y);

    //get the difference
    vec4 curdif = b-a;

    vec4 gradx = vec4(0.);
    vec4 grady = vec4(0.);

    if (offset.x > 5) {
        for(int i = 0; i < 3; i++){
            x1.x = offset.x * gradMult[i];
            y1.y = offset.y * gradMult[i];
            
            gradx += textureGray(tex1, texCoord+x1)-textureGray(tex1, texCoord-x1);
            gradx += textureGray(tex0, texCoord+x1)-textureGray(tex0, texCoord-x1);

            grady += textureGray(tex1, texCoord+y1)-textureGray(tex1, texCoord-y1);
            grady += textureGray(tex0, texCoord+y1)-textureGray(tex0, texCoord-y1);
        }

        gradx /= vec4(3.);
        grady /= vec4(3.);
    }
    else{
        gradx = textureGray(tex1, texCoord+x1)-textureGray(tex1, texCoord-x1);
        gradx += textureGray(tex0, texCoord+x1)-textureGray(tex0, texCoord-x1);

        grady = textureGray(tex1, texCoord+y1)-textureGray(tex1, texCoord-y1);
        grady += textureGray(tex0, texCoord+y1)-textureGray(tex0, texCoord-y1);  
    }

    // //calculate the gradient
    // //for X________________
    // vec4 gradx = textureGray(tex1, texCoord+x1)-textureGray(tex1, texCoord-x1);
    // gradx += textureGray(tex0, texCoord+x1)-textureGray(tex0, texCoord-x1);

    // //for Y________________
    // vec4 grady = textureGray(tex1, texCoord+y1)-textureGray(tex1, texCoord-y1);
    // grady += textureGray(tex0, texCoord+y1)-textureGray(tex0, texCoord-y1);

    vec4 gradmag = sqrt((gradx*gradx)+(grady*grady)+vec4(lambda));

    vec4 vx = curdif*(gradx/gradmag);
    vec4 vy = curdif*(grady/gradmag);

    fragColor = getColorCoded(vx.r,vy.r,scale);   
}  
