var MAP = MAP || {};

MAP.dimension = 128;
MAP.scale = 64;
MAP.scaleMatrix = new THREE.Matrix4().makeScale(MAP.scale, MAP.scale * MAP.scale, MAP.scale);
MAP.numPlots = 0;

MAP.updateMap = function (x, z) {
	// check to see if map section is already created
	var plot = MAP.XZToPlot(x, z), newPlot,
	str = plot.split(','),
	plotX = parseInt(str[0]),
	plotZ = parseInt(str[1]),
	geometry = new THREE.Geometry();
	geometries = [];

	if(typeof MAP.map === "undefined") {
		MAP.map = {};

		MAP.map.material = new THREE.MeshLambertMaterial({
			vertexColors: true,
			wireframe: false,
		    shading: THREE.SmoothShading,
		    //overdraw: true
		});

		MAP.map.mesh = new THREE.Mesh();
		MAP.map.mesh.material = MAP.map.material;
	}

	if(MAP.center != plot) {
		var i, j, radius = 1;
		for(i=-radius;i<=radius;i++) {
		for(j=-radius;j<=radius;j++) {
		    newPlot = (i+plotX)+','+(j+plotZ);
	        if(typeof MAP.map[newPlot] === "undefined") {
	    		MAP.map[newPlot] = {};
var startTime = Date.now();
				MAP.createMap(newPlot);
				MAP.numPlots++;
console.log(newPlot+' created in '+(Date.now() - startTime));

				geometries.push(MAP.map[newPlot].geometry);
			}
		}
		}

		if(geometries.length > 0) {
			THREE.GeometryUtils.merge(geometry, geometries[0]);
		}
		for(i=geometries.length-1;i>0;i--) {
var startTime = Date.now();
			THREE.GeometryUtils.merge(geometry, geometries[i]);
console.log(geometries[i].name+' merged in '+(Date.now() - startTime));
		}

		geometry.mergeVertices();
		geometry.computeVertexNormals();
		geometry.computeFaceNormals();

		if(MAP.numPlots < 10) {
			MAP.map.mesh.geometry = geometry;
			console.log("geometry added");
		}
		MAP.center = plot;
	}

	return MAP.map;
}

MAP.createMap = function(plot) {
	// create height map
	MAP.createHeightMap(plot);

	// post-process height map
	MAP.createMesh(plot);

	// add map objects
};

