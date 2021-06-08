<?php
require '../config/config.php';

unset($_SESSION['user']);
$token = '';
$success = false;
$errors = [];

if(isset($_POST['email'])) {
    require './protect_request.php';

	$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL); //sanitize email
	$password = md5($_POST['password']); //Get password

	$checkDbQuery = mysqli_query($con, "SELECT * FROM `User` WHERE email='$email' AND password='$password' and active=1");
	$checkLoginQuery = mysqli_num_rows($checkDbQuery);

	if($checkLoginQuery == 1) {
		$row = mysqli_fetch_assoc($checkDbQuery);

        $now = date('Y-m-d H:i:s');
        mysqli_query($con, "UPDATE `User` SET last_login='$now' WHERE email='$email'");

        $_SESSION['user'] = $row;

        include './agegroup_calc.php';

        $userEvents = unserialize(trim($_SESSION['user']['serialized_events']));
        if (empty($userEvents)) {
            $_SESSION['user']['events'] = '';
        }
        else {
            $_SESSION['user']['events'] = implode(',', $userEvents);
        }
        $badges = unserialize(trim($_SESSION['user']['serialized_badges']));
        if (empty($badges)) {
            $_SESSION['user']['badges'] = '';
        }
        else {
            $_SESSION['user']['badges'] = implode(',', $badges);
        }
        $_SESSION['user']['logged_in'] = true;

        unset($_SESSION['user']['serialized_events']);
        unset($_SESSION['user']['password']);
        unset($_SESSION['user']['active']);
        unset($_SESSION['user']['last_login']);
        unset($_SESSION['user']['changed_at']);
        unset($_SESSION['user']['created_at']);
        $success = true;
        $_SESSION['trials'] = 0;
	}
	else {
		array_push($errors, "Email or password was incorrect");
	}

}

echo json_encode(['success' => $success, 'errors' => $errors, 'user' => $_SESSION['user'], 'token' => $token]);

