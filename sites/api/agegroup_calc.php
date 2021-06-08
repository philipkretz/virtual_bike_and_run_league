<?php

$sexPrefix = 'W';
if ($_SESSION['user']['salutation'] == 'mr') {
    $sexPrefix = 'M';
}
$age = floor((time() - strtotime($_SESSION['user']['birthday'])) / 31556926); // 31556926 is the number of seconds in a year
if ($age < 14) {
    $agegroup = $sexPrefix.'-U14';
}
if ($age < 16) {
    $agegroup = $sexPrefix.'-U16';
}
elseif ($age < 18) {
    $agegroup = $sexPrefix.'-U18';
}
elseif ($age < 21) {
    $agegroup = $sexPrefix.'-JUN';
}
elseif ($age < 25) {
    $agegroup = $sexPrefix.'20';
}
elseif ($age < 30) {
    $agegroup = $sexPrefix.'25';
}
elseif ($age < 35) {
    $agegroup = $sexPrefix.'30';
}
elseif ($age < 40) {
    $agegroup = $sexPrefix.'35';
}
elseif ($age < 45) {
    $agegroup = $sexPrefix.'40';
}
elseif ($age < 50) {
    $agegroup = $sexPrefix.'45';
}
elseif ($age < 55) {
    $agegroup = $sexPrefix.'50';
}
elseif ($age < 60) {
    $agegroup = $sexPrefix.'55';
}
elseif ($age < 65) {
    $agegroup = $sexPrefix.'60';
}
elseif ($age < 70) {
    $agegroup = $sexPrefix.'65';
}
elseif ($age < 75) {
    $agegroup = $sexPrefix.'70';
}
elseif ($age < 80) {
    $agegroup = $sexPrefix.'75';
}
elseif ($age < 85) {
    $agegroup = $sexPrefix.'80';
}
elseif ($age < 90) {
    $agegroup = $sexPrefix.'85';
}
else {
    $agegroup = $sexPrefix.'90';
}

$_SESSION['user']['agegroup'] = $agegroup;