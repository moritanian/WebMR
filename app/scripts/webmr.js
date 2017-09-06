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

        console.log(size * videoHeight / videoWidth);

        let geometry = new THREE.PlaneGeometry(size, size * videoHeight / videoWidth);

        let mesh = new THREE.Mesh(geometry, tex);

        mesh.position.set(0, 0, -11);

        camera.add(mesh);

        cameraPlane = mesh;

        resolve(mesh);

      });
    });


  }

  WebMR.start = function(renderer, camera, scene, container, animate, cameraMode){

    window.addEventListener('resize', resize, false);

    WebVRSetting.init(renderer, camera, scene, "./../images/controllers/", {
      useStereoVR: true,
      useHeadsetVR: false
    });


    var controls;

    if( cameraMode === WebMR.CAMERA_MODE_DEVICECAM) {

      WebMR.createCameraPlane(10, camera).then(function(){

        controls = new WebMR.DeviceCameraControls(camera, video, videoImage);

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
          setFullScreen();
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
      camera.remove(cameraPlane);
      WebMR.createCameraPlane(15, camera);
      WebVRSetting.effect.setSize(width, height);
    }

    let nop = function(){};

    /* screen 系*/
    function setFullScreen(startFunc, endFunc,
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
            lockOrientation(lockMode);
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

    }

    function lockOrientation(mode) {
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
    }
  }

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

    this.screenFlowControl = new  screen_flow_control(video, 2, canvas);

    var setObjectQuaternion = function() {

      var zee = new THREE.Vector3( 0, 0, 1 );

      var euler = new THREE.Euler();

      var q0 = new THREE.Quaternion();

      var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

      return function( quaternion, alpha, beta, gamma, orient ) {

        euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

        quaternion.setFromEuler( euler ); // orient the device

        quaternion.multiply( q1 ); // camera looks out the back of the device, not the top

        quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation

      }

    }();

    this.connect = function() {

      scope.enabled = true;

    };

    this.disconnect = function() {

      scope.enabled = false;

    };

    this.update = function() {

      if ( scope.enabled === false ) return;

      this.screenFlowControl.update();

      var flow = this.screenFlowControl.get_data();

      var offset = flow.move;
      var rot = flow.rot;


      var scale = 0.01;

      var pos = new THREE.Vector3(-offset.x * scale, offset.y*scale, offset.z * scale);

      pos.add(initPosition);

      scope.object.position.set(pos.x, pos.y, pos.z);

      /*
      var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) + this.alphaOffsetAngle : 0; // Z
      var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad( scope.deviceOrientation.beta ) : 0; // X'
      var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
      var orient = scope.screenOrientation ? THREE.Math.degToRad( scope.screenOrientation ) : 0; // O

      setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
      this.alpha = alpha;
    */
    };

    this.dispose = function() {

      this.disconnect();

    };

    this.connect();

  }

  return WebMR;
})();
