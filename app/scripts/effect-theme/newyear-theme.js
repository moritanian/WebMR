function NewyearTheme(scene){

	this.scene = scene;
	
	this.particlesNum = 60;
	this.dx = 0.001;
	this.dy = 0.0002;

	this.getModels = function(){
		return {
			newyear: {
                modelFile: 'models/new_year/new_year.json',
				size: 1.0,
				visible: true
			}
		};
	};

    this.getModelInfo = function(){
        return `modeling with  
            <a href="https://threejs.org/editor/"
                target="_blank"> threejs editor </a>`;
    };


	this.init = function(){

        let loader = new Loader();

        this.takoParent = new THREE.Group();

        loader.loadFile("models/new_year/tako.json").then((obj)=>{

            obj.rotation.y = Math.PI/12.0;
            obj.rotation.x = -Math.PI/12.0;
            obj.position.y = 3.0;
            this.takoParent.add(obj);

        });

        this.scene.add(this.takoParent);  

        this.clock = new THREE.Clock();
	};

	this.update = function(){
        
        let delta = this.clock.getDelta();

		this.takoParent.rotation.z += this.dy * delta * 60;

	};

	this.init();

}

//export default ChristmasTheme;
