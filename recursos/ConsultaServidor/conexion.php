<?php 
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Headers: Content-Type");
	header("Content-Type: application/json; charset=UTF-8");

	$username = "root";
	$password = "";
	$host = "localhost";
	$dbname ="test";

	$connect = mysqli_connect($host, $username, $password, $dbname);
?>