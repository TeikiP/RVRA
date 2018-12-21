var canvas, context, imageData, imageDst;

var renderer;

var gui;

var Menu = function() {
  this.threshold = false;
  this.color = [0, 128, 255];
  this.tolerance = 15;
};

var menu, stats;

// source : https://ourcodeworld.com/articles/read/185/how-to-get-the-pixel-color-from-a-canvas-on-click-or-mouse-event-with-javascript
function getElementPosition(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function getEventLocation(element,event){
    // Relies on the getElementPosition function.
    var pos = getElementPosition(element);
    
    return {
    	x: (event.pageX - pos.x),
      	y: (event.pageY - pos.y)
    };
}

function init() {

  canvas = document.getElementById("canvas");
  canvas.width = parseInt(canvas.style.width);
  canvas.height = parseInt(canvas.style.height);
  
  context = canvas.getContext("2d");

  imageDst = new ImageData( canvas.width, canvas.height)

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(canvas.width, canvas.height);
  renderer.setClearColor(0xffffff, 1);
  document.getElementById("container").appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
  scene.add(camera);
  texture = createTexture();
  scene.add(texture);

  // GUI
  menu = new Menu();
  gui = new dat.GUI();
  gui.add(menu, 'threshold');
  var color = gui.addColor(menu,'color').listen();
  var tolerance = gui.add(menu, 'tolerance', 0, 255);
  gui.color = [0, 128, 255];
  gui.tolerance = 15;
  
  color.onChange(function(value){
    gui.color = value;
    console.log("color = " + value);
  }); 
  
  tolerance.onChange(function(value){
    gui.tolerance = value;
  });
  
  canvas.addEventListener("click",function(event){
      var eventLocation = getEventLocation(this,event);
      
      var pixelData = context.getImageData(eventLocation.x, eventLocation.y, 1, 1).data;
      
      //gui.color = pixelData;
      gui.color = [pixelData[0], pixelData[1], pixelData[2]];
      console.log("color -> " + gui.color);
  },false);

  // stats
  stats = new Stats();
  document.getElementById("container").appendChild( stats.dom );

  animate();
}

function threshold(imageInput, imageOutput, thresholdColor, tolerance){
  var src = imageInput.data;
  var dst = imageOutput.data;
  var singleCanal = new CV.Image(canvas.width, canvas.height);
  var dstSingleCanal = singleCanal.data;
  var len = src.length;
  var tabR = [];
  var tabG = [];
  var tabB = [];
  var i;

  for (i = 0; i < 256; ++ i) {
    tabR[i] = (i <= thresholdColor[0] - tolerance || i >= thresholdColor[0] + tolerance) ? 0: 255;
    tabG[i] = (i <= thresholdColor[1] - tolerance || i >= thresholdColor[1] + tolerance) ? 0: 255;
    tabB[i] = (i <= thresholdColor[2] - tolerance || i >= thresholdColor[2] + tolerance) ? 0: 255;
  }
  

  for (i = 0; i < len; i += 4){
    if (tabR[src[i]] == 255 && tabG[src[i+1]] == 255 && tabB[src[i+2]] == 255) {
      dst[i] = 255;
      dst[i+1] = 255;
      dst[i+2] = 255;
      dst[i+3] = src[i+3];
      dstSingleCanal[i / 4] = 255;
    }
    
    else {
      dst[i] = 0;
      dst[i+1] = 0;
      dst[i+2] = 0;
      dst[i+3] = src[i+3];
      dstSingleCanal[i / 4] = 0;
    }
  }
  
  imageOutput.width = imageInput.width;
  imageOutput.height = imageInput.height;

  return singleCanal;
};

function createTexture() {
  var texture = new THREE.Texture(imageDst),
      object = new THREE.Object3D(),
      geometry = new THREE.PlaneGeometry(1.0, 1.0, 0.0),
      material = new THREE.MeshBasicMaterial( {map: texture, depthTest: false, depthWrite: false} ),
      mesh = new THREE.Mesh(geometry, material);

  texture.minFilter = THREE.NearestFilter;

  object.position.z = -1;

  object.add(mesh);

  return object;
}

function rgb2hsv (r,g,b) {
  var computedH = 0;
  var computedS = 0;
  var computedV = 0;

  //remove spaces from input RGB values, convert to int
  var r = parseInt( (''+r).replace(/\s/g,''),10 ); 
  var g = parseInt( (''+g).replace(/\s/g,''),10 ); 
  var b = parseInt( (''+b).replace(/\s/g,''),10 ); 

  if ( r==null || g==null || b==null ||
        isNaN(r) || isNaN(g)|| isNaN(b) ) {
    alert ('Please enter numeric RGB values!');
    return;
  }
  
  if (r<0 || g<0 || b<0 || r>255 || g>255 || b>255) {
    alert ('RGB values must be in the range 0 to 255.');
    return;
  }
  
  r=r/255; g=g/255; b=b/255;
  var minRGB = Math.min(r,Math.min(g,b));
  var maxRGB = Math.max(r,Math.max(g,b));

  // Black-gray-white
  if (minRGB==maxRGB) {
    computedV = minRGB;
    return [0,0,computedV];
  }

  // Colors other than black-gray-white:
  var d = (r==minRGB) ? g-b : ((b==minRGB) ? r-g : b-r);
  var h = (r==minRGB) ? 3 : ((b==minRGB) ? 1 : 5);
  computedH = 60*(h - d/(maxRGB - minRGB));
  computedS = (maxRGB - minRGB)/maxRGB;
  computedV = maxRGB;
  
  return [computedH,computedS,computedV];
}


function animate() {

  requestAnimationFrame( animate );

  if (video.readyState === video.HAVE_ENOUGH_DATA){
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    var tmp = new CV.Image(canvas.width, canvas.height);

    if(menu.threshold) {
      var binary = threshold(imageData, imageDst, gui.color, gui.tolerance);      
      
      var contours = CV.findContours(binary, tmp);
      
      var contoursAreas = [];
      for (var i = 0; i < contours.length; i++) {
        contoursAreas[i] = CV.perimeter(contours[i]);
      }
      
      if (contoursAreas.length != 0) {
        var maxValue = contoursAreas[0];
        var maxIndex = 0;

        for (var i = 1; i < contoursAreas.length; i++) {
            if (contoursAreas[i] > maxValue) {
                maxIndex = i;
                maxValue = contoursAreas[i];
            }
        }
        
      }
      
      var x_max = contours[maxIndex][0].x;
      var x_min = contours[maxIndex][0].x;
      var y_max = contours[maxIndex][0].y;
      var y_min = contours[maxIndex][0].y;
      
      for (var i = 1; i < contours[maxIndex].length; i++) {
            if (contours[maxIndex][i].x > x_max)
              x_max = contours[maxIndex][i].x;
              
            else if(contours[maxIndex][i].x < x_min)
              x_min = contours[maxIndex][i].x;
              
            if (contours[maxIndex][i].y > y_max)
              y_max = contours[maxIndex][i].y;
              
            else if(contours[maxIndex][i].y < y_min)
              y_min = contours[maxIndex][i].y;
      }
      
      var x_cen = (x_max - x_min) / 2 + x_min;
      var y_cen = (y_max - y_min) / 2 + y_min;
      
      var radius;
      
      if ((y_max-y_min)>(x_max-x_min))
        radius = (y_max-y_min)/2;
      else
        radius = (x_max-x_min)/2;
        
      
      context.beginPath();
      context.strokeStyle="#FF0000";
      context.arc(x_cen, y_cen, radius, 0, 2 * Math.PI);
      context.stroke();
      
      //var camera_matrix = 
      //{{6.1515715951454717e+02, 0., 3.1950000000000000e+02},
      //{0., 6.1515715951454717e+02, 2.3950000000000000e+02}, 
      //{0., 0., 1.}};
    }
    
    else
      CV.grayscale(imageData, imageDst);
      //imageDst.data.set(imageData.data);

    texture.children[0].material.map.needsUpdate = true;
    render();
  }
}

function render() {

  renderer.clear();
  renderer.render(scene, camera);

  stats.update();

}



