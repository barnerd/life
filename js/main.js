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
var ttt;
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
    LIFE.cumulatedFrameTime = 0; // ms
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
    LIFE.camera.position.set(0, 64*256, 0);
    LIFE.camera.lookAt(1, 64*256, 0);
    LIFE.scene.add(LIFE.camera);

    // Render the scene.
    LIFE.renderer.render(LIFE.scene, LIFE.camera);
    document.body.appendChild(LIFE.renderer.domElement);

    // TODO: Add Intro screen with start button
    LIFE.start();
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

    console.log("start:" + (Date.now() - ttt));
    LIFE.map = new MAP.createMap();
    console.log("map created:" + (Date.now() - ttt));

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
    console.log("map mesh:" + (Date.now() - ttt));

    LIFE.renderer.render(LIFE.scene, LIFE.camera);
    console.log("map drawn:" + (Date.now() - ttt));

    LIFE.controls = new THREE.OrbitControls(LIFE.camera, LIFE.renderer.domElement);
};

 // Renders the scene and updates the render as needed.
LIFE.animate = function() {
    var time = Date.now();
    LIFE.frameTime = time - LIFE._lastFrameTime;
    LIFE._lastFrameTime = time;
    LIFE.cumulatedFrameTime += LIFE.frameTime;

    /*while(LIFE.cumulatedFrameTime > LIFE.gameStepTime) {
        // block movement will go here
        LIFE.cumulatedFrameTime -= LIFE.gameStepTime;
    }*/

    LIFE.renderer.render(LIFE.scene, LIFE.camera);
    LIFE.controls.update();

    // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    if(!LIFE.gameOver) window.requestAnimationFrame(LIFE.animate);
};

window.addEventListener("load", LIFE.init);