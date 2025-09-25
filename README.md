
# KPI Dashboard - AdWise Analytics

A modern, responsive KPI Dashboard built with React, TypeScript, and Flask for comprehensive advertising analytics and data visualization.

## 🚀 Features

- **Real-time Dashboard** - Overview with key metrics and performance indicators
- **Interactive KPI Visualization** - Charts and graphs with filtering capabilities
- **Detailed Data Tables** - Paginated data with sorting and filtering
- **AI-Powered Analysis** - Chatbot for data insights (OpenAI integration)
- **Multi-Platform Support** - Track campaigns across different advertising platforms
- **Responsive Design** - Modern dark theme with cyberpunk styling

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Radix UI
- **Backend**: Flask + SQLite
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/656yash/adwise.git
cd adwise
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Initialize database (if needed)
python database_setup.py

# Start the Flask server
python app.py
```
The backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
# Navigate back to root directory
cd ..

# Install Node.js dependencies
npm install

# Create environment file
cp .env.example .env

# Start the development server
npm run dev
```
The frontend will run on `http://localhost:3000`

## 🌐 Deployment for Public Access

### Option 1: Deploy to Vercel + Railway (Recommended)

#### Deploy Backend to Railway:
1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder
4. Railway will auto-deploy your Flask app
5. Note the public URL (e.g., `https://your-app.railway.app`)

#### Deploy Frontend to Vercel:
1. Go to [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Set environment variable: `VITE_API_BASE_URL=https://your-app.railway.app/api`
4. Deploy

### Option 2: Deploy to Render

#### Backend on Render:
1. Go to [Render](https://render.com)
2. Create a new Web Service
3. Connect your repository, select `backend` folder
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `python app.py`

#### Frontend on Render:
1. Create a new Static Site
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

### Production Environment Variables
- `VITE_API_BASE_URL`: Your deployed backend URL + `/api`
- `VITE_OPENAI_API_KEY`: OpenAI API key for AI analysis features

## 📊 API Endpoints

- `GET /api/health` - Health check
- `GET /api/dashboard/summary` - Dashboard summary data
- `GET /api/kpi/data` - KPI visualization data with filters
- `GET /api/data/detailed` - Detailed data with pagination
- `GET /api/filters/options` - Available filter options
- `GET /api/analytics/trends` - Trend analysis data

## 🚨 Troubleshooting

### "Not opening on other laptops"
This happens when:
1. **Backend not publicly accessible**: Deploy backend to cloud platform
2. **Frontend hardcoded to localhost**: Set `VITE_API_BASE_URL` environment variable
3. **CORS issues**: Backend already configured for CORS

### Common Issues:
- **Database not found**: Run `python backend/database_setup.py`
- **API connection failed**: Check if backend is running and accessible
- **Build warnings**: Already optimized in `vite.config.ts`

## 📱 Usage

1. **Dashboard**: Overview of all KPIs and metrics
2. **KPI Visualization**: Interactive charts with filtering
3. **Detailed Data**: Sortable and filterable data tables
4. **AI Analysis**: Ask questions about your data (requires OpenAI API key)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.