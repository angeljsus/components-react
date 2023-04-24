# Login

## Descripción

El módulo permite consultar el estado de la conexion a internet y el acceso a un archivo PHP sí es requerido.

## Requerimientos
- Modificar la constante `seconds` *(línea 8)* con el tiempo en milisegundos que revisará el estado de la conexión.
- Modificar la constante `HOST` *(línea 9)* con el host del servidor.
- Modificar la constante `PATH` *(línea 10)* con la ruta del archivo PHP sí es necesario comprobar alguna de lo contrario dejarla vacia.
- Dentro del archivo del preload agregar la siguiente funcion:

``` js
// ./electron/preload.ts
import http from 'http';
// ...

const api = {
// ...
// funcion
	ping: (hostSite: string, pathSite: string) => {
  const req = http.get({ host: hostSite, path: pathSite });
  return new Promise((resolve, reject) => {
    req.end();
    req.once('response', () => {
      resolve(req);
    });
    req.on('error', (err: any) => {
      reject(err);
    });
  });
 }
// funcion
}
```

## Resultados

- La variable `online` almacena el valor del estado de internet: `false` si no tiene acceso y `true` si es que lo tiene.
- La variable `statusAccessURL` almacena el valor del estado de acceso a la URL: si no tiene acceso y `true` si es que lo tiene.
- Los mensajes que apareceran en el componente:

```js
- online : Si tiene acceso a la URL 
- online : NO tienes acceso a la URL
- offline!
```

