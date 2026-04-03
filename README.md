# LinkFunnel - Smart URL Shortener

A full-stack URL shortener with a safe traffic funnel system. Designed to avoid direct link posting issues on social media platforms by routing traffic through clean, blog-style landing pages.

## Features

- **URL Shortening** — Convert long URLs into unique short codes
- **Funnel Landing Pages** — Clean, customizable intermediate pages with blog-style design
- **Smart Redirect** — Configurable delay (2–10s) with randomized patterns to simulate natural traffic
- **Analytics Dashboard** — Track clicks, devices, browsers, OS, and traffic over time
- **Admin Panel** — View, edit, delete links and see per-link analytics
- **Bulk Link Creation** — Create up to 50 short links at once via the UI or API
- **Custom Aliases** — Use your own memorable short codes
- **Link Expiration** — Set expiration dates for temporary campaigns
- **Authentication** — JWT-based auth with admin and user roles
- **Security** — Helmet, rate limiting, URL validation, duplicate prevention
- **Mobile Friendly** — Fully responsive design

## Tech Stack

- **Frontend:** React 18 + Vite + Recharts + Lucide Icons
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone and Install

```bash
git clone https://github.com/traitslabs/myshortner.git
cd myshortner
npm run install:all
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and settings
```

### 3. Run Development

```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
cd client && npm run dev
```

Or run both together:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 4. Default Admin Login

- **Email:** admin@example.com
- **Password:** admin123

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/auth/me` | Get current user |

### Links (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/links` | Create short link |
| POST | `/api/links/bulk` | Bulk create links |
| GET | `/api/links` | List user's links |
| PUT | `/api/links/:id` | Update link |
| DELETE | `/api/links/:id` | Delete link |

### Admin (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/analytics/:linkId` | Per-link analytics |
| GET | `/api/admin/clicks-chart` | Click trends |
| GET | `/api/admin/top-links` | Top performing links |

### Redirect
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:code` | Funnel landing page |

## Project Structure

```
myshortner/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Layout, shared components
│   │   ├── context/      # Auth context
│   │   ├── pages/        # Dashboard, CreateLink, Links, Analytics
│   │   └── index.css     # Global styles
│   └── package.json
├── server/               # Express backend
│   ├── src/
│   │   ├── middleware/   # Auth middleware
│   │   ├── models/       # Mongoose models (Link, Click, User)
│   │   ├── routes/       # API routes
│   │   └── index.js      # Server entry point
│   ├── .env.example
│   └── package.json
├── package.json          # Root scripts
└── README.md
```

## Deployment

### Vercel / Render

1. Set environment variables on your platform
2. Build: `cd client && npm run build`
3. Start: `cd server && npm start`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/urlshortener` |
| `JWT_SECRET` | Secret key for JWT tokens | (change in production!) |
| `BASE_URL` | Public URL for short links | `http://localhost:5000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `ADMIN_EMAIL` | Default admin email | `admin@example.com` |
| `ADMIN_PASSWORD` | Default admin password | `admin123` |
| `NODE_ENV` | Environment mode | `development` |

## License

MIT
