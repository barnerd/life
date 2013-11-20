var MAP = MAP || {};

MAP.dimension = 128;
MAP.scale = 64;

MAP.updateMap = function (x, z, scene) {
	// check to see if map section is already created
	var plot = MAP.XZToPlot(x, z), newPlot;
	var str = plot.split(','),
	plotX = parseInt(str[0]),
	plotZ = parseInt(str[1]);

	if(typeof MAP.map === "undefined") {
		MAP.map = {};
	}

	var i, j, radius = 2;
	for(i=-radius;i<=radius;i++) {
	for(j=-radius;j<=radius;j++) {
		newPlot = (i+plotX)+','+(j+plotZ);
		if(i<radius && i>-radius && j<radius && j>-radius) {
			if(typeof MAP.map[newPlot] === "undefined") {
				MAP.map[newPlot] = {};
var startTime = Date.now();
				MAP.createMap(newPlot);
console.log(newPlot+' created in '+(Date.now() - startTime));
			}
			scene.add(MAP.map[newPlot].mesh)
		}
		else {
			if(typeof MAP.map[newPlot] !== "undefined") {
				scene.remove(MAP.map[newPlot].mesh);
			}
		}
	}
	}

	return MAP.map;
}

MAP.createMap = function(plot) {
	// create height map
	MAP.map[plot].heightMap = MAP.createHeightMap(plot, MAP.dimension, .75);
//console.log("map created:" + (Date.now() - LIFE._lastFrameTime));

	// post-process height map
	MAP.map[plot].mesh = MAP.createMesh(plot, MAP.map[plot].heightMap);
//console.log("map mesh:" + (Date.now() - LIFE._lastFrameTime));

	// add map objects
};

MAP.createHeightMap = function(plot, mapDimension, roughness) {
	MAP.dimension = mapDimension;
	MAP.roughness = roughness;
	var map = create2DArray(MAP.dimension+1, MAP.dimension+1);

	// match boundaries
	var plot = plot.split(','),
	plotX = parseInt(plot[0]),
	plotZ = parseInt(plot[1]);

	var newPlot;

	// to the left
	newPlot = plotX+','+(plotZ-1);
	if(typeof MAP.map[newPlot] !== "undefined") {
		for(var i=MAP.dimension;i>=0;i--) {
			map[i][0] = MAP.map[newPlot].heightMap[i][MAP.dimension];
		}
	}

	// to the right
	newPlot = plotX+','+(plotZ+1);
	if(typeof MAP.map[newPlot] !== "undefined") {
		for(var i=MAP.dimension;i>=0;i--) {
			map[i][MAP.dimension] = MAP.map[newPlot].heightMap[i][0];
		}
	}

	// to the forward
	newPlot = (plotX+1)+','+plotZ;
	if(typeof MAP.map[newPlot] !== "undefined") {
		for(var i=MAP.dimension;i>=0;i--) {
			map[MAP.dimension][i] = MAP.map[newPlot].heightMap[0][i];
		}
	}

	// to the back
	newPlot = (plotX-1)+','+plotZ;
	if(typeof MAP.map[newPlot] !== "undefined") {
		for(var i=MAP.dimension;i>=0;i--) {
			map[0][i] = MAP.map[newPlot].heightMap[MAP.dimension][i];
		}
	}

	MAP.startDisplacement(map, MAP.dimension);

	return map;
};

// Setup the map array for use
create2DArray = function(d1, d2) {
	var x = new Array(d1),
	i, j;

	for (i = 0; i < d1; i += 1) {
		x[i] = new Array(d2);
		for (j = 0; j < d2; j += 1) {
			x[i][j] = -1;
		}
	}
	return x;
};

// Starts off the map generation, seeds the first 4 corners
MAP.startDisplacement = function(map, mapDimension) {
	var t, tr, tl, b, bl, br, r, l, center;

	// top left
	if(map[0][0] == -1) {
		map[0][0] = Math.random(1.0);
	}
	tl = map[0][0];

	// bottom left
	if(map[0][mapDimension] == -1) {
		map[0][mapDimension] = Math.random(1.0);
	}
	bl = map[0][mapDimension];

	// top right
	if(map[mapDimension][0] == -1) {
		map[mapDimension][0] = Math.random(1.0);
	}
	tr = map[mapDimension][0];

	// bottom right
	if(map[mapDimension][mapDimension] == -1) {
		map[mapDimension][mapDimension] = Math.random(1.0);
	}
	br = map[mapDimension][mapDimension];

	// Center
	map[mapDimension / 2][mapDimension / 2] = (tl + bl + tr + br) / 4;
	center = map[mapDimension / 2][mapDimension / 2];

	/* Non wrapping terrain */
	/*map[mapDimension / 2][mapDimension] = bl + br + center / 3;
	map[mapDimension / 2][0] = tl + tr + center / 3;
	map[mapDimension][mapDimension / 2] = tr + br + center / 3;
	map[0][mapDimension / 2] = tl + bl + center / 3;*/

	/*Wrapping terrain */

	if(map[mapDimension / 2][mapDimension]) {
		map[mapDimension / 2][mapDimension] = (bl + br + center + center) / 4;
	}
	if(map[mapDimension / 2][0]) {
		map[mapDimension / 2][0] = (tl + tr + center + center) / 4;
	}
	if(map[mapDimension][mapDimension / 2]) {
		map[mapDimension][mapDimension / 2] = (tr + br + center + center) / 4;
	}
	if(map[0][mapDimension / 2]) {
		map[0][mapDimension / 2] = (tl + bl + center + center) / 4;
	}

	// Call displacment
	MAP.midpointDisplacment(map, mapDimension);

	return map;
};

