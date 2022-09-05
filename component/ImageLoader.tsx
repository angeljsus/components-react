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
							return cache.add(onlineImage);
						})
						.then(function(){
							// cambiando el valor del estado de la imagen a presentar online
							return setImagen(onlineImage);
						})
					}
				}
				// cambiando el valor del estado de la imagen a presentar desde local
				return setImagen(offlineImage);
			})

		} else {
			return window.caches.has(version)
			.then(function(have){
				// hay version de cache almacenada
				if(have){
					return new Promise(function(resolve, reject){
						window.caches.open(version)
						.then(function(cache) {
							return cache.match(onlineImage)
							.then(function(response){
								if(typeof response === 'object' && response.status === 200){
									resolve(response.blob())
								}
								reject(false);
							})
						})
					})
					.then(function(response){
						let pathCreated = URL.createObjectURL(response);
						return pathCreated;
					})
					.then(function(pathImage){
					// cambiando el valor del estado de la imagen a presentar, desde cache
						return setImagen(pathImage);
					})
					.catch(function(){
						return setImagen(offlineImage);
					})
				} else {
					return setImagen(offlineImage);
				}
			})
		}
	}

	return (
		<img src={ imagen } width={ width } height={ height } alt=""/>
	);
}

export default ImageLoader;