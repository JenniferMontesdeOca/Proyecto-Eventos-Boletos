# Sistema de Gestión de Eventos y Boletos 🎟️
![CI](https://github.com/JenniferMontesdeOca/Proyecto-Eventos-Boletos/actions/workflows/ci.yml/badge.svg)


Proyecto fullstack para la gestión de eventos y compra de boletos, con:

- Backend en **Node.js + Express + PostgreSQL**
- Autenticación con **JWT**
- Gestión de **roles** (usuario, organizador, admin)
- Manejo de **eventos, categorías, localidades, boletos y transacciones**
- Pruebas **unitarias e integración** con **Jest + Supertest**
- **GitHub Actions** ejecutando CI (tests + coverage) en cada push / pull request

---

📘 Manual Técnico para Ejecutar el Proyecto en Local

Esta guía explica cómo instalar y ejecutar el backend del sistema de eventos y boletos en una máquina local, así como correr las pruebas y preparar el entorno.



✅ 1. Requisitos del Sistema

Asegúrate de tener instalado:

- Node.js 18+
- npm 9+

- PostgreSQL 14+

- Git

- Windows / Linux / macOS



📥 2. Clonar el repositorio
git clone https://github.com/JenniferMontesdeOca/Proyecto-Eventos-Boletos.git
cd Proyecto-Eventos-Boletos



🗄 3. Configurar Base de Datos

Crear las bases de datos necesarias:psql -U postgres -c "CREATE DATABASE eventosdb;"
psql -U postgres -c "CREATE DATABASE eventosdbtest;"

- Importar el esquema:
psql -U postgres -d eventosdbtest -f ./database/eventos_db_test.sql



⚙️ 4. Configurar Variables de Entorno
Dentro de la carpeta backend/ crea tu archivo .env:
	cd backend
	cp .env.example .env

Editar .env según tu entorno local:

	PORT=5000
	DATABASE_URL=postgres://postgres:123@localhost:5432/eventosdb
	DATABASE_URL_TEST=postgres://postgres:123@localhost:5432/eventosdbtest
	JWT_SECRET=supersecreto
	UPLOADS_DIR=uploads



📦 5. Instalar dependencias del backend
cd backend
npm install



▶️ 6. Ejecutar el servidor
npm run dev

La API quedará disponible en:
	http://localhost:5000



🧪 7. Ejecutar pruebas
Ejecutar todas las pruebas (unitarias + integración):

	npm test
	npm run test:coverage

Reporte disponible en:
backend/coverage/lcov-report/index.html



🤖 8. Integración Continua (CI)
El proyecto incluye un workflow en:
	.github/workflows/ci.yml

Cada push o pull request activa automáticamente:
- Instalación de dependencias
- Creación de PostgreSQL en GitHub Actions
- Importación del esquema
- Ejecución de pruebas
- Reporte de cobertura

Badge de estado:
	![CI](https://github.com/JenniferMontesdeOca/Proyecto-Eventos-Boletos/actions/workflows/ci.yml/badge.svg)


📂 9. Estructura del proyecto
backend/
  routes/
  middleware/
  services/
  tests/
  app.js
  server.js
  db.js
  package.json
  .env.example

database/
  eventos_db_test.sql

.github/
  workflows/
    ci.yml

.gitignore
README.md


🧰 10. Problemas communes
| Problema                                       | Solución                                                                |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| *database “eventosdbtest” does not exist*      | Crear DB con `CREATE DATABASE eventosdbtest;`                           |
| *password authentication failed*               | Revisar `.env` y credenciales                                           |
| *Cannot use import statement outside a module* | Ya está resuelto mediante ejecución ESM con `--experimental-vm-modules` |
