//setInterval(function() {sendContent()}, 1*60*1000);

// Load data via API on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPostData();
});

const HISTORY_LIMIT = 99;
const MERGE_WINDOW_MS = 60 * 1000; // 1 minute
const SIGNIFICANT_CHANGE_CHARS = 50;

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const debouncedSave = debounce(saveContent, 3000);

const triggerSave = () => {
    const notifMsg = document.getElementById("notifMsg");
    const notifMsg1 = document.getElementById("notifMsg1");
    if (notifMsg && !notifMsg.innerHTML.includes("Saving")) notifMsg.innerHTML = "Changes detected...";
    if (notifMsg1 && !notifMsg1.innerHTML.includes("Saving")) notifMsg1.innerHTML = "Changes detected...";
    debouncedSave();
};

autoSaveContent();


function loadPostData() {
    const type = document.getElementById("t").value;
    const lang = document.getElementById("l").value;
    const id = document.getElementById("i").value;

    // Only load data if editing an existing post (id is present and valid)
    if (!id || id.trim().length === 0 || isNaN(id) || parseInt(id) <= 0) {
        // For new posts, fetch next ord
        loadNextOrd(type, lang);
        return;
    }

    const notifMsg = document.getElementById("notifMsg");
    const notifMsg1 = document.getElementById("notifMsg1");

    // Show loading indicator
    if (notifMsg) notifMsg.innerHTML = "Loading...";
    if (notifMsg1) notifMsg1.innerHTML = "Loading...";

    fetch(`/idara/admin/api/edit/${type}/${lang}/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load post data');
            }
            return response.json();
        })
        .then(data => {
            populateForm(type, data);
            if (notifMsg) notifMsg.innerHTML = "";
            if (notifMsg1) notifMsg1.innerHTML = "";
        })
        .catch(error => {
            console.error('Error loading post data:', error);
            const retryDelay = 5000; // 5 seconds
            const maxRetries = 3;
            let retryCount = 0;

            const retryLoad = () => {
                retryCount++;
                if (retryCount > maxRetries) {
                    if (notifMsg) {
                        notifMsg.innerHTML = "Error loading data after " + maxRetries + " attempts: " + error.message;
                        notifMsg.style.color = "red";
                    }
                    if (notifMsg1) {
                        notifMsg1.innerHTML = "Error loading data after " + maxRetries + " attempts: " + error.message;
                        notifMsg1.style.color = "red";
                    }
                    return;
                }

                if (notifMsg) notifMsg.innerHTML = "Retrying load... (" + retryCount + "/" + maxRetries + ")";
                if (notifMsg1) notifMsg1.innerHTML = "Retrying load... (" + retryCount + "/" + maxRetries + ")";

                setTimeout(loadPostData, retryDelay);
            };

            retryLoad();
        });
}

function loadNextOrd(type, lang) {
    fetch(`/idara/admin/api/next-ord/${type}/${lang}`)
        .then(response => response.json())
        .then(data => {
            const ordInput = document.getElementById("ord");
            if (ordInput && data.ord) {
                ordInput.value = data.ord;
            }
        })
        .catch(error => {
            console.error('Error loading next ord:', error);
        });
}

function populateForm(type, data) {
    // Common elements and context
    const linkEl = document.getElementById("link");
    const lang = document.getElementById("l").value;
    const domain = "https://www.islam.ms";
    const langUrl = lang === "fr" ? "/" : "/" + lang + "/";

    if (type === 'nmbr') {
        if (data.ord) document.getElementById("ord").value = data.ord;
        if (data.nb) document.getElementById("nb").value = data.nb;
        if (data.nbd) document.getElementById("nbd").value = data.nbd;
        if (data.nbm) document.getElementById("nbm").value = data.nbm;
        if (data.pub) document.getElementById("pub").value = data.pub;

        if (linkEl && data.ord) {
            const href = `https://api.islam.ms/${type}/${lang}/${data.ord}`;
            linkEl.innerHTML = `<a target="_blank" href="${href}">🔗 ${href}</a>`;
        }
    } else {
        if (data.ord) document.getElementById("ord").value = data.ord;
        if (data.title) document.getElementById("title").value = data.title;
        if (data.url) document.getElementById("url").value = data.url;
        if (data.pub) document.getElementById("pub").value = data.pub;

        // Set CKEditor content after it's ready
        if (data.content) {
            if (typeof CKEDITOR !== 'undefined') {
                const editor = CKEDITOR.instances.content;
                if (editor && editor.status === 'ready') {
                    editor.setData(data.content);
                } else if (editor) {
                    editor.once('instanceReady', () => {
                        editor.setData(data.content);
                    });
                } else {
                    CKEDITOR.once('instanceReady', (evt) => {
                        if (evt.editor.name === 'content') {
                            evt.editor.setData(data.content);
                        }
                    });
                }
            }
        }

        if (linkEl) {
            if (type === 'post' && data.url && data.title) {
                if (data.descr) document.getElementById("descr").value = data.descr;
                if (data.tags) document.getElementById("tags").value = data.tags;
                const href = `${domain}${langUrl}${data.url}`;
                linkEl.innerHTML = `<a target="_blank" href="${href}">🔗 ${data.title}</a>`;
            } else if (data.title && data.ord) {
                const href = `https://api.islam.ms/${type}/${lang}/${data.ord}`;
                linkEl.innerHTML = `<a target="_blank" href="${href}">🔗 ${data.title}</a>`;
            }
        }

        if (data.title) {
            document.title = "Post: " + data.title;
        }
    }
}

