# Componentes React

### Descripción
Repositorio de componentes para ser utilizados dentro de aplicaciones de React.

### Componentes (./component)

#### `Login`

**Descripción**

El componente permite controlar el acceso a las aplicaciones. Permite autenticar por medio del LDAP y un script de php para comprobar que el usuario se encuentre registrado.

**{ Propiedades }**
- **urlPeticion** *(string)** : ruta del script donde consulta la existencia de datos.
- **propiedadBajar** *(string)** : Propiedad del JSON que retorna si es autenticado exitosamente.


**Resultados**
```js

// la solicitud de la aplicación manda los parametros con el nombre de la cuenta 
// ejemplo: ?cuenta=angel.trujillo
// que baja un objeto JSON para validarlo
<Login 
  propiedadBajar="nombre_usuario" 
  urlPeticion="http://xxxxxxx/server/users.php"
/>
// respuesta auntenticado con LDAP y servicio (consola)
{
  autenticado: true
  message: "Autenticado desde el servicio"
  response: "Angel Aguilar"
  side: "Servicio"
}

// respuesta para usuario
Usuario y/o contraseña erronea
Usted NO cuenta con conexión a Internet
No se encuentra conectado a la red del INEGI
No se encuentra registrado dentro del servicio

```
**Recurso:** ./recursos/servidor/tabla_usuarios.sql

#### `ImageLoader`
**Descripción**

El componente revisa la conexión al inicializar, para validar que imagen presentar en pantalla, una que esta en local o en línea. Permite almacenar en cache cuando esta conectado a internet y existe el recurso.

**{ Propiedades }**

- **onlineImage** *(string)** : ruta de acceso al recurso de la imagen en internet.
- **offlineImage** *(string)** : ruta de acceso al recurso de la imagen en local.
- **width** *(number)* : tamaño del ancho que tomará la imagen.
- **height** *(number)* : tamaño de lo alto que tomará la imagen.

**Resultados**
```js
import offline from './assets/imagen.png'; // recurso local 

const online = 'https://cdn.dribbble.com/users/1198445/screenshots/15064463/105628281-b86efa80-5e44-11eb-821c-87d5fddb9f8a_4x.png'; // recurso en línea

 // llamar componente
<ImageLoader onlineImage={ online } offlineImage={ offline } width={ 100 } height={ 100 }/>
```

#### `ListaDesplegable`
**Descripción**

El componente inserta información en la base de datos local si existe conexión a internet y presenta una lista desplegable filtrando por la propiedad `megaproyecto` enviada dentro del componente. 

**{ Propiedades }**

- **megaproyecto** *(integer)** : opciones del megaproyecto que presentará en la lista desplegable.

**Requerimientos**
El componente requiere el uso de las siguientes funciones de la carpeta  `../logic/querys`
```js
import { select, getDatabase }  from '../logic/querys'; // getDatabase es como accede a la base de datos local para realizar las consultas. 
```

**Resultados**

```js
// llamar componente
<ListaDesplegable megaproyecto={ 2 } />
```

#### `EnvioInformacion`

**Descripción**

El componente transfiere la información de las tablas de la base de datos del cliente para almacenarla dentro de la base de datos del servidor.

**{ Propiedades }**

- **usuario** *(integer)** : valor del usuario del que se enviará información.
- **proyecto** *(integer)** : valor del proyecto que se enviará la información.

**{ Requerimientos }**

- El componente utiliza los estilos desde el archivo `./component/Envi.oInformacion.css`.
- El componente utiliza las funciones del módulo de consultas `./logic/querys`.
- Agregar el archivo y nueva ruta al código PHP para recibir la información desde el cliente desde la propiedad del componente `propsExtensible.serverRequest`.
- El arreglo con los nombres de las tablas de donde se extraerá la información del cliente tomando en cuenta los nombres de las columnas `usuario` y `proyecto`.
- Tener instalados los siguientes módulos:
```bash
npm install --save fs-extra os path archiver-zip-encryptable archiver
```
```bash

npm install --save-dev @types/archiver @types/node

```

**Configuración adicional**

- Existe un problema para ejecutar los métodos del módulo `archiver` después del renderizado al exponer el módulo globalmente, para solucionar se creo la función en el archivo de precarga de la aplicación Electron y se expuso de forma global.

