var WebGLApp = function()
{	
	// Globals
	var that = this;
	this.gl = null;
	this.vbuffer = null;
	this.program = null;
	this.vattrib = null;
	this.canvas = null;
	this.indices = null;
	
	this.projMat = new THREE.Matrix4(); 
    this.modelViewMat = new THREE.Matrix4();   

	this.radius = 1.0
    this.numVertices = 20
	
	// Rendering mode for the circle
	this.setMode = function( mode )
	{
		that.mode = mode;
	}

	this.Prepare = function() 
	{
		// Get the canvas set in HTML 
		that.canvas = document.getElementById('circle');
		
		// Call init methods and render
		that.InitGL();
		that.InitData();
		that.InitShaders();
		
		// Clear color buffer
		that.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		that.gl.clear(that.gl.COLOR_BUFFER_BIT);
		
		// Render our stuff
		that.Render();
	}
	/**********************************************************************/
	this.InitGL = function()
    {	
		try 
		{	// Initiliase gl context
			that.gl = that.canvas.getContext('experimental-webgl');
			// Set viewport size according to canvas size
			that.gl.viewportWidth = that.canvas.width;
            that.gl.viewportHeight = that.canvas.height;
			
		}
	    catch(e) 
		{
			console.log('Error',e);return;
		}
		if(!that.gl) 
		{
			console.log('gl is null',e);return;
		}

	}
	/**********************************************************************/
	this.InitData = function()
    {
		// Vertex buffer
		that.vbuffer = that.gl.createBuffer();
		that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.vbuffer);
		
		// Vertex angles
		var cAngle = 360 / that.numVertices
		var cAngles = []
		for (var i = 0; i < 360; i += cAngle)
		{
			cAngles.push(i); 
		}
		
		// Insert the vertex data into the buffer
		that.gl.bufferData(that.gl.ARRAY_BUFFER, 
			new Float32Array(/*vertices*/cAngles), that.gl.STATIC_DRAW);
			
		that.vbuffer.itemSize = 1; 

		// Create an element array buffer where we can store vertex indices
		that.indices = that.gl.createBuffer()

		// Bind the buffer to make it active
		that.gl.bindBuffer(that.gl.ELEMENT_ARRAY_BUFFER, that.indices)

		// Define indices
		var indices = [];
		for (var i = 0; i < that.numVertices; i++)
			indices.push(i);

		// Copy data from indices array to buffer
		that.gl.bufferData(that.gl.ELEMENT_ARRAY_BUFFER,
				new Uint8Array(indices),
				that.gl.STATIC_DRAW)

		that.indices.itemSize = that.gl.UNSIGNED_BYTE; 
		that.indices.numItems = indices.length;   
		
	}
	/**********************************************************************/
	this.InitShaders = function() 
	{
		var vs = that.compileShader("shader-vs");
		var fs = that.compileShader("shader-fs");
		
		// New program object
		that.program = that.gl.createProgram();
		
		// Attach shaders
		that.gl.attachShader(that.program, vs);
		that.gl.attachShader(that.program, fs);
		
		// Link program
		that.gl.linkProgram(that.program);
		
		var ok = that.gl.getProgramParameter( that.program, that.gl.LINK_STATUS);
		if ( !ok )
		{
			console.log('Could not link shaders:' + 
				that.gl.getProgramInfoLog( that.program));
		}
			
		// Use program
		that.gl.useProgram(that.program);
		
		// Get attribute position
		this.vattrib = that.gl.getAttribLocation(that.program, 'aVertPos');
		that.gl.enableVertexAttribArray(this.vattrib);
		
		that.program.vertexAngleAttribute = that.gl.getAttribLocation(that.program, "aVertexAngle");
        // access uniform parameters (matrices)
        that.program.projection = that.gl.getUniformLocation(that.program, "uProjection");
        that.program.modelView = that.gl.getUniformLocation(that.program, "uModelView");
		that.program.radius = that.gl.getUniformLocation(that.program, "uRadius");
		
	}
	/**********************************************************************/
	this.Render = function()
    {	
		that.gl.viewport(0,0, that.gl.viewportWidth, that.gl.viewportHeight);
		// clear screen.
		that.gl.clear(that.gl.COLOR_BUFFER_BIT | that.gl.DEPTH_BUFFER_BIT);
		
		// set camera 
		var aspect_ratio = that.gl.viewportWidth / that.gl.viewportHeight;
		var half_width = 3.0 * aspect_ratio / 2;
		var half_height = 3.0 / 2;
		
		//that.projMat.makeOrthographic(-7.0, 7.0, 7.0, -7.0, -0.1, 2.0);
		that.projMat.makeOrthographic(-half_width, half_width, half_height, -half_height, -0.1, 2.0);
		that.modelViewMat.identity();
		
		that.gl.useProgram( that.program );
		// bind buffer for next operation
		that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.vbuffer);
		
		// bind buffer data to shader attributes
		that.gl.vertexAttribPointer( that.program.vertexPositionAttribute,
						 that.vbuffer.itemSize, 
						 that.gl.FLOAT, false, 0, 0);
			
		// enable vertex attrib array so data gets transferred
		that.gl.enableVertexAttribArray(that.program.vertexPositionAttribute);
		
		that.gl.uniformMatrix4fv(that.program.projection, false, that.projMat.flattenToArray([]))
		that.gl.uniformMatrix4fv(that.program.modelView, false, that.modelViewMat.flattenToArray([]))
	    that.gl.uniform1f(that.program.radius, that.radius)
		
		// tell opengl that we use this index buffer now.
		that.gl.bindBuffer( that.gl.ELEMENT_ARRAY_BUFFER, that.indices);
		
		//render
		//that.gl.drawArrays(that.gl.TRIANGLE_FAN, 0, 360);
		that.gl.drawElements(that.gl[that.mode], that.indices.numItems, that.indices.itemSize, 0);

		//that.gl.flush();
	}
	/**********************************************************************/
	this.compileShader = function( id )
    {
		// Init shaders and program
		// access script element according to id (using jQuery)
		var script = $("#"+id);
		// access text source 
		var src = script.text();
		var shader = null;
		var shader = null;
		
		// determine shader type and create appropriate shader 
		if (script[0].type == "x-shader/x-vertex" )
		{
			shader = that.gl.createShader(that.gl.VERTEX_SHADER);
			
		} 
		else if ( script[0].type == "x-shader/x-fragment" ) 
		{
			shader = that.gl.createShader(that.gl.FRAGMENT_SHADER);
		}
		else 
		{
			console.log('Unknown shader type:');
			return null;
		}
		that.gl.shaderSource(shader, src);
		that.gl.compileShader(shader);
		
		var ok = that.gl.getShaderParameter(shader, that.gl.COMPILE_STATUS);
        if (!ok) {
            console.log('shader failed to compile: ', that.gl.getShaderInfoLog(shader));
            return null;
        }
		
		return shader;
	}
	/**********************************************************************/
}
var app = new WebGLApp();