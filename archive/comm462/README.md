# PHP to Static HTML Conversion

This directory contains the converted static HTML version of the original PHP website. The conversion includes:

## Converted Files

### Core Pages
- `index.html` (converted from `index.php`)
- `bio.html` (converted from `bio.php`)
- `resume.html` (converted from `resume.php`)
- `contact.html` (converted from `contact.php`)
- `portfolio.html` (converted from `portfolio.php`)

### Portfolio Pages
- `photos.html` (converted from `photos.php`)
- `logo.html` (converted from `logo.php`)
- `print.html` (converted from `print.php`)
- `product.html` (converted from `product.php`)
- `podcast.html` (converted from `podcast.php`)
- `web.html` (converted from `web.php`)
- `selfport.html` (converted from `selfport.php`)

### Utility Pages
- `copyright.html` (converted from `copyright.php`)
- `sitemap.html` (converted from `sitemap.php`)

## Web Components

The PHP includes have been replaced with modern Web Components:

### `components/site-header.js`
- Contains the site navigation header
- Replaces the `modules/header.inc` PHP include
- Updates all links to use `.html` extensions

### `components/site-footer.js`
- Contains the site footer with social links and copyright
- Replaces the `modules/footer.inc` PHP include
- Updates all links to use `.html` extensions

## Key Changes Made

1. **PHP Includes Replaced**: All `<?php include 'modules/header.inc'; ?>` and `<?php include 'modules/footer.inc'; ?>` have been replaced with `<site-header></site-header>` and `<site-footer></site-footer>` web components.

2. **Links Updated**: All internal links have been updated from `.php` to `.html` extensions.

3. **Contact Form**: The contact form in `contact.html` is now static and includes information about integrating with form handling services.

4. **Removed PHP Logic**: All PHP processing code has been removed, including form validation and email sending functionality.

## Contact Form Integration

The contact form is currently static. To make it functional, integrate with one of these services:

### Option 1: Netlify Forms (if hosting on Netlify)
1. Add `netlify` attribute to the form tag
2. Add `data-netlify="true"` attribute
3. Remove the JavaScript alert and allow normal form submission

### Option 2: Formspree
1. Sign up at [formspree.io](https://formspree.io)
2. Replace form action with your Formspree endpoint
3. Remove the JavaScript alert

### Option 3: EmailJS
1. Sign up at [emailjs.com](https://emailjs.com)
2. Add EmailJS JavaScript library
3. Replace form submission with EmailJS send function

### Option 4: Getform
1. Sign up at [getform.io](https://getform.io)
2. Replace form action with your Getform endpoint

## Running the Website

Since this is now a static HTML website, you can:

1. **Local Development**: Use any local web server:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP (if available)
   php -S localhost:8000
   ```

2. **Deploy to Static Hosting**:
   - GitHub Pages
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Any other static hosting service

## Browser Compatibility

The Web Components used are supported in:
- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

For older browser support, you may want to add a polyfill:
```html
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@^2/webcomponents-loader.js"></script>
```

## Original PHP Files

The original PHP files are still present in the directory for reference. You can safely remove them once you've verified the HTML versions work correctly.

## Notes

- Some complex dynamic functionality from the original PHP site may need additional JavaScript implementation
- The photo gallery (photos.html) may need additional work if it relies heavily on server-side data processing
- Google Analytics tracking code is preserved in all pages
- All CSS and JavaScript files are unchanged and should continue to work