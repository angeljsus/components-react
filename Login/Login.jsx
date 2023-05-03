import { useEffect, useState, useContext} from 'react';
import { ContextAreaDeTrabajo } from './../../context/ContextAreaDeTrabajo';
import AppBar from '../AppBar/AppBar';
import XMLParser from 'react-xml-parser';
import logoInegi from '../../logos/inegi.png'
import './Login.css';

const Login = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [message, setMessage] = useState('');
  // modificar esta parte si es requerido 
  const HOST = '10.101.1.22:3060';
  const PATH = '/user';
  const propiedadBajar = 'permisos';
  // modificar esta parte si es requerido

  const {setModulo, usrApp, setUsrApp } = useContext(ContextAreaDeTrabajo);

  const validaDatos = (e) => {
    e.preventDefault();
    const inptName = user.trim().toLowerCase().split('@');
    const userName = inptName[0];
    const passWord = pass.trim();
    const dominio = inptName[1];
    if (userName === 'admin' && passWord === 'admin') {
      // console.log('Login ok - Es damin');
    } else if (!userName || !passWord) {
      console.log('Login off - No se ingreso ningun dato');
      setMessage('No se ingreso ningun dato.');
    } else if (userName && passWord) {
      const connection = navigator.onLine;
      if (connection) {
        if (!dominio || dominio === 'inegi.org.mx') {
          return obtenerAutenticacion(userName, passWord)
            .then((result) => {
              console.log(result);
              if (result) {
                if (result.autenticado) {
                  // AQUI PONER EL MODULO o cambios de estado
                  // setModulo()
                }
                setMessage(result.message);
              }
            })
            .catch((err) => {
              console.log(err);
              setMessage(err.message);
            });
        }
        return setMessage(`El dominio @${dominio} no pertenece a el INEGI.`);
      }
      return setMessage(`Usted NO cuenta con conexión a Internet.`);
    }
  };

  const obtenerAutenticacion = (userName, passWord) => {
    const host = 'intranet.wapp2.inegi.gob.mx';
    const claveApp = 'DGES_NodeJs_GenContCap';
    const params = `loginUsr=${userName}&passUsr=${encodeURIComponent(passWord)}&claveAplicacion=${claveApp}`;
    const pathHost = `/sistemas/informaticos/ws/v2/ldap.asmx/Autenticar?${params}`;
    const headers = {
      'content-type': 'application/x-www-form-urlencoded'
    };
    const respuesta = {
      autenticado: false,
      side: 'LDAP',
      message: 'Usuario y/o contraseña erronea.',
      response: {}
    };
    return new Promise((resolve, reject) => {
      window.Main.ping(host, pathHost, headers)
        .then(({ statusCode, data }) => {
          return new Promise((resolve, reject) => {
            // I create my code error
            statusCode === 200 && data
              ? resolve(data)
              : reject({ statusCode: '[_NO_DATA_RESPONSE]', statusMessage: 'La petición no devolvió nungún dato' });
          });
        })
        .then((text) => new XMLParser().parseFromString(text, 'application/xml'))
        .then((json) => {
          respuesta.response = json;
          if (json.value) {
            if (json.value.toLowerCase().trim() === 'true') {
              respuesta.autenticado = true;
              respuesta.message = 'Autenticado';
            }
          }
          return respuesta;
        })
        .then((response) => (response.autenticado ? obtenerDatosByService(userName) : response))
        .then((response) => resolve(response))
        .catch((err) => {
          const { statusCode } = err;
          // console.log('here:', statusCode);
          if (!err.message) {
            let message = 'Algo salió mal. Favor de notificarlo con el administrador del Sistema.';
            switch (statusCode) {
              // 403, 500, 'ECONNREFUSED', 'ENOTFOUND' are connection's errors
              // case 403:
              // message = 'Usted no cuenta con permisos para acceder al servicio.';
              // break;
              case 404:
                message = 'El servicio NO se encuentra disponible. Intente más tarde.';
                break;
              case 'ECONNREFUSED':
                message = 'No es posible autenticarse. Asegurate de encontrarte conectado a una red INEGI e intenta nuevamente.';
                break;
              case 'ENOTFOUND':
                message = 'No es posible autenticarse. Asegurate de encontrarte conectado a una red INEGI e intenta nuevamente.';
                break;
            }
            err.message = message;
          }
          reject(err);
        });
    });
  };

  const obtenerDatosByService = (userName) => {
    console.log('Consultando propiedad: ', propiedadBajar);
    const respuesta = {
      autenticado: false,
      side: 'Servicio',
      message: 'No se encuentra registrado dentro del servicio.',
      response: {}
    };
    return new Promise((resolve, reject) => {
      window.Main.ping(HOST, PATH, {})
        .then(({ statusCode, data }) => (data ? JSON.parse(data) : {}))
        .then((json) => {
          let numero = 0;
          if (json && json[0]) {
            numero = json[0][propiedadBajar] ? json[0][propiedadBajar] : 0;
          }
          if (numero > 0) {
            respuesta.autenticado = true;
            respuesta.message = 'Autenticado desde el servicio.';
            respuesta.response = json;
          }
          resolve(respuesta);
        })
        .catch((err) => {
          const { statusCode } = err;
          let message = 'Algo salió mal. Favor de notificarlo con el administrador del Sistema.';
          if (statusCode === 403 || statusCode === 404 || statusCode === 'ECONNREFUSED' || statusCode === 'ENOTFOUND') {
            message = 'El servicio NO se encuentra disponible. Intente más tarde.';
          }
          err.message = message;
          reject(err);
        });
    });
  };

  return (
    <>
      <div>
        <AppBar />
        <form className="login">
          <div className="login-inputs">
            <div>
              <img src={logoInegi} className="login-logoINEGI" alt="Logo iniegi" />
            </div>
            <div className="login-inputs-section">
              <div className="login-inputs-txt">Usuario</div>
              <input
                type="text"
                spellCheck="false"
                className="login-inputs-inp"
                onChange={(e) => setUser(e.target.value)}
              />
            </div>
            <div className="login-inputs-section">
              <div className="login-inputs-txt">Contraseña</div>
              <input className="login-inputs-inp" type="password" onChange={(e) => setPass(e.target.value)} />
            </div>
            <button className="login-inputs-btn" type="submit" onClick={validaDatos}>
              Ingresar
            </button>
            <div>{message}</div>
          </div>
        </form>
        <div className="login-version">
          <i className="fa-duotone fa-code"></i> PROTOTIPATOR 1.0
        </div>
      </div>
    </>
  );
}

export default Login;