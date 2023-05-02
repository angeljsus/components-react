# Login

## Descripción

El módulo permite consultar el estado de la conexion a internet y el acceso a un archivo PHP sí es requerido.

## Requerimientos
- Modificar la constante `seconds` *(línea 11)* con el tiempo en milisegundos que revisará el estado de la conexión.
- Modificar la constante `HOST` *(línea 12)* con el host del servidor.
- Modificar la constante `PATH` *(línea 13)* con la ruta del archivo PHP sí es necesario comprobar alguna de lo contrario dejarla vacia.
- Dentro del archivo del preload agregar la siguiente funcion:

``` ts
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

## Resultados

- La variable `online` almacena el valor del estado de internet: `false` si no tiene acceso y `true` si es que lo tiene.
- La variable `statusAccessURL` almacena el valor del estado de acceso a la URL: si no tiene acceso y `true` si es que lo tiene.
- Los mensajes que apareceran en el componente:

```js
- online : Si tiene acceso a la URL 
- online : NO tienes acceso a la URL
- offline!
```

