<?php
require '../config/config.php';

if (empty($_GET['event_id']) || empty($_GET['list'])) {
    die;
}

function getUserLang() {
    $userLang = 'en';
    $knownLangs = array('en', 'de');
    $userPrefLangs = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
    foreach ($userPrefLangs as $idx => $lang) {
        $lang = substr($lang, 0, 2);
        if (in_array($lang, $knownLangs)) {
            $userLang = $lang;
            break;
        }
    }
    return $userLang;
}

function formatFloat($val) {
    return str_replace('.',',',(round((float) $val * 100) / 100).'').' km/h';
}

$results = [];
$errors = [];
$eventId = (int) $_GET['event_id'];
$list = trim(strip_tags($_GET['list']));

switch ($list) {
    case 'sex':
                $orderBy = 'u.salutation desc, r.speed_total desc, r.time_total asc';
                break;

    case 'agegroups':
                $orderBy = 'r.agegroup asc, r.speed_total desc, r.time_total asc';
                break;

    default:    $orderBy = 'r.speed_total desc, r.time_total';
                break;
}

if ($list == 'distance') {
    $sql = 'SELECT a.user_id,r.user_id,u.user_id,r.agegroup,u.display_name,u.salutation,u.motto,u.avatar,sum(a.distance)/1000 as distance_total from `Activity` a LEFT JOIN `Result` r ON a.event_id=r.event_id AND a.user_id=r.user_id LEFT JOIN `User` u ON r.user_id=u.user_id GROUP BY a.user_id,r.user_id,u.user_id,r.agegroup ORDER BY distance_total desc';

    $checkDbQuery = mysqli_query($con,$sql);
    $checkQuery = mysqli_num_rows($checkDbQuery);
    if($checkQuery > 0) {
        $i = 1;

        while ($row = mysqli_fetch_assoc($checkDbQuery)) {
            $row['rank'] = $i++;
            $row['name'] = htmlspecialchars($row['display_name']);
            $row['salutation'] = htmlspecialchars($row['salutation']);
            $row['motto'] = htmlspecialchars($row['motto']);
            $row['agegroup'] = htmlspecialchars($row['agegroup']);
            if (!empty($row['avatar'])) {
                $row['avatar'] = htmlspecialchars($row['avatar']);
            }
            $row['distance_total'] = ((int) floor($row['distance_total'] * 10) / 10).' km';

            if (getUserLang() == 'de') {
                $result = [
                    'platz' => $row['rank'],
                    'name' => $row['name'],
                    'motto' => $row['motto'],
                    'geschlecht' => $row['salutation'] == 'mr' ? 'M' : 'W',
                    'altersklasse' => $row['agegroup'],
                    'distanz_gesamt' => $row['distance_total'],
                ];
            }
            else {
                $result = [
                    'rank' => $row['rank'],
                    'name' => $row['name'],
                    'motto' => $row['motto'],
                    'sex' => $row['salutation'] == 'mr' ? 'M' : 'W',
                    'agegroup' => $row['agegroup'],
                    'distance_gesamt' => $row['distance_total'],
                ];
            }
            $results[] = $result;
        }

    }
    $success = true;
    echo json_encode(['success' => $success, 'errors' => $errors, 'ranking' => $results]);
    die;
}
else {
    $sql = "SELECT u.display_name,u.salutation,u.motto,u.avatar,r.agegroup,r.time_total,r.time_activity_1,r.time_activity_2,r.time_activity_3,r.time_activity_4,r.time_activity_5,r.speed_1,r.speed_2,r.speed_3,r.speed_4,r.speed_5,r.speed_total,r.by_speed,comment FROM `Result` r LEFT JOIN `User` u ON r.user_id=u.user_id where r.event_id='$eventId' order by " . $orderBy;
}

