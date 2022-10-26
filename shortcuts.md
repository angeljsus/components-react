# Activar shortcut en Electron

- Registrar el comando con `globalShortcut`.

```js
// ./electron/index.ts

const { globalShortcut } from 'electron';

function createWindow() {
	const window = new BrowserWindow({
		//...
	})
	//...
	globalShortcut.register('Ctrl+P', () => window.webContents.send('shorcutCtrlP', true) );

}

```
- Exponer en la aplicación la función para acceder a ella mediante el objeto `window`.
```js
// ./electron/preload.ts
contextBridge.exposeInMainWorld(
	'ShorthCut',
	{  
		on: (shorcutName: string, doIt: () => void) => {    ipcRenderer.on(shorcutName, doIt);  }
	}
```
- Mandar llamar la funcionalidad que va realizar cuando sea presionado la combinación de teclas, la funcion `on` recibe como parametro el nombre con el que se registro el comando y una función de retorno.

**Resultados**

```js
// Una sola vez
useEffect(() => {
	// shorthcut listener
    window.ShorthCut.on('shorcutCtrlP', e => {
      runMyFunction();
    })
}, [])

```
# Comando con cadena de texto
- El script se encuentra en `./logic/command.tsx` 
- Registrar los comandos que pueden ser escuchados dentro del array de la variable `commands`
- Dentro del switch proporcionar que función va correr una vez la conbinación de texto sea detectada.

```js
const commandListener = () => {
    let commands = ['rgtys']
    window.document.addEventListener('keyup', e => {
     // ...
      if(lenght === 10){
        // ...
        if(commandFinded) {
          switch(commandFinded){
            case 'rgtys':
              // correr función 
              break;
          }          
        }
        arrayKeysValues = [];
        // ...
      }
    });
  }
```
**Resultados**

*Nota:* agregar una variable global llamada `arrayKeysValues` inicializada con un arreglo vacío.
```js
 let arrayKeysValues = [];

// Una sola vez
useEffect(() => {
    commandListener();
  }, [])

```
