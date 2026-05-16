# Team Task Manager

A full-stack team task management application with role-based access control.

## Tech Stack

**Backend:** Node.js · Express · Mongoose · MongoDB Atlas · JWT  
**Frontend:** React 18 · Vite · TailwindCSS · React Router v6 · Zustand · React Hook Form

## Features

- JWT authentication (register / login)
- Role-based access: ADMIN and MEMBER
- Projects with member management
- Tasks with status, priority, due date, and assignee
- Dashboard with stats and recent activity
- Admin: user management, project/task CRUD
- Member: view assigned tasks, update own task status

## Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── seed.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── layouts/
    │   ├── pages/
    │   ├── routes/
    │   ├── store/
    │   └── utils/
    └── index.html
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
cd backend
cp .env.example .env
# Fill in your MongoDB URI and JWT secret
npm install
npm run dev
```

**Required `.env` variables:**

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/team-task-manager
JWT_SECRET=your_super_secret_key
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=adminpassword123
```

**Seed the admin user:**

```bash
node seed.js
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL if backend is not on localhost:5000
npm install
npm run dev
```

**Optional `.env` variable:**

```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | JWT | Get current user |
| GET | /api/projects | JWT | List projects |
| POST | /api/projects | ADMIN | Create project |
| GET | /api/projects/:id | JWT | Get project with tasks & members |
| PUT | /api/projects/:id | ADMIN | Update project |
| DELETE | /api/projects/:id | ADMIN | Delete project |
| POST | /api/projects/:id/members | ADMIN | Add member |
| DELETE | /api/projects/:id/members/:userId | ADMIN | Remove member |
| GET | /api/tasks | JWT | List tasks (filterable) |
| GET | /api/tasks/mine | JWT | Get my tasks |
| POST | /api/tasks | ADMIN | Create task |
| GET | /api/tasks/:id | JWT | Get task |
| PUT | /api/tasks/:id | ADMIN | Update task |
| DELETE | /api/tasks/:id | ADMIN | Delete task |
| PATCH | /api/tasks/:id/status | JWT | Update task status (assignee only) |
| GET | /api/users | ADMIN | List all users |
| PATCH | /api/users/:id/role | ADMIN | Update user role |
| DELETE | /api/users/:id | ADMIN | Delete user |
| GET | /api/dashboard/stats | JWT | Dashboard statistics |
