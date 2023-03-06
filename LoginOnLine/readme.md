# LoginOnLine

## Descripción

El módulo permite realizar la autenticación del usuario bajando y comparando los datos de una api, enviando por medio de la url el nombre de la cuenta del usuario.

## Requerimientos

- Las contraseñas que deben tener los registros deben estar codificadas con `SHA256`.
- Instalar `crypto-js` y tipado del módulo
	```bash
	npm install crypto-js --save
	```
	```bash
	npm install --save-dev @types/crypto-js
	```
- Dentro del proyecto de electron se debe registrar una función para codificar las contraseñas inputadas por el usuario:
	```js
	// ./electron/preload.ts
	import CryptoJS from 'crypto-js';

	const api = {
		// ...
	  	encriptarSHA256: (text : string) => CryptoJS.SHA3(text).toString(),
	}

	contextBridge.exposeInMainWorld('Main', api);
	```

- Modificar las siguientes líenas de código si es necesario:
	```js
	// 17 La ruta en la que se realizaran las peticiones. Esta ruta será concatenada con el valor de la cuenta inputado desde el login
	const urlPeticion = 'http://xxxxx.xxx.xxx/user/'
	// 18 La propiedad del json que contiene el valor de la contraseña
	 const propiedadPass = 'password_usuario';
	// 27 introducir el nombre del componente a cargar una vez termine con éxito el procedimiento
	setModulo('HomeModule')
	```

## Resultados

- **Exito:** abre el módulo de la aplicación (si tiene un módulo asignado en el proceso)
- **Error:** Muestra los siguientes mensajes al usuario:
	- No es posible acceder al Servicio. Intente más tarde.
	- El usuario no se encuentra registrado
	- Usuario y/o contraseña erronea
	- Usted NO cuenta con conexión a Internet
	- El dominio xxx.xx.xx no pertenece a el INEGI
	- No es posible acceder al Servicio. Intente más tarde.