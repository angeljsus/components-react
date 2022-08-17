import XMLParser from 'react-xml-parser';
import { select } from './querys';

export function validarUsuario(userName, password){
	const ldapSite = 'https://intranet.wapp2.inegi.gob.mx/sistemas/informaticos/ws/v2/ldap.asmx';
	const claveApp = 'DGES_NodeJs_GenContCap';

	return new Promise(function(resolve, reject){
		// validar campos vacios
		if(userName.current.value !== '' && password.current.value !== ''){
			resolve(navigator.onLine)
		} 
		reject('Los campos NO deben estar vacios');
	})
	.then(function(connection){
		if(connection){
			// obtener autenticación por medio ldap
			return obtenerAutenticacion(userName, password, ldapSite, claveApp);
		}
			// obtener autenticación por medio de consulta a base de datos local
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
 		// no encontro la ldap, o fue inaccesible... realiza autenticación vía base datos local
 		// resuelve en catch para manejo del error => ERR_NAME_NOT_RESOLVED
 		return Promise.reject()
 	}
 	// espera y retorna el resultado
 	return response.text()
 })
 .then(function(response){
 	// si es autenticado "true" de lo contrario un texto xml
 	if(typeof response === 'boolean'){
 		return response;
 	}
 	//  en caso de recibir el texto xml lo convierte en json
 	return new XMLParser().parseFromString(response); 
 })
 .then(function(jsonResponse){
 	if(typeof jsonResponse.value === 'string'){
			if(jsonResponse.value !== ''){
				// autenticar ahora en base de datos del servidor
				console.log('Autenticando en servidor...')
				return obtenerAutenticacionServidor(userName, password);
			}
			return false;
 	}
 	return jsonResponse;
 })
 .catch(err => {
 	// Si un tipo de error diferente a los que puedo escuchar, ejemplo: ERR_NAME_NOT_RESOLVED  
 	// que solo lanza un throw
 	if( !err.type ){
 		// mandalo a la autenticación local
 		return Promise.resolve(obtenerAutenticacionLocal(userName, password))
 	} 
 	// rechaza la petición
 	return Promise.reject(err)
 })
}

function obtenerAutenticacionServidor(userName, password){
	const serverFile = 'http://localhost/auth/auth.php';
	let user = { name: userName.current.value, password: password.current.value }; 
	let json = {}, respuesta = false;

	return fetch(serverFile,{
		method: 'POST',
		body: JSON.stringify(user),
		headers : {
			'Content-Type': 'application/json'
		}
	})
	.then(function(response){
		return response.text();
	})
	.then(function(text){
		respuesta = false;
		json =  JSON.parse(text);
		// encontro un error
		if(json.type){
			return Promise.reject( json )
		}
		// encontro un error
		if(json.encontrados > 0){
			respuesta = true;
		}
		return respuesta;
	})
}

function obtenerAutenticacionLocal(userName, password){
	return select('TBL_USUARIO', {
		cols: '*',
		where : {
			variables: "nombre_usuario, password_usuario",
			valores: `${userName.current.value}__${password.current.value}`
		}
	})
	.then(function(respObj){
		let respuesta = false;
		if(respObj.length > 0){
			respuesta = true;
		}
		return respuesta;
	})
	.catch( err => Promise.reject( { type: 'LocalDB', message: err } ) )
}
