<?php
/***************** Start session if it hasn't been started yet ****************/
    $sid = session_id();
    if(empty($sid)){
        session_start();
    }

/***************** Include php function in model library file *****************/
    require_once 'model/modellib.php';


/***************** If REGISTRATION button has been clicked ********************/
if ($_POST['registration'] == 'Register') {
    
    $fname = $_POST['txtfname'];
    $lname = $_POST['txtlname'];
    $username = $_POST['username'];
    $email = $_POST['emailaddress'];
    $pswd = $_POST['pswd'];

    // ***Validate Data***
    $errors = array();
    if (empty($fname)) {
        $errors[] = 'Please provide your first name.';
    }
    if (empty($lname)) {
        $errors[] = 'Please provide your last name.';
    }
    if (empty($username)) {
        $errors[] = 'Please provide a username.';
    }
    if (empty($email)) {
        $errors[] = 'Please provide your email address.';
    }
    if (empty($pswd)) {
        $errors[] = 'Please provide a password.';
    }

    // ***Set appropriate message if there are errors***
    if (!empty($errors)) {
        $message = "Your registration form is incomplete:";
    }


    // ***Proceed if there aren't errors***
    if (empty($errors)) {
        $message = regUser($fname, $lname, $username, $email, $pswd); //calls regUser function
        if(substr($message, 0, 1)=="A"){
            setcookie("fname", $fname, mktime() + (3600*24*30), "/");
        }

    }

    $_SESSION['message'] = $message;
    $_SESSION['errors'] = $errors;

    //*****To refill the form if their were errors...do this more efficiently...
    $_SESSION['txtfname'] = $fname;
    $_SESSION['txtlname'] = $lname;
    $_SESSION['username'] =$username;
    $_SESSION['emailaddress'] =$email;
    $_SESSION['pswd'] =$pswd;
    

    header('Location: ./view/registration.php');
    exit;
}

/***************** If EDIT link has been clicked ******************************/
elseif (isset($_GET['edit'])){
    $editid = $_GET['edit'];

    $user = retrieveRecToEdit($editid);

    $_SESSION['membertoedit'] = $user;
    header('Location: ./view/edit.php');
    exit;
}

/***************** If EDIT(UPDATE) button has been clicked ********************/
elseif(!empty($_POST['update'])) {

    // Collect and assign values from the form to variables
    $userid = $_POST['updateId'];
    $fname = $_POST['txtfname'];
    $lname = $_POST['txtlname'];
    $email = $_POST['emailaddress'];

    // The password is treated carefully, we only edit if the user entered a new one
    if(!empty ($_POST['pswd'])){
        $password = $_POST['pswd'];
    }

    $message = editUser($fname, $lname, $email, $password, $userid);

    $_SESSION['message'] = $message;
    header('Location: ./view/edit.php');
    exit;
}

/*****************If DELETE link has been clicked******************************/
elseif (isset($_GET['del'])){
    $delid = $_GET['del'];

    $user = retrieveRecToDel($delid);

    $_SESSION['membertodel'] = $user;
    header('Location: ./view/delete.php');
    exit;
}
/*****************If LOGOUT link has been clicked******************************/
elseif (isset($_GET['logout'])){


    $_SESSION['userlogin'] = false;
    header('Location: /classes/fdrel261/home.php');
    exit;
}

/*****************If DELETE confirmation button has been clicked***************/
elseif(!empty($_POST['deleteid'])) {
    $userid = $_POST['deleteid'];
    $message = delete($userid);

    $_SESSION['message'] = $message;
    header('Location: ./view/delete.php');
    exit;
}


/*****************If LOGIN button has been clicked***************/
elseif(!empty($_POST['login'])) {

    // Collect and assign values from the form to variable
    $uname = $_POST['txtuname'];
    $pswd = $_POST['pswd'];
    $user = array();
    $user = login($uname, $pswd);

    if(empty($user)){
        $message = 'Failed to login...double check your username and password.';
        $_SESSION['message'] = $message;
        header('Location: ./view/login.php');
    }else{
        $message = "Welcome, ".$user[1];
        $_SESSION['message'] = $message;

        $_SESSION['userlogin'] = true;
        $_SESSION['userlevel'] = $user[4];
        $_SESSION['userfirst'] = $user[1];
        $_SESSION['userlast'] = $user[2];
        $_SESSION['userid'] = $user[0];
        $_SESSION['useremail'] = $user[3];
        setcookie("fname", $user[1], mktime() + (3600*24*30), "/");


        header('Location: /classes/fdrel261/home.php');
        exit;
    }
}

/*****************Load members page********************************************/
else{
    $users= members();
    $_SESSION['member'] = $users;
    header('Location: ./view/members.php');
    exit;

}
?>