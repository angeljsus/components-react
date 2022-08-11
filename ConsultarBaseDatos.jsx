import { useEffect, useState } from 'react';

function ConsultarBaseDatos(props){
  const serverFile = 'http://localhost/server/consultas.php';
  const [rows, setRows] = useState();
	const [connection, setStatusConnection] = useState(window.navigator.onLine);

  let tipo = null;
  let consulta = null;

  let sentencias = ['select', 'insert', 'update', 'delete'];

  if(props.hasOwnProperty('query')){
  	consulta = props.query;
		sentencias.forEach(function(sentencia){
			if(consulta.substring(0,20).toLowerCase().search([sentencia]) >= 0){
				tipo = sentencia;
			}
		});
  }

	useEffect( () => {
  	checkServerConnection();
  }, [ connection ]);

 	function sendRequestServer(){
		return fetch(serverFile,
		  {
		    method: 'POST',
		    body: JSON.stringify({ query : consulta, tipo: tipo}),
		    headers:{
		      'Content-Type': 'application/json'
		    }
		  }
		)
		.then(function(result){
			return result.json();
	  })
		.then(function(result){
		  if(result.error){
		  	throw result.error;
		  } else {
		   	return setRows(result);
		  }
		})
 	}

	function checkServerConnection(){
		return new Promise(function(resolve, reject){
			let status = true;
			if(consulta == null){
				status = false;
			}

			if(status){
				resolve();				
			}
			reject(`Faltan propiedades por enviar en el Componente: props.consulta`);
		})
		.then(function(){
			if(!connection){
				throw 'No tiene acceso a internet';
			}
			return sendRequestServer();
		})
	}

	return (
		<div>{ JSON.stringify(rows) }</div>
	);
}

export default ConsultarBaseDatos;