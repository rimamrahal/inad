<?php
// get the data from the POST message

// Log raw POST data
error_log("Raw POST data: " . file_get_contents('php://input'));

$post_data = json_decode(file_get_contents('php://input'), true);
$data = $post_data['filedata'];
// generate a unique ID for the file, e.g., session-6feu833950202 
$file = uniqid("session-");
// the directory "data" must be writable by the server
$name = "data/{$file}.csv"; 
// write the file to disk
file_put_contents($name, $data);
?>