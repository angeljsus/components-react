# Componentes React

### Descripción
Repositorio de componentes para ser utilizados dentro de aplicaciones de React.

### Componentes

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
import ImageLoader from './component/ImageLoader';

import offline from './assets/imagen.png'; // recurso local 

function App() {

  const online = 'https://cdn.dribbble.com/users/1198445/screenshots/15064463/105628281-b86efa80-5e44-11eb-821c-87d5fddb9f8a_4x.png'; // recurso en línea
  
  // agregando las propiedades del componente
  const props = {
    onlineImage: online,
    offlineImage: offline,
    width: 100, // default 250
    height: 100 // default 250
  }


  return (
    <div className="App">
      <ImageLoader {...props}/>
    </div>
  )
}
```

#### `ConsultarBaseDatos`

**Descripción**

El componente revisa el acceso a internet, si existe la conexión realiza una petición hacia el servidor para conectarse a la base de datos y realizar consultas a las tablas.

**{ Propiedades }**

- **query** *(string)** : consulta a ejecutar dentro del servidor de base de datos.


*Nota*: El componente realiza la petición sobre la ruta `http://localhost/server/consultas.php` modificar la ruta de petición si no es la misma ubicación del recurso.

**Resultados**
```js
import ConsultarBaseDatos from './component/ConsultarBaseDatos';

function App() {

  // única propiedad del componente
  const props = {query : 'SELECT * FROM data;'}


  return (
    <div className="App">
      <ConsultarBaseDatos {...props}/> // imprime en pantalla el objeto
      /*ejemplo: SELECT
        [{"campo1":"0","campo2":"updated","campo3":"updated","campo4":"100"},
          {"campo1":"3","campo2":"primer","campo3":"segundo","campo4":"2"}]

        ejemplo: UPDATE,DELETE,INSERT
        {"rowsAffected": 1}
      */

      /* ejemplo: errores
          - serverMysql: Duplicate entry '1' for key 'PRIMARY'
          - No tiene acceso a internet.
      */
    </div>
  )
}
```

**En Servidor**
*./recursos/ConsultarBaseDatos/conexion.php*

Modificar las propiedades de la conexión con la base de datos a utilizar y host.

*./recursos/ConsultarBaseDatos/consultas.php*

Ejecuta las consultas enviadas.



# Funciones React

### Descripción

Funciones desarrolladas para ser utilizados dentro de aplicaciones de React.

### Funciones

*Archivo: validarUsuario.tsx*

#### `validarUsuario(userName, password)`
**Requerimientos**
Requiere instalación previa de `react-xml-parser`.

```bash
npm install react-xml-parser
```

**Descripción**

La función valida los datos del formulario para realizar la autenticación del usuario. Si no tiene conexión al ldap, autentica vía consulta a base de datos local.

**Parámetros**

- **userName** *(useRef)** : objeto de referencia al input de usuario dentro del componente. 
- **password** *(useRef)** : objeto de referencia al input de contraseña dentro del componente. 


**Resultados**
```js
const nameInput = useRef('');
const passInput = useRef('');

/*resuelve la promesa solo si el usuario fue autenticado*/
validarUsuario(userName, password)
.then(function(mensaje){
  console.log(mensaje) // resultado: Autenticación exitosa
})
.catch(function(err){
  console.error(err) 
  /* throws: 
    - No fue posible autenticarse. Favor de revisar sus datos
    - Los campos NO deben estar vacios
  */
})

```