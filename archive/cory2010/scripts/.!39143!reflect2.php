<?php
	/*
		----------------------------------------------------------------
		Easy Reflections by Richard Davey, Core PHP (rich@corephp.co.uk)
		v2 - 2nd March 2007
        Updates include changes by Monte Ohrt (monte@ohrt.com)
		----------------------------------------------------------------
		You are free to use this in any product, or on any web site.
		Latest builds at: http://reflection.corephp.co.uk
		----------------------------------------------------------------
		
		This script accepts the following $_GET parameters:
		
		img		        required	The source image (to reflect)
		height	        optional	Height of the reflection (% or pixel value)
		bgc		        optional	Background colour to fade into, default = #000000
        fade_start      optional    Start the alpha fade from whch value? (% value)
        fade_end        optional    End the alpha fade from whch value? (% value)
		jpeg	        optional	Output will be JPEG at 'param' quality (default 80)
        cache           optional    Save reflection image to the cache? (boolean)
	*/
	
	// Replace special chars to be HTML-Code
	function stringToHTML($string)
	{
