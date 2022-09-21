const consultarServidor = consulta => {
	const serverFile = 'http://localhost/servidor/consultas.php';
	const tipos = ['select', 'update', 'delete', 'insert'];
	let sentencia = '', data = {};
	tipos.map( tipo => {
		status = consulta.toLowerCase().search([tipo]);
		if(status >= 0){
			sentencia = tipo; 
		}
	})

	if(sentencia !== '' && consulta !== ''){
		data = { consulta: consulta, tipo: sentencia };
		return fetch(serverFile,{
			method: 'POST',
			body: JSON.stringify(data),
			headers : {
				'Content-Type': 'text/plain',
			}
		})
		.then( response => response.text() )
		.then( text => {
			// manejo de errores 
			const hayRespuesta = text !== ''? true : false; 
			let json = {}, validation = '';
			let errString = 'El servidor no regreso ninguna respuesta'; 

			if ( hayRespuesta ){
				validation = /^[\],:{}\s]*$/;
				validation = validation.test(text.replace(/\\["\\\/bfnrtu]/g, '@')
					.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
					.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
				if ( validation ) {
					json = JSON.parse(text);
					return json;
				}
				errString = text;
			}

			return Promise.reject({
				error: 'Server',
				message: errString
			});
		})
		.then(json => 
			json.error ? Promise.reject(json) : json 
		)
	}
	return Promise.reject({ error: 'Server', message:`La consulta no contiene una sentencia: [${tipos.toString()}]` })
} 

export { consultarServidor };