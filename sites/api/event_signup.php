<?php
require '../config/config.php';

if (empty($_SESSION['user']['logged_in'])) {
  die;
}

$token = '';
$success = false;
$errors = [];

if (isset($_POST['event_id'])) {
  // check csrf token
  if ($_SESSION['token'] != trim($_POST['token'])) {
    die;
  }

  $eventId = (int) $_POST['event_id'];

  $min = 1000;
  $max = getrandmax();
  $_SESSION['token'] = $token = rand($min, $max);
  $userEventsSession = trim($_SESSION['user']['events']);
  if (empty($userEventsSession)) {
    $userEvents = [];
  }
  else {
    $userEvents = explode(',', $userEventsSession);
  }

  if (!in_array($eventId,$userEvents)) {
    $userEvents[] = $eventId;
    $serializedEvents = $_SESSION['user']['events'] = implode(',',$userEvents);
    $serializedEvents = strip_tags(serialize($userEvents));

    $now = date('Y-m-d H:i:s');
    $userId = (int) $_SESSION['user']['user_id'];
    $sql = "UPDATE `User` SET changed_at='$now',serialized_events='$serializedEvents' WHERE user_id='$userId'";
    mysqli_query($con, $sql);

    $sql = "UPDATE `Event` SET participants=participants+1 WHERE event_id='$eventId'";
    mysqli_query($con, $sql);

    $success = true;
  }
}

$eventName = trim(htmlspecialchars(strip_tags($_POST['event_name'])));
if ($_SESSION['user']['lang'] == 'de') {
    $subject = $eventName;
    $msg = 'Du hast dich erfolgreich für das Rennen '.$eventName.' auf '.PLATFORM_NAME." angemeldet.\r\n\r\n".
        'Viel Spaß beim Trainieren und lass es krachen!'."\r\n\r\n".
        'Um weitere Details zu erfahren, besuch '.PLATFORM_URL;

}
else {
    $subject = $eventName;
    $msg = 'Now you are registered for the race '.$eventName.' on '.PLATFORM_NAME.".\r\n\r\n".
        'Have fun at training and let it rock!'."\r\n\r\n".
        'For further details visit '.PLATFORM_URL;

}

@mail($_SESSION['user']['email'], $subject, base64_encode($msg), SEND_EMAIL_HEADER);

echo json_encode(['success' => $success, 'errors' => $errors, 'user' => $_SESSION['user']]);
