document.addEventListener("DOMContentLoaded", function () {
    const menu = document.getElementById("menu");
    if (!menu) return;

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const isActive = (page) => (currentPage === page ? "active" : "");
    const ariaCurrent = (page) => (currentPage === page ? 'aria-current="page"' : "");

    menu.innerHTML = `
      <nav class="navbar navbar-expand-sm navbar-light bg-light mb-4 border-bottom">
          <div class="container">
            <a class="navbar-brand fw-bold" href="index.html">Proyecto Integrador</a>
            <button
              class="navbar-toggler d-lg-none"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapsibleNavId"
              aria-controls="collapsibleNavId"
              aria-expanded="false"
              aria-label="Alternar navegación"
            >
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="collapsibleNavId">
              <ul class="navbar-nav me-auto mt-2 mt-lg-0">
                <li class="nav-item">
                  <a
                    class="nav-link ${isActive("index.html")}"
                    href="index.html"
                    ${ariaCurrent("index.html")}
                  >Home</a>
                </li>
                <li class="nav-item">
                  <a
                    class="nav-link ${isActive("usuarios.html")}"
                    href="usuarios.html"
                    ${ariaCurrent("usuarios.html")}
                  >Usuarios</a>
                </li>
                <li class="nav-item">
                  <a
                    class="nav-link ${isActive("productos.html")}"
                    href="productos.html"
                    ${ariaCurrent("productos.html")}
                  >Productos</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
    `;
});
