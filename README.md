# Trendy Suits AI - Fashion Price Comparison Platform

Trendy Suits AI is a premium, luxury-themed fashion price comparison platform. It aggregates fashion catalogs and queries real-time pricing feeds from popular affiliate e-commerce stores (Amazon, Flipkart, Meesho, Myntra, Zudio, Zara, and Trends) to display the best available deals, price drop history charts, price forecasts, and recommendations.

---

## Project Architecture

```
project1/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── auth/             # JWT auth tokens and hash helper
│   │   ├── db/               # SQLAlchemy Models, schemas, & seeder
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Caching and AI forecasting/chatbot
│   │   ├── config.py         # Config values
│   │   └── main.py           # Application lifespan lifecycle
│   ├── requirements.txt      # Python libraries list
│   └── run.py                # Server runner
└── frontend/                 # Next.js TypeScript Frontend
    ├── src/
    │   ├── app/              # Next.js App Router Page directories
    │   ├── components/       # Layouts, navbar, AI chatbot, and footer
    │   ├── hooks/            # Client persistence hooks
    │   └── types/            # TypeScript interfaces index
    ├── package.json          # Node dependencies
    ├── tailwind.config.js    # Glassmorphism styling configuration
    ├── postcss.config.js     # PostCSS setup
    ├── next.config.js        # Next.js configuration
    └── tsconfig.json         # TypeScript compiler configurations
```

---

## ⚡ Quick Start: Backend Setup (FastAPI)

1. **Navigate to the backend directory and install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the Database Seeder**:
   Set `PYTHONPATH` to resolve packages, then run the seeder script. This will drop old tables, recreate them, and seed a rich dataset of luxury brands (Gucci, Rolex, Prada), categories, varying store prices, 1-year historical prices, reviews, and a default admin account.
   
   **On Windows (PowerShell)**:
   ```powershell
   $env:PYTHONPATH="."
   python app/db/seed.py
   ```
   **On Linux / macOS**:
   ```bash
   PYTHONPATH=. python app/db/seed.py
   ```

3. **Start the Dev Server**:
   ```bash
   python run.py
   ```
   The API will be available at `http://localhost:8000`. You can visit `http://localhost:8000/docs` to open the interactive Swagger API documentation.

### Default Seeder Accounts:
* **Admin Access**: `admin@trendysuits.ai` / `admin123`
* **Test User Access**: `user@trendysuits.ai` / `user123`

---

## ⚡ Quick Start: Frontend Setup (Next.js)

1. **Install Node.js packages** (requires Node.js v18+ and npm):
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Next.js Local Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## 🚀 Deployment Instructions

### Frontend (Next.js)
The frontend is fully optimized for serverless deployments on **Vercel** or **Netlify**:
1. Connect your GitHub repository to Vercel.
2. Set the Root Directory parameter to `frontend`.
3. Vercel will auto-detect Next.js and compile production bundles immediately.

### Backend (FastAPI)
The backend can be deployed to **Render**, **Railway**, or any VPS:
1. Provision a PostgreSQL database and a Redis cluster.
2. Set environment variables on your server:
   - `DATABASE_URL`: `postgresql://user:pass@host:port/dbname`
   - `REDIS_URL`: `redis://default:pass@redis-host:6379`
   - `SECRET_KEY`: A secure random cryptographic string
3. Start the application in production:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
   ```
