import time
import requests
import json
import re
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor

USER_AGENT = "ClientHunterEnterprise/3.5 (Windows NT 10.0; Win64; x64; LeadGen & Quality Audit Engine)"

NICHE_KEYWORDS = {
    "roofing": ["roof", "roofer", "roofing", "shingle", "gutter"],
    "solar": ["solar", "energy", "photovoltaic", "sun", "panel"],
    "hvac": ["hvac", "air conditioning", "heating", "cooling", "ac repair", "furnace"],
    "dental": ["dental", "dentist", "dentistry", "orthodontic", "smile", "teeth", "implant", "oral"],
    "medspa": ["medspa", "spa", "aesthetics", "botox", "laser", "skincare", "beauty", "cosmetic clinic"],
    "plumbing": ["plumb", "plumber", "plumbing", "drain", "rooter", "pipe", "water heater"],
    "remodeling": ["remodel", "kitchen", "bath", "builder", "renovation", "contractor", "cabinet"],
    "restoration": ["restoration", "water damage", "fire damage", "mold", "cleanup"],
    "flooring": ["flooring", "floor", "epoxy", "hardwood", "tile", "carpet"],
    "pool": ["pool", "swimming", "spa", "backyard"],
    "tree care": ["tree", "arborist", "tree service", "removal"],
    "cleaning": ["cleaning", "janitorial", "maid", "cleaners", "commercial cleaning"],
    "electrician": ["electric", "electrical", "electrician"],
    "painting": ["paint", "painter", "painting"],
    "auto repair": ["auto repair", "mechanic", "automotive", "car repair", "tire"],
}

NICHE_TAGS_MAP = {
    "roofing": [('craft', 'roofer')],
    "solar": [('craft', 'solar'), ('shop', 'solar')],
    "hvac": [('craft', 'hvac')],
    "dental": [('amenity', 'dentist')],
    "medspa": [('amenity', 'clinic'), ('healthcare', 'spa'), ('shop', 'beauty')],
    "plumbing": [('craft', 'plumber')],
    "remodeling": [('craft', 'carpenter'), ('craft', 'interior_work')],
    "restoration": [('craft', 'cleaning')],
    "flooring": [('craft', 'flooring'), ('shop', 'flooring')],
    "pool": [('leisure', 'swimming_pool')],
    "tree care": [('craft', 'gardener')],
    "cleaning": [('craft', 'cleaning'), ('office', 'cleaning')],
    "electrician": [('craft', 'electrician')],
    "painting": [('craft', 'painter')],
    "auto repair": [('shop', 'car_repair'), ('craft', 'car_repair')],
}

def is_lead_relevant(name: str, niche: str, extra_text: str = "") -> bool:
    name_lower = name.lower()
    extra_lower = extra_text.lower()
    combined = f"{name_lower} {extra_lower}"
    niche_lower = niche.lower()

    # Find matching keyword list
    kw_list = []
    for k, v in NICHE_KEYWORDS.items():
        if k in niche_lower or niche_lower in k:
            kw_list = v
            break
    if not kw_list:
        kw_list = [w for w in re.split(r'\W+', niche_lower) if len(w) > 2]

    # Check if any keyword matches
    for kw in kw_list:
        if kw in combined:
            return True
    return False

def test_fast_hunt(niche: str, city: str, count: int = 5):
    t0 = time.time()
    print(f"\n================ Hunt: '{niche}' in '{city}' ================")
    
    # 1. Search Photon
    results = []
    names_seen = set()
    
    q_str = f"{niche} {city.replace(',', '')}"
    try:
        r = requests.get(
            "https://photon.komoot.io/api/",
            params={"q": q_str, "limit": count * 3},
            headers={"User-Agent": USER_AGENT},
            timeout=4
        )
        if r.status_code == 200:
            features = r.json().get("features", [])
            for f in features:
                props = f.get("properties", {})
                name = props.get("name")
                if not name or len(name) < 3:
                    continue
                norm = name.lower().strip()
                if norm in names_seen:
                    continue
                
                # Check relevance
                osm_val = props.get("osm_value", "")
                if not is_lead_relevant(name, niche, osm_val):
                    continue
                
                names_seen.add(norm)
                street = props.get("street", "")
                housenumber = props.get("housenumber", "")
                item_city = props.get("city") or city.split(",")[0].strip()
                item_state = props.get("state") or (city.split(",")[1].strip() if "," in city else "")
                
                results.append({
                    "name": name,
                    "city": f"{item_city}, {item_state}" if item_state else item_city,
                    "address": f"{housenumber} {street}, {item_city}".strip(" ,"),
                    "source": "Photon Real POI",
                    "osm_type": props.get("osm_type"),
                    "osm_id": props.get("osm_id")
                })
                if len(results) >= count:
                    break
    except Exception as e:
        print("Photon error:", e)

    # 2. If needed, query Overpass fast mirror
    if len(results) < count:
        # try overpass-api.de with targeted query
        pass

    dt = int((time.time() - t0) * 1000)
    print(f"Hunted {len(results)} leads in {dt}ms:")
    for idx, r in enumerate(results):
        print(f" {idx+1}. {r['name']} | {r['city']} | {r['address']}")

test_fast_hunt("Roofing Contractors", "Dallas, TX", 4)
test_fast_hunt("Cosmetic Dentistry", "Miami, FL", 4)
test_fast_hunt("Solar Energy", "Austin, TX", 4)
test_fast_hunt("Emergency Plumbing", "Phoenix, AZ", 4)
test_fast_hunt("Medical Spas", "Scottsdale, AZ", 4)
