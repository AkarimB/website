(function () {
    'use strict';

    const BASE_URL = 'https://archive.org/download/';

    function init() {
        const plist = document.querySelector('.plist');
        if (!plist) return;

        const tracks = parseTracks(plist);
        if (tracks.length === 0) return;

        const audio = new Audio();
        audio.preload = 'metadata';
        let currentIdx = -1;
        let shuffle = false;
        let repeatMode = 0; // 0=off, 1=one, 2=all
        let shuffleOrder = [];

        const player = createPlayerUI();
        plist.parentNode.insertBefore(player.el, plist);

        function parseTracks(container) {
            const links = container.querySelectorAll('a[onclick]');
            const result = [];
            links.forEach(function (a) {
                const onclick = a.getAttribute('onclick') || '';
                const match = onclick.match(/getAudio\(['"]([^'"]+)['"]\)/);
                if (match) {
                    const file = match[1];
                    const name = a.textContent.trim();
                    const url = file.startsWith('http') ? file : BASE_URL + 'cours_islam/' + file;
                    result.push({ name: name, url: url, el: a });
                }
            });
            return result;
        }

        function createPlayerUI() {
            const el = document.createElement('div');
            el.className = 'audio-player';
            el.innerHTML =
                '<div class="ap-controls">' +
                    '<button class="ap-btn ap-prev" title="Previous (P)" aria-label="Previous track">' + svgPrev() + '</button>' +
                    '<button class="ap-btn ap-play" title="Play/Pause (Space)" aria-label="Play">' + svgPlay() + '</button>' +
                    '<button class="ap-btn ap-next" title="Next (N)" aria-label="Next track">' + svgNext() + '</button>' +
                    '<div class="ap-progress-wrap">' +
                        '<span class="ap-time ap-current">0:00</span>' +
                        '<div class="ap-progress" role="slider" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
                            '<div class="ap-progress-fill"></div>' +
                        '</div>' +
                        '<span class="ap-time ap-duration">0:00</span>' +
                    '</div>' +
                    '<div class="ap-volume-wrap">' +
                        '<button class="ap-btn ap-mute" title="Mute" aria-label="Mute">' + svgVol() + '</button>' +
                        '<input type="range" class="ap-volume" min="0" max="1" step="0.05" value="1" aria-label="Volume">' +
                    '</div>' +
                    '<button class="ap-btn ap-shuffle" title="Shuffle" aria-label="Shuffle">' + svgShuffle() + '</button>' +
                    '<button class="ap-btn ap-repeat" title="Repeat" aria-label="Repeat">' + svgRepeat() + '</button>' +
                '</div>' +
                '<div class="ap-info">' +
                    '<span class="ap-track-name">—</span>' +
                    '<span class="ap-track-num"></span>' +
                '</div>';

            const controls = {
                prev: el.querySelector('.ap-prev'),
                play: el.querySelector('.ap-play'),
                next: el.querySelector('.ap-next'),
                progress: el.querySelector('.ap-progress'),
                progressFill: el.querySelector('.ap-progress-fill'),
                current: el.querySelector('.ap-current'),
                duration: el.querySelector('.ap-duration'),
                mute: el.querySelector('.ap-mute'),
                volume: el.querySelector('.ap-volume'),
                shuffle: el.querySelector('.ap-shuffle'),
                repeat: el.querySelector('.ap-repeat'),
                trackName: el.querySelector('.ap-track-name'),
                trackNum: el.querySelector('.ap-track-num')
            };

            // Events
            controls.play.addEventListener('click', function () {
                if (currentIdx < 0) { playTrack(0); return; }
                if (audio.paused) { audio.play(); } else { audio.pause(); }
            });

            controls.prev.addEventListener('click', function () { prevTrack(); });
            controls.next.addEventListener('click', function () { nextTrack(); });

            controls.progress.addEventListener('click', function (e) {
                if (!audio.duration) return;
                const rect = this.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                audio.currentTime = pct * audio.duration;
            });

            controls.mute.addEventListener('click', function () {
                audio.muted = !audio.muted;
                updateMuteBtn();
            });

            controls.volume.addEventListener('input', function () {
                audio.volume = parseFloat(this.value);
                if (audio.muted && audio.volume > 0) { audio.muted = false; }
                updateMuteBtn();
            });

            controls.shuffle.addEventListener('click', function () {
                shuffle = !shuffle;
                this.classList.toggle('active', shuffle);
                if (shuffle) { generateShuffleOrder(); }
            });

            controls.repeat.addEventListener('click', function () {
                repeatMode = (repeatMode + 1) % 3;
                this.classList.toggle('active', repeatMode > 0);
                this.title = 'Repeat: ' + ['Off', 'One', 'All'][repeatMode];
            });

            // Audio events
            audio.addEventListener('play', function () {
                controls.play.innerHTML = svgPause();
                controls.play.setAttribute('aria-label', 'Pause');
            });

            audio.addEventListener('pause', function () {
                controls.play.innerHTML = svgPlay();
                controls.play.setAttribute('aria-label', 'Play');
            });

            audio.addEventListener('timeupdate', function () {
                if (!audio.duration) return;
                const pct = (audio.currentTime / audio.duration) * 100;
                controls.progressFill.style.width = pct + '%';
                controls.progress.setAttribute('aria-valuenow', Math.round(pct));
                controls.current.textContent = fmtTime(audio.currentTime);
            });

            audio.addEventListener('loadedmetadata', function () {
                controls.duration.textContent = fmtTime(audio.duration);
            });

            audio.addEventListener('ended', function () {
                if (repeatMode === 1) {
                    audio.currentTime = 0;
                    audio.play();
                } else {
                    nextTrack();
                }
            });

            audio.addEventListener('error', function () {
                controls.trackName.textContent = 'Error loading track';
            });

            function updateMuteBtn() {
                controls.mute.innerHTML = (audio.muted || audio.volume === 0) ? svgMute() : svgVol();
            }

            return { el: el, audio: audio, controls: controls };
        }

        function playTrack(idx) {
            if (idx < 0 || idx >= tracks.length) return;
            currentIdx = idx;
            const track = tracks[idx];
            audio.src = track.url;
            audio.play();
            player.controls.trackName.textContent = track.name;
            player.controls.trackNum.textContent = (idx + 1) + ' / ' + tracks.length;
            highlightTrack(idx);
        }

        function nextTrack() {
            if (shuffle) {
                const next = shuffleOrder.indexOf(currentIdx) + 1;
                if (next < shuffleOrder.length) {
                    playTrack(shuffleOrder[next]);
                } else if (repeatMode === 2) {
                    generateShuffleOrder();
                    playTrack(shuffleOrder[0]);
                } else {
                    audio.pause();
                    player.controls.play.innerHTML = svgPlay();
                }
            } else {
                const next = currentIdx + 1;
                if (next < tracks.length) {
                    playTrack(next);
                } else if (repeatMode === 2) {
                    playTrack(0);
                } else {
                    audio.pause();
                    player.controls.play.innerHTML = svgPlay();
                }
            }
        }

        function prevTrack() {
            if (audio.currentTime > 3) {
                audio.currentTime = 0;
                return;
            }
            if (shuffle) {
                const prev = shuffleOrder.indexOf(currentIdx) - 1;
                if (prev >= 0) { playTrack(shuffleOrder[prev]); }
            } else {
                if (currentIdx > 0) { playTrack(currentIdx - 1); }
            }
        }

        function highlightTrack(idx) {
            tracks.forEach(function (t, i) {
                t.el.classList.toggle('ap-active', i === idx);
            });
        }

        function generateShuffleOrder() {
            shuffleOrder = [];
            for (let i = 0; i < tracks.length; i++) { shuffleOrder.push(i); }
            for (let i = shuffleOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = shuffleOrder[i];
                shuffleOrder[i] = shuffleOrder[j];
                shuffleOrder[j] = tmp;
            }
        }

        // Click on plist track
        plist.addEventListener('click', function (e) {
            const a = e.target.closest('a');
            if (!a) return;
            const idx = tracks.findIndex(function (t) { return t.el === a; });
            if (idx >= 0) {
                e.preventDefault();
                playTrack(idx);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function (e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (currentIdx < 0) { playTrack(0); return; }
                    if (audio.paused) { audio.play(); } else { audio.pause(); }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (audio.duration) audio.currentTime = Math.max(0, audio.currentTime - 10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    audio.volume = Math.min(1, audio.volume + 0.1);
                    player.controls.volume.value = audio.volume;
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    audio.volume = Math.max(0, audio.volume - 0.1);
                    player.controls.volume.value = audio.volume;
                    break;
                case 'KeyN':
                    nextTrack();
                    break;
                case 'KeyP':
                    prevTrack();
                    break;
            }
        });

        // Make getAudio available globally for backward compat
        window.getAudio = function (file) {
            const url = file.startsWith('http') ? file : BASE_URL + 'cours_islam/' + file;
            const idx = tracks.findIndex(function (t) { return t.url === url; });
            if (idx >= 0) {
                playTrack(idx);
            } else {
                audio.src = url;
                audio.play();
                player.controls.trackName.textContent = file.replace(/\.[^.]+$/, '').replace(/-/g, ' ');
                player.controls.trackNum.textContent = '';
            }
        };
    }

    function fmtTime(s) {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function svgPlay() { return '<svg viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21"/></svg>'; }
    function svgPause() { return '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>'; }
    function svgPrev() { return '<svg viewBox="0 0 24 24"><polygon points="12,3 2,12 12,21"/><rect x="14" y="3" width="8" height="18"/></svg>'; }
    function svgNext() { return '<svg viewBox="0 0 24 24"><polygon points="2,3 12,12 2,21"/><rect x="14" y="3" width="8" height="18"/></svg>'; }
    function svgVol() { return '<svg viewBox="0 0 24 24"><polygon points="3,9 7,9 12,4 12,20 7,15 3,15"/><path d="M16 9c1.5 1 1.5 5 0 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 7c2.5 2 2.5 8 0 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
    function svgMute() { return '<svg viewBox="0 0 24 24"><polygon points="3,9 7,9 12,4 12,20 7,15 3,15"/><line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
    function svgShuffle() { return '<svg viewBox="0 0 24 24"><path d="M3 17h2l4-8 4 8h2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 7h2l2 2-2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 7h2l8 10h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
    function svgRepeat() { return '<svg viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 11V9a4 4 0 014-4h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="7 23 3 19 7 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 13v2a4 4 0 01-4 4H3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
