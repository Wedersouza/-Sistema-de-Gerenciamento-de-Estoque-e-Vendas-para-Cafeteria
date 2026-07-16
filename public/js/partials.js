/**
 * Injeta o partial do sidebar em qualquer página que tenha
 * <div id="sidebar-container"></div> e <body data-page="...">.
 *
 * A busca de nome/perfil do usuário logado e a restrição de links
 * (Fornecedores/Usuários = só Administrador) ainda não estão implementadas
 * aqui — dependem da sessão, que será construída na Etapa 3 (Autenticação).
 */
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
});