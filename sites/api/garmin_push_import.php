<?php

define('ACCESS_HOST', 'garmin.com');

require '../config/config.php';

if (!strstr(ACCESS_HOST,$_SERVER['REMOTE_HOST'])) {
    die;
}

$activityResult = json_decode($_POST, true);
if (!empty($activityResult)) {
    foreach ($activityResult as $activity) {
        if (in_array($activity['activityType'], ['RUNNING','STREET_RUNNING','TRACK_RUNNING','TRAIL_RUNNING','TREADMILL_RUNNING'])) {
            $sports = 'run';
        }
        elseif (in_array($activity['activityType'],['CYCLING','CYCLOCROSS','DOWNHILL_BIKING','INDOOR_CYCLING','MOUNTAIN_BIKING','ROAD_BIKING','TRACK_CYCLING','RECUMBENT_CYCLING'])) {
            $sports = 'bike';
        }
        else {
            $sports = trim(strip_tags(strtolower($activity['activityType'])));
        }
        $garminUserId = (int) $activity['userId'];
        $uidQuery = mysqli_query($con,"SELECT user_id, weight FROM `User` WHERE garmin_user_id='$garminUserId' AND active=1");
        $userArr = mysqli_fetch_assoc($uidQuery);
        if (count($userArr)>0) {
            $userId = $userArr['user_id'];
            $weight = $userArr['weight'];
            $link = trim(strip_tags($activity['summaryId']));
            $duration = (int) $activity['durationInSeconds'];
            $portal = 'garmin';
            $startedAt = date('Y-m-d H:i:s',$activity['startTimeInSeconds']);
            $finishedAt = date('Y-m-d H:i:s',$activity['startTimeInSeconds']+$activity['startTimeOffsetInSeconds']);
            $heartrateAvg = (int) $activity['averageHeartRateInBeatsPerMinute'];
            $heartrateMax = (int) $activity['maxHeartRateInBeatsPerMinute'];
            $speedAvg = (float) $activity['averageSpeedInMetersPerSecond']*3.6; // in km/h
            $distance = (int) $activity['distanceInMeters'];
            $samples = $activity['samples'];
            $wattsPerKiloAvg = 0;
            $wattsSum = 0;
            foreach ($samples as $sample) {
                if (isset($samples['powerInWatts'])) {
                    $wattsSum += (float) $samples['powerInWatts'];
                }
            }
            $wattsAvg = (int) ($wattsSum / count($samples));
            $wattsPerKiloAvg = 0;
            if ($weight > 0) {
                $wattsPerKiloAvg = (float) ($wattsAvg / $weight);
            }
            $altitude = (int) $activity['totalElevationGainInMeters'];
            $indoor = in_array($activity['activityType'],['TREADMILL_RUNNING','INDOOR_CYCLING']);
            $checkDbQuery = mysqli_query($con, "REPLACE INTO `Activity` (
                                            `event_id`, `sports`, `user_id`, `link`, `duration`, `portal`, `started_at`, 
                                            `finished_at`, `heartrate_avg`, `heartrate_max`, `speed_avg`, `distance`, 
                                            `altitude`, `watts_avg`, `watts_per_kilo_avg`, `indoor`, `used`) VALUES (
                                            0,
                                            '$sports',
                                            '$userId',
                                            '$link',
                                            '$duration',
                                            '$portal',
                                            '$startedAt',
                                            '$finishedAt',
                                            '$heartrateAvg',
                                            '$heartrateMax',
                                            '$speedAvg',
                                            '$distance',
                                            '$altitude',
                                            '$wattsAvg',
                                            '$wattsPerKiloAvg',
                                            '$indoor',
                                            0)");
        }
    }
}
