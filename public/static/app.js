// ==========================================================================
// Client Hunter OS · Command Center & Autonomous Outreach Logic
// ==========================================================================

let leadsState = [];
let currentLeadForPitch = null;
let currentPitchData = null;
let currentActiveFilter = "all";
let radarIntervalId = null;

document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  loadLeads();
  loadStats();
  loadAutopilotStatus();
});

// ==========================================================================
// Bangladesh Outreach Timing Intelligence Engine
// Calculates real-time client local time, status, and optimal contact window
// relative to Bangladesh Standard Time (BST = UTC+6)
// ==========================================================================
function getClientTimingIntel(cityStr) {
  const raw = (cityStr || "Dallas, TX").trim();
  const lower = raw.toLowerCase();

  let timeZone = "America/Chicago";
  let regionName = "US Central (CT)";
  let bdWindow = "8:00 PM – 12:00 AM BST";
  let peakBdHours = "8:30 PM – 11:30 PM BST";

  // Check Eastern (US / Canada)
  if (
    lower.includes("miami") || lower.includes(", fl") || lower.includes("florida") ||
    lower.includes("atlanta") || lower.includes(", ga") || lower.includes("georgia") ||
    lower.includes("new york") || lower.includes(", ny") || lower.includes("orlando") ||
    lower.includes("tampa") || lower.includes("boston") || lower.includes(", ma") ||
    lower.includes("charlotte") || lower.includes(", nc") || lower.includes("raleigh") ||
    lower.includes("philadelphia") || lower.includes(", pa") || lower.includes("pittsburgh") ||
    lower.includes("washington") || lower.includes(", dc") || lower.includes("columbus") ||
    lower.includes("cleveland") || lower.includes(", oh") || lower.includes("detroit") ||
    lower.includes(", mi") || lower.includes("toronto") || lower.includes("montreal") ||
    lower.includes("ottawa") || lower.includes("ontario") || lower.includes("quebec") ||
    lower.includes("jacksonville") || lower.includes("baltimore") || lower.includes(", md") ||
    lower.includes("virginia") || lower.includes(", va") || lower.includes("new jersey") ||
    lower.includes(", nj")
  ) {
    timeZone = "America/New_York";
    regionName = "US / CA Eastern (ET)";
    bdWindow = "7:00 PM – 11:00 PM BST";
    peakBdHours = "7:30 PM – 10:30 PM BST";
  }
  // Check Pacific (US / Canada)
  else if (
    lower.includes("los angeles") || lower.includes("san diego") || lower.includes("san francisco") ||
    lower.includes("san jose") || lower.includes(", ca") || lower.includes("california") ||
    lower.includes("seattle") || lower.includes(", wa") || lower.includes("washington state") ||
    lower.includes("portland") || lower.includes(", or") || lower.includes("oregon") ||
    lower.includes("las vegas") || lower.includes("reno") || lower.includes(", nv") ||
    lower.includes("sacramento") || lower.includes("fresno") || lower.includes("vancouver") ||
    lower.includes("british columbia")
  ) {
    timeZone = "America/Los_Angeles";
    regionName = "US / CA Pacific (PT)";
    bdWindow = "10:00 PM – 2:00 AM BST";
    peakBdHours = "10:30 PM – 1:30 AM BST";
  }
  // Check Mountain (US / Canada)
  else if (
    lower.includes("denver") || lower.includes(", co") || lower.includes("colorado") ||
    lower.includes("phoenix") || lower.includes("tucson") || lower.includes(", az") ||
    lower.includes("arizona") || lower.includes("salt lake") || lower.includes(", ut") ||
    lower.includes("utah") || lower.includes("albuquerque") || lower.includes(", nm") ||
    lower.includes("new mexico") || lower.includes("boise") || lower.includes(", id") ||
    lower.includes("calgary") || lower.includes("edmonton") || lower.includes("alberta")
  ) {
    timeZone = "America/Denver";
    regionName = "US / CA Mountain (MT)";
    bdWindow = "9:00 PM – 1:00 AM BST";
    peakBdHours = "9:30 PM – 12:30 AM BST";
  }
  // Check UK / Ireland
  else if (
    lower.includes("london") || lower.includes("manchester") || lower.includes("birmingham") ||
    lower.includes("leeds") || lower.includes("glasgow") || lower.includes("edinburgh") ||
    lower.includes("liverpool") || lower.includes("bristol") || lower.includes("sheffield") ||
    lower.includes("uk") || lower.includes("united kingdom") || lower.includes("england") ||
    lower.includes("scotland") || lower.includes("dublin") || lower.includes("ireland")
  ) {
    timeZone = "Europe/London";
    regionName = "United Kingdom (GMT/BST)";
    bdWindow = "2:30 PM – 7:30 PM BST";
    peakBdHours = "3:00 PM – 6:00 PM BST";
  }
  // Check Central Europe
  else if (
    lower.includes("berlin") || lower.includes("munich") || lower.includes("germany") ||
    lower.includes("paris") || lower.includes("france") || lower.includes("amsterdam") ||
    lower.includes("netherlands") || lower.includes("madrid") || lower.includes("barcelona") ||
    lower.includes("spain") || lower.includes("rome") || lower.includes("milan") ||
    lower.includes("italy") || lower.includes("brussels") || lower.includes("belgium") ||
    lower.includes("vienna") || lower.includes("austria") || lower.includes("zurich") ||
    lower.includes("switzerland")
  ) {
    timeZone = "Europe/Berlin";
    regionName = "Central Europe (CET)";
    bdWindow = "1:30 PM – 6:30 PM BST";
    peakBdHours = "2:00 PM – 5:30 PM BST";
  }
  // Check Australia
  else if (
    lower.includes("sydney") || lower.includes("melbourne") || lower.includes("brisbane") ||
    lower.includes("perth") || lower.includes("adelaide") || lower.includes("gold coast") ||
    lower.includes("canberra") || lower.includes("australia") || lower.includes(", nsw") ||
    lower.includes(", vic") || lower.includes(", qld") || lower.includes(", wa")
  ) {
    if (lower.includes("perth") || lower.includes("western australia")) {
      timeZone = "Australia/Perth";
      regionName = "Western Australia (AWST)";
      bdWindow = "7:30 AM – 1:00 PM BST";
      peakBdHours = "8:30 AM – 11:30 AM BST";
    } else if (lower.includes("adelaide")) {
      timeZone = "Australia/Adelaide";
      regionName = "South Australia (ACST)";
      bdWindow = "6:30 AM – 12:00 PM BST";
      peakBdHours = "7:30 AM – 10:30 AM BST";
    } else {
      timeZone = "Australia/Sydney";
      regionName = "Eastern Australia (AEST)";
      bdWindow = "6:00 AM – 11:30 AM BST";
      peakBdHours = "7:00 AM – 10:30 AM BST";
    }
  }
  // Check New Zealand
  else if (
    lower.includes("auckland") || lower.includes("wellington") || lower.includes("christchurch") ||
    lower.includes("new zealand") || lower.includes(", nz")
  ) {
    timeZone = "Pacific/Auckland";
    regionName = "New Zealand (NZST)";
    bdWindow = "4:00 AM – 9:00 AM BST";
    peakBdHours = "5:00 AM – 8:00 AM BST";
  }
  // Default Central US
  else {
    timeZone = "America/Chicago";
    regionName = "US Central (CT)";
    bdWindow = "8:00 PM – 12:00 AM BST";
    peakBdHours = "8:30 PM – 11:30 PM BST";
  }

  // Calculate live time in client's timezone
  let localTimeStr = "--:--";
  let localHour = 12;
  try {
    const now = new Date();
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
    localTimeStr = timeFormatter.format(now);

    const hourFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone,
      hour: "numeric",
      hour12: false
    });
    localHour = parseInt(hourFormatter.format(now), 10);
  } catch (e) {
    localTimeStr = "Active";
  }

  // Determine current status
  let statusClass = "status-night";
  let statusLabel = "Night / Closed";
  let statusBadgeIcon = "🌙";
  let advice = `It is currently night in ${raw}. Recommended outreach window in Bangladesh Time: ${bdWindow}.`;

  if (localHour >= 9 && localHour < 12) {
    statusClass = "status-prime";
    statusLabel = "Prime Morning";
    statusBadgeIcon = "🟢";
    advice = "🔥 Prime outreach window! Business owner is at their desk. High open & reply rates.";
  } else if (localHour >= 12 && localHour < 14) {
    statusClass = "status-open";
    statusLabel = "Lunch Window";
    statusBadgeIcon = "🟡";
    advice = "Business open (lunch break). Good for casual WhatsApp / Social DM.";
  } else if (localHour >= 14 && localHour < 17) {
    statusClass = "status-prime";
    statusLabel = "Active Afternoon";
    statusBadgeIcon = "🟢";
    advice = "🟢 Business open & actively responding. Great time for cold emails and calls.";
  } else if (localHour >= 17 && localHour < 20) {
    statusClass = "status-evening";
    statusLabel = "Evening / Off-Duty";
    statusBadgeIcon = "🟡";
    advice = "Business wrapping up. Messages sent now are queued for first thing tomorrow morning.";
  } else if (localHour >= 7 && localHour < 9) {
    statusClass = "status-morning";
    statusLabel = "Early Morning";
    statusBadgeIcon = "🌅";
    advice = "Early morning. Messages sent now land at the top of their inbox before workday starts.";
  } else {
    statusClass = "status-night";
    statusLabel = "Night / Closed";
    statusBadgeIcon = "🌙";
    advice = `🌙 It is currently night (${localTimeStr}) in ${raw}. Best to reach out between ${bdWindow}.`;
  }

  return {
    rawCity: cityStr,
    timeZone,
    regionName,
    bdWindow,
    peakBdHours,
    localTimeStr,
    localHour,
    statusClass,
    statusLabel,
    statusBadgeIcon,
    advice
  };
}

// Fetch Leads from Backend
async function loadLeads() {
  try {
    const res = await fetch("/api/leads");
    const data = await res.json();
    leadsState = data.leads || [];
    renderLeads();
  } catch (err) {
    console.error("Failed to load leads:", err);
    showToast("⚠️ Could not load leads from server", true);
  }
}

// Fetch Stats from Backend
async function loadStats() {
  try {
    const res = await fetch("/api/stats");
    const stats = await res.json();
    
    const totalEl = document.getElementById("statTotalLeads");
    const noWebEl = document.getElementById("statNoWeb");
    const pitchedEl = document.getElementById("statPitched");
    const pipelineEl = document.getElementById("statPipeline");
    const closedEl = document.getElementById("statDealsClosed");

    if (totalEl) totalEl.textContent = stats.total_leads;
    if (noWebEl) noWebEl.textContent = stats.no_website_leads;
    if (pitchedEl) pitchedEl.textContent = stats.pitched_leads;
    if (pipelineEl) pipelineEl.textContent = `$${stats.pipeline_value.toLocaleString('en-US')}`;
    if (closedEl) closedEl.textContent = `${stats.closed_deals} deals closed ($${(stats.closed_deals * 2200).toLocaleString()})`;

  } catch (err) {
    console.error("Failed to load stats:", err);
  }
}

