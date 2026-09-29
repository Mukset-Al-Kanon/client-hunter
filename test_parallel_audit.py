import time
import requests
import json
import re
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor
import dns.resolver

USER_AGENT = "ClientHunterEnterprise/3.5 (Windows NT 10.0; Win64; x64; LeadGen & Quality Audit Engine)"

# Test auditing with ThreadPoolExecutor
def check_domain_mx(domain: str) -> tuple[bool, str]:
    if not domain:
        return False, "No Domain"
    clean_domain = domain.replace("www.", "").strip()
    try:
        resolver = dns.resolver.Resolver()
        resolver.lifetime = 2.0
        resolver.timeout = 2.0
        records = resolver.resolve(clean_domain, 'MX')
        if records:
            primary_mx = str(records[0].exchange).lower().rstrip('.')
            provider = "Custom / Enterprise SMTP"
            if "google" in primary_mx or "googlemail" in primary_mx:
                provider = "Google Workspace"
            elif "outlook" in primary_mx or "protection.outlook" in primary_mx:
                provider = "Microsoft 365"
            elif "zoho" in primary_mx:
                provider = "Zoho Mail"
            return True, provider
    except Exception:
        pass
    return False, "No Active MX Records"

def audit_single(url: str):
    t0 = time.time()
    parsed = urlparse(url)
    domain = parsed.netloc
    mx_ok, mx_prov = check_domain_mx(domain)
    res = {"url": url, "mx_ok": mx_ok, "mx_prov": mx_prov, "load_ms": 0, "status": 0}
    try:
        r = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=3.0, verify=False)
        res["load_ms"] = int((time.time() - t0)*1000)
        res["status"] = r.status_code
    except Exception as e:
        res["load_ms"] = int((time.time() - t0)*1000)
        res["err"] = str(e)[:30]
    return res

test_urls = [
    "https://resultsroofing.com/",
    "http://americanprideroofing.com/",
    "https://freedomsolarpower.com/",
    "https://sunsetfamilydentistry.com/",
    "https://mancavemedspa.com/"
]

t_start = time.time()
with ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(audit_single, test_urls))

t_total = int((time.time() - t_start)*1000)
print(f"Audited {len(test_urls)} websites in PARALLEL in {t_total}ms total:")
for r in results:
    print(" -", r)
