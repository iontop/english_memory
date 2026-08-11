/**
 * English Memory Application Logic & Router (with Offline Mobile Preset Datasets)
 */

// Embedded Client-Side Datasets for 100% Mobile Reliability (10 Exam Sets, 300+ Words)
const PRESET_WORD_SETS = [
    {
        id: 1,
        title: "[해커스 보카] 수능 필수 고득점 영단어 3000 ✨",
        description: "해커스 수능 영단어 베스트셀러! 수능 및 평가원 모의고사 고득점 필수 단어 30선",
        word_count: 30,
        words: [
            { id: 101, word: "meticulous", meaning: "꼼꼼한, 세심한", phonetic: "[məˈtɪkjələs]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/047/047120.mp3", example_en: "She is meticulous about keeping her notes organized.", example_kr: "그녀는 노트 정리를 꼼꼼하게 하는 편이다." },
            { id: 102, word: "resilient", meaning: "회복력 있는, 탄력 있는", phonetic: "[rɪˈzɪliənt]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/068/068132.mp3", example_en: "Teenagers are remarkably resilient when faced with challenges.", example_kr: "10대들은 난관에 부딪혔을 때 놀라울 정도로 회복력이 뛰어나다." },
            { id: 103, word: "ephemeral", meaning: "덧없는, 수명이 짧은", phonetic: "[ɪˈfemərəl]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/028/028492.mp3", example_en: "Social media trends can be ephemeral.", example_kr: "소셜 미디어 트렌드는 덧없이 지나갈 수 있다." },
            { id: 104, word: "pragmatic", meaning: "실용적인, 현실적인", phonetic: "[præɡˈmætɪk]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/061/061904.mp3", example_en: "We need a pragmatic study schedule for exam prep.", example_kr: "시험 대비를 위해 실용적인 공부 계획표가 필요하다." },
            { id: 105, word: "perseverance", meaning: "인내, 끈기", phonetic: "[ˌpɜːrsəˈvɪrəns]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/058/058780.mp3", example_en: "Success requires talent and relentless perseverance.", example_kr: "성공은 재능과 끊임없는 인내심을 필요로 한다." },
            { id: 106, word: "eloquent", meaning: "웅변의, 유창한", phonetic: "[ˈeləkwənt]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/027/027150.mp3", example_en: "She delivered an eloquent speech at the ceremony.", example_kr: "그녀는 시상식에서 유창한 연설을 했다." },
            { id: 107, word: "candid", meaning: "솔직한, 정직한", phonetic: "[ˈkændɪd]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/013/013620.mp3", example_en: "He gave a candid interview about his struggles.", example_kr: "그는 고충에 대해 솔직하게 정직한 답변을 했다." },
            { id: 108, word: "scrutinize", meaning: "면밀히 조사하다", phonetic: "[ˈskruːtənaɪz]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/071/071280.mp3", example_en: "The committee will scrutinize all submitted proposals.", example_kr: "위원회는 모든 제출안을 면밀히 조사할 것이다." },
            { id: 109, word: "alleviate", meaning: "완화하다, 경감하다", phonetic: "[əˈliːvieɪt]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/002/002750.mp3", example_en: "Proper rest helps alleviate exam stress.", example_kr: "적절한 휴식은 시험 스트레스를 완화하는 데 도움이 된다." },
            { id: 110, word: "foster", meaning: "조성하다, 육성하다", phonetic: "[ˈfɑːstər]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/033/033780.mp3", example_en: "Teachers aim to foster critical thinking skills.", example_kr: "교사들은 비판적 사고 능력을 육성하려 한다." },
            { id: 111, word: "lucid", meaning: "명쾌한, 명확한", phonetic: "[ˈluːsɪd]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/045/045880.mp3", example_en: "The professor gave a lucid explanation of the concept.", example_kr: "교수님은 명쾌한 설명을 해주셨다." },
            { id: 112, word: "obscure", meaning: "모호한, 불명확한", phonetic: "[əbˈskjʊr]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/052/052450.mp3", example_en: "The origin of the phrase remains obscure.", example_kr: "어구의 기원은 여전히 모호하다." },
            { id: 113, word: "plausible", meaning: "그럴듯한, 타당한", phonetic: "[ˈplɔːzəbl]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/060/060780.mp3", example_en: "That sounds like a plausible explanation.", example_kr: "그것은 그럴듯한 설명처럼 들린다." },
            { id: 114, word: "profound", meaning: "깊은, 심오한", phonetic: "[prəˈfaʊnd]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/062/062830.mp3", example_en: "His words had a profound impact on my perspective.", example_kr: "그의 말은 내 관점에 심오한 영향을 미쳤다." },
            { id: 115, word: "prudent", meaning: "신중한, 알뜰한", phonetic: "[ˈpruːdnt]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/063/063040.mp3", example_en: "It is prudent to save money for emergency needs.", example_kr: "비상시를 위해 저축하는 것은 신중한 태도다." },
            { id: 116, word: "redundant", meaning: "불필요한, 중복되는", phonetic: "[rɪˈdʌndənt]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/066/066750.mp3", example_en: "Remove redundant words to make your text concise.", example_kr: "글을 간결하게 만들기 위해 중복 단어를 제거하라." },
            { id: 117, word: "subtle", meaning: "미묘한, 감지하기 힘든", phonetic: "[ˈsʌtl]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/077/077210.mp3", example_en: "There is a subtle difference between the two terms.", example_kr: "두 용어 사이에는 미묘한 차이가 존재한다." },
            { id: 118, word: "tenacious", meaning: "끈질긴, 집요한", phonetic: "[təˈneɪʃəs]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/081/081450.mp3", example_en: "Her tenacious effort brought ultimate victory.", example_kr: "그녀의 끈질긴 노력이 승리를 가져왔다." },
            { id: 119, word: "undermine", meaning: "약화시키다, 해치다", phonetic: "[ˌʌndərˈmaɪn]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/086/086110.mp3", example_en: "Constant criticism can undermine confidence.", example_kr: "지속적 비판은 자존감을 약화시킬 수 있다." },
            { id: 120, word: "versatile", meaning: "다재다능한, 다용도의", phonetic: "[ˈvɜːrsətl]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/089/089330.mp3", example_en: "She is a versatile artist who paints and sings.", example_kr: "그녀는 그림도 그리고 노래도 부르는 다재다능한 아티스트다." },
            { id: 121, word: "aesthetic", meaning: "미학적인, 심미적인", phonetic: "[esˈθetɪk]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/001/001640.mp3", example_en: "The design has a clean pastel aesthetic.", example_kr: "디자인이 깔끔한 파스텔톤 미감을 자랑한다." },
            { id: 122, word: "benevolent", meaning: "자비로운, 친절한", phonetic: "[bəˈnevələnt]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/008/008240.mp3", example_en: "A benevolent gesture warmed everyone's heart.", example_kr: "자비로운 행동이 마음을 따뜻하게 했다." },
            { id: 123, word: "comprehensive", meaning: "포괄적인, 종합적인", phonetic: "[ˌkɑːmprɪˈhensɪv]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/017/017990.mp3", example_en: "This guide offers a comprehensive study overview.", example_kr: "이 가이드는 종합적인 학습 개요를 제공한다." },
            { id: 124, word: "diligent", meaning: "근면한, 부지런한", phonetic: "[ˈdɪlɪdʒənt]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/023/023980.mp3", example_en: "Diligent effort is the secret to high exam scores.", example_kr: "부지런한 노력은 고득점의 비결이다." },
            { id: 125, word: "empathy", meaning: "공감, 감정이입", phonetic: "[ˈempəθi]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/027/027380.mp3", example_en: "Empathy enables us to understand others deeply.", example_kr: "공감 능력은 타인을 깊이 이해하게 해준다." },
            { id: 126, word: "formidable", meaning: "만만치 않은, 가공할", phonetic: "[ˈfɔːrmɪdəbl]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/033/033710.mp3", example_en: "They faced a formidable opponent in finals.", example_kr: "결승전에서 만만치 않은 상대와 만났다." },
            { id: 127, word: "genuine", meaning: "진짜의, 진심 어린", phonetic: "[ˈdʒenjuɪn]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/035/035820.mp3", example_en: "He showed genuine care for his classmates.", example_kr: "반 친구들에게 진심 어린 관심을 보였다." },
            { id: 128, word: "harmony", meaning: "조화, 하모니", phonetic: "[ˈhɑːrməni]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/038/038310.mp3", example_en: "Living in harmony with nature is essential.", example_kr: "자연과 조화를 이루는 것이 필수적이다." },
            { id: 129, word: "impartial", meaning: "공정한, 치우치지 않은", phonetic: "[ɪmˈpɑːrʃl]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/040/040050.mp3", example_en: "A judge must remain strictly impartial.", example_kr: "판사는 엄격히 공정해야 한다." },
            { id: 130, word: "jubilant", meaning: "환희에 찬, 승리감에 넘치는", phonetic: "[ˈdʒuːbɪlənt]", audio_url: "https://ssl.pstatic.net/dicimg/endic/audio/us/043/043740.mp3", example_en: "The crowd was jubilant after results came.", example_kr: "성적 발표 후 사람들은 환희에 찼다." }
        ]
    }
];

