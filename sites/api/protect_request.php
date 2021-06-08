<?php

define('MAX_REQUEST_DELAY', 3600);

// check csrf token
if ($_SESSION['token'] != trim($_POST['token'])) {
    die;
}

if (isset($_SESSION['last_trial'])) {
    $trialTime = microtime(true);
    if ($trialTime-$_SESSION['last_trial']*1 > MAX_REQUEST_DELAY) {
        $_SESSION['trials'] = 0;
    }
    $_SESSION['last_trial'] = $trialTime;

    @$_SESSION['trials']++;
    $_SESSION['last_trial'] = date('YmdHi');
    if ($_SESSION['trials'] > 10) {
        echo json_encode(['success' => false, 'errors' => ['too many trials'], 'token' => $token]);
        die;
    }
}

$min = 1000;
$max = getrandmax();
$_SESSION['token'] = $token = rand($min, $max);