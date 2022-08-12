import XMLParser from 'react-xml-parser';

export function validarUsuario(userName, password){
	const ldapSite = 'https://intranet.wapp2.inegi.gob.mx/sistemas/informaticos/ws/v2/ldp.asmx';
	const claveApp = 'DGES_NodeJs_GenContCap';

	return new Promise(function(resolve, reject){
		if(userName.current.value !== '' && password.current.value !== ''){
			resolve(navigator.onLine)
		} 
		reject('Los campos NO deben estar vacios');
	})
	.then(function(connection){
		if(connection){
			return obtenerAutenticacion(userName, password, ldapSite, claveApp);
		}
		return obtenerAutenticacionLocal(userName, password);
	})
}

function obtenerAutenticacion(userName, password, ldap, clave){
	let params = `loginUsr=${userName.current.value}&passUsr=${password.current.value}&claveAplicacion=${clave}`;
	let urlAuth = `${ldap}/Autenticar?${params}`; 
	console.log('Realizando petición...')
	return fetch(urlAuth, {
  	method: 'GET',
  	headers:{
    	'Content-Type': 'application/x-www-form-urlencoded'
  	}
	})
  .then(function(response){
  	if	(response.status == 404){
  		return obtenerAutenticacionLocal(userName, password, true);
  	}
  	return response.text()
  })
  .then(function(response){
  	if(typeof response === 'object' ){
  		return response;
  	}
  	return new XMLParser().parseFromString(response); 
  })
  .then(function(jsonResponse){
  	return checarRespuesta(jsonResponse)
  })
}

function obtenerAutenticacionLocal(userName, password, online){
	const db = getDatabase();
	return new Promise(function(resolve, reject){
		db.transaction(function(tx){
			tx.executeSql(`
				SELECT 
					* 
				FROM 
					TBL_USUARIO 
				WHERE 
					nombre_usuario = ?
				AND 
					password_usuario = ?`, [userName.current.value, password.current.value], function(tx, results){
						let respuesta = {value:''};
						if(results.rows[0]){
							respuesta = {value: true};
						}
						resolve(respuesta);
					})
		}, function(err){
			reject(err.message)
		}, function(){
		})
	})
	.then(function(response){
			if(online){
				return response;
			}
			return checarRespuesta(response)
	})
}

function checarRespuesta(jsonResponse){
	if(jsonResponse.value !== ''){
 	return 'Autenticación exitosa';
 }
 return Promise.reject('No fue posible autenticarse. Favor de revisar sus datos');
}
