document.addEventListener("DOMContentLoaded", () => {
  const sidebarCell = document.querySelector("body > table > tbody > tr > td:first-child");
  if (!sidebarCell) return;
  sidebarCell.style.verticalAlign = "top";

  document.querySelectorAll('span[style*="mso-ignore"]').forEach((span) => {
    const image = span.querySelector('img[src*="_files/image"]');
    if (image && image.getBoundingClientRect().left < sidebarCell.getBoundingClientRect().right) {
      span.remove();
    }
  });

  const links = [
    ["Home", "index.htm"],
    ["My Work", "mywork.htm"],
    ["Athletics/Clubs", "athletics.htm"],
    ["Academics", "academics.htm"],
    ["Resume", "resume.html"],
    ["Goals", "goals.htm"],
    ["Reflection", "reflection.htm"],
    ["Hobbies", "hobbies.htm"]
  ];
  const nav = document.createElement("nav");
  nav.className = "webfolio-sidenav";
  nav.setAttribute("aria-label", "Webfolio navigation");
  nav.innerHTML = links.map(([label, href]) => `<a href="${href}">${label}</a>`).join("");

  sidebarCell.replaceChildren(nav);
});
