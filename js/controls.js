CONTROLS = {};

CONTROLS.bindKeys = function() {
    KeyboardJS.on('q', CONTROLS.onDownQ, CONTROLS.onUpQ);
    KeyboardJS.on('k', CONTROLS.onDownK, CONTROLS.onUpK);

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

CONTROLS.onDownK = function() {
};

CONTROLS.onUpK = function() {
    CONTROLS.testKeyBindings = !CONTROLS.testKeyBindings;
};