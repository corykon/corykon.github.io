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

<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="description" content="Design and web portfolio of Cory Fugate. Includes examples of website design,
              and also photography, logos, flyers, and other print media. " />

        <title>Portfolio | coryfugate.com</title>
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
    <body class="portfolio">
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
        <h2> Portfolio </h2>
        <p class="smaller">Below are links to some of my recent work. The majority of it is
        from class assignments at BYU-Idaho, but there are a few freelance
        jobs included as well. The design work was done using the Adobe Suite, specifically
        Photoshop, InDesign and Illustrator. Websites were coded by hand using HTML, CSS, PHP,
        JavaScript and MySQL databases.</p>
        

        <section id="column1">
        
        <article>
        <h3>Opdrop Redesign <span>UX Design</span></h3>
        <img src="/images/thumbs/opdrop.jpg" alt="Big Jud's Redesign" />
        <p>A current side project called Opdrop, which could be described as a Yelp for everything.
            A basic site was built out about a year or so ago, and I've recently joined the team to help
            in the redesign. View the new design mocks below.</p>
         <ul>
            <li><a href="portfoliofiles/opdropTopicPgold.jpg" rel="lightbox-portfolio" title="Opdrop Topic Page Old">Old Opdrop "Topic" Page &raquo;</a></li>
            <li><a href="portfoliofiles/opdropTopicPgnew.jpg" rel="lightbox-portfolio" title="Opdrop Topic Page New">New Opdrop "Topic" Page &raquo;</a></li>
            <li><a href="portfoliofiles/opdropListPgold.jpg" rel="lightbox-portfolio" title="Opdrop List Page Old">Old Opdrop "List" Page &raquo;</a></li>
            <li><a href="portfoliofiles/opdropListPgnew.jpg" rel="lightbox-portfolio" title="Opdrop List Page New">New Opdrop "List" Page &raquo;</a></li>
         </ul>
        </article>

        <article>
        <h3>Watts Properties <span>Full Website</span></h3>
        <img src="/images/thumbs/chico.jpg" alt="Watts Properties" />
        <p>This website was designed for a manager of apartment complexes in Chico, California
           as a class assignment. I worked on a team of three, and my main focus was to design and
           create the layout. It uses PHP and a MySQL database for storing and retrieving the property information.</p>
        <ul>
            <li><a href="portfoliofiles/wattsShot1.jpg" rel="lightbox-portfolio" title="Watts Properties Homepage">Screenshot 1 &raquo;</a></li>
            <li><a href="portfoliofiles/wattsShot2.jpg" rel="lightbox-portfolio" title="Watts Properties- Property Information Page">Screenshot 2 &raquo;</a></li>
            <li><a href ="http://www.collegeapartmentschico.com" title = "Watts Properties">Visit the Website &raquo;</a></li>
        </ul>
        </article>

        <article>
        <h3>Pineapple Papers <span>Website Prototype</span></h3>
        <img src="/images/thumbs/pineapple.jpg" alt="Pineapple Papers" />
        <p>Pineapple Papers was built for a friend who is starting a DIY card & stationery business. She designed
        the site in Adobe Illustrator, and then I built it out based on her mocks. I added CSS3 animations into
        the link buttons on the shop, blog, and how-it-works pages.</p>
        <ul>
            <li><a href="portfoliofiles/pineappleShot2.jpg" rel="lightbox-portfolio" title="Pineapple Papers How-It-Works Page">Screenshot 1 &raquo;</a></li>
            <li><a href ="pineapplepapers/" title = "Pineapple Papers">Visit the Website &raquo;</a></li>
        </ul>
        </article>

            <article>
        <h3>CSS Jurrasic Garden <span>Web Design</span></h3>
        <img src="/images/thumbs/jurassic.jpg" alt="CSS Jurassic Garden" />
        <p>A one page CSS styling assignment from COMM 310. We were given a copy of
           <em>CSS Zen Garden's</em> HTML markup and a random theme, and were asked to
           style it accordingly (without touching the markup). My theme assignment was
           the Jurassic period, a pocketwatch, and the color aqua.</p>
        <ul>
            <li><a href="portfoliofiles/cssgardenShot.jpg" rel="lightbox-portfolio" title="CSS Jurrasic Garden">Screenshot &raquo;</a></li>
            <li><a href ="/classes/comm310/csszen" title = "CSS Jurassic Garden">Visit the Website &raquo;</a><li>
        </ul>
        </article>

        <article>
        <h3>A Guide to COMM 310 <span>Full Website</span></h3>
        <img src="/images/thumbs/comm310.jpg" alt="Comm 310 Guide" />
        <p>The final project from a communications class last semester. We were to
        create a guide/tutorial website for future and current students of the class. This
        is another pretty simple design. I tend to prefer a clean, crisp layout as it makes
        sites alot more usable.
        </p>
        <ul>
            <li><a href="portfoliofiles/comm310Shot1.jpg" rel="lightbox-portfolio" title="A Guide to COMM 310 Homepage">Screenshot &raquo;</a></li>
            <li><a href ="/classes/comm310" title = "A Guide to COMM 310">Visit the Website &raquo;</a></li>
        </ul>
        </article>
            
        <article>
        <h3>NBA Stat Faceoff <span>Data Analytics Webpage</span></h3>
        <img src="/images/thumbs/nbastat.jpg" alt="NBA Stat Faceoff" />
        <p>Built using Domo Advanced Builder for a company competition. Allows you to
        compare over 5,000 player's stats in various ways, features Lebron James sporting
        a Domo jersey, and won me a trip to Cabo!</p>
         <ul>
            <li><a href="portfoliofiles/nbastatShot.jpg" rel="lightbox-portfolio" title="NBA Stat Faceoff">Screenshot &raquo;</a></li>
        </ul>
        </article>

        <!--<article>
        <h3>Book of Remembrance <span>Full Website</span></h3>
        <img src="/images/thumbs/bor.jpg" alt="Book of Rememberance" />
        <p>This website was created for my Family History class. Used a very minimal,
        clean design, which felt appropriate for the content matter. Used php and a MySQL database
        for the user account functionality. Most content requires
        a username/password to view, but you can still check out the design.</p>
        <ul>
            <li><a href="portfoliofiles/borShot1.jpg" rel="lightbox-portfolio" title="Book of Remembrance Landing Page">Screenshot 1 &raquo;</a></li>
            <li><a href="portfoliofiles/borShot2.jpg" rel="lightbox-portfolio" title="Book of Remembrance Content Page">Screenshot 2 &raquo;</a></li>
            <li><a href ="/classes/fdrel261" title = "Book of Rememberance">Visit the Website &raquo;</a></li>
        </ul>
        </article>
        
        <article>
        <h3>Legacy Homepage <span>Full Website</span></h3>
        <img src="/images/thumbs/oldsite.jpg" alt="coryfugate.com v1.0" />
        <p>This was the first design of my homepage, created in 2010 as the main
        project for my CIT 230 Intro to Web Design class. The site includes a short
        bio, list interests, a collection of 8 learning assignments, and an older
        resume and portfolio. </p>
        <ul>
            <li><a href="portfoliofiles/blank.jpg" rel="lightbox-portfolio" title="Legacy...">Screenshot 1 &raquo;</a></li>
            <li><a href="portfoliofiles/blank.jpg" rel="lightbox-portfolio" title="Legacy...">Screenshot 2 &raquo;</a></li>
            <li><a href ="/oldsite/" title = "coryfugate.com v1.0">Visit the Website &raquo;</a></li>
        </ul>
        </article>


        <article>
        <h3>Big Jud's Redesign <span>Web Design</span></h3>
        <img src="/images/thumbs/bigjuds.jpg" alt="Big Jud's Redesign" />
        <p>Another COMM 310 assignment. We were to pick a local Rexburg restaurant
        and create a basic design for it. Only a couple links in this page are active.</p>
         <ul>
            <li><a href="portfoliofiles/bigjudsShot.jpg" rel="lightbox-portfolio" title="Big Jud's Redesign Homepage">Screenshot &raquo;</a></li>
            <li><a href ="/classes/comm310/bigjuds" title = "Big Jud's Redesign">Visit the Website &raquo;</a></li>
        </ul>
        </article>-->
        
        <article>
        <h3>JNick & Joie <span>Logo Design</span></h3>
        <img src="/images/thumbs/jnick.jpg" alt="JNick and Joie" />
        <p>Logo Design for students in Rexburg who wanted to start a t-shirt company.
        I was given a picture of a design idea and asked to recreate an enhanced
        digital version. Used Adobe Illustrator.</p>
        <ul>
            <li><a href="portfoliofiles/jnickShot1.jpg" rel="lightbox-portfolio" title="JNick & Joie Logo Design Process">Design Process Screenshot &raquo;</a></li>
            <li><a href="portfoliofiles/jnickShot2.jpg" rel="lightbox-portfolio" title="JNick & Joie Logo Color Options">Logo Variations &raquo;</a></li>
        </ul>
        </article>
        
        <article>
        <h3>RadioNut <span>Logo Design</span></h3>
        <img src="/images/thumbs/radionut.jpg" alt="RadioNut" />
        <p>Logos designed for COMM 130, Intro to Visual Media. Created three logos for
        a fictional company in Adobe Illustrator. Also created a business card and stationary.</p>
         <ul>
            <li><a href="portfoliofiles/radioShot1.jpg" rel="lightbox-portfolio" title="RadioNut Logo Options">3 Logo Choices &raquo;</a></li>
            <li><a href="portfoliofiles/radioShot2.jpg" rel="lightbox-portfolio" title="RadioNut Logo Stationery/Business Card">Stationery/Business Card &raquo;</a></li>
         </ul>
        </article>

        <article>
        <h3>Film Facts <span>Brochure Design</span></h3>
        <img src="/images/thumbs/filmfacts.jpg" alt="Film Facts" />
        <p>Created in my COMM 130 class. The assignment was to choose any topic
        and create an informational brochure. Includes a logo design for a
        fictional company called "Film Facts". Created in Adobe InDesign.</p>
        <ul>
            <li><a href="portfoliofiles/filmfactsShot.jpg" rel="lightbox-portfolio" title="Film Facts Brochure">View the Brochure &raquo;</a></li>
        </ul>
        </article>

        </section>

        <section id="column2">
        <article>
        <h3>Digital Imaging Photobook<span>Photography</span></h3>
        <img src="/images/thumbs/photobook.jpg" alt="Digital Imaging Photobook" />
        <p>The final project from a photography class, a book with my favorite photos
        from each week of the semester. Took the pictures with a Canon Rebel XS, and edited
        them using Photoshop. The book itself was also created in Photoshop.</p>
        <ul>
            <li><a href="portfoliofiles/photobookShot1.jpg" rel="lightbox-portfolio" title="Digital Imaging Photobook Front Cover">View Front Cover &raquo;</a></li>
            <li><a href="portfoliofiles/photobookShot2.jpg" rel="lightbox-portfolio" title="Digital Imaging- Portraits">View Portraits Page &raquo;</a></li>
            <li><a href="portfoliofiles/photobookShot3.jpg" rel="lightbox-portfolio" title="Digital Imaging- Bannack Ghost Town">View Ghost Town Page &raquo;</a></li>
            <li><a href="classes/diphotobook/" title="Digital Imaging Photobook"><strong>*View a Flash Version of the Entire Book &raquo;</strong></a></li>
        </ul>
        </article>
        
        <!-- <article>
        <h3>Thomas Edison Montage <span>Digital Image Editing</span></h3>
        <img src="/images/thumbs/ideaEdison.jpg" alt="Edison Montage" />
        <p>Montage created in Photoshop by blending together a couple different images
        and adding type.</p>
        <ul>
            <li><a href="portfoliofiles/edisonShot.jpg" rel="lightbox-portfolio" title="Thomas Edison Photo Montage">View the Montage &raquo;</a></li>
        </ul>
        </article>-->

        <article>
        <h3>Olympic Montage <span>Digital Image Editing</span></h3>
        <img src="/images/thumbs/olympic.jpg" alt="Olympic Montage" />
        <p>Another montage created in Photoshop. This was created during the the most recent
        Winter Olympics in Vancouver.</p>
        <ul>
            <li><a href="portfoliofiles/olympicShot.jpg" rel="lightbox-portfolio" title="Winter 2010 Olympics Montage">View the Montage &raquo;</a></li>
        </ul>
        </article>

        <article>
        <h3>Crystal Clear <span>Flyer Design</span></h3>
        <img src="/images/thumbs/crystalclear.jpg" alt="Crystal Clear" />
        <p>Flyer designed for a couple roommates' window washing business last
        summer. Used Adobe Illustrator. Created logo by tracing w/ pen tool.</p>
        <ul>
            <li><a href="portfoliofiles/crystalclearShot.jpg" rel="lightbox-portfolio" title="Crystal Clear Business Flyer">View the Flyer &raquo;</a></li>
        </ul>
        </article>
        
        <article>
        <h3>Disco Ball <span>Flyer Design</span></h3>
        <img src="/images/thumbs/disco.jpg" alt="Disco Ball" />
        <p>Worked as BYU-Idaho Social Board's Promotions Manager a few semesters ago. This
        was the first of the flyers created for them, and it's the grooviest.</p>
        <ul>
            <li><a href="portfoliofiles/discoballShot.jpg" rel="lightbox-portfolio" title="Disco Ball Event Flyer">View the Flyer &raquo;</a></li>
        </ul>
        </article>

        <article>
        <h3>Red Carpet Dance <span>Flyer Design</span></h3>
        <img src="/images/thumbs/redcarpet.jpg" alt="Red Carpet Dance" />
        <p>Flyer created for a "Red Carpet" dance at BYU-Idaho. I was asked to incorporate
        a late-night feel, a red carpet, and movie theme. Drew Oscar w/ a pen tool, and edited images in
        Photoshop w/ selection tools to mask out their individual backgrounds.</p>
        <ul>
            <li><a href="portfoliofiles/redcarpetShot.jpg" rel="lightbox-portfolio" title="A Night on the Red Carpet Event Flyer">View the Flyer &raquo;</a></li>
        </ul>
        </article>

        <article>
        <h3>Shipwrecked Dance <span>Flyer Design</span></h3>
        <img src="/images/thumbs/shipwrecked.jpg" alt="Disco Ball" />
        <p>Flyer created in Photoshop for a pirate-themed dance. Again combined several different images using
            the selection tools. The Jack Sparrow lookalike fit quite nicely into the treasure chest.</p>
        <ul>
            <li><a href="portfoliofiles/shipwreckedShot.jpg" rel="lightbox-portfolio" title="Shipwrecked Event Flyer">View the Flyer &raquo;</a></li>
        </ul>
        </article>
        
        <article>
        <h3>Summer Solstice <span>Flyer Design</span></h3>
        <img src="/images/thumbs/summer.jpg" alt="Summer Solstice" />
        <p>Advertisement for an outdoor summer event at BYU-Idaho during my time as a Promotions Manager.
        I created two versions of the flyer, with one using "funner" font choices. Created in Adobe Illustrator.</p>
        <ul>
            <li><a href="portfoliofiles/summersolsticeShot1.jpg" rel="lightbox-portfolio" title="Summer Solstice Event Flyer">View the Flyer (Version 1) &raquo;</a></li>
            <li><a href="portfoliofiles/summersolsticeShot2.jpg" rel="lightbox-portfolio" title="Summer Solstice Event Flyer (Version 2)">View the Flyer (Version 2) &raquo;</a></li>
        </ul>
        </article>
        
        
        <article>
        <h3>Sadie Hawkins Dance <span>Flyer Design</span></h3>
        <img src="/images/thumbs/sadiehawkins.jpg" alt="Sadie Hawkins Dance" />
        <p>Another flyer, this one for a girls-ask-the-guys dance at BYU-Idaho. Created in Adobe Illustrator. </p>
        <ul>
            <li><a href="portfoliofiles/sadiehawkinsShot.jpg" rel="lightbox-portfolio" title="Sadie Hawkins Event Flyer">View the Flyer &raquo;</a></li>
        </ul>
        </article>
        </section>
        
        </div>
    </div>


            <?php
             include 'modules/footer.inc';
            ?>
    </body>
</html>
