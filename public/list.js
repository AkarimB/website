document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
});

async function loadPosts() {
    const postList = document.getElementById('postList');
    const paginationTop = document.getElementById('paginationTop');
    const paginationBottom = document.getElementById('paginationBottom');

    // Parse URL params
    const pathParts = window.location.pathname.split('/');
    // Expected path: /idara/admin/posts/list/:type/:lang/:currentPageId?
    // /idara = 1, /admin = 2, /posts = 3, /list = 4, /:type = 5, /:lang = 6, /:currentPageId = 7
    const type = pathParts[5];
    const lang = pathParts[6];
    const currentPageId = pathParts[7] || 0;

    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q') || '';
    const ord = urlParams.get('ord') || '';

    postList.innerHTML = '<p>Loading...</p>';

    try {
        let apiUrl = `/idara/admin/api/list/${type}/${lang}/${currentPageId}`;
        const queryParams = new URLSearchParams();
        if (q) queryParams.append('q', q);
        if (ord) queryParams.append('ord', ord);

        if (queryParams.toString()) {
            apiUrl += `?${queryParams.toString()}`;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch posts');

        const data = await response.json();
        renderPosts(data.posts, type, lang);
        renderPagination(data.pagination, type, lang, q, ord);
    } catch (error) {
        console.error('Error loading posts:', error);
        const retryDelay = 5000;
        const maxRetries = 3;
        let retryCount = 0;

        const retryLoad = async () => {
            retryCount++;
            if (retryCount > maxRetries) {
                postList.innerHTML = '<p>Error loading posts after ' + maxRetries + ' attempts. Please refresh the page.</p>';
                return;
            }

            postList.innerHTML = '<p>Retrying load... (' + retryCount + '/' + maxRetries + ')</p>';

            setTimeout(loadPosts, retryDelay);
        };

        retryLoad();
    }
}

function renderPosts(posts, type, lang) {
    const postList = document.getElementById('postList');
    if (posts.length === 0) {
        postList.innerHTML = '<p>No posts found.</p>';
        return;
    }

    const domain = 'https://www.islam.ms';
    const html = posts.map(post => {
        if (type === 'post') {
            const appendLang = lang === "fr" ? "/" : `/${lang}/`;
            const linkShort = `${domain}${appendLang}?p=${post.id}`;
            return `
                <div class='extra'>
                    <h2><a target='_blank' href="/idara/admin/posts/edit/${type}/${lang}/${post.id}">${post.title}</a></h2>
                    <p>Post url: <a target='_blank' href="${domain}${appendLang}${post.url}">${post.url}</a></p>
                    <p>
                        <a target='_blank' href="/idara/admin/posts/list/${type}/${lang}/?ord=${post.ord}">Order: ${post.ord}</a> | 
                        ${post.pub} | 
                        short Link: <a target='_blank' href="${linkShort}">${linkShort}</a>
                    </p>
                </div>
            `;
        } else {
            // For other types (dua, dars, etc.)
            // Note: post.audio handles row[2] from messages table
            return `<p><a target='_blank' href="/idara/admin/posts/edit/${type}/${lang}/${post.id}">${post.ord} - ${post.pub} - ${post.title}</a></p>`;
        }
    }).join('');

    postList.innerHTML = html;
}

function renderPagination(pagination, type, lang, q, ord) {
    const { currentPage, hasMore } = pagination;
    const paginationTop = document.getElementById('paginationTop');
    const paginationBottom = document.getElementById('paginationBottom');

    const prevPage = parseInt(currentPage) - 1;
    const nextPage = parseInt(currentPage) + 1;

    const queryAppend = q ? `?q=${encodeURIComponent(q)}` : (ord ? `?ord=${encodeURIComponent(ord)}` : '');

    let prevLink = '';
    if (prevPage === 0) {
        prevLink = `<a href="/idara/admin/posts/list/${type}/${lang}/${queryAppend}">❮ </a>`;
    } else if (prevPage > 0) {
        prevLink = `<a href="/idara/admin/posts/list/${type}/${lang}/${prevPage}/${queryAppend}">❮ </a>`;
    }

    let nextLink = '';
    if (hasMore) {
        nextLink = `<a href="/idara/admin/posts/list/${type}/${lang}/${nextPage}/${queryAppend}"> ❯</a>`;
    }

    const html = `<div class="lin">${prevLink} ${nextLink}</div>`;
    paginationTop.innerHTML = html;
    paginationBottom.innerHTML = html;
}
