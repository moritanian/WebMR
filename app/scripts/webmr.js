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

  return {
    getWebcamTexture: function(callback){
      var tex;
      video = document.createElement('video');
      video.autoplay = 'autoplay';
      camController = new camera_controller(video);
      camController.startCamera();

      videoImage = document.createElement('canvas');
      videoImageContext = videoImage.getContext('2d');
      videoImageContext.fillStyle = '#008800';
      videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);

      function _createTexture(){
        // TODO callbackでできるのでは？？
        if (video.videoHeight === 0){
          setTimeout(_createTexture, 100);
          return;
        }

        videoWidth = video.videoWidth;
        videoHeight = video.videoHeight;

        videoImageContext.fillRect(0, 0, videoWidth, videoHeight);
        videoImage.width = videoWidth;
        videoImage.height = videoHeight;

        videoTexture = new THREE.Texture(videoImage);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;

        tex = new THREE.MeshBasicMaterial({map: videoTexture, color: 0xFFFFFF});
        callback(tex);
      }
      _createTexture();
    },

    createCameraPlane: function(size, camera){
      WebMR.getWebcamTexture(function(tex){
        console.log(size * videoHeight / videoWidth);
        let geometry = new THREE.PlaneGeometry(size, size * videoHeight / videoWidth);
        let mesh = new THREE.Mesh(geometry, tex);
        mesh.position.set(0, 0, -11);
        camera.add(mesh);
        cameraPlane = mesh;
      });
    },

    start: function(renderer, camera, scene, container, animate){

      window.addEventListener('resize', resize, false);

      WebVRSetting.init(renderer, camera, scene, "./../images/controllers/", {
        useStereoVR: true,
        useHeadsetVR: false
      });

      this.createCameraPlane(10, camera);

      var controls = new THREE.OrbitControls(camera, renderer.domElement);
      // controls.rotateUp(Math.PI / 4);
      controls.target.set(
        camera.position.x,
        camera.position.y,
        camera.position.z + 0.1
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

      WebVRSetting.startLoop(scene, camera, function(){
        videoImageContext.drawImage(video, 0, 0,
          videoImage.width, videoImage.height);

        if (videoTexture) {
          videoTexture.needsUpdate = true;
        }
        controls.update();
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
  };
})();