// Workhorse of the terrain generation.
MAP.midpointDisplacment = function(map, dimension) {
	var newDimension = dimension / 2,
		t, tr, tl, b, bl, br, r, l, center,
		i, j;

	if (newDimension > 1){
		for(i = newDimension; i <= MAP.dimension; i += newDimension){
			for(j = newDimension; j <= MAP.dimension; j += newDimension){
				x = i - (newDimension / 2);
				y = j - (newDimension / 2);

				tl = map[i - newDimension][j - newDimension];
				tr = map[i][j - newDimension];
				bl = map[i - newDimension][j];
				br = map[i][j];

				// Center
				if(map[x][y] == -1) {
					map[x][y] = bound((tl + tr + bl + br) / 4 + displace(dimension), 0, 1);
				}
				center = map[x][y];

				// Top
				if(map[x][j - newDimension] == -1) {
					if(j - (newDimension * 2) + (newDimension / 2) > 0) {
						map[x][j - newDimension] = (tl + tr + center + map[x][j - dimension + (newDimension / 2)]) / 4 + displace(dimension);
					} else {
						map[x][j - newDimension] = (tl + tr + center) / 3 + displace(dimension);
					}
				}

				map[x][j - newDimension] = bound(map[x][j - newDimension], 0, 1);

				// Bottom
				if(map[x][j] == -1) {
					if(j + (newDimension / 2) < MAP.dimension && map[x][j + (newDimension / 2)] != -1) {
						map[x][j] = (bl + br + center + map[x][j + (newDimension / 2)]) / 4 + displace(dimension);
					} else {
						map[x][j] = (bl + br + center) / 3 + displace(dimension);
					}
				}

				map[x][j] = bound(map[x][j], 0, 1);


				// Right
				if(map[i][y] == -1) {
					if(i + (newDimension / 2) < MAP.dimension && map[i + (newDimension / 2)][y] != -1) {
						map[i][y] = (tr + br + center + map[i + (newDimension / 2)][y]) / 4 + displace(dimension);
					} else {
						map[i][y] = (tr + br + center) / 3 + displace(dimension);
					}
				}

				map[i][y] = bound(map[i][y], 0, 1);

				// Left
				if(map[i - newDimension][y] == -1) {
					if(i - (newDimension * 2) + (newDimension / 2) > 0 && map[i - dimension + (newDimension / 2)][y] != -1) {
						map[i - newDimension][y] = (tl + bl + center + map[i - dimension + (newDimension / 2)][y]) / 4 + displace(dimension);;
					} else {
						map[i - newDimension][y] = (tl + bl + center) / 3 + displace(dimension);
					}
				}

				map[i - newDimension][y] = bound(map[i - newDimension][y], 0, 1);
			}
		}
		MAP.midpointDisplacment(map, newDimension);
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
};

MAP.createMesh = function(plot, heightMap) {
    var geometry = new THREE.Geometry(),
    count, c, tr, br, bl,
    color = new THREE.Color(),
    normal = new THREE.Vector3(0, 1, 0);

    var plot = plot.split(','),
	plotX = parseInt(plot[0]),
	plotZ = parseInt(plot[1]);

    var i, j;
    for (i = 0; i < MAP.dimension; i += 1) {
    for (j = 0; j < MAP.dimension; j += 1) {
        c = heightMap[i][j];
        tr = heightMap[i+1][j] * MAP.scale;
        br = heightMap[i+1][j+1] * MAP.scale;
        bl = heightMap[i][j+1] * MAP.scale;

        geometry.vertices.push(new THREE.Vector3(plotX * MAP.dimension + i, c * MAP.scale, plotZ * MAP.dimension + j));
        geometry.vertices.push(new THREE.Vector3(plotX * MAP.dimension + i + 1, tr, plotZ * MAP.dimension + j));
        geometry.vertices.push(new THREE.Vector3(plotX * MAP.dimension + i + 1, br, plotZ * MAP.dimension + j + 1));
        geometry.vertices.push(new THREE.Vector3(plotX * MAP.dimension + i, bl, plotZ * MAP.dimension + j + 1));

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
    geometry.mergeVertices();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var material = new THREE.MeshLambertMaterial({
        wireframe: false,
        wireframeLinewidth: 3,
        vertexColors: THREE.VertexColors,
        shading: THREE.SmoothShading
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(MAP.scale, MAP.scale, MAP.scale);

    return mesh;
}

MAP.getHeight = function(x, z) {
	var plot = MAP.XZToPlot(x, z);

	x = Math.floor((x/MAP.scale) % MAP.dimension);
	x = (x >= 0) ? x : x + MAP.dimension;
	z = Math.floor((z/MAP.scale) % MAP.dimension);
	z = (z >= 0) ? z : z + MAP.dimension;

	return MAP.map[plot].heightMap[x][z] * MAP.scale * MAP.scale;
}

MAP.XZToPlot = function(x, z){
	x = Math.floor(x / MAP.scale / MAP.dimension);
	z = Math.floor(z / MAP.scale / MAP.dimension);
	var plot = x + ',' + z;

	return plot;
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