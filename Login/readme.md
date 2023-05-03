# Login

## Descripción

El módulo permite realizar la autenticación del usuario autenticando primero por medio del servicio del LDAP y despues por medio del valor de la propiedad obtenida por mdeio de una api.

## Requerimientos

- Instalar `react-xml-parser`:
	```bash
	npm install react-xml-parser --save
	```
- Dentro del archivo del preload agregar la siguiente funcion (si aún no se encuentra dentro de la api):
	```tsx
		// ./electron/preload.ts
	import http from 'http';
	// ...

	const api = {
	// ...
	// PING
	  ping: (hostSite: string, pathSite: string, headers: {}) => {
	    return new Promise((resolve: any, reject: any) => {
	      const request = http.get({ host: hostSite, path: pathSite, headers: headers }, (res) => {
	        let string = '';
	        res.on('data', (data) => {
	          string += data.toString();
	        });
	        res.on('end', function () {
	          const resp = {
	            host: hostSite,
	            path: pathSite,
	            statusCode: res.statusCode,
	            statusMessage: res.statusMessage,
	            data: string
	          };
	          resolve(resp);
	        });
	      });
	      request.on('error', (err: any) => {
	        const resp = {
	          host: hostSite,
	          path: pathSite,
	          statusCode: err.code ? err.code : null,
	          statusMessage: err.message,
	          data: []
	        };
	        reject(resp);
	      });
	      });
	  },
	// PING
	}
	```

- Modificar las siguientes líenas de código si es necesario que se encuentran dentro del componente:
	```js
	//... Login.jsx

	// línea 13-15
	const HOST = '10.101.1.22:3060';
	const PATH = '/user';
	const propiedadBajar = 'permisos';
	// línea 41
	setModulo('HomeModule')
	```

## Resultados

- **Exito:** abre el módulo de la aplicación (si tiene un módulo asignado en el proceso)
- **Error:** Muestra los siguientes mensajes al usuario:
	- El servicio NO se encuentra disponible. Intente más tarde.
	- No se encuentra registrado dentro del servicio.
	- No es posible autenticarse. Asegurate de conexión a una red INEGI e intenta nuevamente.
	- Usuario y/o contraseña erronea.
	- Usted NO cuenta con conexión a Internet.
	- El dominio xxx.xx.xx no pertenece a el INEGI.
	- Algo salió mal. Favor de notificarlo con el administrador del Sistema..