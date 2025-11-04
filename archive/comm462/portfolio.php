<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="description" content="Portfolio of Cory Fugate, digital designer and web developer." />
        <title>Portfolio :: Cory Fugate - Digital Designer and Web Developer</title>
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
    <body class="portfolio">
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
        <h2>Portfolio</h2>
        <p>Select a category below to view some of my recent work.</p>
        <ul>
            <li class="leftside"><a href="photos.php" title="Photography"><h3>Photography</h3><img src="images/thumb_photos.jpg" alt="Photography"></a></li>
            <li><a href="product.php" title="Product Redesign"><h3>Product Redesign</h3><img src="images/thumb_product.jpg" alt="Product Redesign"></a></li>
            <li class="leftside"><a href="logo.php" title="Logo Design"><h3>Logo Design</h3><img src="images/thumb_logo.jpg" alt="Logo Design"></a></li>
            <li><a href="web.php" title="Web Design"><h3>Web Design</h3><img src="images/thumb_web.jpg" alt="Web Design"></a></li>
            <li class="leftside"><a href="print.php" title="Print Design"><h3>Print Design</h3><img src="images/thumb_print.jpg" alt="Print Design"></a></li>
            <li><a href="podcast.php" title="Podcast"><h3>Podcast</h3><img src="images/thumb_podcast.jpg" alt="Podcast"></a></li>
        </ul>
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
