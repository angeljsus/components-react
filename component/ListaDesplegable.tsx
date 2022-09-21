import { useEffect, useState } from 'react';
import { select, getDatabase }  from '../logic/querys'; 

const ListaDesplegable = props => {
	const [ dataToShow, setData ] = useState([]);
	const [ connection, setConnection ] = useState(navigator.onLine);
 	const requestServer = 'https://crocodigus.net/apikraken32/figuras';
 	const showCampo = 'nombre_figura';
 	const valorCampo = 'id_figura';
 	const queryLocal = { 
 	  tabla: 'TBL_FIGURA', 
 	  props: { 
 	    cols:'*', 
 	    where:{ variables:'id_mega_figura', valores: props.megaproyecto}, 
 	    order: { variables: 'estructura_figura'} 
 	  }
 	};

	useEffect( () => 
		llenarLista(), 
	[ connection ]);

	const llenarLista = () => {
		let status = false, error = [];
		// validando existencia de propiedades
		props.megaproyecto ? true : error.push('megaproyecto: Int');

		if	(error.length > 0){
			return Promise.reject('Falta las propiedades del componente: { ' + error.toString() + ' }');
		} else{
			if(connection){
				return fetch(requestServer,{
					method: 'GET',
					headers : {
					'Content-Type': 'text/plain',
					}
				})
				.then( resp => resp.json())
				.then( json => json.result)
				.then(data => {
					const cols = Object.keys(data[0]); 
					let contCols = 0, contRows = 0, comma = '', value = '';
					let insert = `INSERT OR IGNORE INTO ${queryLocal.tabla} VALUES\n`;

					if ( data.length > 0 ){
						data.map( (item, index) => {
							comma = ',';
							insert += `(`
							cols.forEach(keyName => {
								contCols++;
								if(contCols == cols.length){
									comma = '';
									contCols = 0;
								}
								value = typeof item[keyName]  === 'number' ? item[keyName] :  `"${item[keyName]}"` 
								insert += `${ value }${comma}`
							})
							contRows++;
							comma = ',';
							if(contRows == data.length){
									comma = ';';
									contRows = 0;
								}
							insert += `)${comma}\n`
						})
						return { insert, data};
					}
				})
				.then( respuesta => {
					const db = getDatabase();
					const { insert, data } = respuesta;
					if ( insert !== ''){
						return new Promise( (resolve, reject) => {
							db.transaction(tx => 
								tx.executeSql(insert),
								err => reject(err),
								() => resolve( data )
							); 
						})
					}
				})
				.then( data => runQuery( data ) );
			} else {
				return select( queryLocal.tabla, queryLocal.props )
				.then( data => runQuery( data ) );
			}
		}
	}

	const runQuery = data => {
			return select( queryLocal.tabla, queryLocal.props )
				.then( data => createGroups( data ) );
	}

	const showValue = e => {
		console.log(e.target.value)
	}

	const createGroups = data => {
		let jsonD = {}, groupName='';
		data.map( item => {
			groupName = item[queryLocal.props.order.variables];
			jsonD.hasOwnProperty(groupName) ? true : jsonD[groupName] = [];
			jsonD[groupName].push(item);
		})
		setData(jsonD);
	} 

	return (
		<div>
			<select defaultValue={ 0 }>
				<option disabled value={ 0 }>{'Selecciona la figura:'}</option>
				{
					Object.keys(dataToShow).map( (grupo, index) =>
					<optgroup label={ grupo } key={ index }>
						{
							dataToShow[grupo].map( (item, ind) => 
								<option value={ item[valorCampo] } key={ ind }>
									{ 
										item[showCampo] ? 
										item[showCampo] + ` [${item['nemo_figura']}]`  : 
										`Propiedad ${showCampo} no existe` 
									}
								</option>
							)
						}
					</optgroup>
					)
				}
			</select>
		</div>
	);
}


export default ListaDesplegable;