// cms.js — Landing Page CMS: Supabase fetch + DOM injection + cache + fallback
(function () {
  'use strict';

  const SUPABASE_URL = window.ENV?.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || '';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const CACHE_PREFIX = 'ea_cms_';

  // Determine page slug from filename
  const path = window.location.pathname;
  const fileName = path.split('/').pop() || 'index.html';
  const PAGE_SLUG = fileName === 'index.html' ? 'index' : fileName.replace('.html', '');

  // Supabase API helper
  async function supabaseFetch(table, query = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
    return res.json();
  }

  // Cache helpers
  function getCache(key) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp > CACHE_TTL) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return data;
    } catch { return null; }
  }

  function setCache(key, data) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch { /* storage full */ }
  }

  // Fetch page data
  async function fetchPageData() {
    const cacheKey = `page_${PAGE_SLUG}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    // Fetch page meta
    const pages = await supabaseFetch('pages', `slug=eq.${PAGE_SLUG}&select=*`);
    if (!pages || pages.length === 0) return null;
    const page = pages[0];

    // Update meta tags
    if (page.title) document.title = page.title;
    if (page.meta_description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', page.meta_description);
    }

    // Fetch sections
    const sections = await supabaseFetch('page_sections', `page_slug=eq.${PAGE_SLUG}&is_active=eq.true&order=sort_order.asc`);

    // Fetch content items for all sections
    let allItems = [];
    if (sections && sections.length > 0) {
      const sectionIds = sections.map(s => s.id);
      const idsParam = sectionIds.map(id => `id.eq.${id}`).join(',');
      allItems = await supabaseFetch('content_items', `section_id=in.(${idsParam})&is_active=eq.true&order=sort_order.asc`);
    }

    // Fetch site settings
    const settings = await supabaseFetch('site_settings', 'select=*');
    const settingsMap = {};
    if (settings) settings.forEach(s => { settingsMap[s.key] = s.value; });

    // Fetch navigation
    const navItems = await supabaseFetch('navigation', 'is_active=eq.true&order=location.asc,sort_order.asc');

    // Fetch form options
    const formOptions = await supabaseFetch('contact_form_options', 'is_active=eq.true&order=sort_order.asc');

    const data = { page, sections: sections || [], items: allItems || [], settings: settingsMap, navItems: navItems || [], formOptions: formOptions || [] };
    setCache(cacheKey, data);
    return data;
  }

  // Group items by section
  function groupItemsBySection(items) {
    const grouped = {};
    items.forEach(item => {
      if (!grouped[item.section_id]) grouped[item.section_id] = [];
      grouped[item.section_id].push(item);
    });
    return grouped;
  }

  // Icon SVG map (Lucide-style inline SVGs)
  const ICONS = {
    calculator: '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
    globe: '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>',
    'bar-chart': '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
    refresh: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>',
    layout: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13h16M9 4v16"/></svg>',
    zap: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
    'life-buoy': '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
    shield: '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
    users: '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
    lightbulb: '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>',
    search: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>',
    smartphone: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
    lock: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>',
    phone: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>',
  };

  function getIcon(name) {
    return ICONS[name] || ICONS.layout;
  }

  // Render functions for each section type
  function renderHero(section, items) {
    const badge = items.find(i => i.item_type === 'badge');
    const heading = items.find(i => i.item_type === 'heading');
    const paragraph = items.find(i => i.item_type === 'paragraph');
    const buttons = items.filter(i => i.item_type === 'button');

    let html = '<div class="reveal">';
    if (badge) html += `<span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-8"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>${esc(badge.data.text)}</span>`;
    html += '</div>';

    html += '<div class="reveal reveal-delay-1">';
    if (heading) html += `<h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 max-w-5xl mx-auto leading-tight">${heading.data.text}</h1>`;
    html += '</div>';

    html += '<p class="reveal reveal-delay-2 text-xl text-gray-500 mb-12 max-w-2xl mx-auto font-medium">';
    if (paragraph) html += esc(paragraph.data.text);
    html += '</p>';

    html += '<div class="reveal reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">';
    buttons.forEach(btn => {
      const cls = btn.data.variant === 'secondary'
        ? 'px-8 py-4 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300'
        : 'px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300';
      let iconHtml = '';
      if (btn.data.icon === 'phone') iconHtml = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`;
      html += `<a href="${esc(btn.data.url)}" class="${cls}">${iconHtml ? `<span class="flex items-center gap-2">${iconHtml}${esc(btn.data.text)}</span>` : esc(btn.data.text)}</a>`;
    });
    html += '</div>';

    return html;
  }

  function renderStats(section, items) {
    let html = '';
    items.forEach((item, idx) => {
      const delay = idx > 0 ? ` reveal-delay-${Math.min(idx, 4)}` : '';
      html += `<div class="reveal${delay}"><div class="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2" data-counter="${esc(item.data.counter)}" data-suffix="${esc(item.data.suffix || '')}">0</div><div class="text-sm font-semibold text-gray-500 uppercase tracking-wider">${esc(item.data.label)}</div></div>`;
    });
    return html;
  }

  function renderSolutions(section, items) {
    const solutionCards = items.filter(i => i.item_type === 'solution_card');
    const solutionDetails = items.filter(i => i.item_type === 'solution_detail');

    if (solutionDetails.length > 0) {
      // Detailed solution sections (cozumler.html style)
      let html = '';
      solutionDetails.forEach((sol, idx) => {
        const isEven = idx % 2 === 0;
        const colors = ['blue', 'orange'];
        const color = colors[idx % 2];
        const bgGradient = color === 'blue' ? 'from-blue-50 to-blue-100' : 'from-orange-50 to-orange-100';
        const textColor = color === 'blue' ? 'text-blue-300' : 'text-orange-300';
        const badgeBg = color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100';
        const checkColor = color === 'blue' ? 'text-blue-500' : 'text-orange-500';

        const orderClass = isEven ? '' : 'order-2 lg:order-1';
        const orderClass2 = isEven ? '' : 'order-1 lg:order-2';

        html += `<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">`;
        html += `<div class="reveal ${orderClass}">`;
        if (sol.data.badge) html += `<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${badgeBg} border mb-6">${esc(sol.data.badge)}</span>`;
        html += `<h2 class="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-6">${esc(sol.data.title)}</h2>`;
        html += `<p class="text-lg text-gray-500 font-medium mb-8 leading-relaxed">${esc(sol.data.description)}</p>`;
        html += '<ul class="space-y-4">';
        (sol.data.features || []).forEach(f => {
          html += `<li class="flex items-start gap-3"><svg class="w-5 h-5 ${checkColor} shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg><span class="text-gray-700 font-medium">${esc(f)}</span></li>`;
        });
        html += '</ul>';
        html += '<div class="mt-10 flex flex-col sm:flex-row gap-4">';
        (sol.data.buttons || []).forEach(btn => {
          const cls = btn.variant === 'secondary'
            ? 'px-8 py-4 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-center'
            : 'px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 text-center';
          html += `<a href="${esc(btn.url)}" class="${cls}">${esc(btn.text)}</a>`;
        });
        html += '</div></div>';

        html += `<div class="reveal reveal-delay-2 ${orderClass2}">`;
        html += `<div class="bg-gradient-to-br ${bgGradient} rounded-3xl p-8 md:p-12 aspect-square flex items-center justify-center">`;
        html += `<svg class="w-48 h-48 ${textColor}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="0.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`;
        html += '</div></div></div>';
      });
      return html;
    }

    // Card-style solutions (index.html)
    let html = '';
    solutionCards.forEach((sol, idx) => {
      const delay = idx > 0 ? ` reveal-delay-${Math.min(idx + 1, 4)}` : '';
      const isFeatured = sol.data.badge;
      const borderClass = isFeatured ? 'border-2 border-blue-500 shadow-lg shadow-blue-500/5' : 'border border-gray-100 shadow-sm hover:border-blue-200';
      const iconBg = isFeatured ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white';

      html += `<a href="${esc(sol.data.link_url)}" class="reveal${delay} group bg-white p-8 md:p-10 rounded-3xl ${borderClass} hover-lift transition-all duration-300 relative">`;
      if (sol.data.badge) html += `<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">${esc(sol.data.badge)}</div>`;
      html += `<div class="w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">${getIcon(sol.data.icon)}</div>`;
      html += `<h3 class="text-xl font-bold text-gray-900 mb-3">${esc(sol.data.title)}</h3>`;
      html += `<p class="text-gray-500 text-sm font-medium leading-relaxed">${esc(sol.data.description)}</p>`;
      html += `<span class="inline-flex items-center gap-1 mt-6 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">${esc(sol.data.link_text)} <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></span>`;
      html += '</a>';
    });
    return html;
  }

  function renderWhyCards(section, items) {
    let html = '';
    items.forEach((item, idx) => {
      const delay = idx > 0 ? ` reveal-delay-${Math.min(idx + 1, 4)}` : '';
      html += `<div class="reveal${delay} bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover-lift">`;
      html += `<div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">${getIcon(item.data.icon)}</div>`;
      html += `<h3 class="text-lg font-bold text-gray-900 mb-2">${esc(item.data.title)}</h3>`;
      html += `<p class="text-gray-500 text-sm font-medium leading-relaxed">${esc(item.data.description)}</p>`;
      html += '</div>';
    });
    return html;
  }

  function renderCta(section, items) {
    const heading = items.find(i => i.item_type === 'heading');
    const paragraph = items.find(i => i.item_type === 'paragraph');
    const buttons = items.filter(i => i.item_type === 'button');

    let html = '<div class="reveal">';
    if (heading) html += `<h2 class="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-6">${heading.data.text}</h2>`;
    if (paragraph) html += `<p class="text-lg text-gray-500 font-medium mb-10 max-w-2xl mx-auto">${esc(paragraph.data.text)}</p>`;
    html += '<div class="flex flex-col sm:flex-row items-center justify-center gap-4">';
    buttons.forEach(btn => {
      const cls = btn.data.variant === 'secondary'
        ? 'px-8 py-4 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2'
        : 'px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300';
      let iconHtml = '';
      if (btn.data.icon === 'phone') iconHtml = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`;
      html += `<a href="${esc(btn.data.url)}" class="${cls}">${iconHtml ? `<span class="flex items-center gap-2">${iconHtml}${esc(btn.data.text)}</span>` : esc(btn.data.text)}</a>`;
    });
    html += '</div></div>';
    return html;
  }

  function renderProcess(section, items) {
    let html = '';
    items.forEach((item, idx) => {
      const delay = idx > 0 ? ` reveal-delay-${Math.min(idx + 1, 4)}` : '';
      const isLast = idx === items.length - 1;
      const numBg = isLast ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600';
      html += `<div class="reveal${delay} text-center">`;
      html += `<div class="w-16 h-16 ${numBg} rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-extrabold">${item.data.number}</div>`;
      html += `<h3 class="text-lg font-bold text-gray-900 mb-2">${esc(item.data.title)}</h3>`;
      html += `<p class="text-gray-500 text-sm font-medium">${esc(item.data.description)}</p>`;
      html += '</div>';
    });
    return html;
  }

  function renderFeatures(section, items) {
    let html = '';
    items.forEach((item, idx) => {
      const delay = idx > 0 ? ` reveal-delay-${Math.min(idx, 4)}` : '';
      html += `<div class="reveal${delay} bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover-lift">`;
      html += `<div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">${getIcon(item.data.icon)}</div>`;
      html += `<h3 class="text-lg font-bold text-gray-900 mb-2">${esc(item.data.title)}</h3>`;
      html += `<p class="text-gray-500 text-sm font-medium">${esc(item.data.description)}</p>`;
      html += '</div>';
    });
    return html;
  }

  function renderPortfolio(section, items) {
    let html = '';
    items.forEach((item, idx) => {
      const delay = idx > 0 ? ` reveal-delay-${Math.min(idx + 1, 4)}` : '';
      const colorMap = { blue: { bg: 'from-blue-50 to-blue-100', icon: 'bg-blue-200 text-blue-600' }, green: { bg: 'from-green-50 to-green-100', icon: 'bg-green-200 text-green-600' }, orange: { bg: 'from-orange-50 to-orange-100', icon: 'bg-orange-200 text-orange-600' } };
      const c = colorMap[item.data.color_theme] || colorMap.blue;
      html += `<div class="reveal${delay} group">`;
      html += `<div class="bg-gradient-to-br ${c.bg} rounded-2xl aspect-[4/3] mb-4 overflow-hidden flex items-center justify-center group-hover:shadow-lg transition-shadow">`;
      html += `<div class="text-center p-6"><div class="w-12 h-12 ${c.icon} rounded-xl flex items-center justify-center mx-auto mb-3"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg></div><p class="text-gray-400 text-sm font-semibold">${esc(item.data.category)}</p></div>`;
      html += '</div>';
      html += `<h3 class="text-base font-bold text-gray-900">${esc(item.data.title)}</h3>`;
      html += `<p class="text-gray-500 text-sm">${esc(item.data.description)}</p>`;
      html += '</div>';
    });
    return html;
  }

  function renderFaq(section, items) {
    let html = '';
    items.forEach((item, idx) => {
      const delay = idx > 0 ? ` reveal-delay-${idx}` : '';
      html += `<div class="reveal${delay} faq-item bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-500 transition-colors">`;
      html += `<button type="button" class="faq-toggle flex justify-between items-center w-full font-bold cursor-pointer p-6 text-lg text-gray-900 text-left"><span>${esc(item.data.question)}</span><span class="faq-chevron shrink-0 ml-4"><svg fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"/></svg></span></button>`;
      html += `<div class="faq-answer"><div class="faq-answer-inner"><div class="text-gray-500 font-medium px-6 pb-6 leading-relaxed">${esc(item.data.answer)}</div></div></div>`;
      html += '</div>';
    });
    return html;
  }

  function renderVisionMission(section, items) {
    let html = '';
    items.forEach((item, idx) => {
      const delay = idx > 0 ? ' reveal-delay-1' : '';
      const isVision = item.data.type === 'vision';
      const bgClass = isVision ? 'from-blue-50 to-white border-blue-100' : 'from-gray-50 to-white border-gray-100';
      const iconBg = isVision ? 'bg-blue-600' : 'bg-gray-900';
      const iconSvg = isVision
        ? '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>'
        : '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>';
      html += `<div class="reveal${delay} bg-gradient-to-br ${bgClass} p-10 rounded-3xl border">`;
      html += `<div class="w-14 h-14 ${iconBg} text-white rounded-2xl flex items-center justify-center mb-6">${iconSvg}</div>`;
      html += `<h2 class="text-2xl font-bold text-gray-900 mb-4">${esc(item.data.title)}</h2>`;
      html += `<p class="text-gray-600 font-medium leading-relaxed">${esc(item.data.content)}</p>`;
      html += '</div>';
    });
    return html;
  }

  function renderValues(section, items) {
    let html = '';
    items.forEach((item, idx) => {
      const delay = idx > 0 ? ` reveal-delay-${Math.min(idx + 1, 4)}` : '';
      html += `<div class="reveal${delay} bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">`;
      html += `<div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">${getIcon(item.data.icon)}</div>`;
      html += `<h3 class="text-lg font-bold text-gray-900 mb-2">${esc(item.data.title)}</h3>`;
      html += `<p class="text-gray-500 text-sm font-medium">${esc(item.data.description)}</p>`;
      html += '</div>';
    });
    return html;
  }

  function renderStory(section, items) {
    let html = '<div class="reveal space-y-8 text-gray-600 font-medium leading-relaxed">';
    items.forEach(item => {
      html += `<p>${item.data.text}</p>`;
    });
    html += '</div>';
    return html;
  }

  function renderContactInfo(section, items, settings) {
    const phone = settings.phone_display || '+90 541 554 75 47';
    const phoneLink = settings.phone_number || '+905415547547';
    const email = settings.email_address || 'bilgi@eayazilim.tr';
    const address = settings.physical_address || 'Manisa/Şehzadeler';
    const waNum = settings.whatsapp_number || '905415547547';

    let html = '<div class="reveal"><h2 class="text-2xl font-bold text-gray-900 mb-8">Bize Ulaşın</h2><div class="space-y-8">';

    // Phone
    html += `<div class="flex items-start gap-5"><div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100"><svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></div><div><h4 class="text-lg font-bold text-gray-900 mb-1">Telefon</h4><a href="tel:${phoneLink}" class="text-gray-500 text-lg hover:text-blue-600 transition-colors">${phone}</a></div></div>`;

    // Email
    html += `<div class="flex items-start gap-5"><div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100"><svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div><div><h4 class="text-lg font-bold text-gray-900 mb-1">E-posta</h4><a href="mailto:${email}" class="text-gray-500 text-lg hover:text-blue-600 transition-colors">${email}</a></div></div>`;

    // Address
    html += `<div class="flex items-start gap-5"><div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100"><svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div><div><h4 class="text-lg font-bold text-gray-900 mb-1">Adres</h4><p class="text-gray-500 text-lg">${address}</p></div></div>`;

    // WhatsApp
    html += `<div class="flex items-start gap-5"><div class="w-14 h-14 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0 shadow-sm border border-[#25D366]/20"><svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 21.033h-.006c-1.637 0-3.238-.432-4.664-1.252l-5.184 1.36 1.386-5.061-.005-.008a9.833 9.833 0 01-1.34-4.99C2.218 5.612 6.612 1.218 12.03 1.218 17.447 1.218 21.84 5.612 21.84 11.03c0 5.417-4.393 9.811-9.81 10.003m0-18.066c-4.444 0-8.06 3.615-8.06 8.06 0 1.422.373 2.812 1.082 4.032l-.902 3.292 3.364-.882a8.032 8.032 0 003.882.996h.005c4.444 0 8.06-3.615 8.06-8.06 0-4.445-3.616-8.06-8.06-8.06m4.442 10.99c-.244-.122-1.442-.71-1.666-.79-.225-.083-.39-.123-.553.122-.164.246-.628.79-.77 952-.144.163-.288.183-.532.062-.244-.122-1.028-.378-1.958-1.206-.723-.645-1.21-1.44-1.353-1.685-.143-.244-.015-.378.107-.5.109-.109.244-.286.366-.43.123-.142.164-.244.246-.407.081-.164.041-.307-.02-.43-.06-.122-.553-1.334-.757-1.826-.2-.482-.403-.416-.552-.424-.143-.008-.308-.01-.472-.01-.164 0-.43.06-.654.305-.224.245-.858.838-.858 2.043s.88 2.366 1.002 2.53c.123.164 1.725 2.632 4.18 3.692.583.25 1.038.4 1.393.512.586.185 1.118.16 1.54.097.47-.07 1.443-.59 1.646-1.16.204-.57.204-1.057.143-1.16-.06-.102-.224-.163-.468-.285"/></svg></div><div><h4 class="text-lg font-bold text-gray-900 mb-1">WhatsApp</h4><a href="https://wa.me/${waNum}" target="_blank" rel="noopener noreferrer" class="text-gray-500 text-lg hover:text-[#25D366] transition-colors">Mesaj Gönderin</a></div></div>`;

    html += '</div></div>';
    return html;
  }

  // Escape HTML
  function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Main render function
  function renderPage(data) {
    if (!data || !data.sections) return;

    const { sections, items, settings } = data;
    const grouped = groupItemsBySection(items);

    // Update global settings (WhatsApp, footer, etc.)
    if (settings.whatsapp_number) {
      const waBtn = document.querySelector('a[href*="wa.me"]');
      if (waBtn) waBtn.href = `https://wa.me/${settings.whatsapp_number}`;
    }
    if (settings.phone_display) {
      const phoneEls = document.querySelectorAll('[data-phone]');
      phoneEls.forEach(el => { el.textContent = settings.phone_display; });
    }

    // Render each section
    sections.forEach(section => {
      const sectionItems = grouped[section.id] || [];
      if (sectionItems.length === 0) return;

      let html = '';
      switch (section.section_type) {
        case 'hero': html = renderHero(section, sectionItems); break;
        case 'stats': html = renderStats(section, sectionItems); break;
        case 'solutions': html = renderSolutions(section, sectionItems); break;
        case 'why_cards': html = renderWhyCards(section, sectionItems); break;
        case 'cta': html = renderCta(section, sectionItems); break;
        case 'process': html = renderProcess(section, sectionItems); break;
        case 'features': html = renderFeatures(section, sectionItems); break;
        case 'portfolio': html = renderPortfolio(section, sectionItems); break;
        case 'faq': html = renderFaq(section, sectionItems); break;
        case 'vision_mission': html = renderVisionMission(section, sectionItems); break;
        case 'values': html = renderValues(section, sectionItems); break;
        case 'story': html = renderStory(section, sectionItems); break;
        case 'contact_info': html = renderContactInfo(section, sectionItems, settings); break;
      }

      if (html) {
        // Find the corresponding section in the DOM and replace its content
        const sectionEl = document.querySelector(`[data-cms-section="${section.section_type}"]`);
        if (sectionEl) {
          sectionEl.innerHTML = html;
          // Re-run reveal observer for new elements
          initReveal();
          // Re-run counters
          initCounters();
          // Re-run FAQ
          initFaq();
        }
      }
    });

    // Update navigation if navItems available
    if (data.navItems && data.navItems.length > 0) {
      renderNavigation(data.navItems);
    }

    // Update form options if available
    if (data.formOptions && data.formOptions.length > 0) {
      renderFormOptions(data.formOptions);
    }
  }

  function renderNavigation(navItems) {
    // Header nav
    const headerNav = document.querySelector('header nav');
    if (headerNav) {
      const headerItems = navItems.filter(n => n.location === 'header');
      if (headerItems.length > 0) {
        headerNav.innerHTML = headerItems.map(n => `<a href="${esc(n.url)}" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">${esc(n.label)}</a>`).join('');
      }
    }

    // Mobile nav
    const mobileNav = document.querySelector('#mobile-menu nav');
    if (mobileNav) {
      const mobileItems = navItems.filter(n => n.location === 'mobile');
      if (mobileItems.length > 0) {
        mobileNav.innerHTML = mobileItems.map(n => `<a href="${esc(n.url)}" class="px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">${esc(n.label)}</a>`).join('');
      }
    }

    // Footer nav groups
    const footerGroups = {
      footer_solutions: document.querySelectorAll('footer ul')[0],
      footer_company: document.querySelectorAll('footer ul')[1],
      footer_legal: document.querySelectorAll('footer ul')[2],
    };
    Object.entries(footerGroups).forEach(([loc, el]) => {
      if (el) {
        const groupItems = navItems.filter(n => n.location === loc);
        if (groupItems.length > 0) {
          el.innerHTML = groupItems.map(n => `<li><a href="${esc(n.url)}" class="hover:text-white transition-colors">${esc(n.label)}</a></li>`).join('');
        }
      }
    });
  }

  function renderFormOptions(options) {
    const select = document.getElementById('interested_package');
    if (select && options.length > 0) {
      select.innerHTML = options.map(o => `<option>${esc(o.option_text)}</option>`).join('');
    }
  }

  // Re-initialize animations after DOM update
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal:not(.is-visible)');
    if (reveals.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]:not([data-initialized])');
    if (counters.length === 0) return;
    counters.forEach(el => {
      el.setAttribute('data-initialized', 'true');
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const duration = 2000;
      const start = performance.now();
      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = Number.isInteger(target) ? Math.floor(eased * target) : (eased * target).toFixed(1);
        el.textContent = val + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(update);
          obs.unobserve(el);
        }
      }, { threshold: 0.5 });
      obs.observe(el);
    });
  }

  function initFaq() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const btn = item.querySelector('.faq-toggle');
      const answer = item.querySelector('.faq-answer');
      const chevron = item.querySelector('.faq-chevron');
      if (!btn || !answer || item.dataset.faqInit) return;
      item.dataset.faqInit = 'true';
      let isOpen = false;
      btn.addEventListener('click', () => {
        isOpen = !isOpen;
        answer.classList.toggle('is-open', isOpen);
        if (chevron) chevron.classList.toggle('is-rotated', isOpen);
      });
    });
  }

  // Initialize
  async function init() {
    try {
      const data = await fetchPageData();
      if (data) {
        renderPage(data);
      }
    } catch (error) {
      console.warn('CMS fetch failed, using static HTML fallback:', error);
      // Fallback: static HTML remains as-is
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
