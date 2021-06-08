<?php

define('ACCESS_HOST', 'garmin.com');

require '../config/config.php';

if (!strstr(ACCESS_HOST,$_SERVER['REMOTE_HOST'])) {
    die;
}

