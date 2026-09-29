import requests
import json

headers = {"User-Agent": "ClientHunterApp/2.0 (contact: info@clienthunter.demo)"}

# Query real businesses around Dallas coordinates (32.7767, -96.7970) with a 15km radius
# Overpass supports around:15000,lat,lon
lat, lon = 32.7767, -96.7970 # Dallas, TX

query = f"""
[out:json][timeout:15];
(
  node["craft"](around:20000,{lat},{lon});
  node["office"](around:20000,{lat},{lon});
  node["amenity"="dentist"](around:20000,{lat},{lon});
  node["shop"](around:20000,{lat},{lon});
);
out body 15;
"""

try:
    r = requests.post("https://overpass-api.de/api/interpreter", data={"data": query}, headers=headers, timeout=15)
    print("Overpass status:", r.status_code)
    data = r.json()
    elements = data.get("elements", [])
    print(f"Total elements returned: {len(elements)}")
    for el in elements[:8]:
        tags = el.get("tags", {})
        name = tags.get("name")
        if name:
            phone = tags.get("phone") or tags.get("contact:phone")
            web = tags.get("website") or tags.get("contact:website")
            craft = tags.get("craft") or tags.get("office") or tags.get("amenity") or tags.get("shop")
            street = tags.get("addr:street")
            print(f"- {name} | Type: {craft} | Phone: {phone} | Web: {web} | Street: {street}")
except Exception as e:
    print("Error:", e)
