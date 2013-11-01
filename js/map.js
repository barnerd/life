var MAP = {};

MAP.createMap = function() {
	// check to see if map section is already created

	// create height map
	MAP.createHeightMap(128, .75);

	// post-process height map

	// add map objects

	return MAP.map;
};

MAP.createHeightMap = function(mapDimension, roughness) {
	MAP.dimension = mapDimension;
	MAP.roughness = roughness;
	MAP.map = create2DArray(MAP.dimension+1, MAP.dimension+1);
	MAP.startDisplacement(MAP.dimension);
};

// Setup the map array for use
create2DArray = function(d1, d2) {
	var x = new Array(d1),
	i, j;

	for (i = 0; i < d1; i += 1) {
		x[i] = new Array(d2);
		for (j = 0; j < d2; j += 1) {
			x[i][j] = 0;
		}
	}
	return x;
};

// Starts off the map generation, seeds the first 4 corners
MAP.startDisplacement = function(mapDimension) {
	var t, tr, tl, b, bl, br, r, l, center;

	// top left
	MAP.map[0][0] = Math.random(1.0);
	tl = MAP.map[0][0];

	// bottom left
	MAP.map[0][mapDimension] = Math.random(1.0);
	bl = MAP.map[0][mapDimension];

	// top right
	MAP.map[mapDimension][0] = Math.random(1.0);
	tr = MAP.map[mapDimension][0];

	// bottom right
	MAP.map[mapDimension][mapDimension] = Math.random(1.0);
	br = MAP.map[mapDimension][mapDimension];

	// Center
	MAP.map[mapDimension / 2][mapDimension / 2] = (tl + bl + tr + br) / 4;
	center = MAP.map[mapDimension / 2][mapDimension / 2];

	/* Non wrapping terrain */
	/*map[mapDimension / 2][mapDimension] = bl + br + center / 3;
	map[mapDimension / 2][0] = tl + tr + center / 3;
	map[mapDimension][mapDimension / 2] = tr + br + center / 3;
	map[0][mapDimension / 2] = tl + bl + center / 3;*/

	/*Wrapping terrain */

	MAP.map[mapDimension / 2][mapDimension] = (bl + br + center + center) / 4;
	MAP.map[mapDimension / 2][0] = (tl + tr + center + center) / 4;
	MAP.map[mapDimension][mapDimension / 2] = (tr + br + center + center) / 4;
	MAP.map[0][mapDimension / 2] = (tl + bl + center + center) / 4;


	// Call displacment
	MAP.midpointDisplacment(mapDimension);
};

// Workhorse of the terrain generation.
MAP.midpointDisplacment = function(dimension) {
	var newDimension = dimension / 2,
		t, tr, tl, b, bl, br, r, l, center,
		i, j;

	if (newDimension > 1){
		for(i = newDimension; i <= MAP.dimension; i += newDimension){
			for(j = newDimension; j <= MAP.dimension; j += newDimension){
				x = i - (newDimension / 2);
				y = j - (newDimension / 2);

				tl = MAP.map[i - newDimension][j - newDimension];
				tr = MAP.map[i][j - newDimension];
				bl = MAP.map[i - newDimension][j];
				br = MAP.map[i][j];

				// Center
				MAP.map[x][y] = (tl + tr + bl + br) / 4 + displace(dimension);
				MAP.map[x][y] = bound(MAP.map[x][y], 0, 1);
				center = MAP.map[x][y];

				// Top
				if(j - (newDimension * 2) + (newDimension / 2) > 0){
					MAP.map[x][j - newDimension] = (tl + tr + center + MAP.map[x][j - dimension + (newDimension / 2)]) / 4 + displace(dimension);
				}else{
					MAP.map[x][j - newDimension] = (tl + tr + center) / 3 + displace(dimension);
				}

				MAP.map[x][j - newDimension] = bound(MAP.map[x][j - newDimension], 0, 1);

				// Bottom
				if(j + (newDimension / 2) < MAP.dimension){
					MAP.map[x][j] = (bl + br + center + MAP.map[x][j + (newDimension / 2)]) / 4 + displace(dimension);
				}else{
					MAP.map[x][j] = (bl + br + center) / 3 + displace(dimension);
				}

				MAP.map[x][j] = bound(MAP.map[x][j], 0, 1);


				// Right
				if(i + (newDimension / 2) < MAP.dimension){
					MAP.map[i][y] = (tr + br + center + MAP.map[i + (newDimension / 2)][y]) / 4 + displace(dimension);
				}else{
					MAP.map[i][y] = (tr + br + center) / 3 + displace(dimension);
				}

				MAP.map[i][y] = bound(MAP.map[i][y], 0, 1);

				// Left
				if(i - (newDimension * 2) + (newDimension / 2) > 0){
					MAP.map[i - newDimension][y] = (tl + bl + center + MAP.map[i - dimension + (newDimension / 2)][y]) / 4 + displace(dimension);;
				}else{
					MAP.map[i - newDimension][y] = (tl + bl + center) / 3 + displace(dimension);
				}

				MAP.map[i - newDimension][y] = bound(MAP.map[i - newDimension][y], 0, 1);
			}
		}
		MAP.midpointDisplacment(newDimension);
	}
};

// Random function to offset the center
displace = function(num) {
	var max = num / (MAP.dimension + MAP.dimension) * MAP.roughness;
	return (Math.random(1.0)- 0.5) * max;
};

// bound the value to make sure its within bounds
bound = function(value, bottom, top) {
	return (value > top) ? top : (value < bottom) ? bottom : value;
}

// colormap colors
MAP.COLORS = 
	{water:{start:{r:39, g:50, b:63},
			  end:{r:10, g:20, b:40}},
	  sand:{start:{r:98, g:105,b:83},
			  end:{r:189,g:189,b:144}},
	 grass:{start:{r:67, g:100,b:18},
			  end:{r:22, g:38, b:3}},
	   mtn:{start:{r:60, g:56, b:31},
			  end:{r:67, g:80, b:18}},
	  rock:{start:{r:130,g:130,b:130},
			  end:{r:90, g:90, b:90}},
	  snow:{start:{r:200,g:200,b:200},
			  end:{r:255,g:255,b:255}}};

// utility for color interpolation
// got from http://www.somethinghitme.com/projects/canvasterrain/
MAP.colorFade = function(c) {
	c = bound(c, 0, 1);
	var colorS, totalSteps, step, r, g, b;
    if (c <= 0.3) {
        colorS = MAP.COLORS.water;
        step = c / .3;
    } else if (c <= 0.35) {
        colorS = MAP.COLORS.sand;
        step = (c - .3) / .05;
    } else if (c <= 0.8) {
        colorS = MAP.COLORS.grass;
        step = (c - .35) / .45;
    } else if (c <= 0.95) {
        colorS = MAP.COLORS.mtn;
        step = (c - .8) / .15;
    } else if (c <= 0.98) {
        colorS = MAP.COLORS.rock;
        step = (c - .95) / .03;
    } else {
        colorS = MAP.COLORS.snow;
        step = (c - .98) / .02;
    }

    r = colorS.end.r + (colorS.start.r - colorS.end.r) * step;
    g = colorS.end.g + (colorS.start.g - colorS.end.g) * step;
    b = colorS.end.b + (colorS.start.b - colorS.end.b) * step;

    var color = new THREE.Color();
    color.r = r/255.0;
    color.g = g/255.0;
    color.b = b/255.0;

    return color;
};