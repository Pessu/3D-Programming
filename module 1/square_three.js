var renderer = null;	
var scene = null;
var camera = null;

$(function()
{
	var canvas = $("#main");
	renderer = new THREE.WebGLRenderer();
	
	// Renderer background color
	renderer.setClearColorHex(0x000000, 1);
	
	// Canvas size
	canvasWidth = 800;
	canvasHeight = 600;
	renderer.setSize(canvasWidth, canvasHeight);
	 
	// add generated canvas element to HTML page
    canvas.append(renderer.domElement);
	
	// New scene, contains all the objects
	scene = new THREE.Scene();
	
	// New camera object
	camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 100);
	camera.position.set(0, 0, 10);
	camera.lookAt(scene.position);
	scene.add(camera);
	
	// New geometry object
	var square = new THREE.Geometry();
	square.vertices.push(new THREE.Vector3(-1.0,  1.0, 0.0));
	square.vertices.push(new THREE.Vector3( 1.0,  1.0, 0.0));
	square.vertices.push(new THREE.Vector3( 1.0, -1.0, 0.0));
	square.vertices.push(new THREE.Vector3(-1.0, -1.0, 0.0));
	square.faces.push(new THREE.Face4(0, 1, 2, 3));
	
	// New mesh for the color
	var squareMaterial = new THREE.MeshBasicMaterial(
	{
		color:0xFF0000,
		side:THREE.DoubleSide
	});
	
	// New mesh, takes the geo-object and the material
	var squareMesh = new THREE.Mesh(square, squareMaterial);
	// Add the square into the scene
	scene.add(squareMesh);
	// Call update
	requestAnimationFrame(update);
});

function update()
{
    // render everything 
    renderer.render(scene, camera); 
    // request another frame update
    requestAnimationFrame(update);
}