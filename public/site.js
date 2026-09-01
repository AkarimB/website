// --- Theme ---
(function initTheme() {
    try {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        const savedFont = parseFloat(localStorage.getItem('fontScale'));
        if (savedFont && savedFont !== 1) {
            document.documentElement.style.setProperty('--font-scale', savedFont);
        }
    } catch (e) {}
})();

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    try { localStorage.setItem('theme', newTheme); } catch (e) {}
    const btn = document.querySelector('[data-toggle="theme"]');
    if (btn) {
        btn.querySelector('.icon-sun').style.display = isDark ? '' : 'none';
        btn.querySelector('.icon-moon').style.display = isDark ? 'none' : '';
    }
}

// --- Menu toggle ---
function toggleMenu() {
    const btn = document.querySelector('[data-toggle="menu"]');
    const sub = document.getElementById('submenu');
    if (!btn || !sub) return;
    const isOpen = sub.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
}

// --- Search toggle ---
function toggleSearch() {
    const search = document.getElementById('search');
    if (!search) return;
    const isOpen = search.classList.toggle('open');
    if (isOpen) {
        const input = document.getElementById('q');
        if (input) setTimeout(function () { input.focus(); }, 100);
    }
}

// --- Search clear button ---
function initSearchClear() {
    const input = document.getElementById('q');
    const clearBtn = document.querySelector('.search-clear');
    if (!input || !clearBtn) return;

    function updateClear() {
        clearBtn.style.display = input.value.length > 0 ? '' : 'none';
    }
    input.addEventListener('input', updateClear);
    updateClear();

    clearBtn.addEventListener('click', function (e) {
        e.preventDefault();
        input.value = '';
        clearBtn.style.display = 'none';
        input.form.submit();
    });
}

// --- Click outside to close ---
document.addEventListener('click', function (e) {
    const inMenu = e.target.closest('.menu');

    if (!inMenu) {
        const sub = document.getElementById('submenu');
        const menuBtn = document.querySelector('[data-toggle="menu"]');
        if (sub && sub.classList.contains('open')) {
            sub.classList.remove('open');
            if (menuBtn) {
                menuBtn.classList.remove('open');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        }
    }

    const inSearch = e.target.closest('#search');
    const onSearchToggle = e.target.closest('[data-toggle="search"]');

    if (!inSearch && !onSearchToggle) {
        const search = document.getElementById('search');
        if (search && search.classList.contains('open')) {
            search.classList.remove('open');
        }
    }
});

// --- Escape key to close ---
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const sub = document.getElementById('submenu');
        const menuBtn = document.querySelector('[data-toggle="menu"]');
        if (sub && sub.classList.contains('open')) {
            sub.classList.remove('open');
            if (menuBtn) {
                menuBtn.classList.remove('open');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        }
        const search = document.getElementById('search');
        if (search && search.classList.contains('open')) {
            search.classList.remove('open');
        }
    }
});

// --- Font size control ---
var FONT_STEP = 0.1;
var FONT_MIN = 0.75;
var FONT_MAX = 1.5;

function changeFontSize(delta) {
    var root = document.documentElement;
    var current = parseFloat(root.style.getPropertyValue('--font-scale')) || 1;
    var newScale = delta === 0 ? 1 : Math.round(Math.min(Math.max(current + delta, FONT_MIN), FONT_MAX) * 100) / 100;
    root.style.setProperty('--font-scale', newScale);
    try { localStorage.setItem('fontScale', newScale); } catch (e) {}
    var resetBtn = document.querySelector('[data-font="reset"]');
    if (resetBtn) resetBtn.style.display = newScale === 1 ? 'none' : '';
}

