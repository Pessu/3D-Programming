var renderer = null;
var scene = null;
var camera = null;

var width = 800,
    height = 600,
    viewAngle = 45,
    aspect = width / height,
    near = 0.1,
    far = 1000.0;
    
var ruins = [];
var fingers = [];

var shoulder;
var elbow;
var hand;

var mouse = 
{
    down: false,
    prevY: 0,
    prevX: 0
}

var camObject = null;
var keysPressed = [];

$(function()
{
    var canvas = $("#main");
    renderer = new THREE.WebGLRenderer();

    camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
    camObject = new THREE.Object3D();
    
    scene = new THREE.Scene();
    
    camObject.add(camera);

    scene.add(camObject);
    camObject.position.z = 5;
    camObject.position.y = 1.0;

    renderer.setSize(width, height);

    canvas.append(renderer.domElement);

    // Our texture for the ground
    var groundTexture = THREE.ImageUtils.loadTexture("rock3.jpg");

    // Wrap ground texture
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;

    // Ground Texture
    var ground = new THREE.Mesh(new THREE.CubeGeometry(100, 0.2, 100, 1, 1, 1),
            new THREE.MeshBasicMaterial
            ({
                map: groundTexture,
                transparent: true
            }));
    
    // Texture tiling
    $.each(ground.geometry.faceVertexUvs[0],function(i,d){
       d[0] = new THREE.Vector2(0,50); 
       d[2] = new THREE.Vector2(50,0);
       d[3] = new THREE.Vector2(50,50); 
    });
    
    scene.add(ground);
    
    // mesh loading handling
    var loader = new THREE.JSONLoader();
    function handler (geometry, materials)
    {
        ruins.push(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial
        ({
            map: groundTexture,
            transparent: true
        })));
        checkIsAllLoaded();
    }
    
    // Set ruin rotations and locations
    function checkIsAllLoaded()
    {
        if (ruins.length == 5)
        {
            $.each(ruins, function(i,mesh)
            {
                 mesh.rotation.x = Math.PI/2;
                 scene.add(mesh);
            });
            // arcs
            ruins[0].position.z = 13;
            // corner
            ruins[1].position.x = 13;
            // crumbled
            ruins[2].position.x = -13;
            // crumbled
            ruins[3].position.z = -13;
        }
    }
    
    // Load meshes from files
    loader.load("meshes/ruins30.js",handler);
    loader.load("meshes/ruins31.js",handler);
    //loader.load("meshes/ruins32.js",handler);
    loader.load("meshes/ruins33.js",handler);
    loader.load("meshes/ruins34.js",handler);
    loader.load("meshes/ruins35.js",handler);
    
    // Lights!
    var ambientLight = new THREE.AmbientLight(0x000044);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);
    
    // Shoulder sphere parent
    shoulder = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), new THREE.MeshLambertMaterial( { color: 0xFF0033}));
    shoulder.scale.set(1/4,1/4,1/4,1/4);
    shoulder.position.y = 1/1.5;
    shoulder.position.z = 1;
    scene.add(shoulder);
     
    // upper arm rube
    var upperArm = new THREE.Mesh(new THREE.CubeGeometry(0.5, 2, .5), new THREE.MeshLambertMaterial( { color: 0x99CC00}));
    upperArm.overdraw = true; 
    shoulder.add(upperArm)
    upperArm.position.y = 1.9;
    
    // elbow sphere
    elbow = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8),new THREE.MeshLambertMaterial( { color: 0x99FFFF}));
    elbow.overdraw = true; 
    upperArm.add(elbow);
    elbow.scale.set(1/2,1/2,1/2,1/2);
    elbow.position.y = 1.4;
    
    // lower arm cube
    var lowerArm = new THREE.Mesh(new THREE.CubeGeometry(1, 5, 1), new THREE.MeshLambertMaterial( { color: 0x0033FF}));
    lowerArm.overdraw = true; 
    elbow.add(lowerArm);
    lowerArm.position.y = 3;
    
    // hand cube
    hand = new THREE.Mesh(new THREE.CubeGeometry(1.5, 1.5, 1), new THREE.MeshLambertMaterial( { color: 0x66FFCC}));
    hand.overdraw = true; 
    lowerArm.add(hand);
    hand.position.y = 3.4;
    
    // fingers cube (thumb + three others)
    var thumb = new THREE.Mesh(new THREE.CubeGeometry(1.5, .3, .3), new THREE.MeshLambertMaterial( { color: 0xFF0033}));
    thumb.overdraw = true;
    thumb.position.x = 1;
    thumb.position.y = -.5;
    hand.add(thumb);
    
    fingers.push(new THREE.Mesh(new THREE.CubeGeometry(.3, 1.5, .3), new THREE.MeshNormalMaterial()));
    fingers.push(new THREE.Mesh(new THREE.CubeGeometry(.3, 1.5, .3), new THREE.MeshNormalMaterial()));
    fingers.push(new THREE.Mesh(new THREE.CubeGeometry(.3, 1.5, .3), new THREE.MeshNormalMaterial()));

    fingers[0].position.x = -.6;
    fingers[2].position.x = .6;
    
    for (var i = 0; i < fingers.length; i++)
    {
         fingers[i].overdraw = true;
         hand.add(fingers[i]);
         fingers[i].position.y = 1.6;
    }
    
    // Update call
    requestAnimationFrame(update);

    document.onmousedown = function(ev) 
    {
        mouse.down = true;
        mouse.prevY = ev.pageY;
        mouse.prevX = ev.pageX;
    }

    document.onmouseup = function(ev) 
    {
        mouse.down = false;
    }
    
    document.onmousemove = function(ev)
    {
        if (mouse.down) 
        {
            var rot = (ev.pageY - mouse.prevY) * 0.01;
            var rotY = (ev.pageX - mouse.prevX) * 0.01;
            
            camObject.rotation.y -= rotY;
            camera.rotation.x -= rot;
            mouse.prevY = ev.pageY;
            mouse.prevX = ev.pageX;
        }
    }

    document.onkeydown = function(event) 
    {
        keysPressed[event.keyCode] = true;
    }
    
    document.onkeyup = function(event) 
    {
        keysPressed[event.keyCode] = false;
    }
    
});

