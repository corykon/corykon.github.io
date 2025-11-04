<?php
//Begin Processing the form information
if($_POST['btnMessage']){
    //check to see if required fields have been filled out
    $errors = array();
    if(empty($_POST['fname'])){
        $errors['email'] = "Please provide your name.";
    }
    if(empty($_POST['email'])){
        $errors['email'] = "Please provide your email address so I can respond.";
    }
    if(empty($_POST['message'])){
        $errors['message'] = "Please enter a message.";
    }
    if(empty($_POST['subject'])){
        $errors['subject'] = "Please provide a subject.";
    }
    if(strtolower($_POST['security']) != "a"){
        $errors['security'] = "Please type the first letter in the form below the security question.";
    }

    //Continue if there are no errors.
    if(!$errors){
      //Get the data from the form
      $firstname = $_POST['fname'];
      $lastname = $_POST['lname'];
      $email = $_POST['email'];
      $subject = $_POST['subject'];
      $message = $_POST['message'];

      $to = 'ckfugate@gmail.com';
      $from = 'From: '.$email;
      $message .= '\n-'.$firstname.' '.$lastname;

      //Send the email
      $diditwork = mail($to, $subject, $message, $from);

      //Did it send the message?
      if ($diditwork){
          $success = "Thanks $firstname, I'll get back to you soon.";
      }
      else {
          $failure = "Sorry $firstname, an error occured and your message wasn't sent.";

      }
    }
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<title>Contact | Space Camp</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link href="/classes/cit230/spacecamp/css/spacescreen.css" type="text/css" rel="stylesheet" media="screen" />


</head>

<body class="contact">

<div id="container">
<div id="header">
    <div>
    <?php
    include $_SERVER['DOCUMENT_ROOT'].'/classes/cit230/spacecamp/modules/spaceheader.inc';
    ?>
    </div>
</div>
    

<div id="nav">
    <div id="nav2">
    <?php
    include $_SERVER['DOCUMENT_ROOT'].'/classes/cit230/spacecamp/modules/spacenav.inc';
    ?>
    </div>
</div>


<div id="centercontainer">
<div id="leftside">
    <div>
       
    </div>
</div>

<div id="content">
    <div>
        <h1>Contact</h1>
        <p><strong>Send Letters To:</strong><br />
            Space Camp<br />
            4578 W 5600 S #345<br />
            Spacesville, CA 555555<br />
        </p>
        <p><strong>Call us at:</strong><br />
            555.677.4506
        </p>
        <br /><br />
        <p><strong>You can also use the form below to send us an email:</strong></p>
        
   <?php
        if($errors){
            echo "<p>Sorry, your message was not sent! All required fields were not filled.";
            echo '<ul>';
                foreach($errors as $item){
                echo "<li>$item</li>";
            }
            echo '</ul></p>';
        }

        if($success){
            echo "<p>$success</p>";
        }
        else if($failure){
            echo "<p>$failure</p>";
        }
   ?>

   <form action="/classes/cit230/spacecamp/pages/contact.php" method="post" id="contactme">
     <fieldset>
    <legend>Contact Information</legend>
	<table>
	<tr><td>
    <label for="fname">*First Name: </label>
	</td><td>
    <input type="text" id="fname" name="fname" size="15" 
           <?php if($_POST['fname']){echo "value='$_POST[fname]'";} ?>  /><br />
	</td></tr>
    <tr><td>
	<label for="lname">&nbsp; Last Name:</label>
	</td><td>
    <input type="text" id="lname" name="lname" size="25"
           <?php if($_POST['lname']){echo "value='$_POST[lname]'";} ?>  /><br />
    </td></tr>
	<tr><td>
	<label class="req" for="email">*Email:     </label>
    </td><td>
	<input type="text" id="email" name="email" size="30" 
           <?php if($_POST['email']){echo "value='$_POST[email]'";} ?>  /><br />
   </td></tr>
   </table>
   </fieldset>
   <fieldset>
    <legend>Message Information</legend>
	<table>
	<tr><td>
    <label for="subject">*Subject:  </label>
    </td><td>
	<input type="text" id="subject" name="subject" size="50"
           <?php if($_POST['subject']){echo "value='$_POST[subject]'";} ?>  /><br />
    </td></tr>
	<tr><td>
	<label class="req" for="message">*Message:</label>
    </td><td>
	<textarea name="message" id="message" cols="50" rows="10"><?php if($_POST['message']){echo "$_POST[message]";} ?></textarea><br />
    </td></tr>
	</table>
	<br />
    <br />
    <label for="security">*Security Question:</label><br />
    What is the first letter of the alphabet?
    <input type="text" id="security" name="security" size="1" /><br />
    <br />
    <label for="btnMessage">&nbsp;</label>
    <input type="submit" id="btnMessage" name="btnMessage" value="Send Message" /><br />
   </fieldset>
  </form>
  <h5>(*required fields)</h5>
    </div>
</div>
    
<div id="footer">
    <div>
    <?php
    include $_SERVER['DOCUMENT_ROOT'].'/classes/cit230/spacecamp/modules/spacefooter.inc';
    ?>
    </div>
</div>
</div>
</div>

</body>
</html>

