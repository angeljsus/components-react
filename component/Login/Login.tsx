import { useEffect, useState, useContext} from 'react';
import { ContextAreaDeTrabajo } from './../../context/ContextAreaDeTrabajo';
import AppBar from '../AppBar/AppBar';
import XMLParser from 'react-xml-parser';
import logoInegi from '../../logos/inegi.png'
import './Login.css';

const Login = ({ propiedadBajar }) => {

  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [message, setMessage] = useState('');
  // change url
  const urlPeticion = 'https://xxxxx.xxxxx.xxxx/'

  const {setModulo, usrApp, setUsrApp } = useContext(ContextAreaDeTrabajo);

  const validaDatos = e => {
    e.preventDefault()
    const inptName = user.trim().toLowerCase().split('@');
    const userName = inptName[0];
    const passWord = pass.trim();
    const dominio = inptName[1];
    if (userName === 'admin' && passWord === 'admin') {
      // console.log('Login ok - Es damin');
    }
    else if (!userName  || !passWord  ) {
      console.log('Login off - No se ingreso ningun dato');
      setMessage('No se ingreso ningun dato')
    }
    else if( userName  && passWord  ) {
      const ldapSite = 'https://intranet.wapp2.inegi.gob.mx/sistemas/informaticos/ws/v2/ldap.asmx';
      const claveApp = 'DGES_NodeJs_GenContCap';
      const connection = navigator.onLine;
      if(!dominio || dominio === 'inegi.org.mx'){
        const authPromise = connection ? 
        obtenerAutenticacion(userName, passWord, ldapSite, claveApp) : 
        Promise.resolve({message:`Usted NO cuenta con conexión a Internet`});

        return authPromise.then( result => {
          if(result.autenticado){
            // result response es el parametro obtenido 
            console.log('Que hacer aquí? Acceso concedido: ', result.autenticado)
            console.log(result)
            // setUsrApp(result.idusuario)
            // agregar modulo de inicio
            // setModulo('HistoriasUsuario')
          }
          setMessage(result.message)
        })
      }
      return setMessage(`El dominio @${dominio} no pertenece a el INEGI`); 
    } 
  }

  const obtenerAutenticacion = (userName, passWord, ldapSite, claveApp) => {
    const params = `loginUsr=${userName}&passUsr=${encodeURIComponent(passWord)}&claveAplicacion=${claveApp}`;
    const urlAuth = new URL(`${ldapSite}/Autenticar?${params}`, ldapSite);
    return new Promise( (resolve, reject) => {
      return fetch(urlAuth,{
        method: 'GET',
        headers : {
         'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;',
        }
       })
      .then( response => response.status === 404 ? Promise.reject() : response.text())
      .then( text => new XMLParser().parseFromString(text, 'application/xml') )
      .then( json => {
        const respuesta = { autenticado: false, side: 'LDAP', message: 'Usuario y/o contraseña erronea', response: json};
        if(json.value){
          if(json.value.toLowerCase().trim() === 'true'){
            respuesta.autenticado = true;
            respuesta.message = 'Autenticado';
          }
        }
        resolve(respuesta)
      })
      .catch(err => reject(err) )
   })
    .then( jsonResponse => jsonResponse.autenticado ? obtenerDatosByService(userName) : jsonResponse )
    .catch(err => setMessage('No se encuentra conectado a la red del INEGI') )
  }

  const obtenerDatosByService = (userName) => {
    const params = `?cuenta=${userName}`;
    const peticion = urlPeticion + params;
    return new Promise( (resolve, reject) => {
      return fetch(peticion,{
        method: 'GET',
        headers : {
         'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;',
        }
       })
      .then( response => response.status === 404 ? Promise.reject({ message: 'Script no encontrado'}) : response.text())
      .then( text => text ? JSON.parse(text) : {} )
      .then( json => {
        const respuesta = { 
          autenticado: false, 
          side: 'Servicio', 
          message: 'No se encuentra registrado dentro del servicio', 
          response: json
        };
        const keys = Object.keys(json);
        const propiedad = json[propiedadBajar];
        if(keys.length > 0 && propiedad){
          respuesta.autenticado = true;
          respuesta.message = 'Autenticado desde el servicio';
          respuesta.response = propiedad;
        }
        resolve(respuesta)

      })
      .catch(err => reject(err) )
    })
    return Promise.resolve({userName, peticion})
  }

  return <>
      <div>
        <AppBar />
        <form className="login">
          <div className="login-inputs">
          <div><img src={logoInegi} className="login-logoINEGI" alt="Logo iniegi"></img></div>          
          
          <div className="login-inputs-section" >
            <div  className="login-inputs-txt">Usuario</div>
            <input  
                type = "text"
                spellCheck = "false"
                className = "login-inputs-inp"
                onChange={(e)=>setUser(e.target.value)}
            ></input>
          </div>          
          <div className="login-inputs-section" >
            <div className="login-inputs-txt">Contraseña</div>
            <input 
                className="login-inputs-inp"  
                type="password"
                onChange={(e)=>setPass(e.target.value)}
            >
            </input>
          </div>
            <button className="login-inputs-btn" 
                    type="submit" 
                    onClick={ validaDatos  }  
            >Ingresar</button>
            <div>{message}</div>
          </div>
        </form>
        <div className="login-version"><i className="fa-duotone fa-code"></i> PROTOTIPATOR 1.0</div>
      </div>
  </>
}

export default Login 




