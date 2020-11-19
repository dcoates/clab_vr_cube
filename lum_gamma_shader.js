/**
 * Full-screen textured quad shader
 */

var LumGammaShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"intensity1": { value: 0.2 },
		"intensity2": { value: 0.8 },
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
		"uniform float canvas_half;",

		"varying vec2 vUv;",

		"void main() {",
		"       vec2 posxy = gl_FragCoord.xy;",
		"	vec4 texel = texture2D( tDiffuse, vUv );",
                "       vec3 color = vec3(pow(texel.r,inv_gamma),pow(texel.g,inv_gamma),pow(texel.b,inv_gamma));",
                "       vec3 mult1 = vec3(intensity1, intensity1, intensity1);",
                "       vec3 mult2 = vec3(intensity2, intensity2, intensity2);",
                "       color = step(canvas_half,posxy.x)*mult1*color+(1.0-step(canvas_half,posxy.x))*mult2*color;",
		"	gl_FragColor = vec4(color,1.0);",

		"}"

	].join( "\n" )

};

export { LumGammaShader };
