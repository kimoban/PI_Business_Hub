# PI Business Hub - SaaS Business Platform

A modern web-based SaaS platform for managing business operations including tasks, customers, forms, and team collaboration.

## Features

- 📊 **Dashboard** - Overview of business metrics and activities
- ✅ **Task Management** - Create, assign, and track tasks with priorities
- 👥 **Customer Management** - Store and manage customer information
- 📝 **Custom Forms** - Build and manage data collection forms
- ⚙️ **Settings** - Configure business preferences
- 🔐 **Authentication** - Secure user authentication system
- 📱 **Responsive** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: TailwindCSS with custom themes

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd PI_Business_Hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your database URL and other configuration.

4. **Push database schema**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5000`

## Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Deployment Options

### Deploy to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NODE_ENV` - Set to `production`
   - `SESSION_SECRET` - Random secret string
5. Create a PostgreSQL database on Render and link it

### Deploy to Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Add a PostgreSQL database service
4. Configure environment variables (Railway auto-detects `DATABASE_URL`)
5. Deploy!

### Deploy to Vercel (Frontend) + Supabase (Database)

For a serverless approach:
1. Use Supabase for PostgreSQL
2. Deploy frontend to Vercel
3. Deploy backend separately or use Edge Functions

### Deploy to DigitalOcean App Platform

1. Create a new App on DigitalOcean
2. Connect your repository
3. Add a managed PostgreSQL database
4. Configure build and run commands

### Self-hosted / VPS

1. Set up a VPS (Ubuntu recommended)
2. Install Node.js 18+
3. Install PostgreSQL
4. Clone and build the project
5. Use PM2 or systemd to run the server
6. Set up Nginx as reverse proxy
7. Configure SSL with Let's Encrypt

## Project Structure

```
PI_Business_Hub/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities
│   └── index.html
├── server/               # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage logic
│   └── db.ts             # Database connection
├── shared/               # Shared code
│   ├── schema.ts         # Database schema
│   └── routes.ts         # API route definitions
├── script/               # Build scripts
└── dist/                 # Production build output
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles/me` | Get current user profile |
| POST | `/api/businesses` | Create a new business |
| GET | `/api/businesses/:id` | Get business details |
| GET | `/api/customers` | List customers |
| POST | `/api/customers` | Create customer |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/forms` | List forms |
| POST | `/api/forms` | Create form |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | Yes |
| `SESSION_SECRET` | Session encryption secret | Yes |

## Development

```bash
# Start development server with hot reload
npm run dev

# Type check
npm run check

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT License
