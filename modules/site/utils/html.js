import { domain, langList } from '../../../shared/constants.js';
import { menuTopics, menuExtras, langNames } from './menuConfig.js';
import { getLangUrl } from './helpers.js';

const localeMap = {
    fr: 'fr_FR', en: 'en_US', ar: 'ar_SA', es: 'es_ES', pt: 'pt_PT'
};

const ogImage = '/images/islam-ms-logo-1200.png';

export function buildMetaGraph(config) {
    const { siteTitle, siteDesc, lang, type, tags } = config;
    const locale = localeMap[lang] || 'en_US';
    const ogType = type === 'article' ? 'article' : 'website';
    const imageUrl = `${domain}${ogImage}`;
    const title = siteTitle || '';
    const desc = siteDesc || '';

    let html = `<meta property="og:image" content="${imageUrl}">
            <meta property="og:image:type" content="image/png">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="631">
            <meta property="og:image:alt" content="${title}">
            <meta property="og:locale" content="${locale}">
            <meta property="og:site_name" content="Islam.ms">
            <meta property="og:type" content="${ogType}" />
            <meta property="og:url" content="${config.ogUrl || domain}" />
            <meta property="og:title" content="${title}" />
            <meta property="og:description" content="${desc}" />
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:site" content="@islam_ms">
            <meta name="twitter:title" content="${title}">
            <meta name="twitter:description" content="${desc}">
            <meta name="twitter:image" content="${imageUrl}">`;

    if (ogType === 'article' && tags && tags.length > 0) {
        for (const tag of tags) {
            if (tag) html += `\n            <meta property="article:tag" content="${tag}">`;
        }
    }

    return html;
}

export function buildHiddenInputs(config) {
    const { nextId, lang, transLoadMore } = config;
    return `<input type="hidden" id="nextId" value="${nextId || ''}">
            <input type="hidden" id="lang" value="${lang || ''}">
            <input type="hidden" id="transLoadMore" value="${transLoadMore || ''}">`;
}

function svgHamburger() {
    return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--link)" stroke-width="2.5" stroke-linecap="round">
        <path d="M3 6h18M3 12h18M3 18h18"/>
    </svg>`;
}

function svgClose() {
    return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--link)" stroke-width="2.5" stroke-linecap="round">
        <path d="M6 6l12 12M18 6l-12 12"/>
    </svg>`;
}

function svgSearch() {
    return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--link)" stroke-width="2.5" stroke-linecap="round">
        <circle cx="11" cy="11" r="7"/>
        <path d="M16.5 16.5L21 21"/>
    </svg>`;
}

function svgSearchClear() {
    return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round">
        <path d="M6 6l12 12M18 6l-12 12"/>
    </svg>`;
}

function svgSun() {
    return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--link)" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>`;
}

function svgMoon() {
    return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--link)" stroke-width="2" stroke-linecap="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>`;
}

export function buildHeader(lang) {
    const topics = menuTopics[lang] || menuTopics.en;
    const extras = menuExtras[lang] || menuExtras.en;
    const langUrl = getLangUrl(lang);

    return `<div class="menu">
        <span class="menu-left">
            <button data-toggle="menu" class="mButton" aria-expanded="false" aria-controls="submenu" aria-label="Toggle navigation menu">
                <span class="icon-hamburger">${svgHamburger()}</span>
                <span class="icon-close">${svgClose()}</span>
            </button>
            <a href="${langUrl}"><b>Islam.ms</b></a>
            ${extras.map(e => `<a href="${e.url}" target="_blank">${e.label}</a>`).join('')}
            <button data-toggle="search" class="subButton" aria-label="Toggle search">
                ${svgSearch()}
            </button>
        </span>
        <span class="menu-right">
            ${buildLangSwitcher(lang)}
            ${buildThemeToggle()}
            <button data-font="decrease" class="font-btn" aria-label="Decrease font size">A−</button>
            <button data-font="reset" class="font-btn" aria-label="Reset font size" style="display:none">A</button>
            <button data-font="increase" class="font-btn" aria-label="Increase font size">A+</button>
        </span>
        <div id="submenu">
            ${topics.map(t => `<a href="${langUrl}?q=${t.q}">${t.label}</a>`).join('')}
        </div>
    </div>`;
}

export function buildLangSwitcher(currentLang) {
    const items = langList.map(code => {
        const info = langNames[code] || { label: code, flag: '' };
        const active = code === currentLang ? ' class="active-lang"' : '';
        return `<a href="${getLangUrl(code)}"${active} data-lang="${code}">${info.flag} ${info.label}</a>`;
    }).join('');

    return `<div class="lang-switcher">
        <button class="lang-btn" aria-label="Switch language">
            ${langNames[currentLang]?.flag || ''} ${langNames[currentLang]?.label || currentLang}
        </button>
        <div class="lang-dropdown">
            ${items}
        </div>
    </div>`;
}

export function buildThemeToggle() {
    return `<button data-toggle="theme" class="theme-btn" aria-label="Toggle dark mode">
        <span class="icon-sun">${svgSun()}</span>
        <span class="icon-moon" style="display:none">${svgMoon()}</span>
    </button>`;
}

export function buildFooter(footer, lang) {
    return footer || '';
}

export function buildCarousel(loadMore) {
    return `<div class="carousel-wrapper">
        <div id="headerCarousel" class="carousel-content">
            <button type="button" onclick="loadMore('header', false)" id="loadMoreHeader">${loadMore}</button>
        </div>
    </div>`;
}

export function buildPostCard(post, lang, langUrl) {
    const id = post.id ?? post[0] ?? '';
    const title = post.title ?? post[1] ?? '';
    const url = post.url ?? post[2] ?? '';
    const descr = post.descr ?? post[3] ?? '';
    return `<div class='extra'>
        <h2>
            <a target='_blank' href="${langUrl}${url}">${title}</a>
        </h2>
        <p>${descr}</p>
        <p class='shortlink'>${domain}${langUrl}?p=${id}</p>
    </div>`;
}

export function buildCarouselCard(post, lang, langUrl) {
    const id = post.id ?? post[0] ?? '';
    const title = post.title ?? post[1] ?? '';
    const url = post.url ?? post[2] ?? '';
    const descr = post.descr ?? post[3] ?? '';
    return `<div class='carousel-card'>
        <h2>
            <a target='_blank' href="${langUrl}${url}">${title}</a>
        </h2>
        <p>${descr}</p>
        <p class='shortlink'>${domain}${langUrl}?p=${id}</p>
    </div>`;
}

export function buildSearchForm(action, submit, q = '') {
    const hasQuery = q && q.trim().length > 0;
    return `<div id="search"${hasQuery ? ' class="open"' : ''}>
        <form method="GET" action="${action}">
            <div class="search-wrapper">
                <input type="text" id="q" value="${q}" name="q" placeholder="${submit}">
                <button type="reset" class="search-clear" aria-label="Clear search"${hasQuery ? '' : ' style="display:none"'}>${svgSearchClear()}</button>
                <button class="subButton" type="submit" aria-label="Search">${svgSearch()}</button>
            </div>
        </form>
    </div>`;
}
