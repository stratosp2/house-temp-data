# Weather Dashboard

A modern weather monitoring and forecasting dashboard with a React frontend and FastAPI backend.

## Features

- **Real-time Weather Data**: Displays outside temperature, humidity, and pressure
- **Indoor Monitoring**: Shows indoor temperatures from bedroom, living room, and kitchen sensors
- **Forecasts**: Visualizes ARIMA and LSTM temperature predictions
- **Interactive Charts**: Modern dark-themed charts with zoom and hover details
- **Multiple Time Ranges**: View data from last 24 hours, 7, 14, or 30 days

## Architecture

```
Weather data/
├── backend/              # FastAPI backend
│   ├── main.py           # API endpoints
│   └── pyproject.toml    # Python dependencies
├── frontend/             # Next.js frontend
│   ├── app/
│   │   ├── Dashboard.tsx    # Main dashboard component
│   │   ├── page.tsx         # Root page
│   │   └── globals.css      # Dark theme styles
│   └── package.json
├── pull_weather_data_from_drive.py  # Script to fetch data from Google Sheets
├── run_pipeline.py       # Pipeline to run R and LSTM forecasts
└── start_dashboard.ps1   # Startup script for Windows
```

## Data Sources

- **Outside Data**: `Data outside.csv` - Temperature, humidity, pressure, wind (from Google Sheets)
- **Indoor Data**: `House data_in.csv`, `Living_kitchen_in.csv` - Indoor sensors (from Google Sheets)
- **Forecasts**: `r_forecast.csv` (ARIMA), `LSTM_data_new.csv` (LSTM)

## Prerequisites

### Backend
- Python 3.9+
- Poetry (for dependency management)

### Frontend
- Node.js 18+
- npm

## Installation

### Backend
```bash
cd backend
poetry install
```

### Frontend
```bash
cd frontend
npm install
```

## Running the Project

### Option 1: Manual Startup

**Terminal 1 - Backend:**
```bash
cd backend
poetry run python main.py
```
The API will be available at http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The dashboard will be available at http://localhost:3000

### Option 2: Startup Script (Windows PowerShell)

```powershell
.\start_dashboard.ps1
```

This script:
- Starts the backend on port 8000
- Starts the frontend on port 3000
- Performs health checks every 30 seconds
- Press Ctrl+C to stop all services

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/outside` | Get outside weather data (supports `?days=N`) |
| `GET /api/outside/latest` | Get latest outside reading |
| `GET /api/outside/stats` | Get min/max/mean statistics |
| `GET /api/indoor` | Get indoor sensor data (supports `?days=N`) |
| `GET /api/forecast` | Get ARIMA and LSTM forecasts |
| `GET /docs` | Swagger API documentation |

## Updating Data

### Pull Latest Data from Google Sheets
```bash
python pull_weather_data_from_drive.py
```

### Run Forecasts
```bash
python run_pipeline.py
```

This will:
1. Pull latest data from Google Sheets
2. Fetch precipitation data from Open-Meteo API
3. Run R ARIMA forecasting
4. Run LSTM forecasting
5. Generate comparison plots

## Frontend Customization

### Dark Theme Colors
The color scheme is defined in `frontend/app/globals.css`:
- Primary background: `#0f172a`
- Card background: `#1e293b`
- Temperature: `#3b82f6` (blue)
- Humidity: `#10b981` (green)
- Pressure: `#8b5cf6` (purple)
- ARIMA forecast: `#f97316` (orange)
- LSTM forecast: `#06b6d4` (cyan)
- Bedroom: `#f59e0b` (amber)
- Living Room: `#ec4899` (pink)
- Kitchen: `#22c55e` (green)

### Adding New Charts
Edit `frontend/app/Dashboard.tsx` to add new visualizations using Recharts components.

## Troubleshooting

### Backend won't start
- Make sure Poetry dependencies are installed: `poetry install`
- Check that port 8000 is not in use

### Frontend won't start
- Make sure npm dependencies are installed: `npm install`
- Check that port 3000 is not in use

### No data showing
- Ensure data files exist in the root directory
- Run `python pull_weather_data_from_drive.py` to fetch latest data
- Check API is running: http://localhost:8000/api/outside?days=1

### Indoor data not showing
- Check that `House data_in.csv` and `Living_kitchen_in.csv` exist
- Run `python pull_weather_data_from_drive.py` to fetch indoor data

## Technologies

- **Frontend**: Next.js 14, React, Recharts, Tailwind CSS
- **Backend**: FastAPI, Pandas
- **Forecasting**: R (ARIMA), Python (LSTM)
- **Data Storage**: CSV files, Google Sheets
