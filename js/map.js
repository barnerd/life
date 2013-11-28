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

	if(typeof MAP.map[plot] === "undefined") {
		MAP.map[plot] = {};
var startTime = Date.now();
		MAP.createMap(plot);
console.log(plot+' created in '+(Date.now() - startTime));
	}
	scene.add(MAP.map[plot].mesh)

	return MAP.map;
}

MAP.createMap = function(plot) {
	// create height map
	MAP.map[plot].geometry = new THREE.PlaneGeometry(
		MAP.dimension*MAP.scale, MAP.dimension*MAP.scale,	// Width and Height
		MAP.dimension, MAP.dimension						// Terrain resolution
	);
	MAP.map[plot].geometry.dynamic = true;

	MAP.createHeightMap(plot);
//console.log("map created:" + (Date.now() - LIFE._lastFrameTime));

	// post-process height map
	MAP.createMesh(plot);
//console.log("map mesh:" + (Date.now() - LIFE._lastFrameTime));

	// add map objects
};

MAP.createHeightMap = function(plot) {
	for (var i = MAP.map[plot].geometry.vertices.length - 1; i >= 0; i--) {
		MAP.map[plot].geometry.vertices[i].z = -1;
	}

	// match boundaries
	var plot = plot.split(','),
	plotX = parseInt(plot[0]),
	plotZ = parseInt(plot[1]);

	var newPlot;

	// to the left
	newPlot = plotX+','+(plotZ-1);
	if(typeof MAP.map[newPlot] !== "undefined") {
		for(var i=MAP.dimension;i>=0;i--) {
			MAP.map[plot].geometry.vertices[i * (MAP.dimension + 1)].z = MAP.map[newPlot].geometry.vertices[i * (MAP.dimension + 1) + MAP.dimension].z;
		}
	}

	// to the right
	newPlot = plotX+','+(plotZ+1);
	if(typeof MAP.map[newPlot] !== "undefined") {
		for(var i=MAP.dimension;i>=0;i--) {
			MAP.map[plot].geometry.vertices[i * (MAP.dimension + 1) + MAP.dimension].z = MAP.map[newPlot].geometry.vertices[i * (MAP.dimension + 1)].z;
		}
	}

	// to the forward
	newPlot = (plotX+1)+','+plotZ;
	if(typeof MAP.map[newPlot] !== "undefined") {
		for(var i=MAP.dimension;i>=0;i--) {
			MAP.map[plot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + i].z = MAP.map[newPlot].geometry.vertices[i].z;
		}
	}

	// to the back
	newPlot = (plotX-1)+','+plotZ;
	if(typeof MAP.map[newPlot] !== "undefined") {
		for(var i=MAP.dimension;i>=0;i--) {
			MAP.map[plot].geometry.vertices[i].z = MAP.map[newPlot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + i].z;
		}
	}

	MAP.startDisplacement(plot);

	MAP.map[plot].geometry.__dirtyVertices = true;
	MAP.map[plot].geometry.computeCentroids();
};

// Starts off the map generation, seeds the first 4 corners
MAP.startDisplacement = function(plot) {
	var t, tr, tl, b, bl, br, r, l, center;

	// top left
	// 0 = 0 * (MAP.dimension + 1) + 0
	if(MAP.map[plot].geometry.vertices[0].z == -1) {
		MAP.map[plot].geometry.vertices[0].z = Math.random();
	}
	tl = MAP.map[plot].geometry.vertices[0].z;

	// bottom left
	// MAP.dimension = 0 * (MAP.dimension + 1) + MAP.dimension
	if(MAP.map[plot].geometry.vertices[MAP.dimension].z == -1) {
		MAP.map[plot].geometry.vertices[MAP.dimension].z = Math.random();
	}
	bl = MAP.map[plot].geometry.vertices[MAP.dimension].z;

	// top right
	// MAP.dimension * (MAP.dimension + 1) = MAP.dimension * (MAP.dimension + 1) + 0
	if(MAP.map[plot].geometry.vertices[(MAP.dimension + 1) * MAP.dimension].z == -1) {
		MAP.map[plot].geometry.vertices[(MAP.dimension + 1) * MAP.dimension].z = Math.random();
	}
	tr = MAP.map[plot].geometry.vertices[(MAP.dimension + 1) * MAP.dimension].z;

	// bottom right
	// MAP.dimension * (MAP.dimension + 1) + MAP.dimension
	if(MAP.map[plot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + MAP.dimension].z == -1) {
		MAP.map[plot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + MAP.dimension].z = Math.random();
	}
	br = MAP.map[plot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + MAP.dimension].z;

	// Center
	MAP.map[plot].geometry.vertices[MAP.dimension / 2 * (MAP.dimension + 1) + (MAP.dimension / 2)].z = (tl + bl + tr + br) / 4;
	center = MAP.map[plot].geometry.vertices[MAP.dimension / 2 * (MAP.dimension + 1) + MAP.dimension / 2].z;

	/* Non wrapping terrain */
	/*map[MAP.dimension / 2][MAP.dimension] = bl + br + center / 3;
	map[MAP.dimension / 2][0] = tl + tr + center / 3;
	map[MAP.dimension][MAP.dimension / 2] = tr + br + center / 3;
	map[0][MAP.dimension / 2] = tl + bl + center / 3;*/

	/*Wrapping terrain */

	if(MAP.map[plot].geometry.vertices[MAP.dimension / 2 * (MAP.dimension + 1) + MAP.dimension].z == -1) {
		MAP.map[plot].geometry.vertices[MAP.dimension / 2 * (MAP.dimension + 1) + MAP.dimension].z = (bl + br + center + center) / 4;
	}
	// MAP.dimension / 2 * (MAP.dimension + 1) = MAP.dimension / 2 * (MAP.dimension + 1) + 0
	if(MAP.map[plot].geometry.vertices[MAP.dimension / 2 * (MAP.dimension + 1)].z == -1) {
		MAP.map[plot].geometry.vertices[MAP.dimension / 2 * (MAP.dimension + 1)].z = (tl + tr + center + center) / 4;
	}
	if(MAP.map[plot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + MAP.dimension / 2].z == -1) {
		MAP.map[plot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + MAP.dimension / 2].z = (tr + br + center + center) / 4;
	}
	// MAP.dimension / 2 = 0 * (MAP.dimension + 1) + MAP.dimension / 2
	if(MAP.map[plot].geometry.vertices[MAP.dimension / 2].z == -1) {
		MAP.map[plot].geometry.vertices[MAP.dimension / 2].z = (tl + bl + center + center) / 4;
	}

	// Call displacment
	MAP.midpointDisplacment(plot, MAP.dimension, .75);
};