// Fetch Auto-Pilot Status & Rotation Matrix
async function loadAutopilotStatus() {
  try {
    const res = await fetch("/api/autopilot/status");
    const data = await res.json();
    
    const cur = data.current_target || {};
    const nxt = data.next_target || {};

    const nicheEl = document.getElementById("targetNicheLabel");
    const nicheTagEl = document.getElementById("targetNicheTag");
    const cityEl = document.getElementById("targetCityLabel");
    const cityMarketEl = document.getElementById("targetCityMarket");
    const urgencyEl = document.getElementById("targetUrgencyText");
    const nextEl = document.getElementById("targetNextLabel");
    const queueInfoEl = document.getElementById("queueInfoText");

    if (nicheEl) nicheEl.textContent = cur.niche || "Roofing Contractors";
    if (nicheTagEl) nicheTagEl.textContent = cur.tag || "High Ticket ($10k-$30k)";
    if (cityEl) cityEl.textContent = cur.city || "Dallas, TX";
    if (cityMarketEl) cityMarketEl.textContent = cur.market || "Sunbelt Hub";

    const bdPillEl = document.getElementById("targetCityBdTimePill");
    if (bdPillEl) {
      const timing = getClientTimingIntel(cur.city || "Dallas, TX");
      bdPillEl.textContent = `🇧🇩 Best BD Time: ${timing.bdWindow} (Local: ${timing.localTimeStr} ${timing.statusBadgeIcon})`;
      bdPillEl.title = `Current local time in ${cur.city || 'Dallas'}: ${timing.localTimeStr} (${timing.statusLabel}). Best time to call or pitch relative to Bangladesh Standard Time: ${timing.bdWindow}`;
    }

    if (urgencyEl) urgencyEl.textContent = `Urgency Hook: ${cur.urgency || "Storm Season"} · Zero Manual Input Required`;
    if (nextEl) nextEl.textContent = `${nxt.niche || "Solar Energy"} in ${nxt.city || "Austin, TX"}`;
    if (queueInfoEl) queueInfoEl.textContent = `Queue: ${data.total_niches} High-Ticket Niches · ${data.total_cities} Tier-1 Cities Active`;

  } catch (err) {
    console.error("Failed to load autopilot status:", err);
  }
}

// Execute 1-Click Auto-Pilot Hunt
async function executeAutopilotHunt() {
  const limit = parseInt(document.getElementById("autopilotLimit")?.value || "10");
  const huntBtn = document.getElementById("executeAutopilotBtn");
  
  if (huntBtn) {
    huntBtn.disabled = true;
    huntBtn.innerHTML = `<span>⚡ Running Autonomous Rotation...</span>`;
  }

  try {
    const res = await fetch("/api/autopilot/hunt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: limit })
    });
    const data = await res.json();

    if (data.success) {
      showToast(data.message || `Hunted ${limit} leads on auto-pilot!`);
      await loadLeads();
      await loadStats();
      await loadAutopilotStatus();
    } else {
      showToast("⚠️ Could not complete auto-pilot hunt", true);
    }
  } catch (err) {
    console.error(err);
    showToast("⚠️ Network error while hunting", true);
  } finally {
    if (huntBtn) {
      huntBtn.disabled = false;
      huntBtn.innerHTML = `<span>⚡ Execute Auto-Pilot Hunt</span>`;
    }
  }
}

// Render Leads Table
function renderLeads() {
  const tbody = document.getElementById("leadsTableBody");
  const countLabel = document.getElementById("tableLeadCount");
  if (!tbody) return;

  const searchTerm = (document.getElementById("leadTableSearch")?.value || "").toLowerCase();
  
  // Filter leads
  let filtered = leadsState.filter(lead => {
    if (currentActiveFilter === "noweb" && lead.has_website) return false;
    if (currentActiveFilter === "hasweb" && !lead.has_website) return false;

    if (searchTerm) {
      const matchName = (lead.name || "").toLowerCase().includes(searchTerm);
      const matchCity = (lead.city || "").toLowerCase().includes(searchTerm);
      const matchCat = (lead.category || "").toLowerCase().includes(searchTerm);
      if (!matchName && !matchCity && !matchCat) return false;
    }
    return true;
  });

  if (countLabel) {
    countLabel.textContent = `Showing ${filtered.length} leads in current view`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <div style="font-size: 32px; margin-bottom: 8px;">🎯</div>
          <div style="font-weight: 600; font-size: 15px; color: var(--text-main); margin-bottom: 4px;">Zero leads in database</div>
          <div style="font-size: 13px; max-width: 440px; margin: 0 auto; color: var(--text-muted); line-height: 1.5;">Click <b>"🚀 Hunt Custom Leads"</b> above or launch <b>"⚡ Execute Auto-Pilot Hunt"</b> to discover 100% genuine local businesses!</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(lead => {
    // 1. Company Initials Badge
    const words = (lead.name || "Business").trim().split(/\s+/);
    const initials = words.length > 1
      ? (words[0][0] + words[1][0]).toUpperCase()
      : (words[0].substring(0, 2)).toUpperCase();

    // 2. Clean Domain extraction
    let cleanDomain = "";
    if (lead.has_website && lead.website) {
      try {
        const u = new URL(lead.website.startsWith("http") ? lead.website : `https://${lead.website}`);
        cleanDomain = u.hostname.replace(/^www\./, "");
      } catch (e) {
        cleanDomain = lead.website.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
      }
    }

    const websiteBadge = !lead.has_website 
      ? `<span class="badge-no-web-luxury" title="High-Ticket Web Offer Opportunity">
           <span class="no-web-dot"></span>
           <span>No Website</span>
           <span class="hot-badge-tag">HOT</span>
         </span>`
      : `<a href="${lead.website}" target="_blank" class="clean-domain-pill" title="Visit ${cleanDomain}">
           <span class="domain-dot"></span>
           <span class="domain-text">${escapeHtml(cleanDomain)}</span>
           <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
         </a>`;

    const rawPhone = lead.whatsapp || (lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "");
    const phoneFormatted = lead.phone || (rawPhone ? `+1 ${rawPhone}` : "N/A");
    const statusSlug = (lead.status || "New").toLowerCase().replace(/[^a-z0-9]/g, "-");

    const timing = getClientTimingIntel(lead.city);

    return `
      <tr data-id="${lead.id}">
        <td>
          <div class="lead-company-cell">
            <div class="lead-avatar-badge">${initials}</div>
            <div class="lead-text-meta">
              <span class="lead-primary-name" title="${escapeHtml(lead.name)}">${escapeHtml(lead.name)}</span>
              <span class="lead-sub-category">${escapeHtml(lead.category || "Service Business")}</span>
            </div>
          </div>
        </td>
        <td>
          <div class="lead-location-cell">
            <div class="loc-header">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${escapeHtml(lead.city || 'United States')}</span>
            </div>
            <div class="lead-bd-time-stack">
              <div class="bd-time-badge" title="Optimal outreach window in Bangladesh Standard Time (BST)">
                <span class="bd-flag">🇧🇩</span>
                <span>${timing.bdWindow}</span>
              </div>
              <div class="live-local-pill ${timing.statusClass}" title="Current local time in ${escapeHtml(lead.city)}: ${timing.localTimeStr} (${timing.regionName})">
                <span class="status-pulse-dot"></span>
                <span>Local ${timing.localTimeStr} · ${timing.statusLabel}</span>
              </div>
            </div>
          </div>
        </td>
        <td>
          <div class="lead-reputation-cell">
            <span class="rating-star">★</span>
            <span class="rating-val">${lead.rating || '4.9'}</span>
            <span class="review-muted">(${lead.reviews || 0})</span>
          </div>
        </td>
        <td>${websiteBadge}</td>
        <td>
          <div class="lead-contact-block">
            <div class="contact-line phone">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>${escapeHtml(phoneFormatted)}</span>
            </div>
            ${lead.email ? `
            <div class="contact-line email" title="${escapeHtml(lead.email)}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span class="email-truncate">${escapeHtml(lead.email)}</span>
            </div>` : ''}
            <div class="intel-tag-row">
              ${lead.has_website 
                ? (lead.mx_verified ? '<span class="intel-pill verified">✓ MX Verified</span>' : '<span class="intel-pill pending">MX Pending</span>')
                : '<span class="intel-pill web-opp">Web Design Target</span>'}
              <span class="intel-pill score">${lead.opportunity_score || 95}% Opp</span>
            </div>
          </div>
        </td>
        <td>
          <div class="outreach-action-suite">
            <button class="primary-pitch-btn" onclick="openPitchModal('${lead.id}')" title="Open AI Pitch Studio & Automated Outreach">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>⚡ Pitch & Send</span>
            </button>

            <div class="quick-channels-bar">
              <button class="channel-icon-btn btn-email-icon" onclick="handleDirectEmail('${lead.id}')" title="Direct Email (Gmail / Mail Client)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </button>
              <button class="channel-icon-btn btn-wa-icon" onclick="handleDirectWhatsApp('${lead.id}')" title="Direct WhatsApp Web Message">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </button>
              <button class="channel-icon-btn btn-ig-icon" onclick="handleDirectInstagram('${lead.id}')" title="Instagram Direct Message">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </button>
              <button class="channel-icon-btn btn-fb-icon" onclick="handleDirectFacebook('${lead.id}')" title="Facebook Messenger">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </button>
              <button class="channel-icon-btn btn-audit-icon" onclick="triggerLiveAudit('${lead.id}')" title="Run Live Speed & Tech Audit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </button>
            </div>
          </div>
        </td>
        <td>
          <div class="status-dropdown-wrapper status-${statusSlug}">
            <select class="status-pill-select" onchange="handleStatusChange('${lead.id}', this.value); this.parentElement.className = 'status-dropdown-wrapper status-' + this.value.toLowerCase().replace(/[^a-z0-9]/g, '-');">
              <option value="New" ${lead.status === "New" ? "selected" : ""}>● New</option>
              <option value="Pitched" ${lead.status === "Pitched" ? "selected" : ""}>● Pitched</option>
              <option value="Followed Up" ${lead.status === "Followed Up" ? "selected" : ""}>● Followed Up</option>
              <option value="Meeting Booked" ${lead.status === "Meeting Booked" ? "selected" : ""}>● Meeting Booked</option>
              <option value="Closed" ${lead.status === "Closed" ? "selected" : ""}>● Closed ($$$)</option>
            </select>
            <svg class="select-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// --------------------------------------------------------------------------
// 1-Click Omnichannel Direct Outreach Engines
// --------------------------------------------------------------------------

function getEffectiveEmail(lead) {
  if (lead && lead.email && typeof lead.email === "string" && lead.email.trim() && lead.email !== "null" && lead.email !== "None") {
    return lead.email.trim();
  }
  if (lead && lead.website) {
    try {
      const cleanUrl = lead.website.startsWith("http") ? lead.website : `https://${lead.website}`;
      const domain = new URL(cleanUrl).hostname.replace(/^www\./, "");
      if (domain && domain.includes(".")) {
        return `contact@${domain}`;
      }
    } catch (e) {}
  }
  const cleanName = ((lead && lead.name) || "business")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return `contact@${cleanName || "service"}.com`;
}

function getLeadPitch(lead) {
  const hasWeb = Boolean(lead.has_website);
  const name = lead.name || "Business";
  const city = lead.city || "your area";
  const category = lead.category || "Service";
  const rating = lead.rating || 4.8;
  const reviews = lead.reviews || 50;
  const rawPhone = lead.whatsapp || (lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "");
  const phoneClean = rawPhone.startsWith("1") ? rawPhone : `1${rawPhone}`;
  const effectiveEmail = getEffectiveEmail(lead);
  if (!lead.email) {
    lead.email = effectiveEmail;
  }

  let emailSubject = "";
  let emailBody = "";
  let dmMessage = "";
  let whatsappMessage = "";

  if (!hasWeb) {
    emailSubject = `Quick question regarding ${name} (${city})`;
    emailBody = `Hi ${name} Team,\n\nI came across your business in ${city} and was impressed to see your ${rating}★ rating across ${reviews}+ reviews! You clearly do exceptional work for your clients.\n\nHowever, I noticed that when potential customers find you on Google, there is no direct website link to view your portfolio or request an instant quote. In 2026, over 70% of homeowners look for a fast quote online before calling.\n\nI actually designed a clean, mobile-optimized demo website layout specifically for ${name} with an instant quote form and automated SMS notification system.\n\nWould you be open to taking a look at a 45-second preview video? No obligations at all—just wanted to share some value.\n\nBest regards,\nKanon\nLead Systems & Web Conversion Partner`;

    dmMessage = `Hey ${name}! Loved checking out your work in ${city}. You guys have fantastic reviews (${rating}★)!\n\nQuick observation: I noticed you don't have a dedicated quote website linked in your bio. Homeowners usually want an instant price estimate before calling.\n\nI put together a clean 1-page quote site layout specifically tailored for your brand. Would you like me to send over a quick 30-sec preview? Totally free to use if you like it!`;

    whatsappMessage = `Hello ${name}! 👋 Found you on Google in ${city} with great ${rating}★ reviews.\n\nNoticed you don't have a website for direct quote requests. I designed a clean 1-page demo site for ${name} with instant SMS lead alerts.\n\nWould you be open to a 30-sec preview video? Free to check out!`;
  } else {
    emailSubject = `Question about your quote response time at ${name}`;
    emailBody = `Hi ${name} Team,\n\nI was reviewing your website and services in ${city}—stellar reputation with ${reviews}+ reviews!\n\nI ran a quick test on your contact/quote submission flow. According to Harvard Business Review, responding to an inquiry within 5 minutes increases conversion rates by nearly 400%. Right now, inquiries on your site go to a standard inbox where response times can lag during busy field work hours.\n\nWe build an automated "Speed-to-Lead" system that:\n1. Instantly texts the customer within 30 seconds of filling your form.\n2. Lets them self-schedule an estimate directly on your calendar.\n3. Automatically notifies your phone so you never lose high-value ${category.toLowerCase()} jobs to competitors.\n\nI recorded a 2-minute walkthrough showing how this works for contractors in ${city.split(',')[0]}. May I send it over?\n\nBest regards,\nKanon\nLead Systems & Automation Partner`;

    dmMessage = `Hey ${name} Team! Saw your ${category.toLowerCase()} business in ${city}—stellar work on your recent projects.\n\nI was checking your site and noticed you don't have instant automated booking for new estimates yet. We help local service businesses automate lead responses in under 30 seconds so quotes don't go cold.\n\nWould you be open to a 2-minute video showing how other ${category.toLowerCase()} companies are booking 5-10 extra jobs a month with this?`;

    whatsappMessage = `Hi ${name} Team! 👋 Loved your work in ${city}.\n\nQuick question: Do you currently have automated SMS follow-up on your website quotes? We help contractors respond in under 30 seconds so leads don't go cold.\n\nWould you like a 2-min demo showing how it works?`;
  }

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(effectiveEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(whatsappMessage)}`;

  let igUrl = lead.instagram;
  let isDirectIg = Boolean(igUrl && !igUrl.includes("google.com/search"));
  if (!igUrl) {
    igUrl = `https://www.google.com/search?q=${encodeURIComponent((lead.name || '') + ' ' + (lead.city || '') + ' instagram')}`;
  }

  let fbUrl = lead.facebook;
  let isDirectFb = Boolean(fbUrl && !fbUrl.includes("facebook.com/search"));
  if (!fbUrl) {
    fbUrl = `https://www.facebook.com/search/top?q=${encodeURIComponent((lead.name || '') + ' ' + (lead.city || ''))}`;
  }

  return {
    emailSubject,
    emailBody,
    dmMessage,
    whatsappMessage,
    gmailUrl,
    waUrl,
    igUrl,
    fbUrl,
    isDirectIg,
    isDirectFb,
    phoneClean,
    effectiveEmail
  };
}

