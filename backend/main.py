from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from typing import Optional
from data_fetcher import (
    get_outside_data, get_indoor_data, get_latest, fetch_all_data, clear_cache
)

app = FastAPI(title="Weather API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/outside")
def get_outside(
    days: int = Query(7, description="Number of days of data to return"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    df = get_outside_data(days=days)

    if start_date:
        df = df[df["datetime"] >= datetime.fromisoformat(start_date)]
    elif end_date:
        df = df[df["datetime"] <= datetime.fromisoformat(end_date)]

    records = df.to_dict("records")
    for r in records:
        if r.get("datetime"):
            r["datetime"] = r["datetime"].isoformat()

    return {
        "data": records,
        "count": len(records),
        "date_range": {
            "start": records[0]["datetime"] if records else None,
            "end": records[-1]["datetime"] if records else None
        }
    }


@app.get("/api/outside/latest")
def get_latest_outside():
    latest = get_latest()
    if latest is None:
        return {"error": "No data available"}

    return {
        "datetime": latest["datetime"].isoformat(),
        "temperature": latest.get("temperature"),
        "humidity": latest.get("humidity"),
        "pressure": latest.get("pressure"),
        "wind": latest.get("wind"),
        "voltage": latest.get("voltage")
    }


@app.get("/api/outside/stats")
def get_outside_stats(days: int = Query(7)):
    df = get_outside_data(days=days)

    if len(df) == 0:
        return {"error": "No data available"}

    return {
        "period_days": days,
        "temperature": {
            "min": float(df["temperature"].min()),
            "max": float(df["temperature"].max()),
            "mean": float(df["temperature"].mean()),
            "current": float(df["temperature"].iloc[-1])
        },
        "humidity": {
            "min": float(df["humidity"].min()),
            "max": float(df["humidity"].max()),
            "mean": float(df["humidity"].mean()),
            "current": float(df["humidity"].iloc[-1])
        },
        "pressure": {
            "min": float(df["pressure"].min()),
            "max": float(df["pressure"].max()),
            "mean": float(df["pressure"].mean()),
            "current": float(df["pressure"].iloc[-1])
        }
    }


@app.get("/api/forecast")
def get_forecast():
    return {"arima": [], "lstm": []}


@app.get("/api/dashboard")
def get_dashboard():
    df = get_outside_data(days=7)
    latest = get_latest()

    return {
        "latest": {
            "datetime": latest["datetime"].isoformat() if latest is not None else None,
            "temperature": latest.get("temperature") if latest is not None else None,
            "humidity": latest.get("humidity") if latest is not None else None,
            "pressure": latest.get("pressure") if latest is not None else None,
        },
        "week_data": [{"datetime": r["datetime"].isoformat(), **dict(r)} for r in df.to_dict("records")] if len(df) > 0 else [],
        "forecasts": {"arima": [], "lstm": []},
        "last_updated": datetime.now().isoformat()
    }


@app.get("/api/indoor")
def get_indoor(days: int = Query(7)):
    data_list = get_indoor_data(days=days)

    for r in data_list:
        if r.get("datetime"):
            r["datetime"] = r["datetime"].isoformat()

    return {
        "data": data_list,
        "count": len(data_list),
        "date_range": {
            "start": data_list[0]["datetime"] if data_list else None,
            "end": data_list[-1]["datetime"] if data_list else None
        }
    }


@app.get("/api/indoor/stats")
def get_indoor_stats(days: int = Query(7)):
    data_list = get_indoor_data(days=days)

    temps = [d.get("bedroom_temp") for d in data_list if d.get("bedroom_temp")]
    humidities = [d.get("bedroom_humidity") for d in data_list if d.get("bedroom_humidity")]
    living_temps = [d.get("living_room_temp") for d in data_list if d.get("living_room_temp")]
    kitchen_temps = [d.get("kitchen_temp") for d in data_list if d.get("kitchen_temp")]

    return {
        "bedroom": {
            "temp": {
                "current": temps[-1] if temps else None,
                "min": min(temps) if temps else None,
                "max": max(temps) if temps else None,
                "mean": sum(temps) / len(temps) if temps else None
            },
            "humidity": {
                "current": humidities[-1] if humidities else None,
                "min": min(humidities) if humidities else None,
                "max": max(humidities) if humidities else None,
                "mean": sum(humidities) / len(humidities) if humidities else None
            }
        },
        "living_room": {
            "temp": {
                "current": living_temps[-1] if living_temps else None,
                "min": min(living_temps) if living_temps else None,
                "max": max(living_temps) if living_temps else None,
                "mean": sum(living_temps) / len(living_temps) if living_temps else None
            }
        },
        "kitchen": {
            "temp": {
                "current": kitchen_temps[-1] if kitchen_temps else None,
                "min": min(kitchen_temps) if kitchen_temps else None,
                "max": max(kitchen_temps) if kitchen_temps else None,
                "mean": sum(kitchen_temps) / len(kitchen_temps) if kitchen_temps else None
            }
        }
    }


@app.post("/api/refresh")
def refresh_data():
    clear_cache()
    fetch_all_data()
    return {"status": "ok", "message": "Cache cleared, data will be refreshed"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
