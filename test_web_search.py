import requests
import json
import re
from bs4 import BeautifulSoup
from urllib.parse import quote_plus, unquote

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

def test_ddg_html():
    print("Testing DDG HTML...")
    url = f"https://html.duckduckgo.com/html/?q={quote_plus('Roofing Contractors Dallas TX site:yellowpages.com OR site:yelp.com OR phone')}"
    try:
        r = requests.post(url, data={"q": "Roofing Contractors Dallas TX phone"}, headers=headers, timeout=8)
        print("Status:", r.status_code)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            results = soup.select('.result__body')
            print("DDG Results count:", len(results))
            for res in results[:3]:
                title = res.select_one('.result__title')
                snip = res.select_one('.result__snippet')
                print(" - Title:", title.get_text(strip=True) if title else None)
                print("   Snippet:", snip.get_text(strip=True) if snip else None)
    except Exception as e:
        print("DDG Error:", e)

def test_bing_filtered():
    print("\nTesting Bing with safe search and contractor query...")
    url = f"https://www.bing.com/search?q={quote_plus('roofing contractors in Dallas TX business phone website')}&setlang=en-US"
    try:
        r = requests.get(url, headers=headers, timeout=8)
        print("Bing status:", r.status_code)
        soup = BeautifulSoup(r.text, 'html.parser')
        cards = soup.select('li.b_algo')
        print(f"Bing cards: {len(cards)}")
        for c in cards[:4]:
            h2 = c.find('h2')
            if h2 and h2.find('a'):
                title = h2.get_text(strip=True)
                href = h2.find('a')['href']
                snip = c.find('p')
                stext = snip.get_text(strip=True) if snip else ""
                print(f" * Title: {title} | Url: {href[:60]} | Snip: {stext[:70]}")
    except Exception as e:
        print("Bing error:", e)

test_ddg_html()
test_bing_filtered()
