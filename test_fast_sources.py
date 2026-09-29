import requests

headers = {
    "User-Agent": "ClientHunterHQ_Tool/3.1 (leadgen_app_admin@gmail.com)",
    "Accept": "application/json"
}

print("1. Testing Nominatim with custom User-Agent...")
try:
    r = requests.get(
        "https://nominatim.openstreetmap.org/search",
        params={"q": "roofing contractors in Dallas, TX", "format": "json", "limit": 5, "addressdetails": 1, "extratags": 1},
        headers=headers,
        timeout=8
    )
    print("Nominatim status:", r.status_code)
    if r.status_code == 200:
        data = r.json()
        print(f"Nominatim returned {len(data)} items:")
        for it in data:
            print(" -", it.get("display_name")[:80], "| Extratags:", it.get("extratags"))
except Exception as e:
    print("Nominatim error:", e)

print("\n2. Testing Photon...")
try:
    r = requests.get(
        "https://photon.komoot.io/api/",
        params={"q": "roofing Dallas TX", "limit": 5},
        headers=headers,
        timeout=8
    )
    print("Photon status:", r.status_code)
    if r.status_code == 200:
        data = r.json().get("features", [])
        print(f"Photon returned {len(data)} items:")
        for feat in data:
            props = feat.get("properties", {})
            print(" -", props.get("name"), "| City:", props.get("city"), "| Osm:", props.get("osm_value"))
except Exception as e:
    print("Photon error:", e)

print("\n3. Testing Overpass mirrors with clean targeted query...")
overpass_mirrors = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
]
q = """[out:json][timeout:10];
(
  node["craft"="roofer"](around:25000, 32.7767, -96.7970);
  way["craft"="roofer"](around:25000, 32.7767, -96.7970);
);
out 10 center;"""

for m in overpass_mirrors:
    try:
        t0 = requests.compat.time.time()
        r = requests.post(m, data=q, headers={"User-Agent": "ClientHunterApp/3.0"}, timeout=10)
        dt = int((requests.compat.time.time() - t0)*1000)
        print(f"{m} -> {r.status_code} ({dt}ms)")
        if r.status_code == 200:
            els = r.json().get("elements", [])
            print(f"  Found {len(els)} roofers")
            for el in els[:3]:
                print("   *", el.get("tags", {}).get("name"), el.get("tags", {}).get("phone"), el.get("tags", {}).get("website"))
            break
    except Exception as e:
        print(f"{m} error: {e}")
