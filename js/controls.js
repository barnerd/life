CONTROLS = {};

CONTROLS.bindKeys = function() {
    KeyboardJS.on('q', CONTROLS.onDownQ, CONTROLS.onUpQ);
};

CONTROLS.onDownQ = function() {
    //LIFE.controls.freeze = false;
    console.log('Q down!');
};

CONTROLS.onUpQ = function() {
    console.log('Q up!');
};

