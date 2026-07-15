document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  const response = await fetch("/partials/sidebar.html");
  container.innerHTML = await response.text();

  const activePage = document.body.dataset.page;
  const activeLink = container.querySelector(`[data-nav="${activePage}"]`);
  if (activeLink) activeLink.classList.add("active");
});
