# Audio SOP System

A modern MERN stack application for managing Audio SOP  role-based access control.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Redux Toolkit
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Authentication**: JWT with role-based permissions
- **Security**: Helmet, CORS, rate limiting, bcrypt

## Features

- User authentication and authorization
- Role-based access control (RBAC)
- Permission management system
- Master data management (Users, Roles, Permissions)
- Responsive UI with dark mode support
- Real-time validation and error handling

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../client
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Backend .env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/cost_rate_approval
   CLIENT_URL=http://localhost:5173

   # Frontend .env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. Start the application:
   ```bash
   # Backend
   npm run dev

   # Frontend (in separate terminal)
   npm run dev
   ```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── package.json
└── client/
    ├── src/
    │   ├── features/       # Feature components
    │   ├── shared/         # Reusable components
    │   ├── services/       # API services
    │   ├── hooks/          # Custom hooks
    │   └── redux/          # State management
    └── package.json
```

## Scripts

### Backend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with initial data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
