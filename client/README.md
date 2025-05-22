# List Distributor - MERN Stack Application

A web application for distributing lists among agents, built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Admin user authentication with JWT
- Agent creation and management
- List upload (CSV, XLSX, XLS formats)
- Automatic distribution of list items among agents
- Dashboard with statistics
- Responsive design for mobile and desktop

## Prerequisites

- Node.js (v14+)
- MongoDB
- NPM or Yarn

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/list-distributor.git
cd list-distributor
```

### Set up environment variables

Create a `.env` file in the `server` directory:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/list-distributor
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

Replace `your_jwt_secret_key` with a secure random string.

### Install backend dependencies

```bash
cd server
npm install
```

### Install frontend dependencies

```bash
cd ../client
npm install
```

## Running the application

### Start the backend server

```bash
cd server
npm run dev
```

This will start the backend server on port 5000.

### Start the frontend development server

```bash
cd client
npm start
```

This will start the frontend development server on port 3000.

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new admin user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Agents
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create a new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Lists
- `POST /api/lists/upload` - Upload and distribute list
- `GET /api/lists` - Get all lists
- `GET /api/lists/agent/:agentId` - Get lists for a specific agent

## File Structure

```
list-distributor/
│
├── client/                  # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── ...
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.js           # Main React component
│   │   └── index.js         # React entry point
│   └── package.json
│
├── server/                  # Node/Express backend
│   ├── config/              # Database configuration
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Middleware functions
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── .env                 # Environment variables
│   ├── server.js            # Express entry point
│   └── package.json
│
└── README.md                # Project documentation
```

## Built With

- [MongoDB](https://www.mongodb.com/) - Database
- [Express](https://expressjs.com/) - Backend framework
- [React](https://reactjs.org/) - Frontend library
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Bootstrap](https://getbootstrap.com/) - CSS framework
- [React Bootstrap](https://react-bootstrap.github.io/) - Bootstrap components for React
- [Axios](https://github.com/axios/axios) - HTTP client
- [React Toastify](https://fkhadra.github.io/react-toastify/) - Notification library