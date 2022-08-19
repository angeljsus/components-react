import { useState, useEffect } from 'react';

function ImageLoader(props){
	const [connection, setStatusConnection] = useState(window.navigator.onLine);
	const [imagen, setImagen] = useState();

	const onlineImage = props.onlineImage;
	const offlineImage = props.offlineImage;
	let width = `${props.width}px` 
	let height = `${props.height}px` 

	if(!props.width){
		width = `250px` 
	}
	
	if(!props.height){
		height = `250px` 
	}
	
	// una vez y cuando cambie el estado de la conexión
	useEffect( function(){
		loadImageTag('1.1');
	}, [connection])


	function loadImageTag(version){
		console.log('<cache: %s, online: %s>',version, connection)
		let estado = false;
		// estoy online
		if(connection){
			// obtener imagen
			return fetch(onlineImage)
			.then(function(e){
				if(e.status !== 404 ){
					estado = true;
				}
				return estado;
			})
			.then(function(e){
				// validando respuesta de encontrada
				if(e){
					if(version){
						// almacenando en cache
						return window.caches.open(version)
						.then(function(cache){
							console.log(':Agregando imagen a cache:')
							return cache.add(onlineImage);
						})
						.then(function(){
							// cambiando el valor del estado de la imagen a presentar online
							console.log(':Presentando onlineImage:')
							return setImagen(onlineImage);
						})
					}
				}
				// cambiando el valor del estado de la imagen a presentar desde local
				return setImagen(offlineImage);
			})

		}
		// estoy offline
		return window.caches.has(version)
		.then(function(have){
			// hay version de cache almacenada
			if(have){
				return window.caches.open(version)
				  .then(function(cache) {
				  	return cache.match(onlineImage)
				  	.then(function(response){
				  		return response.blob();
				  	})
				  	.then(function(blob){
				  		let pathCreated = URL.createObjectURL(blob);
				  		return pathCreated;
				  	})
				  	.then(function(pathImage){
							console.log(':Presentando offlineimage desde cache:')
						// cambiando el valor del estado de la imagen a presentar, desde cache
					 		return setImagen(pathImage);
				  	})
				  })
			}
			console.log(':Presentando offlineimage desde local:')
			// cambiando el valor del estado de la imagen a presentar, desde local
			return setImagen(offlineImage);
		})
	}

	return (
		<img src={ imagen } width={ width } height={ height } alt=""/>
	);
}

export default ImageLoader;