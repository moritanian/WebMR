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

  // webVR Enter button
  /*
  var webvrEnterButton = document.createElement("button");
  webvrEnterButton.id = "vr-enter-button";
  webvrEnterButton.classList.add("vr-enter-button");
  webvrEnterButton.addEventListener("click", function(){
    WebVRSetting.init(renderer, camera, scene, "./../images/controllers/", {
     // useStereoVR: true,
      //useHeadsetVR: false
    });
    WebMR.setFullScreen(container);
  });

  document.body.appendChild(webvrEnterButton);
  */

  // screen shot button
  var takeButton = document.getElementById("take-button");
  takeButton.addEventListener("click", function(){

    screenShot();

  });

  /*
    setup UI
  */
  function initUI(effectTheme){
    
    // character button is hide if selectable models donot exist.
    if(Object.keys(effectTheme.getModels()).length < 2){
      $("#character-button").hide();
    }
    // model info
    $("#model-info").html(effectTheme.getModelInfo());

  }


  /*
    screenshot
  */
  function screenShot(){
    var context = renderer.domElement.getContext("experimental-webgl", {preserveDrawingBuffer: true});
    var url = renderer.domElement.toDataURL('image/png');
    var d = new Date();
    var u_time = Math.floor((d.getTime())/1000);
    var filename = "webmr" + u_time + ".png";
    download(url, filename);
  }

  function download(objectURL, filename) {
    var a = document.createElement('a');
    var e = document.createEvent('MouseEvent');
    //console.log(objectURL);

    //a要素のdownload属性にファイル名を設定
    a.download = filename;
    a.href = objectURL;

    //clickイベントを着火
    e.initEvent("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
  }

  /* 
    reset button
  */
  var resetButton = document.getElementById("reset-button");
  resetButton.addEventListener("click", function(){
    WebMR.resetControls();
  });

  /*
     character button
  */
  var characterButton = document.getElementById("character-button");
  var characterDialog = document.getElementById("character-dialog");
  characterButton.addEventListener("click", function(){

    characterDialog.classList.toggle("show");

  });

  document.addEventListener("click", function(){
    //characterDialog.style.display = "none";
  });

  var addCharacterSelectDialog = function(){

    var charactersContainer = document.getElementById("characters-container");

    return function(model){

      var characterElement = document.createElement("span");

      characterElement.classList.add("character-element");

      // <img>
      var imgElement = document.createElement("img");

      imgElement.setAttribute("src", model.imageUrl);

      imgElement.classList.add("character-img");

      characterElement.appendChild(imgElement);

      // <div> name </div>
      var nameElement = document.createElement("div");

      nameElement.classList.add("model-name");

      nameElement.innerHTML = model.name;

      characterElement.appendChild(nameElement);

      characterElement.addEventListener('click', function(){

        characterDialog.classList.toggle("show");

        targetModel.mesh.visible = false;

        if(targetModel.objectControl) {

          targetModel.objectControl.enabled = false;

        }

        model.mesh.visible = true;

        targetModel = model;

        if(!model.objectControl){

          model.objectControl = new THREE.TrackObjectControls(model.mesh, camera, renderer.domElement);

        } else {
          model.objectControl.enabled = true;
        }
      });

      charactersContainer.appendChild(characterElement);

    };

  }();

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

    group = new THREE.Group();
    scene.add( group );

    var onProgress = function ( xhr ) {
      if ( xhr.lengthComputable ) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log( Math.round(percentComplete, 2) + '% downloaded' );
      }
    };

    var onError = function ( xhr ) {
    };

    var xPos = -10.0;

    var onLoad = function(mesh, model){

      if(mesh.geometry){
        // 回転中心をずらす
        mesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, - 10.0 , 0.5) );
      
      }

      let scale = 0.36;

      if(model.size){
        scale = model.size;
      }
    

      mesh.position.y = 0.0;
      mesh.position.x = 0;
      mesh.position.z = 0.0; //- 8.0;
      mesh.scale.multiplyScalar(scale);

      //mesh.rotation.x = Math.PI * 0.2;
      //mesh.rotation.y = Math.PI * 0.5;
      //xPos += 10.0;

      //makePhongMaterials ( mesh )

      group.add( mesh );

      model.mesh = mesh;

      console.log(model);

      mesh.visible = model.visible;

      if (mesh.visible)
      {

        targetModel = model;

        model.objectControl = new THREE.TrackObjectControls(mesh, camera, renderer.domElement);

      }

    };

    function loadMMD(mmdModel){

      if(mmdModel.vmdFiles && mmdModel.vmdFiles.length > 0) {


        loader.load( mmdModel.modelFile, mmdModel.vmdFiles, function(mesh){

          onLoad(mesh, mmdModel);

        }, onProgress, onError );


      } else {

        loader.loadModel( mmdModel.modelFile, function(mesh){
          onLoad(mesh, mmdModel);
        }, onProgress, onError );

      }

     
    }

    function loadObj(model){
      
      new THREE.OBJLoader().load( model.modelFile, 
        // called when resource is loaded
        function ( object ) {

          onLoad(object, model);
          
        },
        // called when loading is in progresses
        function ( xhr ) {

          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

          console.log( 'An error happened' );

        } 
      );
    }

    function loadJSON(model){
      let loader = new Loader();

      loader.loadFile(model.modelFile).then((obj)=>{

        onLoad(obj, model);

      });
    }

    
    //effectTheme = new ChristmasTheme(scene);
    effectTheme = new NormalTheme(scene);
    //effectTheme = new NewyearTheme(scene);

    initUI(effectTheme);

    let models = effectTheme.getModels();

    var loader = new THREE.MMDLoader();

    for (var id in models){

      var model = models[id];

      let modelFile = model.modelFile;
      let extension = modelFile.split( '.' ).pop().toLowerCase();

      switch(extension){
        case 'pmd':
        case 'pmx':
          loadMMD(model);
          break;

        case 'obj':
          loadObj(model);
          break;

        case 'json':
          loadJSON(model);
          break;

      }

      if(model.imageUrl){

        addCharacterSelectDialog(model);

      }

    }

    function makePhongMaterials ( mesh ) {

      var materials = mesh.material;

      var array = [];

      for ( var i = 0, il = materials.length; i < il; i ++ ) {

        var m = new THREE.MeshPhongMaterial();
        m.copy( materials[ i ] );
        m.needsUpdate = true;

        array.push( m );

      }

      mesh.originalMaterial = materials;
      mesh.material = array;

      return array;

    }

    var geometries = [
      new THREE.BoxGeometry( 0.2, 0.2, 0.2 ),
      new THREE.ConeGeometry( 0.2, 0.2, 64 ),
      new THREE.CylinderGeometry( 0.2, 0.2, 0.2, 64 ),
      new THREE.IcosahedronGeometry( 0.2, 3 ),
      new THREE.TorusGeometry( 0.2, 0.04, 64, 32 )
    ];
    for ( var i = 0; i < 0; i++ ) {
      var geometry = geometries[
        Math.floor( Math.random() * geometries.length )
      ];

      var material = new THREE.MeshStandardMaterial( {
        color: Math.random() * 0xffffff,
        roughness: 0.7,
        metalness: 0.0
      } );
      var object = new THREE.Mesh( geometry, material );
      object.position.x = Math.random() * 4 - 2;
      object.position.y = Math.random() * 2 - 1;
      object.position.z = Math.random() * 4 - 2;
      object.rotation.x = Math.random() * 2 * Math.PI;
      object.rotation.y = Math.random() * 2 * Math.PI;
      object.rotation.z = Math.random() * 2 * Math.PI;
      object.scale.setScalar( Math.random() + 0.5 );
      object.castShadow = true;
      object.receiveShadow = true;
      group.add( object );
    }

    //WebMR.start(renderer, camera, scene, container, animate, WebMR.CAMERA_MODE_ORIENTATION);
  }

  /**
  * animate function.
  */
  function animate(){

    effectTheme.update();

    if(objectControl){

      //objectControl.update();

    }
  }

  initScene(true);
  WebVRSetting.init(renderer, camera, scene, "./../images/controllers/", {
      useStereoVR: true,
      useHeadsetVR: false
    });

  WebMR.start(renderer, camera, scene, container, animate, WebMR.CAMERA_MODE_DEVICECAM);

});
