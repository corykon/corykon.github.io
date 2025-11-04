<?php
// This is the connection that allows you to talk
// with the database. This is using mysqli Object
// Oriented code
$server = 'p3plcpnl0566.prod.phx3.secureserver.net';
$db = 'coryfugatedotcom';
$user = 'coryfugatedotcom';
$pswd = 'Coryclakf!12';


$link = new mysqli($server, $user, $pswd, $db);
//echo "You successfully connected to the database as admin using mysqli.";
//Check for a connection error
$error_message = mysqli_connect_error();

if ($error_message != null) {
 //echo "<p>Error Message: $error_message</p>";
 exit;
// header('Location: /500.php');
// exit;
}
?>