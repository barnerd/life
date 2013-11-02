if ( !window.requestAnimationFrame ) {
  window.requestAnimationFrame = ( function() {
      return window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
        window.setTimeout( callback, 1000 / 60 );
    };
})();
}
var LIFE = {};
var sphereBody;
// Create an event listener that resizes the renderer with the browser window.
window.addEventListener('resize', function() {
  var WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight;
  LIFE.renderer.setSize(WIDTH, HEIGHT);
  LIFE.camera.aspect = WIDTH / HEIGHT;
  LIFE.camera.updateProjectionMatrix();
});

LIFE.init = function() {
    LIFE.frameTime = 0; // ms
    LIFE._lastFrameTime = Date.now(); // timestamp
     
    LIFE.gameOver = false;

    // set the scene size
    LIFE.scene = new THREE.Scene();
    LIFE.world = new CANNON.World();
    LIFE.world.broadphase = new CANNON.NaiveBroadphase();
    LIFE.world.gravity.set(0, -9.80665, 0);
    var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;

    LIFE.renderer = new THREE.WebGLRenderer({antialias:true});
    LIFE.renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(LIFE.renderer.domElement);

    // Create a camera, zoom it out from the model a bit, and add it to the scene.
    LIFE.camera = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 0.1, 20000);
    LIFE.camera.position.set(0, 16*256, 0);
    LIFE.camera.lookAt(1, 64*256, 0);
    LIFE.scene.add(LIFE.camera);

    LIFE.controls = new THREE.FirstPersonControls(LIFE.camera, LIFE.renderer.domElement);
    LIFE.controls.lookSpeed = 0.00008;
    LIFE.controls.movementSpeed = 2.0;

    // TODO: Add Intro screen with start button
    LIFE.start();

    // bind keys
    CONTROLS.bindKeys();
};

LIFE.start = function() {
    LIFE.createScene();
    LIFE.animate();
};

LIFE.createScene = function() {
    // create a point light and set it's position, and add it to the scene.
    LIFE.pointLight = new THREE.PointLight(0xffffff);
    LIFE.pointLight.position.set(0, 32*4*256, 0);
    LIFE.scene.add(LIFE.pointLight);

    console.log("start:" + (Date.now() - LIFE._lastFrameTime));
    LIFE.map = new MAP.createMap();
    console.log("map created:" + (Date.now() - LIFE._lastFrameTime));

    // create the particle variables
    var geometry = new THREE.Geometry(),
        count, c, tr, br, bl,
        scale = 100,
        color = new THREE.Color(),
        normal = new THREE.Vector3(0, 1, 0);

    // now create the individual particles
    var i, j;
    for (i = 0; i < MAP.dimension; i += 1) {
    for (j = 0; j < MAP.dimension; j += 1) {
        c = LIFE.map[i][j];
        tr = LIFE.map[i+1][j];
        br = LIFE.map[i+1][j+1];
        bl = LIFE.map[i][j+1];

        geometry.vertices.push(new THREE.Vector3(i, c*64, j));
        geometry.vertices.push(new THREE.Vector3(i+1, tr*64, j));
        geometry.vertices.push(new THREE.Vector3(i+1, br*64, j+1));
        geometry.vertices.push(new THREE.Vector3(i, bl*64, j+1));

        color = MAP.colorFade(c);
        geometry.colors.push(color);
        geometry.colors.push(color);
        geometry.colors.push(color);
        geometry.colors.push(color);

        count = (j+i*(MAP.dimension))*4;
        geometry.faces.push(new THREE.Face3(count, count+2, count+1, normal, color));
        geometry.faces.push(new THREE.Face3(count+3, count+2, count, normal, color));
    }
    }
    var material = new THREE.MeshLambertMaterial({
        wireframe: false,
        wireframeLinewidth: 3,
        vertexColors: THREE.VertexColors,
        shading: THREE.SmoothShading
    });
    geometry.mergeVertices();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    var ground = new THREE.Mesh(geometry, material);
    ground.scale.set(scale, scale, scale);
    ground.position.set(-scale*MAP.dimension/2, -scale*.3, -scale*MAP.dimension/2);
    LIFE.scene.add(ground);
    console.log("map mesh:" + (Date.now() - LIFE._lastFrameTime));

    LIFE.renderer.render(LIFE.scene, LIFE.camera);
    console.log("map drawn:" + (Date.now() - LIFE._lastFrameTime));

    // for testing Cannon.js
    var mass = 5, radius = 1;
    var sphereShape = new CANNON.Sphere(radius); // Step 1
    sphereBody = new CANNON.RigidBody(mass,sphereShape); // Step 2
    sphereBody.position.set(10,16*256,0);
    LIFE.world.add(sphereBody); // Step 3
};

 // Renders the scene and updates the render as needed.
LIFE.animate = function() {
    var time = Date.now();
    var frameTimeDelta = time - LIFE._lastFrameTime;

    LIFE.controls.update(frameTimeDelta);
    LIFE.world.step(frameTimeDelta);
    LIFE.renderer.render(LIFE.scene, LIFE.camera);
//console.log(sphereBody.position.x, sphereBody.position.y, sphereBody.position.z);
    if(CONTROLS.testKeyBindings) { console.log(KeyboardJS.activeKeys()); }

    LIFE._lastFrameTime = time;
    // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    if(!LIFE.gameOver) window.requestAnimationFrame(LIFE.animate);
};

window.addEventListener("load", LIFE.init);