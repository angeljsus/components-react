import { useEffect, useState } from 'react';
import { consultarServidor } from '../logic/ConsultarServidor';
import { select }  from '../logic/querys'; 

const ListaDesplegable = props => {
const [data, setData] = useState([]);
const [connection, setConnection] = useState(navigator.onLine);

// props
	useEffect( () => {
		llenarLista();
	})

	const llenarLista = () => {
		if(connection){
			return consultarServidor(props.queryServer)
			.then(data => { return setData(data) } );
		}
		else {
			return select(props.queryLocal.tabla, props.queryLocal.props)
				.then( data => { return setData(data)})
		}
	}

	const showValue = e => {
		console.log(e)
	}

	return (
		<div>
			<select defaultValue={ 0 } onChange={ showValue }>
				<option disabled value={0}>{'Seleccionar'}</option>
				{
					data.map(
						(item, index) => 
							<option key={index} value={item.nombre_usuario}>
								{item.nombre_usuario}
							</option>
					)
 			}
			</select>
		</div>
	);
}


export default ListaDesplegable;