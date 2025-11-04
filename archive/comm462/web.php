<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="description" content="Web Design by Cory Fugate, digital designer and web developer." />
        <title>Web Design :: Cory Fugate - Digital Designer and Web Developer</title>
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
    <body class="web">
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
        <h2>Web Design</h2>
        <h3>Opdrop Redesign</h3>
        <p>As part of the founding team for a startup web application called Opdrop,
        my primary responsibility is the redesign of the UX. The site is currently being built
        out using a PHP and MySQL backend and javascript in the front end. I'll post a link here as we
        release it for beta testing.</p>
        <img src="images/portfolio/opdrop-webtopic-old.jpg" alt="old opdrop topic page"><img src="images/portfolio/opdrop-webtopic-new.jpg" alt="new opdrop topic page">
        <img src="images/portfolio/opdrop-weblist-old.jpg" alt="old opdrop topic page"><img src="images/portfolio/opdrop-weblist-new.jpg" alt="new opdrop topic page">
        


        <h3>Watts Properties</h3>
        <p>This website was designed for a manager of apartment complexes in Chico, California
            as a class assignment. I worked on a team of three, and my main focus was to design
            and create the layout. It uses PHP and a MySQL database for storing and retrieving
            the property information.</p>
        <img src="images/portfolio/watts-web-1.jpg" alt="watts properties homepage">
        <p><a href="http://www.collegeapartmentschico.com/" title="visit Watts Properties website">[Visit the Watts Properties website.]</a></p>

        <h3>Pineapple Papers</h3>
        <p>Pineapple Papers was built for a friend who is starting a DIY card & stationery business.
            She designed the site in Adobe Illustrator, and then I built it out based on her mocks.
            I added CSS3 animations into the link buttons on the shop, blog, and how-it-works pages.</p>
        <img src="images/portfolio/pineapple-web-1.jpg" alt="pineapple papers homepage"><img src="images/portfolio/pineapple-web-2.jpg" alt="pineapple papers">
        <p><a href="http://www.coryfugate.com/pineapplepapers/" title="visit pineapple papers website">[Visit the Pineapple Papers Prototype website.]</a></p>
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
