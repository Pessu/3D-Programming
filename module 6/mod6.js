
 /*************************************************************
  3D Graphics Programming
  Custom particle system example.
  (c) anssi.grohn at karelia.fi 2013
 *************************************************************/

// Parameters
var width = 800,
    height = 600
    viewAngle = 45,
    aspect = width/height,
    near = 0.1,
    far = 1000.0;

var renderer = null;
var scene = null;
var camera = null;

var mouse = {
    down: false,
    prevY: 0,
    prevX: 0
}

var camObject = null;
var keysPressed = [];
var ruins = [];
var skySphere = null;
var shoulderRotationJoint;
var shoulderTiltingJoint;
var upperArm;
var elbowJoint;
var lowerArm;
var wrist;
var hand;
var thumb;
var indexfinger;
var middlefinger;
var pinky;
var customLamberShader;
var fenceShader;
var fps = {
    width: 100,
    height: 50,
    svg: null,
    data: [],
    ticks: 0,
    time: null
}
var spotLight = null;
var spotLightObj = null;
var ambientLight = null;
var smokeParticles = null;
var fireParticles = null;
// for easier conversion
function colorToVec4(color){
    var res = new THREE.Vector4(color.r, color.g, color.b, color.a);
    return res;
}
function colorToVec3(color){
    var res = new THREE.Vector3(color.r, color.g, color.b);
    return res;
}

