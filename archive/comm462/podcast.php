<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="description" content="Podcast by Cory Fugate, digital designer and web developer." />
        <title>Podcast :: Cory Fugate - Digital Designer and Web Developer</title>
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
    <body class="podcast">
    <div id="header">
        <div class="container">
        <?php
            include 'modules/header.inc';
        ?>
        </div>
    </div>
    <div id="content">
    <div class="container photobox">
        <div>
        <h2>Podcast</h2>
        <p>As an aspiring web designer, I took the opportunity during a COMM462 podcast assignemnt to go back in time
            and look at some old websites using the <a href="http://archive.org/web/web.php">Wayback Machine</a>. 
            I used Quicktime to grab video screenshots, and created the intro and conclusion slide images using
            Photoshop. The narration was recorded using the internal microphone of a Macbook Pro, and then music loops
            were created in Garageband. The final podcast was compiled and edited using the iMovie software from the iLife suite.</p>
        <iframe style="margin-left: 240px;" width="420" height="315" src="http://www.youtube.com/embed/b5qZdjZB6fI" frameborder="0" allowfullscreen></iframe>

        <p><a href="multimedia/yeOldeInternet.mp4" title="Ye Olde Internet">[View the MP4 version.]</a></p>
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