/**
 * Initializes automatic saving functionality by attaching event listeners to form fields.
 * Depending on the form type ('nmbr', 'post', or others), it monitors CKEditor changes
 * and/or input events on various fields (title, url, description, tags, etc.)
 * to trigger the saveContent() function via a debounced call.
 */
function autoSaveContent() {
    let title, url, descr, tags, nb, nbd, nbm;
    let data = []
    const type = document.getElementById("t").value;

    if (type !== 'nmbr') {
        const attachEditorListener = () => {
            const editor = CKEDITOR.instances.content;
            if (editor) {
                editor.on('change', function () {
                    triggerSave();
                });
                // Attach sendData to the CKEditor save button/command
                editor.on('save', function (evt) {
                    sendData();
                    return false; // Prevent default form submission
                });
            } else {
                // If it's not ready yet, try again shortly
                setTimeout(attachEditorListener, 500);
            }
        };
        attachEditorListener();
    }

    if (type === 'nmbr') {
        nb = document.getElementById("nb");
        nbd = document.getElementById("nbd");
        nbm = document.getElementById("nbm");
        data = [nb, nbd, nbm]
    } else {
        title = document.getElementById("title");
        url = document.getElementById("url");
        data = [title, url]
    }

    if (type === 'post') {
        descr = document.getElementById("descr");
        tags = document.getElementById("tags");
        data = [title, url, descr, tags]
    }

    for (let i = 0; i < data.length; i++) {
        if (data[i]) {
            data[i].addEventListener('input', function () {
                triggerSave();
            });
        }
    }
}



function displayData() {

    const type = document.getElementById("t").value;
    const lang = document.getElementById("l").value;
    const ord = document.getElementById("ord").value?.trim() || "0";
    const nmbSave = document.getElementById("nmbSave").value

    let title, url, descr, content, tags, nb, nbd, nbm;
    let htmlContent = ""

    let transaction, objectStore, index, keyRange, request

    openAndUpgradeDB()
        .then(function (db) {
            transaction = db.transaction("dars", "readonly");
            objectStore = transaction.objectStore("dars");
            index = objectStore.index("typeLangOrdVer");
            keyRange = IDBKeyRange.only([type, lang, ord, Number(nmbSave)]);
            request = index.get(keyRange);

            request.onsuccess = function (event) {
                let item = event.target.result;

                console.log('nmbs:', nmbSave);
                if (item) {
                    console.log('Item found:', item);
                    if (type === 'nmbr') {
                        nb = item.title;
                        nbd = item.descr;
                        nbm = item.content;
                        htmlContent = `<p>${nb}</p><p>${nbd}</p> <p>${nbm}</p>`
                    } else {
                        title = item.title;
                        url = item.url ?? ""
                        content = item.content;
                        htmlContent = `<p>${item.ord}</p><p>${title}</p> <p>${url}</p> ${content}`
                    }

                    if (type === 'post') {
                        descr = item.descr
                        tags = item.tags
                        htmlContent = `<p>${item.ord}</p><p>${title}</p> <p>${url}</p> <p>${descr}</p> ${content} <p>${tags}</p>`
                    }

                    document.getElementById("savedData").innerHTML = htmlContent
                } else {
                    console.log('Item not found.');
                }
            }
        })
        .catch(function (error) {
            console.error('Error opening database:', error);
        });
}

