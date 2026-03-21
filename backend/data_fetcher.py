import requests as rs
import pandas as pd
from datetime import datetime, timedelta
from functools import lru_cache
import time

GOOGLE_SHEETS = {
    "outside": "https://docs.google.com/spreadsheets/d/1Dcg84-O35JzXmrkQ0q9S0jeI2T-96mD-DbRIkEsqBcI/gviz/tq?tqx=out:csv&sheet=Data outside",
    "house": "https://docs.google.com/spreadsheets/d/1aRfXSqShjQatAkL54E7l7iTxp0BmXJeg3a5SX9UOq28/gviz/tq?tqx=out:csv&sheet=House data",
    "living": "https://docs.google.com/spreadsheets/d/1FkOtIjSY1NgbXuDY9OC9g6mjoBLi9kD6B1cy3UgU7CQ/gviz/tq?tqx=out:csv&sheet=Living room kitchen data"
}

CACHE_DURATION = 300

_cache = {"data": None, "timestamp": 0}


def extract_hours(time_val):
    try:
        time_str = str(time_val).split(".")[0]
        parts = time_str.split(":")
        if len(parts) >= 2:
            return int(parts[0]) + int(parts[1]) / 60
        return 0
    except:
        return 0


def fetch_all_data():
    now = time.time()
    if _cache["data"] and (now - _cache["timestamp"]) < CACHE_DURATION:
        return _cache["data"]

    data = {}

    try:
        res = rs.get(GOOGLE_SHEETS["outside"], timeout=30)
        if res.status_code == 200:
            from io import StringIO
            df = pd.read_csv(StringIO(res.text))
            df = df.rename(columns={
                "Temp": "temperature",
                "Humidity (%)": "humidity",
                "Pressure (hPa)": "pressure",
                "Rain (sen)": "rain_sensor",
                "Wind (km/h)": "wind",
                "Voltage (V)": "voltage"
            })
            df["datetime"] = pd.to_datetime(df["Date"], format="%d/%m/%Y", errors="coerce")
            df["hours"] = df["Time"].apply(extract_hours)
            df["datetime"] = df["datetime"] + pd.to_timedelta(df["hours"], unit="h")
            df["datetime"] = df["datetime"].dt.round("1h")
            for col in ["temperature", "humidity", "pressure", "wind", "voltage"]:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors="coerce")
            df = df.dropna(subset=["datetime"])
            df = df.sort_values("datetime")
            df = df.drop_duplicates(subset=["datetime"])
            data["outside"] = df
    except Exception as e:
        print(f"Error fetching outside data: {e}")

    try:
        res = rs.get(GOOGLE_SHEETS["house"], timeout=30)
        if res.status_code == 200:
            from io import StringIO
            df = pd.read_csv(StringIO(res.text))
            df["datetime"] = pd.to_datetime(df["Date"], format="%d/%m/%Y", errors="coerce")
            df["hours"] = df["Time"].apply(extract_hours)
            df["datetime"] = df["datetime"] + pd.to_timedelta(df["hours"], unit="h")
            df["datetime"] = df["datetime"].dt.round("1h")
            df = df.dropna(subset=["datetime"])
            if "Temp" in df.columns:
                df["Temp"] = pd.to_numeric(df["Temp"], errors="coerce")
                df = df[df["Temp"] > 0]
            df = df.drop_duplicates(subset=["datetime"])
            data["house"] = df
    except Exception as e:
        print(f"Error fetching house data: {e}")

    try:
        res = rs.get(GOOGLE_SHEETS["living"], timeout=30)
        if res.status_code == 200:
            from io import StringIO
            df = pd.read_csv(StringIO(res.text))
            df["datetime"] = pd.to_datetime(df["Date"], format="%d/%m/%Y", errors="coerce")
            df["hours"] = df["Time"].apply(extract_hours)
            df["datetime"] = df["datetime"] + pd.to_timedelta(df["hours"], unit="h")
            df["datetime"] = df["datetime"].dt.round("1h")
            df = df.dropna(subset=["datetime"])
            for col in ["Living room", "Kitchen"]:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors="coerce")
            df = df.drop_duplicates(subset=["datetime"])
            data["living"] = df
    except Exception as e:
        print(f"Error fetching living data: {e}")

    _cache["data"] = data
    _cache["timestamp"] = now
    return data


def get_outside_data(days=7):
    data = fetch_all_data()
    if "outside" not in data or data["outside"] is None:
        return pd.DataFrame()
    df = data["outside"]
    cutoff = datetime.now() - timedelta(days=days)
    filtered = df[df["datetime"] >= cutoff]
    if len(filtered) > 0:
        return filtered.sort_values("datetime")
    return df.sort_values("datetime")


def get_indoor_data(days=7):
    cutoff = datetime.now() - timedelta(days=days)
    all_data = {}

    data = fetch_all_data()

    if "house" in data and data["house"] is not None:
        for _, row in data["house"].iterrows():
            if row["datetime"] < cutoff:
                continue
            dt_key = row["datetime"].replace(minute=0, second=0)
            all_data[dt_key] = {
                "datetime": row["datetime"],
                "bedroom_temp": row.get("Temp"),
                "bedroom_humidity": row.get("Humidity") or row.get("Humidity (%)")
            }

    if "living" in data and data["living"] is not None:
        for _, row in data["living"].iterrows():
            if row["datetime"] < cutoff:
                continue
            dt_key = row["datetime"].replace(minute=0, second=0)
            if dt_key not in all_data:
                all_data[dt_key] = {"datetime": row["datetime"]}
            all_data[dt_key]["living_room_temp"] = row.get("Living room")
            all_data[dt_key]["kitchen_temp"] = row.get("Kitchen")

    return sorted(all_data.values(), key=lambda x: x.get("datetime", cutoff))


def get_latest():
    df = get_outside_data(days=7)
    if len(df) == 0:
        return None
    return df.iloc[-1]


def clear_cache():
    _cache["data"] = None
    _cache["timestamp"] = 0
