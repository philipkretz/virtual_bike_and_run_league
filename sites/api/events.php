<?php
require '../config/config.php';

$events = [];
$success = false;
$errors = [];
$now = date('Y-m-d H:i:s');
if (isset($_GET['use']) && $_GET['use'] == 'upload') {
    $sql = "SELECT * FROM `Event` where active=1 and start_date<'$now' and end_date>'$now' order by start_date";
    $userEvents = [];
    if (isset($_SESSION['user']['events'])) {
        $userEvents = explode(',', $_SESSION['user']['events']);
    }
}
elseif (isset($_GET['use']) && $_GET['use'] == 'ranking') {
    $sql = "SELECT * FROM `Event` where active=1 and start_date<'$now' order by start_date";
}
else {
    $sql = "SELECT * FROM `Event` where active=1 and end_date>='$now' order by start_date";
}

$checkDbQuery = mysqli_query($con, $sql);
$rowCount = mysqli_num_rows($checkDbQuery);
if ($rowCount>0) {
    while($event = mysqli_fetch_assoc($checkDbQuery)) {
        $event['distances'] = unserialize($event['serialized_distances']);
        unset($event['serialized_distances']);

        $event['charity_actions'] = unserialize($event['serialized_charity_actions']);
        unset($event['serialized_charity_actions']);

        $event['running'] = false;
        if ($now >= $event['start_date'] && $now <= $event['end_date']) {
            $event['running'] = true;
        }

        $event['soon'] = false;
        if ($now < $event['start_date'] && date_diff(date_create($now),date_create($event['start_date']))->days < 3) {
            $event['soon'] = true;
        }

        $event['start_date'] = str_replace('-','/',$event['start_date']);
        $event['end_date'] = str_replace('-','/',$event['end_date']);

        if (isset($_GET['use']) && $_GET['use'] == 'upload') {
            if (in_array($event['event_id'],$userEvents)) {
                $_SESSION['CURRENT_EVENT'] = $event;
            }
        }

        $events[] = $event;
    }
    $success = true;
}

echo json_encode(['success' => $success, 'errors' => $errors, 'events' => $events]);