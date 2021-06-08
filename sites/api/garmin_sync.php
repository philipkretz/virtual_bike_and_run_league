<?php
require '../config/config.php';

if (empty($_SESSION['user']['logged_in'])) {
    die;
}

if (empty($_GET['oauth_token']) || empty($_GET['oauth_verifier'])) {
    die;
}

$success = false;
$errors = [];
$oauth_token = strip_tags(trim($_GET['oauth_token']));
$oauth_verifier = strip_tags(trim($_GET['oauth_verifier']));
$activities = [];

$oauth_signature_method = "HMAC-SHA1";
$oauth_timestamp = time();
$oauth_version = "1.0";
$oauth_nonce = time();
$url = "https://connectapi.garmin.com/oauth-service/oauth/access_token";

$base_string = "POST&" . rawurlencode($url) ."&" .
    rawurlencode("oauth_consumer_key=".GARMIN_CLIENT_ID
        . "&oauth_token=$oauth_token"
        . "&oauth_signature_method=$oauth_signature_method"
        . "&oauth_nonce=$oauth_nonce"
        . "&oauth_timestamp=$oauth_timestamp"
        . "&oauth_version=$oauth_version"
        . "&oauth_verifier=$oauth_verifier");

$oauth_signature = hash_hmac("SHA1", $base_string, GARMIN_CLIENT_SECRET . "&", false);
$oauth_signature = rawurlencode(base64_encode(pack('H*', $oauth_signature)));

$authorization_HTTP_header = "$url?oauth_consumer_key=". rawurlencode(GARMIN_CLIENT_ID).
    "&oauth_token=".$oauth_token.
    "&oauth_signature_method=".$oauth_signature_method.
    "&oauth_timestamp=".$oauth_timestamp.
    "&oauth_nonce=". $oauth_nonce .
    "&oauth_version=1.0".
    "&oauth_verifier=".$oauth_verifier.
    "&oauth_signature=" . $oauth_signature;

$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_URL => $authorization_HTTP_header,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
));

$response = curl_exec($curl);
if (!curl_errno($curl)) {
    switch ($http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE)) {
        case 200:  # OK
            break;
        default:
            $errors[] = '#1 Unexpected response code '.$http_code;
    }
}
else {
    $errors[] = curl_error($curl);
}
curl_close($curl);

if (count($errors) == 0) {
    sleep(10);

    $userId = (int) $_SESSION['user']['user_id'];
    $query = mysqli_query($con, "SELECT * FROM Activity WHERE used=0 AND portal='garmin' AND user_id='$userId'");
    if (mysqli_num_rows($query)>0) {
        while ($activity = mysqli_fetch_assoc($query)) {
            $activities[] = $activity;
        }
    }
}

$_SESSION['ACTIVITIES_TMP'] = $activities;
echo json_encode(['success' => $success, 'errors' => $errors, 'refresh_token' => $oauth_token, 'activities' => $activities]);