// --- Featured Post ---
function loadFeaturedPost() {
    var container = document.getElementById('featuredPost');
    if (!container) return;
    var lang = document.getElementById('lang');
    if (!lang) return;
    lang = lang.value;
    var domain = 'https://www.islam.ms';
    var langUrl = lang === 'fr' ? '/' : '/' + lang + '/';
    var labels = { fr: 'À la une', ar: 'مقال مميز', en: 'Featured', es: 'Destacado', pt: 'Destaque' };

    var pos;
    try { pos = JSON.parse(localStorage.getItem('featuredPos')); } catch (e) {}
    if (!pos || typeof pos.page !== 'number' || typeof pos.index !== 'number') {
        pos = { page: 0, index: 0 };
    }

    container.setAttribute('data-label', labels[lang] || labels.fr);

    var link = 'https://api.islam.ms/list/post/' + lang + '/' + pos.page;
    fetch(link)
        .then(function (response) {
            if (!response.ok) throw new Error('HTTP error! Status: ' + response.status);
            return response.json();
        })
        .then(function (posts) {
            if (!posts || posts.length === 0 || pos.index >= posts.length) {
                pos = { page: 0, index: 0 };
                localStorage.setItem('featuredPos', JSON.stringify(pos));
                return loadFeaturedPost();
            }
            var post = posts[pos.index];
            if (!post || post.length < 4) return;

            container.innerHTML =
                '<h2><a target="_blank" href="' + langUrl + post[2] + '">' + post[1] + '</a></h2>' +
                '<p>' + post[3] + '</p>' +
                '<p class="shortlink">' + domain + langUrl + '?p=' + post[0] + '</p>';

            var nextIndex = pos.index + 1;
            var nextPage = pos.page;
            if (nextIndex >= 11) {
                nextIndex = 0;
                nextPage++;
            }
            localStorage.setItem('featuredPos', JSON.stringify({ page: nextPage, index: nextIndex }));
        })
        .catch(function (error) {
            console.error('Featured post error:', error);
        });
}

// --- Init on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', function () {
    initSearchClear();
    loadFeaturedPost();

    document.querySelector('[data-toggle="menu"]')?.addEventListener('click', toggleMenu);
    document.querySelector('[data-toggle="search"]')?.addEventListener('click', toggleSearch);
    document.querySelector('[data-toggle="theme"]')?.addEventListener('click', toggleTheme);

    document.querySelector('[data-font="increase"]')?.addEventListener('click', function () { changeFontSize(FONT_STEP); });
    document.querySelector('[data-font="decrease"]')?.addEventListener('click', function () { changeFontSize(-FONT_STEP); });
    document.querySelector('[data-font="reset"]')?.addEventListener('click', function () { changeFontSize(0); });

    var savedFont = parseFloat(localStorage.getItem('fontScale'));
    if (savedFont && savedFont !== 1) {
        var resetBtn = document.querySelector('[data-font="reset"]');
        if (resetBtn) resetBtn.style.display = '';
    }
});

// --- Legacy functions below ---

