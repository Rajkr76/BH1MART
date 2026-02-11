# 🚀 Deploy B1 MART Backend to Render

## Step-by-Step Deployment Guide

### 1️⃣ Prerequisites
- ✅ MongoDB Atlas account with a database cluster
- ✅ GitHub repository with your server code
- ✅ Render account (free tier works!)

---

### 2️⃣ Prepare Your Code

Your server folder is now ready for deployment with:
- ✅ `package.json` with all dependencies
- ✅ `server.js` configured to use environment variables
- ✅ `.gitignore` to exclude node_modules and .env
- ✅ `.env.example` as reference

**Push to GitHub:**
```bash
cd server
git init
git add .
git commit -m "Initial server setup for Render deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

---

### 3️⃣ MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you haven't already)
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/b1mart`)
5. Replace `<password>` with your actual password
6. Add `/b1mart` at the end to specify the database name

**Example:**
```
mongodb+srv://raj:MyPassword123@cluster0.xxxxx.mongodb.net/b1mart
```

---

### 4️⃣ Deploy on Render

#### A. Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository (or the server folder path)

#### B. Configure Service

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `b1mart-backend` (or any name you prefer) |
| **Root Directory** | `server` (if deploying from monorepo, leave blank if server is root) |
| **Environment** | `Node` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

#### C. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

| Key | Value | Example |
|-----|-------|---------|
| `MONGODB_URI` | Your MongoDB connection string | `mongodb+srv://...` |
| `ADMIN_EMAIL` | Admin login email | `rajk769867@gmail.com` |
| `ADMIN_PASSWORD` | Admin password | `Giri@raj04` |
| `ADMIN_NAME` | Admin display name | `raj123` |
| `ADMIN_CHAT_ID` | Admin chat ID | `CHAT-GIRI04` |
| `JWT_SECRET` | Random secret string | `b1mart_prod_secret_2026` |
| `PORT` | Leave empty (Render auto-assigns) | - |

**⚠️ IMPORTANT:** Use strong, unique values for `JWT_SECRET` in production!

#### D. Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Start your server with `npm start`
3. Wait 2-3 minutes for the first deployment

---

### 5️⃣ Get Your Backend URL

Once deployed, Render provides a URL like:
```
https://b1mart-backend.onrender.com
```

**Test your server:**
```bash
curl https://b1mart-backend.onrender.com/api/orders
```

You should see: `{"error":"Invalid or expired token"}` (this means it's working!)

---

### 6️⃣ Update Frontend Configuration

Update your Next.js frontend to use the deployed backend URL:

**In your local `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://b1mart-backend.onrender.com
```

**If deploying frontend to Vercel:**
- Go to Project Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL` = `https://b1mart-backend.onrender.com`

---

### 7️⃣ MongoDB Network Access

Make sure MongoDB allows connections from Render:

1. Go to MongoDB Atlas → **Network Access**
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** → `0.0.0.0/0`
4. Click **"Confirm"**

**Note:** For production, you can whitelist Render's IP ranges instead.

---

### 8️⃣ Test Complete Flow

1. ✅ **Admin Login:** Try logging in from your frontend
2. ✅ **Place Order:** Submit an order from customer view
3. ✅ **Chat:** Send a chat message
4. ✅ **Food Request:** Submit a food request

---

## 🔍 Monitoring & Logs

### View Logs on Render
1. Go to your service dashboard
2. Click **"Logs"** tab
3. See real-time server logs (MongoDB connections, requests, errors)

### Common Issues

**Problem:** Server crashes with "Cannot connect to MongoDB"
- **Solution:** Check `MONGODB_URI` is correct and MongoDB Network Access allows all IPs

**Problem:** "Invalid or expired token" when logging in
- **Solution:** Check `JWT_SECRET` matches between frontend and backend

**Problem:** CORS errors
- **Solution:** Backend has `Access-Control-Allow-Origin: *` already configured

---

## 🔄 Updating Your Server

When you make changes:

```bash
cd server
git add .
git commit -m "Update server code"
git push
```

Render will **automatically redeploy** when you push to GitHub! 🎉

---

## 📊 Free Tier Limits

Render's free tier includes:
- ✅ 750 hours/month (enough for 24/7 operation)
- ✅ Automatic HTTPS
- ✅ Auto-deploy from GitHub
- ⚠️ **Spins down after 15 minutes of inactivity** (first request may be slow)

To prevent spin-down, upgrade to a paid plan ($7/month) or use a cron job to ping your server every 10 minutes.

---

## 🎯 Quick Reference

**Backend URL:** `https://YOUR-APP-NAME.onrender.com`

**API Endpoints:**
- POST `/api/order` - Create order
- GET `/api/orders` - Get orders (admin)
- POST `/api/admin/login` - Admin login
- POST `/api/food-request` - Submit food request
- GET `/api/food-requests` - Get requests (admin)
- Socket.io on same URL for real-time chat

**Admin Credentials:**
- Email: Set via `ADMIN_EMAIL` env variable
- Password: Set via `ADMIN_PASSWORD` env variable

---

## ✅ Deployment Checklist

- [ ] Server folder has `package.json` with all dependencies
- [ ] MongoDB Atlas cluster created and connection string obtained
- [ ] GitHub repository created and code pushed
- [ ] Render web service created and configured
- [ ] All environment variables added on Render
- [ ] MongoDB Network Access allows Render connections (0.0.0.0/0)
- [ ] Server deployed successfully on Render
- [ ] Backend URL tested with curl/Postman
- [ ] Frontend updated with `NEXT_PUBLIC_API_URL`
- [ ] End-to-end testing: order, chat, admin login

---

**🎊 Congratulations! Your B1 MART backend is now live on Render!**
