var camera, scene, renderer, controls;

var anaglyphRenderer, dofRenderer, stereoRenderer;

var container, stats;

var isMobile = mobileCheck();

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);  

  // camera
  var screenSize = displayParameters.screenSize();
  var fov = 2.0 *
      THREE.Math.radToDeg(Math.atan(
          screenSize.y / (2.0 * displayParameters.distanceScreenViewer())));
  camera =
      new THREE.PerspectiveCamera(fov, screenSize.x / screenSize.y, 10, 10000);
  camera.position.set(0, 0, displayParameters.distanceScreenViewer());
  
  
  // device orientation controls for mobile browsers
  if (isMobile)
    controls = new THREE.DeviceOrientationControls(camera);    

  // objects

  var teapotGeometry =
      new THREE.TeapotBufferGeometry(65, 65, true, true, true, true, false);

  var materialColor = new THREE.Color();
  materialColor.setRGB(1.0, 1.0, 1.0);
  var teapotMaterial = new THREE.MeshStandardMaterial({
    color: materialColor,
    side: THREE.DoubleSide,
    roughness: 0.75,
    metalness: 0.65
  });

  var teapot1 = new THREE.Mesh(teapotGeometry, teapotMaterial);
  teapot1.position.x = 100;
  teapot1.position.z = 150;
  var teapot2 = new THREE.Mesh(teapotGeometry, teapotMaterial);
  teapot2.position.x = 50;
  teapot2.position.y = 175;
  teapot2.position.z = -300;
  var teapot3 = new THREE.Mesh(teapotGeometry, teapotMaterial);
  teapot3.position.x = -100;
  teapot3.position.y = -120;
  teapot3.position.z = -150;
  var teapot4 = new THREE.Mesh(teapotGeometry, teapotMaterial);
  teapot4.position.x = -250;
  teapot4.position.y = 100;

  scene = new THREE.Scene();
  scene.add(teapot1);
  scene.add(teapot2);
  scene.add(teapot3);
  scene.add(teapot4);

  var texture = new THREE.TextureLoader().load('textures/grid.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  var wallMaterial =
      new THREE.MeshLambertMaterial({map: texture, side: THREE.DoubleSide});

  var ground = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(800, 800)
          .rotateX(-Math.PI / 2)
          .rotateY(-Math.PI / 4),
      wallMaterial);
  ground.position.set(0, -201, 0);
  scene.add(ground);

  var rightWall = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(800, 800).rotateY(Math.PI / 4),
      wallMaterial);
  rightWall.position.set(-283, 0, -283);
  scene.add(rightWall);

  var leftWall = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(800, 800).rotateY(-Math.PI / 4),
      wallMaterial);
  leftWall.position.set(283, 0, -283);
  scene.add(leftWall);

  // lights

  ambientLight = new THREE.AmbientLight(0x333333);
  directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
  directionalLight.position.x = -0.75;
  directionalLight.position.y = 0.6;
  directionalLight.position.z = 1;
  directionalLight.position.normalize();
  scene.add(ambientLight);
  scene.add(directionalLight);

  // renderers
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  renderer.autoClear = false;

  anaglyphRenderer = new AnaglyphRenderer(renderer);
  dofRenderer = new DoFRenderer(renderer);
  stereoRenderer = new StereoRenderer(renderer);

  // stats

  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  dofRenderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  renderer.clear();
  
  if (isMobile)
    controls.update();

  //renderer.render(scene, camera);
  anaglyphRenderer.render(scene, camera);
  //stereoRenderer.render(scene, camera);

  stats.update();
}