MAP.createHeightMap = function(plot) {
	// init PlaneGeometry
	MAP.map[plot].geometry = new THREE.PlaneGeometry(
		MAP.dimension, MAP.dimension,	// Width and Height
		MAP.dimension, MAP.dimension	// Terrain resolution
	);
	MAP.map[plot].geometry.name = 'map_'+plot;
	MAP.map[plot].geometry.dynamic = true;
	MAP.map[plot].geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

	// set to -1 to track what's been changed
	for (var i = MAP.map[plot].geometry.vertices.length - 1; i >= 0; i--) {
		MAP.map[plot].geometry.vertices[i].y = -1;
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
			MAP.map[plot].geometry.vertices[i].y = MAP.map[newPlot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + i].y / (MAP.scale * MAP.scale);
		}
	}

	// to the right
	newPlot = plotX+','+(plotZ+1);
	if(typeof MAP.map[newPlot] !== "undefined") {
		for(var i=MAP.dimension;i>=0;i--) {
			MAP.map[plot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + i].y = MAP.map[newPlot].geometry.vertices[i].y / (MAP.scale * MAP.scale);
		}
	}

	// to the forward
	newPlot = (plotX+1)+','+plotZ;
	if(typeof MAP.map[newPlot] !== "undefined") {
		for(var i=MAP.dimension;i>=0;i--) {
			MAP.map[plot].geometry.vertices[i * (MAP.dimension + 1) + MAP.dimension].y = MAP.map[newPlot].geometry.vertices[i * (MAP.dimension + 1)].y / (MAP.scale * MAP.scale);
		}
	}

	// to the back
	newPlot = (plotX-1)+','+plotZ;
	if(typeof MAP.map[newPlot] !== "undefined") {
		for(var i=MAP.dimension;i>=0;i--) {
			MAP.map[plot].geometry.vertices[i * (MAP.dimension + 1)].y = MAP.map[newPlot].geometry.vertices[i * (MAP.dimension + 1) + MAP.dimension].y / (MAP.scale * MAP.scale);
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
	if(MAP.map[plot].geometry.vertices[0].y == -1) {
		MAP.map[plot].geometry.vertices[0].y = Math.random();
	}
	tl = MAP.map[plot].geometry.vertices[0].y;

	// bottom left
	// MAP.dimension * (MAP.dimension + 1) = MAP.dimension * (MAP.dimension + 1) + 0
	if(MAP.map[plot].geometry.vertices[(MAP.dimension + 1) * MAP.dimension].y == -1) {
		MAP.map[plot].geometry.vertices[(MAP.dimension + 1) * MAP.dimension].y = Math.random();
	}
	bl = MAP.map[plot].geometry.vertices[(MAP.dimension + 1) * MAP.dimension].y;

	// top right
	// MAP.dimension = 0 * (MAP.dimension + 1) + MAP.dimension
	if(MAP.map[plot].geometry.vertices[MAP.dimension].y == -1) {
		MAP.map[plot].geometry.vertices[MAP.dimension].y = Math.random();
	}
	tr = MAP.map[plot].geometry.vertices[MAP.dimension].y;

	// bottom right
	// MAP.dimension * (MAP.dimension + 1) + MAP.dimension
	if(MAP.map[plot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + MAP.dimension].y == -1) {
		MAP.map[plot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + MAP.dimension].y = Math.random();
	}
	br = MAP.map[plot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + MAP.dimension].y;

	// Center
	MAP.map[plot].geometry.vertices[MAP.dimension / 2 * (MAP.dimension + 1) + (MAP.dimension / 2)].y = (tl + bl + tr + br) / 4;
	center = MAP.map[plot].geometry.vertices[MAP.dimension / 2 * (MAP.dimension + 1) + MAP.dimension / 2].y;

	/* Non wrapping terrain */
	/*map[MAP.dimension / 2][MAP.dimension] = bl + br + center / 3;
	map[MAP.dimension / 2][0] = tl + tr + center / 3;
	map[MAP.dimension][MAP.dimension / 2] = tr + br + center / 3;
	map[0][MAP.dimension / 2] = tl + bl + center / 3;*/

	/*Wrapping terrain */

	if(MAP.map[plot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + MAP.dimension / 2].y == -1) {
		MAP.map[plot].geometry.vertices[MAP.dimension * (MAP.dimension + 1) + MAP.dimension / 2].y = (bl + br + center + center) / 4;
	}
	// MAP.dimension / 2 = 0 * (MAP.dimension + 1) + MAP.dimension / 2
	if(MAP.map[plot].geometry.vertices[MAP.dimension / 2].y == -1) {
		MAP.map[plot].geometry.vertices[MAP.dimension / 2].y = (tl + tr + center + center) / 4;
	}
	if(MAP.map[plot].geometry.vertices[MAP.dimension / 2 * (MAP.dimension + 1) + MAP.dimension].y == -1) {
		MAP.map[plot].geometry.vertices[MAP.dimension / 2 * (MAP.dimension + 1) + MAP.dimension].y = (tr + br + center + center) / 4;
	}
	// MAP.dimension / 2 * (MAP.dimension + 1) = MAP.dimension / 2 * (MAP.dimension + 1) + 0
	if(MAP.map[plot].geometry.vertices[MAP.dimension / 2 * (MAP.dimension + 1)].y == -1) {
		MAP.map[plot].geometry.vertices[MAP.dimension / 2 * (MAP.dimension + 1)].y = (tl + bl + center + center) / 4;
	}

	// Call displacment
	MAP.midpointDisplacment(plot, MAP.dimension, .75);
};

// Workhorse of the terrain generation.
MAP.midpointDisplacment = function(plot, dimension, roughness) {
	var newDimension = dimension / 2,
		t, tr, tl, b, bl, br, r, l, center,
		i, j, index;

	if(newDimension > 1) {
		for(j = newDimension; j <= MAP.dimension; j += newDimension) {
			for(i = newDimension; i <= MAP.dimension; i += newDimension) {
				x = i - (newDimension / 2);
				y = j - (newDimension / 2);

				index = (i - newDimension) * (MAP.dimension + 1) + (j - newDimension);
				tl = MAP.map[plot].geometry.vertices[index].y;

				index = i * (MAP.dimension + 1) + (j - newDimension);
				tr = MAP.map[plot].geometry.vertices[index].y;

				index = (i - newDimension) * (MAP.dimension + 1) + j;
				bl = MAP.map[plot].geometry.vertices[index].y;

				index = i * (MAP.dimension + 1) + j;
				br = MAP.map[plot].geometry.vertices[index].y;

				// Center
				index = x * (MAP.dimension + 1) + y;
				if(MAP.map[plot].geometry.vertices[index].y == -1) {
					MAP.map[plot].geometry.vertices[index].y = bound((tl + tr + bl + br) / 4 + displace(dimension, roughness), 0, 1);
				}
				center = MAP.map[plot].geometry.vertices[index].y;

				// Top
				index = x * (MAP.dimension + 1) + (j - newDimension);
				if(MAP.map[plot].geometry.vertices[index].y == -1) {
					if(j - (newDimension * 2) + (newDimension / 2) > 0 && + MAP.map[plot].geometry.vertices[x * (MAP.dimension + 1) + (j - dimension + (newDimension / 2))].y != -1) {
						MAP.map[plot].geometry.vertices[index].y = (tl + tr + center + MAP.map[plot].geometry.vertices[x * (MAP.dimension + 1) + (j - dimension + (newDimension / 2))].y) / 4 + displace(dimension, roughness);
					} else {
						MAP.map[plot].geometry.vertices[index].y = (tl + tr + center) / 3 + displace(dimension, roughness);
					}
				}

				//MAP.map[plot].geometry.vertices[index].y = bound(map[x][j - newDimension], 0, 1);

				// Bottom
				index = x * (MAP.dimension + 1) + j;
				if(MAP.map[plot].geometry.vertices[index].y == -1) {
					if(j + (newDimension / 2) < MAP.dimension && MAP.map[plot].geometry.vertices[x * (MAP.dimension + 1) + (j + (newDimension / 2))].y != -1) {
						MAP.map[plot].geometry.vertices[index].y = (bl + br + center + MAP.map[plot].geometry.vertices[x * (MAP.dimension + 1) + (j + (newDimension / 2))].y) / 4 + displace(dimension, roughness);
					} else {
						MAP.map[plot].geometry.vertices[index].y = (bl + br + center) / 3 + displace(dimension, roughness);
					}
				}

				//MAP.map[plot].geometry.vertices[index].y = bound(map[x][j], 0, 1);


				// Right
				index = i * (MAP.dimension + 1) + y;
				if(MAP.map[plot].geometry.vertices[index].y == -1) {
					if(i + (newDimension / 2) < MAP.dimension && MAP.map[plot].geometry.vertices[(i + (newDimension / 2)) * (MAP.dimension + 1) + y].y != -1) {
						MAP.map[plot].geometry.vertices[index].y = (tr + br + center + MAP.map[plot].geometry.vertices[(i + (newDimension / 2)) * (MAP.dimension + 1) + y].y) / 4 + displace(dimension, roughness);
					} else {
						MAP.map[plot].geometry.vertices[index].y = (tr + br + center) / 3 + displace(dimension, roughness);
					}
				}

				//MAP.map[plot].geometry.vertices[index].y = bound(map[i][y], 0, 1);

				// Left
				index = (i - newDimension) * (MAP.dimension + 1) + y;
				if(MAP.map[plot].geometry.vertices[index].y == -1) {
					if(i - (newDimension * 2) + (newDimension / 2) > 0 && MAP.map[plot].geometry.vertices[(i - dimension + (newDimension / 2)) * (MAP.dimension + 1) + y].y != -1) {
						MAP.map[plot].geometry.vertices[index].y = (tl + bl + center + MAP.map[plot].geometry.vertices[(i - dimension + (newDimension / 2)) * (MAP.dimension + 1) + y].y) / 4 + displace(dimension, roughness);;
					} else {
						MAP.map[plot].geometry.vertices[index].y = (tl + bl + center) / 3 + displace(dimension, roughness);
					}
				}

				//MAP.map[plot].geometry.vertices[index].y = bound(map[i - newDimension][y], 0, 1);
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
	var c, color, vertex,
	str = plot.split(','),
	plotX = parseInt(str[0]),
	plotZ = parseInt(str[1]);

	MAP.map[plot].geometry.mergeVertices();

	for (var i = 0; i < MAP.map[plot].geometry.vertices.length; i++) {
		c = MAP.map[plot].geometry.vertices[i].y;
		color = MAP.colorFade(c);

        MAP.map[plot].geometry.colors.push(color);
    }
    for (var i = 0; i < MAP.map[plot].geometry.faces.length; i++) {
    	vertex = MAP.map[plot].geometry.faces[i].a;
		color = MAP.map[plot].geometry.colors[vertex];

        MAP.map[plot].geometry.faces[i].color = color;
    }

    MAP.map[plot].geometry.colorsNeedUpdate = true;

	var translation = new THREE.Matrix4().makeTranslation((plotX+.5)*MAP.dimension, 0, (plotZ+.5)*MAP.dimension);
	var matrix = new THREE.Matrix4();
	matrix.multiplyMatrices(MAP.scaleMatrix, translation);

	MAP.map[plot].geometry.applyMatrix(matrix);
	
    MAP.map[plot].geometry.computeVertexNormals();
	MAP.map[plot].geometry.computeFaceNormals();
};

MAP.getHeight = function(x, z) {
	var plot = MAP.XZToPlot(x, z);

	x = Math.floor((x/MAP.scale) % MAP.dimension);
	x = (x >= 0) ? x : x + MAP.dimension;
	z = Math.floor((z/MAP.scale) % MAP.dimension);
	z = (z >= 0) ? z : z + MAP.dimension;

	return MAP.map[plot].geometry.vertices[x * (MAP.dimension + 1) + z].y;
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