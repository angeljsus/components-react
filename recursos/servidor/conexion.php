<?php 
	$username = "root";
	$password = "";
	$host = "localhost";
	$dbname ="test";

	$connect = mysqli_connect($host, $username, $password, $dbname);
	if (!mysqli_connect_errno()) {
		mysqli_set_charset($connect, "utf8");
	} else {
		echo json_encode([ "error" => "Server","message" => mysqli_connect_error()]);
	  exit();
	}
?>