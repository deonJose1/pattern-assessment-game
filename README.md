# 🏆 Hackathon Admin Portal

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F?logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-6DB33F?logo=springsecurity&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Persistence-4169E1?logo=postgresql&logoColor=white)
![Tests](https://img.shields.io/badge/unit%20tests-7%20passing-success)
![API Docs](https://img.shields.io/badge/API-Swagger%20UI-85EA2D?logo=swagger&logoColor=black)

An enterprise-grade management platform for **administering, evaluating, and ranking hackathon submissions** end to end. The portal gives program administrators a single, secure surface to manage the full event lifecycle — publishing events, tracking team submissions through an approval workflow, applying rubric-based scoring, and surfacing live, pre-computed leaderboards.

---

## 📋 Overview

The Hackathon Admin Portal replaces ad‑hoc spreadsheets and manual tallying with a purpose-built, role-secured web application. It is designed around three administrative pillars:

| Pillar | Capability |
| --- | --- |
| **Track** | Manage event lifecycles, team rosters, participants, and submission pipelines. |
| **Evaluate** | Review and approve/reject submissions, then apply a transparent multi-criteria scoring rubric. |
| **Rank** | Generate pre-computed, per-event leaderboards that re-rank in real time as scores are assigned. |

The result is a clean separation between a **stateless, secured Spring Boot REST API** and a **modern React single-page application**, communicating exclusively over authenticated JSON.

---

## 🏗️ Tech Stack & Architecture

The system follows a conventional layered architecture with strict separation of concerns. The backend never leaks persistence entities across the wire — all controller responses are projected through dedicated DTOs.

```
┌─────────────────────────────────────────────────────────┐
│  React SPA (Vite + Tailwind)                             │
│  Axios client ──► JWT Bearer interceptor ──► /admin/**   │
└───────────────────────────┬─────────────────────────────┘
                            │  HTTPS / JSON  (Authorization: Bearer <JWT>)
┌───────────────────────────▼─────────────────────────────┐
│  Spring Boot REST API                                    │
│  Controllers ─► Services ─► Repositories (Spring Data)   │
│        │            │                                    │
│     DTOs       Domain logic        Hibernate ORM         │
│  Spring Security filter chain (stateless JWT)            │
└───────────────────────────┬─────────────────────────────┘
                            │  JDBC
┌───────────────────────────▼─────────────────────────────┐
│  PostgreSQL — automated schema generation                │
└──────────────────────────────────────────────────────────┘
```

### Backend

| Concern | Technology |
| --- | --- |
| Language / Runtime | **Java 21** (LTS, toolchain-pinned) |
| Framework | **Spring Boot 4.1** |
| Persistence | **Spring Data JPA** + **Hibernate ORM** |
| Security | **Spring Security** with stateless **JWT** (jjwt) |
| API Documentation | **springdoc-openapi** (Swagger UI) |
| Build | **Gradle** |

### Frontend

| Concern | Technology |
| --- | --- |
| Library | **React 19** |
| Tooling | **Vite** |
| Styling | **Tailwind CSS** (responsive — desktop & mobile) |
| HTTP | **Axios**, fully configured with a stateless **JWT bearer token request interceptor** and a global 401 re-authentication handler |
| Routing | **React Router** with a protected admin shell |

### Database

**PostgreSQL** provides full production persistence. The project was deliberately **migrated from a development-phase H2 in-memory layer** to durable PostgreSQL storage, retaining **automated schema generation** (`hibernate.ddl-auto=update`) for frictionless evolution during active development. Core tables include `admins`, `scores`, and `leaderboard`, alongside the event, team, participant, and submission domain tables.

---

## 🔐 Security Posture & Compliance

Security is enforced centrally in the Spring Security filter chain and treated as a first-class architectural concern.

| Control | Implementation |
| --- | --- |
| **Stateless sessions** | No server-side `HttpSession`. Every request is authenticated via a signed JWT presented as `Authorization: Bearer <token>`, validated by a `OncePerRequestFilter`. `SessionCreationPolicy.STATELESS` is enforced. |
| **Password storage** | Administrator credentials are hashed with **BCrypt**; plaintext is never persisted. |
| **CORS** | A strict, explicit allow-list (trusted local SPA origins, scoped HTTP methods and headers) — no permissive wildcards on credentialed requests. |
| **CSRF** | Disabled **by design** for the stateless, token-authenticated API surface, where CSRF protections are unnecessary and would otherwise impede legitimate clients. |
| **Clickjacking protection** | Legacy `frameOptions().disable()` overrides — a holdover from the H2 console era — were **deliberately removed**, restoring Spring Security's default **`X-Frame-Options: DENY`**. The application can no longer be embedded in a hostile `<iframe>`, closing the clickjacking attack vector. |
| **Endpoint authorization** | Only the authentication and API-documentation routes are public; **all `/admin/**` and `/leaderboard/**` endpoints require a valid JWT.** |

---

## 📡 API Specification & Documentation

The API is fully compliant with the prescribed administrative naming conventions and exposes clean, resource-oriented paths. Interactive, always-up-to-date documentation is served natively via **Swagger UI**:

> **📖 Swagger UI:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
> **📄 OpenAPI spec:** `http://localhost:8080/v3/api-docs`

### Core Administrative Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/admin/events` | Create a hackathon event *(Event Lifecycle)* |
| `PUT` | `/admin/events/{id}` | Update an existing event *(Event Lifecycle)* |
| `GET` | `/admin/participants` | Retrieve participant rosters *(User Rosters)* |
| `GET` | `/admin/submissions` | List all project submissions *(Workflow Tracking)* |
| `PUT` | `/admin/submissions/{id}/status` | Approve / reject a submission *(Workflow Tracking)* |
| `POST` | `/admin/scores` | Assign a summed rubric score *(Rubric Summation Engine)* |
| `GET` | `/leaderboard/{eventId}` | Fetch pre-computed event standings *(Cached Event Standings)* |

> **Scoring model.** The React client renders the evaluation rubric (e.g. *Model Accuracy*, *Innovation*, *Code Quality*), sums the criteria, and submits the total to `POST /admin/scores` as `{ "submissionId": <id>, "score": <total> }`. Assigning a score transactionally persists it and **rebuilds the affected event's leaderboard**, so `GET /leaderboard/{eventId}` always returns pre-computed, correctly ranked standings.

> **Authentication.** Obtain a token via `POST /api/auth/login` with `{ "email", "password" }`; the returned JWT must accompany every administrative request.

---

## 🧪 Testing Architecture

Our testing philosophy prioritizes **fast, deterministic feedback**. Core business logic is validated with **isolated Mockito unit tests** that mock the repository layer entirely — deliberately bypassing the heavyweight Spring `ApplicationContext` and live database. This keeps the critical-path test suite **context-free and database-free**, ideal for rapid CI/CD feedback cycles where seconds matter.

### Execution

```bash
gradle test --tests "*ScoreServiceTest" --tests "*LeaderboardServiceTest"
```

### Coverage

These **7 test cases** mathematically validate the system's evaluation core:

| Suite | Validates |
| --- | --- |
| `ScoreServiceTest` | Multi-criteria score summation & persistence, idempotent re-scoring of an existing submission, and the not-found edge case (throws + zero side effects). |
| `LeaderboardServiceTest` | Real-time leaderboard re-ranking (descending by score), exclusion of unscored submissions, rank-ordered read projection, and the unknown-event edge case. |

Together they assert that score summation, real-time re-ranking, and database edge cases behave exactly as specified — without ever booting Spring or touching a database.

---

## 🚀 Local Development Setup

### Prerequisites

- **Java 21+** and **Gradle**
- **Node.js 18+** and **npm**
- A running **PostgreSQL** instance

### 1. Database

Create the application database:

```sql
CREATE DATABASE hackathondb;
```

### 2. Backend configuration

In `assessment-backend/src/main/resources/application.properties`, set your local PostgreSQL password:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hackathondb
spring.datasource.username=postgres
spring.datasource.password=YOUR_LOCAL_PASSWORD   # ← set this
spring.jpa.hibernate.ddl-auto=update
```

> The schema is generated automatically on first boot, and seed data (administrator accounts, demo events, teams, and submissions) is loaded into an empty database.

### 3. Run the backend

```bash
cd assessment-backend
./gradlew bootRun          # Windows: gradlew.bat bootRun
```

The API starts on **http://localhost:8080**. Verify via Swagger UI at `/swagger-ui/index.html`.

### 4. Run the frontend

```bash
cd assessment-frontend
npm install
npm run dev
```

The SPA starts on **http://localhost:5173** (a `.env` value of `VITE_API_BASE_URL=http://localhost:8080` points it at the API). Sign in with one of the seeded accounts below to access the admin portal.

### 🔑 Seeded Test Accounts

On first boot against an empty database, these accounts are provisioned automatically so evaluators can log in instantly:

| Email | Password | Role |
| --- | --- | --- |
| `admin@cognizant.com` | `admin123` | ADMIN |
| `deon.jose@cognizant.com` | `Password@123` | ADMIN |
| `judge@cognizant.com` | `judge123` | JUDGE |

> ⚠️ Development seed credentials for local evaluation only — never provision these in a production environment.

---

## 📁 Repository Structure

```
cognizant-intern-assessment/
├── assessment-backend/      # Spring Boot REST API
│   └── src/main/java/com/cognizant/hackathon/
│       ├── controller/      # REST endpoints (/admin/**, /leaderboard/**)
│       ├── service/         # Business logic (scoring, ranking)
│       ├── repository/      # Spring Data JPA repositories
│       ├── entity/          # JPA entities (admins, scores, leaderboard, …)
│       ├── dto/             # Request/response projections
│       ├── security/        # JWT filter & token service
│       ├── config/          # Security & data seeding
│       └── exception/       # Centralized error handling
└── assessment-frontend/     # React (Vite) single-page application
    └── src/
        ├── api/             # Axios client + JWT interceptor
        ├── services/        # API service wrappers
        ├── components/      # UI + feature components
        └── pages/           # Routed admin views
```

---

<sub>Built with a focus on clean architecture, production-grade security, and rigorous, fast-feedback testing.</sub>