```js
// ./electron/preload.ts
import archiver from 'archiver';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';

archiver.registerFormat('zip-encryptable', require('archiver-zip-encryptable')); // registrar formato de archiver

const apiArchiver = {
  createEncriptedZip: (outputzip: Buffer, filelocation: string, password: any) => { 
    return new Promise( (resolve, reject) => {
      const stream : NodeJS.WritableStream = fs.createWriteStream(outputzip);
      resolve(stream)
      stream.on('error', err => reject(err) );
    })
    .then( stream => {
      const readable : any  = stream;
      return new Promise( (resolve, reject) => {
        let nameFile = path.basename(filelocation)
        const zip = archiver('zip-encryptable',
          {
            zlib: { level: 9 },
            forceLocalTime: true,
            password : password
          }
        )
        // aca resuelve el stream
        readable.on('close', () => resolve(outputzip) );
        zip.pipe(readable);
        zip.file(filelocation, { name: nameFile });
        zip.finalize();
        zip.on('end', () => {/*termina de agregar los archivos*/});
        zip.on('error', (err) => reject(err) );
      })
    })
  }
}

contextBridge.exposeInMainWorld('apiArchiver', apiArchiver); // exponer la función para crear el zip
contextBridge.exposeInMainWorld('os', os);
contextBridge.exposeInMainWorld('path', path);
contextBridge.exposeInMainWorld('fs', fs);
``` 
- Aún existe un problema para compilar el código y ejecutar el código debido a que archiver no reconoce el tipado de algunos parámetros, para esto se debe  agregar las siguientes lineas en el `@types/arvhiver`

```ts
declare namespace archiver {
  
  type Format =  'zip-encriptable' | 'zip' | 'tar';  // agregar 'zip-encriptable' al formato
  // ...

  interface ZipOptions {
    password?: string | undefined; // agregar el campo de contraseña a la interfaz del ZipOptions
    // ...
  }
}
```




# Funciones React

### Descripción

Funciones desarrolladas para ser utilizados dentro de aplicaciones de React.

### Funciones (./logic)

#### `validarUsuario(userName, password)`

*Archivo: ValidarUsuario.tsx*

**Requerimientos**

- Requiere instalación previa de `react-xml-parser`.
- El componente utiliza las funciones del módulo de consultas `./logic/querys`.
- Requiere el acceso a la ruta del archivo `./recursos/servidor/consultas.php` en servidor.

```bash
npm install --save react-xml-parser
```
```js
import { select } from './querys'
import { consultarServidor } from './ConsultarServidor';
```
**Descripción**

La función valida los datos del formulario para realizar la autenticación del usuario. Si no tiene conexión al ldap, autentica vía consulta a base de datos local, en caso contrario si autentica exitosamente mediante ldap, realiza una petición al servidor para verificar que exista el usuario dentro de una tabla.

**Parámetros**

- **userName** *(useRef)** : objeto de referencia al input de usuario dentro del componente. 
- **password** *(useRef)** : objeto de referencia al input de contraseña dentro del componente. 

**Resultados**
```js
const nameInput = useRef('');
const passInput = useRef('');

/*resuelve la promesa solo si el usuario fue autenticado*/
validarUsuario(userName, password)
.then( info => {
  console.log(info) /* resultado json: 
   - { message:'Autenticado con perfil de Kraken Slides', autenticado:true}
   - { message:'Intentar con usuario y contraseña del Kraken Slides', autenticado:false}
   - { message:'El usuario y/o contraseña son incorrectos.', autenticado:false}
   - { message:'Lo siento no tiene permiso.', autenticado:false}
  */
})
.catch( err => {
  console.error(err) 
  /* ejemplo errores:
    - { error: 'LocalDB', message: 'could not prepare statement (1 near "*": syntax error)'}
    - { error: 'Server', message: 'No database selected'}
  */
})

```

#### `ejecutarConsulta(query)`

*Archivo: ConsultarServidor.tsx*

**Descripción**

La función realiza una petición hacia el servidor para conectarse a la base de datos y realizar consultas sobre la tabla de la consulta recibida.

**Parámetros**

- **query** *(string)** : consulta a realizar en el servidor de base de datos. 

**Resultados**
```js
const consulta = 'SELECT * FROM TBL_USUARIO';
ejecutarConsulta(consulta)
.then(data => {
    console.log(data) // select resultado: [{id_usuario: 1, nombre_usuario:"Frank"},{id_usuario: 2, nombre_usuario:"Gina"}]
    // update, delete, insert resultado: {"rowsAffected": 1} 
})
.catch( err => {
    console.log(err) // resultado: {error: "Server", message: "Duplicate entry '1' for key 'PRIMARY'""}
})
```
**En Servidor**
Modificar propiedades de la conexión.
*./recursos/servidor/conexion.php*
*./recursos/servidor/consultas.php*