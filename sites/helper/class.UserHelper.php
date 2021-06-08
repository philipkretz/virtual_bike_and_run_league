<?php

namespace helper;

class UserHelper
{

    public static function checkLogin() {
        return !empty($_SESSION['user']['logged_in']);
    }

    public static function getUserData() {
        return $_SESSION['user'];
    }

    public static function logout() {
        session_destroy();
        session_start();
    }

}