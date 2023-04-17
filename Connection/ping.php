<?php  
	header("Access-Control-Allow-Origin: *");
	echo json_encode(["type" => "Request", "message" => "Conected", "connection" => true]);
?>