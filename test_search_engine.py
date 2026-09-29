import requests
import re
import urllib.parse
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
}

query = 'Roofing Contractors in Dallas TX'

# Test 1: DuckDuckGo HTML
print("--- Test 1: DuckDuckGo HTML ---")
try:
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    r = requests.post(url, data={'q': query}, headers=headers, timeout=10)
    print("DDG Status:", r.status_code)
    results = re.findall(r'<a class="result__url" href="([^"]+)">(.*?)</a>', r.text)
    print(f"Found {len(results)} URLs via DDG")
    for u, t in results[:5]:
        print(f"URL: {u.strip()} | Snippet: {t.strip()[:60]}")
except Exception as e:
    print("DDG Error:", e)

# Test 2: Overpass targeted query
print("\n--- Test 2: Overpass targeted for roofing/craft/contractor ---")
# Dallas lat/lon: 32.7767, -96.7970
overpass_q = """
[out:json][timeout:15];
(
  node["craft"="roofer"](around:30000,32.7767,-96.7970);
  node["craft"="hvac"](around:30000,32.7767,-96.7970);
  node["craft"="plumber"](around:30000,32.7767,-96.7970);
  node["craft"="electrician"](around:30000,32.7767,-96.7970);
  node["office"="company"](around:30000,32.7767,-96.7970);
);
out body 15;
"""
try:
    r = requests.post("https://overpass-api.de/api/interpreter", data={"data": overpass_q}, headers=headers, timeout=15)
    print("Overpass Status:", r.status_code)
    elements = r.json().get("elements", [])
    print(f"Overpass elements: {len(elements)}")
    for el in elements[:5]:
        tags = el.get("tags", {})
        print(f"- {tags.get('name')} | Phone: {tags.get('phone') or tags.get('contact:phone')} | Web: {tags.get('website') or tags.get('contact:website')}")
except Exception as e:
    print("Overpass Error:", e)
