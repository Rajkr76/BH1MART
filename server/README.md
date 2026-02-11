# B1 MART Backend Server

Express + Socket.io backend API for B1 MART hostel ordering system.

## Features

- RESTful API for orders and food requests
- Real-time chat with Socket.io
- JWT authentication for admin
- MongoDB database with Mongoose ODM

## Tech Stack

- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_NAME=your_admin_name
ADMIN_CHAT_ID=your_admin_chat_id
JWT_SECRET=your_jwt_secret_key
PORT=3001
```

See `.env.example` for reference.

## Installation

```bash
npm install
```

## Running Locally

```bash
npm start
```

Server will run on `http://localhost:3001`

## Deployment on Render

1. Push this server folder to a Git repository
2. Create a new **Web Service** on Render
3. Connect your repository
4. Set **Root Directory** to `server` (if deploying from monorepo)
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `npm start`
7. Add environment variables in Render dashboard:
   - `MONGODB_URI`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `ADMIN_NAME`
   - `ADMIN_CHAT_ID`
   - `JWT_SECRET`
   - `PORT` (optional, Render assigns this automatically)

## API Endpoints

### Orders
- `POST /api/order` - Create new order
- `GET /api/orders` - Get all orders (admin only)
- `PATCH /api/order/:chatId/status` - Update order status (admin only)

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/verify` - Verify JWT token

### Food Requests
- `POST /api/food-request` - Submit food request
- `GET /api/food-requests` - Get all requests (admin only)
- `PATCH /api/food-request/:id/status` - Update request status (admin only)

### Chat (Socket.io)
- `join-room` - Join chat room
- `send-message` - Send message
- `fetch-messages` - Fetch message history

## Database Models

- **Order** - Customer orders
- **Admin** - Admin users with JWT auth
- **Message** - Chat messages
- **FoodRequest** - Customer food item requests

## License

ISC
