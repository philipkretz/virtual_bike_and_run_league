<?php
require '../config/config.php';

if (empty($_SESSION['user']['logged_in'])) {
    die;
}

/**
 * parses minutes to a formatted time string
 * @param $time
 * @param string $format
 * @return string
 */
function parseTime($time, $format = '%02d:%02d') {
    if ($time < 1) {
        return '';
    }
    $hours = floor($time / 60);
    $minutes = ($time % 60);
    return sprintf($format, $hours, $minutes);
}

$errors = [];
$success = false;

require './protect_request.php';

$activitiesSelected = $_POST['activities'];
if (count($activitiesSelected)>0) {
    $activities = [];
    if (isset($_SESSION['ACTIVITIES_TMP'])) {
        foreach ($_SESSION['ACTIVITIES_TMP'] as $activity) {
            foreach ($activitiesSelected as $activitySelected) {
                if ($activity['activity_id'] == $activitySelected) { // external id from connected portal
                    $activities[] = $activity;
                }
            }
        }
    }

    if (isset($_SESSION['CURRENT_EVENT'])) {
        $now = date('Y-m-d H:i:s');
        $userId = (int)$_SESSION['user']['user_id'];

        $distances = [];

        $eventId = $_SESSION['CURRENT_EVENT']['event_id'];
        $startDate = str_replace(' ', 'T', $_SESSION['CURRENT_EVENT']['start_date']) . 'Z';
        $endDate = str_replace(' ', 'T', $_SESSION['CURRENT_EVENT']['end_date']) . 'Z';

        $distances = $_SESSION['CURRENT_EVENT']['distances'];

        $activitiesUploaded = [];
        $checkDbQuery = mysqli_query($con, "SELECT * FROM `Activity` WHERE user_id='$userId' AND event_id='$eventId' and used=0");
        $checkQuery = mysqli_num_rows($checkDbQuery);
        if ($checkQuery<count($distances)) {
            while($row = mysqli_fetch_assoc($checkDbQuery)) {
                $activitiesUploaded[] = $row;
            }

            $distancesBlackList = [];
            foreach ($activitiesUploaded as $activityUploaded) {
                foreach ($activities as $key => $activity) {
                    if ($activity['activity_id'] == $activityUploaded['link']) {
                        unset($activities[$key]);
                    }
                }

                foreach ($distances as $distance) {
                    if ($activityUploaded['sports'] == $distance['sports']) {
                        if ((isset($distance['time']) && $activityUploaded['duration'] >= $distance['time'])
                            || (!isset($distance['time']) && $activityUploaded['distance'] >= $distance['dist']*1000
                                && $activityUploaded['distance'] >= $distance['dist']*1000+1000)
                            && (empty ($distance['altitude']) || $activityUploaded['altitude'] >= $distance['altitude'])) {
                            $distancesBlackList[] = $distance;
                        }
                    }
                }
            }

            $distances = array_diff($distances,$distancesBlackList);

            foreach ($activities as $activity) {
                foreach ($distances as $key => $distance) {
                    if ($activity['sports'] == $distance['sports']) {

                        if ((isset($distance['time']) && $activity['duration'] >= $distance['time']*60
                            && $activity['duration'] < $distance['time']*60+1200)
                           || (!isset($distance['time']) && $activity['distance'] >= $distance['dist']*1000
                            && $activity['distance'] < $distance['dist']*1000+1000)
                            && (empty ($distance['altitude']) || $activity['altitude'] >= $distance['altitude'])) {

                            $link = strip_tags(trim($activity['link']));
                            mysqli_query($con,"UPDATE `Activity` SET used=1 WHERE link='$link'");

                            // Upload activity
                            $sql = "INSERT INTO `Activity` 
                                        (`user_id`,`event_id`,`distance`,`duration`,`link`,`sports`,`speed_avg`,`portal`,
                                        `started_at`,`heartrate_avg`,`heartrate_max`,`watts_avg`,`watts_per_kilo_avg`,`indoor`,
                                        `altitude`,`created_at`,`used`) 
                                    VALUES 
                                        ('$userId','$eventId',".(int) $activity['distance'].",".(int) $activity['duration'].",
                                        '".strip_tags($activity['activity_id'])."','".strip_tags($activity['sports'])."',
                                        ".(int) $activity['speed_avg'].",
                                        '".strip_tags($activity['portal'])."','".strip_tags($activity['start_date_local'])."',
                                        ".(int) $activity['heartrate_avg'].",".(int) $activity['heartrate_max'].",
                                        ".(int) $activity['watts_avg'].",".(int) $activity['watts_per_kilo_avg'].",
                                        ".(int) $activity['indoor'].",".(int) $activity['altitude'].",'".date('Y-m-d H:i:s')."',1)";
                            mysqli_query($con, $sql);

                            if (empty($con->error)) {
                                $activitiesUploaded[] = $activity;
                                $success = true;

                                if (count($activitiesUploaded) == count($distances)) {
                                    // finished event - save result and send email

                                    $timeTotal = 0;
                                    $speedTotal = 0.0;
                                    foreach ($activitiesUploaded as $activityUploaded) {
                                        $timeTotal += (int) $activityUploaded['duration'];
                                    }
                                    foreach ($activitiesUploaded as $activityUploaded) {
                                        $timeCoeff = (float) $activityUploaded['duration'] / $timeTotal;
                                        $speedTotal += (float) $activityUploaded['speed_avg'] * $timeCoeff;
                                    }
                                    $timeTotal = parseTime($timeTotal);

                                    $timeActivity1 = isset($activitiesUploaded[0]['duration']) ? parseTime($activitiesUploaded[0]['duration']) : '';
                                    $timeActivity2 = isset($activitiesUploaded[1]['duration']) ? parseTime($activitiesUploaded[1]['duration']) : '';
                                    $timeActivity3 = isset($activitiesUploaded[2]['duration']) ? parseTime($activitiesUploaded[2]['duration']) : '';
                                    $timeActivity4 = isset($activitiesUploaded[3]['duration']) ? parseTime($activitiesUploaded[3]['duration']) : '';
                                    $timeActivity5 = isset($activitiesUploaded[4]['duration']) ? parseTime($activitiesUploaded[4]['duration']) : '';

                                    $speedActivity1 = (float) $activitiesUploaded[0]['speed_avg'];
                                    $speedActivity2 = (float) $activitiesUploaded[1]['speed_avg'];
                                    $speedActivity3 = (float) $activitiesUploaded[2]['speed_avg'];
                                    $speedActivity4 = (float) $activitiesUploaded[3]['speed_avg'];
                                    $speedActivity5 = (float) $activitiesUploaded[4]['speed_avg'];

                                    $wattsPerKg = (float) $activityUploaded['watts_per_kilo_avg'];
                                    $bySpeed = isset($distance['time']);

                                    $sql = "INSERT INTO `Result` 
                                                (`user_id`,`rank`,`agegroup`,`event_id`,`time_total`,`time_activity_1`,`time_activity_2`,
                                                `time_activity_3`,`time_activity_4`,`time_activity_5`,`speed_1`,`speed_2`,
                                                `speed_3`,`speed_4`,`speed_5`,`speed_total`,`watts_per_kg`,`by_speed`) 
                                                VALUES 
                                                (
                                                '$userId',0,'".strip_tags($_SESSION['user']['agegroup'])."','$eventId','$timeTotal',
                                                '$timeActivity1','$timeActivity2','$timeActivity3','$timeActivity4','$timeActivity5',
                                                '$speedActivity1','$speedActivity2','$speedActivity3','$speedActivity4','$speedActivity5',
                                                '$speedTotal','$wattsPerKg','$bySpeed'
                                                )";
                                    mysqli_query($con, $sql);

                                    $eventName = trim(htmlspecialchars(strip_tags($_POST['event_name'])));
                                    if ($_SESSION['user']['lang'] == 'de') {
                                        $subject = $eventName;
                                        $msg = 'Du hast soeben erfolgreich das Rennen '.$eventName.' beendet.'.".\r\n\r\n".
                                            'Alle Ergebnisse werden bald veröffentlicht.'."\r\n\r\n".
                                            'Um weitere Details zu erfahren, besuch '.PLATFORM_URL.'/#/ranking';

                                    }
                                    else {
                                        $subject = $eventName;
                                        $msg = 'You have successfully finished the race '.$eventName.".\r\n\r\n".
                                            'All results will be published soon.'."\r\n\r\n".
                                            'For further details visit '.PLATFORM_URL.'/#/ranking';

                                    }
                                    break;
                                }
                            }
                            else {
                                $success = false;
                                $errors[] = $con->error;
                            }
                        }
                    }
                }
            }
        }
        else {
            $errors[] = 'already_uploaded';
        }

    }
}

echo json_encode(['success' => $success, 'errors' => $errors, 'token' => $_SESSION['token']]);