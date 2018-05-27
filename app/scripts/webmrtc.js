$(function() {

  // カメラ系
  const cameraParams = {
    fov: 55,
    near: 0.5,
    far: 3000000
  };

  let camera, scene, renderer, container;
  let objectControl, targetModel, group;
  let effectTheme;

 
  let connected_callback = function(){}
  let msg_get_callback = function(){}
  let closed_callback = function(){}
  let socket_connected_callback = function(){}
  let channelName = "kingyo_room";
  let rtc = new Chanel(connected_callback, 
        msg_get_callback, closed_callback, channelName, socket_connected_callback);
  rtc.onaddremotestream = function(id, stream){
    WebMR.createStreamVideoPlane(20.0, camera, stream); 
  };

  /**
  * Initialize the scene.
  * @param {bool} antialias exec antialias
  */
  function initScene(antialias){
    container = document.createElement( 'div' );
    container.style.position = "absolute";
    container.style.right = "0";
    container.style.left = "0";
    container.style.top = "0";
    container.style.bottom = "0";
    container.style.overflow = "hidden";
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({antialias: antialias === true, preserveDrawingBuffer: true});
    renderer.domElement.id = "canvas";
    renderer.domElement.style.position = "relative";

    //renderer.domElement.style.left = "-4px";

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.shadowMap.enabled = true;
    // renderer.gammaInput = true;
    // renderer.gammaOutput = true;
    container.appendChild( renderer.domElement );
    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera(
        cameraParams.fov,
        window.innerWidth / window.innerHeight,
        cameraParams.near,
        cameraParams.far );

    camera.position.set(0, 0,  8.0);
    scene.add(camera);

    // light
    scene.add( new THREE.AmbientLight( 0x666666 ) );
    var light = new THREE.DirectionalLight( 0x888888, 1 );
    light.position.set( -1, 1, -1 );
    scene.add( light );

   /*  let box = new THREE.Mesh(
        new THREE.BoxGeometry(50, 50, 50),
        new THREE.MeshLambertMaterial({color: 0xff0000})
    );
    box.position.set(0.5, 0.5, 0.5);
    scene.add(box);
  */
    
  }

  /**
  * animate function.
  */
  function animate(){
  }

  initScene(true);
 WebVRSetting.init(renderer, camera, scene, "./../images/controllers/", {
      useStereoVR: false,
      useHeadsetVR: true
    });
  WebMR.start(renderer, camera, scene, container, animate, WebMR.CAMERA_MODE_REMOTESTREAM);

});
