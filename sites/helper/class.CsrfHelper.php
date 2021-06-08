<?php

namespace helper;

class CsrfHelper
{

    const MIN_NR = 1000;
    const MAX_REQUEST_DELAY = 3600;
    const MAX_TRIALS = 10;

    public static function getToken() {
        return $_SESSION['token'];
    }

    public static function generateToken() {
        $max = getrandmax();
        $_SESSION['token'] = rand(self::MIN_NR, $max);
        return $_SESSION['token'];
    }

    public static function protectRequest() {
        // check csrf token
        if ($_SESSION['token'] != trim($_POST['token'])) {
            die;
        }

        // check max count of trial requests
        if (isset($_SESSION['last_trial'])) {
            $trialTime = microtime(true);
            if ($trialTime-$_SESSION['last_trial']*1 > self::MAX_REQUEST_DELAY) {
                $_SESSION['trials'] = 0;
            }
            $_SESSION['last_trial'] = $trialTime;

            @$_SESSION['trials']++;
            $_SESSION['last_trial'] = date('YmdHis');
            if ($_SESSION['trials'] > self::MAX_TRIALS) {
                echo json_encode(['success' => false, 'errors' => ['too many trials'], 'token' => self::generateToken()]);
                die;
            }
        }
    }

    public static function protectToken() {
        if ($_SESSION['token'] != trim($_POST['token'])) {
            die;
        }
    }

}
