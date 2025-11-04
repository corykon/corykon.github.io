<?php
	$openaccess = true;
    include 'modules/phphead.inc';
?>
<?php
session_start();
//Check to see if the form has been submitted, if so use php to validate the inputs
//This check sees if the submit key exists in the POST object, if "true" the form has been submitted
if ($_POST['submit']) {

    // Create an empty error array to store any found errors
    $errors = array();

    //Check the name field using using the empty function
    if (empty($_POST['fName'])) {
        $errors['fname'] = 'The first name field is empty, please enter your first name';
    }

    //Check the name field using using the empty function
    if (empty($_POST['lName'])) {
        $errors['lname'] = 'The last name field is empty, please enter your last name';
    }

    //Check the name field using the empty function
    if (empty($_POST['subject'])) {
        $errors['subject'] = 'The subject is empty, please enter a subject.';
    }

    //Check the message field using the empty function
    if (empty($_POST['message'])) {
        $errors['message'] = 'The message field is empty, please enter your message';
    }

    //Check the email field
    if (empty($_POST['contactemail'])) {
        $errors['contactemail'] = 'The email field is empty, please enter a email address';
    }

    //Check the length of the email address -- x@x.xx - after trimming any empty spaces that may exist
    $tempEmail = trim($_POST['contactemail']);
    if (strlen($tempEmail) < 6) {
        $errors['emaillength'] = 'The email provided is too short, please enter a valid email address';
    }

    //Check the form of the email address using a regular expression
    $checkEmail = '/^[^@]+@[^\s\r\n\'";,@%]+$/';
    if (!preg_match($checkEmail, $tempEmail)) {
        $errors['invalidform'] = "Please provide a valid email address";
    }

    //checks the security code field
    if ($_SESSION['security_code'] != $_POST['cap_code'] && !empty($_SESSION['security_code'])) {
        $errors['security'] = 'Sorry, your entered security code does not match the security image.';
    }


//If there are no errors stored in the errors array proceed to assemble and then send the email message
    if (!$errors) {
        $to = 'ckfugate@gmail.com'; //Your email address goes here
        $subject = $_POST['subject'];
        $message = "First name: " . $_POST['fName'] . "\n";
        $message .= "Last name: " . $_POST['lName'] . "\n";
        $message .= "Email: " . $_POST['contactemail'] . "\n\a";
        $message .= $_POST['message'];
        $from = 'From:' . $_POST['contactemail'];
        mail($to, $subject, $message, $from);
        // After the message is sent create a confirmation message to display
        $successmessage = "Thank you, " . $_POST['fName'] . ". Your message has been sent.";
        unset($_POST);
    }
}
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Contact | BofR</title>
        <meta charset="UTF-8" />
        <link rel="stylesheet" href="css/borstyle.css" />
    </head>
    <body>
        <header>
        <h1><span>Cory K. Fugate</span></h1>
        <h2><span>Book of Remembrance</span></h2>

    </header>

    <div id="flourish"></div>
    <section id="content">
        <h3>Contact</h3>
          <?php
// This displays any errors that may have been found when we checked the inputs,
// if there are no errors, then this does nothing
            if ($errors) {
                echo '<div>';
                echo '<ul class="warning">';
                foreach ($errors as $alert) {
                    echo "<li>$alert</li>";
                }
                echo '</ul>';
                echo '</div>';
            } elseif ($successmessage) {
                // This displays the confirmation message if there is one
                echo "<p class=\"warning\">" . $successmessage . "</p>";
            }
        ?>
        	
            <p>Send me an E-mail by filling out this form:</p>
            <form method="post" action="contact.php" id="contactform">
                <fieldset>
                    <ul>
                        <li><label for="fName">First Name:</label><input type="text" name="fName" id="fName" size="15" required placeholder="Type first name" value="<?php
            if ($_POST['fName']) {
                echo $_POST['fName'];
            }
        ?>"></li>
            <li><label for="lName">Last Name:</label><input type="text" name="lName" id="lName" size="25" required placeholder="Type last name" value="<?php
                 if ($_POST['lName']) {echo $_POST['lName'];} ?>"></li>
            <li><label for="contactemail">Email Address:</label><input type="email" name="contactemail" id="contactemail" size="30" required placeholder="Type email address" value="<?php
                 if ($_POST['contactemail']) {echo $_POST['contactemail'];}
                 ?>"></li>
            <li><label for="subject">Subject:</label><input type="text" name="subject" id="subject" size="50" required placeholder="Type subject" value="<?php
                 if ($_POST['subject']) {echo $_POST['subject'];}?>"></li>
            <li><label for="message">Message:</label><textarea name="message" id="message" cols="40" rows="10" required placeholder="Type message here"><?php
                 if ($_POST['fName']) {echo $_POST['fName'];}?></textarea></li>
            <li><label for="submit">&nbsp;</label><input type="submit" name="submit" id="submit" value="Send Message"></li>
           </ul>
           </fieldset>
          </form>
            
             <footer>
            
             <?php include 'modules/borfooter.inc' ?>
            
         </footer>

</section>

<div id="side">
    <?php include 'modules/bornav.inc'; ?>
    <div id="flourish2"></div>
</div>

    </body>
</html>
