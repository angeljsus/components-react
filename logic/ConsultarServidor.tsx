const consultarServidor = consulta => {
	const serverFile = 'http://localhost/servidor/consultas.php';
	const tipos = ['select', 'update', 'delete', 'insert'];
	let sentencia = '', data = {};
	tipos.map(tipo => {
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
				'Content-Type': 'application/json'
			}
		})
		.then( response => { return response.text() })
		.then( text => {
			let start = 0, end = 0, json = {};
			let validation = /^[\],:{}\s]*$/;
			validation = validation.test(text.replace(/\\["\\\/bfnrtu]/g, '@')
				.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
				.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))

			if(validation){
				json = JSON.parse(text);
				return json;
			} else {
				start = text.search(/{/);
				end = text.search(/}/)+1;
				if(start >= 0 && end >= 0){
					json = JSON.parse(text.substring(start, end));
				}
				return Promise.reject(json)
			}
		})
		.then(json => {
			if(json.error){
				return Promise.reject(json)
			}
			return json;
		})
	}
	Promise.reject({ error: 'Server', message:`La consulta no contiene una sentencia: [${tipos.toString()}]` })
} 


export { consultarServidor };