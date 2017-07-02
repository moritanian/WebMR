/*
	VR Setup class

	TODO: domベースでコントロールパネルだす
		viveコントローラで姿勢

	- html-gl
	html2canvas使っている

	- dreamgl これ使えばwebVRのUIできるかも
	https://github.com/dreemproject/dreemgl

	- 以下で3Dモデル入手場所書かれている
	https://aframe.io/docs/0.5.0/introduction/models.html
	skech fab - download できるものはCreative Commons License

	- websocket real time communication
	https://deepstream.io./
	- cannon.js
	http://qiita.com/o_tyazuke/items/3481ef1a31b2a4888f5d
	- google experiments
	http://www.moguravr.com/google-webvr-experiments/

*/
var WebVRSetting = {
  init: function(renderer, camera, scene, path, options){
    var Instance = this;
    Object.assign(this, THREE.EventDispatcher.prototype);

    options = options || {};
    this.useHeadsetVR = options.useHeadsetVR === null ||
      options.useHeadsetVR === true;

    this.useStereoVR = options.useStereoVR === true;
    if ( !this.useHeadsetVR || WEBVR.isAvailable() === false ) {
      this.useHeadsetVR = false;
      if (options.useStereoVR){
        console.log("useStereoVR");
        this.effect = new THREE.StereoEffect( renderer );
        this.effect.setSize( window.innerWidth, window.innerHeight );
        return true;
      }
      this.effect = renderer;
      return false;
    }

    this.controls = new THREE.VRControls( camera );
    this.controls.standing = true;

    this.controller1 = new THREE.ViveController( 0 );
    this.controller1.standingMatrix = this.controls.getStandingMatrix();
    this.controller1.addEventListener( 'triggerdown', function(event){
      Instance.dispatchEvent({
        type: "triggerchange",
        trigger: "down",
        controller: Instance.controller1,
        triggerEvent: event
      });
    });
    this.controller1.addEventListener( 'triggerup', function(event){
      Instance.dispatchEvent({
        type: "triggerchange",
        trigger: "up",
        controller: Instance.controller1,
        triggerEvent: event
      });
    });
    scene.add( this.controller1 );

    this.controller2 = new THREE.ViveController( 1 );
    this.controller2.standingMatrix = this.controls.getStandingMatrix();
    this.controller2.addEventListener( 'triggerdown', function(event){
      Instance.dispatchEvent({
        type: "triggerchange",
        trigger: "down",
        controller: Instance.controller2,
        triggerEvent: event
      });
    });
    this.controller2.addEventListener( 'triggerup', function(event){
      Instance.dispatchEvent({
        type: "triggerchange",
        trigger: "up",
        controller: Instance.controller2,
        triggerEvent: event
      });
    });
    scene.add( this.controller2 );

    var loader = new THREE.OBJLoader();
    loader.setPath( 'https://threejs.org/examples/models/obj/vive-controller/' );

    loader.load( 'vr_controller_vive_1_5.obj', function (object ) {
      var loader = new THREE.TextureLoader();
      loader.setPath( path );

      var controller = object.children[0];
      controller.material.map = loader.load( 'onepointfive_texture.png' );
      controller.material.specularMap = loader.load( 'onepointfive_spec.png' );

      Instance.controller1.add( object.clone() );
      Instance.controller2.add( object.clone() );
    });

    var geometry = new THREE.Geometry();
    geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( 0, 0, -1 ) );

    var line = new THREE.Line( geometry );
    line.name = 'line';
    line.scale.z = 5;

    this.controller1.add( line.clone() );
    this.controller2.add( line.clone() );

    this.raycaster = new THREE.Raycaster();

    this.effect = new THREE.VREffect( renderer );

    WEBVR.getVRDisplay( function( display ) {
      let button = WEBVR.getButton( display, renderer.domElement );
      button.style.right = "10px";
      button.style.left = "auto";
      document.body.appendChild(button );
    });

    window.addEventListener( 'resize', onWindowResize, false );

    this.intersected = [];

    this.tempMatrix = new THREE.Matrix4();

    this.intersectableObjects = new THREE.Group();

    // シーンに追加する必要ある？
    scene.add(this.intersectableObjects);

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      Instance.effect.setSize( window.innerWidth, window.innerHeight );

    }

    return true;

  },

  setIntersectableObjects: function(objects){
    for (let i = 0; i < objects.length; i++){
      this.intersectableObjects.add(objects[i]);
    }
  },

  cleanIntersected: function(){

    while ( this.intersected.length ) {

      var object = this.intersected.pop();

      object.material.emissive.r = 0;

    }

  },

	// コントローラに指示されているオブジェクト取得
  getIntersections: function( controller ) {

    this.tempMatrix.identity().extractRotation( controller.matrixWorld );

    this.raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
    this.raycaster.ray.direction.set( 0, 0, -1 )
      .applyMatrix4( this.tempMatrix );

    return this.raycaster.intersectObjects(
      this.intersectableObjects.children
    );

  },

	// 支持しているオブジェクトに向かってビーム
  intersectObjects: function( controller ) {

    // Do not highlight when already selected

    if ( controller.userData.selected !== undefined ) return;

    var line = controller.getObjectByName( 'line' );
    var intersections = this.getIntersections( controller );

    if ( intersections.length > 0 ) {

      var intersection = intersections[0];

      var object = intersection.object;
      object.material.emissive.r = 1;
      this.intersected.push( object );

      line.scale.z = intersection.distance;

    } else {

      line.scale.z = 5;

    }

  },

  attachIntersectedObject: function(controller){

    var intersections = this.getIntersections(controller);

    if ( intersections.length > 0 ) {

      var intersection = intersections[0];

      var object = intersection.object;

      this.attachObject(controller, object);
    }

  },

  attachObject: function(controller, object){
    this.tempMatrix.getInverse( controller.matrixWorld );

    object.matrix.premultiply( this.tempMatrix );
    object.matrix.decompose( object.position, object.quaternion, object.scale );
    object.material.emissive.b = 1;
    controller.add( object );

    controller.userData.selected = object;

  },

  detachObject: function(controller){
    if ( controller.userData.selected !== undefined ) {

      var object = controller.userData.selected;
      object.matrix.premultiply( controller.matrixWorld );
      object.matrix.decompose(
        object.position,
        object.quaternion,
        object.scale );
      object.material.emissive.b = 0;
      this.intersectableObjects.add( object );

      controller.userData.selected = undefined;

    }

  },

  // should be called in animate()
  startLoop: function(scene, camera, animate){

    var Instance = this;
    var animateFunc;
    if (Instance.useHeadsetVR){
      animateFunc = function(){
        Instance.effect.requestAnimationFrame(animateFunc);
        animate();
        Instance.controller1.update();
        Instance.controller2.update();

        Instance.controls.update();

        Instance.cleanIntersected();

        Instance.intersectObjects( Instance.controller1 );
        Instance.intersectObjects( Instance.controller2 );
        Instance.effect.render( scene, camera );

      };
    } else if (Instance.useStereoVR){
      animateFunc = function(){
        requestAnimationFrame( animateFunc );
        animate();
        Instance.effect.render(scene, camera);
      };
    } else {
      animateFunc = function(){
        requestAnimationFrame( animateFunc );
        animate();
        Instance.effect.render(scene, camera);
      };
    }
    animateFunc();
    return true;
  }
};
