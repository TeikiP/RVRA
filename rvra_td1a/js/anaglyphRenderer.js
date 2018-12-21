function AnaglyphRenderer ( renderer ) {

  // Check if depth texture is supported
  var gl = renderer.domElement.getContext( 'webgl' );
  var ext = gl.getExtension('WEBGL_depth_texture');
  if (!ext) {
    alert("WEBGL_depth_texture extension does not exist");
  }

  // left and right cameras
  this.cameraLeft  = new THREE.Camera();
  this.cameraLeft.matrixAutoUpdate = false;
  this.cameraRight = new THREE.Camera();
  this.cameraRight.matrixAutoUpdate = false;


	this.update = function ( camera ) {
	  // update
	  camera.updateMatrixWorld();
	  
    // left eye view
    var eyeLeft = new THREE.Matrix4();
    eyeLeft.elements[12] = -displayParameters.ipd/2;

		this.cameraLeft.matrixWorld.copy(camera.matrixWorld).multiply(eyeLeft);

    // right eye view
    var eyeRight = new THREE.Matrix4();
    eyeRight.elements[12] = displayParameters.ipd/2;
    
    this.cameraRight.matrixWorld.copy(camera.matrixWorld).multiply(eyeRight);

    // perspective matrix
    var dualPerspective = {
      top: camera.near * displayParameters.screenSize().y / (2 * displayParameters.distanceScreenViewer()),
      bottom: -camera.near * displayParameters.screenSize().y / (2 * displayParameters.distanceScreenViewer()),
      znear: camera.near,
      zfar: camera.far
    };
    
    // left eye projection  
    var leftPerspective = {
      left: -camera.near * (displayParameters.screenSize().x - displayParameters.ipd) / (2 * displayParameters.distanceScreenViewer()),
      right: camera.near * (displayParameters.screenSize().x + displayParameters.ipd) / (2 * displayParameters.distanceScreenViewer())
    };
    
    var projLeft = new THREE.Matrix4();
    projLeft.makePerspective( leftPerspective.left,
                              leftPerspective.right,
                              dualPerspective.top,
                              dualPerspective.bottom,
                              dualPerspective.znear,                              
                              dualPerspective.zfar);
                              
    this.cameraLeft.projectionMatrix.copy(projLeft);
    
    // right eye projection  
    var rightPerspective = {
      left: -camera.near * (displayParameters.screenSize().x + displayParameters.ipd) / (2 * displayParameters.distanceScreenViewer()),
      right: camera.near * (displayParameters.screenSize().x - displayParameters.ipd) / (2 * displayParameters.distanceScreenViewer())
    };
    
    var projRight = new THREE.Matrix4();
    projRight.makePerspective( rightPerspective.left,
                               rightPerspective.right,
                               dualPerspective.top,
                               dualPerspective.bottom,
                               dualPerspective.znear,                              
                               dualPerspective.zfar);
                              
    this.cameraRight.projectionMatrix.copy(projRight);
	}

  this.render = function ( scene, camera ) {
    this.update(camera);
    
    // default
    //renderer.render(scene, camera);
    
    // left eye
    gl.colorMask(true, false, false, true);
    renderer.render(scene, this.cameraLeft);

    // depth
    renderer.clearDepth();
    
    // right eye
    gl.colorMask(false, true, true, true);
    renderer.render(scene, this.cameraRight);
  }

}
