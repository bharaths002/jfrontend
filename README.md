<div align="center">

# 🧑‍💼 Job Portal — Full Stack Admin Dashboard

A full-stack job board management platform built with **Next.js**, **NestJS**, **PostgreSQL**, and **Cloudinary**.  
Create, manage, publish, and draft job openings with a clean, modern UI.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://jfrontend.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render)](https://jbackend-rk8u.onrender.com)
[![GitHub Frontend](https://img.shields.io/badge/Frontend-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/bharaths002/jfrontend)
[![GitHub Backend](https://img.shields.io/badge/Backend-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/bharaths002/jbackend)

</div>

---

## 📸 Preview

> Job listings grid with search, filter, and real-time updates

---

## ✨ Features

- **Create Job Openings** — multi-step form with validation, company logo upload, salary range, deadline picker
- **Publish / Save as Draft** — control job visibility; drafts stored separately from active listings
- **Update Jobs** — edit any field including logo replacement (old Cloudinary asset auto-deleted)
- **Delete Jobs** — removes DB record and Cloudinary image simultaneously
- **Search & Filter** — filter by title, location, job type, and salary range in real-time
- **Context-aware Loader** — animated briefcase loader with dynamic messages on every page navigation and action
- **Responsive UI** — mobile drawer navigation, responsive grid, pinned card footers
- **Toast Notifications** — success/error feedback via Mantine Notifications (no browser alerts)
- **Rate Limiting** — backend throttling (10 req/min per IP) to protect Cloudinary quota

---

## 🛠️ Tech Stack

### Frontend
| Technology | Usage |
|---|---|
| **Next.js 15** (App Router) | React framework, routing, SSR |
| **TypeScript** | Type safety across all components |
| **Mantine UI v7** | Component library — modals, forms, grid, notifications |
| **Tabler Icons** | Icon set |
| **Vercel** | Deployment & hosting |

### Backend
| Technology | Usage |
|---|---|
| **NestJS** | Node.js framework with decorators and DI |
| **TypeORM** | ORM for PostgreSQL with entity sync |
| **PostgreSQL (Neon)** | Serverless Postgres — free tier |
| **Cloudinary** | Cloud image storage for company logos |
| **multer-storage-cloudinary** | Direct multipart upload to Cloudinary |
| **@nestjs/throttler** | API rate limiting |
| **Render** | Backend deployment — free tier |

---

## 🗂️ Project Structure

```
jfrontend/                          jbackend/
├── src/                            ├── src/
│   ├── app/                        │   ├── jobs/
│   │   ├── page.tsx                │   │   ├── jobs.controller.ts
│   │   ├── jobs/page.tsx           │   │   ├── jobs.service.ts
│   │   ├── drafts/page.tsx         │   │   ├── dto/
│   │   ├── about/page.tsx          │   │   │   ├── createjob.dto.ts
│   │   ├── talents/page.tsx        │   │   │   └── updatejob.dto.ts
│   │   └── testimonials/page.tsx   │   │   └── entities/job.entity.ts
│   ├── components/                 │   ├── config/
│   │   ├── CreateJob/              │   │   └── cloudinary.storage.ts
│   │   ├── JobList/                │   ├── app.module.ts
│   │   ├── Layout/                 │   └── main.ts
│   │   └── JobSearch/              └── package.json
│   ├── context/
│   │   ├── SearchContext.tsx
│   │   └── LoaderContext.tsx
│   └── services/
│       └── api.ts
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+
- PostgreSQL (local) or a [Neon](https://neon.tech) account
- [Cloudinary](https://cloudinary.com) account (free tier)

### 1. Clone both repos

```bash
git clone https://github.com/bharaths002/jbackend
git clone https://github.com/bharaths002/jfrontend
```

### 2. Backend setup

```bash
cd jbackend
npm install --legacy-peer-deps
```

Create `.env` in the backend root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=job_board
DB_SYNCHRONIZE=true
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
```

```bash
npm run start:dev
# Backend runs on http://localhost:5000
```

### 3. Frontend setup

```bash
cd jfrontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/jobs` | Get all published jobs |
| `GET` | `/jobs/drafts` | Get all draft jobs |
| `GET` | `/jobs/:id` | Get job by ID |
| `POST` | `/jobs` | Create new job (multipart) |
| `PATCH` | `/jobs/:id` | Update job (multipart) |
| `DELETE` | `/jobs/:id` | Delete job + Cloudinary image |

---

## ☁️ Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | `jfrontend.vercel.app` |
| Backend | Render (free tier) | `jbackend-rk8u.onrender.com` |
| Database | Neon (serverless Postgres) | Managed |
| Images | Cloudinary (free tier) | `res.cloudinary.com` |

> **Note:** Render free tier spins down after 15 min of inactivity. First request after idle may take ~30 seconds to wake up.

---

## 📋 Environment Variables

### Backend (Render)
```
DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
NODE_ENV=production
DB_SYNCHRONIZE=false
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
FRONTEND_URL=https://your-vercel-url.vercel.app
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com
```

---

## 👨‍💻 Author

**Bharath S**  
Software Associate Engineer @ Negits Solutions, Chennai  
Full Stack Developer | Node.js · React.js · Vue.js · NestJS · PostgreSQL · AWS

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/bharaths002)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github)](https://github.com/bharaths002)

---

## 📄 License

This project is for portfolio and demonstration purposes.