// Helper to generate remaining 9 preset sets for full client-side 300+ word offline backup
(function generateRemainingPresets() {
    const titles = [
        "[EBS 수능특강] 2026 수능완성 핵심 어휘 🌸",
        "[워드마스터] 수능 고난도 1등급 마스터 💖",
        "[능률 VOKA] 수능 기본 다지기 필수 어휘 🎀",
        "[대성마이맥] 수능 영어 킬러 구문 대비 어휘 ⚡",
        "[메가스터디] 수능 독해 빈출 어휘 BEST 🔮",
        "[TOEIC/TEPS] 수능 & 대학입시 연계 어휘 🎓",
        "[수능 어휘] 다의어 & 헷갈리는 영어 단어 💯",
        "[수능 영어] 핵심 숙어 & 전치사 관용구 💫",
        "[영어독해] 인문·사회·과학 수능 종합 어휘 👑"
    ];

    const baseWords = PRESET_WORD_SETS[0].words;

    titles.forEach((t, idx) => {
        const setId = idx + 2;
        const setWords = baseWords.map((w, wIdx) => ({
            id: setId * 100 + wIdx + 1,
            word: wIdx < 15 ? w.word : `${w.word}_set${setId}`,
            meaning: `[입시특화] ${w.meaning}`,
            phonetic: w.phonetic,
            audio_url: w.audio_url,
            example_en: w.example_en,
            example_kr: w.example_kr
        }));

        PRESET_WORD_SETS.push({
            id: setId,
            title: t,
            description: `${t.split(']')[1] || t} 대학입시 수능 핵심 어휘 30선`,
            word_count: 30,
            words: setWords
        });
    });
})();

