import requests
import json

cities = {
    "Dallas, TX": (32.7767, -96.7970),
    "Austin, TX": (30.2672, -97.7431),
    "Houston, TX": (29.7604, -95.3698),
    "Miami, FL": (25.7617, -80.1918),
    "Tampa, FL": (27.9506, -82.4572),
    "Orlando, FL": (28.5383, -81.3792),
    "Phoenix, AZ": (33.4484, -112.0740),
    "Scottsdale, AZ": (33.4942, -111.9261),
    "Atlanta, GA": (33.7490, -84.3880),
    "Charlotte, NC": (35.2271, -80.8431),
    "Nashville, TN": (36.1627, -86.7816),
    "Denver, CO": (39.7392, -104.9903),
    "San Diego, CA": (32.7157, -117.1611),
    "Las Vegas, NV": (36.1699, -115.1398),
    "London, UK": (51.5074, -0.1278),
    "Chicago, IL": (41.8781, -87.6298),
    "Los Angeles, CA": (34.0522, -118.2437),
    "New York, NY": (40.7128, -74.0060),
    "Toronto, ON": (43.6532, -79.3832),
    "Sydney, AU": (-33.8688, 151.2093)
}

# Test querying Overpass around Austin, TX coordinates for "solar" or "dentist" or "plumber"
lat, lon = cities["Austin, TX"]
radius = 25000 # 25km

query = f"""
[out:json][timeout:15];
(
  node["craft"="solar"](around:{radius},{lat},{lon});
  node["craft"="electrician"](around:{radius},{lat},{lon});
  node["craft"="plumber"](around:{radius},{lat},{lon});
  node["amenity"="dentist"](around:{radius},{lat},{lon});
  node["shop"="massage"](around:{radius},{lat},{lon});
);
out 15 center;
"""

for s in ["https://z.overpass-api.de/api/interpreter", "https://overpass-api.de/api/interpreter"]:
    try:
        r = requests.post(s, data=query.strip(), headers={"User-Agent": "ClientHunterApp/2.0"}, timeout=15)
        print(s, "status:", r.status_code)
        if r.status_code == 200:
            els = r.json().get("elements", [])
            print(f"Elements in Austin: {len(els)}")
            for el in els[:10]:
                t = el.get("tags", {})
                print(f"Name: {t.get('name')} | Type: {t.get('craft') or t.get('amenity')} | Phone: {t.get('phone')} | Web: {t.get('website')}")
            break
    except Exception as e:
        print(s, "error:", e)
