/**
 * Full-screen textured quad shader
 */

var LumGammaShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"opacity": { value: 1.0 },
		"inv_gamma": { value: 1.0/2.4 }

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

		"varying vec2 vUv;",

		"void main() {",

		"	vec4 texel = texture2D( tDiffuse, vUv );",
                "       vec3 color = vec3(pow(texel.r,inv_gamma),pow(texel.g,inv_gamma),pow(texel.b,inv_gamma))*opacity;",
		"	gl_FragColor = vec4(color,1.0);",

		"}"

	].join( "\n" )

};

export { LumGammaShader };
