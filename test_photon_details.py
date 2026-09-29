import requests
import json

headers = {"User-Agent": "ClientHunter/3.0"}
url = "https://photon.komoot.io/api/"
params = {"q": "roofing contractors Dallas TX", "limit": 10}
r = requests.get(url, params=params, headers=headers, timeout=8)
features = r.json().get("features", [])
print(f"Total features: {len(features)}")
for idx, f in enumerate(features):
    print(f"\n--- Feature {idx+1} ---")
    print(json.dumps(f.get("properties", {}), indent=2))