// Makes stuff happen!!!
function animate(t)
{
   shoulder.rotation.z =+ Math.sin(t/360)*.5;
   elbow.rotation.z =+ Math.sin(t/360)*.5;
   hand.rotation.x =+ Math.sin(t/360)*.7;
}

// Updates our stuff!!!
function update()
{
    renderer.setClearColorHex(0x000000, 1.0);
    renderer.clear(true);
    renderer.render(scene, camera);
   
    if (keysPressed["W".charCodeAt(0)] == true) 
    {
        var dir = new THREE.Vector3(0,0,-1);
        var dirW = dir.applyMatrix4(camObject.matrixRotationWorld)
        camObject.translate(0.1, dirW);
    }
    if (keysPressed["S".charCodeAt(0)] == true) 
    {
        var dir = new THREE.Vector3(0,0,-1);
        var dirW = dir.applyMatrix4(camObject.matrixRotationWorld)
        camObject.translate(-0.1, dirW);
    }
    if (keysPressed["A".charCodeAt(0)] == true) 
    {
        var dir = new THREE.Vector3(1,0,0);
        var dirW = dir.applyMatrix4(camObject.matrixRotationWorld)
        camObject.translate(-0.1, dirW);
    }
    if (keysPressed["D".charCodeAt(0)] == true)
    {
        var dir = new THREE.Vector3(1,0,0);
        var dirW = dir.applyMatrix4(camObject.matrixRotationWorld)
        camObject.translate(0.1, dirW);
    }
    
    requestAnimationFrame(update);
    animate(new Date().getTime());
}