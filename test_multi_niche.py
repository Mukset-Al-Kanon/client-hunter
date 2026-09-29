import requests
import json
import time

test_queries = [
    ("Roofing", "Dallas, TX"),
    ("Solar", "Austin, TX"),
    ("Dentist", "Miami, FL"),
    ("Plumber", "Phoenix, AZ"),
    ("HVAC", "Houston, TX"),
    ("MedSpa", "Scottsdale, AZ"),
]

headers = {"User-Agent": "ClientHunterEnterprise/3.0 (info@clienthunter.org)"}

for niche, city in test_queries:
    print(f"\n=================== Hunting: {niche} in {city} ===================")
    # Search photon
    q_str = f"{niche} {city.replace(',', '')}"
    try:
        r = requests.get("https://photon.komoot.io/api/", params={"q": q_str, "limit": 6}, headers=headers, timeout=6)
        if r.status_code == 200:
            features = r.json().get("features", [])
            print(f"Photon returned {len(features)} candidates")
            for f in features[:3]:
                props = f.get("properties", {})
                osm_type = props.get("osm_type", "").lower()
                osm_id = props.get("osm_id")
                type_map = {"n": "node", "w": "way", "r": "relation"}
                full_type = type_map.get(osm_type, "node")
                
                # Fetch entity details
                osm_url = f"https://www.openstreetmap.org/api/0.6/{full_type}/{osm_id}.json"
                r_entity = requests.get(osm_url, headers=headers, timeout=4)
                if r_entity.status_code == 200:
                    els = r_entity.json().get("elements", [])
                    if els:
                        tags = els[0].get("tags", {})
                        print(f"  -> Name: {tags.get('name') or props.get('name')}")
                        print(f"     Phone: {tags.get('phone') or tags.get('contact:phone')}")
                        print(f"     Web: {tags.get('website') or tags.get('contact:website')}")
                        print(f"     Address: {props.get('housenumber', '')} {props.get('street', '')} {props.get('city', '')} {props.get('state', '')}")
                        print(f"     Email: {tags.get('email') or tags.get('contact:email')}")
                else:
                    print(f"  -> Name (from photon): {props.get('name')} | {props.get('city')}")
    except Exception as e:
        print("Error:", e)
