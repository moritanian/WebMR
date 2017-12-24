/**
 * @author moritanian
 * webmr
 *
 **/

/* *************************************************************
 *  WebMR
 ************************************************************* */

var WebMR = (function(){

  let video, camController, videoImage,
    videoImageContext, videoTexture, cameraPlane,
    videoWidth, videoHeight;

  var controls;


  let WebMR = {};

  // camera control mode
  WebMR.CAMERA_MODE_ORIENTATION = Symbol("CAMERA_MODE_ORIENTATION");
  WebMR.CAMERA_MODE_DEVICECAM = Symbol("CAMERA_MODE_DEVICECAM");

  WebMR.getWebcamTexture = function(){

    return new Promise(function(resolve, reject){

      var tex;
      video = document.createElement('video');
      video.autoplay = 'autoplay';
      camController = new camera_controller(video);
      camController.startCamera();

      videoImage = document.createElement('canvas');
      videoImageContext = videoImage.getContext('2d');
      videoImageContext.fillStyle = '#008800';
      videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);

      function loadedDataFunc(){
        video.removeEventListener('loadeddata', loadedDataFunc);
        resolve(_createTexture());
      }

      camController.addLoadedEventListener(loadedDataFunc);
      //video.addEventListener("loadeddata", loadedDataFunc);

    });

    function _createTexture(){

      videoWidth = video.videoWidth;
      videoHeight = video.videoHeight;

      videoImageContext.fillRect(0, 0, videoWidth, videoHeight);
      videoImage.width = videoWidth;
      videoImage.height = videoHeight;

      videoTexture = new THREE.Texture(videoImage);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;

      return new THREE.MeshBasicMaterial({map: videoTexture, color: 0xFFFFFF});

    }

  };

  WebMR.createCameraPlane = function(size, camera){

    return new Promise(function(resolve, reject){

      WebMR.getWebcamTexture()
        .then(function(tex){

        console.log("loaded webcam texture");
        console.log(size * videoHeight / videoWidth);

        let geometry = new THREE.PlaneGeometry(size, size * videoHeight / videoWidth);

        let mesh = new THREE.Mesh(geometry, tex);

        var forward = new THREE.Vector3(0, 0, - 1.0);

        forward.applyQuaternion(camera.quaternion);

        forward.multiplyScalar(20.0);

        forward.add(camera.position);

        //var q = new THREE.Quaternion();

        //q.setFromEuler(new THREE.Euler(0, Math.PI, 0 ,'YXZ'));

        //mesh.applyQuaternion(q);

        mesh.position.copy(forward);

        mesh.applyQuaternion(camera.quaternion);

        console.log(camera.position);
        console.log(mesh.position);

        camera.add(mesh);

        cameraPlane = mesh;

        resolve(mesh);

      });
    });


  };

  WebMR.resizeCameraPlane = function(size, camera) {

    cameraPlane.scale.x = size;
    cameraPlane.scale.y = size;

  };

  WebMR.start = function(renderer, camera, scene, container, animate, cameraMode){

    window.addEventListener('resize', resize, false);

    WebVRSetting.init(renderer, camera, scene, "./../images/controllers/", {
      useStereoVR: false,
      useHeadsetVR: false
    });

    if( cameraMode === WebMR.CAMERA_MODE_DEVICECAM) {

      WebMR.createCameraPlane(10, camera).then(function(){

        //controls = new WebMR.DeviceCameraControls(camera, video, videoImage);

        controls = new WebMR.DeviceCameraOrientationControls (camera, video, videoImage);

      });

    } else {

      this.createCameraPlane(10, camera);

      controls = new THREE.OrbitControls(camera, renderer.domElement);

      // controls.rotateUp(Math.PI / 4);
      controls.target.set(
        camera.position.x,
        camera.position.y,
        camera.position.z - 0.1
      );
      controls.noZoom = true;
      controls.noPan = true;

      function setOrientationControls(e) {

        if (!e.alpha) {
          return;
        }

        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();
        renderer.domElement.addEventListener('click', () => {
          WebMR.setFullScreen(container);
        }, false);

        window.removeEventListener('deviceorientation',
          setOrientationControls, true);

      }

      window.addEventListener('deviceorientation',
        setOrientationControls, true);

    }

    WebVRSetting.startLoop(scene, camera, function(){

      if(cameraMode === WebMR.CAMERA_MODE_ORIENTATION){

        videoImageContext.drawImage(video, 0, 0,
          videoImage.width, videoImage.height);

      }


      if (videoTexture) {

        videoTexture.needsUpdate = true;

      }

      if(controls){

        controls.update();

      }

      animate();

    });

    function resize() {

      var width = container.offsetWidth;
      var height = container.offsetHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      //camera.remove(cameraPlane);
      //WebMR.createCameraPlane(15, camera);
      WebMR.resizeCameraPlane(width/ 1000.0, camera);
      WebVRSetting.effect.setSize(width, height);

    }

  };

  let nop = function(){};

  /* screen 系*/
  WebMR.setFullScreen = function(container, startFunc, endFunc,
    failedFunc, lockMode = "landscape"){

    startFunc = startFunc ? startFunc : nop;
    endFunc = endFunc ? endFunc : nop;
    failedFunc = failedFunc ? failedFunc : nop;

    container.requestFullscreen = container.requestFullscreen ||
      container.mozRequestFullScreen ||
      container.webkitRequestFullScreen ||
      container.webkitRequestFullscreen ||
      container.msRequestFullscreen;

    let fullScreenChangeList = [
      "fullscreenchange",
      "mozfullscreenchange",
      "webkitfullscreenchange",
      "MSFullscreenchange"
    ];

    document.fullscreenEnabled = document.fullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.msFullscreenEnabled;

    let fullScreenErrorList = [
      "fullscreenerror",
      "webkitfullscreenerror",
      "mozfullscreenerror",
      "MSFullscreenError"
    ];

    container.requestFullscreen();

    let changedFuc = function( event ) {
      if (document.fullscreenEnabled) {
        if (lockMode)
          WebMR.lockOrientation(lockMode);
        startFunc();
      } else
        endFunc();
    };

    let errFunc = function(event){
      failedFunc();
    };

    for (let index in fullScreenChangeList){
      container.addEventListener(fullScreenChangeList[index], changedFuc);

      container.addEventListener(fullScreenErrorList[index], errFunc);
    }
    // setTimeout(resize, 2000);

  };

  WebMR.lockOrientation = function(mode) {
    console.log("lockOrientation");
    if (screen.orientation.lock) {
      screen.orientation.lock(mode).catch(function(e) {
        console.log(e);
      });
    } else if (screen.lockOrientation) {
      screen.lockOrientation(mode).catch(function(e) {
        console.log(e);
      });
    } else if (screen.webkitLockOrientation) {
      screen.webkitLockOrientation(mode).catch(function(e) {
        console.log(e);
      });
    } else if (screen.mozLockOrientation) {
      screen.mozLockOrientation(mode).catch(function(e) {
        console.log(e);
      });
    } else if (screen.msLockOrientation) {
      screen.msLockOrientation(mode).catch(function(e) {
        console.log(e);
      });
    }
  };

  /*
    movement is controlled by device camera
    ratation is controlled by device orientation
  */

  WebMR.DeviceCameraOrientationControls = function(object, video, canvas){

    this.object = object;

    this.deviceCameraConrols = new WebMR.DeviceCameraControls(object, video, canvas);

    this.deviceOrientationControls = new WebMR.DeviceOrientationControls(object);

    this.deviceCameraConrols.connect();

    this.deviceOrientationControls.connect();

    var target = new THREE.Vector3();

    var forward = new THREE.Vector3(0, 0, 1.0);

    this.update = function(){

      var moveVec3 = this.deviceCameraConrols.update();

      target.add(moveVec3);

      this.deviceOrientationControls.update();

      var distance = target.clone()
        .sub(this.object.position)
        .length();

      var distVec = forward.clone()
        .applyQuaternion(this.object.quaternion)
        .multiplyScalar(distance)
        .add(target);

      this.object.position.set(distVec.x, distVec.y, distVec.z);

    };

    this.connect = function(){

      this.deviceCameraConrols.connect();

      this.deviceOrientationControls.connect();

    };

    this.disconnect = function(){

      this.deviceCameraConrols.disconnect();

      this.deviceOrientationControls.disconnect();

    };

    this.reset = function(_target){

      target = _target || new THREE.Vector3();

      this.deviceCameraConrols.reset();

    };

  };

  /*
    control by device camera.
  */

  WebMR.DeviceCameraControls = function(object, video, canvas){

    var scope = this;

    var initPosition = object.position.clone();

    var initRotation = object.rotation.clone();

    this.object = object;

    this.object.rotation.reorder( "YXZ" );

    this.enabled = true;

    this.deviceOrientation = {};
    this.screenOrientation = 0;

    this.alpha = 0;
    this.alphaOffsetAngle = 0;

    this.screenFlowControl = new screen_flow_control(video, 2, canvas);

    var oldOffset = new THREE.Vector3();

    this.connect = function() {

      scope.enabled = true;

    };

    this.disconnect = function() {

      scope.enabled = false;

    };


    this.update = function() {

      return function(){

        if ( scope.enabled === false ) return;

        this.screenFlowControl.update();

        var flow = this.screenFlowControl.get_data();

        var offset = flow.move;

        var rot = flow.rot;

        var scale = 0.01;

        var x = - (offset.x - oldOffset.x) * scale;

        var y = (offset.y - oldOffset.y) * scale;

        var z = - (offset.z - oldOffset.z) * scale;

        var v = new THREE.Vector3(x, y, z);

        v.applyQuaternion(scope.object.quaternion);

        scope.object.position.add(v);

        oldOffset = offset;

        return v;

      };

    }();

    this.dispose = function() {

      this.disconnect();

    };

    this.reset = function(){

      oldOffset = new THREE.Vector3();

      this.screenFlowControl.reset();

    };

    this.connect();

  };

  /**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */
  WebMR.DeviceOrientationControls = function(object){

    var scope = this;

    var orientationChanaged = false;

    this.object = object;
    this.object.rotation.reorder( "YXZ" );

    this.enabled = true;

    this.deviceOrientation = {
      alpha: 0,
      beta: 90,
      gamma: 0
    };
    this.screenOrientation = 0;

    this.alpha = 0;
    this.alphaOffsetAngle = 0;


    var onDeviceOrientationChangeEvent = function( event ) {

      scope.deviceOrientation = event;

      if(!orientationChanaged){

        orientationChanaged = true;

        //scope.alphaOffsetAngle = - THREE.Math.degToRad( scope.deviceOrientation.alpha);

      }

    };

    var onScreenOrientationChangeEvent = function() {

      scope.screenOrientation = window.orientation || 0;

    };

    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

    var setObjectQuaternion = function() {

      var oldAlpha = 0.0, oldBeta = Math.PI/ 2.0, oldGamma = 0.0;

      var zee = new THREE.Vector3( 0, 0, 1 );

      var euler = new THREE.Euler();

      var q0 = new THREE.Quaternion();

      var q1 = new THREE.Quaternion();
      q1.setFromEuler(new THREE.Euler(- Math.PI/2.0, 0, 0 ,'YXZ'));
      //var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

      return function( quaternion, alpha, beta, gamma, orient ) {
/*
        euler.set(  beta - oldBeta,  alpha - oldAlpha, - gamma + oldGamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us
        //euler.set(  - beta + oldBeta,  - alpha + oldAlpha,  gamma - oldGamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

        quaternion.multiply( q0.setFromEuler(euler) ); // camera looks out the back of the device, not the top
*/
        euler.set(  beta,  alpha , - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

        quaternion.setFromEuler( euler ); // orient the device

        quaternion.multiply( q1 ); // camera looks out the back of the device, not the top

        quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation

        oldAlpha = alpha;

        oldBeta = beta;

        oldGamma = gamma;
      };

    }();

    this.connect = function() {

      onScreenOrientationChangeEvent(); // run once on load

      window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
      window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

      scope.enabled = true;

    };

    this.disconnect = function() {

      window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
      window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

      scope.enabled = false;

    };

    this.update = function() {

      if ( scope.enabled === false ) return;

      var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) + this.alphaOffsetAngle : 0; // Z
      var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad( scope.deviceOrientation.beta ) : 0; // X'
      var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
      var orient = scope.screenOrientation ? THREE.Math.degToRad( scope.screenOrientation ) : 0; // O

      setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
      this.alpha = alpha;

    };

    this.updateAlphaOffsetAngle = function( angle ) {

      this.alphaOffsetAngle = angle;
      this.update();

    };

    this.dispose = function() {

      this.disconnect();

    };

    this.connect();

  };

  WebMR.resetControls = function()
  {

    if(controls){

      controls.reset();

    }

  };

  return WebMR;
})();
