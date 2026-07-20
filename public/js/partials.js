document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  const response = await fetch("/partials/sidebar.html");
  container.innerHTML = await response.text();

  const activePage = document.body.dataset.page;
  const activeLink = container.querySelector(`[data-nav="${activePage}"]`);
  if (activeLink) activeLink.classList.add("active");

  const logoutLink = container.querySelector("#sidebar-logout");
  logoutLink.addEventListener("click", async (e) => {
    e.preventDefault();
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login.html";
  });

  const respUsuario = await fetch("/api/me");
  if (respUsuario.ok) {
    const usuario = await respUsuario.json();
    container.querySelector("#sidebar-user-name").textContent = usuario.nome;
    container.querySelector("#sidebar-user-role").textContent = usuario.perfil;
    container.querySelector("#sidebar-user-initials").textContent = usuario.nome.slice(0, 2).toUpperCase();

    if (usuario.perfil !== "Administrador") {
      container.querySelectorAll('[data-restricted="admin"]').forEach(el => el.remove());
    }
  }
});