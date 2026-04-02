import json
import urllib.parse

# Manual deep insights for the TOP performers based on previous analysis
DEEP_INTEL = {
    "glowdubai.ae": {
        "hook": "Perfect match for Dermapen 4 & HydraFacial tracking. Offer 'Treatment Progress' feature.",
        "devices": "Dermapen 4, HydraFacial, GentleMax Pro",
        "priority": "ULTRA"
    },
    "skin111.com": {
        "hook": "High-end devices found: Morpheus8, Fotona. Offer AI-based lead qualification for expensive procedures.",
        "devices": "Morpheus8, Fotona, Ultraformer III",
        "priority": "ULTRA"
    },
    "novomed.com": {
        "hook": "Massive network. Needs standardized AI lead gen for their Lutronic & InMode services.",
        "devices": "Lutronic, InMode, Laser platforms",
        "priority": "ULTRA"
    },
    "sashaaestheticclinic.ae": {
        "hook": "Laser focus detected (Candela). Your AI checkup for pigmentation is a direct value-add here.",
        "devices": "Candela, PicoSure, Laser Hair Removal",
        "priority": "ULTRA"
    },
    "amwajpolyclinic.com": {
        "hook": "Premium clinic using Venus Viva. Offer the 'Premium Skin Concierge' AI tool.",
        "devices": "Venus Viva, Sciton, Facial Rejuvenation",
        "priority": "ULTRA"
    }
}

