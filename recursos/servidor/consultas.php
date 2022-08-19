<?php  
	include "conexion.php";
	$json = file_get_contents("php://input");
	$json = json_decode($json);
	$consulta = $json -> consulta;
	$tipo = $json -> tipo;
	if (!mysqli_connect_errno()) {
		$result = mysqli_query($connect, $consulta);
		$fila = "";
		$type = "";
		$affected = [];

		if($result){
			if($tipo === 'select' ){
				$response = "[\n";
				$cols = $result -> field_count;
				$cols = $cols;
				$rows = $result -> num_rows;
				$rows = $rows;
				$contCols = 1;
				$contRows = 1;
				$comCols = ",";
				$comRows = ",";
				while ($row = mysqli_fetch_array( $result )) {
					$fila = "{ ";
					foreach (array_keys($row) as &$key) {
						$type = gettype($key);
						$comCols = ",";
						if ($type === 'string') {
							if ($contCols == $cols) {
								$comCols = "";
							}
							$fila .= "\"$key\" : \"$row[$key]\"$comCols";
							$contCols++;
						}
					}
					$contCols = 1;
					if ($contRows == $rows) {
						$comRows = "";
					}
					$fila .= " }$comRows\n";
					$contRows++;
					$response .= utf8_encode($fila);
			  }
			  echo "$response]";
			} else {
    		echo json_encode([["rowsAffected" => mysqli_affected_rows($connect)]]);
			}
		} else {
		echo json_encode([ "error" => "Server","message" => mysqli_error($connect)]);
		}
	} else {
		echo json_encode([ "error" => "Server","message" => mysqli_connect_error()]);
	}
?>