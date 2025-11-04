<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="description" content="Self-portrait by Cory Fugate, digital designer and web developer." />
        <title>Self-portrait :: Cory Fugate - Digital Designer and Web Developer</title>
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
    <body class="print">
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
        <h2>Self Portrait</h2>
        <p>This self-portrait montage was created by blending together two photographs, one of a canal
        in Rexburg, and the other a portrait of myself taken at Nature Park. I began with minor edits to
        each image individually in Photoshop, including converting them to grayscale. Next I placed the portrait
        on top of the background and blended the two together using a layer mask.
        The typography was added last; I used a bold white font with a thin black outline to help it stand out.</p>
        <img src="images/portfolio/selfportrait-montage.jpg" alt="Self-portrait Montage">
        
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
