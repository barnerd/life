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

// Create an event listener that resizes the renderer with the browser window.
window.addEventListener('resize', function() {
  var WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight;
  LIFE.renderer.setSize(WIDTH, HEIGHT);
  LIFE.camera.aspect = WIDTH / HEIGHT;
  LIFE.camera.updateProjectionMatrix();
});

LIFE.init = function() {
    ttt = Date.now();
    LIFE.gameStepTime = 100;
     
    LIFE.frameTime = 0; // ms
    LIFE._lastFrameTime = Date.now(); // timestamp
     
    LIFE.gameOver = false;

    // set the scene size
    LIFE.scene = new THREE.Scene();
    var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;

    LIFE.renderer = new THREE.WebGLRenderer({antialias:true});
    LIFE.renderer.setSize(WIDTH, HEIGHT);

    // Create a camera, zoom it out from the model a bit, and add it to the scene.
    LIFE.camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
<<<<<<< HEAD
    LIFE.camera.position.set(0, 64*64, 0);
    LIFE.camera.lookAt(1, 64*64, 0);
=======
    LIFE.camera.position.set(0, 64*256, 0);
    LIFE.camera.lookAt(1, 64*256, 0);
>>>>>>> parent of d4b241d... Remove JS files
    LIFE.scene.add(LIFE.camera);

    // Render the scene.
    LIFE.renderer.render(LIFE.scene, LIFE.camera);
    document.body.appendChild(LIFE.renderer.domElement);

    LIFE.controls = new THREE.FirstPersonControls(LIFE.camera, LIFE.renderer.domElement);
    LIFE.controls.lookSpeed = 0.00008;
<<<<<<< HEAD
    LIFE.controls.movementSpeed = 1.0;
=======
    LIFE.controls.movementSpeed = 2.0;
>>>>>>> parent of d4b241d... Remove JS files

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
<<<<<<< HEAD
    // add subtle blue ambient lighting
    LIFE.ambientLight = new THREE.AmbientLight(0xffffff);
    LIFE.scene.add(LIFE.ambientLight);

    // directional lighting
    LIFE.directionalLight = new THREE.DirectionalLight(0xffffff);
    LIFE.directionalLight.position.set(0, 10000, 0).normalize();
    //LIFE.scene.add(LIFE.directionalLight);

    console.log("start:" + (Date.now() - LIFE._lastFrameTime));
    LIFE.map = MAP.updateMap(LIFE.controls.object.position.x, LIFE.controls.object.position.z, LIFE.scene);
=======
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
>>>>>>> parent of d4b241d... Remove JS files

    LIFE.renderer.render(LIFE.scene, LIFE.camera);
    console.log("map drawn:" + (Date.now() - LIFE._lastFrameTime));
};

 // Renders the scene and updates the render as needed.
LIFE.animate = function() {
    var time = Date.now();
    var frameTimeDelta = time - LIFE._lastFrameTime;

    LIFE.controls.update(frameTimeDelta);
<<<<<<< HEAD
LIFE.controls.object.position.y = MAP.getHeight(LIFE.controls.object.position.x, LIFE.controls.object.position.z) + 100;
    LIFE.map = MAP.updateMap(LIFE.controls.object.position.x, LIFE.controls.object.position.z, LIFE.scene);
=======
>>>>>>> parent of d4b241d... Remove JS files
    LIFE.renderer.render(LIFE.scene, LIFE.camera);

    LIFE._lastFrameTime = time;
    // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    if(!LIFE.gameOver) window.requestAnimationFrame(LIFE.animate);
};

window.addEventListener("load", LIFE.init);