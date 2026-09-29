import requests
import re
import socket
import dns.resolver
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

def audit_and_enrich_site(website_url):
    print(f"\n--- Auditing: {website_url} ---")
    if not website_url.startswith("http"):
        website_url = "https://" + website_url

    res = {
        "url": website_url,
        "is_alive": False,
        "has_ssl": website_url.startswith("https"),
        "load_time_ms": 0,
        "emails": set(),
        "phones": set(),
        "socials": {},
        "tech_stack": [],
        "mx_valid": False,
        "has_booking_form": False
    }

    try:
        import time
        t0 = time.time()
        resp = requests.get(website_url, headers=headers, timeout=8, verify=False)
        load_time = int((time.time() - t0) * 1000)
        res["load_time_ms"] = load_time
        res["status_code"] = resp.status_code
        res["is_alive"] = resp.status_code < 400

        html = resp.text
        soup = BeautifulSoup(html, 'html.parser')

        # 1. Tech stack detection
        html_lower = html.lower()
        if "wp-content" in html_lower or "wordpress" in html_lower:
            res["tech_stack"].append("WordPress")
        if "webflow" in html_lower:
            res["tech_stack"].append("Webflow")
        if "squarespace" in html_lower:
            res["tech_stack"].append("Squarespace")
        if not ("wp-content" in html_lower or "wordpress" in html_lower) and ("wix-warmup-data" in html_lower or "parastorage.com" in html_lower or "wixsite.com" in html_lower):
            res["tech_stack"].append("Wix")
        if "shopify" in html_lower:
            res["tech_stack"].append("Shopify")
        if "elementor" in html_lower:
            res["tech_stack"].append("Elementor")
        if "bootstrap" in html_lower:
            res["tech_stack"].append("Bootstrap")

        # 2. Check for booking form / lead capture
        if any(w in html_lower for w in ["calendly", "acuity", "schedule", "book online", "request an estimate", "free quote form"]):
            res["has_booking_form"] = True

        # 3. Email scraping from mailto & text
        mailtos = soup.select('a[href^="mailto:"]')
        for m in mailtos:
            email_val = m['href'].replace('mailto:', '').split('?')[0].strip()
            if email_val and "@" in email_val:
                res["emails"].add(email_val.lower())

        found_emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,8}\b', html)
        bad_pkg_names = {"react", "react-dom", "lodash", "core-js", "core-js-bundle", "rspack", "webpack", "babel", "intl-segmenter", "focus-within-polyfill", "polyfill", "sentry", "wix", "example.com", "schema.org"}
        for e in found_emails:
            e_clean = e.lower().strip()
            user_part = e_clean.split("@")[0]
            domain_part = e_clean.split("@")[-1]
            if user_part in bad_pkg_names or any(b in user_part for b in ["polyfill", "bundle", "segmenter", "sentry"]):
                continue
            if domain_part in bad_pkg_names or any(domain_part.endswith(ext) for ext in [".png", ".jpg", ".webp", ".svg", ".js", ".css", ".map"]):
                continue
            if not any(bad in e_clean for bad in [".png", ".jpg", ".webp", ".svg", ".js", ".css", "sentry", "wix", "example.com"]):
                res["emails"].add(e_clean)

        # 4. Social links
        for a in soup.select('a[href]'):
            href = a['href']
            if "facebook.com" in href and not any(x in href for x in ["sharer", "share"]):
                res["socials"]["facebook"] = href
            elif "instagram.com" in href:
                res["socials"]["instagram"] = href
            elif "linkedin.com/company" in href:
                res["socials"]["linkedin"] = href

        # 5. MX check on domain
        domain = urlparse(website_url).netloc.replace("www.", "")
        try:
            records = dns.resolver.resolve(domain, 'MX')
            if records:
                res["mx_valid"] = True
                res["mx_server"] = str(records[0].exchange)
        except Exception:
            res["mx_valid"] = False

        print("Results:")
        print(f"Alive: {res['is_alive']} ({res['load_time_ms']}ms)")
        print(f"Tech: {res['tech_stack']}")
        print(f"Emails found: {list(res['emails'])}")
        print(f"Socials: {res['socials']}")
        print(f"MX Valid: {res['mx_valid']} (Domain accepts emails)")

    except Exception as e:
        print("Audit error:", e)

if __name__ == "__main__":
    audit_and_enrich_site("https://www.pearsonroofing.com/")
    audit_and_enrich_site("http://hi-techroofing.net")