$lastSalutation = '';
$lastAgegroup = '';
$checkDbQuery = mysqli_query($con,$sql);
$checkQuery = mysqli_num_rows($checkDbQuery);
if($checkQuery > 0) {
    $i = 1;
    while ($row = mysqli_fetch_assoc($checkDbQuery)) {
        if ($list == 'sex' && $row['salutation'] != $lastSalutation) {
            $i = 1;
        }
        $lastSalutation = $row['salutation'];

        if ($list == 'agegroups' && $row['agegroup'] != $lastAgegroup) {
            $i = 1;
        }
        $lastAgegroup = $row['agegroup'];

        $row['rank'] = $i++;
        $row['name'] = htmlspecialchars($row['display_name']);
        $row['salutation'] = htmlspecialchars($row['salutation']);
        $row['motto'] = htmlspecialchars($row['motto']);
        $row['comment'] = htmlspecialchars($row['comment']);

        if (!empty($row['avatar'])) {
            $row['avatar'] = htmlspecialchars($row['avatar']);
        }

        if (getUserLang() == 'de') {
            $result = [
                'platz' => $row['rank'],
                'name' => $row['name'],
                'motto' => $row['motto'],
                'geschlecht' => $row['salutation'] == 'mr' ? 'M' : 'W',
                'altersklasse' => $row['agegroup'],
            ];

            if ($row['by_speed']) {
                $result['geschwindigkeit_gesamt'] = formatFloat($row['speed_total']);
                if (!empty($row['speed_1'])) {
                    $result['geschwindigkeit_1'] = formatFloat($row['speed_1']);
                }
                if (!empty($row['speed_2'])) {
                    $result['geschwindigkeit_2'] = formatFloat($row['speed_2']);
                }
                if (!empty($row['speed_3'])) {
                    $result['geschwindigkeit_3'] = formatFloat($row['speed_3']);
                }
                if (!empty($row['speed_4'])) {
                    $result['geschwindigkeit_4'] = formatFloat($row['speed_4']);
                }
                if (!empty($row['speed_5'])) {
                    $result['geschwindigkeit_5'] = formatFloat($row['speed_5']);
                }
            }
            else {
                $result['zeit_gesamt'] = $row['time_total'];
                if (!empty($row['time_activity_1'])) {
                    $result['zeit_1'] = $row['time_activity_1'];
                }
                if (!empty($row['time_activity_2'])) {
                    $result['zeit_2'] = $row['time_activity_2'];
                }
                if (!empty($row['time_activity_3'])) {
                    $result['zeit_3'] = $row['time_activity_3'];
                }
                if (!empty($row['time_activity_4'])) {
                    $result['zeit_4'] = $row['time_activity_4'];
                }
                if (!empty($row['time_activity_5'])) {
                    $result['zeit_5'] = $row['time_activity_5'];
                }
            }
            $result['sonstiges'] = $row['comment'];
        }
        else {
            $result = [
                'rank' => $row['rank'],
                'name' => $row['name'],
                'motto' => $row['motto'],
                'sex' => $row['salutation'] == 'mr' ? 'M' : 'W',
                'agegroup' => $row['agegroup'],
            ];

            if ($row['by_speed']) {
                $result['speed_total'] = formatFloat($row['speed_total']);
                if (!empty($row['speed_1'])) {
                    $result['speed_1'] = formatFloat($row['speed_1']);
                }
                if (!empty($row['speed_2'])) {
                    $result['speed_2'] = formatFloat($row['speed_2']);
                }
                if (!empty($row['speed_3'])) {
                    $result['speed_3'] = formatFloat($row['speed_3']);
                }
                if (!empty($row['speed_4'])) {
                    $result['speed_4'] = formatFloat($row['speed_4']);
                }
                if (!empty($row['speed_5'])) {
                    $result['speed_5'] = formatFloat($row['speed_5']);
                }
            }
            else {
                $result['time_total'] = $row['time_total'];
                if (!empty($row['time_activity_1'])) {
                    $result['split_1'] = $row['time_activity_1'];
                }
                if (!empty($row['time_activity_2'])) {
                    $result['split_2'] = $row['time_activity_2'];
                }
                if (!empty($row['time_activity_3'])) {
                    $result['split_3'] = $row['time_activity_3'];
                }
                if (!empty($row['time_activity_4'])) {
                    $result['split_4'] = $row['time_activity_4'];
                }
                if (!empty($row['time_activity_5'])) {
                    $result['split_5'] = $row['time_activity_5'];
                }
            }
            $result['comment'] = $row['comment'];
        }
        $results[] = $result;
    }

    $success = true;
}

echo json_encode(['success' => $success, 'errors' => $errors, 'ranking' => $results]);