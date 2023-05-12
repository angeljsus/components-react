# WebView

# Configuración

- Habilitar el uso de la etiqueta *webview* dentro de **webPreferences** agregando la siguiente propiedad (webviewTag):

```js
// ./electron/index.ts
const window = new BrowserWindow({
    // ...
	webPreferences: {
	  preload: join(__dirname, 'preload.js'),
	  webviewTag: true, // ++
	}
})
```
- Habilitar el componente `WebView` dentro de la aplicación.
- Volver a inicializar la aplicación con el comando de `npm run dev`.