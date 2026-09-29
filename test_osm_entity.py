import requests
import json

r = requests.get("https://www.openstreetmap.org/api/0.6/way/469119712.json", headers={"User-Agent": "ClientHunter/3.0"})
print("Status:", r.status_code)
if r.status_code == 200:
    elements = r.json().get("elements", [])
    if elements:
        print("Tags:", json.dumps(elements[0].get("tags", {}), indent=2))
