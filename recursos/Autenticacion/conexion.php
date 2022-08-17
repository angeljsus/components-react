<?php 
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Headers: Content-Type");
	header("Content-Type: application/json; charset=UTF-8");

	/*
		CREATE TABLE IF NOT EXISTS TBL_USUARIO(
			id_usuario INT PRIMARY KEY,
			nombre_usuario VARCHAR(300),
			password_usuario VARCHAR(300),
			telefono_usuario INT
		);
	*/

	$username = "root";
	$password = "";
	$host = "localhost";
	$dbname ="test";

	$connect = mysqli_connect($host, $username, $password, $dbname);
?>