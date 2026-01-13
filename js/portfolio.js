/*
    Author: Cory Fugate
    Date: 8/17/13
*/

//Create array of valid work items to navigate to
var existingWorkItem = [],
    navOnHashChange = true;
$('.work-item').each(function(){
    existingWorkItem['#' + $(this).attr('data-workitem')] = true;
});

$(function(){

   //***init the portfolio filtering
   $('#mywork').mixitup({targetSelector: '.work-item'});

   //****init portfolio item buttons
   // On mobile devices, the first tap on the portfolio item thumbnail will fire the hover event, pulling up
   // the title of the portfolio item. Because of that, we don't want the first click navigating them
   // away. So, if we detect a mobile browser, the user must click the button to navigate, but on normal
   // browsers,they can click anywhere on the thumbnail.
   var portItemBtnSelector = jQuery.browser.mobile ? '.work-item .action-btn' : '.work-item';
   $(portItemBtnSelector).click(function(){navigateOnItemClick(this);});

   //****init the hashchange event listener so that the back button works
   window.onhashchange = navigateOnHashChange;

   //****init links back to grid link
   $('#back-to-port, h1').click(function(){navigateBackHome()});

   //*** animate scroll to top
    $('#back-to-top').click(function(){
        $("html, body").animate({ scrollTop: 0 }, 600);
        return false;
    });


   /***Nav Sidebar Slider ***/
   $('li.contactme').click(function(){
       $('#maincontent').addClass('slide-to-reveal-sb');
   });

   $('nav ul').click(function(){
       if($(window).width() <= 650){
           $('#maincontent').addClass('slide-to-reveal-sb');
       }
   });

   $('nav ul:before').click(function(){
       $('#maincontent').addClass('slide-to-reveal-sb');
   });

   $('#maincontent').click(function(){
       if($(this).css("right")>="275px"){
            $(this).removeClass('slide-to-reveal-sb');
       }
   });

   $('#sidebar .close').click(function(){
        $('#maincontent').removeClass('slide-to-reveal-sb');
   })

   //***if the screen size changes, check to see if we need to change footer functionality
   $(window).resize(function(){
        checkFooterContactLink();
        keepFooterAtBottom();
    });


   /***Email Form Functionality***/
    (function() {
        emailjs.init({
            publicKey: "KXAlwMWC4rYKeDTOl",
        });
    })();

   //enable/disable send button
   $('form input').keyup(validateEmailForm);
   $('form textarea').keyup(validateEmailForm);

   //send the email if everything checks out
   document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault();
        if($('.action-btn').hasClass('disabled')){
            return; //button is disabled, so do nothing
        }

        if(isValidEmail($('#contact-email').val()) && $('#contact-message').val() !== ''){
            //send the email via POST
            emailjs.sendForm('service_7idwwxe', 'template_acsd3kf', this)
                .then(() => {
                    console.log('SUCCESS!');
                    emailSent();
                }, (error) => {
                    console.log('FAILED...', error);
                });

        //not a valid email or message, so complain
        } else {
            alert('Either that is an invalid email address, or your trying to sending me an empty message. Try again?');
        }
   });

   // Shared animation function for both hover and click events
   function startSkateboardAnimation(singleCycle) {
       var skateDiv = $('.skateboard');
       
       // Clear any existing animation first
       var existingTimeout = skateDiv.data('flipTimeout');
       skateDiv.data('frame', existingTimeout ? skateDiv.data('frame') : 1);
       if(existingTimeout) {
           clearTimeout(existingTimeout);
       }
       var frame = skateDiv.data('frame');
       var firstPass = true;
       var isAnimating = true;
       var shouldStopLooping = false;
       
       function animateFrame() {
           if (!isAnimating) return;
           
           skateDiv.css('background-image', 'url(resources/images/kickflip/kf' + frame + '.png)');
           
           // Check if we should stop looping (updated from element data)
           shouldStopLooping = skateDiv.data('shouldStopLooping');
           
           // If we should stop looping and we're back to frame 1, stop the animation
           if (shouldStopLooping && frame === 1 && !firstPass) {
               return; // End the animation on frame 1
           }
           
           // If this is a single cycle animation and we've completed one full cycle, stop
           if (singleCycle && frame === 1 && !firstPass) {
               return; // End the animation on frame 1 after one complete cycle
           }
           
           var delay;
           
           // If we're on frame 1, pause before starting the next pass (only for continuous loops)
           if (frame === 1 && !firstPass && !singleCycle) {
               delay = 500;
           } else if (frame === 8) {
                delay = 60;
           } else {
               // Calculate progressive delay: starts at 50ms, gradually increases to 75ms over frames 2-9
               // Formula: 50 + (25 * (frame-2) / 7) gives us a gradual increase from frame 2 to 9
               delay = 60 + (40 * ((frame - 2) / 7));
           }
           firstPass = false;
           frame++;
           if(frame > 9){
               frame = 1;
           }
           
           var flipTimeout = setTimeout(animateFrame, delay);
           skateDiv.data('flipTimeout', flipTimeout);
           skateDiv.data('frame', frame);
       }
       
       // Store the animation state on the element (reset flags for fresh start)
       skateDiv.data('isAnimating', true);
       skateDiv.data('shouldStopLooping', false);
       animateFrame(); // Start the animation
   }

   // on hover over the .signature-container, animate the kickflip by stepping through the 9 frames in the background image
   $('.signature-container').hover(function(){
       startSkateboardAnimation();
   }, function(){
       //on mouse out, let the animation finish its current cycle and end on frame 1
       $('.skateboard').data('shouldStopLooping', true);
   });

   // on click/tap on the .signature-container, trigger the skateboard animation
   $('.signature-container').on('click touchstart', function(e){
       e.preventDefault(); // Prevent any default behavior
       startSkateboardAnimation(true);
   });

   validateEmailForm();
   checkFooterContactLink();
   keepFooterAtBottom();

   //if on load the url has a hash in it (if they bookmarked or linked to a specific
   //portfolio item), then navigate there immediately.
   navigateOnHashChange();

   //unhide the sidebar after intital load to avoid flicker
   setTimeout(function(){$('#sidebar').css('opacity', 1);}, 1000);
});


