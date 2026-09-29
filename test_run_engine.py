import hunter_engine

print("Running test hunt with hunter_engine...")
leads = hunter_engine.hunt_real_leads("Roofing Contractors", "Dallas, TX", count=4)
print(f"Hunted {len(leads)} leads successfully!")
for l in leads:
    print("-" * 50)
    print(f"Name: {l['name']}")
    print(f"City: {l['city']}")
    print(f"Phone: {l['phone']}")
    print(f"Website: {l['website']} (Has Web: {l['has_website']})")
    print(f"MX Verified: {l['mx_verified']} | Provider: {l['mx_provider']}")
    print(f"Tech Stack: {l['tech_stack']} | Load Time: {l['load_time_ms']}ms")
    print(f"Opportunity Score: {l['opportunity_score']}/100")
    print(f"Pain Point: {l['pain_point']}")
    print(f"Offer: {l['recommended_offer']}")