function saveContent() {
    let title, url, descr, content, tags, nb, nbd, nbm;
    let data;

    const type = document.getElementById("t").value;
    const lang = document.getElementById("l").value;
    const ord = document.getElementById("ord").value?.trim() || "0";
    const notifMsg = document.getElementById("notifMsg");
    const notifMsg1 = document.getElementById("notifMsg1");
    let ver = 1;
    let now = Date.now();

    // Visual feedback
    if (notifMsg) notifMsg.innerHTML = "Saving...";
    if (notifMsg1) notifMsg1.innerHTML = "Saving...";

    if (type === 'nmbr') {
        nb = document.getElementById("nb").value;
        nbd = document.getElementById("nbd").value;
        nbm = document.getElementById("nbm").value;
        data = { ord, title: nb, descr: nbd, content: nbm, type, lang, ver, timestamp: now };
    } else {
        url = document.getElementById("url").value;
        url = url.replace(/\s+/g, '-');
        title = document.getElementById("title").value;

        const editor = CKEDITOR.instances.content;
        content = editor ? editor.getData() : "";

        data = { ord, title, url, content, type, lang, ver, timestamp: now };

        if (type === 'post') {
            data.descr = document.getElementById("descr").value;
            data.tags = document.getElementById("tags").value;
        }
    }

    const updateVisualFeedback = (version, content, type) => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        let message = "Draft saved at " + timeStr + " (v" + version + ")";

        if (type !== "nmbr") {
            const wordsArray = (content || "").split(/\s+/).filter(w => w.length > 0);
            message += ". Words: " + wordsArray.length;
        }

        if (notifMsg) notifMsg.innerHTML = message;
        if (notifMsg1) notifMsg1.innerHTML = message;
    };

    openAndUpgradeDB()
        .then(function (db) {
            let transaction = db.transaction("dars", "readwrite");
            let objectStore = transaction.objectStore("dars");
            let index = objectStore.index("typeLangOrd");
            let keyRange = IDBKeyRange.only([type, lang, ord]);
            let request = index.openCursor(keyRange, 'prev');

            request.onsuccess = function (event) {
                let cursor = event.target.result;
                let lastItem = cursor ? cursor.value : null;

                const finalizeSave = (version) => {
                    document.getElementById("nmbSave").value = version;
                    updateVisualFeedback(version, data.content, type);
                    if (version > HISTORY_LIMIT) {
                        pruneHistory(db, type, lang, ord, version - HISTORY_LIMIT);
                    }
                };

                if (lastItem) {
                    // Check if anything actually changed
                    const hasChanged =
                        lastItem.title !== data.title ||
                        lastItem.content !== data.content ||
                        lastItem.url !== data.url ||
                        lastItem.descr !== data.descr ||
                        lastItem.tags !== data.tags;

                    if (!hasChanged) {
                        console.log("No changes detected. Skipping save.");
                        updateVisualFeedback(lastItem.ver, lastItem.content, type);
                        return;
                    }

                    // Versioning strategy
                    const timeSinceLastSave = now - (lastItem.timestamp || 0);
                    const charDiff = Math.abs((data.content || "").length - (lastItem.content || "").length);

                    const shouldMerge =
                        timeSinceLastSave < MERGE_WINDOW_MS ||
                        (charDiff < SIGNIFICANT_CHANGE_CHARS && timeSinceLastSave < 5 * 60 * 1000);

                    if (shouldMerge) {
                        // Update existing record
                        data.ver = lastItem.ver;
                        data.id = lastItem.id; // Maintain the same primary key
                        objectStore.put(data).onsuccess = () => {
                            console.log("Updated version:", data.ver);
                            finalizeSave(data.ver);
                        };
                    } else {
                        // Create new version
                        ver = lastItem.ver + 1;
                        data.ver = ver;
                        objectStore.add(data).onsuccess = () => {
                            console.log("Saved new version:", ver);
                            finalizeSave(ver);
                        };
                    }
                } else {
                    // First save for this item
                    objectStore.add(data).onsuccess = () => {
                        console.log("First save version:", ver);
                        finalizeSave(ver);
                    };
                }
            };

            transaction.oncomplete = function () {
                db.close();
            };
        })
        .catch(function (error) {
            console.error('Error opening database:', error);
            if (notifMsg) notifMsg.innerHTML = "Save error!";
        });
}

