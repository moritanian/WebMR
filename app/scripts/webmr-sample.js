$(function(){

  // カメラ系
  const cameraParams ={
    fov: 55,
    near: 0.5,
    far: 3000000
  }

  let camera, scene;
  initScene();


  function initScene(antialias){
    let container = document.createElement( 'div' );
    container.style.position = "absolute";
    container.style.right = "0";
    container.style.left = "0";
    container.style.top = "0";
    container.style.bottom = "0";
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({antialias: antialias ? true : false});
    renderer.domElement.style.position = "relative";
    renderer.domElement.style.left = "-4px";

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.shadowMap.enabled = true;
    //renderer.gammaInput = true;
    //renderer.gammaOutput = true;
    container.appendChild( renderer.domElement );
    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera( cameraParams.fov, window.innerWidth / window.innerHeight, cameraParams.near, cameraParams.far );
    camera.position.set(0,0,0);
    scene.add(camera);

    // light
    scene.add( new THREE.AmbientLight( 0xaaaaaa ) );
    var light = new THREE.DirectionalLight( 0xffffbb, 1 );
    light.position.set( - 1, 1, - 1 );
    scene.add( light );

    let group = new THREE.Group();
    scene.add( group );
    var geometries = [
      new THREE.BoxGeometry( 0.2, 0.2, 0.2 ),
      new THREE.ConeGeometry( 0.2, 0.2, 64 ),
      new THREE.CylinderGeometry( 0.2, 0.2, 0.2, 64 ),
      new THREE.IcosahedronGeometry( 0.2, 3 ),
      new THREE.TorusGeometry( 0.2, 0.04, 64, 32 )
    ];
    for ( var i = 0; i < 40; i ++ ) {
      var geometry = geometries[ Math.floor( Math.random() * geometries.length ) ];
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
        //

    WebMR.start(renderer, camera, scene, container, animate);
  }

  function animate(){

  }

});
