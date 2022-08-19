const db = getDatabase();
/*
	CREATE TABLE TBL_USUARIO(
		id_usuario integer primary key,
		nombre_usuario varchar(200),
		password_usuario varchar(200),
		telefono_usuario int
	);
*/

function select(nombreTabla, jsonProp){
	let query = 'SELECT ';
	let objectVars = [], objectVals = [], objectCond = [], params = [], resultado = [];
	let object = {}, jsonResponse = {}, hayWere = {};
	let type = '', queryReturn = '', mensaje = '', contBucle = 1;

	return new Promise(function(resolve, reject){
		if (jsonProp) {
			// existen las columnas?
			if (jsonProp.cols && jsonProp.cols.length > 0) {
				query += jsonProp.cols.replace(/,$/, '');
			} else {
				query += '*';
				// sera todo *
			}
			// hay condiciones ?  
			if (jsonProp.where) {
				object = getCondiciones(jsonProp, nombreTabla)
				if (object.error) {
					reject(object.error)
				} else {
					query += ` FROM ${nombreTabla} WHERE ${object.complemento}`;
					jsonResponse = { consulta : query, valorVariables : object.valorVariables}
				}
			} 
			else {
					query += ` FROM ${nombreTabla} `;
					jsonResponse = { consulta : query, valorVariables : []}
			}
			resolve(jsonResponse)
		}
	})
	.then(function(data){
		queryReturn = data.consulta
		return new Promise(function(resolve, reject){
			// hay agrupaciones
			contBucle = 1;
			if (jsonProp.group) {
				if (jsonProp.group.variables) {
					queryReturn += `GROUP BY `;
					// si las existen valores dentro del grupo 
					if (jsonProp.group.valores && jsonProp.group.condiciones) {
						objectVars = jsonProp.group.variables.replace(/,$/, '').split(',');
						objectCond = jsonProp.group.condiciones.replace(/,$/, '').split(',')
						objectVals = jsonProp.group.valores.replace(/__$/, '').split('__');
						if (objectVars.length == objectVals.length && objectVars.length == objectCond.length) {
							objectVars.forEach(function(variable, index){
								queryReturn += `${objectVars[index]} `;
								queryReturn += `${objectCond[index]} `;
								type = parseInt(objectVals[index]);
								type = typeof type;
								if (type == 'number') {
									queryReturn += `${objectVals[index]}`;
								} else {
									queryReturn += `"${objectVals[index]}"`;
								}
								if (contBucle == objectVars.length) {
									queryReturn += '';
								} else {
									queryReturn += ',';
								}
								contBucle++;
							})
						} else {
							reject(`Faltan parametros en para agrupar con condicionales, deben ser la misma cantidad de variables\nvars: ${objectVars.length}\ncondc:${objectCond.length}\nvals:${objectVals.length}\nseparacion: ___`)
						}
					} else {
						queryReturn += jsonProp.group.variables;
					}
				}
			}
			// hay ordenamiento
			if (jsonProp.order && jsonProp.order.variables) {
				queryReturn += ` ORDER BY ${jsonProp.order.variables.replace(/,$/, '')}`;
				if (jsonProp.order.type) {
					queryReturn += ` ${jsonProp.order.type}`;
				}
			}
			// hay limite
			if (jsonProp.limit) {
				if (jsonProp.limit.start || jsonProp.limit.start == 0 && jsonProp.limit.start !== false) {
					queryReturn += ` LIMIT ${jsonProp.limit.start}`;
					if (jsonProp.limit.end){
						// agregar end
						queryReturn += `, ${jsonProp.limit.end}`;
					}
				}
			}
			// finalize
			queryReturn += ';';
			data.consulta = queryReturn;
			resolve(data)
		})
	})
	.then(function(data){
		queryReturn = data.consulta;
		return new Promise(function(resolve, reject){
			db.transaction(function(tx){
				tx.executeSql(queryReturn, data.valorVariables, function(tx, results){
					resultado = Object.keys(results.rows).map(function (key) { return results.rows[key]; });
					resolve(resultado);
				})
			}, function(err){
				reject(err.message)
			})
		})
	})
}

function insert(nombreTabla, jsonProp){
	let mensaje = '';
	let newData = [];
	let query = '';
	return new Promise(function(resolve, reject){
		if (jsonProp.cols) {
			resolve(jsonProp.cols.replace(/__$/,'').split('__'))
		} else {
			mensaje = 'No hay columnas para insertar.\n';
			reject(mensaje)
		}
	}) 
	.then(function(data){
		query = `INSERT INTO ${nombreTabla} VALUES (`
		newData = []
		data.forEach(function(item){
			if (item == 'null') {
				query += '?,'
				newData.push(null)
			} else {
				query += '?,'
				newData.push(item)
			}
		})
		query = query.replace(/,$/,'');
		query += ');'
		return new Promise(function(resolve, reject){
			db.transaction(function(tx){
				tx.executeSql(query, newData)
			}, function(err){
				reject(err.message)
			}, function(){
				resolve(data)
			})
		})
	}) 
}


