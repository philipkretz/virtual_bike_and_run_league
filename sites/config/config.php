<?php
header('Content-Type: application/json');
session_start();

define('DB_HOST', "mysql");
define('DB_USER', "project");
define('DB_PASSWORD', "project");
define('DB_NAME', "virtual_bike_and_run_league");
define('MAX_UPLOAD_FILE_SIZE', 500000);
define('PLATFORM_NAME',"Virtual Bike and Run League");
define('PLATFORM_URL',"https://virtualbikeandrunleague.com");
define('SEND_EMAIL_HEADER', 'From: no-reply@virtualbikeandrunseries.com' . "\r\n" .
                            'Reply-To: support@virtualbikeandrunseries.com' . "\r\n" .
                            'Content-Type: text/plain; charset=utf-8' . "\r\n" .
                            'Content-Transfer-Encoding: base64' . "\r\n" .
                            'X-Mailer: PHP/' . phpversion());

define('STRAVA_CLIENT_ID','');
define('STRAVA_CLIENT_SECRET','');
define('GARMIN_CLIENT_ID','');
define('GARMIN_CLIENT_SECRET','');
define('WATT_PER_KG_COEFF',11);
define('ALTITUDE_COEFF',-1.4);

$timezone = date_default_timezone_set("Europe/Berlin");

$con = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

if(mysqli_connect_errno()) {
	echo "Failed to connect: " . mysqli_connect_errno();
}

$rest_json = file_get_contents("php://input");
$_POST = json_decode($rest_json, true);