$(function(){

    // get div element 
    var ctx = $("#main");
    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();
    //renderer.sortObjects = false;

    // create camera
    camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);

    // create scene
    scene = new THREE.Scene();
    camObject = new THREE.Object3D();
    camObject.add(camera);
    spotLightObj = new THREE.Object3D();
    spotLightObj.position.z = 0.1;
    camera.add(spotLightObj);

    // add camera to scene and set its position.
    scene.add(camObject);
    camObject.position.x = 12;
    camObject.position.z = 14;
    camObject.position.y = 1.0;
    // define renderer viewport size
    renderer.setSize(width,height);

    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);

    // directional light for the moon
    var directionalLight = new THREE.DirectionalLight( 0x88aaff, 1.0 ); 
    directionalLight.position.set( 1, 1, -1 ); 

    scene.add( directionalLight );

    // Add ambient light, simulating surround scattering light
    ambientLight = new THREE.AmbientLight(0x282a2f);
    scene.add( ambientLight  );
    

    scene.fog = new THREE.Fog(0x172747, 1.0, 50.0);
    // Add our flashlight
    var distance  = 6.0;
    var intensity = 2.0;
    spotLight = new THREE.SpotLight( 0xffffff, 
				     intensity,
				     distance ); 
    spotLight.castShadow = false; 
    spotLight.position = new THREE.Vector3(0,0,1);
    spotLight.target = spotLightObj;
    spotLight.exponent = 488.1;
    spotLight.angle = 0.21;
    scene.add( spotLight );

    // create cube  material
    var material =
	new THREE.MeshBasicMaterial(
	    {
		color: 0xFFFFFF,
		
	    });
    
    var loader = new THREE.JSONLoader();
    
    var pineTexture = THREE.ImageUtils.loadTexture("pine.png");
    var limeTexture = THREE.ImageUtils.loadTexture("lime.png");
    pineTexture.wrapS = wrapT = THREE.RepeatWrapping;
    limeTexture.wrapS = wrapT = THREE.RepeatWrapping;
    pineTexture.repeat.set(6,1);
    limeTexture.repeat.set(6,1);

    var rockTexture = THREE.ImageUtils.loadTexture("rock.jpg");
    rockTexture.wrapS = THREE.RepeatWrapping;
    rockTexture.wrapT = THREE.RepeatWrapping;
    
    var cloudTexture = THREE.ImageUtils.loadTexture("clouds.png");
    cloudTexture.wrapS = THREE.RepeatWrapping;
    cloudTexture.wrapT = THREE.RepeatWrapping;
    
    customLamberShader = new THREE.ShaderMaterial({
	vertexShader: $("#light-vs").text(),
	fragmentShader: $("#light-fs").text(),
	transparent: false,
	uniforms: { 
	    map: {
		type: 't', 
		value: rockTexture
	    },
	    "dirlight.diffuse": {
		type: 'v4',
		value: colorToVec4(directionalLight.color)
	    },
	    "dirlight.pos": {
		type: 'v3',
		value: directionalLight.position
	    },
	    "dirlight.ambient": {
		type: 'v4',
		value: new THREE.Vector4(0,0,0,1.0) /* ambient value in light */
	    },
	    "dirlight.specular": {
		type: 'v4',
		value: new THREE.Vector4(0,0,0,1) 
	    },
	    "spotlight.diffuse": {
		type: 'v4',
		value: new THREE.Vector4(1,1,0,1)
	    },
	    "spotlight.distance": {
		type: 'f',
		value: distance
	    },
	    "spotlight.pos": {
		type: 'v3',
		value: spotLight.position
	    },
	    "spotlight.exponent": {
		type: 'f',
		value: spotLight.exponent
	    },
	    "spotlight.direction": {
		type: 'v3',
		value: new THREE.Vector3(0,0,-1)
	    },
	    "spotlight.specular": {
		type: 'v4',
		value: new THREE.Vector4(1,1,1,1) 
	    },
	    "spotlight.intensity": {
		type: 'f',
		value: 2.0 
	    },
	    "spotlight.angle": {
		type: 'f',
		value: spotLight.angle
	    },
	    u_ambient: { 
		type: 'v4',
		value: colorToVec4(ambientLight.color) /* global ambient */
	    },
	    fogColor: {
		type: 'v3',
		value: colorToVec3(scene.fog.color)
	    },
	    fogNear:{
		type: 'f',
		value: scene.fog.near
	    },
	    fogFar:{
		type: 'f',
		value: scene.fog.far
	    }
	}
    });

    function handler(geometry, materials) {
	var m = new THREE.Mesh(geometry, customLamberShader);
	m.renderDepth = 2000;
	ruins.push(m);
	checkIsAllLoaded();
    }

    function checkIsAllLoaded(){
	if ( ruins.length == 5 ) {
	    $.each(ruins, function(i,mesh){
		scene.add(mesh);
		// mesh is rotated around 
		mesh.rotation.x = Math.PI/2.0;
	    });
	    // arcs
	    ruins[0].position.z = 13;
	    // corner
	    ruins[1].position.x = 30;
	    // crumbled place
	    ruins[2].position.x = -13;
	    ruins[3].position.z = 30;
	}
    }
    loader.load("meshes/ruins30.js", handler);    
    loader.load("meshes/ruins31.js", handler);
    loader.load("meshes/ruins33.js", handler);
    loader.load("meshes/ruins34.js", handler); 
    loader.load("meshes/ruins35.js", handler);

    function createClouds(geometry)
    {
        skySphere = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({fog: false,  map: cloudTexture
            ,transparent: true, opacity: 0.2, depthWrite: false}));
        skySphere.rotation.y = Math.PI/2.0;
        skySphere.scale.x += 70;
        skySphere.scale.z += 70;
        skySphere.scale.y += 70;
        skySphere.position.y = -30;
        scene.add(skySphere);
    }
    loader.load("meshes/sky.js", createClouds);
    
    var pineMaterial = new THREE.MeshBasicMaterial({
                                        map: pineTexture,
                                        side: THREE.DoubleSide,
                                        depthTest: true,
                                        depthWrite: true,
                                        transparent: true,
                                        alphaTest: 0.1,
                                        //opacity: 0.5,
                                         
                                        blending: THREE.NormalBlending,
                                        //blending: THREE.CustomBlending,
                                        //blendSrc: THREE.SrcAlphaFactor,
                                        //blendDst: THREE.OneMinusSrcAlphaFactor,
                                        //blendEquation: THREE.AddEquation

                                     });
    var limeMaterial = new THREE.MeshBasicMaterial({
                                        map: limeTexture,
                                        side: THREE.DoubleSide,
                                        depthTest: true,
                                        depthWrite: true,
                                        transparent: true,
                                        alphaTest: 0.1,
                                        //opacity: 0.5,
                                        
                                        blending: THREE.NormalBlending,
                                        //blending: THREE.CustomBlending,                            
                                        //endSrc: THREE.SrcAlphaFactor,
                                        //blendDst: THREE.OneMinusSrcAlphaFactor,
                                        //blendEquation: THREE.AddEquation
                                        
                                        });

    var pinePlane = new THREE.Mesh(new THREE.PlaneGeometry(20,4),pineMaterial);
    pinePlane.position.set( 14, 2, -3 );
    scene.add( pinePlane );
    
    var limePlane = new THREE.Mesh(new THREE.PlaneGeometry(20,4),limeMaterial);
    limePlane.position.set( 14, 2, -3 );
    limePlane.rotation.y = Math.PI/2;
    scene.add( limePlane );
    
    /*
    var x = 3;
    for (var i = 0; i < 7; i++)
    {
    var pines = new THREE.Mesh(new THREE.PlaneGeometry(3,4),pineMaterial);
    var limes = new THREE.Mesh(new THREE.PlaneGeometry(3,4),limeMaterial);
    x += 2.7;
    pines.position.set( x, 2, -3 );
    limes.position.set( x, 2, -4 );
    scene.add( pines );
    scene.add( limes );
    }
    */


    
    var skyboxMaterials = [];
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_west.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_east.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_up.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_down.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_north.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_south.png")}));
    $.each(skyboxMaterials, function(i,d){
	d.side = THREE.BackSide;
	d.depthWrite = false;

    });
    var sbmfm = new THREE.MeshFaceMaterial(skyboxMaterials);
    sbmfm.depthWrite = false;
    // Create a new mesh with cube geometry 
    var skybox = new THREE.Mesh(
	new THREE.CubeGeometry( 10,10,10,1,1,1 ), 
	sbmfm
    );

    skybox.position = camObject.position;
    skybox.renderDepth = 0;
    scene.add(skybox);
    
    var textureRusted = THREE.ImageUtils.loadTexture("fence_rusted.png");
    textureRusted.wrapS = THREE.RepeatWrapping;
    textureRusted.wrapT = THREE.RepeatWrapping;
    var textureAlpha = THREE.ImageUtils.loadTexture("fence_alpha.png");
    textureAlpha.wrapS = THREE.RepeatWrapping;
    textureAlpha.wrapT = THREE.RepeatWrapping;
    
    fenceShader = new THREE.ShaderMaterial({
	

	vertexShader: $("#light-vs").text(),
	fragmentShader: $("#fence-fs").text(),
	transparent: false,
	blending: THREE.NoBlending,
	uniforms: { 
	    map: {
		type: 't', 
		value: textureRusted
	    },
	    alphamap: {
		type: 't', 
		value: textureAlpha
	    },
	    
	    "dirlight.diffuse": {
		type: 'v4',
		value: colorToVec4(directionalLight.color)
	    },
	    "dirlight.pos": {
		type: 'v3',
		value: directionalLight.position
	    },
	    "dirlight.ambient": {
		type: 'v4',
		value: new THREE.Vector4(0,0,0,1.0) /* ambient value in light */
	    },
	    "dirlight.specular": {
		type: 'v4',
		value: new THREE.Vector4(0,0,0,1) 
	    },
	    "spotlight.diffuse": {
		type: 'v4',
		value: new THREE.Vector4(1,1,0,1)
	    },
	    "spotlight.distance": {
		type: 'f',
		value: distance
	    },
	    "spotlight.pos": {
		type: 'v3',
		value: spotLight.position
	    },
	    "spotlight.exponent": {
		type: 'f',
		value: spotLight.exponent
	    },
	    "spotlight.direction": {
		type: 'v3',
		value: new THREE.Vector3(0,0,-1)
	    },
	    "spotlight.specular": {
		type: 'v4',
		value: new THREE.Vector4(1,1,1,1) 
	    },
	    "spotlight.intensity": {
		type: 'f',
		value: 2.0 
	    },
	    "spotlight.angle": {
		type: 'f',
		value: spotLight.angle
	    },
	    u_ambient: { 
		type: 'v4',
		value: colorToVec4(ambientLight.color) /* global ambient */
	    },
	    fogColor: {
		type: 'v3',
		value: colorToVec3(scene.fog.color)
	    },
	    fogNear:{
		type: 'f',
		value: scene.fog.near
	    },
	    fogFar:{
		type: 'f',
		value: scene.fog.far
	    }
	}
    });


    var fence = new THREE.Mesh( new THREE.CubeGeometry(4,4,0.01), 
				fenceShader);
    scene.add(fence);
    fence.position.x = 12.5;
    fence.position.z = -2;
    $.each(fence.geometry.faceVertexUvs[0], function(i,d){
	d[0] = new THREE.Vector2(0,10);
	d[2] = new THREE.Vector2(10,0);
	d[3] = new THREE.Vector2(10,10);    
    });
    var fence2 = fence.clone();
    fence2.position.z = 2;
    fence2.position.x = 12.5;
    scene.add(fence2);
    
    var fence3 = fence.clone();
    fence3.position.x = 10.5;
    fence3.position.z = 0.0;
    fence3.rotation.y = Math.PI/2;
    scene.add(fence3);

    var fence4 = fence.clone();
    fence4.position.x = 14.5;
    fence4.position.z = 0.0;
    fence4.rotation.y = Math.PI/2;
    scene.add(fence4);

    // Construct a mesh object
    var ground = new THREE.Mesh( new THREE.CubeGeometry(100,0.2,100,1,1,1), customLamberShader
				 /*new THREE.MeshPhongMaterial({
				     map: rockTexture,
				     transparent: true
				 })*/);

    
    // Do a little magic with vertex coordinates so ground looks more interesting
    $.each(ground.geometry.faceVertexUvs[0], function(i,d){

	d[0] = new THREE.Vector2(0,25);
	//d[1] = new THREE.Vector2(0,0);
	d[2] = new THREE.Vector2(25,0);
	d[3] = new THREE.Vector2(25,25);
    });
    ground.renderDepth = 2001;
    
    scene.add(ground);
    
    // FIRE
    fireParticles = new CustomParticleSystem( {
	maxParticles: 40,
	energyDecrement: 0.3,
	throughPutFactor: 0.2,
	material: new THREE.ParticleBasicMaterial({
	    color: 0xE0E0E0,
	    size: 1,
	    map: THREE.ImageUtils.loadTexture("fire.png"),
	    transparent: true,
	    blending: THREE.CustomBlending,
	    blendEquation: THREE.AddEquation,
	    blendSrc: THREE.SrcAlphaFactor,
	    blendDst: THREE.OneFactor,
	    depthWrite: false
	}),
	onParticleInit: function(particle){
	    // original birth position of particle.
	    particle.set(0,0,0);
	    // particle moves up
	    particle.velocity = new THREE.Vector3(Math.random(),Math.random(),Math.random());
	    // particle life force
	    particle.energy = 0.4;
	},
	onParticleUpdate: function(particle,delta){
	    // Add velocity per passed time in seconds
	    particle.add(particle.velocity.clone().multiplyScalar(delta/2));
	    // reduce particle energy
	    particle.energy -= (fireParticles.options.energyDecrement * delta); 
	}
    });
    scene.add(fireParticles.ps);
    
    // SMOKE
    smokeParticles = new CustomParticleSystem( {
	maxParticles: 65,
	energyDecrement: 0.3,
	throughPutFactor: 0.03,
	material: new THREE.ParticleBasicMaterial({
	    color: 0xE0E0E0,
	    size: 2,
	    map: THREE.ImageUtils.loadTexture("smoke.png"),
	    transparent: true,
            opacity: 0.2,
	    blending: THREE.CustomBlending,
	    blendEquation: THREE.AddEquation,
	    blendSrc: THREE.SrcAlphaFactor,
	    blendDst: THREE.OneFactor,
	    depthWrite: false
	}),
	onParticleInit: function(particle){
	    // original birth position of particle.
	    particle.set(0,0.2,0);
	    // particle moves up
	    particle.velocity = new THREE.Vector3((Math.random()*-1)+1,1,Math.random());
	    // particle life force
	    particle.energy = 3;
	},
	onParticleUpdate: function(particle,delta){
	    // Add velocity per passed time in seconds
	    particle.add(particle.velocity.clone().multiplyScalar(delta/2));
	    // reduce particle energy
	    particle.energy -= (smokeParticles.options.energyDecrement * delta);

	}
    });
    scene.add(smokeParticles.ps);
    
    fps.time = new Date();
    // request frame update and call update-function once it comes
    requestAnimationFrame(update);

    ////////////////////
    // Setup simple input handling with mouse
    document.onmousedown = function(ev){
	mouse.down = true;
	mouse.prevY = ev.pageY;
	mouse.prevX = ev.pageX;
    }

    document.onmouseup = function(ev){
	mouse.down = false;
    }

    document.onmousemove = function(ev){
	if ( mouse.down ) {

	    var rot = (ev.pageY - mouse.prevY) * 0.01;
	    var rotY = (ev.pageX - mouse.prevX) * 0.01;

	    camObject.rotation.y -= rotY;
	    camera.rotation.x -= rot;

	    mouse.prevY = ev.pageY;
	    mouse.prevX = ev.pageX;
	}
    }
    ////////////////////
    // setup input handling with keypresses
    document.onkeydown = function(event) {
	keysPressed[event.keyCode] = true;
    }
    
    document.onkeyup = function(event) {
	keysPressed[event.keyCode] = false;
    }
    
    
    // querying supported extensions
    var gl = renderer.context;
    var supported = gl.getSupportedExtensions();

    console.log("**** Supported extensions ***'");
    $.each(supported, function(i,d){
	console.log(d);
    });


});

