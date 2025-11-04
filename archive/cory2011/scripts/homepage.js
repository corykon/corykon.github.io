/* 
 * Cory Fugate
 * Scripting for my Homepage
 * 1/15/12
 */

  $(document).ready(function () {
            var worktitles = ["Digital Imaging by Cory Fugate | Photobook", "Opdrop | Website Redesign", "Watts Properties | Website",
                "CSS Jurassic Garden | Website", "Pineapple Papers | Website"];
            var curlabel = 0;

            //remove js warning and add images
            $('#jswarning').remove();
            $('#carousel-images').append('<li><img src="images/opdropcarousel.jpg" title="Thomas Edison Photo Montage"></li><li><img src="images/wattscarousel.jpg" title="Watts Properties Website"></li><li><img src="images/jurassiccarousel.jpg" title="CSS Jurrasic Garden Carousel"></li><li><img src="images/pineapplecarousel.jpg" title="Pineapple Papers Website"></li>');
           

            //Callback function to swap labels as the carousel slides
            function swaplabel (carousel, item, idx, state) {
                $('div.worklabel h4').html(worktitles[idx-1]);
            };

            // initialize the carousel
            $('.carousel').jcarousel({
		buttonNextHTML:"<div id='rightarrow'><div class='rarrow'></div></div>",
		buttonPrevHTML:"<div id='leftarrow'><div class='larrow'></div></div>",
		scroll:1,
		animation:600,
                itemFirstInCallback: swaplabel
            });

            //Add labels for carousel
             $('div.jcarousel-clip').append('<div class="worklabel"><h4>' + worktitles[0] + '</h4></div>');

           
      });