// Workhorse of the terrain generation.
MAP.midpointDisplacment = function(plot, dimension, roughness) {
	var newDimension = dimension / 2,
		t, tr, tl, b, bl, br, r, l, center,
		i, j, index;

	if (newDimension > 1) {
		for(i = newDimension; i <= MAP.dimension; i += newDimension) {
			for(j = newDimension; j <= MAP.dimension; j += newDimension) {
				x = i - (newDimension / 2);
				y = j - (newDimension / 2);

				index = (i - newDimension) * (MAP.dimension + 1) + (j - newDimension);
				tl = MAP.map[plot].geometry.vertices[index].z;

				index = i * (MAP.dimension + 1) + (j - newDimension);
				tr = MAP.map[plot].geometry.vertices[index].z;

				index = (i - newDimension) * (MAP.dimension + 1) + j;
				bl = MAP.map[plot].geometry.vertices[index].z;

				index = i * (MAP.dimension + 1) + j;
				br = MAP.map[plot].geometry.vertices[index].z;

				// Center
				index = x * (MAP.dimension + 1) + y;
				if(MAP.map[plot].geometry.vertices[index].z == -1) {
					MAP.map[plot].geometry.vertices[index].z = bound((tl + tr + bl + br) / 4 + displace(dimension, roughness), 0, 1);
				}
				center = MAP.map[plot].geometry.vertices[index].z;

				// Top
				index = x * (MAP.dimension + 1) + (j - newDimension);
				if(MAP.map[plot].geometry.vertices[index].z == -1) {
					if(j - (newDimension * 2) + (newDimension / 2) > 0 && + MAP.map[plot].geometry.vertices[x * (MAP.dimension + 1) + (j - dimension + (newDimension / 2))].z != -1) {
						MAP.map[plot].geometry.vertices[index].z = (tl + tr + center + MAP.map[plot].geometry.vertices[x * (MAP.dimension + 1) + (j - dimension + (newDimension / 2))].z) / 4 + displace(dimension, roughness);
					} else {
						MAP.map[plot].geometry.vertices[index].z = (tl + tr + center) / 3 + displace(dimension, roughness);
					}
				}

				//MAP.map[plot].geometry.vertices[index].z = bound(map[x][j - newDimension], 0, 1);

				// Bottom
				index = x * (MAP.dimension + 1) + j;
				if(MAP.map[plot].geometry.vertices[index].z == -1) {
					if(j + (newDimension / 2) < MAP.dimension && MAP.map[plot].geometry.vertices[x * (MAP.dimension + 1) + (j + (newDimension / 2))].z != -1) {
						MAP.map[plot].geometry.vertices[index].z = (bl + br + center + MAP.map[plot].geometry.vertices[x * (MAP.dimension + 1) + (j + (newDimension / 2))].z) / 4 + displace(dimension, roughness);
					} else {
						MAP.map[plot].geometry.vertices[index].z = (bl + br + center) / 3 + displace(dimension, roughness);
					}
				}

				//MAP.map[plot].geometry.vertices[index].z = bound(map[x][j], 0, 1);


				// Right
				index = i * (MAP.dimension + 1) + y;
				if(MAP.map[plot].geometry.vertices[index].z == -1) {
					if(i + (newDimension / 2) < MAP.dimension && MAP.map[plot].geometry.vertices[(i + (newDimension / 2)) * (MAP.dimension + 1) + y].z != -1) {
						MAP.map[plot].geometry.vertices[index].z = (tr + br + center + MAP.map[plot].geometry.vertices[(i + (newDimension / 2)) * (MAP.dimension + 1) + y].z) / 4 + displace(dimension, roughness);
					} else {
						MAP.map[plot].geometry.vertices[index].z = (tr + br + center) / 3 + displace(dimension, roughness);
					}
				}

				//MAP.map[plot].geometry.vertices[index].z = bound(map[i][y], 0, 1);

				// Left
				index = (i - newDimension) * (MAP.dimension + 1) + y;
				if(MAP.map[plot].geometry.vertices[index].z == -1) {
					if(i - (newDimension * 2) + (newDimension / 2) > 0 && MAP.map[plot].geometry.vertices[(i - dimension + (newDimension / 2)) * (MAP.dimension + 1) + y].z != -1) {
						MAP.map[plot].geometry.vertices[index].z = (tl + bl + center + MAP.map[plot].geometry.vertices[(i - dimension + (newDimension / 2)) * (MAP.dimension + 1) + y].z) / 4 + displace(dimension, roughness);;
					} else {
						MAP.map[plot].geometry.vertices[index].z = (tl + bl + center) / 3 + displace(dimension, roughness);
					}
				}

				//MAP.map[plot].geometry.vertices[index].z = bound(map[i - newDimension][y], 0, 1);
			}
		}
		MAP.midpointDisplacment(plot, newDimension, roughness);
	}
};