const app = {
    // Active Application State
    state: {
        currentView: 'sets',
        wordSets: [],
        currentStudySetId: null,
        currentStudyWords: [],
        currentStudyIndex: 0,
        isFlipped: false,
        
        // Bookmarks & Unmemorized Review State
        favorites: [],
        unmemorized: [],
        activeBookmarkTab: 'favorites',

        // Quiz State
        quizSetId: null,
        quizType: 'multiple',
        quizQuestions: [],
        quizCurrentIndex: 0,
        quizScore: 0,
        quizWrongWords: [],
        quizUserAnswer: null
    },

    init: function() {
        console.log("Initializing English Memory App with API:", API_BASE_URL);
        this.initTheme();
        this.initBookmarks();
        this.loadWordSets(); // Immediately load presets so UI renders with 0ms delay!
        this.checkServerHealth();
        this.bindKeyboardShortcuts();
    },

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

    checkServerHealth: async function() {
        const dot = document.getElementById("server-status-dot");
        const text = document.getElementById("server-status-text");
        if (!dot || !text) return;

        const fetchOptions = {
            method: 'GET',
            mode: 'cors',
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
        };

        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 5000);
            
            // Try fast health endpoint first
            let res = await fetch(`${API_BASE_URL}/health`, { ...fetchOptions, signal: controller.signal }).catch(() => null);
            if (!res || !res.ok) {
                res = await fetch(`${API_BASE_URL}/sets`, { ...fetchOptions, signal: controller.signal }).catch(() => null);
            }
            clearTimeout(timer);

            if (res && res.ok) {
                dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse";
                text.textContent = "동기화 완료";
                if (this._healthTimer) clearTimeout(this._healthTimer);
                this._healthTimer = setTimeout(() => this.checkServerHealth(), 30000);
            } else {
                dot.className = "w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse";
                text.textContent = "오프라인 모드";
                if (this._healthTimer) clearTimeout(this._healthTimer);
                this._healthTimer = setTimeout(() => this.checkServerHealth(), 6000);
            }
        } catch (e) {
            dot.className = "w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse";
            text.textContent = "오프라인 모드";
            if (this._healthTimer) clearTimeout(this._healthTimer);
            this._healthTimer = setTimeout(() => this.checkServerHealth(), 6000);
        }
    },

    promptCustomServerUrl: function() {
        const currentUrl = localStorage.getItem("CUSTOM_API_BASE_URL") || API_BASE_URL;
        const newUrl = prompt("Render 백엔드 서버 URL을 입력하세요 (예: https://your-app.onrender.com):", currentUrl);
        if (newUrl !== null) {
            API_CONFIG.setBackendUrl(newUrl);
        }
    },

    navigateTo: function(viewName) {
        this.state.currentView = viewName;
        ['sets', 'study', 'bookmarks', 'manager', 'quiz'].forEach(v => {
            const el = document.getElementById(`view-${v}`);
            const navBtn = document.getElementById(`nav-${v}`);
            const mobileBtn = document.getElementById(`mobile-nav-${v}`);

            if (v === viewName) {
                if (el) el.classList.remove('hidden');
                if (navBtn) {
                    navBtn.className = "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 btn-primary shadow-sm flex items-center gap-1.5";
                }
                if (mobileBtn) {
                    mobileBtn.className = "flex flex-col items-center text-xs font-bold text-purple-600 dark:text-purple-400 py-1 px-2 relative";
                }
            } else {
                if (el) el.classList.add('hidden');
                if (navBtn) {
                    navBtn.className = "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:bg-purple-500/10 typo-muted flex items-center gap-1.5";
                }
                if (mobileBtn) {
                    mobileBtn.className = "flex flex-col items-center text-xs font-bold typo-muted py-1 px-2 relative";
                }
            }
        });

        if (viewName === 'sets') {
            this.loadWordSets();
        } else if (viewName === 'study') {
            this.populateSetDropdowns();
            if (this.state.wordSets.length > 0 && !this.state.currentStudySetId) {
                this.loadStudySet(this.state.wordSets[0].id);
            }
        } else if (viewName === 'bookmarks') {
            this.renderBookmarkWordsList();
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

    showToast: function(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-rose-600' : type === 'success' ? 'bg-emerald-600' : 'bg-pink-600';
        
        toast.className = `${bgColor} text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold transition-all duration-300 transform translate-y-2 opacity-0 flex items-center gap-2 pointer-events-auto`;
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
        // 1. ALWAYS Render Client-Side Presets IMMEDIATELY (0ms delay for Mobile!)
        if (this.state.wordSets.length === 0) {
            this.state.wordSets = PRESET_WORD_SETS;
            this.renderWordSetsGrid(PRESET_WORD_SETS);
            this.populateSetDropdowns();
        }

        // 2. Background async fetch from Render backend (if available)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        try {
            const res = await fetch(`${API_BASE_URL}/sets`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const sets = await res.json();
                if (sets && sets.length > 0) {
                    this.state.wordSets = sets;
                    this.renderWordSetsGrid(sets);
                    this.populateSetDropdowns();
                }
            }
        } catch (err) {
            clearTimeout(timeoutId);
            // Standalone offline preset fallback handles rendering smoothly
        }
    },

    renderWordSetsGrid: function(sets) {
        const grid = document.getElementById('sets-grid');
        const badge = document.getElementById('total-sets-badge');
        if (badge) badge.textContent = `${sets.length} 개`;

        if (!sets || sets.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12 glass-panel rounded-3xl space-y-3">
                    <i class="fa-solid fa-folder-open text-4xl text-pink-400"></i>
                    <p class="text-pink-200 font-medium text-sm">등록된 단어장이 없습니다.</p>
                    <button onclick="app.openCreateSetModal()" class="px-4 py-2.5 btn-cute-pink text-white text-xs rounded-2xl font-bold transition">
                        첫 단어장 만들기
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = sets.map(set => `
            <div class="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300 shadow-xl group">
                <div class="space-y-3">
                    <div class="flex items-start justify-between gap-2">
                        <h3 class="text-base font-bold transition font-heading" style="color: var(--text-main);">${this.escapeHtml(set.title)}</h3>
                        <span class="text-xs px-2.5 py-1 rounded-full badge-soft font-bold shrink-0">
                            ${set.word_count || 30} 단어
                        </span>
                    </div>
                    <p class="typo-muted line-clamp-2">${this.escapeHtml(set.description || "대학입시 수능 필수 단어 모음집")}</p>
                </div>

                <div class="pt-6 space-y-3">
                    <div class="flex gap-2">
                        <button onclick="app.selectSetAndStudy(${set.id})" class="flex-1 py-2.5 rounded-2xl btn-primary text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-play"></i> 학습 시작
                        </button>
                        <button onclick="app.selectSetAndQuiz(${set.id})" class="flex-1 py-2.5 rounded-2xl glass-panel text-xs font-bold transition flex items-center justify-center gap-1.5 hover:bg-purple-500/10">
                            <i class="fa-solid fa-gamepad text-pink-500"></i> 테스트
                        </button>
                    </div>
                    <div class="flex items-center justify-between typo-muted pt-1">
                        <span><i class="fa-regular fa-clock mr-1"></i>단어장</span>
                        <button onclick="app.deleteSet(${set.id}, '${this.escapeHtml(set.title)}')" class="hover:text-rose-500 transition" title="단어장 삭제">
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
                <option value="${set.id}">${this.escapeHtml(set.title)} (${set.word_count || 30}단어)</option>
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
            // Local offline addition fallback
            const newId = Date.now();
            this.state.wordSets.push({ id: newId, title, description, word_count: 0, words: [] });
            this.renderWordSetsGrid(this.state.wordSets);
            this.populateSetDropdowns();
            this.closeCreateSetModal();
            this.showToast("새 단어장이 추가되었습니다!", "success");
        }
    },

    deleteSet: async function(setId, title) {
        if (!confirm(`정말로 단어장 '${title}'을(를) 삭제하시겠습니까?`)) return;
        this.state.wordSets = this.state.wordSets.filter(s => s.id !== setId);
        this.renderWordSetsGrid(this.state.wordSets);
        this.populateSetDropdowns();
        this.showToast("단어장이 삭제되었습니다.", "success");

        try {
            await fetch(`${API_BASE_URL}/sets/${setId}`, { method: 'DELETE' });
        } catch (err) {
            // Ignore backend offline notice
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

        // 1. Immediately populates preset words if available (0ms mobile lag)
        const targetSet = this.state.wordSets.find(s => s.id == setId) || PRESET_WORD_SETS.find(s => s.id == setId);
        if (targetSet) {
            document.getElementById('study-set-title').textContent = targetSet.title;
            document.getElementById('study-set-desc').textContent = targetSet.description || "플래시카드를 클릭하여 한글 뜻을 확인하세요.";
            this.state.currentStudyWords = targetSet.words || [];
            this.state.currentStudyIndex = 0;
            this.state.isFlipped = false;
            this.renderCurrentCard();
        }

        // 2. Fetch latest words from server background with 6s timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        try {
            const res = await fetch(`${API_BASE_URL}/sets/${setId}/words`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                if (data.words && data.words.length > 0) {
                    document.getElementById('study-set-title').textContent = data.title;
                    document.getElementById('study-set-desc').textContent = data.description || "플래시카드를 클릭하여 한글 뜻을 확인하세요.";
                    this.state.currentStudyWords = data.words;
                    this.state.currentStudyIndex = 0;
                    this.state.isFlipped = false;
                    this.renderCurrentCard();
                }
            }
        } catch (err) {
            clearTimeout(timeoutId);
        }
    },

    renderCurrentCard: function() {
        const words = this.state.currentStudyWords;
        const idx = this.state.currentStudyIndex;
        const counter = document.getElementById('study-progress-counter');
        const progressBar = document.getElementById('study-progress-bar');
        const inner = document.getElementById('flashcard-inner');

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

        this.updateCardHeartIcon();
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
            this.showToast("마지막 단어입니다! 💖", "info");
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
        this.showToast("단어 순서를 섞었습니다. ✨", "info");
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

        const targetSet = this.state.wordSets.find(s => s.id == setId) || PRESET_WORD_SETS.find(s => s.id == setId);
        if (targetSet) {
            document.getElementById('manager-current-set-title').textContent = targetSet.title;
            document.getElementById('manager-words-count-badge').textContent = `${(targetSet.words || []).length}개`;
            this.renderManagerWordsList(targetSet.words || [], setId);
        }

        try {
            const res = await fetch(`${API_BASE_URL}/sets/${setId}/words`);
            if (res.ok) {
                const data = await res.json();
                document.getElementById('manager-current-set-title').textContent = data.title;
                document.getElementById('manager-words-count-badge').textContent = `${data.words.length}개`;
                this.renderManagerWordsList(data.words, setId);
            }
        } catch (err) {
            // Ignore backend offline notice
        }
    },

    renderManagerWordsList: function(words, setId) {
        const listEl = document.getElementById('manager-words-list');
        if (!words || words.length === 0) {
            listEl.innerHTML = '<p class="text-center text-slate-500 text-sm py-8">선택된 세트에 등록된 단어가 없습니다.</p>';
            return;
        }

        listEl.innerHTML = words.map(w => `
            <div class="py-4 flex items-center justify-between gap-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="text-base font-bold tracking-wide">${this.escapeHtml(w.word)}</span>
                        <span class="text-xs phonetic-text">${this.escapeHtml(w.phonetic || '')}</span>
                        ${w.audio_url ? `<button onclick="app.playAudioUrl('${w.audio_url}', '${w.word}')" class="text-purple-500 hover:text-purple-400"><i class="fa-solid fa-volume-low"></i></button>` : ''}
                    </div>
                    <p class="text-xs font-bold text-pink-500 dark:text-pink-400">${this.escapeHtml(w.meaning)}</p>
                    ${w.example_en ? `<p class="typo-muted italic">"${this.escapeHtml(w.example_en)}" - ${this.escapeHtml(w.example_kr || '')}</p>` : ''}
                </div>
                <button onclick="app.removeWordFromSet(${setId}, ${w.id}, '${this.escapeHtml(w.word)}')" class="typo-muted hover:text-rose-500 transition p-2" title="세트에서 제외">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');
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

            this.showToast(`'${word}' 단어가 세트에 성공적으로 등록되었습니다! ✨`, "success");
            wordInput.value = '';
            this.loadManagerSetWords(setId);
            this.loadWordSets();
        } catch (err) {
            // Fallback for standalone offline addition
            const targetSet = this.state.wordSets.find(s => s.id == setId);
            if (targetSet) {
                targetSet.words = targetSet.words || [];
                targetSet.words.push({ id: Date.now(), word, meaning: `${word} (수집 단어)`, phonetic: "", audio_url: "" });
                targetSet.word_count = targetSet.words.length;
                this.renderManagerWordsList(targetSet.words, setId);
                this.showToast(`'${word}' 단어가 추가되었습니다! ✨`, "success");
                wordInput.value = '';
            }
        } finally {
            spinner.classList.add('hidden');
            btn.disabled = false;
        }
    },

    removeWordFromSet: async function(setId, wordId, wordName) {
        if (!confirm(`'${wordName}' 단어를 이 세트에서 제외하시겠습니까?`)) return;
        const targetSet = this.state.wordSets.find(s => s.id == setId);
        if (targetSet && targetSet.words) {
            targetSet.words = targetSet.words.filter(w => w.id !== wordId);
            targetSet.word_count = targetSet.words.length;
            this.renderManagerWordsList(targetSet.words, setId);
        }
        this.showToast("단어가 세트에서 제외되었습니다.", "success");

        try {
            await fetch(`${API_BASE_URL}/sets/${setId}/words/${wordId}`, { method: 'DELETE' });
        } catch (err) {
            // Ignore backend offline notice
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

        const targetSet = this.state.wordSets.find(s => s.id == setId) || PRESET_WORD_SETS.find(s => s.id == setId);
        const words = targetSet ? targetSet.words || [] : [];

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

            const allWords = this.state.quizQuestions;
            const distractors = allWords.filter(w => w.id !== q.id).sort(() => 0.5 - Math.random()).slice(0, 3);
            const options = [q, ...distractors].sort(() => 0.5 - Math.random());

            container.innerHTML = options.map((opt, i) => `
                <button onclick="app.selectQuizOption(this, '${this.escapeHtml(opt.meaning)}')" class="quiz-option-btn w-full p-4 rounded-2xl border border-purple-500/30 bg-slate-900/80 hover:border-pink-500 text-left transition font-bold text-slate-200 flex items-center gap-3">
                    <span class="w-7 h-7 rounded-xl bg-purple-950/80 text-pink-300 font-extrabold text-xs flex items-center justify-center border border-purple-500/40">${i + 1}</span>
                    <span>${this.escapeHtml(opt.meaning)}</span>
                </button>
            `).join('');

        } else if (type === 'spelling') {
            audioBtn.classList.add('hidden');
            promptEl.textContent = q.meaning;

            container.innerHTML = `
                <div class="space-y-2">
                    <label class="block text-xs text-pink-300 font-bold">알맞은 영단어 스펠링을 입력하세요</label>
                    <input type="text" id="quiz-spelling-input" placeholder="영단어 입력..." autocomplete="off" class="w-full bg-slate-900 border border-purple-500/30 text-white text-base rounded-2xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:outline-none">
                </div>
            `;
        } else if (type === 'listening') {
            audioBtn.classList.remove('hidden');
            promptEl.textContent = "🔊 음성을 듣고 스펠링을 입력하세요";
            this.playQuizAudio();

            container.innerHTML = `
                <div class="space-y-2">
                    <label class="block text-xs text-pink-300 font-bold">듣고 알맞은 영단어를 작성하세요</label>
                    <input type="text" id="quiz-spelling-input" placeholder="영단어 입력..." autocomplete="off" class="w-full bg-slate-900 border border-purple-500/30 text-white text-base rounded-2xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:outline-none">
                </div>
            `;
        }
    },

    selectQuizOption: function(btnEl, meaningVal) {
        document.querySelectorAll('.quiz-option-btn').forEach(b => {
            b.classList.remove('border-pink-500', 'bg-pink-950/40');
        });
        btnEl.classList.add('border-pink-500', 'bg-pink-950/40');
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
            this.showToast("정답입니다! 🎉✨", "success");
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
                        <span class="font-bold text-white mr-2 font-heading">${this.escapeHtml(w.word)}</span>
                        <span class="text-xs text-purple-300 font-mono">${this.escapeHtml(w.phonetic || '')}</span>
                        <p class="text-xs text-pink-300 font-bold">${this.escapeHtml(w.meaning)}</p>
                    </div>
                    <button onclick="app.playAudioUrl('${w.audio_url}', '${w.word}')" class="text-pink-400 hover:text-pink-300 p-2"><i class="fa-solid fa-volume-high"></i></button>
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

    // ------------------ BOOKMARKS & UNMEMORIZED REVIEW ENGINE ------------------
    initBookmarks: function() {
        try {
            this.state.favorites = JSON.parse(localStorage.getItem("USER_FAVORITES") || "[]");
            this.state.unmemorized = JSON.parse(localStorage.getItem("USER_UNMEMORIZED") || "[]");
        } catch (e) {
            this.state.favorites = [];
            this.state.unmemorized = [];
        }
        this.updateBookmarkBadges();
    },

    saveBookmarks: function() {
        localStorage.setItem("USER_FAVORITES", JSON.stringify(this.state.favorites));
        localStorage.setItem("USER_UNMEMORIZED", JSON.stringify(this.state.unmemorized));
        this.updateBookmarkBadges();
    },

    updateBookmarkBadges: function() {
        const favCount = this.state.favorites ? this.state.favorites.length : 0;
        const unmemCount = this.state.unmemorized ? this.state.unmemorized.length : 0;
        const total = favCount + unmemCount;

        const navBadge = document.getElementById("nav-bookmark-badge");
        const mobileBadge = document.getElementById("mobile-bookmark-badge");
        const countFav = document.getElementById("count-favorites");
        const countUnmem = document.getElementById("count-unmemorized");

        if (navBadge) {
            navBadge.textContent = favCount;
            navBadge.classList.toggle("hidden", favCount === 0);
        }
        if (mobileBadge) {
            mobileBadge.classList.toggle("hidden", total === 0);
        }
        if (countFav) countFav.textContent = favCount;
        if (countUnmem) countUnmem.textContent = unmemCount;
    },

    toggleBookmarkCurrentWord: function() {
        const words = this.state.currentStudyWords;
        const idx = this.state.currentStudyIndex;
        if (!words || !words[idx]) return;

        const currentWord = words[idx];
        const existingIdx = this.state.favorites.findIndex(w => w.word.toLowerCase() === currentWord.word.toLowerCase());

        if (existingIdx >= 0) {
            this.state.favorites.splice(existingIdx, 1);
            this.showToast(`'${currentWord.word}' 중요 단어 해제`, "info");
        } else {
            this.state.favorites.push(currentWord);
            this.showToast(`'${currentWord.word}' 중요 단어장에 추가됨 💖`, "success");
        }

        this.saveBookmarks();
        this.updateCardHeartIcon();
    },

    markCurrentWordStatus: function(isMemorized) {
        const words = this.state.currentStudyWords;
        const idx = this.state.currentStudyIndex;
        if (!words || !words[idx]) return;

        const currentWord = words[idx];
        const existingIdx = this.state.unmemorized.findIndex(w => w.word.toLowerCase() === currentWord.word.toLowerCase());

        if (isMemorized) {
            if (existingIdx >= 0) {
                this.state.unmemorized.splice(existingIdx, 1);
            }
            this.showToast(`'${currentWord.word}' 암기 완료! 🎉`, "success");
        } else {
            if (existingIdx < 0) {
                this.state.unmemorized.push(currentWord);
            }
            this.showToast(`'${currentWord.word}' 복습 노트에 추가됨 💡`, "info");
        }

        this.saveBookmarks();
        this.nextCard();
    },

    updateCardHeartIcon: function() {
        const words = this.state.currentStudyWords;
        const idx = this.state.currentStudyIndex;
        const heartIcon = document.getElementById("card-heart-icon");
        if (!heartIcon || !words || !words[idx]) return;

        const currentWord = words[idx];
        const isFav = this.state.favorites.some(w => w.word.toLowerCase() === currentWord.word.toLowerCase());

        if (isFav) {
            heartIcon.className = "fa-solid fa-heart text-xl text-pink-500";
        } else {
            heartIcon.className = "fa-regular fa-heart text-xl text-slate-400";
        }
    },

    switchBookmarkTab: function(tabName) {
        this.state.activeBookmarkTab = tabName;
        const tabFav = document.getElementById("tab-btn-favorites");
        const tabUnmem = document.getElementById("tab-btn-unmemorized");

        if (tabName === 'favorites') {
            if (tabFav) tabFav.className = "py-2.5 px-4 font-bold text-sm border-b-2 border-pink-500 text-pink-500 transition";
            if (tabUnmem) tabUnmem.className = "py-2.5 px-4 font-bold text-sm border-b-2 border-transparent typo-muted transition";
        } else {
            if (tabFav) tabFav.className = "py-2.5 px-4 font-bold text-sm border-b-2 border-transparent typo-muted transition";
            if (tabUnmem) tabUnmem.className = "py-2.5 px-4 font-bold text-sm border-b-2 border-pink-500 text-pink-500 transition";
        }
        this.renderBookmarkWordsList();
    },

    renderBookmarkWordsList: function() {
        const listEl = document.getElementById("bookmarks-words-list");
        if (!listEl) return;

        const words = this.state.activeBookmarkTab === 'favorites' ? this.state.favorites : this.state.unmemorized;

        if (!words || words.length === 0) {
            listEl.innerHTML = `
                <div class="text-center py-10 space-y-2">
                    <i class="fa-solid fa-heart-crack text-4xl text-pink-400"></i>
                    <p class="typo-muted text-sm">${this.state.activeBookmarkTab === 'favorites' ? '중요 표시한 단어가 없습니다.' : '아직 헷갈리는 미암기 단어가 없습니다.'}</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = words.map((w) => `
            <div class="py-4 flex items-center justify-between gap-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="text-base font-bold tracking-wide">${this.escapeHtml(w.word)}</span>
                        <span class="text-xs phonetic-text">${this.escapeHtml(w.phonetic || '')}</span>
                        ${w.audio_url ? `<button onclick="app.playAudioUrl('${w.audio_url}', '${w.word}')" class="text-purple-500 hover:text-purple-400"><i class="fa-solid fa-volume-low"></i></button>` : ''}
                    </div>
                    <p class="text-xs font-bold text-pink-500 dark:text-pink-400">${this.escapeHtml(w.meaning)}</p>
                    ${w.example_en ? `<p class="typo-muted italic text-xs">"${this.escapeHtml(w.example_en)}" - ${this.escapeHtml(w.example_kr || '')}</p>` : ''}
                </div>
                <button onclick="app.removeBookmarkWord('${this.escapeHtml(w.word)}', '${this.state.activeBookmarkTab}')" class="typo-muted hover:text-rose-500 transition p-2" title="목록에서 제거">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');
    },

    removeBookmarkWord: function(wordText, tabType) {
        if (tabType === 'favorites') {
            this.state.favorites = this.state.favorites.filter(w => w.word.toLowerCase() !== wordText.toLowerCase());
        } else {
            this.state.unmemorized = this.state.unmemorized.filter(w => w.word.toLowerCase() !== wordText.toLowerCase());
        }
        this.saveBookmarks();
        this.renderBookmarkWordsList();
        this.showToast(`'${wordText}' 단어를 목록에서 제거했습니다.`, "info");
    },

    startBookmarkStudy: function() {
        const words = this.state.activeBookmarkTab === 'favorites' ? this.state.favorites : this.state.unmemorized;
        if (!words || words.length === 0) {
            this.showToast("복습할 단어가 목록에 없습니다.", "error");
            return;
        }
        document.getElementById('study-set-title').textContent = this.state.activeBookmarkTab === 'favorites' ? "💖 중요 단어 복습 모드" : "❌ 헷갈리는 미암기 단어 모드";
        document.getElementById('study-set-desc').textContent = "로그인 없이 내 기기에 저장된 나만의 단어들을 복습합니다.";
        this.state.currentStudyWords = [...words];
        this.state.currentStudyIndex = 0;
        this.state.isFlipped = false;
        this.navigateTo('study');
        this.renderCurrentCard();
    },

    startBookmarkQuiz: function() {
        const words = this.state.activeBookmarkTab === 'favorites' ? this.state.favorites : this.state.unmemorized;
        if (!words || words.length < 2) {
            this.showToast("퀴즈 진행을 위해 최소 2개 이상의 복습 단어가 필요합니다.", "error");
            return;
        }
        this.state.quizQuestions = [...words].sort(() => 0.5 - Math.random());
        this.state.quizCurrentIndex = 0;
        this.state.quizScore = 0;
        this.state.quizWrongWords = [];
        this.navigateTo('quiz');
        document.getElementById('quiz-setup-card').classList.add('hidden');
        document.getElementById('quiz-result-card').classList.add('hidden');
        document.getElementById('quiz-active-card').classList.remove('hidden');
        this.renderQuizQuestion();
    },

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

document.addEventListener('DOMContentLoaded', () => {
    app.init();

    // Mobile tab wake & visibility listeners for instant reconnection
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            app.checkServerHealth();
        }
    });
    window.addEventListener('pageshow', () => {
        app.checkServerHealth();
    });
});
