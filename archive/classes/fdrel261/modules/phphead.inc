<?php
    $sid = session_id();
    if(empty($sid)){
        session_start();
    }

    if (isset($_SESSION['member'])){
        $people = $_SESSION['member'];
    }
    /*Get info for currently logged in user */
    $loginflag = $_SESSION['userlogin'];
    $loginfirst = $_SESSION['userfirst'];
    $loginlast = $_SESSION['userlast'];
    $loginlevel = $_SESSION['userlevel'];

	if ($openaccess != true){
    if(!$loginflag || $loginlevel < 2){
        header('Location: /classes/fdrel261/tools/view/login.php');
        exit;
	}
	}
?>