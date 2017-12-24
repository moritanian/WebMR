/**
 * @author mrdoob / http://mrdoob.com/
 */

var Loader = function (  ) {

	var scope = this;

	this.texturePath = '';

	this.loadFile = function ( file ) {

		var filename, extension, reader;

		function onProgress( event ) {

			var size = '(' + Math.floor( event.total / 1000 ) + ' KB)';
			var progress = Math.floor( ( event.loaded / event.total ) * 100 ) + '%';
			console.log( 'Loading', filename, size, progress );

		} 

		function onError( event ){
			console.warn(event);
		}

		if(typeof file === "string"){

			filename = file;

			let manager = THREE.DefaultLoadingManager;

			reader = {
				listeners: {}
			};

			reader.addEventListener = function(type, callback){

				this.listeners[type] = callback;

			};

			reader.readAsText = function(filename){

				let instance = this;

				var loader = new THREE.FileLoader( manager );
				loader.load( file, function ( text ) {

					let event = {
						target: {
							result: text
						}
					};
					instance.listeners["load"]( event );

				}, onProgress, onError );

			};

		

		} else {

			filename = file.name;

			reader = new FileReader();
			reader.addEventListener( 'progress', onProgress);
		}
		

		extension = filename.split( '.' ).pop().toLowerCase();

		
		return new Promise((resolve, reject)=>{

			switch ( extension ) {

				case '3ds':

					reader.addEventListener( 'load', function ( event ) {

						var loader = new THREE.TDSLoader();
						var object = loader.parse( event.target.result );

						resolve(object );

					}, false );
					reader.readAsArrayBuffer( file );

					break;

				case 'amf':

					reader.addEventListener( 'load', function ( event ) {

						var loader = new THREE.AMFLoader();
						var amfobject = loader.parse( event.target.result );

						resolve( amfobject );

					}, false );
					reader.readAsArrayBuffer( file );

					break;

				case 'awd':

					reader.addEventListener( 'load', function ( event ) {

						var loader = new THREE.AWDLoader();
						var scene = loader.parse( event.target.result );

						resolve(scene );

					}, false );
					reader.readAsArrayBuffer( file );

					break;

				case 'babylon':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;
						var json = JSON.parse( contents );

						var loader = new THREE.BabylonLoader();
						var scene = loader.parse( json );

						resolve( scene );

					}, false );
					reader.readAsText( file );

					break;

				case 'babylonmeshdata':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;
						var json = JSON.parse( contents );

						var loader = new THREE.BabylonLoader();

						var geometry = loader.parseGeometry( json );
						var material = new THREE.MeshStandardMaterial();

						var mesh = new THREE.Mesh( geometry, material );
						mesh.name = filename;

						resolve(mesh );

					}, false );
					reader.readAsText( file );

					break;

				case 'ctm':

					reader.addEventListener( 'load', function ( event ) {

						var data = new Uint8Array( event.target.result );

						var stream = new CTM.Stream( data );
						stream.offset = 0;

						var loader = new THREE.CTMLoader();
						loader.createModel( new CTM.File( stream ), function( geometry ) {

							geometry.sourceType = "ctm";
							geometry.sourceFile = file.name;

							var material = new THREE.MeshStandardMaterial();

							var mesh = new THREE.Mesh( geometry, material );
							mesh.name = filename;

							resolve(mesh );

						} );

					}, false );
					reader.readAsArrayBuffer( file );

					break;

				case 'dae':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;

						var loader = new THREE.ColladaLoader();
						var collada = loader.parse( contents );

						collada.scene.name = filename;

						resolve( collada.scene );

					}, false );
					reader.readAsText( file );

					break;

				case 'fbx':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;

						var loader = new THREE.FBXLoader();
						var object = loader.parse( contents );

						resolve( object );

					}, false );
					reader.readAsArrayBuffer( file );

					break;

				case 'glb':
				case 'gltf':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;

						var loader = new THREE.GLTFLoader();
						loader.parse( contents, '', function ( result ) {

							result.scene.name = filename;
							resolve(result.scene );

						} );

					}, false );
					reader.readAsArrayBuffer( file );

					break;

				case 'js':
				case 'json':

				case '3geo':
				case '3mat':
				case '3obj':
				case '3scn':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;

						// 2.0

						if ( contents.indexOf( 'postMessage' ) !== - 1 ) {

							var blob = new Blob( [ contents ], { type: 'text/javascript' } );
							var url = URL.createObjectURL( blob );

							var worker = new Worker( url );

							worker.onmessage = function ( event ) {

								event.data.metadata = { version: 2 };
								handleJSON( event.data, file, filename , resolve, reject);

							};

							worker.postMessage( Date.now() );

							return;

						}

						// >= 3.0

						var data;

						try {

							data = JSON.parse( contents );

						} catch ( error ) {

							alert( error );
							return;

						}

						handleJSON( data, file, filename , resolve, reject);

					}, false );
					reader.readAsText( file );

					break;


				case 'kmz':

					reader.addEventListener( 'load', function ( event ) {

						var loader = new THREE.KMZLoader();
						var collada = loader.parse( event.target.result );

						collada.scene.name = filename;

						resolve(collada.scene ) ;

					}, false );
					reader.readAsArrayBuffer( file );

					break;

				case 'md2':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;

						var geometry = new THREE.MD2Loader().parse( contents );
						var material = new THREE.MeshStandardMaterial( {
							morphTargets: true,
							morphNormals: true
						} );

						var mesh = new THREE.Mesh( geometry, material );
						mesh.mixer = new THREE.AnimationMixer( mesh );
						mesh.name = filename;

						resolve( mesh );

					}, false );
					reader.readAsArrayBuffer( file );

					break;

				case 'obj':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;

						var object = new THREE.OBJLoader().parse( contents );
						object.name = filename;

						resolve( object );

					}, false );
					reader.readAsText( file );

					break;

				case 'playcanvas':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;
						var json = JSON.parse( contents );

						var loader = new THREE.PlayCanvasLoader();
						var object = loader.parse( json );

						resolve( object );

					}, false );
					reader.readAsText( file );

					break;

				case 'ply':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;

						var geometry = new THREE.PLYLoader().parse( contents );
						geometry.sourceType = "ply";
						geometry.sourceFile = file.name;

						var material = new THREE.MeshStandardMaterial();

						var mesh = new THREE.Mesh( geometry, material );
						mesh.name = filename;

						resolve( mesh );

					}, false );
					reader.readAsArrayBuffer( file );

					break;

				case 'stl':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;

						var geometry = new THREE.STLLoader().parse( contents );
						geometry.sourceType = "stl";
						geometry.sourceFile = file.name;

						var material = new THREE.MeshStandardMaterial();

						var mesh = new THREE.Mesh( geometry, material );
						mesh.name = filename;

						resolve( mesh );

					}, false );

					if ( reader.readAsBinaryString !== undefined ) {

						reader.readAsBinaryString( file );

					} else {

						reader.readAsArrayBuffer( file );

					}

					break;

				/*
				case 'utf8':
					reader.addEventListener( 'load', function ( event ) {
						var contents = event.target.result;
						var geometry = new THREE.UTF8Loader().parse( contents );
						var material = new THREE.MeshLambertMaterial();
						var mesh = new THREE.Mesh( geometry, material );
						editor.execute( new AddObjectCommand( mesh ) );
					}, false );
					reader.readAsBinaryString( file );
					break;
				*/

				case 'vtk':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;

						var geometry = new THREE.VTKLoader().parse( contents );
						geometry.sourceType = "vtk";
						geometry.sourceFile = file.name;

						var material = new THREE.MeshStandardMaterial();

						var mesh = new THREE.Mesh( geometry, material );
						mesh.name = filename;

						resolve( mesh );

					}, false );
					reader.readAsText( file );

					break;

				case 'wrl':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;

						var result = new THREE.VRMLLoader().parse( contents );

						resolve( result );

					}, false );
					reader.readAsText( file );

					break;

				case 'zip':

					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;

						var zip = new JSZip( contents );

						// BLOCKS

						if ( zip.files[ 'model.obj' ] && zip.files[ 'materials.mtl' ] ) {

							var materials = new THREE.MTLLoader().parse( zip.file( 'materials.mtl' ).asText() );
							var object = new THREE.OBJLoader().setMaterials( materials ).parse( zip.file( 'model.obj' ).asText() );
							resolve( object );

						}

					}, false );
					reader.readAsBinaryString( file );

					break;

				default:

					alert( 'Unsupported file format (' + extension +  ').' );

					break;

			}

		});

	};

	function handleJSON( data, file, filename , resolve, reject) {

		if ( data.metadata === undefined ) { // 2.0

			data.metadata = { type: 'Geometry' };

		}

		if ( data.metadata.type === undefined ) { // 3.0

			data.metadata.type = 'Geometry';

		}

		if ( data.metadata.formatVersion !== undefined ) {

			data.metadata.version = data.metadata.formatVersion;

		}

		var mesh, loader, result;

		switch ( data.metadata.type.toLowerCase() ) {

			case 'buffergeometry':

				loader = new THREE.BufferGeometryLoader();
				result = loader.parse( data );

				mesh = new THREE.Mesh( result );

				resolve( mesh );

				break;

			case 'geometry':

				loader = new THREE.JSONLoader();
				loader.setTexturePath( scope.texturePath );

				result = loader.parse( data );

				var geometry = result.geometry;
				var material;

				if ( result.materials !== undefined ) {

					if ( result.materials.length > 1 ) {

						material = new THREE.MultiMaterial( result.materials );

					} else {

						material = result.materials[ 0 ];

					}

				} else {

					material = new THREE.MeshStandardMaterial();

				}

				geometry.sourceType = "ascii";
				geometry.sourceFile = file.name;

				if ( geometry.animation && geometry.animation.hierarchy ) {

					mesh = new THREE.SkinnedMesh( geometry, material );

				} else {

					mesh = new THREE.Mesh( geometry, material );

				}

				mesh.name = filename;

				resolve ( mesh );

				break;

			case 'object':

				loader = new THREE.ObjectLoader();
				loader.setTexturePath( scope.texturePath );

				result = loader.parse( data );

				if ( result instanceof THREE.Scene ) {

					resolve(result );

				} else {

					resolve(result );

				}

				break;

			case 'app':

				resolve( data );

				break;

		}

	}

};