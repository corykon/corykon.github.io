<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="description" content="Portfolio of Cory Fugate, a web-developer-in-training from
              West Virginia. Currently looking for full time employment!" />
        <title>Cory Fugate - Digital Designer and Web Developer</title>
        <link href='http://fonts.googleapis.com/css?family=Ubuntu' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" href ="css/style.css" media="screen" />
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
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
    <body class="home">
    <div id="header">
        <div class="container">
        <?php
            include 'modules/header.inc';
        ?>
        </div>
    </div>
    <div id="content">
    <div class="container">
        <img id="splash" src="images/splash.png" alt="Digital Designer and Web Developer">

        <div class="intro">
            <h2>What I do:</h2>
            <img id="andsign" src="images/andsign.png" alt ="&">
            <div class="leftcol">
                <h3>{Design}</h3>
                <ul>
                    <li>UI/UX web design</li>
                    <li>Logos & Branding</li>
                    <li>Photography & digital editing</li>
                    <li>Flyer, card, & stationery</li>
                </ul>
            </div>
            <div class="rightcol">
                <h3>[Develop]</h3>
                <ul>
                    <li>Front end w/ HTML, CSS, JavaScript, PHP</li>
                    <li>Backend w/ SQL</li>
                    <li>Enterprise and Mobile App Dev </li>
                    <li>Software Testing </li>
                </ul>
            </div>
        </div>
    </div>
    </div>


    <div id="footer">
        <div class="container">
            <?php
             include 'modules/footer.inc';
            ?>
        </div>
    </div>
    </body>
</html>
