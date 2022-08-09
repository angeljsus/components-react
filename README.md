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