// 1-Click Email Action: Opens native Mail app on mobile or Gmail Web Compose on desktop
function handleDirectEmail(leadId) {
  const lead = leadsState.find(l => l.id === leadId);
  if (!lead) return;
  const pitch = getLeadPitch(lead);

  // Copy full message as backup
  copyToClipboard(`Subject: ${pitch.emailSubject}\n\n${pitch.emailBody}`, null);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    const mailtoUrl = `mailto:${encodeURIComponent(pitch.effectiveEmail)}?subject=${encodeURIComponent(pitch.emailSubject)}&body=${encodeURIComponent(pitch.emailBody)}`;
    window.location.href = mailtoUrl;
  } else {
    // Open Gmail Web Compose in a new tab on desktop
    window.open(pitch.gmailUrl, "_blank");
  }

  if (lead.status === "New") {
    handleStatusChange(leadId, "Pitched");
  }
  showToast(`✉️ Email compose opened for ${lead.name}!`);
}

// 1-Click WhatsApp Action: Opens WhatsApp app on mobile or WhatsApp Web on desktop
function handleDirectWhatsApp(leadId) {
  const lead = leadsState.find(l => l.id === leadId);
  if (!lead) return;
  const pitch = getLeadPitch(lead);

  copyToClipboard(pitch.whatsappMessage, null);
  
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = pitch.waUrl;
  } else {
    window.open(pitch.waUrl, "_blank");
  }

  if (lead.status === "New") {
    handleStatusChange(leadId, "Pitched");
  }
  showToast(`💬 WhatsApp opened for ${lead.name}!`);
}

// 1-Click Instagram Action: Copies DM pitch and opens Instagram inbox
function handleDirectInstagram(leadId) {
  const lead = leadsState.find(l => l.id === leadId);
  if (!lead) return;
  const pitch = getLeadPitch(lead);

  copyToClipboard(pitch.dmMessage, null);
  window.open(pitch.igUrl, "_blank");

  if (lead.status === "New") {
    handleStatusChange(leadId, "Pitched");
  }
  if (pitch.isDirectIg) {
    showToast(`📸 Direct Instagram profile opened! DM copied to clipboard (Ctrl+V to send).`);
  } else {
    showToast(`🔍 DM pitch copied! Searching Google for ${lead.name}'s official Instagram profile...`);
  }
}

// 1-Click Facebook Action: Copies DM pitch and opens Facebook profile/Messenger
function handleDirectFacebook(leadId) {
  const lead = leadsState.find(l => l.id === leadId);
  if (!lead) return;
  const pitch = getLeadPitch(lead);

  copyToClipboard(pitch.dmMessage, null);
  window.open(pitch.fbUrl, "_blank");

  if (lead.status === "New") {
    handleStatusChange(leadId, "Pitched");
  }
  if (pitch.isDirectFb) {
    showToast(`👥 Direct Facebook profile opened! DM copied to clipboard (Ctrl+V to send).`);
  } else {
    showToast(`🔍 DM pitch copied! Searching Facebook for ${lead.name}'s official page...`);
  }
}

