import requests
import re
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
}

def search_yellowpages(term, location):
    url = f"https://www.yellowpages.com/search?search_terms={quote_plus(term)}&geo_location_terms={quote_plus(location)}"
    print(f"Searching YellowPages: {url}")
    try:
        r = requests.get(url, headers=headers, timeout=10)
        print("YP Status:", r.status_code)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            results = []
            cards = soup.select('.result')
            print(f"YP Cards found: {len(cards)}")
            for c in cards[:10]:
                name_el = c.select_one('.business-name')
                name = name_el.get_text(strip=True) if name_el else None
                phone_el = c.select_one('.phone')
                phone = phone_el.get_text(strip=True) if phone_el else None
                web_el = c.select_one('a.track-visit-website')
                web = web_el['href'] if web_el and 'href' in web_el.attrs else None
                rating_el = c.select_one('.result-rating')
                rating = rating_el.get_text(strip=True) if rating_el else None
                
                # Check street address
                street_el = c.select_one('.street-address')
                street = street_el.get_text(strip=True) if street_el else None
                
                if name:
                    results.append({
                        "name": name,
                        "phone": phone,
                        "website": web,
                        "street": street,
                        "rating": rating
                    })
            for res in results[:5]:
                print("YP Lead:", res)
            return results
    except Exception as e:
        print("YP Error:", e)
    return []

if __name__ == "__main__":
    search_yellowpages("Roofing", "Dallas, TX")
    search_yellowpages("Cosmetic Dentistry", "Austin, TX")
