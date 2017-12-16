function ChristmasTheme(scene){

	this.scene = scene;
	
	this.particlesNum = 60;
	this.dx = 0.001;
	this.dy = 0.002;


	this.getModels = function(){
		return {
			christmas: {
				modelFile: 'models/christmas_tree_obj/christmas_tree.obj',
				//modelFile: 'models/Christmas_Tree.obj',
				size: 2.0,
				visible: true
			}
		};
	};

	this.init = function(){

		this.texture = THREE.ImageUtils.loadTexture("images/snow_particle.png");

        this.material = new THREE.PointCloudMaterial({
            color: 0xFFFFFF,
            size: 0.7,
            map: this.texture,
            transparent: true
        });

        var px, py, pz, particle;
        
        this.particles = new THREE.Geometry();
                
        for(var i=0, len=this.particlesNum; i<len; i++) {
        	let r = 8;
            px = Math.random()*r-r/2;
            py = Math.random()*r-r/2;
            pz = Math.random()*r-r/2;
            particle = new THREE.Vector3(px, py, pz);
            particle.velocity = new THREE.Vector3(0, -Math.random(), 0);
            this.particles.vertices.push(particle);
        }
        
        this.pointCloud = new THREE.PointCloud(this.particles, this.material);
        this.pointCloud.sortParticles = true;
        
        this.scene.add(this.pointCloud);  

        this.clock = new THREE.Clock();
	};

	this.update = function(){
        
        let delta = this.clock.getDelta();

		this.pointCloud.rotation.x += this.dy * delta * 60;
        for(var i=0, len=this.particlesNum; i<len; i++) {
            var particle = this.particles.vertices[i];
            if(particle.y < -window.innerHeight) {
                particle.y = window.innerHeight;
                particle.velocity.y = -Math.random();
            }
            particle.velocity.y -= Math.random()*this.dy;
            particle.add(particle.velocity);
        }
        
        this.pointCloud.geometry.__dirtyVerticies = true;

	}

	this.init();

}

//export default ChristmasTheme;
