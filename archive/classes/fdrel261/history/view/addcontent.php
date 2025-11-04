<?php
    include '../../modules/phphead.inc';

    if (isset($_SESSION['message'])){
        $message = $_SESSION['message'];
    }

    if (isset($_SESSION['errors'])){
        $errors = $_SESSION['errors'];
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Admin Add Life Journal Content | BofR</title>
        <meta charset="UTF-8" />
        <link rel="stylesheet" href="../../css/borstyle.css" />
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js"></script>
        <script type="text/javascript" src="/scripts/jquery.validate.js"></script>
        <script type="text/javascript" src="/scripts/regrules.js"></script>
    </head>
    <body>
        <header>
        <h1><span>Cory K. Fugate</span></h1>
        <h2><span>Book of Remembrance</span></h2>

        </header>

    <div id="flourish"></div>
    <section id="content">
        <h3>Add Life Journal Content</h3>
        <?php
            if ($message) {
                echo "<p class='notice'>$message</p>"; //--Notice the double quotes...
                if ($errors) {
                    echo "<ul class='notice'>";
                    foreach ($errors as $error) {
                         echo "<li>$error</li>";
                    }
                    echo "</ul>";
                }
            }
            $_SESSION['message'] = false;
        ?>
        <form action=".." id="addcontent" method="post">
            <fieldset>
                <legend>Enter Content Information:</legend>
                <ul class="nolist">
                    <li><label for="title">Content Title:</label>
                        <input type="text" name="title" id="title" size="50"></li>

                    <li><label for="ctext">Content Text:</label>
                        <textarea name="ctext" id="ctext" cols="40" rows="10"></textarea></li>
               

                    <li><input type="submit" name="addcontent" id="addcontent" value="Add Content"></li>
                </ul>
            </fieldset>

                 

        </form>
        <p><a href=".." title="View Content"> View Full Personal History Content List &gt;&gt; </a></p>
          <footer>

             <?php include '../../modules/borfooter.inc'; ?>
            
         </footer>

</section>

<div id="side">
    <?php include '../../modules/bornav.inc'; ?>
    <div id="flourish2"></div>
</div>
    </body>

</html>
