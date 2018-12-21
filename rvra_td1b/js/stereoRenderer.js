function StereoRenderer ( renderer ) {

  // dat.gui controls
  var KController = function() {
    this.K1 = 0.5;
    this.K2 = 0.5;
  };
  
  // dat.gui object
  var guiObj = new dat.GUI();
  var kCon = new KController();
  var K1 = guiObj.add(kCon, 'K1', 0, 1);
  var K2 = guiObj.add(kCon, 'K2', 0, 1);
  guiObj.K1 = .5;
  guiObj.K2 = .5;  
  
  // web gl renderer
  var gl = renderer.domElement.getContext( 'webgl' );

  // left and right cameras
  this.cameraLeft  = new THREE.Camera();
  this.cameraLeft.matrixAutoUpdate = false;
  this.cameraRight = new THREE.Camera();
  this.cameraRight.matrixAutoUpdate = false;
  

  // Texture parameters for the offscreen buffer
  var _params = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    depthBuffer: true,
    stencilBuffer: false
   };

  // create offscreen buffer
  this.renderTargetLeft  = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight , _params );
  this.renderTargetRight = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight , _params );

  // Create camera & scene for the 2nd screen-space pass
  this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  this.scene = new THREE.Scene();
  var quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ) );
  this.scene.add( quad );

  
  var uniforms = {
    "colorMap": { value: this.renderTargetLeft.texture },
    "centerCoordinate": { value: new THREE.Vector2(0.5,0.5) },
    "K": { value: new THREE.Vector2(guiObj.K1, guiObj.K2) }
  };
  
  // dat.gui sliders update
  K1.onChange(function(K1){
    guiObj.K1 = K1;
    uniforms["K"] = { value: new THREE.Vector2(guiObj.K1, guiObj.K2) };
  });

  K2.onChange(function(K2){
    guiObj.K2 = K2;
    uniforms["K"] = { value: new THREE.Vector2(guiObj.K1, guiObj.K2) };
  });  
  

  // Load GLSL shaders and assign them to the quad as material
  shaderLoader( 'shaders/shaderUnwarp.vert', 'shaders/shaderUnwarp.frag', function (vertex_text, fragment_text) {
      quad.material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: [ vertex_text ].join( "\n" ),
        fragmentShader: [ fragment_text ].join( "\n" )
        }
      );
    }
  );

  this.setK1 = function ( value ) {
    uniforms.K.value.x = value;
  }

  this.setK2 = function ( value ) {
    uniforms.K.value.y = value;
  }

  this.setSize = function ( width, height) {
    if ( this.renderTargetRight ) this.renderTargetRight.dispose();
    if ( this.renderTargetLeft ) this.renderTargetLeft.dispose();
    this.renderTargetLeft  = new THREE.WebGLRenderTarget( width, height , _params );
    this.renderTargetRight = new THREE.WebGLRenderTarget( width, height , _params );
  }

  this.update = function ( camera ) {
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
      top: camera.near * displayParameters.screenSize().y * displayParameters.lensMagnification() / (2 * (displayParameters.distanceScreenViewer() + displayParameters.relief)),
      bottom: -camera.near * displayParameters.screenSize().y * displayParameters.lensMagnification() / (2 * (displayParameters.distanceScreenViewer() + displayParameters.relief)),
      znear: camera.near,
      zfar: camera.far
    };
    
    var w1 = displayParameters.lensMagnification() * displayParameters.ipd / 2;
    var w2 = displayParameters.lensMagnification() * ((displayParameters.screenSize().x - displayParameters.ipd) / 2);


    // left eye projection  
    var leftPerspective = {
      left: -camera.near * w2 / (displayParameters.distanceScreenViewer() + displayParameters.relief),
      right: camera.near * w1 / (displayParameters.distanceScreenViewer() + displayParameters.relief),
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
      left: -camera.near * w1 / (displayParameters.distanceScreenViewer() + displayParameters.relief),
      right: camera.near * w2 / (displayParameters.distanceScreenViewer() + displayParameters.relief),
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
    scene.updateMatrixWorld();

    camera.updateMatrixWorld();

    this.update( camera );

    // Left eye
    renderer.setViewport(0, 0, window.innerWidth/2, window.innerHeight);
    renderer.clearTarget( this.renderTargetLeft, true, true, false);
    renderer.render( scene, this.cameraLeft, this.renderTargetLeft);

    uniforms.colorMap.value = this.renderTargetLeft.texture;
    uniforms.centerCoordinate.value.x = 0.5;
    renderer.render( this.scene, this.camera );

    // Right eye
    renderer.setViewport(window.innerWidth/2, 0, window.innerWidth/2, window.innerHeight);
    renderer.clearTarget( this.renderTargetRight, true, true, false);
    renderer.render( scene, this.cameraRight, this.renderTargetRight);

    uniforms.colorMap.value = this.renderTargetRight.texture;
    uniforms.centerCoordinate.value.x = 0.5;
    renderer.render( this.scene, this.camera );
  }
 

  // Delete offscreen buffer on dispose
  this.dispose = function() {
        if ( this.renderTargetRight ) this.renderTargetRight.dispose();
        if ( this.renderTargetLeft ) this.renderTargetLeft.dispose();
    };

}