// Handle Status Change
async function handleStatusChange(leadId, newStatus) {
  try {
    const res = await fetch(`/api/leads/${leadId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      showToast(`Status updated to "${newStatus}"!`);
      const target = leadsState.find(l => l.id === leadId);
      if (target) target.status = newStatus;
      loadStats();
    }
  } catch (err) {
    showToast("⚠️ Failed to update status", true);
  }
}

// Open AI Pitch & High-Converting Outreach Modal
async function openPitchModal(leadId, defaultTab = "email") {
  const modal = document.getElementById("pitchModal");
  const target = leadsState.find(l => l.id === leadId);
  if (!target) return;
  
  currentLeadForPitch = target;

  document.getElementById("modalLeadName").textContent = target.name;
  document.getElementById("modalLeadCategory").textContent = `${target.category} · ${target.city} (${target.has_website ? 'Speed-to-Lead & CRM Offer' : 'High-Converting Web Offer 🔥'})`;
  
  document.getElementById("modalEmailSubject").textContent = "Crafting tailored high-conversion subject line...";
  document.getElementById("modalEmailBody").textContent = "Analyzing lead profile and generating customized pitch...";
  if (document.getElementById("modalEmailFu1")) document.getElementById("modalEmailFu1").textContent = "Loading follow-up sequence...";
  if (document.getElementById("modalEmailFu2")) document.getElementById("modalEmailFu2").textContent = "Loading break-up note...";
  document.getElementById("modalWaBody").textContent = "Generating direct WhatsApp text...";
  document.getElementById("modalDmBody").textContent = "Generating punchy Instagram/Facebook direct message...";

  // Update Bangladesh Timing Intelligence Banner
  const timing = getClientTimingIntel(target.city);
  const bdWinEl = document.getElementById("modalBdWindow");
  const bdPeakEl = document.getElementById("modalPeakBdWindow");
  const clientTzEl = document.getElementById("modalClientTz");
  const localStatusEl = document.getElementById("modalClientLocalStatus");
  const adviceEl = document.getElementById("modalBdAdviceText");
  const statusPill = document.getElementById("modalClientStatusPill");

  if (bdWinEl) bdWinEl.textContent = timing.bdWindow;
  if (bdPeakEl) bdPeakEl.textContent = timing.peakBdHours;
  if (clientTzEl) clientTzEl.textContent = `${timing.regionName} (${target.city || 'United States'})`;
  if (localStatusEl) localStatusEl.textContent = `Local: ${timing.localTimeStr} · ${timing.statusBadgeIcon} ${timing.statusLabel}`;
  if (adviceEl) adviceEl.textContent = timing.advice;
  if (statusPill) statusPill.className = `bd-client-status-pill ${timing.statusClass}`;

  // Reset AI Model Badge
  const aiBadge = document.getElementById("modalAiModelBadge");
  if (aiBadge) {
    aiBadge.textContent = "🤖 Generating Pitch...";
    aiBadge.className = "ai-model-tag-badge";
  }

  // Switch to requested tab
  switchPitchTab(defaultTab);
  modal.classList.add("open");

  try {
    const res = await fetch("/api/leads/pitch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: leadId })
    });
    const pitchData = await res.json();
    currentPitchData = pitchData;

    // Update AI Model Badge
    if (aiBadge) {
      if (pitchData.ai_powered) {
        aiBadge.textContent = `🤖 ${pitchData.ai_model || "Gemini 2.5 Flash"}`;
        aiBadge.className = "ai-model-tag-badge active";
        aiBadge.title = `Generated live by ${pitchData.ai_model}`;
      } else {
        aiBadge.textContent = "⚡ Smart Synthesis Engine";
        aiBadge.className = "ai-model-tag-badge fallback";
        aiBadge.title = "Configure Gemini 2.5 or GPT-4o in Setup to activate live LLM generation";
      }
    }
    
    // 1. Email & Follow-ups
    document.getElementById("modalEmailSubject").textContent = pitchData.email_pitch?.subject || "";
    document.getElementById("modalEmailBody").textContent = pitchData.email_pitch?.body || "";
    if (document.getElementById("modalEmailFu1")) {
      document.getElementById("modalEmailFu1").textContent = pitchData.email_pitch?.followup_1 || "";
    }
    if (document.getElementById("modalEmailFu2")) {
      document.getElementById("modalEmailFu2").textContent = pitchData.email_pitch?.followup_2 || "";
    }

    // 2. WhatsApp
    document.getElementById("modalWaBody").textContent = pitchData.whatsapp_pitch?.message || "";
    const waLink = document.getElementById("openWhatsAppLink");
    if (waLink && pitchData.whatsapp_pitch?.wa_url) {
      waLink.href = pitchData.whatsapp_pitch.wa_url;
    }

    // 3. Social DM
    document.getElementById("modalDmBody").textContent = pitchData.dm_pitch?.message || "";

    // 4. Cold Call Script
    const callScript = pitchData.cold_call_script;
    if (callScript) {
      if (document.getElementById("modalCallOpening")) document.getElementById("modalCallOpening").textContent = callScript.opening || "";
      if (document.getElementById("modalCallHook")) document.getElementById("modalCallHook").textContent = callScript.hook || "";
      if (document.getElementById("modalObjAlreadyHave")) document.getElementById("modalObjAlreadyHave").textContent = callScript.objection_already_have_guy || "";
      if (document.getElementById("modalObjSendEmail")) document.getElementById("modalObjSendEmail").textContent = callScript.objection_send_email || "";
      if (document.getElementById("modalObjNotInterested")) document.getElementById("modalObjNotInterested").textContent = callScript.objection_not_interested || "";
    }

    // 5. Loom Blueprint Timeline
    const loomSteps = pitchData.loom_script;
    const loomContainer = document.getElementById("modalLoomTimeline");
    if (loomContainer && Array.isArray(loomSteps)) {
      loomContainer.innerHTML = loomSteps.map((step, idx) => `
        <div class="loom-step-card">
          <div class="loom-step-top">
            <span class="loom-time-tag">${escapeHtml(step.time)}</span>
            <span class="loom-action-lbl">Step ${idx + 1}: ${escapeHtml(step.action)}</span>
          </div>
          <p class="loom-script-quote">"${escapeHtml(step.script)}"</p>
        </div>
      `).join("");
    }

    // 6. 100% Accuracy Audit Report
    const rep = pitchData.verification_report;
    if (rep) {
      if (document.getElementById("modalAuditScore")) document.getElementById("modalAuditScore").textContent = `${rep.score}%`;
      if (document.getElementById("modalAuditGrade")) document.getElementById("modalAuditGrade").textContent = rep.accuracy_grade || "100% Quality Audited";
      if (document.getElementById("modalAuditMx")) document.getElementById("modalAuditMx").textContent = rep.mx_status || "Verified";
      if (document.getElementById("modalAuditSpeed")) document.getElementById("modalAuditSpeed").textContent = rep.load_time || "N/A";
      if (document.getElementById("modalAuditSsl")) document.getElementById("modalAuditSsl").textContent = rep.ssl_status || "Active";
      if (document.getElementById("modalAuditTech")) {
        const stackList = rep.tech_stack ? rep.tech_stack.split(", ") : [];
        document.getElementById("modalAuditTech").innerHTML = stackList.length > 0 
          ? stackList.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join("")
          : `<span style="color:#64748B; font-size:11px;">None Detected</span>`;
      }
      if (document.getElementById("modalAuditBottleneck")) {
        document.getElementById("modalAuditBottleneck").textContent = target.pain_point || "Opportunity identified.";
      }
    }

  } catch (err) {
    document.getElementById("modalEmailBody").textContent = "Could not load pitch. Please try again.";
  }
}

function switchPitchTab(tabKey) {
  const tabs = ["tabEmail", "tabWa", "tabDm", "tabCall", "tabLoom", "tabAudit"];
  const panes = ["paneEmail", "paneWa", "paneDm", "paneCall", "paneLoom", "paneAudit"];

  tabs.forEach(tId => document.getElementById(tId)?.classList.remove("active"));
  panes.forEach(pId => document.getElementById(pId)?.classList.remove("active"));

  const keyMap = {
    email: { tab: "tabEmail", pane: "paneEmail" },
    wa: { tab: "tabWa", pane: "paneWa" },
    dm: { tab: "tabDm", pane: "paneDm" },
    call: { tab: "tabCall", pane: "paneCall" },
    loom: { tab: "tabLoom", pane: "paneLoom" },
    audit: { tab: "tabAudit", pane: "paneAudit" }
  };

  const selected = keyMap[tabKey] || keyMap.email;
  document.getElementById(selected.tab)?.classList.add("active");
  document.getElementById(selected.pane)?.classList.add("active");
}

// Trigger Live Audit on any lead
async function triggerLiveAudit(leadId) {
  const target = leadsState.find(l => l.id === leadId);
  if (!target) return;

  showToast(`⚡ Auditing ${target.name} in real-time...`);

  try {
    const res = await fetch(`/api/leads/${leadId}/audit`, { method: "POST" });
    const data = await res.json();
    if (data.success && data.lead) {
      Object.assign(target, data.lead);
      showToast(`✓ Live audit complete: ${target.name} (${target.opportunity_score}% Opp Score)`);
      renderLeads();
      renderMasterSheet();
      // If modal or drawer open, refresh them
      if (currentLeadForPitch && currentLeadForPitch.id === leadId) {
        openPitchModal(leadId, "audit");
      }
      if (currentInspectedLeadId === leadId) {
        openLeadDrawer(leadId);
      }
    }
  } catch (err) {
    showToast("⚠️ Audit request failed", true);
  }
}

// Run 100% Verify All across database
async function triggerVerifyAll() {
  const btn = document.getElementById("verifyAllLeadsBtn");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>🛡️ Auditing All Leads...</span>`;
  }
  showToast("🛡️ Running 100% Deep Accuracy & MX Deliverability Check on all leads...");

  try {
    const res = await fetch("/api/leads/verify-all", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      showToast(`✓ ${data.message}`);
      await loadLeads();
      await loadStats();
      renderMasterSheet();
    }
  } catch (err) {
    showToast("⚠️ Could not verify leads", true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg><span>🛡️ 100% Verify All</span>`;
    }
  }
}


// Send Automated Email via SMTP / Simulation
async function sendAutomatedEmail() {
  if (!currentLeadForPitch || !currentPitchData) {
    showToast("⚠️ No lead selected", true);
    return;
  }

  const sendBtn = document.getElementById("sendEmailNowBtn");
  sendBtn.disabled = true;
  sendBtn.innerHTML = `<span>⚡ Dispatching Email...</span>`;

  try {
    const res = await fetch("/api/leads/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: currentLeadForPitch.id,
        subject: currentPitchData.email_pitch?.subject || "Partnership Inquiry",
        body: currentPitchData.email_pitch?.body || ""
      })
    });
    const result = await res.json();
    if (res.ok) {
      showToast(`✓ ${result.message}`);
      currentLeadForPitch.status = "Pitched";
      renderLeads();
      loadStats();
      document.getElementById("pitchModal")?.classList.remove("open");
    } else {
      showToast(`⚠️ ${result.detail || "Email error"}`, true);
    }
  } catch (err) {
    showToast("⚠️ Could not send email", true);
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerHTML = `<span>⚡ Send Email Automatically Now</span>`;
  }
}

// Load Engine & AI Model Settings into Modal
async function loadEngineSettings() {
  try {
    const res = await fetch("/api/settings");
    const cfg = await res.json();

    // AI Settings
    const provSelect = document.getElementById("settingAiProvider");
    const modelSelect = document.getElementById("settingAiModel");
    const customModelInput = document.getElementById("settingCustomModel");
    const keyInput = document.getElementById("settingAiKey");
    const baseUrlInput = document.getElementById("settingAiBaseUrl");
    const baseUrlGroup = document.getElementById("customBaseUrlGroup");
    const keyHelp = document.getElementById("aiKeyStatusHelp");

    if (provSelect) provSelect.value = cfg.ai_provider || "gemini";
    
    // Model selection
    if (modelSelect) {
      const knownModels = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-2.5-flash", "gpt-4o", "gpt-4o-mini", "deepseek-chat"];
      if (knownModels.includes(cfg.ai_model)) {
        modelSelect.value = cfg.ai_model;
        if (customModelInput) customModelInput.style.display = "none";
      } else if (cfg.ai_model) {
        modelSelect.value = "custom";
        if (customModelInput) {
          customModelInput.style.display = "block";
          customModelInput.value = cfg.ai_model;
        }
      } else {
        modelSelect.value = "gemini-3.5-flash-lite";
      }
    }

    if (baseUrlInput) baseUrlInput.value = cfg.ai_base_url || "";
    if (baseUrlGroup) {
      baseUrlGroup.style.display = (cfg.ai_provider === "custom") ? "block" : "none";
    }

    if (keyInput) {
      if (cfg.has_ai_key) {
        keyInput.placeholder = `Active Key Configured (${cfg.ai_api_key_masked || "••••••••"})`;
        keyInput.value = "";
      } else {
        keyInput.placeholder = "Enter Gemini (AIzaSy...) or OpenAI (sk-...) API key";
        keyInput.value = "";
      }
    }

    if (keyHelp) {
      if (cfg.has_ai_key) {
        keyHelp.innerHTML = `<span style="color:#059669; font-weight:700;">✓ Active API Key configured (${cfg.ai_api_key_masked || "••••••••"}).</span> Leave blank to keep existing key.`;
      } else {
        keyHelp.textContent = "*Stored securely in local config.json. Built-in smart synthesis acts as automatic fallback if empty.";
      }
    }

    // SMTP Settings
    if (document.getElementById("smtpUser")) document.getElementById("smtpUser").value = cfg.smtp_user || "";
    if (document.getElementById("senderName")) document.getElementById("senderName").value = cfg.sender_name || "Kanon";
    if (document.getElementById("smtpHost")) document.getElementById("smtpHost").value = cfg.smtp_host || "smtp.gmail.com";
    if (document.getElementById("smtpPort")) document.getElementById("smtpPort").value = cfg.smtp_port || 587;

    // Sync header profile name if present
    const profileNameEl = document.querySelector(".user-name");
    if (profileNameEl && cfg.sender_name) {
      profileNameEl.textContent = cfg.sender_name;
    }

    // Reset test feedback
    const feedback = document.getElementById("aiTestFeedback");
    if (feedback) {
      feedback.textContent = "";
      feedback.className = "test-feedback-lbl";
    }
  } catch (err) {
    console.error("Could not load settings:", err);
  }
}

// Test AI Connection with active / unsaved settings
async function testAiConnection() {
  const testBtn = document.getElementById("testAiConnectionBtn");
  const feedback = document.getElementById("aiTestFeedback");
  if (!feedback) return;

  const aiProvider = document.getElementById("settingAiProvider")?.value || "gemini";
  let aiModel = document.getElementById("settingAiModel")?.value || "gemini-3.5-flash-lite";
  if (aiModel === "custom") {
    aiModel = document.getElementById("settingCustomModel")?.value.trim() || "gemini-3.5-flash-lite";
  }
  const aiApiKey = document.getElementById("settingAiKey")?.value.trim();
  const aiBaseUrl = document.getElementById("settingAiBaseUrl")?.value.trim();

  feedback.className = "test-feedback-lbl testing";
  feedback.textContent = `Connecting to ${aiModel}...`;
  if (testBtn) testBtn.disabled = true;

  try {
    // Stage updates temporarily
    const updatePayload = {
      ai_provider: aiProvider,
      ai_model: aiModel,
      ai_base_url: aiBaseUrl
    };
    if (aiApiKey) updatePayload.ai_api_key = aiApiKey;

    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload)
    });

    const res = await fetch("/api/ai/test", { method: "POST" });
    const data = await res.json();

    if (data.success) {
      feedback.className = "test-feedback-lbl success";
      feedback.textContent = `✓ ${data.message}`;
      showToast(`✓ AI Model Connected: ${aiModel}`);
    } else {
      feedback.className = "test-feedback-lbl error";
      feedback.textContent = `✕ ${data.message || "Connection failed"}`;
      showToast("⚠️ " + (data.message || "Connection failed"), true);
    }
  } catch (err) {
    feedback.className = "test-feedback-lbl error";
    feedback.textContent = "✕ Request error: " + err.message;
  } finally {
    if (testBtn) testBtn.disabled = false;
  }
}

// Save Full Engine Settings
async function saveEngineSettings() {
  const saveBtn = document.getElementById("saveSettingsBtn");
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span>Saving configuration...</span>`;
  }

  const aiProvider = document.getElementById("settingAiProvider")?.value || "gemini";
  let aiModel = document.getElementById("settingAiModel")?.value || "gemini-3.5-flash-lite";
  if (aiModel === "custom") {
    aiModel = document.getElementById("settingCustomModel")?.value.trim() || "gemini-3.5-flash-lite";
  }
  const aiApiKey = document.getElementById("settingAiKey")?.value.trim();
  const aiBaseUrl = document.getElementById("settingAiBaseUrl")?.value.trim();

  const smtpUser = document.getElementById("smtpUser")?.value.trim();
  const smtpPass = document.getElementById("smtpPass")?.value.trim();
  const senderName = document.getElementById("senderName")?.value.trim() || "Kanon";
  const smtpHost = document.getElementById("smtpHost")?.value.trim() || "smtp.gmail.com";
  const smtpPort = parseInt(document.getElementById("smtpPort")?.value || "587");

  const payload = {
    ai_provider: aiProvider,
    ai_model: aiModel,
    ai_base_url: aiBaseUrl,
    smtp_user: smtpUser,
    sender_name: senderName,
    smtp_host: smtpHost,
    smtp_port: smtpPort
  };

  if (aiApiKey) payload.ai_api_key = aiApiKey;
  if (smtpPass) payload.smtp_pass = smtpPass;

  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`✓ Engine settings saved! Active Model: ${data.ai_model || aiModel}`);
      document.getElementById("settingsModal")?.classList.remove("open");
    } else {
      showToast("⚠️ Failed to save settings: " + (data.message || "Unknown error"), true);
    }
  } catch (err) {
    showToast("⚠️ Network error while saving settings", true);
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span>💾 Save Engine Configuration</span>`;
    }
  }
}

// Initialize Event Listeners
function initEventListeners() {
  // Mode Switchers
  const modeAutopilotBtn = document.getElementById("modeAutopilotBtn");
  const modeManualBtn = document.getElementById("modeManualBtn");
  const autopilotView = document.getElementById("autopilotView");
  const manualView = document.getElementById("manualView");

  modeAutopilotBtn?.addEventListener("click", () => {
    modeAutopilotBtn.classList.add("active");
    modeManualBtn?.classList.remove("active");
    if (autopilotView) autopilotView.style.display = "block";
    if (manualView) manualView.style.display = "none";
  });

  modeManualBtn?.addEventListener("click", () => {
    modeManualBtn.classList.add("active");
    modeAutopilotBtn?.classList.remove("active");
    if (autopilotView) autopilotView.style.display = "none";
    if (manualView) manualView.style.display = "block";
  });

  // Execute Auto-Pilot Hunt Button
  document.getElementById("executeAutopilotBtn")?.addEventListener("click", () => {
    executeAutopilotHunt();
  });

  // Continuous Radar Toggle (Automated Background Interval)
  document.getElementById("continuousRadarToggle")?.addEventListener("change", (e) => {
    const statusText = document.getElementById("radarStatusText");
    if (e.target.checked) {
      if (statusText) statusText.textContent = "Live Radar: Active (Every 60s)";
      showToast("🟢 Live Radar activated! Auto-hunting every 60s.");
      executeAutopilotHunt(); // Run initial batch immediately
      radarIntervalId = setInterval(() => {
        executeAutopilotHunt();
      }, 60000);
    } else {
      if (statusText) statusText.textContent = "Live Radar: Idle";
      if (radarIntervalId) clearInterval(radarIntervalId);
      showToast("Live Radar paused.");
    }
  });

  // Manual Hunt Button
  document.getElementById("executeHuntBtn")?.addEventListener("click", async () => {
    const niche = document.getElementById("huntNiche")?.value || "Roofing";
    const city = document.getElementById("huntCity")?.value || "Dallas, TX";
    const limit = parseInt(document.getElementById("huntLimit")?.value || "10");

    const huntBtn = document.getElementById("executeHuntBtn");
    huntBtn.disabled = true;
    huntBtn.innerHTML = `<span>⚡ Hunting in ${city}...</span>`;

    try {
      const res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, city, limit })
      });
      const data = await res.json();
      
      showToast(data.message || `Found ${limit} leads!`);
      await loadLeads();
      await loadStats();
    } catch (err) {
      showToast("⚠️ Scraping error, please check connection", true);
    } finally {
      huntBtn.disabled = false;
      huntBtn.innerHTML = `<span>🚀 Hunt Custom Leads</span>`;
    }
  });

  // Pitch Modal Tabs
  document.getElementById("tabEmail")?.addEventListener("click", () => switchPitchTab("email"));
  document.getElementById("tabWa")?.addEventListener("click", () => switchPitchTab("wa"));
  document.getElementById("tabDm")?.addEventListener("click", () => switchPitchTab("dm"));
  document.getElementById("tabCall")?.addEventListener("click", () => switchPitchTab("call"));
  document.getElementById("tabLoom")?.addEventListener("click", () => switchPitchTab("loom"));
  document.getElementById("tabAudit")?.addEventListener("click", () => switchPitchTab("audit"));

  // Verify All Leads Button
  document.getElementById("verifyAllLeadsBtn")?.addEventListener("click", () => {
    triggerVerifyAll();
  });

  // Send Email Now Button
  document.getElementById("sendEmailNowBtn")?.addEventListener("click", () => {
    sendAutomatedEmail();
  });

  // Copy Buttons
  document.getElementById("copyEmailBtn")?.addEventListener("click", () => {
    const subject = document.getElementById("modalEmailSubject")?.textContent || "";
    const body = document.getElementById("modalEmailBody")?.textContent || "";
    copyToClipboard(`Subject: ${subject}\n\n${body}`, "Email pitch copied!");
  });

  document.getElementById("copyFuSequenceBtn")?.addEventListener("click", () => {
    if (!currentPitchData?.email_pitch) return;
    const p = currentPitchData.email_pitch;
    const seq = `--- INITIAL EMAIL ---\nSubject: ${p.subject}\n\n${p.body}\n\n--- FOLLOW-UP #1 (+3 Days) ---\n${p.followup_1}\n\n--- FOLLOW-UP #2 (+6 Days) ---\n${p.followup_2}`;
    copyToClipboard(seq, "Complete 3-step email sequence copied!");
  });

  document.getElementById("copyCallScriptBtn")?.addEventListener("click", () => {
    if (!currentPitchData?.cold_call_script) return;
    const s = currentPitchData.cold_call_script;
    const scriptText = `OPENING:\n${s.opening}\n\nHOOK:\n${s.hook}\n\nOBJECTION 1 ("Already have a guy"):\n${s.objection_already_have_guy}\n\nOBJECTION 2 ("Send email"):\n${s.objection_send_email}\n\nOBJECTION 3 ("Not interested"):\n${s.objection_not_interested}`;
    copyToClipboard(scriptText, "Cold calling script & objection handlers copied!");
  });

  document.getElementById("copyLoomScriptBtn")?.addEventListener("click", () => {
    if (!currentPitchData?.loom_script) return;
    const steps = currentPitchData.loom_script;
    const loomText = steps.map(s => `[${s.time}] Action: ${s.action}\nScript: "${s.script}"`).join("\n\n");
    copyToClipboard(loomText, "60-second Loom video script copied!");
  });

  document.getElementById("modalReauditBtn")?.addEventListener("click", () => {
    if (currentLeadForPitch) {
      triggerLiveAudit(currentLeadForPitch.id);
    }
  });

  document.getElementById("copyWaBtn")?.addEventListener("click", () => {
    const waText = document.getElementById("modalWaBody")?.textContent || "";
    copyToClipboard(waText, "WhatsApp message copied!");
  });

  document.getElementById("copyDmBtn")?.addEventListener("click", () => {
    const dmText = document.getElementById("modalDmBody")?.textContent || "";
    copyToClipboard(dmText, "Social DM copied!");
  });

  document.getElementById("modalOpenIgBtn")?.addEventListener("click", () => {
    if (currentLeadForPitch) {
      handleDirectInstagram(currentLeadForPitch.id);
    }
  });

  document.getElementById("modalOpenFbBtn")?.addEventListener("click", () => {
    if (currentLeadForPitch) {
      handleDirectFacebook(currentLeadForPitch.id);
    }
  });

  // Close Pitch Modal
  document.getElementById("closePitchModal")?.addEventListener("click", () => {
    document.getElementById("pitchModal")?.classList.remove("open");
  });

  // Mark Pitched Button inside modal
  document.getElementById("markPitchedBtn")?.addEventListener("click", () => {
    if (currentLeadForPitch) {
      handleStatusChange(currentLeadForPitch.id, "Pitched");
      document.getElementById("pitchModal")?.classList.remove("open");
      renderLeads();
    }
  });

  // Engine Settings Modal (AI & SMTP)
  document.getElementById("openSettingsBtn")?.addEventListener("click", () => {
    loadEngineSettings();
    document.getElementById("settingsModal")?.classList.add("open");
  });

  document.getElementById("closeSettingsModal")?.addEventListener("click", () => {
    document.getElementById("settingsModal")?.classList.remove("open");
  });

  // Settings Sub-Tabs
  const tabSettingsAi = document.getElementById("tabSettingsAi");
  const tabSettingsSmtp = document.getElementById("tabSettingsSmtp");
  const paneSettingsAi = document.getElementById("paneSettingsAi");
  const paneSettingsSmtp = document.getElementById("paneSettingsSmtp");

  tabSettingsAi?.addEventListener("click", () => {
    tabSettingsAi.classList.add("active");
    tabSettingsSmtp?.classList.remove("active");
    if (paneSettingsAi) paneSettingsAi.style.display = "block";
    if (paneSettingsSmtp) paneSettingsSmtp.style.display = "none";
  });

  tabSettingsSmtp?.addEventListener("click", () => {
    tabSettingsSmtp.classList.add("active");
    tabSettingsAi?.classList.remove("active");
    if (paneSettingsSmtp) paneSettingsSmtp.style.display = "block";
    if (paneSettingsAi) paneSettingsAi.style.display = "none";
  });

  // Dynamic Provider Switching
  document.getElementById("settingAiProvider")?.addEventListener("change", (e) => {
    const prov = e.target.value;
    const modelSelect = document.getElementById("settingAiModel");
    const baseUrlGroup = document.getElementById("customBaseUrlGroup");
    const customModelInput = document.getElementById("settingCustomModel");

    if (baseUrlGroup) {
      baseUrlGroup.style.display = (prov === "custom") ? "block" : "none";
    }

    if (modelSelect) {
      if (prov === "gemini") {
        modelSelect.value = "gemini-3.5-flash-lite";
        if (customModelInput) customModelInput.style.display = "none";
      } else if (prov === "openai") {
        modelSelect.value = "gpt-4o";
        if (customModelInput) customModelInput.style.display = "none";
      } else if (prov === "custom") {
        modelSelect.value = "deepseek-chat";
        if (customModelInput) customModelInput.style.display = "none";
      }
    }
  });

  // Model Selection Change
  document.getElementById("settingAiModel")?.addEventListener("change", (e) => {
    const customModelInput = document.getElementById("settingCustomModel");
    if (customModelInput) {
      customModelInput.style.display = (e.target.value === "custom") ? "block" : "none";
      if (e.target.value === "custom") customModelInput.focus();
    }
  });

  // Toggle API Key Visibility
  document.getElementById("toggleAiKeyVisibility")?.addEventListener("click", () => {
    const keyInput = document.getElementById("settingAiKey");
    if (!keyInput) return;
    if (keyInput.type === "password") {
      keyInput.type = "text";
      document.getElementById("toggleAiKeyVisibility").textContent = "🔒";
    } else {
      keyInput.type = "password";
      document.getElementById("toggleAiKeyVisibility").textContent = "👁️";
    }
  });

  // Test AI Connection Button
  document.getElementById("testAiConnectionBtn")?.addEventListener("click", () => {
    testAiConnection();
  });

  // Save Settings Button
  document.getElementById("saveSettingsBtn")?.addEventListener("click", () => {
    saveEngineSettings();
  });

  // Table Search Input
  document.getElementById("leadTableSearch")?.addEventListener("input", () => {
    renderLeads();
  });

  // Clear Database Handlers
  const handleClearDatabase = async () => {
    if (!confirm("Are you sure you want to purge all leads and start with a 100% clean dashboard?")) {
      return;
    }
    try {
      const res = await fetch("/api/leads/clear", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast("🧹 " + (data.message || "All leads removed!"));
        leadsState = [];
        renderLeads();
        renderMasterSheet();
        loadStats();
      } else {
        showToast("⚠️ Could not clear database", true);
      }
    } catch (err) {
      showToast("⚠️ Network error clearing database", true);
    }
  };

  document.getElementById("mainClearLeadsBtn")?.addEventListener("click", handleClearDatabase);
  document.getElementById("clearAllLeadsSheetBtn")?.addEventListener("click", handleClearDatabase);

  // Filter tabs (All, No Website, Has Website)
  document.querySelectorAll(".tab-pill").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-pill").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentActiveFilter = tab.getAttribute("data-filter") || "all";
      renderLeads();
    });
  });

  // Export CSV
  document.getElementById("exportCsvBtn")?.addEventListener("click", () => {
    window.location.href = "/api/export";
    showToast("Downloading verified leads CSV export...");
  });

  // Master Database Open Button
  document.getElementById("openMasterSheetBtn")?.addEventListener("click", () => {
    openMasterSheetModal();
  });

  // Close Master Database Button
  document.getElementById("closeMasterSheetBtn")?.addEventListener("click", () => {
    closeMasterSheetModal();
  });

  // Close Master Drawer Button & Backdrop
  document.getElementById("closeDrawerBtn")?.addEventListener("click", () => {
    closeLeadDrawer();
  });
  document.getElementById("sheetDrawerBackdrop")?.addEventListener("click", () => {
    closeLeadDrawer();
  });

  // Global ESC key listener for modal and drawer closing
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const drawer = document.getElementById("sheetDetailDrawer");
      if (drawer && drawer.classList.contains("open")) {
        closeLeadDrawer();
        return;
      }
      const sheetModal = document.getElementById("masterSheetModal");
      if (sheetModal && sheetModal.classList.contains("open")) {
        closeMasterSheetModal();
      }
    } else if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
      const searchInput = document.getElementById("sheetSearchInput");
      if (searchInput && document.getElementById("masterSheetModal")?.classList.contains("open")) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  // Segmented View Tabs Listener
  document.querySelectorAll(".sheet-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      document.querySelectorAll(".sheet-tab").forEach(t => t.classList.remove("active"));
      e.currentTarget.classList.add("active");
      activeSheetTabFilter = e.currentTarget.getAttribute("data-filter") || "all";
      renderMasterSheet();
    });
  });

  // Dropdown Filter Listeners
  document.getElementById("sheetNicheSelect")?.addEventListener("change", (e) => {
    activeNicheFilter = e.target.value;
    updateClearFiltersBtn();
    renderMasterSheet();
  });

  document.getElementById("sheetCitySelect")?.addEventListener("change", (e) => {
    activeCityFilter = e.target.value;
    updateClearFiltersBtn();
    renderMasterSheet();
  });

  document.getElementById("sheetClearFiltersBtn")?.addEventListener("click", () => {
    activeNicheFilter = "";
    activeCityFilter = "";
    const nicheSelect = document.getElementById("sheetNicheSelect");
    const citySelect = document.getElementById("sheetCitySelect");
    if (nicheSelect) nicheSelect.value = "";
    if (citySelect) citySelect.value = "";
    updateClearFiltersBtn();
    renderMasterSheet();
  });

  // Density Toggle
  document.getElementById("sheetDensityToggle")?.addEventListener("click", () => {
    const viewport = document.getElementById("proGridViewport");
    const label = document.getElementById("densityLabel");
    if (!viewport) return;
    viewport.classList.toggle("compact");
    if (label) {
      label.textContent = viewport.classList.contains("compact") ? "Relaxed" : "Compact";
    }
  });

  // Master Sheet Real-Time Search Filter
  document.getElementById("sheetSearchInput")?.addEventListener("input", () => {
    renderMasterSheet();
  });

  // Copy for Google Sheets (TSV Format)
  document.getElementById("copySheetTsvBtn")?.addEventListener("click", () => {
    copySheetAsGoogleSheetsTSV();
  });

  // Download CSV from Sheet View
  document.getElementById("downloadSheetCsvBtn")?.addEventListener("click", () => {
    window.location.href = "/api/export";
    showToast("Downloading verified leads CSV export...");
  });

  // Checkbox Master
  document.getElementById("sheetMasterCheck")?.addEventListener("change", (e) => {
    const isChecked = e.target.checked;
    const checkboxes = document.querySelectorAll(".sheet-row-check");
    checkboxes.forEach(cb => {
      cb.checked = isChecked;
      const leadId = cb.getAttribute("data-id");
      if (isChecked && leadId) {
        selectedLeadIds.add(leadId);
      } else if (leadId) {
        selectedLeadIds.delete(leadId);
      }
    });
    updateBatchDock();
    highlightSelectedRows();
  });

  // Batch Dock Actions
  document.getElementById("batchCopyBtn")?.addEventListener("click", () => {
    copySelectedLeadsTSV();
  });

  document.getElementById("batchMarkPitchedBtn")?.addEventListener("click", () => {
    batchMarkPitched();
  });

  document.getElementById("batchDeselectBtn")?.addEventListener("click", () => {
    deselectAllLeads();
  });

  // Drawer Controls
  document.getElementById("closeDrawerBtn")?.addEventListener("click", () => {
    closeLeadDrawer();
  });
  document.getElementById("sheetDrawerBackdrop")?.addEventListener("click", () => {
    closeLeadDrawer();
  });
}

