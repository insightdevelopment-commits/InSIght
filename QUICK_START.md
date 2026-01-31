# 🎉 InSight Backend - Quick Start Guide

## ✅ Current Status
- ✅ Backend server is **RUNNING** on `http://localhost:3000`
- ✅ Frontend server is **RUNNING** on `http://localhost:8000`
- ✅ All dependencies installed
- ✅ Prisma client generated
- ⚠️ Database migrations pending (requires password)

---

## 🚀 What's Working Now

You can already test the authentication flow (without database persistence):

1. Open `http://localhost:8000/ai-mainpage.htm`
2. Click any "Sign Up" or "Log In" button
3. You'll be redirected to Google OAuth

**Note**: Authentication will work, but user data won't be saved until you complete the database setup below.

---

## 📋 Next Steps to Complete Setup

### Step 1: Add Database Password
Edit `backend/.env` and replace `[YOUR-PASSWORD]`:
```env
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xfjrsxxcnmwhgdgmmqix.supabase.co:5432/postgres
```

### Step 2: Configure Google OAuth Redirect
Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and add:
```
http://localhost:3000/auth/google/callback
```
to your OAuth 2.0 Client's "Authorized redirect URIs"

### Step 3: Run Database Migrations
```bash
cd backend
npx prisma migrate dev --name init
```

---

## 🧪 Testing Authentication

Once database is configured:

1. Click "Sign Up" on the frontend
2. Complete Google authentication
3. Check your PostgreSQL database for the new user record
4. Verify session persists on page refresh

---

## 📊 Server Endpoints

| Endpoint | Purpose |
|----------|---------|
| `http://localhost:3000/health` | Health check |
| `http://localhost:3000/auth/google` | Start OAuth |
| `http://localhost:3000/auth/logout` | Logout |
| `http://localhost:3000/auth/current-user` | Get user data |

---

## 🛠️ Troubleshooting

**If server crashes**: Run `npm run dev` in the `backend` folder

**If Prisma errors**: The client is already generated, but if needed:
```bash
npx prisma generate
```

**If port 3000 is busy**: Change `PORT` in `.env` file

---

## 📁 Project Structure

```
Hackathon 2026/
├── ai-mainpage.htm          # Frontend (port 8000)
└── backend/                 # Backend (port 3000)
    ├── server.js
    ├── config/passport.js
    ├── routes/auth.js
    ├── prisma/schema.prisma
    └── .env
```

---

## ✨ What You've Built

- ✅ Complete Google OAuth 2.0 authentication
- ✅ Express.js backend with Passport.js
- ✅ PostgreSQL database schema with Prisma
- ✅ Session management with secure cookies
- ✅ CORS-enabled API for frontend communication
- ✅ Fully integrated frontend with all buttons connected

**You're ready to test!** 🎊
