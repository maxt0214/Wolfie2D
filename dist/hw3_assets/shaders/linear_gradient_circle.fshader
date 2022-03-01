precision mediump float;

varying vec4 v_Position;

uniform vec4 circle_Color;
uniform vec4 circle_Color2;

// HOMEWORK 3 - TODO
/*
	The fragment shader is where pixel colors are decided.
	You'll have to modify this code to make the circle vary between 2 colors.
	Currently this will render the exact same thing as the gradient_circle shaders
*/
void main(){
	// Default alpha is 0
	float alpha = 0.0;

	// Radius is 0.5, since the diameter of our quad is 1
	float radius = 0.5;

	// Get the distance squared of from (0, 0)
	float dist_sq = v_Position.x*v_Position.x + v_Position.y*v_Position.y;

	if(dist_sq < radius*radius){
		// Multiply by 4, since distance squared is at most 0.25
		alpha = 4.0*dist_sq;
	}

	// Use the alpha value in our color
	float dist_tr_sq = 1.0 - ((1.0-v_Position.x)*(1.0-v_Position.x) + (1.0-v_Position.y)*(1.0-v_Position.y))/4.0;
	
	gl_FragColor = vec4(circle_Color.x * dist_tr_sq + circle_Color2.x * (1.0-dist_tr_sq),
						circle_Color.y * dist_tr_sq + circle_Color2.y * (1.0-dist_tr_sq),
						circle_Color.z * dist_tr_sq + circle_Color2.z * (1.0-dist_tr_sq),
						0);
	
	gl_FragColor.a = alpha;
}