<?php
require '../config/config.php';

if (empty($_SESSION['user']['logged_in'])) {
    die;
}

$activities = [];
$success = false;
$errors = [];
$now = date('Y-m-d H:i:s');
$code = trim(strip_tags($_GET['code']));
$authCode = trim(strip_tags($_GET['auth_code']));
$userId = (int) $_SESSION['user']['user_id'];
$refreshKey = '';

if (empty($code)) {
    die;
}

$startDate = str_replace(' ','T',$now).'Z';
$endDate = $startDate;

$distances = [];
if (isset($_SESSION['CURRENT_EVENT'])) {
    $startDate =  (new DateTime(str_replace('/','-',$_SESSION['CURRENT_EVENT']['start_date'])))->format('U');
    $endDate =  (new DateTime(str_replace('/','-',$_SESSION['CURRENT_EVENT']['end_date'])))->format('U');

    $distances = $_SESSION['CURRENT_EVENT']['distances'];
}

$ch = curl_init();

if (!empty($_SESSION['user']['strava_token'])) {
    $postData = [
        'client_id' => STRAVA_CLIENT_ID,
        'client_secret' => STRAVA_CLIENT_SECRET,
        'refresh_token' => $code,
        'grant_type' =>  'refresh_token'
    ];
}
else {
    $postData = [
        'client_id' => STRAVA_CLIENT_ID,
        'client_secret' => STRAVA_CLIENT_SECRET,
        'code' => $code,
        'grant_type' => 'authorization_code'
    ];
}

curl_setopt_array($ch, [
    CURLOPT_URL => 'https://www.strava.com/oauth/token',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $postData,
    CURLOPT_FOLLOWLOCATION => true
]);

$output = curl_exec($ch);

if (!curl_errno($ch)) {
    switch ($http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE)) {
        case 200:  # OK
            break;
        default:
            $errors[] = '#1 Unexpected response code '.$http_code;
    }
}
else {
    $errors[] = curl_error($ch);
}
curl_close($ch);

if (count($errors) == 0) {
    $bearerResult = json_decode($output, true);

    $refreshKey = $bearerResult['refresh_token'];
    $_session['user']['strava_token'] = $refreshKey;
    mysqli_query($con, "UPDATE `User` SET strava_token='$refreshKey' WHERE user_id='$userId'");

    $getParams = '?before=' . $endDate . '&after=' . $startDate;
    $cl = curl_init('https://www.strava.com/api/v3/athlete/activities' . $getParams);
    curl_setopt($cl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($cl, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($cl, CURLOPT_HTTPHEADER, ["Authorization: Bearer " . $bearerResult['access_token']]);

    $output = curl_exec($cl);
    if (!curl_errno($cl)) {
        switch ($http_code = curl_getinfo($cl, CURLINFO_HTTP_CODE)) {
            case 200:  # OK
                break;
            default:
                $errors[] = '#2 Unexpected response code '.$http_code;
        }
    }
    else {
        $errors[] = curl_error($ch);
    }
    curl_close($cl);

    if (count($errors) == 0) {
        $activityResult = json_decode($output, true);
        if (!empty($activityResult)) {
            foreach ($activityResult as $activity) {
                if (!in_array($activity['type'], ['VirtualRide', 'VirtualRun', 'Ride', 'Run'])) {
                    continue;
                }

                $fits = false;
                $sports = '';
                $altitude = 0;
                foreach ($distances as $dist) {
                    if (isset($dist['time'])) {
                        $timeInSec = $dist['time'] * 60;
                        if ($dist['sports'] == 'bike' && in_array($activity['type'], ['VirtualRide', 'Ride'])) {
                            if ($activity['moving_time'] >= $timeInSec) {
                                if (!isset($dist['altitude']) || $activity['total_elevation_gain'] > $dist['altitude']) {
                                    $sports = 'bike';
                                    $fits = true;
                                    $altitude = @$dist['altitude'];
                                    break;
                                }
                            }
                        } elseif ($dist['sports'] == 'run' && in_array($activity['type'], ['VirtualRun', 'Run'])) {
                            if ($activity['moving_time'] >= $timeInSec) {
                                $sports = 'run';
                                $fits = true;
                                break;
                            }
                        }
                    }
                    else {
                        if ($dist['sports'] == 'bike' && in_array($activity['type'], ['VirtualRide', 'Ride'])) {
                            if ($activity['distance'] > $dist['dist'] * 1000) {
                                if ($activity['total_elevation_gain'] > $dist['altitude']) {
                                    $sports = 'bike';
                                    $altitude = @$dist['altitude'];
                                    $fits = true;
                                    break;
                                }
                            }
                        } elseif ($dist['sports'] == 'run' && in_array($activity['type'], ['VirtualRun', 'Run'])) {
                            if ($activity['distance'] > $dist['dist'] * 1000) {
                                $sports = 'run';
                                $fits = true;
                                break;
                            }
                        }
                    }
                }

                if (!$fits) {
                    continue;
                }

                $wattsPerKilo = 0;
                if ($_SESSION['user']['weight'] > 0) {
                    $userWeightKg = (int)$_SESSION['user']['weight'];
                    if ($_SESSION['user']['weight_format'] == 'lb') {
                        $userWeightKg = (float) $userWeightKg / 2.681;
                    }
                    $wattsPerKilo = (float) $activity['average_watts'] / $userWeightKg;
                }

                $activity['average_speed'] = (float) $activity['average_speed']*3.6;
                if (§wattsPerKilo>0 && in_array($activity['type'], ['VirtualRide','Ride'])) {
                    $activity['average_speed'] = (float) $wattsPerKilo * WATT_PER_KG_COEFF;
                    $activity['average_speed'] += $activity['distance'] / $altitude * ALTITUDE_COEFF;
                }
                elseif (empty($activity['average_speed'])) {
                    $activity['average_speed'] = $activity['distance'] / $activity['moving_time'] * 3600;
                }

                if ($wattsPerKilo > 6) {
                    continue;
                }

                if ($activity['average_heartrate'] < 80) {
                    continue;
                }

                $activities[] = [
                    'activity_id' => $activity['id'],   // external id
                    'name' => $activity['name'] . ' (' . (round((int)$activity['distance'] / 100) / 10) . 'km in ' . floor((int) $activity['moving_time'] / 60) . ' min)',
                    'duration' => $activity['moving_time'],
                    'distance' => $activity['distance'],
                    'sports' => $sports,
                    'portal' => 'strava',
                    'start_date' => str_replace('T', ' ', str_replace('Z', '', $activity['start_date'])),
                    'start_date_local' => str_replace('T', ' ', str_replace('Z', '', $activity['start_date_local'])),
                    'timezone' => $activity['timezone'],
                    'heartrate_avg' => $activity['average_heartrate'],
                    'heartrate_max' => $activity['max_heartrate'],
                    'watts_avg' => $activity['average_watts'],
                    'speed_avg' => $activity['average_speed'],
                    'watts_per_kilo_avg' => $wattsPerKilo,
                    'altitude' => $activity['total_elevation_gain'],
                    'manual' => $activity['manual'],
                    'from_accepted_tag' => $activity['from_accepted_tag'],
                    'external_id' => $activity['external_id'],
                    'indoor' => in_array($activity['type'], ['VirtualRun', 'VirtualRide'])
                ];

            }
        }

        $success = true;
    }
}

$_SESSION['ACTIVITIES_TMP'] = $activities;
echo json_encode(['success' => $success, 'errors' => $errors, 'refresh_token' => $refreshKey, 'activities' => $activities]);