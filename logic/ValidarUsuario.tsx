import XMLParser from 'react-xml-parser';
import { select } from './querys';
import { consultarServidor } from './ConsultarServidor';

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
	let respuesta =  {	message: '', 	autenticado: false };

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
			respuesta.message = 'El usuario y/o contraseña son incorrectos.';
			return respuesta;
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
	let respuesta =  {	message: 'Lo siento no tiene permiso.', 	autenticado: false };
	let consulta = `SELECT * FROM TBL_USUARIO WHERE 
	nombre_usuario="${userName.current.value}" 
	AND permisos_usuario=1;`;
	let permiso = false;
	return consultarServidor(consulta)
	.then(data => {
		permiso = false;
		if(data.length > 0){
			respuesta.message = 'Tiene permiso, en base de datos de servidor.'
			permiso = true;
		}
		respuesta.autenticado = permiso
		return respuesta;
	})
}

const obtenerAutenticacionLocal = (userName, password) => {
	const permisoValue = 1;
	return select('TBL_USUARIO', {
		cols: '*',
		where : {
			variables: "nombre_usuario,password_usuario,permisos_usuario",
			valores: `${userName.current.value}__${password.current.value}__1`
		}
	})
	.then( respObj => {
		let respuesta =  {
			message: 'Intentar con usuario y contraseña del Kraken Slides', 
			autenticado: false 
		};

		if(respObj.length > 0){
			respuesta.autenticado = true;
			respuesta.message = 'Autenticado con perfil de Kraken Slides';
		}

		return respuesta;
	})
	.catch( err => Promise.reject( { error: 'LocalDB', message: err } ) )
}