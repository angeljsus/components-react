# Login

## Descripción

El módulo permite realizar la autenticación del usuario autenticando primero por medio del servicio del LDAP y despues por medio del valor de la propiedad obtenida por mdeio de una api.

## Requerimientos

- Instalar `react-xml-parser`
	```bash
	npm install react-xml-parser --save
	```
- Modificar las siguientes líenas de código si es necesario:
	```js
	// 14 La ruta en la que se realizaran las peticiones. Esta ruta será concatenada con el valor de la cuenta inputado desde el login
	const urlPeticion = 'http://xxxxx.xxx.xxx/user/'
	// 15 La propiedad del json que contiene el valor a comparar (mi_prop_valor > 0)
	 const propiedadBajar = 'mi_nombre_propiedad';
	// 43 introducir el nombre del componente a cargar una vez termine con éxito el procedimiento
	setModulo('HomeModule')
	```

## Resultados

- **Exito:** abre el módulo de la aplicación (si tiene un módulo asignado en el proceso)
- **Error:** Muestra los siguientes mensajes al usuario:
	- No es posible acceder al Servicio. Intente más tarde.
	- No se encuentra registrado dentro del servicio.
	- No es posible autenticarse. Asegurate de conexión a una red INEGI e intenta nuevamente.
	- Usuario y/o contraseña erronea.
	- Usted NO cuenta con conexión a Internet.
	- El dominio xxx.xx.xx no pertenece a el INEGI.
	- No es posible acceder al Servicio. Intente más tarde.