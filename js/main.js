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
    LIFE.camera.position.set(0, 64*64, 0);
    LIFE.camera.lookAt(0, 64*64, 1);
    LIFE.scene.add(LIFE.camera);

    // Render the scene.
    LIFE.renderer.render(LIFE.scene, LIFE.camera);
    document.body.appendChild(LIFE.renderer.domElement);

    LIFE.controls = new THREE.FirstPersonControls(LIFE.camera, LIFE.renderer.domElement);
    LIFE.controls.lookSpeed = 0.0001;
    LIFE.controls.movementSpeed = 1.0;
    LIFE.controls.movementSpeed = 10.0;

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
    // add subtle blue ambient lighting
    LIFE.ambientLight = new THREE.AmbientLight(0xffffff);
    //LIFE.scene.add(LIFE.ambientLight);

    // directional lighting
    LIFE.directionalLight = new THREE.DirectionalLight(0xffffff);
    LIFE.directionalLight.position.set(0, 10000, 0).normalize();
    LIFE.scene.add(LIFE.directionalLight);

    console.log("start:" + (Date.now() - LIFE._lastFrameTime));
    LIFE.map = MAP.updateMap(LIFE.controls.object.position.x, LIFE.controls.object.position.z);
    LIFE.scene.add(LIFE.map.mesh);

var startTime = Date.now();
    LIFE.renderer.render(LIFE.scene, LIFE.camera);
console.log("map drawn in " + (Date.now() - startTime));
};

 // Renders the scene and updates the render as needed.
LIFE.animate = function() {
    var time = Date.now();
    var frameTimeDelta = time - LIFE._lastFrameTime;

    LIFE.controls.update(frameTimeDelta);
//LIFE.controls.object.position.y = MAP.getHeight(LIFE.controls.object.position.x, LIFE.controls.object.position.z) + 100;
    //LIFE.map = MAP.updateMap(LIFE.controls.object.position.x, LIFE.controls.object.position.z);
    LIFE.renderer.render(LIFE.scene, LIFE.camera);

    LIFE._lastFrameTime = time;
    // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    if(!LIFE.gameOver) window.requestAnimationFrame(LIFE.animate);
};

window.addEventListener("load", LIFE.init);