function loadPost() {
    
    let id = document.getElementById("nextId").value;
    let lang = document.getElementById("lang").value;
    const buttonDiv = document.getElementById("loadPost")
    const contentDiv = document.getElementById("content")
    const domain = 'https://www.islam.ms'
    const langUrl = lang == "fr" ? "/" : `/${lang}/`

    if (id && lang) {
        buttonDiv.disabled = true;
        var link = `https://api.islam.ms/post/${lang}/${id}`;
        
        fetch(link)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(objJSON => {

                if (objJSON.error) {
                    console.log("error objJSON: ", objJSON.error)
                    buttonDiv.disabled = false;
                    
                } else {
                    let title, content, nextId ="", nextTitle ="", loadButton = "", postUrl

                    if (objJSON.length > 10) {
                        nextId = objJSON[10][0]
                        nextTitle = objJSON[10][1]
                        loadButton = `<button type="button" onclick="loadPost()" id="loadPost">${nextTitle}</button>`
                        document.getElementById("nextId").value = nextId
                    }

                    if (objJSON.length > 3) {
                        postUrl = objJSON[4]
                        if (postUrl) history.replaceState(null, '', `${langUrl}${postUrl}`);
                        title = objJSON[1]
                        content = objJSON[3]

                        let elements = contentDiv.querySelectorAll('#' + 'loadPost');
                        elements.forEach(element => element.style.display = 'none');
                        
                        const shortLink = `<p class='shortlink'>${domain}${langUrl}?p=${id}</p>`;
                        
                        const htmlContent = `<h1>${title}</h1>${content} ${shortLink} ${loadButton}`
                        const divContainer = document.createElement('div');
                        divContainer.innerHTML = htmlContent
                        contentDiv.appendChild(divContainer)
                        const imagesElements = contentDiv.querySelectorAll("img");
                        const iframesElements = contentDiv.querySelectorAll("iframe"); 
                        imagesElements.forEach(element => element.src = element.dataset.src)
                        iframesElements.forEach(element => element.src = element.dataset.src)
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                buttonDiv.disabled = false;
            });
    }
}



function loadMore(type, firstLoad) {
    const domain = 'https://www.islam.ms'
    const numberPerPage = 11;
    let mainPageId = parseInt(document.getElementById("nextId").value) || 0;
    let pageId = 0;

    if (firstLoad) {
       sessionStorage.setItem('headerPageId', mainPageId+1);
       sessionStorage.setItem('normalPageId', mainPageId+1); 
       pageId = mainPageId;
    } else {
       let storedId = (type == 'header') ? sessionStorage.getItem('headerPageId') : sessionStorage.getItem('normalPageId');
    pageId = parseInt(storedId);
    }


    let lang = document.getElementById("lang").value;
    let query = document.getElementById("q").value;
    let transLoadMore = document.getElementById("transLoadMore").value;
    const langUrl = lang == "fr" ? "/" : `/${lang}/`
    const appendQuery = (type == 'header') ? `/?t=${type}` : (query ? `/?q=${query}`: "")
    const buttonDiv = document.getElementById("loadMore")
    const headerButtonDiv = document.getElementById("loadMoreHeader")
    const contentDiv = document.getElementById("content")
    const headerCarousel = document.getElementById("headerCarousel")


    if (type == 'header' && !headerCarousel) return;
    
    if (lang) {
        const buttonToDisable = (type == 'header') ? headerButtonDiv : buttonDiv;
        if (buttonToDisable) buttonToDisable.disabled = true;
        
        var link = `https://api.islam.ms/list/post/${lang}/${pageId}${appendQuery}`;
        
        fetch(link)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(objJSON => {
                if (objJSON.error) {
                    console.log("error objJSON: ", objJSON.error)
                    if (buttonToDisable) buttonToDisable.disabled = false;      
                } else {
                    let htmlContent = "", loadButton = "";
                    
                    if (type == 'header') {
                        if (objJSON.length > 0) {
                            const loadMoreBtn = document.getElementById('loadMoreHeader');
                            
                            for (let i = 0 ; i < objJSON.length; i++) {
                                if(objJSON[i].length > 3) {
                                    const cardHtml = `<div class='carousel-card'>
                                    <h2>
                                        <a target='_blank' href="${langUrl}${objJSON[i][2]}">${objJSON[i][1]}</a>
                                    </h2>
                                    <p>${objJSON[i][3]}</p>
                                    <p class='shortlink'>${domain}${langUrl}?p=${objJSON[i][0]}</p>
                                    </div>`;
                                    const divContainer = document.createElement('div');
                                    divContainer.innerHTML = cardHtml;
                                    headerCarousel.insertBefore(divContainer, loadMoreBtn);
                                }
                            }

                             if (!firstLoad) sessionStorage.setItem('headerPageId', pageId+1);
                            
                            if (objJSON.length >= numberPerPage) {
                                loadMoreBtn.disabled = false;
                            } else {
                                loadMoreBtn.style.display = 'none';
                            }
                        } else {
                            headerButtonDiv.style.display = 'none';
                        }
                    } else {
                        for (let i = 0 ; i < objJSON.length; i++) {
                            if(objJSON[i].length > 3) {
                                htmlContent += `<div class='extra'>
                                <h2>
                                    <a target='_blank' href="${langUrl}${objJSON[i][2]}">${objJSON[i][1]}</a>
                                </h2>
                                <p>${objJSON[i][3]}</p>
                                <p class='shortlink'>${domain}${langUrl}?p=${objJSON[i][0]}</p>
                                </div>`;
                            }
                        }

                        if (objJSON.length >= numberPerPage) loadButton = `<button type="button" onclick="loadMore('normal', false)" id="loadMore">${transLoadMore}</button>`
    
                        if (objJSON.length > 0) {
                            let elements = contentDiv.querySelectorAll('#' + 'loadMore');
                            elements.forEach(function(element) {
                                element.style.display = 'none'
                            });

                            sessionStorage.setItem('normalPageId', pageId+1);
                            htmlContent += loadButton
                            const divContainer = document.createElement('div');
                            divContainer.innerHTML = htmlContent
                            contentDiv.appendChild(divContainer)
                        }
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (buttonToDisable) buttonToDisable.disabled = false;
            });
    }
}



function initCarouselDrag() {
    const carousel = document.getElementById('headerCarousel');
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });

    carousel.style.cursor = 'grab';
}

window.addEventListener('load', () => {
    if (document.getElementById("headerCarousel")) {
        loadMore('header', true);
        initCarouselDrag();
    }
});
