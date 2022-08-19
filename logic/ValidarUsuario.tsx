import XMLParser from 'react-xml-parser';
import { select } from './querys';

export const validarUsuario = (userName, password) => {
	const ldapSite = 'https://intranet.wapp2.inegi.gob.mx/sistemas/informaticos/ws/v2/ldap.asmx';
	const claveApp = 'DGES_NodeJs_GenContCap';

	return new Promise( (resolve, reject) => {
		// validar campos vacios
		if(userName.current.value !== '' && password.current.value !== ''){
			resolve(navigator.onLine)
		} 
		reject('Los campos NO deben estar vacios');
	})
	.then( connection => {
		if(connection){
			// obtener autenticación por medio ldap
			return obtenerAutenticacion(userName, password, ldapSite, claveApp);
		}
			// obtener autenticación por medio de consulta a base de datos local
		return obtenerAutenticacionLocal(userName, password);
	})
	.then( resAuth => {
		console.warn('Autenticando: ', resAuth);
	})
}

const obtenerAutenticacion = (userName, password, ldap, clave) => {
	let params = `loginUsr=${userName.current.value}&passUsr=${password.current.value}&claveAplicacion=${clave}`;
	let urlAuth = `${ldap}/Autenticar?${params}`; 

	console.log('Realizando petición...')
	return fetch(urlAuth, {
  	method: 'GET',
  	headers:{
    	'Content-Type': 'application/x-www-form-urlencoded'
  	}
	})
 .then( response => {
 	if	(response.status == 404){
 		// no encontro la ldap, o fue inaccesible... realiza autenticación vía base datos local
 		// resuelve en catch para manejo del error => ERR_NAME_NOT_RESOLVED
 		return Promise.reject({ error: '' })
 	}
 	// espera y retorna el resultado
 	return response.text()
 })
 .then(response => {
 	// si es autenticado true de lo contrario un texto xml
 	if(typeof response === 'boolean'){
 		return response;
 	}
 	//  en caso de recibir el texto xml lo convierte en json
 	return new XMLParser().parseFromString(response); 
 })
 .then( jsonResponse => {
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
 	if( !err.error ){
 		// mandalo a la autenticación local
 		return obtenerAutenticacionLocal(userName, password)
 	} 
 	// rechaza la petición
 	return Promise.reject(err)
 })
}

const obtenerAutenticacionServidor = (userName, password) => {
	const serverFile = 'http://localhost/servidor/consultas.php';
	let data = { 
		consulta: `SELECT * FROM TBL_USUARIO WHERE nombre_usuario="${userName.current.value}" AND permisos_usuario=1;`, 
		tipo: 'select' 
	}; 
	let json = {}, respuesta = false;
	return fetch(serverFile,{
		method: 'POST',
		body: JSON.stringify(data),
		headers : {
			'Content-Type': 'application/json'
		}
	})
	.then( response => {
		return response.text();
	})
	.then( text => {
		respuesta = false;
		json =  JSON.parse(text);
		// encontro un error
		if(json.error){
			return Promise.reject( json )
		}
		if(json.length > 0){
			respuesta = true;
		}
		return respuesta;
	})
}

const obtenerAutenticacionLocal = (userName, password) => {
	return select('TBL_USUARIO', {
		cols: '*',
		where : {
			variables: "nombre_usuario, password_usuario",
			valores: `${userName.current.value}__${password.current.value}`
		}
	})
	.then( respObj => {
		let respuesta = false;
		if(respObj.length > 0){
			respuesta = true;
		}
		return respuesta;
	})
	.catch( err => Promise.reject( { error: 'LocalDB', message: err } ) )
}