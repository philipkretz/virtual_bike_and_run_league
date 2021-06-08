<?php 
session_start();

$rest_json = file_get_contents("php://input");
$_POST = json_decode($rest_json, true);
if ($_SESSION['token'] != trim($_POST['token'])) {
    die;
}

session_destroy();
session_start();

$min = 1000;
$max = getrandmax();
$_SESSION['token'] = rand($min, $max);

echo json_encode(['success' => true, 'token' => $_SESSION['token']]);