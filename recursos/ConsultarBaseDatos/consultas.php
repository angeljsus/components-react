<?php 
	include 'conexion.php';

	$data = file_get_contents("php://input");
	$jsonData = json_decode($data);
	$query = $jsonData-> query;
	$query = $jsonData-> query;
	$tipo = $jsonData-> tipo;

	if (!mysqli_connect_errno()) {
		$result = mysqli_query($connect, $query);
		$response = "[\n";
		$fila = "";
		$type = "";
		$affected = [];
		if ($result) {
			switch ($tipo) {
				case 'select':
						$cols = $result -> field_count;
						$cols = $cols; // restarle la ultima
						$rows = $result -> num_rows;
						$rows = $rows; // restarle ultima fila
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
			    	echo "$response \n]";
					break;
				
				case 'insert':
    				echo json_encode(["rowsAffected" => mysqli_affected_rows($connect)]);
					break;
				case 'update':
    				echo json_encode(["rowsAffected" => mysqli_affected_rows($connect)]);
					break;
				case 'delete':
    				echo json_encode(["rowsAffected" => mysqli_affected_rows($connect)]);
					break;
				
				default:
    				echo json_encode(["error" => "La entrada: '$tipo' no es reconocida.\nIntente con uno de los valores: select, insert, update o delete"]);
					break;
			}

		}
		else {
			$error = mysqli_error($connect);
    	echo json_encode(["error" => "serverMysql: $error"]);
		}

	} else {
		echo "Error con la conexión: ".mysqli_connect_error();
	}
?>