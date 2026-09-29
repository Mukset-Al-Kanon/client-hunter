import requests
import time

mirrors = [
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
]

q = """[out:json][timeout:10];
(
  node["craft"="roofer"](around:25000, 32.7767, -96.7970);
  way["craft"="roofer"](around:25000, 32.7767, -96.7970);
);
out 15 center;"""

for m in mirrors:
    t0 = time.time()
    try:
        r = requests.post(m, data=q, headers={"User-Agent": "ClientHunter/3.0"}, timeout=10)
        dt = int((time.time() - t0) * 1000)
        print(f"{m} -> {r.status_code} in {dt}ms")
        if r.status_code == 200:
            els = r.json().get("elements", [])
            print(f"  Got {len(els)} elements!")
            for el in els[:5]:
                t = el.get("tags", {})
                print(f"   - {t.get('name')} | Phone: {t.get('phone')} | Web: {t.get('website')}")
            break
    except Exception as e:
        print(f"{m} failed in {int((time.time()-t0)*1000)}ms: {e}")
