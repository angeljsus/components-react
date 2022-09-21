# Componentes React

### Descripción
Repositorio de componentes para ser utilizados dentro de aplicaciones de React.

### Componentes (./component)

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

# Funciones React

### Descripción

Funciones desarrolladas para ser utilizados dentro de aplicaciones de React.

### Funciones (./logic)

#### `validarUsuario(userName, password)`

*Archivo: ValidarUsuario.tsx*

**Requerimientos**
- Requiere instalación previa de `react-xml-parser` y el uso de script
[querys](https://github.com/angeljsus/querys.git).

```bash
npm install react-xml-parser
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
  /* objeto json:
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