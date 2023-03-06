import { useState, useEffect, useContext } from 'react';
import { ContextAreaDeTrabajo } from './../../context/ContextAreaDeTrabajo';

import logoInegi from '../../logos/inegi.png'
import './LoginOnLine.css'

const LoginOnLine = () => {
 const [user, setUser] = useState('');
 const [pass, setPass] = useState('');
 const [message, setMessage] = useState('');
// fetch
 const [error, setError] = useState(null);
 const [isLoaded, setIsLoaded] = useState(false);
 const [result, setResult] = useState(null);

 const { setModulo } = useContext(ContextAreaDeTrabajo);
 const urlPeticion = 'http://10.101.1.22:3060/user/'
 const propiedadPass = 'password_usuario';

// COMPROBAR CONTRASEÑAS
 useEffect( () => {
  if(result){
   if(result.length > 0){ 
    const passInput = Main.encriptarSHA256(pass.trim());
    const passApi = result[0][propiedadPass] ? result[0][propiedadPass] : '';
    if(passApi === passInput){
      // setModulo('HomeModule')
     setMessage('Autenticado desde el Servicio.')
   } else {
     setMessage('Usuario y/o contraseña erronea.')
   }
   return;
 }
 setMessage('El usuario no se encuentra registrado.')
 console.log('Termino procedimiento')
}
}, [ result ])

 useEffect( () => {
  if(error){
   setMessage(error.mensaje);
   console.log('[REVISAR]: ', error)
 }
}, [ error ])

  const validaDatos = e => {
    e.preventDefault();
    const inptName = user.trim().toLowerCase().split('@');
    const userName = inptName[0];
    const passWord = pass.trim();
    const dominio = inptName[1];
    if (userName === 'admin' && passWord === 'admin') {
     // console.log('Login ok - Es damin');
    }
    else if (!userName  || !passWord  ) {
      console.log('Login off - No se ingreso ningun dato');
      setMessage('No se ingreso ningun dato.')
    }
    else if( userName  && passWord  ) {
      const connection = navigator.onLine;
      if(connection){
        if(!dominio || dominio === 'inegi.org.mx'){
          return realizarPeticion(userName);
        }
        return setMessage(`El dominio @${dominio} no pertenece a el INEGI.`); 
      }
      return setMessage(`Usted NO cuenta con conexión a Internet.`);  
    } 
  }

  const realizarPeticion = userAccount => {
    const urlConcat = urlPeticion + userAccount; 
    console.log('realizando petición: ', urlConcat)
    fetch(urlConcat)
    .then(res => res.text() )
    .then(
     result => {
      const array = result ?  convertToJson(result) : []; 
      setIsLoaded(true);
      setResult(array);
    },
    err => {
      setIsLoaded(true);
      setError({
       proceso: 'PETICION', 
       error: err, 
       mensaje: 'No es posible acceder al Servicio. Intente más tarde.'
     });
    }
    )
  }

  const convertToJson = text => {
    try {
     return JSON.parse(text)
   } catch(err) {
     setError({
      proceso: 'CONVERSION', 
      error: err, 
      mensaje: 'Algo salió mal. Consulte con el administrador de la aplicación.'
    });
     return [];
   }
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


export default LoginOnLine;