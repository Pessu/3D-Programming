var WebGLApp = function()
{
    // Globals
    var that = this;
    this.gl = null;

    this.xRot = 0;
    this.yRot = 0;
    this.zRot = 0;
    
    this.lastTime = 0;
    
    this.cubeVertexPositionBuffer = null;
    this.cubeVertexTextureCoordBuffer = null;
    this.cubeVertexIndexBuffer = null;

    this.mvMatrix = mat4.create();
    this.mvMatrixStack = [];
    this.pMatrix = mat4.create();

    this.shaderProgram = null;

    this.Update = function()
    {
        requestAnimFrame(that.Update);
        that.Render();
        that.animate();
    }

    this.Prepare = function()
    {
        // Get the canvas set in HTML 
        that.canvas = document.getElementById('skybox');

        // Call init methods
        that.InitGL();
        that.InitShaders();
        that.InitBuffers();
        that.InitTextures('posx.jpg',that.textureArray);
        that.InitTextures('negx.jpg',that.textureArray);
        that.InitTextures('posy.jpg',that.textureArray);
        that.InitTextures('negy.jpg',that.textureArray);
        that.InitTextures('negz.jpg',that.textureArray);
        that.InitTextures('posz.jpg',that.textureArray);

        // Clear color buffer
        that.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        that.gl.clear(that.gl.COLOR_BUFFER_BIT);

        // Render our stuff
        that.Update();
    }

    /**********************************************************************/
    this.InitGL = function()
    {
        try
        {
            that.gl = that.canvas.getContext('experimental-webgl');
            that.gl.viewportWidth = that.canvas.width;
            that.gl.viewportHeight = that.canvas.height;
        }
        catch (e)
        {
            console.log('Error initializing gl context', e); return;
        }
        if (!that.gl)
        {
            console.log('Error, gl is null', e); return;
        }

    }
    /**********************************************************************/
    this.InitShaders = function()
    {
        var fragmentShader = this.getShader("shader-fs");
        var vertexShader = this.getShader("shader-vs");

        that.shaderProgram = that.gl.createProgram();
        that.gl.attachShader(that.shaderProgram, vertexShader);
        that.gl.attachShader(that.shaderProgram, fragmentShader);
        that.gl.linkProgram(that.shaderProgram);

        if (!that.gl.getProgramParameter(that.shaderProgram, that.gl.LINK_STATUS)) 
        {
            alert("Could not initialise shaders");
        }

        that.gl.useProgram(that.shaderProgram);

        that.shaderProgram.vertexPositionAttribute = that.gl.getAttribLocation(that.shaderProgram, "aVertexPosition");
        that.gl.enableVertexAttribArray(that.shaderProgram.vertexPositionAttribute);

        that.shaderProgram.textureCoordAttribute = that.gl.getAttribLocation(that.shaderProgram, "aTextureCoord");
        that.gl.enableVertexAttribArray(that.shaderProgram.textureCoordAttribute);

        that.shaderProgram.pMatrixUniform = that.gl.getUniformLocation(that.shaderProgram, "uPMatrix");
        that.shaderProgram.mvMatrixUniform = that.gl.getUniformLocation(that.shaderProgram, "uMVMatrix");
        that.shaderProgram.samplerUniform = that.gl.getUniformLocation(that.shaderProgram, "uSampler");

    }
    /**********************************************************************/
    this.InitBuffers = function()
    {   
        that.cubeVertexPositionBuffer = that.gl.createBuffer();
        that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.cubeVertexPositionBuffer);
        vertices = [
            // Front face
            -2.0, -2.0, 2.0,
            2.0, -2.0, 2.0,
            2.0, 2.0, 2.0,
            -2.0, 2.0, 2.0,
            // Back face
            -2.0, -2.0, -2.0,
            -2.0, 2.0, -2.0,
            2.0, 2.0, -2.0,
            2.0, -2.0, -2.0,
            // Top face
            -2.0, 2.0, -2.0,
            -2.0, 2.0, 2.0,
            2.0, 2.0, 2.0,
            2.0, 2.0, -2.0,
            // Bottom face
            -2.0, -2.0, -2.0,
            2.0, -2.0, -2.0,
            2.0, -2.0, 2.0,
            -2.0, -2.0, 2.0,
            // Right face
            2.0, -2.0, -2.0,
            2.0, 2.0, -2.0,
            2.0, 2.0, 2.0,
            2.0, -2.0, 2.0,
            // Left face
            -2.0, -2.0, -2.0,
            -2.0, -2.0, 2.0,
            -2.0, 2.0, 2.0,
            -2.0, 2.0, -2.0,
        ];
        that.gl.bufferData(that.gl.ARRAY_BUFFER, new Float32Array(vertices), that.gl.STATIC_DRAW);
        that.cubeVertexPositionBuffer.itemSize = 3;
        that.cubeVertexPositionBuffer.numItems = 24;

        that.cubeVertexTextureCoordBuffer = that.gl.createBuffer();
        that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.cubeVertexTextureCoordBuffer);
        var textureCoords = [
            // Front face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            // Back face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            // Top face
            1.0, 1.0, //0.0, 1.0
            0.0, 1.0, //0.0, 0.0
            0.0, 0.0, //1.0, 0.0
            1.0, 0.0, //1.0, 1.0
            // Bottom face
            1.0, 0.0, //1.0, 1.0
            1.0, 1.0, //0.0, 1.0
            0.0, 1.0, //0.0, 0.0
            0.0, 0.0, //1.0, 0.0
            // Right face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            // Left face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ];
        that.gl.bufferData(that.gl.ARRAY_BUFFER, new Float32Array(textureCoords), that.gl.STATIC_DRAW);
        that.cubeVertexTextureCoordBuffer.itemSize = 2;
        that.cubeVertexTextureCoordBuffer.numItems = 24;

        that.cubeVertexIndexBuffer = that.gl.createBuffer();
        that.gl.bindBuffer(that.gl.ELEMENT_ARRAY_BUFFER, that.cubeVertexIndexBuffer);
        var cubeVertexIndices = 
        [
            0, 1, 2, 0, 2, 3, // Front face
            4, 5, 6, 4, 6, 7, // Back face
            8, 9, 10, 8, 10, 11, // Top face
            12, 13, 14, 12, 14, 15, // Bottom face
            16, 17, 18, 16, 18, 19, // Right face
            20, 21, 22, 20, 22, 23  // Left face
        ];
        that.gl.bufferData(that.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), that.gl.STATIC_DRAW);
        that.cubeVertexIndexBuffer.itemSize = 1;
        that.cubeVertexIndexBuffer.numItems = 36;
    }
    /**********************************************************************/
    this.Render = function()
    {
        that.gl.viewport(0, 0, that.gl.viewportWidth, that.gl.viewportHeight);
        that.gl.clear(that.gl.COLOR_BUFFER_BIT | that.gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, that.gl.viewportWidth / that.gl.viewportHeight, 3.0, 100.0, that.pMatrix);

        mat4.identity(that.mvMatrix);

        mat4.translate(that.mvMatrix, [0.0, 0.0, -5.0]);

        mat4.rotate(that.mvMatrix, this.degToRad(that.xRot), [0, 1, 0]);
        //mat4.rotate(that.mvMatrix, this.degToRad(that.yRot), [0, 0, 0]);
        //mat4.rotate(that.mvMatrix, this.degToRad(that.zRot), [0, 0, 0]);
        
        this.setMatrixUniforms();
        
        that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.cubeVertexPositionBuffer);
        that.gl.vertexAttribPointer(that.shaderProgram.vertexPositionAttribute, that.cubeVertexPositionBuffer.itemSize, that.gl.FLOAT, false, 0, 0);

        that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.cubeVertexTextureCoordBuffer);
        that.gl.vertexAttribPointer(that.shaderProgram.textureCoordAttribute, that.cubeVertexTextureCoordBuffer.itemSize, that.gl.FLOAT, false, 0, 0);
        
        that.gl.bindBuffer(that.gl.ELEMENT_ARRAY_BUFFER, that.cubeVertexIndexBuffer);
       
        that.gl.bindTexture(that.gl.TEXTURE_2D, /*that.Texture*/that.textureArray[0]);
        that.gl.drawElements(that.gl.TRIANGLES, 6, that.gl.UNSIGNED_SHORT, 0);
        
        that.gl.bindTexture(that.gl.TEXTURE_2D, /*that.Texture*/that.textureArray[1]);
        that.gl.drawElements(that.gl.TRIANGLES, 6, that.gl.UNSIGNED_SHORT, 12);
        
        that.gl.bindTexture(that.gl.TEXTURE_2D, /*that.Texture*/that.textureArray[2]);
        that.gl.drawElements(that.gl.TRIANGLES, 6, that.gl.UNSIGNED_SHORT, 24);
        
        that.gl.bindTexture(that.gl.TEXTURE_2D, /*that.Texture*/that.textureArray[3]);
        that.gl.drawElements(that.gl.TRIANGLES, 6, that.gl.UNSIGNED_SHORT, 36);
        
        that.gl.bindTexture(that.gl.TEXTURE_2D, /*that.Texture*/that.textureArray[4]);
        that.gl.drawElements(that.gl.TRIANGLES, 6, that.gl.UNSIGNED_SHORT, 48);
        
        that.gl.bindTexture(that.gl.TEXTURE_2D, /*that.Texture*/that.textureArray[5]);
        that.gl.drawElements(that.gl.TRIANGLES, 6, that.gl.UNSIGNED_SHORT, 60);  
    }
    /**********************************************************************/
    this.getShader = function(id)
    {
        var shaderScript, theSource, currentChild, shader;

        shaderScript = document.getElementById(id);

        if (!shaderScript)
        {
            return null;
        }

        theSource = "";
        currentChild = shaderScript.firstChild;

        while (currentChild)
        {
            if (currentChild.nodeType == currentChild.TEXT_NODE) {
                theSource += currentChild.textContent;
            }
            currentChild = currentChild.nextSibling;
        }

        if (shaderScript.type == "x-shader/x-fragment")
        {
            shader = that.gl.createShader(that.gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex")
        {
            shader = that.gl.createShader(that.gl.VERTEX_SHADER);
        } else
        {
            return null;
        }

        that.gl.shaderSource(shader, theSource);

        // Compile the shader program
        that.gl.compileShader(shader);

        // See if it compiled successfully
        if (!that.gl.getShaderParameter(shader, that.gl.COMPILE_STATUS))
        {
            alert("An error occurred compiling the shaders: " + that.gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }
    /**********************************************************************/
    this.animate = function()
    {
        var timeNow = new Date().getTime();
        if (that.lastTime != 0) {
            var elapsed = timeNow - that.lastTime;

            that.xRot += (90 * elapsed) / 1000.0;
            that.yRot += (90 * elapsed) / 1000.0;
            that.zRot += (90 * elapsed) / 1000.0;
        }
        that.lastTime = timeNow;
    }
    /**********************************************************************/
    this.textureArray = new Array();
    this.InitTextures = function(filename, arr)
    {
        var count = arr.length;
        
        arr[count] = that.gl.createTexture();
        arr[count].image = new Image();
       
        arr[count].image.onload = function() 
        {
            try
            {
                that.handleLoadedTexture(arr,count,filename)
            } 
            catch(e)
            {
                console.log('Error loading texture',e);
            }
        }

        arr[count].image.src = filename;
    }
    /**********************************************************************/
    this.handleLoadedTexture = function(arr,count,filename)
    {
        that.gl.bindTexture(that.gl.TEXTURE_2D,  arr[count]);
        that.gl.pixelStorei(that.gl.UNPACK_FLIP_Y_WEBGL, true);
        that.gl.texImage2D(that.gl.TEXTURE_2D, 0, that.gl.RGBA, that.gl.RGBA, that.gl.UNSIGNED_BYTE,  arr[count].image);
        //that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_MAG_FILTER, that.gl.NEAREST);
        //that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_MIN_FILTER, that.gl.NEAREST);
        that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_S, that.gl.CLAMP_TO_EDGE);
        that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_T, that.gl.CLAMP_TO_EDGE);
        that.gl.generateMipmap(that.gl.TEXTURE_2D);
        that.gl.bindTexture(that.gl.TEXTURE_2D, null);
    }
    /**********************************************************************/
    this.mvPushMatrix = function()
    {
        var copy = mat4.create();
        mat4.set(that.mvMatrix, copy);
        that.mvMatrixStack.push(copy);
    }
    /**********************************************************************/
    this.mvPopMatrix = function()
    {
        if (that.mvMatrixStack.length == 0) 
        {
            throw "Invalid popMatrix!";
        }
        that.mvMatrix = that.mvMatrixStack.pop();
    }
    /**********************************************************************/
    this.setMatrixUniforms = function()
    {
        that.gl.uniformMatrix4fv(that.shaderProgram.pMatrixUniform, false, that.pMatrix);
        that.gl.uniformMatrix4fv(that.shaderProgram.mvMatrixUniform, false, that.mvMatrix);
    }
    /**********************************************************************/
    this.degToRad = function(degrees)
    {
        return degrees * Math.PI / 480;
    }
    /**********************************************************************/
}
var app = new WebGLApp();