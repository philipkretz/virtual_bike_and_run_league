<?php
require '../config/config.php';

if (empty($_SESSION['user']['logged_in'])) {
    die;
}

$redirectUrl = PLATFORM_URL.'/exchange_token';
header('Location: https://www.strava.com/oauth/authorize?client_id='.STRAVA_CLIENT_ID.'&response_type=code&redirect_uri='.$redirectUrl.'&approval_prompt=force&scope=activity:read_all');