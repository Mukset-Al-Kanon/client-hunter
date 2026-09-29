import requests
import re
from bs4 import BeautifulSoup
from urllib.parse import quote_plus, unquote

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

def test_bing():
    print("Testing Bing search...")
    q = "Roofing Contractors Dallas TX"
    url = f"https://www.bing.com/search?q={quote_plus(q)}"
    r = requests.get(url, headers=headers, timeout=10)
    print("Bing status:", r.status_code)
    soup = BeautifulSoup(r.text, 'html.parser')
    results = []
    for li in soup.select('li.b_algo'):
        h2 = li.find('h2')
        if h2 and h2.find('a'):
            link = h2.find('a')['href']
            title = h2.get_text(strip=True)
            snippet = li.find('p')
            snip_text = snippet.get_text(strip=True) if snippet else ""
            results.append((title, link, snip_text))
    print(f"Bing found: {len(results)} results")
    for t, l, s in results[:5]:
        print(f" * {t} -> {l}")
    return len(results) > 0

def test_ddg_lite():
    print("\nTesting DDG Lite...")
    q = "Roofing Contractors Dallas TX"
    url = "https://lite.duckduckgo.com/lite/"
    r = requests.post(url, data={"q": q}, headers=headers, timeout=10)
    print("DDG Lite status:", r.status_code)
    soup = BeautifulSoup(r.text, 'html.parser')
    links = []
    for a in soup.select('a.result-link'):
        links.append((a.get_text(strip=True), a['href']))
    print(f"DDG Lite found: {len(links)} results")
    for t, l in links[:5]:
        print(f" * {t} -> {l}")
    return len(links) > 0

def test_nominatim():
    print("\nTesting OpenStreetMap Nominatim...")
    # Real business search via Nominatim
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": "Roofing in Dallas, TX",
        "format": "json",
        "addressdetails": 1,
        "limit": 10
    }
    r = requests.get(url, params=params, headers={"User-Agent": "ClientHunterPro/2.0 (leadgen@example.com)"}, timeout=10)
    print("Nominatim status:", r.status_code)
    try:
        data = r.json()
        print(f"Nominatim found: {len(data)} items")
        for item in data[:5]:
            print(f" * {item.get('display_name')} | Class: {item.get('class')} | Type: {item.get('type')}")
    except Exception as e:
        print("Nominatim error:", e)

def test_overpass_fixed():
    print("\nTesting Overpass with proper syntax...")
    url = "https://z.overpass-api.de/api/interpreter"
    # Fast targeted coordinate query
    q = """
    [out:json][timeout:15];
    (
      node["craft"="roofer"](around:25000, 32.7767, -96.7970);
      way["craft"="roofer"](around:25000, 32.7767, -96.7970);
      node["craft"="builder"](around:25000, 32.7767, -96.7970);
    );
    out 10 center;
    """
    try:
        r = requests.post(url, data=q.strip(), headers={"User-Agent": "ClientHunterApp/2.0"}, timeout=15)
        print("Overpass status:", r.status_code)
        if r.status_code == 200:
            els = r.json().get("elements", [])
            print(f"Overpass elements: {len(els)}")
            for el in els[:5]:
                print(" *", el.get("tags", {}).get("name"), el.get("tags", {}).get("phone"), el.get("tags", {}).get("website"))
    except Exception as e:
        print("Overpass error:", e)

if __name__ == "__main__":
    test_bing()
    test_ddg_lite()
    test_nominatim()
    test_overpass_fixed()
