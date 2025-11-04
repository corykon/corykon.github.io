<?php
/***************** Start session if it hasn't been started yet ****************/
    $sid = session_id();
    if(empty($sid)){
        session_start();
    }

/***************** Include php function in model library file *****************/
    require_once 'model/modellibcontent.php';


/***************** If ADD CONTENT button has been clicked ********************/
if ($_POST['addcontent'] == 'Add Content') {
    
    $title = $_POST['title'];
    $text = $_POST['ctext'];

    // ***Validate Data***
    $errors = array();
    if (empty($title)) {
        $errors[] = 'Please provide a title.';
    }
    if (empty($text)) {
        $errors[] = 'Please content text.';
    }

    // ***Set appropriate message if there are errors***
    if (!empty($errors)) {
        $message = "Your form is incomplete:";
    }

    // ***Proceed if there aren't errors***
    if (empty($errors)) {
        $message = addContent($title, $text);
    }

    $_SESSION['message'] = $message;
    $_SESSION['errors'] = $errors;

    header('Location: ./view/addcontent.php');
    exit;
}

/********* If page is to be viewed, OR if EDIT link has been clicked **********/
elseif (isset($_GET['edit'])){
    $editid = $_GET['edit'];

    $contentitem = retrieveContent($editid);

    $_SESSION['contenttoedit'] = $contentitem;
    header('Location: ./view/editcontent.php');
    exit;
}
elseif (isset($_GET['view'])){
    $editid = $_GET['view'];

    $contentitem = retrieveContent($editid);
    $contentlist= content();

    $_SESSION['content'] = $contentlist;
    $_SESSION['contenttoedit'] = $contentitem;
    header('Location: ./view/viewcontent.php');
    exit;
}

/***************** If EDIT(UPDATE) button has been clicked ********************/
elseif(!empty($_POST['editcontent'])) {

    // Collect and assign values from the form to variables
    $bofrid = $_POST['bofrid'];
    $title = $_POST['title'];
    $text = $_POST['ctext'];

    

    $message = editContent($bofrid, $title, $text);

    $_SESSION['message'] = $message;
    header('Location: ./view/editcontent.php');
    exit;
}

/*****************If DELETE link has been clicked******************************/
elseif (isset($_GET['del'])){
    $delid = $_GET['del'];

    $contentitem = retrieveContentToDel($delid);

    $_SESSION['contenttodel'] = $contentitem;
    header('Location: ./view/deletecontent.php');
    exit;
}
/*****************If DELETE confirmation button has been clicked***************/
elseif(!empty($_POST['deleteid'])) {
    $userid = $_POST['deleteid'];
    $message = deleteContent($userid);

    $_SESSION['message'] = $message;
    header('Location: ./view/deletecontent.php');
    exit;
}



/*****************Load members page********************************************/
else{
    $contentlist= content();
    $_SESSION['content'] = $contentlist;
    header('Location: ./view/contentlist.php');
    exit;

}
?>