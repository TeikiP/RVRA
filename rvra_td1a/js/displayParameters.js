var displayParameters = {
  // parameters for stereo rendering

  // physical screen diagonal -- in mm
  screenDiagonal: 130, //812.69,
  screenResolutionWidth: 1920, //2560,
  aspectRatio: 1920.0/1080.0, //16.0 / 9.0,

  // focal lens distance -- in mm
  fld: 45,
  
  // lens diameter -- in mm
  lensDiameter: 25,
  
  // inter pupilar distance -- in mm
  ipd: 60,
  
  // screen to lens distance -- in mm
  sld: 42,
  
  // eye relief - in mm
  relief: 10,

  // distance between the viewer and the screen -- in mm
  distanceScreenViewer: function() {
    //return Math.abs(1 / (1 / this.fld - 1 / this.sld));
    return 800; //default
  },
  
  // magnification factor of the lens
  lensMagnification: function() {
    return this.fld / (this.fld - this.sld);
  },

  // amount of distance in mm between adjacent pixels
  pixelPitch: function() {
    var screenResolutionHeight = this.screenResolutionWidth / this.aspectRatio;
    var screenResolutionDiagonal = Math.sqrt(this.screenResolutionWidth * this.screenResolutionWidth + screenResolutionHeight * screenResolutionHeight);
    var ratio = this.screenDiagonal / screenResolutionDiagonal;
    
    return ratio;
  },

  // physical display width and height -- in mm
  screenSize: function() {
    var screenWidth = this.screenResolutionWidth * this.pixelPitch();
    var screenHeight = this.screenResolutionWidth / this.aspectRatio * this.pixelPitch();
    
    //return new THREE.Vector2(screenWidth, screenHeight); //phone computed values
    //return new THREE.Vector2(113, 65); //phone hard values
    return new THREE.Vector2(708,399); //default
  }
  
};
