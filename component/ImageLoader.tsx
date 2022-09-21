import { useState, useEffect } from 'react';

const ImageLoader = props =>{
	const [connection, setStatusConnection] = useState(window.navigator.onLine);
	const [imagen, setImagen] = useState();
	const error = [];
	let onlineImage = '', offlineImage = '', width = '', height= '';

	props.onlineImage ? onlineImage = props.onlineImage : error.push('onlineImage: Int');
	props.offlineImage ? offlineImage = props.offlineImage : error.push('offlineImage: Int');
	props.width ? width = `${props.width}px` : width = `250px`;
	props.height ? height = `${props.height}px`  : height = `250px`;

	// una vez y cuando cambie el estado de la conexión
	useEffect( () => 
		checkProps()
		.then( loadImageTag('1.1') ), [ connection ]);

	const checkProps = () => {
		return new Promise( (resolve, reject) => {
			error.length > 0 ?  
			reject('Falta las propiedades del componente: { ' + error.toString() + ' }')  :
			resolve()
		})
	}

	const loadImageTag = version =>{
		let estado = false;
		// estoy online
		if(connection){
			// obtener imagen
			return fetch(onlineImage)
			.then( e => {
				e.status !== 404 ? estado = true : estado = false;
				return estado;
			})
			.then( e => {
				// validando respuesta de encontrada
				if(e){
					if(version){
						// almacenando en cache
						return window.caches.open(version)
							// :Agregando imagen a cache:
						.then( cache => cache.add(onlineImage) )
							// cambiando el valor del estado de la imagen a presentar online
						.then( () => setImagen(onlineImage) )
					}
				}
				// cambiando el valor del estado de la imagen a presentar desde local
				return setImagen(offlineImage);
			})
		} else {
			return window.caches.has(version)
			.then( have => {
				// hay version de cache almacenada
				if(have){
					return new Promise( (resolve, reject) => {
						window.caches.open(version)
						.then( cache => {
							return cache.match(onlineImage)
							.then( response => {
								if(typeof response === 'object' && response.status === 200){
									resolve(response.blob())
								}
								reject(false);
							})
						})
					})
					.then( response => URL.createObjectURL(response) )
						// :Presentando offlineimage desde cache: cambiando el valor del estado de la imagen a presentar, desde cache
					.then( pathImage => setImagen(pathImage) )
					.catch( () => setImagen(offlineImage) );
				} else {
					// :Presentando offlineimage desde local:
					return setImagen(offlineImage);
				}
			})
		}
	}

	return (
		<img src={ imagen } width={ width } height={ height } />
	);
}

export default ImageLoader;