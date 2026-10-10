# CivicPulse — City Issue Reporting & Management Dashboard

A full-stack MERN application for citizens to report city infrastructure issues (potholes, garbage, streetlights, water leakage, drainage, footpaths) and for administrators to manage, prioritize, assign, and resolve them.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas with Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcryptjs |

## Project Structure

```
.
├── server/                  # Express + MongoDB backend
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # auth, issue, category, dashboard
│   ├── middleware/           # auth (JWT + roles), error handling
│   ├── models/               # User, Issue, Category
│   ├── routes/               # auth, issue, category, dashboard
│   ├── seed/seed.js          # Optional seed data
│   ├── server.js             # Express app entry
│   ├── .env.example
│   └── package.json
├── src/                     # React frontend
│   ├── components/           # Sidebar, badges, spinner, dialogs
│   ├── context/              # Auth context
│   ├── pages/                # Login, Dashboard, Report, Manage, Details, Categories
│   ├── services/             # API layer (Axios)
│   ├── App.jsx               # Routes
│   └── main.jsx
├── .env.example
├── package.json
└── README.md
```

## Setup Instructions

### 1. Configure MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a user with username and password.
3. Under **Network Access**, allow your IP (or `0.0.0.0/0` for development).
4. Click **Connect → Drivers** and copy the connection string. It looks like:
   ```
   mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER/YOUR_DATABASE?retryWrites=true&w=majority
   ```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER/YOUR_DATABASE?retryWrites=true&w=majority
JWT_SECRET=generate_a_long_random_string
CLIENT_URL=http://localhost:5173
```

Generate a JWT secret: `openssl rand -hex 32`

Start the backend:

```bash
npm run dev
```

The server runs on `http://localhost:5000`.

### 3. (Optional) Seed Sample Data

```bash
npm run seed
```

This creates three users and five sample issues:

| Role | Email | Password |
|---|---|---|
| Admin | admin@civicpulse.test | password123 |
| Staff | staff@civicpulse.test | password123 |
| Citizen | jane@civicpulse.test | password123 |

### 4. Frontend Setup

From the project root (not inside `server/`):

```bash
npm install
```

Create a `.env` file (copy from `.env.example`):

```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The app runs on `http://localhost:5173`.

## API Endpoints

### Auth

| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a citizen | Public |
| POST | `/api/auth/login` | Login, returns JWT | Public |
| GET | `/api/auth/me` | Get current user profile | Authenticated |

### Issues

| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/api/issues` | Create a new issue | Authenticated |
| GET | `/api/issues` | List issues (role-scoped, search, filter, sort, pagination) | Authenticated |
| GET | `/api/issues/:id` | Get single issue | Authenticated (owner/staff/admin) |
| GET | `/api/issues/track/:trackingId` | Get issue by tracking ID | Authenticated |
| PATCH | `/api/issues/:id` | Update issue fields (role-restricted) | Authenticated (owner/admin) |
| PATCH | `/api/issues/:id/status` | Update status (validates transitions, records history) | Authenticated (owner/staff/admin) |
| DELETE | `/api/issues/:id` | Delete issue | Authenticated (owner/admin) |

### Categories

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/categories` | List categories | Authenticated |
| POST | `/api/categories` | Create category | Admin |
| PATCH | `/api/categories/:id` | Update category | Admin |
| DELETE | `/api/categories/:id` | Deactivate category | Admin |

### Dashboard

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Aggregated statistics from MongoDB | Authenticated |

### Health

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Server + database health check |

## Testing the CRUD Flow

1. Start the backend (`cd server && npm run dev`) and frontend (`npm run dev`).
2. Visit `http://localhost:5173` — you'll be redirected to login.
3. **Register** a citizen account, or use seed credentials.
4. **Report an issue** — fill the form and submit. Note the tracking ID.
5. **Manage Issues** — search, filter by status/priority, paginate.
6. **Issue Details** — view full details, status history timeline, edit fields, update status.
7. **Dashboard** — view KPI cards, status/category charts, recent reports.
8. **Categories** (admin only) — add, edit, deactivate categories.
9. Test **authorization**: citizens see only their issues; staff see assigned issues; admins see all.

## Query Parameters for GET /api/issues

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default 1) |
| `limit` | number | Items per page (default 10, max 100) |
| `search` | string | Search title, description, address, tracking ID |
| `status` | string | Filter by status |
| `priority` | string | Filter by priority |
| `category` | string | Filter by category |
| `sortBy` | string | Sort field (default `createdAt`) |
| `order` | string | `asc` or `desc` (default `desc`) |

## What Requires External Configuration

- **MongoDB Atlas** — you must create a cluster and add the connection string to `server/.env`.
- **JWT_SECRET** — set a strong random secret in `server/.env`.
- No other external services or API keys are required.
