(() => {
  const root = document.body.dataset.root || "";
  const link = (path) => `${root}${path}`;
  const propertyLinks = `
    <h2><span>View an Apartment Now:</span></h2>
    <article><a href="${link("site/properties/hazel.html")}" title="717 Hazel Street"><img src="${link("site/images/littlehouse.png")}" alt="Student Housing Icon"><h3>717 Hazel Street</h3><h4>3 Bedroom, 1 1/2 Bath</h4></a></article>
    <article><a href="${link("site/properties/hobart.html")}" title="1195 Hobart Street"><img src="${link("site/images/littlehouse.png")}" alt="Student Housing Icon"><h3>1195 Hobart Street</h3><h4>3 Bedroom, 1 Bath</h4></a></article>
    <article><a href="${link("site/properties/1290sac.html")}" title="1290 W. Sacramento Ave"><img src="${link("site/images/littlehouse.png")}" alt="Student Housing Icon"><h3>1290 W. Sacramento Ave</h3><h4>3 Bedroom, 1 1/2 Bath</h4></a></article>
    <article><a href="${link("site/properties/1292sac.html")}" title="1292 W. Sacramento Ave"><img src="${link("site/images/littlehouse.png")}" alt="Student Housing Icon"><h3>1292 W. Sacramento Ave</h3><h4>3 Bedroom, 1 1/2 Bath</h4></a></article>`;
  const callout = `<section id="call"><h4 class="calltoday">Call Today to Reserve Your Apartment!</h4><h5>555.555.5555</h5></section>`;
  const components = {
    header: `<a href="${link("index.html")}" title="Watts Properties: Apartments in Chico California"><h1><span>watts<em>properties</em></span></h1></a>`,
    nav: `<nav><ul><li><a href="${link("index.html")}" title="homepage">home</a></li><li><a href="${link("site/about.html")}" title="about Watts Properties">about</a></li><li><a href="${link("site/properties/index.html")}" title="view properties and apartments in Chico California">properties</a></li><li><a href="${link("site/contact.html")}" title="ask about our Chico California apartments">contact</a></li><li><a href="${link("site/applications/index.html")}" title="download an apartment application">applications</a></li></ul></nav>`,
    proplinks: propertyLinks,
    interest: `<h2><span>Interested? Let Us Know!</span></h2><form id="interestForm"><ul><li><label for="txtfname">First Name:</label><input type="text" id="txtfname" size="12"></li><li><label for="txtlname">Last Name:</label><input type="text" id="txtlname" size="20"></li><li><label for="email">Email:</label><input type="email" id="email" size="20"></li><li><label for="phone">Phone Number:</label><input type="text" id="phone" size="16"></li><li><input type="submit" value="Submit"></li></ul></form>${document.body.classList.contains("home") ? callout : ""}`,
    footer: `<footer><div class="inner1"><div class="inner2"><h6>&copy;2011 Watts Properties</h6><ul><li><a href="${link("index.html")}">Home</a></li><li> | <a href="${link("site/about.html")}">About</a></li><li> | <a href="${link("site/properties/index.html")}">Properties</a></li><li> | <a href="${link("site/contact.html")}">Contact</a></li><li> | <a href="${link("site/applications/index.html")}">Applications</a></li><li> | <a href="${link("site/designteam.html")}">Design Team</a></li></ul></div></div></footer>`
  };
  document.querySelectorAll("[data-component]").forEach((element) => {
    element.innerHTML = components[element.dataset.component] || "";
  });
  document.addEventListener("submit", (event) => {
    if (event.target.matches("#interestForm, #contactform")) {
      event.preventDefault();
      window.alert("This is an archived site; its forms are no longer active.");
    }
  });
})();
