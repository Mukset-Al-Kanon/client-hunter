import requests
import json

lat, lon = 32.7767, -96.7970 # Dallas, TX

query = """
[out:json][timeout:20];
(
  node["craft"](around:25000, 32.7767, -96.7970);
  way["craft"](around:25000, 32.7767, -96.7970);
  node["office"="company"](around:25000, 32.7767, -96.7970);
  way["office"="company"](around:25000, 32.7767, -96.7970);
  node["amenity"~"dentist|clinic|doctors"](around:25000, 32.7767, -96.7970);
  way["amenity"~"dentist|clinic|doctors"](around:25000, 32.7767, -96.7970);
);
out 40 center;
"""

r = requests.post("https://z.overpass-api.de/api/interpreter", data=query.strip(), headers={"User-Agent": "ClientHunter/2.0"}, timeout=20)
print("Status:", r.status_code)
if r.status_code == 200:
    elements = r.json().get("elements", [])
    print(f"Total elements: {len(elements)}")
    with_phone = 0
    with_web = 0
    with_name = 0
    leads = []
    for el in elements:
        t = el.get("tags", {})
        name = t.get("name")
        if not name:
            continue
        with_name += 1
        phone = t.get("phone") or t.get("contact:phone")
        web = t.get("website") or t.get("contact:website")
        street = t.get("addr:street")
        city = t.get("addr:city") or "Dallas"
        state = t.get("addr:state") or "TX"
        if phone:
            with_phone += 1
        if web:
            with_web += 1
        leads.append({
            "name": name,
            "type": t.get("craft") or t.get("amenity") or t.get("office") or "Business",
            "phone": phone,
            "website": web,
            "address": f"{street or ''}, {city}, {state}".strip(", ")
        })
    print(f"Named businesses: {with_name}, With Phone: {with_phone}, With Website: {with_web}")
    for l in leads[:12]:
        print(l)
