# Sistema de Gestión de Eventos y Boletos 🎟️

Proyecto fullstack para la gestión de eventos y compra de boletos, con:

- Backend en **Node.js + Express + PostgreSQL**
- Autenticación con **JWT**
- Gestión de **roles** (usuario, organizador, admin)
- Manejo de **eventos, categorías, localidades, boletos y transacciones**
- Pruebas **unitarias e integración** con **Jest + Supertest**
- **GitHub Actions** ejecutando CI (tests + coverage) en cada push / pull request

---

## 📁 Estructura del repositorio

```text
eventos-boletos/
  backend/
    src (rutas, middleware, etc.)
    tests/               # unit e integración
    package.json
    jest.config.mjs
    .env.example
  database/
    eventos_db_test.sql  # schema de la base de datos de pruebas
  .github/
    workflows/
      ci.yml             # GitHub Actions (CI)
  .gitignore
  README.md
