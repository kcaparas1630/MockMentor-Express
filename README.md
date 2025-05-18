# AI-Interview-Express

A lightweight, rate-limited Express.js service, containerized for scalable deployment.

---

## 📁 Project Structure

| Path                        | Description                                 |
|-----------------------------|---------------------------------------------|
| `src/server.ts`             | App entry point, starts the server          |
| `src/express.ts`            | Express app setup, middleware, rate limiting|
| `src/Config/LoggerConfig.ts`| Winston logger configuration                |
| `src/Helper/LoggerFunc.ts`  | Error logging utility                       |
| `src/`                      | Main source code (Controllers, Routes, etc) |
| `Dockerfile`                | Container build instructions                |
| `.github/workflows/`        | CI/CD pipeline (Docker build & push)        |
| `.gitignore`                | VCS ignore rules                            |
| `package.json`              | Main dependencies and scripts               |
| `tsconfig.json`             | TypeScript configuration                    |

---

## 🚀 Features

- **Express.js**: Fast, unopinionated web framework for Node.js.
- **Rate Limiting**: Per-IP request limits using `express-rate-limit`.
- **Logging**: Structured logging with Winston and request logs via Morgan.
- **Dockerized**: Production-ready container setup.
- **CI/CD**: Automated Docker build & push via GitHub Actions.

---

## 🏗️ Application Overview

### Main App Initialization (`src/server.ts`)

- Loads environment variables.
- Starts the Express app on the configured port.

### Express App Setup (`src/express.ts`)

- Configures middleware: JSON parsing, URL encoding, cookies, compression, CORS.
- Sets up request logging with Morgan and Winston.
- Applies global rate limiting (default: 10 requests/minute per IP).

### Logging (`src/Config/LoggerConfig.ts`, `src/Helper/LoggerFunc.ts`)

- Winston logger writes to both console and rotating log files.
- Helper for structured error logging.

---

## 🗂️ API Endpoints

> **Note:** No routes are currently defined in `src/Routes/`. Add your endpoints in this directory and register them in `src/express.ts`.

---

## 🧩 Dependencies

### Main (`package.json`)

| Package            | Purpose                |
|--------------------|------------------------|
| express            | Web framework          |
| express-rate-limit | Rate limiting          |
| morgan             | HTTP request logging   |
| winston            | Application logging    |
| compression        | Response compression   |
| cors               | CORS support           |
| cookie-parser      | Cookie parsing         |
| dotenv             | Env var management     |
| @prisma/client     | ORM (if used)          |
| mongoose, mongodb  | MongoDB support        |
| firebase-admin     | Firebase integration   |

### Development

| Package         | Purpose                |
|-----------------|------------------------|
| typescript      | TypeScript support     |
| eslint, prettier| Linting & formatting   |
| nodemon         | Dev server reload      |
| @types/*        | TypeScript type defs   |

---

## 🐳 Dockerization

### Dockerfile Highlights

- **Base**: `node:20.16.0`
- **Workdir**: `/app`
- **Installs**: Production dependencies, builds TypeScript
- **Entrypoint**: Runs with `npm run serve` (serves `dist/server.js`)

```dockerfile
CMD ["npm", "run", "serve", "--no-update-notifier", "--max-old-space-size=50"]
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

| Step                        | Description                                  |
|-----------------------------|----------------------------------------------|
| Checkout code               | Pulls repo code                              |
| Authenticate to GCP         | Uses service account for Docker push         |
| Set up Cloud SDK            | Prepares gcloud CLI                          |
| Configure Docker            | Auths Docker for GCP Artifact Registry       |
| Build Docker image          | Builds image using `Dockerfile`              |
| Push Docker image           | Pushes to GCP Artifact Registry (latest & SHA tags) |

---

## 📝 .gitignore

- Ignores `node_modules`, `.env`, `dist`, `logs`, etc.

---

## 🏁 Quickstart

### Local Development

```bash
npm install
npm run build
npm run dev
```

### With Docker

```bash
docker build -t ai-interview-express .
docker run -p 3000:3000 ai-interview-express
```

---

## 📚 Extending

- Add new routes in `src/Routes/`
- Define schemas in `src/Schema/`
- Register routers in `src/express.ts`
