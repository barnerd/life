CONTROLS = {};

CONTROLS.bindKeys = function() {
    KeyboardJS.on('q', CONTROLS.onDownQ, CONTROLS.onUpQ);

    // All other keys
    CONTROLS.testKeyBindings = false;
};

CONTROLS.onDownQ = function() {
    //LIFE.controls.freeze = false;
    console.log('Q down!');
};

CONTROLS.onUpQ = function() {
    console.log('Q up!');
};