function update(nombreTabla, jsonProp){
	let mensaje = '', query = '';
	return new Promise(function(resolve, reject){
		mensaje += 'Faltan cosas:\n'
		let error = 0, cols = 0, colsNames = 0;
		let response = {}, status = {};

		if (!jsonProp.cols) {
			mensaje += 'cols: No hay valores para modificar\n';
			error++;
		} else {
			cols = jsonProp.cols.replace(/__$/,'').split('__');
		}

		if (!jsonProp.colsNames) {
			mensaje += 'colsNames: No hay nombre de columnas\n';
			error++;
		} else {
			colsNames = jsonProp.colsNames.replace(/,$/,'').split(',');
			if (cols.length !== colsNames.length) {
				mensaje += `Los parametros no tienen las mismas cantidades:\ncols: ${cols.length}\ncolsNames: ${colsNames.length}`;
				error++;
			}
		}

		if (error > 0) {
			reject(mensaje)
		} else {
			if (jsonProp.where) {
				status = getCondiciones(jsonProp, nombreTabla)
				response = {valores : cols, columnas : colsNames, condicion: status}
			} else {
				response = {valores : cols, columnas : colsNames, condicion: ''}
			}

			resolve(response)
		}
	})
	.then(function(object){
		return new Promise(function(resolve, reject){
			// hay algun error retornado
			if (object.condicion.error) {
				reject(object.condicion.error)
			} else {
				query = `UPDATE ${nombreTabla} SET `;
				object.columnas.forEach(function(colName, index){
					if (index == 0) {
						query += `${colName} = ?`
					} else {
						query += `, ${colName} = ?`
					}
				})
				// agregar las condiciones
				let noModificar = object.valores;
				let valores = [];
				// mandar los valores de las modificaciones
				object.valores.forEach(function(valor){
					valores.push(valor)
				})
				if (object.condicion.complemento) {
					query += ' WHERE ' + object.condicion.complemento;
					// mandar los valores de las condiciones
					object.condicion.valorVariables.forEach(function(valor){
						valores.push(valor)
					})
				}
				// end query
				query += ';';
				resolve({consulta: query, valores: valores, dataReturn : noModificar})
			}
		})
	})
	.then(function(data){
		return new Promise(function(resolve, reject){
			db.transaction(function(tx){
				tx.executeSql(query, data.valores, function(tx, results){
					resolve(results.rowsAffected)
				})
			}, function(err){
				reject(err.message)
			}, function(){
			})
		})
	}) 
}

function deleteReg(nombreTabla, jsonProp){
	let object = {};
	let jsonResponse = { consulta : '', valores : []}
	let query = '';
	return new Promise(function(resolve, reject){
		query += `DELETE FROM ${nombreTabla} `;
		if (jsonProp.where) {
			object = getCondiciones(jsonProp, nombreTabla);
			if (object.error) {
				reject(object.error)
			} else {
				if (object.complemento) {
					query += `WHERE ${object.complemento}`
					jsonResponse.valores = object.valorVariables;
				}
			}

		}
		jsonResponse.consulta = query;
		resolve(jsonResponse)
	})
	.then(function(data){
		return new Promise(function(resolve, reject){
			db.transaction(function(tx){
				tx.executeSql(query, data.valores, function(tx, results){
					resolve(results.rowsAffected)
				})
			}, function(err){
				reject(err.message)
			}, function(){
			})
		})
	})

}


function getCondiciones(json, nombreTabla){
	let query = '', condicion = '', mensaje = '', contBucle = 1;
	let object = {}, objectVars = [], objectVals =[], objectCond =[];
	if (json.where.variables && json.where.valores) {
		// se convierte en arreglo
		objectVars = json.where.variables.replace(/,$/, '').split(',');
		objectVals = json.where.valores.toString();
		objectVals = objectVals.replace(/__$/, '').split('__');
		if (json.where.condiciones) {
			// hay condiciones
			objectCond = json.where.condiciones.split(',')
			condicion = true;
		}
		objectVars.forEach(function(variable, index){
			if (!objectVals[index] && objectVals[index] < 0 ) { 
				mensaje = `La cantidad de valores no corresponde a las variables enviadas, vars: ${objectVars.length} vals: ${objectVals.length}`;
			};
			query += variable + ' ';
			if (condicion > 0) {
				if (objectCond[index]) {
					// agrega la condicion que lleva
					query += `${objectCond[index]} `;
				} else {
					// agrega el operador =
					query += '= ';
				}
			} else {
				// todas las condiciones serán =
					query += '= ';
			}
			query += '? ';
			if (objectVars.length > contBucle) {
				query += `AND `;
			}
			contBucle++;
		})
		if (objectVars.length == objectVals.length) {
			object ={complemento : query, error: mensaje, valorVariables : objectVals} 
		} else {
			mensaje = `La cantidad de valores no corresponde a las variables enviadas, object.where.valores: ${objectVars.length} object.where.variables: ${objectVals.length}`;
			object ={complemento : query, error: mensaje, valorVariables : objectVals} 
		}
		return object;
	} 
	else {
		if (!json.where.variables && !json.where.valores) {
			mensaje = '';
		} else {
			mensaje = `No existe variable o valor de object.where.valores o object.where.variables`;
		}
		object ={error: mensaje} 
		return object;
	}
}

function getDatabase(){
	return openDatabase('querys_app','1.0','Almacenamiento de prueba de información, consultas sqlite', 1000000);
}

export { select, insert, update, deleteReg };