function pruneHistory(db, type, lang, ord, maxVerToDelete) {
    const transaction = db.transaction("dars", "readwrite");
    const objectStore = transaction.objectStore("dars");
    const index = objectStore.index("typeLangOrd");
    const keyRange = IDBKeyRange.only([type, lang, ord]);
    const request = index.openCursor(keyRange);

    request.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            if (cursor.value.ver <= maxVerToDelete) {
                cursor.delete();
                cursor.continue();
            }
        }
    };
}


function openAndUpgradeDB() {
    var DBOpenRequest = window.indexedDB.open('post_db', 1);

    DBOpenRequest.onerror = function (event) {
        console.error('Error opening database:', event);
    };

    DBOpenRequest.onupgradeneeded = function (event) {
        var db = event.target.result;

        // Create or modify the database structure in this event handler
        var objectStore = db.createObjectStore('dars', { keyPath: 'id', autoIncrement: true });

        // Create indexes or perform other upgrade actions
        objectStore.createIndex('title', 'title', { unique: false });
        objectStore.createIndex('descr', 'descr', { unique: false });
        objectStore.createIndex('content', 'content', { unique: false });
        objectStore.createIndex('lang', 'lang', { unique: false });
        objectStore.createIndex('url', 'url', { unique: false });
        objectStore.createIndex('tags', 'tags', { unique: false });
        objectStore.createIndex('ord', 'ord', { unique: false });
        objectStore.createIndex('type', 'type', { unique: false });
        objectStore.createIndex('ver', 'ver', { unique: false });
        objectStore.createIndex('typeLangOrd', ['type', 'lang', 'ord'], { unique: false });
        objectStore.createIndex('typeLangOrdVer', ['type', 'lang', 'ord', 'ver'], { unique: false });

    };

    return new Promise(function (resolve, reject) {
        DBOpenRequest.onsuccess = function (event) {
            var db = event.target.result;

            // Resolve the promise with the database instance
            resolve(db);
        };

        DBOpenRequest.onerror = function (event) {
            // Reject the promise with the error event
            reject(event);
        };
    });
}

