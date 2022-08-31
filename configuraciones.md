### Configuraciones

#### `Ofuscar código en Vite`

**Descripción**

La configuración permite la ofuscación del código generado en el proyecto de Vite.

**Requerimientos**

- Instalar la siguiente librería:
```shell
npm install --save-dev rollup-obfuscator
```

**Configuración**
```js
// vite.config.ts
import { obfuscator } from 'rollup-obfuscator'; // importar la librería

  return {
    root: srcRoot,
    base: './',
	    plugins: [
	      react(),
	      // agregado
	      obfuscator(
	      	{
	      	  compact: false,
	      	  controlFlowFlattening: true,
	      	  controlFlowFlatteningThreshold: 1,
	      	  numbersToExpressions: true,
	      	  simplify: true,
	      	  stringArrayShuffle: true,
	      	  splitStrings: true,
	      	  stringArrayThreshold: 1
	      	}
	      )
	      // fin agregado
	    ]
	}


```

**NOTA:** las propiedades posibles de utilizar se encuentran en descritas en el apartado de (JavaScript Obfuscator Options)[https://www.npmjs.com/package/javascript-obfuscator].  


#### `Instalación de React Dev Tools`

**Descripción**

Configuraciones para instalar las herramientas de de React en modo desarrollador en aplicación de Electron Js.

**Instalación manual**

- Instalar extensión en navegador de Chrome [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Acceder a la ruta de instalación de la extensión esta se encuentra en `(%LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions)`. El directorio es el id que aparece en la url de la extensión ejemplo: `fmkadmapgofadopljbjfkapdkoienihi`.
- Obtener ruta completa con la versión de la extensión: `.../Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.25.0_0`
- Importar `session` y habilitar extensión en la función que ejecuta una vez sea inicializado Electron.
```js
// ./electron/index.ts

import { BrowserWindow, app, ipcMain, IpcMainEvent, session } from 'electron';


app.whenReady().then(() => {
	session.defaultSession.loadExtension('C:/Users/****/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.25.0_0')
    //...
})

```

**Instalación por medio de módulo NPM**

- Instalar el paquete [electron-devtools-installer](https://github.com/MarshallOfSound/electron-devtools-installer) e importar el id de la extensión que se va utilizar, en este caso `REACT_DEVELOPER_TOOLS`.
- Habilitar la extensión en la función que ejecuta una vez sea inicializado Electron.

```js
// ./electron/index.ts

import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

app.whenReady().then(() => {
	installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
    //...
})
```

**NOTA:** una vez realizados las modificaciones debe iniciar la aplicación para que aparezcan las herramientas de desarrollo.