<?php
if (!$_SESSION) {
    session_start();
    $sessionid= session_id();
}
    $loginflag = $_SESSION['userlogin'];
    $loginfirst = $_SESSION['userfirst'];
    $loginlast = $_SESSION['userlast'];
    $loginlevel = $_SESSION['userlevel'];

    $cookiefirst = $_COOKIE['fname'];
?>
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
    if(strtolower($_POST['security']) != "10"){
        $errors['security'] = "Please answer the security question.";
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
      $message .= '\n-'.$firstname;

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

<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="description" content="Contact page for web and digital designer of Cory Fugate." />

        <title>Contact | coryfugate.com</title>
        <link href='http://fonts.googleapis.com/css?family=Lobster|Arvo' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" href ="css/style.css" media="screen" />
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.min.js"></script>
	<script type="text/javascript" src="scripts/slimbox2.js"></script>
	<link rel="stylesheet" href="css/slimbox2.css" type="text/css" media="screen" />

    <script type="text/javascript">

    var _gaq = _gaq || [];
     _gaq.push(['_setAccount', 'UA-15220341-1']);
     _gaq.push(['_trackPageview']);

    (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

    </script>

    </head>
    <body class="contact">
    <div id="header">
        <div>
        <?php
            include 'modules/header.inc';
        ?>
        <?php
            include 'modules/nav.inc';
        ?>
        </div>
    </div>
    <div id="content">
        <div>
           

        <h2> Contact </h2>
        <section id="column1">
        <h3>Send me an email:</h3>
         

   <form action="contact.php" method="post" id="contactme">
   <fieldset>

    <label for="fname">Name</label>
    <input type="text" id="fname" name="fname" size="15"
           <?php if($_POST['fname']){echo "value='$_POST[fname]'";} ?>  />

    <label class="req" for="email">Email</label>
	<input type="text" id="email" name="email" size="30"
           <?php if($_POST['email']){echo "value='$_POST[email]'";} ?>  /><br />

   </fieldset>
   <fieldset>

    <label for="subject">Subject</label>
    <input type="text" id="subject" name="subject" size="50"
           <?php if($_POST['subject']){echo "value='$_POST[subject]'";} ?>  /><br />

    <label class="req" for="message">Message</label>
    <textarea name="message" id="message" cols="50" rows="10"><?php if($_POST['message']){echo "$_POST[message]";} ?></textarea><br />
    <label for="security">Security Question: <span class="tiny"><em>(to make sure you're not a computer...)</em></span></label><br />
    <section id="sec">
        
        7 + 3=
        <input type="text" id="security" name="security" size="1" />
    </section>
    <label id="btnlabel" for="btnMessage">&nbsp;</label>
    <input class="btn-primary"type="submit" id="btnMessage" name="btnMessage" value="Send Message" /><br />
   </fieldset>
  </form>

        </section>

        <section id="column2">
        <h3>Or contact me on your preferred social network:</h3>
            <section class="social">
                <ul>
                    <li><a href="http://www.facebook.com/ckfugate" title="facebook me" class="fb"></a></li>
                    <li><a href="https://twitter.com/#!/corykonfugate" title="follow me" class="twitter"></a></li>
                    <li><a href="http://www.linkedin.com/pub/cory-fugate/44/434/768" title="connect with me" class="linkedin"></a></li>
                 </ul>
            </section>
        <?php
        if($errors){
            echo "<div class='alert errors'><p>Sorry, your message was not sent! All required fields were not filled:</p>";
            echo '<ul>';
                foreach($errors as $item){
                echo "<li>$item</li>";
            }
            echo '</ul></div>';
        }

        if($success){
            echo "<div class='alert success'><p>$success</p></div>";
        }
        else if($failure){
            echo "<div class='alert errors'><p>$failure</p></div>";
        }
   ?>

        </section>
        
        </div>
    </div>


            <?php
             include 'modules/footer.inc';
            ?>
    </body>
</html>