//Email form- disable the send button if inputs aren't valid
function validateEmailForm(){
    if(isValidEmail($('#contact-email').val()) && $('#contact-message').val() !== ''){
       $('#sidebar .action-btn').removeClass('disabled');
    }else{
       $('#sidebar .action-btn').addClass('disabled');
    }
}

//Making sure the email has a chance at being legit
function isValidEmail(address){
    var atpos=address.indexOf("@");
    var dotpos=address.lastIndexOf(".");
    if (atpos<1 || dotpos<atpos+2 || dotpos+2>=address.length){
        return false;
    }else{
        return true;
    }
}

//If the screen width is less than 650px, than the contact me link should be a
//"mailto" link, otherwise, it should open the sidebar contact form.
function checkFooterContactLink(){
    var footerContactLink = $('footer li.contactme');

    if($(window).width() <= 650){
        footerContactLink.children('a').attr('href', 'mailto:cory.fugate@gmail.com');
        footerContactLink.off('click');
    }else{
        footerContactLink.children('a').attr('href', '#');
        footerContactLink.on('click', function(){$('#maincontent').addClass('slide-to-reveal-sb');});
    } 
}

function keepFooterAtBottom(){
  if(window.location.hash === ''){
    var navHeight = $('nav').height();
    var footerHeight = $('footer').height();
    $('#portfolio-grid').css('min-height', window.innerHeight - navHeight - footerHeight - 15);
  }
}

//If the hash changes, get to navigating (sadly only works on modern browsers)
function navigateOnHashChange(){
    var hash = window.location.hash;

    if(navOnHashChange){
        if (hash===''){
            navigateBackHome();
        }else if(existingWorkItem[hash]){
            navigateToWorkItem(hash.replace('#', ''));
        }
    }else{
        navOnHashChange = true;
    }
}

function navigateOnItemClick(el){
    var workItem = $(el).attr('data-workitem') || $(el).parent().attr('data-workitem');
    navOnHashChange = false; //if we're navigating via a click, dont try to nav again when hash changes'
    navigateToWorkItem(workItem);
}

function navigateToWorkItem(workItem){
   $('#portfolio-grid').addClass('show-item');
   $('#portfolio-item').addClass('show-item');
   $('#portfolio-item-content').load( "port-items/" + workItem + ".html", function() {
       // Initialize carousels after content is loaded
       initializeCarousels();
   });

   window.location.hash = workItem;
   $("html, body").animate({ scrollTop: 0 }, 600);
}

function navigateBackHome(){
    $('#portfolio-grid').removeClass('show-item');
    $('#portfolio-item').removeClass('show-item');
    setTimeout(function(){$('#portfolio-item-content').load( "port-items/placeholder.html" );}, 500);

    window.location.hash = ''
    $("html, body").animate({ scrollTop: 0 }, 600);
}

function emailSent(){
   $('#maincontent').removeClass('slide-to-reveal-sb');
   $('form input').val('');
   $('form textarea').val('');
   validateEmailForm();
   $('#loading').hide();
   
   alert('Email sent. Thanks!');
}

// Initialize image carousels for dynamically loaded content
function initializeCarousels() {
    $('.image-carousel').each(function() {
        const carousel = $(this);
        const images = carousel.find('.carousel-image');
        const prevBtn = carousel.find('.carousel-btn.prev');
        const nextBtn = carousel.find('.carousel-btn.next');
        const indicators = carousel.find('.carousel-indicators span');
        let currentIndex = 0;

        // Get the container width
        const containerWidth = carousel.find('.carousel-container').width();

        // Wrap each image in a slide div and then wrap all in track
        images.each(function() {
            $(this).wrap(`<div class="carousel-slide" style="width: ${containerWidth}px;"></div>`);
        });
        const slides = carousel.find('.carousel-slide');
        slides.wrapAll('<div class="carousel-track"></div>');
        const track = carousel.find('.carousel-track');

        // Ensure track starts at 0 position
        track.css('transform', 'translateX(0px)');

        function showImage(index) {
            // Calculate the transform value: first at +containerWidth, then 0, then negative values
            const translateX = containerWidth * (1 - index);
            track.css('transform', `translateX(${translateX}px)`);
            
            // Update indicators
            indicators.removeClass('active');
            indicators.eq(index).addClass('active');
            
            // Update button states
            prevBtn.prop('disabled', index === 0);
            nextBtn.prop('disabled', index === images.length - 1);
        }

        // Initialize first image
        showImage(0);

        // Previous button click
        prevBtn.on('click', function() {
            if (currentIndex > 0) {
                currentIndex--;
                showImage(currentIndex);
            }
        });

        // Next button click
        nextBtn.on('click', function() {
            if (currentIndex < images.length - 1) {
                currentIndex++;
                showImage(currentIndex);
            }
        });

        // Indicator clicks
        indicators.on('click', function() {
            currentIndex = $(this).index();
            showImage(currentIndex);
        });
    });
}

//Mobile Browser Detection (from http://detectmobilebrowsers.com/)
(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);