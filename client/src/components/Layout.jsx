import { useState, useCallback } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-brand" onClick={closeDrawer}>
            <span className="brand-icon">▶</span>
            <span className="brand-text">YT Conversor</span>
          </NavLink>

          {/* Desktop links */}
          <div className="navbar-links navbar-links-desktop">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              Início
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              Sobre
            </NavLink>
            <NavLink
              to="/policies"
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              Políticas
            </NavLink>
          </div>

          {/* Hamburger button (mobile) */}
          <button
            className={`hamburger ${drawerOpen ? "hamburger-active" : ""}`}
            onClick={toggleDrawer}
            aria-label="Menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Side Drawer Overlay */}
      <div
        className={`drawer-overlay ${drawerOpen ? "drawer-overlay-visible" : ""}`}
        onClick={closeDrawer}
      />

      {/* Side Drawer */}
      <aside className={`drawer ${drawerOpen ? "drawer-open" : ""}`}>
        <div className="drawer-header">
          <NavLink to="/" className="navbar-brand" onClick={closeDrawer}>
            <span className="brand-icon">▶</span>
            <span className="brand-text">YT Conversor</span>
          </NavLink>
          <button
            className="drawer-close"
            onClick={closeDrawer}
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>
        <div className="drawer-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `drawer-link ${isActive ? "drawer-link-active" : ""}`
            }
            onClick={closeDrawer}
          >
            🏠 Início
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `drawer-link ${isActive ? "drawer-link-active" : ""}`
            }
            onClick={closeDrawer}
          >
            ℹ️ Sobre
          </NavLink>
          <NavLink
            to="/policies"
            className={({ isActive }) =>
              `drawer-link ${isActive ? "drawer-link-active" : ""}`
            }
            onClick={closeDrawer}
          >
            📋 Políticas
          </NavLink>
        </div>
      </aside>

      {/* Page Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>YT Conversor</h4>
              <p>
                Conversão rápida, gratuita e segura do YouTube para MP3. Sem
                necessidade de cadastro.
              </p>
            </div>
            <div className="footer-col">
              <h4>Links Rápidos</h4>
              <NavLink to="/" className="footer-link">
                Início
              </NavLink>
              <NavLink to="/about" className="footer-link">
                Sobre
              </NavLink>
              <NavLink to="/policies" className="footer-link">
                Políticas
              </NavLink>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <NavLink to="/policies" className="footer-link">
                Política de Privacidade
              </NavLink>
              <NavLink to="/policies" className="footer-link">
                Termos de Serviço
              </NavLink>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              &copy; {new Date().getFullYear()} YT Conversor. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