var angle = 0.0;
var movement = 0.0;
var moving = false;
function update(){

    // render everything 
    renderer.setClearColorHex(0x000000, 1.0);
    renderer.clear(true);
    renderer.render(scene, camera); 
    angle += 0.001;
    moving = false;
    if ( keysPressed["W".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
	moving = true;
    }
    
    if (skySphere != null)
        {skySphere.rotation.y += 0.0005;}

    if ( keysPressed["S".charCodeAt(0)] == true ){

	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
	moving = true;

    }
    if ( keysPressed["A".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(-1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
	moving = true;
    }

    if ( keysPressed["D".charCodeAt(0)] == true ){

	var dir = new THREE.Vector3(-1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
	moving = true;
    }
    
    if ( keysPressed["P".charCodeAt(0)] == true ){
	custParticleSystem.init(1);
    }
    
    if ( keysPressed["Q".charCodeAt(0)] == true ){

	shoulderRotationJoint.rotation.y += 0.1;

    }
    if ( keysPressed["E".charCodeAt(0)] == true ){

	shoulderRotationJoint.rotation.y -= 0.1;

    }
    // so strafing and moving back-fourth does not double the bounce
    if ( moving ) {
	movement+=0.1;
	camObject.position.y = Math.sin(movement*2.30)*0.07+1.2; 
    }
    spotLight.position = camObject.position;
    customLamberShader.uniforms["spotlight.pos"].value = camObject.position;
    fenceShader.uniforms["spotlight.pos"].value = camObject.position;
    
    var dir = new THREE.Vector3(0,0,-1);
    var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);

    spotLight.target.position = dirW;
    if ( shoulderRotationJoint ){
	elbowJoint.rotation.z = Math.sin(12*angle);
	shoulderTiltingJoint.rotation.z = Math.cos(12*angle);
	wrist.rotation.x = Math.sin(25*angle);
    }

    if ( fireParticles != null && smokeParticles != null){
	fireParticles.update();
        smokeParticles.update();
    }


    // request another frame update
    requestAnimationFrame(update);
    
    fps.ticks++;
    var tmp = new Date();
    var diff = tmp.getTime()-fps.time.getTime();
    
}
  
    function createArm(){
    shoulderRotationJoint = new THREE.Object3D();
    shoulderRotationJoint.position.y = 0.5;
    shoulderTiltingJoint = new THREE.Mesh( 
	new THREE.SphereGeometry(0.2,10,10), 
	new THREE.MeshLambertMaterial({ color: 0xFF0000, transparent: false})
    );
    upperArm  = new THREE.Mesh( new THREE.CubeGeometry(0.125,0.5,0.125),
				new THREE.MeshLambertMaterial({ color: 0x00FF00, transparent: true}));
    upperArm.position.y = 0.45;
    elbowJoint = new THREE.Mesh( 
	new THREE.SphereGeometry(0.12,10,10), 
	new THREE.MeshLambertMaterial({ color: 0xFF00FF, transparent: false})
    );
    lowerArm = new THREE.Mesh( new THREE.CubeGeometry(0.125,0.5,0.125),
				new THREE.MeshLambertMaterial({ color: 0xFFFF00, transparent: false}));
    

    wrist = new THREE.Object3D();
    hand = new THREE.Mesh( new THREE.CubeGeometry(0.25,0.25,0.25),
			   new THREE.MeshLambertMaterial({ color: 0x0000FF, transparent: false}));
    shoulderRotationJoint.add(shoulderTiltingJoint);
    shoulderTiltingJoint.add(upperArm);
    
    scene.add(shoulderRotationJoint);
    shoulderRotationJoint.add(shoulderTiltingJoint);
    shoulderTiltingJoint.add(upperArm);
    upperArm.add(elbowJoint);
    elbowJoint.position.y = 0.25;
    elbowJoint.add(lowerArm);
    lowerArm.position.y = 0.25;
    lowerArm.add(wrist);
    wrist.position.y = 0.25;
    wrist.add(hand);
    hand.position.y = 0.05;
    thumb =  new THREE.Mesh( new THREE.CubeGeometry(0.05,0.25,0.05),
			     new THREE.MeshLambertMaterial({ color: 0xFFAAAA, transparent: false}));
    hand.add(thumb);
    thumb.position.x = 0.2;
    thumb.rotation.z = 2.0;


    indexfinger =  new THREE.Mesh( new THREE.CubeGeometry(0.05,0.25,0.05),
				   new THREE.MeshLambertMaterial({ color: 0xFFAAAA, transparent: false}));
    hand.add(indexfinger);
    indexfinger.position.x = 0.10;
    indexfinger.position.y = 0.2;
    
    
    middlefinger =  new THREE.Mesh( new THREE.CubeGeometry(0.05,0.25,0.05),
				    new THREE.MeshLambertMaterial({ color: 0xFFAAAA, transparent: false}));
    hand.add(middlefinger);
    middlefinger.position.x = 0.0;
    middlefinger.position.y = 0.2;
    
    pinky =  new THREE.Mesh( new THREE.CubeGeometry(0.05,0.25,0.05),
				    new THREE.MeshLambertMaterial({ color: 0xFFAAAA, transparent: false}));
    hand.add(pinky);
    pinky.position.x = -0.1;
    pinky.position.y = 0.2;
    }

var CustomParticleSystem = function( options )
{
    var that = this;
    
    this.prevTime = new Date();
    this.particles = new THREE.Geometry();
    this.options = options;

    this.numAlive = 0;
    this.throughPut = 3.0;
    this.throughPutFactor = 0.0;
    if ( options.throughPutFactor !== undefined ){
	this.throughPutFactor = options.throughPutFactor;
    }

    // add max amount of particles (vertices) to geometry
    for( var i=0;i<this.options.maxParticles;i++){
	this.particles.vertices.push ( new THREE.Vector3());
    }
    
    this.ps = new THREE.ParticleSystem(this.particles, 
				       this.options.material);
    this.ps.renderDepth = 0;
    this.ps.sortParticles = false;
    this.ps.geometry.__webglParticleCount = 0;

    this.getNumParticlesAlive = function(){
	return this.numAlive;
    }
    this.setNumParticlesAlive = function(particleCount){
	this.numAlive = particleCount;
    }
    this.getMaxParticleCount = function(){
	return this.ps.geometry.vertices.length;
    }

    this.removeDeadParticles = function(){

	var endPoint = this.getNumParticlesAlive();
	for(var p=0;p<endPoint;p++){
	    var particle = this.ps.geometry.vertices[p];
	    //console.log("remove dead particles", particle.energy);
	    if ( particle.energy <= 0.0 ){
		// remove from array
		var tmp = this.ps.geometry.vertices.splice(p,1);
		// append to end of array
		this.ps.geometry.vertices.push(tmp[0]);
		// vertices have shifted, no need to as far anymore
		endPoint--;
		// decrease alive count by one
		this.setNumParticlesAlive( this.getNumParticlesAlive()-1);
		
	    }
	}
    }

    this.init = function( particleCount ){
	var previouslyAlive = this.getNumParticlesAlive();
	var newTotal = particleCount + previouslyAlive;
	newTotal = (newTotal > this.getMaxParticleCount()) ? 
	    this.getMaxParticleCount() : newTotal;
	
	this.setNumParticlesAlive(newTotal);
	// initialize every particle
	for(var p=previouslyAlive;p<newTotal;p++){
	    this.options.onParticleInit( this.ps.geometry.vertices[p]);
	}
	this.ps.geometry.verticesNeedUpdate = true;
	
    }
    
    this.update = function(){

	var now = new Date();
	var delta = (now.getTime() - that.prevTime.getTime())/1000.0;
	
	// a quick hack to get things working.
	this.ps.geometry.__webglParticleCount = this.getNumParticlesAlive();
	
	// seek and destroy dead ones
	this.removeDeadParticles();

	var endPoint = this.getNumParticlesAlive();
	for( var p=0;p<endPoint;p++){
	    var particle = this.ps.geometry.vertices[p];
	    if ( particle !== undefined ){
		this.options.onParticleUpdate(particle, delta);
	    }
	}
	// Add new particles according to throughput factor
	that.throughPut += (that.throughPutFactor * delta*200);
	var howManyToCreate  = Math.floor( that.throughPut );
	if ( howManyToCreate > 1 ){
	    that.throughPut -= howManyToCreate;
	    that.init( howManyToCreate );
	}
	// Changes in position need to be reflected to VBO
	this.ps.geometry.verticesNeedUpdate = true;
        
	that.prevTime = now;
    }
}
