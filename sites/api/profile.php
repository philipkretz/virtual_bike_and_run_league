<?php
require '../config/config.php';

if (empty($_SESSION['user']['logged_in'])) {
  die;
}

$token = '';
$success = false;
$errors = [];

if (isset($_POST['form'])) {
  require './protect_request.php';

  $now = date('Y-m-d H:i:s');
  $userId = (int)$_SESSION['user']['user_id'];

  if ($_POST['form'] == 'athlete_details') {
      $avatar = '';
      if (!empty($_POST['avatarSrc'])) {
          $avatar = $_POST['avatarSrc'];
          if (strlen($avatar)>MAX_UPLOAD_FILE_SIZE) {
              array_push($errors, "Your file is too large.");
          }
          if (substr($avatar,0,11) != 'data:image/') {
              array_push($errors, "File is not an image.");
          }
      }
      $motto = strip_tags(trim($_POST['motto']));
      $displayName = strip_tags(trim($_POST['displayName']));
      $weight = (int) $_POST['weight'];
      $weightFormat = strtolower(strip_tags(trim($_POST['weightFormat'])));
      $height = (int) $_POST['height'];
      $heightFormat = strtolower(strip_tags(trim($_POST['heightFormat'])));

      $sql = "UPDATE `User` SET changed_at='$now',avatar='$avatar',display_name='$displayName',motto='$motto',weight='$weight',height='$height',weight_format='$weightFormat',height_format='$heightFormat' WHERE user_id='$userId'";
  }
  elseif ($_POST['form'] == 'address') {
      $address1 = strip_tags(trim($_POST['address1']));
      $address2 = strip_tags(trim($_POST['address2']));
      $postcode = strip_tags(trim($_POST['postcode']));
      $city = strip_tags(trim($_POST['city']));
      $country = strtoupper(strip_tags(trim($_POST['country'])));
      if (empty($country)) {
          $country = 'DE';
      }

      $sql = "UPDATE `User` SET changed_at='$now',address1='$address1',address2='$address2',postcode='$postcode',city='$city',country='$country' WHERE user_id='$userId'";
  }
  elseif ($_POST['form'] == 'password') {
      $passwordOld = md5(strip_tags(trim($_POST['passwordOld'])));
      $passwordNew = md5(strip_tags(trim($_POST['passwordNew'])));

      $sql = "UPDATE `User` SET changed_at='$now',password='$passwordNew' WHERE user_id='$userId' AND password='$passwordOld'";
  }
  else {    // personnel details form
      $salutation = trim(strip_tags($_POST['salutation']));
      $salutation = strtolower($salutation);
      $firstName = trim(strip_tags($_POST['firstName']));
      $firstName = ucfirst(strtolower($firstName));
      $lastName = trim(strip_tags($_POST['lastName']));
      $lastName = ucfirst(strtolower($lastName));
      $birthday = trim(strip_tags($_POST['birthday']));

      $sql = "UPDATE `User` SET changed_at='$now',salutation='$salutation',first_name='$firstName',last_name='$lastName',birthday='$birthday' WHERE user_id='$userId'";
  }

  if (!count($errors)) {
      mysqli_query($con, $sql);
      if (!empty($con->error)) {
          array_push($errors, $con->error);
      } else {
          $checkDbQuery = mysqli_query($con, "SELECT * FROM `User` WHERE user_id='$userId'");
          $checkLoginQuery = mysqli_num_rows($checkDbQuery);
          if (count($checkLoginQuery)>0) {
              $row = mysqli_fetch_assoc($checkDbQuery);

              $_SESSION['user'] = $row;

              include './agegroup_calc.php';

              $userEvents = unserialize(trim($_SESSION['user']['serialized_events']));
              if (empty($userEvents)) {
                  $_SESSION['user']['events'] = '';
              }
              else {
                  $_SESSION['user']['events'] = implode(',', $userEvents);
              }
              $_SESSION['user']['logged_in'] = true;

              unset($_SESSION['user']['serialized_events']);
              unset($_SESSION['user']['password']);
              unset($_SESSION['user']['active']);
              unset($_SESSION['user']['last_login']);
              unset($_SESSION['user']['changed_at']);
              unset($_SESSION['user']['created_at']);
          }

          $success = true;
          $_SESSION['trials'] = 0;
      }
  }
}

echo json_encode(['success' => $success, 'errors' => $errors, 'user' => $_SESSION['user'], 'token' => $_SESSION['token']]);
