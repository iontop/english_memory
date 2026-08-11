/**
 * English Memory Application Logic & Router
 */
const app = {
    // Active Application State
    state: {
        currentView: 'sets',
        wordSets: [],
        currentStudySetId: null,
        currentStudyWords: [],
        currentStudyIndex: 0,
        isFlipped: false,
        
        // Quiz State
        quizSetId: null,
        quizType: 'multiple', // 'multiple' | 'spelling' | 'listening'
        quizQuestions: [],
        quizCurrentIndex: 0,
        quizScore: 0,
        quizWrongWords: [],
        quizUserAnswer: null
    },

    // Initialize application
    init: function() {
        console.log("Initializing English Memory App with API:", API_BASE_URL);
        this.initTheme();
        this.checkServerHealth();
        this.loadWordSets();
        this.bindKeyboardShortcuts();
    },

    // Theme Switcher Engine (Light / Dark Mode)
    initTheme: function() {
        const savedTheme = localStorage.getItem("APP_THEME") || "light";
        this.setTheme(savedTheme);
    },

    toggleTheme: function() {
        const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        this.setTheme(newTheme);
    },

    setTheme: function(theme) {
        const icon = document.getElementById("theme-toggle-icon");
        const text = document.getElementById("theme-toggle-text");

        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("APP_THEME", "dark");
            if (icon) icon.textContent = "🌙";
            if (text) text.textContent = "다크 모드";
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("APP_THEME", "light");
            if (icon) icon.textContent = "☀️";
            if (text) text.textContent = "라이트 모드";
        }
    },

    // Check backend connection
    checkServerHealth: async function() {
        const dot = document.getElementById("server-status-dot");
        const text = document.getElementById("server-status-text");
        try {
            const res = await fetch(`${API_BASE_URL}/sets`);
            if (res.ok) {
                dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse";
                text.textContent = "연결됨";
            } else if (res.status === 502 || res.status === 503 || res.status === 504) {
                dot.className = "w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse";
                text.textContent = "서버 시작 중 (Cold Start)...";
                setTimeout(() => this.checkServerHealth(), 5000);
            } else {
                dot.className = "w-2.5 h-2.5 rounded-full bg-amber-500";
                text.textContent = `연결 상태 (${res.status})`;
            }
        } catch (e) {
            dot.className = "w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse";
            text.textContent = "서버 깨어나는 중...";
            setTimeout(() => this.checkServerHealth(), 5000);
        }
    },

    promptCustomServerUrl: function() {
        const currentUrl = localStorage.getItem("CUSTOM_API_BASE_URL") || API_BASE_URL;
        const newUrl = prompt("Render 백엔드 서버 URL을 입력하세요 (예: https://your-app.onrender.com):", currentUrl);
        if (newUrl !== null) {
            API_CONFIG.setBackendUrl(newUrl);
        }
    },

    // Navigation view router
    navigateTo: function(viewName) {
        this.state.currentView = viewName;
        ['sets', 'study', 'manager', 'quiz'].forEach(v => {
            const el = document.getElementById(`view-${v}`);
            const navBtn = document.getElementById(`nav-${v}`);
            if (v === viewName) {
                el.classList.remove('hidden');
                if (navBtn) {
                    navBtn.className = "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-slate-800 text-indigo-400";
                }
            } else {
                el.classList.add('hidden');
                if (navBtn) {
                    navBtn.className = "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-800 text-slate-400";
                }
            }
        });

        // View specific initializers
        if (viewName === 'sets') {
            this.loadWordSets();
        } else if (viewName === 'study') {
            this.populateSetDropdowns();
            if (this.state.wordSets.length > 0 && !this.state.currentStudySetId) {
                this.loadStudySet(this.state.wordSets[0].id);
            }
        } else if (viewName === 'manager') {
            this.populateSetDropdowns();
            const managerSelect = document.getElementById('manager-set-select');
            if (managerSelect && managerSelect.value) {
                this.loadManagerSetWords(managerSelect.value);
            }
        } else if (viewName === 'quiz') {
            this.populateSetDropdowns();
            document.getElementById('quiz-setup-card').classList.remove('hidden');
            document.getElementById('quiz-active-card').classList.add('hidden');
            document.getElementById('quiz-result-card').classList.add('hidden');
        }
    },

    // Toast message display
    showToast: function(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-rose-600' : type === 'success' ? 'bg-emerald-600' : 'bg-indigo-600';
        
        toast.className = `${bgColor} text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 flex items-center gap-2 pointer-events-auto`;
        toast.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i> <span>${message}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        }, 10);

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // ------------------ WORD SETS MANAGEMENT ------------------
    loadWordSets: async function() {
        try {
            const res = await fetch(`${API_BASE_URL}/sets`);
            if (!res.ok) throw new Error("단어 세트 목록 로드 실패");
            const sets = await res.json();
            this.state.wordSets = sets;
            this.renderWordSetsGrid(sets);
            this.populateSetDropdowns();
        } catch (err) {
            console.error(err);
            this.showToast("단어장 세트를 불러오지 못했습니다.", "error");
        }
    },

    renderWordSetsGrid: function(sets) {
        const grid = document.getElementById('sets-grid');
        const badge = document.getElementById('total-sets-badge');
        if (badge) badge.textContent = `${sets.length} 개`;

        if (!sets || sets.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12 glass-panel rounded-2xl space-y-3">
                    <i class="fa-solid fa-folder-open text-4xl text-slate-500"></i>
                    <p class="text-slate-400 font-medium">등록된 단어장이 없습니다.</p>
                    <button onclick="app.openCreateSetModal()" class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl font-semibold hover:bg-indigo-500 transition">
                        첫 단어장 만들기
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = sets.map(set => `
            <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300 shadow-xl group">
                <div class="space-y-3">
                    <div class="flex items-start justify-between">
                        <h3 class="text-xl font-bold text-white group-hover:text-indigo-400 transition">${this.escapeHtml(set.title)}</h3>
                        <span class="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                            ${set.word_count || 0} 단어
                        </span>
                    </div>
                    <p class="text-xs text-slate-400 line-clamp-2">${this.escapeHtml(set.description || "설명 없음")}</p>
                </div>

                <div class="pt-6 space-y-3">
                    <div class="flex gap-2">
                        <button onclick="app.selectSetAndStudy(${set.id})" class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-play"></i> 학습 시작
                        </button>
                        <button onclick="app.selectSetAndQuiz(${set.id})" class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-vial"></i> 테스트
                        </button>
                    </div>
                    <div class="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span><i class="fa-regular fa-clock mr-1"></i>${set.created_at ? set.created_at.split(' ')[0] : ''}</span>
                        <button onclick="app.deleteSet(${set.id}, '${this.escapeHtml(set.title)}')" class="hover:text-rose-400 transition" title="단어장 삭제">
                            <i class="fa-solid fa-trash-can"></i> 삭제
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    populateSetDropdowns: function() {
        const dropdowns = ['study-set-select', 'manager-set-select', 'quiz-set-select'];
        dropdowns.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const currentVal = el.value;
            el.innerHTML = this.state.wordSets.map(set => `
                <option value="${set.id}">${this.escapeHtml(set.title)} (${set.word_count || 0}단어)</option>
            `).join('');

            if (currentVal && Array.from(el.options).some(o => o.value === currentVal)) {
                el.value = currentVal;
            }
        });
    },

    openCreateSetModal: function() {
        document.getElementById('modal-create-set').classList.remove('hidden');
    },

    closeCreateSetModal: function() {
        document.getElementById('modal-create-set').classList.add('hidden');
        document.getElementById('modal-input-title').value = '';
        document.getElementById('modal-input-desc').value = '';
    },

    handleCreateSetSubmit: async function(e) {
        e.preventDefault();
        const title = document.getElementById('modal-input-title').value.trim();
        const description = document.getElementById('modal-input-desc').value.trim();
        if (!title) return;

        try {
            const res = await fetch(`${API_BASE_URL}/sets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            });

            if (!res.ok) throw new Error("생성 실패");
            this.showToast("새 단어장이 성공적으로 생성되었습니다!", "success");
            this.closeCreateSetModal();
            this.loadWordSets();
        } catch (err) {
            this.showToast("단어장 생성 중 오류가 발생했습니다.", "error");
        }
    },

    deleteSet: async function(setId, title) {
        if (!confirm(`정말로 단어장 '${title}'을(를) 삭제하시겠습니까?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/sets/${setId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("삭제 실패");
            this.showToast("단어장이 삭제되었습니다.", "success");
            this.loadWordSets();
        } catch (err) {
            this.showToast("단어장 삭제에 실패했습니다.", "error");
        }
    },

    selectSetAndStudy: function(setId) {
        this.state.currentStudySetId = setId;
        const select = document.getElementById('study-set-select');
        if (select) select.value = setId;
        this.navigateTo('study');
        this.loadStudySet(setId);
    },

    selectSetAndQuiz: function(setId) {
        this.state.quizSetId = setId;
        const select = document.getElementById('quiz-set-select');
        if (select) select.value = setId;
        this.navigateTo('quiz');
    },


    // ------------------ FLASHCARD STUDY ENGINE ------------------
    loadStudySet: async function(setId) {
        if (!setId) return;
        this.state.currentStudySetId = setId;
        try {
            const res = await fetch(`${API_BASE_URL}/sets/${setId}/words`);
            if (!res.ok) throw new Error("단어 목록 조회 실패");
            const data = await res.json();
            
            document.getElementById('study-set-title').textContent = data.title;
            document.getElementById('study-set-desc').textContent = data.description || "플래시카드를 클릭하여 한글 뜻을 확인하세요.";
            
            this.state.currentStudyWords = data.words || [];
            this.state.currentStudyIndex = 0;
            this.state.isFlipped = false;
            
            this.renderCurrentCard();
        } catch (err) {
            this.showToast("학습 단어를 불러오지 못했습니다.", "error");
        }
    },

    renderCurrentCard: function() {
        const words = this.state.currentStudyWords;
        const idx = this.state.currentStudyIndex;
        const counter = document.getElementById('study-progress-counter');
        const progressBar = document.getElementById('study-progress-bar');
        const inner = document.getElementById('flashcard-inner');

        // Reset flip state
        this.state.isFlipped = false;
        if (inner) inner.classList.remove('is-flipped');

        if (!words || words.length === 0) {
            counter.textContent = '0 / 0';
            progressBar.style.width = '0%';
            document.getElementById('card-word').textContent = '등록된 단어 없음';
            document.getElementById('card-phonetic').textContent = '';
            document.getElementById('card-meaning').textContent = '단어 관리에 단어를 추가해주세요.';
            document.getElementById('card-ex-en').textContent = '';
            document.getElementById('card-ex-kr').textContent = '';
            return;
        }

        const wordObj = words[idx];
        counter.textContent = `${idx + 1} / ${words.length}`;
        progressBar.style.width = `${((idx + 1) / words.length) * 100}%`;

        document.getElementById('card-word').textContent = wordObj.word;
        document.getElementById('card-phonetic').textContent = wordObj.phonetic || '';
        document.getElementById('card-meaning').textContent = wordObj.meaning || '뜻 정보 없음';
        document.getElementById('card-ex-en').textContent = wordObj.example_en ? `"${wordObj.example_en}"` : '';
        document.getElementById('card-ex-kr').textContent = wordObj.example_kr ? `"${wordObj.example_kr}"` : '';
    },

    flipCard: function() {
        if (!this.state.currentStudyWords || this.state.currentStudyWords.length === 0) return;
        this.state.isFlipped = !this.state.isFlipped;
        const inner = document.getElementById('flashcard-inner');
        if (inner) {
            inner.classList.toggle('is-flipped', this.state.isFlipped);
        }
    },

    nextCard: function() {
        if (!this.state.currentStudyWords || this.state.currentStudyWords.length === 0) return;
        if (this.state.currentStudyIndex < this.state.currentStudyWords.length - 1) {
            this.state.currentStudyIndex++;
            this.renderCurrentCard();
        } else {
            this.showToast("마지막 단어입니다!", "info");
        }
    },

    prevCard: function() {
        if (!this.state.currentStudyWords || this.state.currentStudyWords.length === 0) return;
        if (this.state.currentStudyIndex > 0) {
            this.state.currentStudyIndex--;
            this.renderCurrentCard();
        }
    },

    shuffleStudyWords: function() {
        if (!this.state.currentStudyWords || this.state.currentStudyWords.length <= 1) return;
        for (let i = this.state.currentStudyWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.state.currentStudyWords[i], this.state.currentStudyWords[j]] = [this.state.currentStudyWords[j], this.state.currentStudyWords[i]];
        }
        this.state.currentStudyIndex = 0;
        this.renderCurrentCard();
        this.showToast("단어 순서를 섞었습니다.", "info");
    },

    playCurrentWordAudio: function() {
        const words = this.state.currentStudyWords;
        const idx = this.state.currentStudyIndex;
        if (!words || !words[idx]) return;

        const audioUrl = words[idx].audio_url;
        const wordText = words[idx].word;

        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play().catch(e => {
                this.playWebSpeechFallback(wordText);
            });
        } else {
            this.playWebSpeechFallback(wordText);
        }
    },

    playWebSpeechFallback: function(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    },

    bindKeyboardShortcuts: function() {
        window.addEventListener('keydown', (e) => {
            if (this.state.currentView !== 'study') return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'ArrowRight') {
                this.nextCard();
            } else if (e.key === 'ArrowLeft') {
                this.prevCard();
            } else if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                this.flipCard();
            }
        });
    },


    // ------------------ WORD MANAGER & AUTO COLLECTOR ------------------
    loadManagerSetWords: async function(setId) {
        if (!setId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/sets/${setId}/words`);
            if (!res.ok) throw new Error("단어 로드 실패");
            const data = await res.json();
            
            document.getElementById('manager-current-set-title').textContent = data.title;
            document.getElementById('manager-words-count-badge').textContent = `${data.words.length}개`;
            
            const listEl = document.getElementById('manager-words-list');
            if (data.words.length === 0) {
                listEl.innerHTML = '<p class="text-center text-slate-500 text-sm py-8">선택된 세트에 등록된 단어가 없습니다.</p>';
                return;
            }

            listEl.innerHTML = data.words.map(w => `
                <div class="py-4 flex items-center justify-between gap-4">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="text-base font-bold text-white">${this.escapeHtml(w.word)}</span>
                            <span class="text-xs font-mono text-slate-400">${this.escapeHtml(w.phonetic || '')}</span>
                            ${w.audio_url ? `<button onclick="app.playAudioUrl('${w.audio_url}', '${w.word}')" class="text-indigo-400 hover:text-indigo-300"><i class="fa-solid fa-volume-low"></i></button>` : ''}
                        </div>
                        <p class="text-xs text-indigo-300 font-medium">${this.escapeHtml(w.meaning)}</p>
                        ${w.example_en ? `<p class="text-xs text-slate-400 italic">"${this.escapeHtml(w.example_en)}" - ${this.escapeHtml(w.example_kr || '')}</p>` : ''}
                    </div>
                    <button onclick="app.removeWordFromSet(${setId}, ${w.id}, '${this.escapeHtml(w.word)}')" class="text-slate-500 hover:text-rose-400 transition p-2" title="세트에서 제외">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `).join('');

        } catch (err) {
            this.showToast("단어 목록을 가져오지 못했습니다.", "error");
        }
    },

    handleAutoAddWord: async function(e) {
        e.preventDefault();
        const setSelect = document.getElementById('manager-set-select');
        const wordInput = document.getElementById('input-word-text');
        const spinner = document.getElementById('spinner-auto-add');
        const btn = document.getElementById('btn-auto-add');

        const setId = setSelect.value;
        const word = wordInput.value.trim();

        if (!setId || !word) {
            this.showToast("단어장 세트와 영단어를 모두 입력해주세요.", "error");
            return;
        }

        spinner.classList.remove('hidden');
        btn.disabled = true;

        try {
            const res = await fetch(`${API_BASE_URL}/words/auto-add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ set_id: parseInt(setId), word: word })
            });

            if (!res.ok) throw new Error("자동 수집 및 등록 실패");
            const data = await res.json();

            this.showToast(`'${word}' 단어가 세트에 성공적으로 등록되었습니다!`, "success");
            wordInput.value = '';
            this.loadManagerSetWords(setId);
            this.loadWordSets(); // Update count badge on dashboard
        } catch (err) {
            this.showToast("단어 자동 수집 실패. 네트워크 연결 상태를 확인해주세요.", "error");
        } finally {
            spinner.classList.add('hidden');
            btn.disabled = false;
        }
    },

    removeWordFromSet: async function(setId, wordId, wordName) {
        if (!confirm(`'${wordName}' 단어를 이 세트에서 제외하시겠습니까?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/sets/${setId}/words/${wordId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("삭제 실패");
            this.showToast("단어가 세트에서 제외되었습니다.", "success");
            this.loadManagerSetWords(setId);
            this.loadWordSets();
        } catch (err) {
            this.showToast("단어 삭제에 실패했습니다.", "error");
        }
    },

    playAudioUrl: function(url, text) {
        if (url) {
            const audio = new Audio(url);
            audio.play().catch(e => this.playWebSpeechFallback(text));
        } else {
            this.playWebSpeechFallback(text);
        }
    },


    // ------------------ QUIZ ENGINE & TESTING SUITE ------------------
    startQuiz: async function() {
        const setSelect = document.getElementById('quiz-set-select');
        const selectedType = document.querySelector('input[name="quiz-type"]:checked').value;
        const setId = setSelect.value;

        if (!setId) {
            this.showToast("테스트할 단어장을 선택해주세요.", "error");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/sets/${setId}/words`);
            if (!res.ok) throw new Error("단어 로드 실패");
            const data = await res.json();
            const words = data.words || [];

            if (words.length < 2) {
                this.showToast("테스트 진행을 위해 최소 2개 이상의 단어가 필요합니다.", "error");
                return;
            }

            this.state.quizSetId = setId;
            this.state.quizType = selectedType;
            this.state.quizQuestions = [...words].sort(() => 0.5 - Math.random());
            this.state.quizCurrentIndex = 0;
            this.state.quizScore = 0;
            this.state.quizWrongWords = [];

            document.getElementById('quiz-setup-card').classList.add('hidden');
            document.getElementById('quiz-result-card').classList.add('hidden');
            document.getElementById('quiz-active-card').classList.remove('hidden');

            this.renderQuizQuestion();
        } catch (err) {
            this.showToast("퀴즈 정보를 불러오지 못했습니다.", "error");
        }
    },

    renderQuizQuestion: function() {
        const questions = this.state.quizQuestions;
        const idx = this.state.quizCurrentIndex;
        const q = questions[idx];
        const type = this.state.quizType;

        document.getElementById('quiz-mode-badge').textContent = 
            type === 'multiple' ? '객관식 퀴즈' : type === 'spelling' ? '주관식 퀴즈' : '듣기 테스트';
        document.getElementById('quiz-question-counter').textContent = `문제 ${idx + 1} / ${questions.length}`;

        const promptEl = document.getElementById('quiz-prompt-text');
        const audioBtn = document.getElementById('quiz-audio-btn');
        const container = document.getElementById('quiz-answers-container');
        this.state.quizUserAnswer = null;

        if (type === 'multiple') {
            audioBtn.classList.add('hidden');
            promptEl.textContent = q.word;

            // Generate 4 multiple choices (1 correct + 3 distractor choices)
            const allWords = this.state.quizQuestions;
            const distractors = allWords.filter(w => w.id !== q.id).sort(() => 0.5 - Math.random()).slice(0, 3);
            const options = [q, ...distractors].sort(() => 0.5 - Math.random());

            container.innerHTML = options.map((opt, i) => `
                <button onclick="app.selectQuizOption(this, '${this.escapeHtml(opt.meaning)}')" class="quiz-option-btn w-full p-4 rounded-xl border border-slate-700 bg-slate-900/80 hover:border-indigo-500 text-left transition font-medium text-slate-200 flex items-center gap-3">
                    <span class="w-7 h-7 rounded-lg bg-slate-800 text-indigo-400 font-bold text-xs flex items-center justify-center border border-slate-700">${i + 1}</span>
                    <span>${this.escapeHtml(opt.meaning)}</span>
                </button>
            `).join('');

        } else if (type === 'spelling') {
            audioBtn.classList.add('hidden');
            promptEl.textContent = q.meaning;

            container.innerHTML = `
                <div class="space-y-2">
                    <label class="block text-xs text-slate-400">알맞은 영단어 스펠링을 입력하세요</label>
                    <input type="text" id="quiz-spelling-input" placeholder="영단어 입력..." autocomplete="off" class="w-full bg-slate-900 border border-slate-700 text-white text-base rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                </div>
            `;
        } else if (type === 'listening') {
            audioBtn.classList.remove('hidden');
            promptEl.textContent = "🔊 음성을 듣고 스펠링을 입력하세요";
            this.playQuizAudio();

            container.innerHTML = `
                <div class="space-y-2">
                    <label class="block text-xs text-slate-400">듣고 알맞은 영단어를 작성하세요</label>
                    <input type="text" id="quiz-spelling-input" placeholder="영단어 입력..." autocomplete="off" class="w-full bg-slate-900 border border-slate-700 text-white text-base rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                </div>
            `;
        }
    },

    selectQuizOption: function(btnEl, meaningVal) {
        document.querySelectorAll('.quiz-option-btn').forEach(b => {
            b.classList.remove('border-indigo-500', 'bg-indigo-950/50');
        });
        btnEl.classList.add('border-indigo-500', 'bg-indigo-950/50');
        this.state.quizUserAnswer = meaningVal;
    },

    playQuizAudio: function() {
        const q = this.state.quizQuestions[this.state.quizCurrentIndex];
        if (q) {
            this.playAudioUrl(q.audio_url, q.word);
        }
    },

    submitQuizAnswer: function() {
        const q = this.state.quizQuestions[this.state.quizCurrentIndex];
        const type = this.state.quizType;
        let isCorrect = false;

        if (type === 'multiple') {
            if (!this.state.quizUserAnswer) {
                this.showToast("정답 항목을 선택해주세요.", "error");
                return;
            }
            isCorrect = (this.state.quizUserAnswer === q.meaning);
        } else {
            const inputEl = document.getElementById('quiz-spelling-input');
            const userVal = inputEl ? inputEl.value.trim().toLowerCase() : '';
            if (!userVal) {
                this.showToast("단어를 입력해주세요.", "error");
                return;
            }
            isCorrect = (userVal === q.word.trim().toLowerCase());
        }

        if (isCorrect) {
            this.state.quizScore++;
            this.showToast("정답입니다! 🎉", "success");
        } else {
            this.state.quizWrongWords.push(q);
            this.showToast(`오답입니다! 정답: ${q.word} (${q.meaning})`, "error");
        }

        this.state.quizCurrentIndex++;
        if (this.state.quizCurrentIndex < this.state.quizQuestions.length) {
            this.renderQuizQuestion();
        } else {
            this.showQuizResult();
        }
    },

    showQuizResult: function() {
        document.getElementById('quiz-active-card').classList.add('hidden');
        document.getElementById('quiz-result-card').classList.remove('hidden');

        const total = this.state.quizQuestions.length;
        const score = this.state.quizScore;
        const pct = Math.round((score / total) * 100);

        const badgeEl = document.getElementById('result-badge-text');
        if (badgeEl) {
            if (pct === 100) badgeEl.textContent = '🎀 완벽해요! 100점 마스터! ✨';
            else if (pct >= 80) badgeEl.textContent = '💖 훌륭해요! 상위 1% 달성!';
            else badgeEl.textContent = '✨ 틀린 단어를 다시 복습해봐요!';
        }

        document.getElementById('result-score-text').textContent = `${pct}점 (${score} / ${total})`;
        document.getElementById('result-summary-detail').textContent = `${total} 문제 중 ${score} 문제를 맞추셨습니다!`;

        const wrongSec = document.getElementById('wrong-words-section');
        const wrongList = document.getElementById('wrong-words-list');
        const btnReview = document.getElementById('btn-review-wrong');

        if (this.state.quizWrongWords.length > 0) {
            wrongSec.classList.remove('hidden');
            btnReview.classList.remove('hidden');
            wrongList.innerHTML = this.state.quizWrongWords.map(w => `
                <div class="py-2.5 flex items-center justify-between">
                    <div>
                        <span class="font-bold text-white mr-2">${this.escapeHtml(w.word)}</span>
                        <span class="text-xs text-slate-400 font-mono">${this.escapeHtml(w.phonetic || '')}</span>
                        <p class="text-xs text-indigo-300">${this.escapeHtml(w.meaning)}</p>
                    </div>
                    <button onclick="app.playAudioUrl('${w.audio_url}', '${w.word}')" class="text-indigo-400 hover:text-indigo-300 p-2"><i class="fa-solid fa-volume-high"></i></button>
                </div>
            `).join('');
        } else {
            wrongSec.classList.add('hidden');
            btnReview.classList.add('hidden');
        }
    },

    startWrongWordsQuiz: function() {
        if (this.state.quizWrongWords.length === 0) return;
        this.state.quizQuestions = [...this.state.quizWrongWords];
        this.state.quizCurrentIndex = 0;
        this.state.quizScore = 0;
        this.state.quizWrongWords = [];

        document.getElementById('quiz-result-card').classList.add('hidden');
        document.getElementById('quiz-active-card').classList.remove('hidden');

        this.renderQuizQuestion();
    },

    // Utility HTML Escaping
    escapeHtml: function(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

// Initialize App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