// Random function to offset the center
displace = function(num, roughness) {
	var max = num / (MAP.dimension + MAP.dimension) * roughness;
	return (Math.random()- 0.5) * max;
};

// bound the value to make sure its within bounds
bound = function(value, bottom, top) {
	return value;
	// is this needed? return (value > top) ? top : (value < bottom) ? bottom : value;
};

MAP.createMesh = function(plot) {
	var c, color, vertex;

	MAP.map[plot].geometry.mergeVertices();
	MAP.map[plot].geometry.computeVertexNormals();
	MAP.map[plot].geometry.computeFaceNormals();

	for (var i = 0; i < MAP.map[plot].geometry.vertices.length; i++) {
		c = MAP.map[plot].geometry.vertices[i].z;
		color = MAP.colorFade(c);

        MAP.map[plot].geometry.colors.push(color);
    }
    for (var i = 0; i < MAP.map[plot].geometry.faces.length; i++) {
    	vertex = MAP.map[plot].geometry.faces[i].a;
		color = MAP.map[plot].geometry.colors[vertex];

        MAP.map[plot].geometry.faces[i].color = color;
    }

    MAP.map[plot].geometry.colorsNeedUpdate = true;
    MAP.map[plot].geometry.computeVertexNormals();
	MAP.map[plot].geometry.computeFaceNormals();
    
    var material = new THREE.MeshLambertMaterial({
    	vertexColors: true,
    	wireframe: false,
        shading: THREE.SmoothShading,
        //overdraw: true
    });
    MAP.map[plot].mesh = new THREE.Mesh(MAP.map[plot].geometry, material);
	MAP.map[plot].mesh.rotation.x = -Math.PI / 2;
	MAP.map[plot].mesh.scale.z = MAP.scale * MAP.scale;
};

MAP.getHeight = function(x, z) {
	var plot = MAP.XZToPlot(x, z);

	x = Math.floor((x/MAP.scale) % MAP.dimension);
	x = (x >= 0) ? x : x + MAP.dimension;
	z = Math.floor((z/MAP.scale) % MAP.dimension);
	z = (z >= 0) ? z : z + MAP.dimension;

	return MAP.map[plot].heightMap[x][z] * MAP.scale * MAP.scale;
};

MAP.XZToPlot = function(x, z){
	x = Math.floor(x / MAP.scale / MAP.dimension);
	z = Math.floor(z / MAP.scale / MAP.dimension);
	var plot = x + ',' + z;

	return plot;
};

// colormap colors
MAP.COLORS = 
	{water:{start:{r:0.15294, g:0.19608, b:0.25706},
			  end:{r:0.02922, g:0.07831, b:0.15686}},
	  sand:{start:{r:0.38431, g:0.41176, b:0.32549},
			  end:{r:0.74118, g:0.74118, b:0.56471}},
	 grass:{start:{r:0.26275, g:0.39216, b:0.07059},
			  end:{r:0.08627, g:0.14902, b:0.01176}},
	   mtn:{start:{r:0.23529, g:0.21961, b:0.12157},
			  end:{r:0.26275, g:0.31373, b:0.07059}},
	  rock:{start:{r:0.50980, g:0.50980, b:0.50980},
			  end:{r:0.35294, g:0.35294, b:0.35294}},
	  snow:{start:{r:0.78431, g:0.78431, b:0.78431},
			  end:{r:1.00000, g:1.00000, b:1.00000}}};

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

    var color = new THREE.Color();
    color.r = colorS.end.r + (colorS.start.r - colorS.end.r) * step;
    color.g = colorS.end.g + (colorS.start.g - colorS.end.g) * step;
    color.b = colorS.end.b + (colorS.start.b - colorS.end.b) * step;

    return color;
};