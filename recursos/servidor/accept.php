<?php
	header("Access-Control-Allow-Origin:*");
	header("Access-Control-Allow-Headers:Content-Type");
	header('text/plain');
	
	$informacion = file_get_contents("php://input");
	$jsonData = json_decode($informacion);
	$zipBase = $jsonData-> data;
	$zipName = $jsonData-> zipName;
	$zipBase = base64_decode($zipBase);
	$password = $jsonData-> password;;

	crearZip($zipName, $zipBase, $password);

	// * recibe como parametros el nombre, base64 y contraseña */
	function crearZip($nameZip, $base, $pass){
		// ruta de archivos 
		$direccion = "./zip/";
		// ruta que tomara el archivo
		$direccionZip = "$direccion$nameZip";
		$direccionJson = $direccion."json/";

		// crea la carpeta de almacenamiento de archivos
		createDirectorio($direccion);

		// crea el archivo dentro de la ruta
		$file = file_put_contents($direccionZip, $base);
		if ($file) {
			// echo "El archivo esta donde debe\n";
			$test = file_exists($direccionZip);
			$status = "";
			$descompress = "";

			if ($test) {
				$zipFile = new ZipArchive();
				$status = $zipFile -> open($direccionZip); 
				// abre el archivo
				if ($status === true) {

					createDirectorio($direccionJson);
					// introduce contraseña
					if ($zipFile -> setPassword($pass)) {
						$descompress = $zipFile -> extractTo($direccionJson);
						if ($descompress) {

							$zipFile -> close();
							if (file_exists($direccionZip)) {
								unlink($direccionZip);
							}
							// es hora de leer la información del archivo
							leerInformacionFiles($direccionJson);
					    eliminarDirectorio($direccionJson);
					    eliminarDirectorio($direccion);
						} else {
							eliminarDirectorio($direccionJson);
							$zipFile -> close();
							if (file_exists($direccionZip)) {
								unlink($direccionZip);
							}
							eliminarDirectorio($direccion);

							echo json_encode([ "error" => "Server","message" =>"Contraseña recibida es incorrecta $direccionZip"]);
						}

					} else {
					  $zipFile -> close();
				    eliminarDirectorio($direccionJson);
				    eliminarDirectorio($direccion);
						echo json_encode([ "error" => "Server","message" =>"No se pudo descomprimir el archivo: $nameZip"]);
					}
				} else {
					echo json_encode([ "error" => "Server","message" =>"Algo salio mal con el zip (codigo$status)"]);
				}
			} else {
				echo json_encode([ "error" => "Server","message" =>"No existe el archivo: $nameZip"]);
			}
		} else {
			echo json_encode([ "error" => "Server","message" =>"No se creo el archivo: $nameZip"]);
		}
	}

	function leerInformacionFiles($direccionJson){
		$files  = scandir($direccionJson);
		$filePath = "";
		// lectura de archivos json del zip
		foreach ($files as $file) {
			if ($file !== "." && $file !== ".." && $file !== "") {
				$filePath = $direccionJson.$file;
				leerArchivoJson($filePath);
			}
		}
	};

	function leerArchivoJson($path){
		$rowFile = "";
		$tabla = 0;
		$tablaEnd = 0;
		$nombreTabla = "";
		$cierre = "";
		$inicio = "";
		$cantCols = 0;
		$posCol = 0;
		$colData = "";
		$cantParms = 0;
		$value = "";
		$posParm = 0;
		$contador = 1;
		$consultaSql = "";
		$bloque = 250;
		$file = fopen($path, "r+");
		while( ! feof($file)){
			$rowFile = fgets($file);
			$rowFile = str_replace("\t", "", $rowFile);
			if ($rowFile !== "") {
				$tabla = substr_count($rowFile, "[");
				// es nombre de tabla?
				if ($tabla > 0) {
					$rowFile = str_replace(" ", "", $rowFile);
					$rowFile = str_replace("\"", "", $rowFile);
					$rowFile = str_replace("[", "", $rowFile);
					$rowFile = str_replace(":","", $rowFile);
					$rowFile = str_replace("{","", $rowFile);
					$rowFile = str_replace("\n","", $rowFile);
					$nombreTabla = $rowFile;
					$consultaSql .= "INSERT INTO $nombreTabla VALUES ";
				}

				$tablaEnd = substr_count($rowFile, "]");

				if ($tablaEnd > 0) {
					$consultaSql .= ";\n";
					// si queda un residuo trash ;)
					if ($consultaSql !== ";\n") {
						insertarEnBD($consultaSql, ($contador-1), $nombreTabla);
					}
					$contador = 1;
					$consultaSql = "";
				}

				$inicio = substr_count($rowFile, "{");
				$cierre = substr_count($rowFile, "}");

				if ($inicio > 0 && $cierre > 0 ) {
					$rowFile = str_replace("\n", "", $rowFile);
					$rowFile = str_replace("},", "}", $rowFile);
					$rowFile = str_replace("}", "", $rowFile);
					$cantCols = substr_count($rowFile, ",");

					if ($rowFile !== "") {

						if ($contador == ($bloque+1)) {
							$consultaSql .= "INSERT INTO $nombreTabla VALUES \n";
							$contador = 1;
						} 
						
						if ($contador > 1) {
							$consultaSql .= ",\n";
						}

						$consultaSql .= "(";
						for ($j=0; $j < $cantCols+1; $j++) { 
							$colData = $rowFile;
							$posCol = strpos($rowFile, ",");
							if ($posCol) {
								$colData = substr($colData, 0, $posCol+2);
								$rowFile = str_replace($colData, "", $rowFile);
							}
							$cantParms = substr_count($colData, ":");
							for ($k = 0; $k < $cantParms + 1; $k++) { 
								$value = $colData;
								$posParm = strpos($value, ":");
								if ($posParm) {
									$value = substr($value, 0, $posParm+1);
									$colData = str_replace($value, "", $colData);
								} else {
									$value = str_replace(",\"", ",", $value);
									$consultaSql .= str_replace("&#44;",",",$value);
								}
							}
						}
						$consultaSql .= ")";
						$contador++; 	
					}
				}
				
				if ($contador == ($bloque+1)) {
					$consultaSql .= ";\n";
					insertarEnBD($consultaSql, $bloque, $nombreTabla);
					$consultaSql = "";
				}

			}
		}

		fclose($file);
	}

	function insertarEnBD($query, $rows, $tabla){
		// tomar las propiedades de la conexión
		include "conexion.php";
		// checar la conexión
		if (mysqli_connect_errno()) {
				echo json_encode([ "error" => "Server","message" => mysqli_connect_error()]);
		    exit();
		}

		// aún esta conectado
		if (mysqli_ping($connect)) {
				$resultado = mysqli_query($connect, $query);
				if ($resultado) {
					echo json_encode(
						[ 
							"resolve" => "continuar",
							"message" => "Consultas realizada con exito en tabla: $tabla",
							"rows" => $rows
						]);
				} else {
					echo json_encode([ "queryError" => "continuar","message" => "BLOQUE DE CONSULTA NO REALIZADA (Nombre Tabla: $tabla. Filas no insertadas: $rows)", "myslqiError" => mysqli_error($connect)]);
				}
		} else {
				echo json_encode([ "error" => "Server","message" => mysqli_error($connect)]);
		}
		// cerrar la conexión
		mysqli_close($connect);
	}


	function createDirectorio($ruta){
		if (!is_dir($ruta)) {
		  mkdir($ruta);
		}
	}

	function eliminarDirectorio($direccion){
		$files  = scandir($direccion);

		if (file_exists($direccion)) {
			foreach ($files as $file) {
				if ($file !== "." && $file !== ".." && $file !== "") {
					$filePath = $direccion.$file;
					if (file_exists($filePath)) {
						unlink($filePath);
					}
				}
			}
			rmdir($direccion);
		}
	}
	
?>