// --------------------------------------------------------------------------
// Master Database (Enterprise CRM Workspace Engine)
// --------------------------------------------------------------------------

let activeSheetTabFilter = "all";
let activeNicheFilter = "";
let activeCityFilter = "";
let selectedLeadIds = new Set();
let currentInspectedLeadId = null;

function openMasterSheetModal() {
  const modal = document.getElementById("masterSheetModal");
  if (!modal) return;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  populateSheetFilterDropdowns();
  updateSheetMetrics();
  renderMasterSheet();
}

function closeMasterSheetModal() {
  const modal = document.getElementById("masterSheetModal");
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
  closeLeadDrawer();
}

function populateSheetFilterDropdowns() {
  const nicheSelect = document.getElementById("sheetNicheSelect");
  const citySelect = document.getElementById("sheetCitySelect");
  if (!leadsState) return;

  const niches = Array.from(new Set(leadsState.map(l => l.category).filter(Boolean))).sort();
  const cities = Array.from(new Set(leadsState.map(l => l.city).filter(Boolean))).sort();

  if (nicheSelect) {
    nicheSelect.innerHTML = `<option value="">All Categories (${niches.length})</option>` +
      niches.map(n => `<option value="${escapeHtml(n)}" ${activeNicheFilter === n ? 'selected' : ''}>${escapeHtml(n)}</option>`).join("");
  }

  if (citySelect) {
    citySelect.innerHTML = `<option value="">All Markets (${cities.length})</option>` +
      cities.map(c => `<option value="${escapeHtml(c)}" ${activeCityFilter === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join("");
  }
}

function updateSheetMetrics() {
  if (!leadsState) return;
  const total = leadsState.length;
  const noWeb = leadsState.filter(l => !l.has_website).length;
  const hasWeb = total - noWeb;
  const pitched = leadsState.filter(l => ["Pitched", "Followed Up"].includes(l.status)).length;
  const booked = leadsState.filter(l => ["Meeting Booked", "Closed"].includes(l.status)).length;
  const pipeVal = (total * 850) + (pitched * 1200) + (booked * 2000);

  const mTotal = document.getElementById("metricTotalLeads");
  const mNoWeb = document.getElementById("metricNoWebLeads");
  const mPitched = document.getElementById("metricPitchedLeads");
  const mPipe = document.getElementById("metricPipelineVal");

  if (mTotal) mTotal.textContent = total;
  if (mNoWeb) mNoWeb.textContent = noWeb;
  if (mPitched) mPitched.textContent = pitched;
  if (mPipe) mPipe.textContent = `$${pipeVal.toLocaleString()}`;

  const tAll = document.getElementById("tabCountAll");
  const tNoWeb = document.getElementById("tabCountNoWeb");
  const tHasWeb = document.getElementById("tabCountHasWeb");
  const tPitched = document.getElementById("tabCountPitched");
  const tBooked = document.getElementById("tabCountBooked");

  if (tAll) tAll.textContent = total;
  if (tNoWeb) tNoWeb.textContent = noWeb;
  if (tHasWeb) tHasWeb.textContent = hasWeb;
  if (tPitched) tPitched.textContent = pitched;
  if (tBooked) tBooked.textContent = booked;
}

function updateClearFiltersBtn() {
  const btn = document.getElementById("sheetClearFiltersBtn");
  if (!btn) return;
  if (activeNicheFilter || activeCityFilter) {
    btn.style.display = "inline-block";
  } else {
    btn.style.display = "none";
  }
}

function renderMasterSheet() {
  const tbody = document.getElementById("sheetTableBody");
  const countLabel = document.getElementById("sheetLeadCount");
  const footerLabel = document.getElementById("sheetFooterStats");
  const searchInput = document.getElementById("sheetSearchInput");
  if (!tbody) return;

  const query = (searchInput?.value || "").toLowerCase().trim();

  let list = leadsState || [];

  // Tab Filter
  if (activeSheetTabFilter === "no_website") {
    list = list.filter(l => !l.has_website);
  } else if (activeSheetTabFilter === "has_website") {
    list = list.filter(l => l.has_website);
  } else if (activeSheetTabFilter === "pitched") {
    list = list.filter(l => ["Pitched", "Followed Up"].includes(l.status));
  } else if (activeSheetTabFilter === "booked") {
    list = list.filter(l => ["Meeting Booked", "Closed"].includes(l.status));
  }

  // Niche Dropdown Filter
  if (activeNicheFilter) {
    list = list.filter(l => l.category === activeNicheFilter);
  }

  // City Dropdown Filter
  if (activeCityFilter) {
    list = list.filter(l => l.city === activeCityFilter);
  }

  // Text Query Filter
  if (query) {
    list = list.filter(lead => {
      return (
        (lead.name || "").toLowerCase().includes(query) ||
        (lead.city || "").toLowerCase().includes(query) ||
        (lead.category || "").toLowerCase().includes(query) ||
        (lead.email || "").toLowerCase().includes(query) ||
        (lead.phone || "").toLowerCase().includes(query) ||
        (lead.pain_point || "").toLowerCase().includes(query) ||
        (lead.recommended_offer || "").toLowerCase().includes(query) ||
        (lead.status || "").toLowerCase().includes(query)
      );
    });
  }

  if (countLabel) {
    countLabel.textContent = `Showing ${list.length} of ${leadsState.length} records`;
  }
  if (footerLabel) {
    footerLabel.textContent = `Showing ${list.length} records · ${leadsState.length} total lifetime leads synchronized`;
  }

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align:center; padding: 60px 20px; color:#64748B;">
          <div style="font-size: 32px; margin-bottom: 8px;">📋</div>
          <div style="font-weight: 600; font-size: 15px; color: #1E293B; margin-bottom: 4px;">Master database is clean</div>
          <div style="font-size: 13px; color: #64748B;">Zero demo leads present. Start a fresh lead hunt above to populate live records.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map((lead, idx) => {
    const rawPhone = lead.whatsapp || (lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "");
    const phoneDisplay = lead.phone || (rawPhone ? `+1 ${rawPhone}` : "N/A");
    
    // Initials Avatar
    const initials = (lead.name || "CH")
      .split(" ")
      .slice(0, 2)
      .map(w => w[0])
      .join("")
      .toUpperCase();

    const websiteCell = lead.has_website && lead.website
      ? `<a href="${lead.website}" target="_blank" rel="noopener" class="web-link-active" onclick="event.stopPropagation()">
           <span>${escapeHtml(lead.website.replace(/^https?:\/\//, ''))}</span>
           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
         </a>`
      : `<span class="badge-no-website">No Website</span>`;

    const socialBadges = [];
    if (lead.instagram) {
      socialBadges.push(`<a href="${lead.instagram}" target="_blank" rel="noopener" class="social-subtle-link" onclick="event.stopPropagation()">IG</a>`);
    }
    if (lead.facebook) {
      socialBadges.push(`<a href="${lead.facebook}" target="_blank" rel="noopener" class="social-subtle-link" onclick="event.stopPropagation()">FB</a>`);
    }
    const socialDisplay = socialBadges.length > 0 ? `<div class="pro-socials-group">${socialBadges.join("")}</div>` : `<span style="color:#94A3B8; font-size:11px;">—</span>`;

    const isChecked = selectedLeadIds.has(lead.id);

    return `
      <tr class="${isChecked ? 'row-selected' : ''}" onclick="openLeadDrawer('${lead.id}')">
        <td class="col-check" onclick="event.stopPropagation()">
          <input type="checkbox" class="sheet-row-check" data-id="${lead.id}" ${isChecked ? 'checked' : ''} onchange="handleRowCheckChange(event, '${lead.id}')">
        </td>
        <td class="col-num">${idx + 1}</td>
        <td>
          <div class="pro-company-cell">
            <div class="company-avatar">${escapeHtml(initials)}</div>
            <div class="company-info-text">
              <span class="company-title">${escapeHtml(lead.name)}</span>
              <span class="company-niche">${escapeHtml(lead.category)}</span>
            </div>
          </div>
        </td>
        <td>
          <div class="pro-loc-cell">
            <span class="location-pill">${escapeHtml(lead.city)}</span>
            <span class="bd-time-micro-pill" title="Best time to contact relative to Bangladesh Standard Time (BST)">🇧🇩 ${getClientTimingIntel(lead.city).bdWindow}</span>
          </div>
        </td>
        <td>
          <div class="contact-cell">
            <span class="contact-phone-val">${escapeHtml(phoneDisplay)}</span>
            <span class="contact-copy-icon" onclick="copyContactPhone(event, '${escapeHtml(phoneDisplay)}')" title="Copy Phone Number">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </span>
          </div>
          <div style="margin-top:2px;">
            ${lead.has_website 
              ? (lead.mx_verified ? '<span class="badge-mx-pill">✓ MX Verified</span>' : '<span class="badge-mx-pill none">MX Pending</span>')
              : '<span class="badge-mx-pill none">🔥 No Website</span>'}
          </div>
        </td>
        <td>${websiteCell}</td>
        <td>
          <div>
            <span class="rep-rating">★ ${lead.rating || '5.0'}</span>
            <span class="rep-revs">(${lead.reviews || 0})</span>
          </div>
        </td>
        <td>
          <div class="pro-pain-cell" title="${escapeHtml(lead.pain_point || '')}">
            ${escapeHtml(lead.pain_point || 'High search visibility but missing speed-to-lead automation.')}
          </div>
        </td>
        <td>
          <span class="pro-offer-pill">${escapeHtml(lead.recommended_offer || 'Landing Page + Lead Automation')}</span>
        </td>
        <td>${socialDisplay}</td>
        <td onclick="event.stopPropagation()">
          <select class="table-status-select" onchange="handleInlineStatusChange(event, '${lead.id}')">
            <option value="New" ${lead.status === 'New' ? 'selected' : ''}>● New</option>
            <option value="Pitched" ${lead.status === 'Pitched' ? 'selected' : ''}>● Pitched</option>
            <option value="Followed Up" ${lead.status === 'Followed Up' ? 'selected' : ''}>● Followed Up</option>
            <option value="Meeting Booked" ${lead.status === 'Meeting Booked' ? 'selected' : ''}>● Booked</option>
            <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>● Closed</option>
          </select>
        </td>
        <td onclick="event.stopPropagation()">
          <div class="pro-actions-row">
            <button class="pro-micro-btn" onclick="handleDirectEmail('${lead.id}')" title="Send Email">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </button>
            <button class="pro-micro-btn btn-wa" onclick="handleDirectWhatsApp('${lead.id}')" title="WhatsApp Chat">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </button>
            <button class="pro-micro-btn btn-pitch" onclick="openLeadDrawer('${lead.id}')" title="Inspect Dossier">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </button>
            <button class="pro-micro-btn btn-audit" onclick="triggerLiveAudit('${lead.id}')" title="Run Live Speed & MX Audit">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// Checkbox selection & batch dock helpers
function handleRowCheckChange(e, leadId) {
  if (e.target.checked) {
    selectedLeadIds.add(leadId);
  } else {
    selectedLeadIds.delete(leadId);
  }
  updateBatchDock();
  highlightSelectedRows();
}

function updateBatchDock() {
  const dock = document.getElementById("sheetBatchDock");
  const countLabel = document.getElementById("batchCountLabel");
  if (!dock) return;
  if (selectedLeadIds.size > 0) {
    dock.style.display = "block";
    if (countLabel) {
      countLabel.textContent = `${selectedLeadIds.size} ${selectedLeadIds.size === 1 ? 'lead' : 'leads'} selected`;
    }
  } else {
    dock.style.display = "none";
  }
}

function highlightSelectedRows() {
  document.querySelectorAll("#sheetTableBody tr").forEach(tr => {
    const cb = tr.querySelector(".sheet-row-check");
    if (cb && cb.checked) {
      tr.classList.add("row-selected");
    } else {
      tr.classList.remove("row-selected");
    }
  });
}

function deselectAllLeads() {
  selectedLeadIds.clear();
  const masterCheck = document.getElementById("sheetMasterCheck");
  if (masterCheck) masterCheck.checked = false;
  document.querySelectorAll(".sheet-row-check").forEach(cb => cb.checked = false);
  updateBatchDock();
  highlightSelectedRows();
}

function copyContactPhone(e, phone) {
  e.stopPropagation();
  copyToClipboard(phone, `Copied phone: ${phone}`);
}

function copySelectedLeadsTSV() {
  if (selectedLeadIds.size === 0) return;
  const selectedLeads = leadsState.filter(l => selectedLeadIds.has(l.id));
  copyLeadsArrayAsTSV(selectedLeads, `${selectedLeads.length} selected leads copied to clipboard for Google Sheets & Excel!`);
}

async function batchMarkPitched() {
  if (selectedLeadIds.size === 0) return;
  const count = selectedLeadIds.size;
  for (const id of selectedLeadIds) {
    await updateLeadStatusAPI(id, "Pitched");
  }
  showToast(`Updated ${count} leads to "Pitched"!`);
  deselectAllLeads();
  updateSheetMetrics();
  renderMasterSheet();
  fetchStats();
}

async function handleInlineStatusChange(e, leadId) {
  const newStatus = e.target.value;
  await updateLeadStatusAPI(leadId, newStatus);
  showToast(`Status updated to "${newStatus}"`);
  updateSheetMetrics();
  fetchStats();
}

// --------------------------------------------------------------------------
// Slide-Over Lead Detail Inspector Drawer
// --------------------------------------------------------------------------

function openLeadDrawer(leadId) {
  const lead = leadsState.find(l => l.id === leadId);
  if (!lead) return;
  currentInspectedLeadId = leadId;

  const drawer = document.getElementById("sheetDetailDrawer");
  const backdrop = document.getElementById("sheetDrawerBackdrop");
  if (!drawer || !backdrop) return;

  const rawPhone = lead.whatsapp || (lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "");
  const phoneDisplay = lead.phone || (rawPhone ? `+1 ${rawPhone}` : "N/A");

  // Dynamic Avatar Initials
  const nameParts = (lead.name || "Business").trim().split(/\s+/);
  const initials = nameParts.length >= 2
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : (lead.name ? lead.name.slice(0, 2).toUpperCase() : "BZ");
  const avatarEl = document.getElementById("drawerAvatar");
  if (avatarEl) avatarEl.textContent = initials;

  // Header Details
  const catEl = document.getElementById("drawerCategory");
  if (catEl) catEl.textContent = lead.category || "General Business";
  const nameEl = document.getElementById("drawerCompanyName");
  if (nameEl) nameEl.textContent = lead.name || "Business";
  const locEl = document.getElementById("drawerLocation");
  if (locEl) locEl.textContent = lead.city || "United States";
  const bdTimeEl = document.getElementById("drawerBdTimeTag");
  if (bdTimeEl) {
    const timing = getClientTimingIntel(lead.city);
    bdTimeEl.textContent = `🇧🇩 Best: ${timing.bdWindow} (Local: ${timing.localTimeStr} ${timing.statusBadgeIcon})`;
    bdTimeEl.title = `Current local time in ${lead.city || 'area'}: ${timing.localTimeStr} (${timing.statusLabel}). Best contact window in Bangladesh Time: ${timing.bdWindow}`;
  }
  
  // Pipeline Stage Selector
  const statusSelect = document.getElementById("drawerStatusSelect");
  if (statusSelect) {
    statusSelect.value = lead.status || "New";
    statusSelect.onchange = async (e) => {
      await updateLeadStatusAPI(lead.id, e.target.value);
      showToast(`Status updated to "${e.target.value}"`);
      updateSheetMetrics();
      renderMasterSheet();
      fetchStats();
    };
  }

  // Google Reputation
  const repEl = document.getElementById("drawerReputation");
  if (repEl) {
    repEl.textContent = `★ ${lead.rating || 5.0} (${lead.reviews || 0} reviews)`;
  }

  // Direct Phone & Inline Copy
  const phoneEl = document.getElementById("drawerPhone");
  if (phoneEl) phoneEl.textContent = phoneDisplay;
  const copyPhoneBtn = document.getElementById("drawerCopyPhoneBtn");
  if (copyPhoneBtn) {
    copyPhoneBtn.onclick = async (e) => {
      e.stopPropagation();
      const val = phoneDisplay !== "N/A" ? phoneDisplay : "";
      if (val) {
        await navigator.clipboard.writeText(val);
        showToast(`Phone copied: ${val}`);
      } else {
        showToast("No phone number to copy", true);
      }
    };
  }

  // Email Address & Inline Copy
  const emailEl = document.getElementById("drawerEmail");
  const emailVal = lead.email && lead.email.trim() ? lead.email.trim() : "";
  if (emailEl) emailEl.textContent = emailVal || "No email available";
  const copyEmailBtn = document.getElementById("drawerCopyEmailBtn");
  if (copyEmailBtn) {
    copyEmailBtn.onclick = async (e) => {
      e.stopPropagation();
      if (emailVal) {
        await navigator.clipboard.writeText(emailVal);
        showToast(`Email copied: ${emailVal}`);
      } else {
        showToast("No email address to copy", true);
      }
    };
  }

  // Website Clean Display & Clickable Link
  const siteLink = document.getElementById("drawerWebsite");
  if (siteLink) {
    if (lead.has_website && lead.website) {
      let cleanDomain = lead.website.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
      if (cleanDomain.length > 30) cleanDomain = cleanDomain.substring(0, 27) + "...";
      siteLink.textContent = `${cleanDomain} ↗`;
      siteLink.href = lead.website.startsWith("http") ? lead.website : `https://${lead.website}`;
      siteLink.className = "drawer-domain-link";
    } else {
      siteLink.textContent = "⚡ Missing Website (High-Priority Target)";
      siteLink.removeAttribute("href");
      siteLink.className = "drawer-domain-link no-site";
    }
  }

  // Social Channels Tags
  const socialsWrap = document.getElementById("drawerSocials");
  if (socialsWrap) {
    socialsWrap.innerHTML = "";
    const socials = [];
    if (lead.instagram) socials.push({ name: "Instagram", url: lead.instagram });
    if (lead.facebook) socials.push({ name: "Facebook", url: lead.facebook });
    if (socials.length > 0) {
      socials.forEach(s => {
        const link = document.createElement("a");
        link.className = "drawer-social-tag";
        link.href = s.url.startsWith("http") ? s.url : `https://${s.url}`;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = `${s.name} ↗`;
        link.style.textDecoration = "none";
        socialsWrap.appendChild(link);
      });
    } else {
      const noneSpan = document.createElement("span");
      noneSpan.style.color = "#94A3B8";
      noneSpan.style.fontSize = "11.5px";
      noneSpan.style.fontWeight = "400";
      noneSpan.textContent = "No profiles detected";
      socialsWrap.appendChild(noneSpan);
    }
  }

  // AI Operational Audit & Bottleneck
  const painEl = document.getElementById("drawerPainPoint");
  if (painEl) {
    painEl.textContent = lead.pain_point || "Active website has no automated calendar booking or 30-sec SMS response flow.";
  }

  // Recommended Solution & Deal Value
  const offerEl = document.getElementById("drawerOffer");
  if (offerEl) {
    offerEl.textContent = lead.recommended_offer || "Lead Capture & CRM Automation Pipeline (Make/Zapier)";
  }
  const dealValEl = document.getElementById("drawerDealValue");
  if (dealValEl) {
    const valText = (lead.category && (lead.category.toLowerCase().includes("roof") || lead.category.toLowerCase().includes("solar") || lead.category.toLowerCase().includes("hvac")))
      ? "$5,000 – $15,000 Deal"
      : "$3,000 – $8,000 Deal";
    dealValEl.textContent = valText;
  }

  // 100% Accuracy & Technical Audit Card in Drawer
  const mxStatusEl = document.getElementById("drawerMxStatus");
  if (mxStatusEl) {
    if (lead.has_website) {
      mxStatusEl.textContent = lead.mx_verified ? `Active MX (${lead.mx_provider || 'Verified'})` : 'MX Pending / Unverified';
      mxStatusEl.style.color = lead.mx_verified ? '#059669' : '#D97706';
    } else {
      mxStatusEl.textContent = 'No Website (Direct Mobile/DM)';
      mxStatusEl.style.color = '#EA580C';
    }
  }

  const speedStatusEl = document.getElementById("drawerSpeedStatus");
  if (speedStatusEl) {
    speedStatusEl.textContent = lead.has_website ? `${lead.load_time_ms || 820}ms TTFB` : 'N/A (No Website)';
  }

  const sslStatusEl = document.getElementById("drawerSslStatus");
  if (sslStatusEl) {
    sslStatusEl.textContent = lead.has_website ? (lead.has_ssl !== false ? 'HTTPS Secured ✓' : 'Insecure HTTP ⚠️') : 'No Domain';
    sslStatusEl.style.color = (lead.has_website && lead.has_ssl === false) ? '#DC2626' : '#0F172A';
  }

  const techStatusEl = document.getElementById("drawerTechStatus");
  if (techStatusEl) {
    const stack = (lead.tech_stack && lead.tech_stack.length > 0) ? lead.tech_stack.join(', ') : (lead.has_website ? 'Custom' : 'None');
    techStatusEl.textContent = stack;
  }

  const accBadge = document.getElementById("drawerAccuracyBadge");
  if (accBadge) {
    accBadge.textContent = `${lead.opportunity_score || 95}% Opportunity · Verified`;
  }

  // Wire Re-Audit Button in Drawer
  const reauditBtn = document.getElementById("drawerReauditBtn");
  if (reauditBtn) {
    reauditBtn.onclick = () => triggerLiveAudit(lead.id);
  }

  // Wire Outreach Buttons in Drawer
  const waBtn = document.getElementById("drawerWaBtn");
  if (waBtn) {
    waBtn.onclick = () => handleDirectWhatsApp(lead.id);
  }
  const emailBtn = document.getElementById("drawerEmailBtn");
  if (emailBtn) {
    emailBtn.onclick = () => handleDirectEmail(lead.id);
  }
  const callBtn = document.getElementById("drawerCallBtn");
  if (callBtn) {
    callBtn.onclick = () => {
      closeLeadDrawer();
      openPitchModal(lead.id, "call");
    };
  }
  const loomBtn = document.getElementById("drawerLoomBtn");
  if (loomBtn) {
    loomBtn.onclick = () => {
      closeLeadDrawer();
      openPitchModal(lead.id, "loom");
    };
  }
  const pitchBtn = document.getElementById("drawerPitchBtn");
  if (pitchBtn) {
    pitchBtn.onclick = () => {
      closeLeadDrawer();
      openPitchModal(lead.id, "email");
    };
  }

  backdrop.classList.add("open");
  drawer.classList.add("open");
}

function closeLeadDrawer() {
  const drawer = document.getElementById("sheetDetailDrawer");
  const backdrop = document.getElementById("sheetDrawerBackdrop");
  if (drawer) drawer.classList.remove("open");
  if (backdrop) backdrop.classList.remove("open");
  currentInspectedLeadId = null;
}

function copyLeadsArrayAsTSV(leadsArray, successMessage) {
  if (!leadsArray || leadsArray.length === 0) {
    showToast("⚠️ No leads selected to copy", true);
    return;
  }

  const headers = [
    "Row #",
    "Business Name",
    "Category / Niche",
    "City & State",
    "Phone Number",
    "WhatsApp Number",
    "Email Address",
    "Google Rating",
    "Total Reviews",
    "Website Status",
    "Website URL",
    "Facebook Link",
    "Instagram Link",
    "Company Description & Pain Point",
    "Recommended Offer",
    "Pipeline Status",
    "Priority Level"
  ];

  const rows = leadsArray.map((l, i) => {
    const rawPhone = l.whatsapp || (l.phone ? l.phone.replace(/[^0-9]/g, "") : "");
    return [
      i + 1,
      cleanTsvCell(l.name),
      cleanTsvCell(l.category),
      cleanTsvCell(l.city),
      cleanTsvCell(l.phone),
      cleanTsvCell(rawPhone),
      cleanTsvCell(l.email),
      l.rating || 5.0,
      l.reviews || 0,
      l.has_website ? "Has Website" : "No Website",
      cleanTsvCell(l.website || "None"),
      cleanTsvCell(l.facebook || "None"),
      cleanTsvCell(l.instagram || "None"),
      cleanTsvCell(l.pain_point || ""),
      cleanTsvCell(l.recommended_offer || ""),
      cleanTsvCell(l.status || "New"),
      cleanTsvCell(l.priority || "Normal")
    ].join("\t");
  });

  const tsvContent = [headers.join("\t"), ...rows].join("\n");
  copyTextToClipboardHelper(
    tsvContent,
    successMessage || "📋 Leads copied! Open Google Sheets or Excel and press Ctrl+V to paste.",
    "⚠️ Could not copy table to clipboard"
  );
}

// Copy full lifetime database as Google Sheets / Excel Compatible TSV
function copySheetAsGoogleSheetsTSV() {
  copyLeadsArrayAsTSV(
    leadsState,
    "📋 Lifetime Master Database copied! Open Google Sheets or Excel and press Ctrl+V to paste."
  );
}

function cleanTsvCell(val) {
  if (!val) return "";
  return String(val).replace(/\t/g, " ").replace(/\r?\n/g, " ");
}

function copyToClipboard(text, successMessage) {
  copyTextToClipboardHelper(text, successMessage || "Copied to clipboard! ✓", "⚠️ Could not copy text");
}

function copyTextToClipboardHelper(text, successMsg, errorMsg) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => {
      fallbackCopyText(text, successMsg, errorMsg);
    });
  } else {
    fallbackCopyText(text, successMsg, errorMsg);
  }
}

function fallbackCopyText(text, successMsg, errorMsg) {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    if (successful) {
      showToast(successMsg);
    } else {
      showToast(errorMsg, true);
    }
  } catch (err) {
    showToast(errorMsg, true);
  }
}

// Toast notification helper
function showToast(msg, isError = false) {
  const toast = document.getElementById("toastNotification");
  const msgEl = document.getElementById("toastMsg");
  if (!toast || !msgEl) return;

  msgEl.textContent = msg;
  toast.classList.add("show");
  if (isError) {
    toast.style.background = "#DC2626";
  } else {
    toast.style.background = "#111216";
  }

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3400);
}

// Safe string escaping
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Live update clock and Bangladesh outreach status indicators every 60 seconds
setInterval(() => {
  if (document.getElementById("leadsTableBody") && leadsState && leadsState.length > 0) {
    renderLeads();
  }
  loadAutopilotStatus();
}, 60000);

