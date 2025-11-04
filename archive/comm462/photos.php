<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="description" content="Portfolio of Cory Fugate, digital designer and web developer." />
        <title>Photography Portfolio :: Cory Fugate - Digital Designer and Web Developer</title>
        <link href='http://fonts.googleapis.com/css?family=Ubuntu' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" href ="css/style.css" media="screen" />
        <link rel="stylesheet" href="css/gallery.css" />
        <script type="text/javascript" src="scripts/xpath.js"></script>
        <script type="text/javascript" src="scripts/SpryData.js"></script>
        <script type="text/javascript" src="scripts/SpryEffects.js"></script>
        <script type="text/javascript">
        var dsAlbumBook = new Spry.Data.XMLDataSet("slideshow.xml", "/AlbumBook");
        var dsAlbums = new Spry.Data.XMLDataSet("slideshow.xml", "/AlbumBook/Album");
        var dsSlides = new Spry.Data.XMLDataSet("slideshow.xml", "/AlbumBook/Album[@path = '{dsAlbums::@path}']/Slide");
        </script>
        <script src="scripts/gallery.js"  type="text/javascript"></script>
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
    <body id="gallery">
    <div id="header">
        <div class="container">
        <?php
            include 'modules/header.inc';
        ?>
        </div>
    </div>
    <div id="content">
    <div class="container photobox">
        <div style="height: 750px;">
        <h2>Photography</h2>
            <div id="wrap">

              <div spry:region="dsAlbumBook dsAlbums" spry:choose="">
                <div spry:when="{dsAlbums::ds_RowCount} &gt; 1">
                  <p class="albumName">{@title}</p>
                  <p class="albumDesc">{@description}</p>
                </div>
                <div spry:default="">
                  <p class="albumName">{dsAlbums::@title}</p>
                  <p class="albumDesc">{dsAlbums::@description}</p>
                </div>
              </div>
              <div id="previews">
                <div id="galleries" spry:detailregion="dsAlbums" spry:if="{ds_RowCount} &gt; 1">
                      <div>
                  <p class="descTitle">Viewing Album:</p>
                  <select name="select" id="gallerySelect" onchange="dsAlbums.setCurrentRowNumber(this.selectedIndex);" spry:repeatchildren="dsAlbums">
                    <option spry:if="{ds_RowNumber} == {ds_CurrentRowNumber}" selected="selected">{@title}</option>
                    <option spry:if="{ds_RowNumber} != {ds_CurrentRowNumber}">{@title}</option>
                  </select>
                  <p class="descTitle" spry:if="'{@description}' != ''">Description:</p>
                  <p class="albumBookDesc" spry:if="'{@description}' != ''">{@description}</p>
                      </div>

                </div>
                <div id="controls">
                  <ul id="transport">
                    <li><a href="#" onclick="StopSlideShow(); AdvanceToNextImage(true); return false;" title="Previous">Previous</a></li>
                    <li class="pausebtn"><a href="#" onclick="if (gSlideShowOn) StopSlideShow(); else StartSlideShow(); return false;" title="Play/Pause" id="playLabel">Play</a></li>
                    <li><a href="#" onclick="StopSlideShow(); AdvanceToNextImage(); return false;" title="Next">Next</a></li>
                  </ul>
                </div>
                <div id="thumbnails" spry:region="dsSlides dsAlbums">
                  <div spry:repeat="dsSlides" onclick="HandleThumbnailClick('{ds_RowID}');" onmouseover="GrowThumbnail(this.getElementsByTagName('img')[0], '{@thumbWidth}', '{@thumbHeight}');" onmouseout="ShrinkThumbnail(this.getElementsByTagName('img')[0]);"> <img id="tn{ds_RowID}" alt="thumbnail for {@src}" src="{dsAlbums::@path}/{@src}" width="24" height="24" style="left: 0px; right: 0px;" /> </div>
                  <p class="ClearAll"></p>
                </div>
              </div>
                
              <div id="picture">
                <div id="mainImageOutline" style="width: 0px; height: 0px;"><img id="mainImage" alt="main image" />
                </div>
                    <div align="center" id="caption" spry:detailregion="dsSlides">{@caption}</div>
              </div>
              <p class="clear"></p>
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
