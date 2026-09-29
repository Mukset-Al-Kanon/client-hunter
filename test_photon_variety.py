import requests
import json

queries = [
    "roofing Dallas TX",
    "solar Austin TX",
    "dentist Miami FL",
    "plumber Phoenix AZ",
    "hvac Houston TX",
    "medspa Scottsdale AZ",
    "remodeling Tampa FL",
    "pool builder Las Vegas NV"
]

for q in queries:
    r = requests.get("https://photon.komoot.io/api/", params={"q": q, "limit": 5}, headers={"User-Agent": "ClientHunter/3.0"}, timeout=5)
    if r.status_code == 200:
        feats = r.json().get("features", [])
        names = [f.get("properties", {}).get("name") for f in feats if f.get("properties", {}).get("name")]
        print(f"Query: '{q}' -> {len(feats)} results: {names[:4]}")
    else:
        print(f"Query: '{q}' -> HTTP {r.status_code}")
