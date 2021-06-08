<?php
require '../config/config.php';

//Declaring variables to prevent errors
$firstName = "";
$lastName = "";
$email = "";
$password = "";
$birthday = "";
$lang = "";
$success = false;
$token = '';
$errors = []; //Holds error messages

if(isset($_POST['email'])){
	require './protect_request.php';

	//First name
	$salutation = trim(strip_tags($_POST['salutation']));
	$salutation = strtolower($salutation);

	//First name
	$firstName = trim(strip_tags($_POST['firstName']));
	$firstName = ucfirst(strtolower($firstName));

	//Last name
	$lastName = trim(strip_tags($_POST['lastName']));
	$lastName = ucfirst(strtolower($lastName));

	//email
	$email = trim(strip_tags($_POST['email']));

	//birthday
	$birthday = trim(strip_tags($_POST['birthday']));

	//Password
	$password = trim(strip_tags($_POST['password']));

	$lang = trim(strip_tags($_POST['lang']));

	$createdAt = date("Y-m-d H:i:s"); //Current date

	//Check if email is in valid format
	if(filter_var($email, FILTER_VALIDATE_EMAIL)) {

		$email = filter_var($email, FILTER_VALIDATE_EMAIL);

		//Check if email already exists
		$emailCheck = mysqli_query($con, "SELECT email FROM `User` WHERE email='$email'");

		//Count the number of rows returned
		$numRows = mysqli_num_rows($emailCheck);

		if($numRows > 0) {
			array_push($errors, "Email already in use");
		}

	}
	else {
		array_push($errors, "Invalid email format");
	}


	if(strlen($firstName) > 30 || strlen($firstName) < 2) {
		array_push($errors, "Your first name must be between 2 and 30 characters");
	}

	if(strlen($lastName) > 30 || strlen($lastName) < 2) {
		array_push($errors,  "Your last name must be between 2 and 30 characters");
	}

	if(strlen($password) > 30 || strlen($password) < 6) {
		array_push($errors, "Your password must be betwen 6 and 30 characters");
	}

	if(empty($errors)) {
		$password = md5($password); //Encrypt password before sending to database

		//Generate username by concatenating first name and last name
		$displayName = $firstName . " " . $lastName;
		$checkEmailQuery = mysqli_query($con, "SELECT display_name FROM `User` WHERE display_name='$displayName'");
		$i = 0;
		//if username exists add number to username
		while (mysqli_num_rows($checkEmailQuery) != 0) {
			$i++;
			$displayName = $displayName . " #" . $i;
			$checkEmailQuery = mysqli_query($con, "SELECT display_name FROM `User` WHERE display_name='$displayName'");
		}

		$query = mysqli_query($con, "INSERT INTO `User` 
(email,salutation,display_name,first_name,last_name,birthday,password,lang,created_at,active) 
VALUES ('$email', '$salutation', '$displayName', '$firstName', '$lastName', '$birthday', '$password', '$lang', '$createdAt', 1)");
		if (!empty($con->error)) {
			array_push($errors, $con->error);
		} else {
			if ($lang == 'de') {
				$subject = PLATFORM_NAME;
				$msg = 'Du hast dich erfolgreich registriert für '.PLATFORM_NAME.".\r\n\r\n".
					'Was kommt als Nächstes? Log dich ein, aktualisiere dein Profil und meld dich für einen virtuellen Wettkampf an.' . "\r\n\r\n".
					'Für weitere Details besuch ' . PLATFORM_URL;

			}
			else {
				$subject = PLATFORM_NAME;
				$msg = 'You have successfully created an account on '.PLATFORM_NAME.".\r\n\r\n".
					'What\'s next? Log in, update your profile and sign up for a virtual competition.'."\r\n\r\n".
					'For further details visit ' . PLATFORM_URL;
			}
			@mail($email, $subject, base64_encode($msg), SEND_EMAIL_HEADER);

			$success = true;
			$_SESSION['trials'] = 0;
		}
	}

}

echo json_encode(['success' => $success, 'errors' => $errors, 'token' => $token]);