function sendData() {

    let title, url, descr, content, tags, nb, nbd, nbm, link;
    let data;
    let button1

    const type = document.getElementById("t").value;
    const pub = document.getElementById("pub").value;
    const lang = document.getElementById("l").value;
    const ord = document.getElementById("ord").value?.trim() || "0";
    let id = document.getElementById("i").value;

    let nmbSave = sessionStorage.getItem("nmbSave") ?? 1;

    if (id.trim().length === 0) id = -1

    const button2 = document.getElementById("saveButton")

    if (type === 'nmbr') {
        nb = document.getElementById("nb").value;
        nbd = document.getElementById("nbd").value;
        nbm = document.getElementById("nbm").value;
        const href = `https://api.islam.ms/${type}/${lang}/${ord}`;
        link = `<a target="_blank" href="${href}">🔗 ${href}</a>`;
    } else {
        const editor = CKEDITOR.instances.content;
        const saveCommand = editor ? editor.getCommand('save') : null;

        if (saveCommand) saveCommand.disable();

        url = document.getElementById("url").value;
        url = url.replace(/\s+/g, '-');
        title = document.getElementById("title").value;
        content = editor ? editor.getData() : "";
        link = `<a target="_blank" href="https://api.islam.ms/${type}/${lang}/${ord}">🔗 ${title}</a>`;
    }

    const langUrl = lang == "fr" ? "/" : "/" + lang + "/";
    const domain = "https://www.islam.ms"

    if (type === 'nmbr') {
        data = {
            ord: ord,
            nb: nb,
            nbd: nbd,
            nbm: nbm,
            pub: pub,
            type: type,
            lang: lang,
            id: id
        };
    } else if (type === 'post') {
        descr = document.getElementById("descr").value;
        tags = document.getElementById("tags").value;
        link = `<a target='_blank' href=${domain}${langUrl}${url}>${title}</a>`;
        data = {
            ord: ord,
            title: title,
            url: url,
            descr: descr,
            content: content,
            tags: tags,
            pub: pub,
            type: type,
            lang: lang,
            id: id
        };
    } else {
        data = {
            ord: ord,
            title: title,
            url: url,
            content: content,
            pub: pub,
            type: type,
            lang: lang,
            id: id
        };
    }

    console.log(data);

    button2.disabled = true;

    // Send the data to the server using Fetch API
    fetch('/idara/admin/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(responseData => {
            // Handle the response from the server if needed
            const notifMsg = document.getElementById("notifMsg")
            const notifMsg1 = document.getElementById("notifMsg1")
            const linkNotif = document.getElementById("link")
            var numberWords = ""

            if (type != "nmbr") {
                var wordsArray = content.split(/\s+/);
                numberWords = ", Number of words: " + wordsArray.length;
            }

            if (responseData.error) {
                console.log("error: ", responseData.error)
                notifMsg.innerHTML = responseData.error;
                notifMsg.style.color = "red"
                notifMsg1.innerHTML = responseData.error;
                notifMsg1.style.color = "red"
            } else {
                console.log(responseData)
                if (id <= 0) history.replaceState(null, '', `/idara/admin/posts/${type}/${lang}/${responseData.id}`);
                document.getElementById("i").value = responseData.id;

                notifMsg.innerHTML = responseData.msg + " " + nmbSave + numberWords;
                linkNotif.innerHTML = link
                notifMsg.style.color = "green"
                notifMsg1.innerHTML = responseData.msg + " " + nmbSave + numberWords;
                notifMsg1.style.color = "green"
                showToast(responseData.msg + " " + nmbSave + numberWords);
                if (type === "nmbr") {
                    document.title = `${lang} ${nbd} ${nbm}`
                } else {
                    document.title = title
                }

                nmbSave++;
                sessionStorage.setItem("nmbSave", nmbSave);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            notifMsg.innerHTML = error;
            notifMsg.style.color = "red"
            notifMsg1.innerHTML = error;
            notifMsg1.style.color = "red"
            showToast(error);
        }).finally(() => {
            if (type !== "nmbr") {
                const editor = CKEDITOR.instances.content;
                const saveCommand = editor ? editor.getCommand('save') : null;
                if (saveCommand) saveCommand.enable();
            }
            button2.disabled = false;
        });
}

function clearStorage() {
    // We only clear the local drafts in IndexedDB, not global localStorage
    // to avoid affecting other features like Qibla settings on the same domain.
    openAndUpgradeDB()
        .then(function (db) {
            const transaction = db.transaction("dars", "readwrite");
            const objectStore = transaction.objectStore("dars");
            const request = objectStore.clear();

            request.onsuccess = function () {
                const nmbSaveInput = document.getElementById("nmbSave");
                if (nmbSaveInput) nmbSaveInput.value = "";

                // Reset the session storage counter
                sessionStorage.removeItem("nmbSave");

                console.log("Local drafts cleared.");
                if (db) {
                    db.close();
                    console.log("db closed");
                }
                showToast("Local drafts cleared");
            }

            request.onerror = function (event) {
                console.error("Error clearing records:", event);
                showToast("Error clearing drafts");
            };
        })
        .catch(function (error) {
            console.error('Error opening database:', error);
            showToast("Error opening database");
        });
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notif";
    toast.innerHTML = message;

    // Inline styles for the toast
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '10000',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        opacity: '0',
        transition: 'opacity 0.5s, bottom 0.5s'
    });

    // Add keyframes if they don't exist
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.innerHTML = `
            .toast-notif.show {
                opacity: 1 !important;
                bottom: 20px !important;
            }
            .toast-notif {
                bottom: 0px !important;
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

function purgeCache() {
    const type = document.getElementById("t").value;
    const lang = document.getElementById("l").value;
    const ord = document.getElementById("ord").value?.trim() || "0";
    const url = document.getElementById("url")?.value || "";
    const purgeButton = document.getElementById("purgeButton");

    if (purgeButton) purgeButton.disabled = true;
    showToast("Purging cache...");

    fetch('/idara/admin/data/purge', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, lang, ord, url })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast("Error: " + data.error);
            } else {
                showToast("✅ " + data.msg);
            }
        })
        .catch(error => {
            console.error('Purge error:', error);
            showToast("Error purging cache: " + error.message);
        })
        .finally(() => {
            if (purgeButton) purgeButton.disabled = false;
        });
}
