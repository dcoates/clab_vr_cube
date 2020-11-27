/**
 * Full-screen textured quad shader
 */

var LumGammaShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"intensity1": { value: 1.0 },
		"intensity2": { value: 1.0 },
		"con1": { value: 1.0 },
		"con2": { value: 1.0 },
		"canvas_half": { value: 1300.0 },  // # of pixels exactly halfway across (to split into L/R in VR)
		"inv_gamma": { value: 1.0/2.4 },

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",
		"uniform float inv_gamma;",
		"uniform sampler2D tDiffuse;",
		"uniform vec2 u_resolution;",
		"uniform float intensity1;",
		"uniform float intensity2;",
		"uniform float con1;",
		"uniform float con2;",
		"uniform float canvas_half;",

		"varying vec2 vUv;",

		"void main() {",
		"       vec2 posxy = gl_FragCoord.xy;",
		"	vec4 texel = texture2D( tDiffuse, vUv );",

        // Debugging: ramp
        // "   float pix1 = mod(posxy.x,256.0)/256.0;",
		//"	texel = vec4(pix1,pix1,pix1,1.0); ", // set to white
               // "       vec3 color = vec3(texel.r+intensity1,texel.g+intensity2,texel.b);", // For debugging: increment, green
                //"       vec3 con2  = vec3(color, color, color);",
        //
                "       float value = texel.r;", // ASSUME r=g=b (achromatic)
                "       float contrasted1 = 0.5 + (value-0.5)*con1;",
                "       float contrasted2 = 0.5 + (value-0.5)*con2;",
                "       float scaled1 = contrasted1*intensity1;", 
                "       float scaled2 = contrasted2*intensity2;", 
                "       float right = step(canvas_half,posxy.x);",
                "       float left = 1.0-right;",
                "       float final= left*scaled1+right*scaled2;",
                "       float post_gamma = pow(final,inv_gamma);",
                "	    gl_FragColor = vec4(post_gamma,post_gamma,post_gamma,1.0);",

		"}"

	].join( "\n" )

};

export { LumGammaShader };