def generate_html(clinics):
    html_start = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Curescan Dubai Sales Intelligence</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body { background-color: #f0f2f5; padding: 20px; font-family: 'Inter', sans-serif; }
        .card { border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); border: none; margin-bottom: 20px; }
        .table-container { background: white; border-radius: 12px; padding: 0; overflow: hidden; }
        .rating-badge { background-color: #fff9db; color: #f08c00; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; }
        .reviews-badge { background-color: #e7f5ff; color: #1971c2; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; }
        .tag-badge { background-color: #e9ecef; color: #495057; padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; display: inline-block; margin: 0 4px 6px 0; }
        .btn-wa { background-color: #25d366; color: white; border: none; }
        .btn-wa:hover { background-color: #128c7e; color: white; }
        .btn-ads { background-color: #0668E1; color: white; border: none; }
        .btn-ads:hover { background-color: #004da8; color: white; }
        .pixel-badge { font-size: 0.65rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
        .has-pixel { background-color: #d3f9d8; color: #2b8a3e; border: 1px solid #b2f2bb; }
        .no-pixel { background-color: #fff5f5; color: #c92a2a; border: 1px solid #ffc9c9; }
        .ultra-badge { background-color: #7950f2; color: white; font-size: 0.65rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
        .priority-ultra { border-left: 8px solid #7950f2; background-color: #f8f0ff; }
        .priority-high { border-left: 6px solid #228be6; }
        .priority-med { border-left: 6px solid #ced4da; }
        .table thead th { background-color: #f8f9fa; text-transform: uppercase; font-size: 0.65rem; letter-spacing: 1px; color: #adb5bd; padding: 15px; border: none; }
        .table tbody td { padding: 20px 15px; vertical-align: top; border-bottom: 1px solid #f1f3f5; }
        tr:hover { background-color: #fafbfc; }
        .clinic-name { font-size: 1rem; font-weight: 800; color: #212529; margin-bottom: 2px; }
        .location-text { font-size: 0.8rem; color: #adb5bd; font-weight: 500; }
        .hook-box { background-color: #fff; border-radius: 8px; padding: 10px; margin-top: 10px; border: 1px solid #e9ecef; }
        .hook-title { font-size: 0.6rem; font-weight: 800; color: #adb5bd; text-transform: uppercase; margin-bottom: 4px; }
        .hook-text { font-size: 0.8rem; color: #495057; line-height: 1.4; }
        .contact-name { font-weight: 700; color: #228be6; font-size: 0.9rem; }
        .device-text { font-size: 0.75rem; color: #7950f2; font-weight: 700; }
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="row align-items-center mb-4">
            <div class="col-md-8">
                <h1 class="fw-bold text-dark"><i class="bi bi-stars text-primary"></i> Dubai Sales Intelligence v2</h1>
                <p class="text-muted">Top leads enhanced with deep website intelligence and custom sales hooks.</p>
            </div>
            <div class="col-md-4 text-end">
                <span class="badge bg-dark rounded-pill px-3 py-2">Total Intelligent Leads: {total_count}</span>
            </div>
        </div>

        <div class="table-container card">
            <table class="table mb-0">
                <thead>
                    <tr>
                        <th style="width: 25%;">Clinic & Reputation</th>
                        <th style="width: 20%;">Contacts & LinkedIn</th>
                        <th style="width: 30%;">Intelligence & Sales Hook</th>
                        <th style="width: 25%;">Quick Outreach</th>
                    </tr>
                </thead>
                <tbody>"""

    html_end = """</tbody>
            </table>
        </div>
    </div>
</body>
</html>"""

    rows = []
    for c in clinics:
        domain = c.get("domain", "")
        intel = DEEP_INTEL.get(domain, {})
        
        search_query = domain or c.get("name")
        ads_link = f"https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AE&q={urllib.parse.quote(search_query)}"
        
        wa_link = ""
        if c.get("phone"):
            clean_phone = "".join(filter(str.isdigit, str(c["phone"])))
            if clean_phone:
                wa_link = f'<a href="https://wa.me/{clean_phone}" target="_blank" class="btn btn-sm btn-wa w-100 mb-1 fw-bold"><i class="bi bi-whatsapp"></i> WhatsApp</a>'
        
        ig_url = c.get("company_instagram") or c.get("contact_instagram")
        ig_btn = f'<a href="{ig_url}" target="_blank" class="btn btn-sm btn-outline-danger w-100 mb-1 fw-bold"><i class="bi bi-instagram"></i> Instagram</a>' if ig_url else ""
        web_btn = f'<a href="{c.get("website")}" target="_blank" class="btn btn-sm btn-outline-secondary w-100 mb-1 fw-bold"><i class="bi bi-globe"></i> Web</a>' if c.get("website") else ""

        has_pixel = c.get("website_has_fb_pixel")
        pixel_badge = f'<span class="pixel-badge has-pixel">ADS ACTIVE</span>' if has_pixel else f'<span class="pixel-badge no-pixel">ORGANIC</span>'
        ultra_badge = f'<span class="ultra-badge ms-1">TOP PICK</span>' if intel.get("priority") == "ULTRA" else ""
        
        # Contact logic
        contact_html = f'<div class="contact-name">{c.get("full_name", "")}</div>' if c.get("full_name") else ""
        if c.get("title"): contact_html += f'<div class="contact-title small text-muted">{c["title"]}</div>'
        if c.get("email"): contact_html += f'<div class="small mt-1"><a href="mailto:{c["email"]}" style="text-decoration:none;">{c["email"]}</a></div>'
        
        li_person = c.get("contact_linkedin")
        li_company = c.get("company_linkedin")
        if li_person or li_company:
            contact_html += '<div class="mt-2 d-flex gap-1">'
            if li_person: contact_html += f'<a href="{li_person}" target="_blank" class="btn btn-xs btn-primary py-0 px-2" style="font-size:0.6rem;"><i class="bi bi-linkedin"></i> Person</a>'
            if li_company: contact_html += f'<a href="{li_company}" target="_blank" class="btn btn-xs btn-outline-primary py-0 px-2" style="font-size:0.6rem;"><i class="bi bi-linkedin"></i> Co</a>'
            contact_html += '</div>'
        if not contact_html: contact_html = '<div class="text-muted small italic">Seek DM in LinkedIn</div>'

        # Intelligence Logic
        raw_tags = c.get("reviews_tags", [])
        if raw_tags is None: raw_tags = []
        if isinstance(raw_tags, str): raw_tags = raw_tags.split(",")
        subtypes = (c.get("subtypes") or "").split(",")
        combined_tags = [t.strip() for t in (list(raw_tags) + subtypes) if t.strip().lower() not in ["clinic", "medical center", "doctor", "health", "care"]]
        unique_tags = []
        for t in combined_tags:
            if t.lower() not in [ut.lower() for ut in unique_tags]: unique_tags.append(t)
        tags_html = "".join([f'<span class="tag-badge">{t}</span>' for t in unique_tags[:5]])

        hook = intel.get("hook", "Ideal for Skin Checkup funnel. Target facial rejuvenation services.")
        priority_class = "priority-ultra" if intel.get("priority") == "ULTRA" else ("priority-high" if (int(float(c.get("reviews", 0))) > 500 or has_pixel) else "priority-med")
        
        row = f'<tr class="{priority_class}">'
        row += f'<td><div class="clinic-name">{c["name"]}</div>'
        row += f'<div class="location-text mb-2"><i class="bi bi-geo-alt"></i> {c.get("address", "Dubai").split(",")[-1].strip()}</div>'
        row += f'<div class="d-flex gap-1 align-items-center"><span class="rating-badge">★ {c.get("rating", "N/A")}</span>'
        row += f'<span class="reviews-badge">{int(float(c.get("reviews", 0)))}</span>{pixel_badge}{ultra_badge}</div></td>'
        row += f'<td>{contact_html}</td>'
        row += f'<td>'
        if intel.get("devices"):
            row += f'<div class="hook-title">Detected Devices</div><div class="device-text mb-2"><i class="bi bi-cpu"></i> {intel["devices"]}</div>'
        row += f'<div>{tags_html}</div>'
        row += f'<div class="hook-box"><div class="hook-title">Custom Sales Hook</div><div class="hook-text">{hook}</div></div></td>'
        row += f'<td><div class="row g-1"><div class="col-6">{wa_link}{ig_btn}</div><div class="col-6">{web_btn}<a href="{ads_link}" target="_blank" class="btn btn-sm btn-ads w-100 fw-bold"><i class="bi bi-facebook"></i> Ads</a></div></div></td>'
        row += '</tr>'
        rows.append(row)

    return html_start + "\n".join(rows) + html_end

def main():
    try:
        with open("outscrape/Outscraper-20260122113931m7d.json", "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading JSON: {e}")
        return

    qualified = {}
    keywords = ["aesthetic", "dermatology", "skin", "laser", "cosmetic", "plastic surgery", "clinic", "medical spa", "beauty"]
    for item in data:
        name = (item.get("name") or "").strip()
        if not name: continue
        is_relevant = any(kw in (name + (item.get("subtypes") or "") + (item.get("category") or "")).lower() for kw in keywords)
        if is_relevant and item.get("website") and item.get("rating") and item.get("reviews"):
            try:
                if float(item["rating"]) >= 4.0 and (int(float(item["reviews"])) >= 20 or item.get("website_has_fb_pixel")):
                    key = (name, item.get("website"))
                    if key not in qualified: qualified[key] = item
            except ValueError: continue

    leads = list(qualified.values())
    leads.sort(key=lambda x: (1 if DEEP_INTEL.get(x.get("domain", "")) else 0, 1 if x.get("website_has_fb_pixel") else 0, int(float(x.get("reviews", 0)))), reverse=True)

    html_content = generate_html(leads)
    with open("dubai_leads_dashboard.html", "w") as f:
        f.write(html_content)
    print(f"Final Intelligent Dashboard generated with {len(leads)} leads.")

if __name__ == "__main__":
    main()
