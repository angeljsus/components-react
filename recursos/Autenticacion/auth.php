<?php 
	include './conexion.php';

	$data = file_get_contents("php://input");
	$jsonData = json_decode($data);
	$username = $jsonData-> name;
	$password = $jsonData-> password;

	$query = "SELECT id_usuario FROM TBL_USUARIO WHERE nombre_usuario = '$username' AND password_usuario = '$password'";

	if (!mysqli_connect_errno()) {
		$result = mysqli_query($connect, $query);

		if ($result) {
			$rows = $result -> num_rows;
			echo json_encode(["encontrados" => mysqli_affected_rows($connect)]);
		} else {
			$error = mysqli_error($connect);
   		echo json_encode(["type" => "Server", "message" => "$error"]);
		}
	}
	else {
		echo json_encode(["type" => "Server", "message" => mysqli_connect_error()]);
	}
?>