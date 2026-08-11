import os
import sqlite3
import urllib.parse
import requests
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "english_memory.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. 단어 세트 테이블
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS word_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 2. 단어 Master 테이블
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL UNIQUE,
        meaning TEXT NOT NULL,
        phonetic TEXT,
        audio_url TEXT,
        example_en TEXT,
        example_kr TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 3. 단어 세트 - 단어 매핑 테이블 (N:M)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS set_words (
        set_id INTEGER,
        word_id INTEGER,
        PRIMARY KEY (set_id, word_id),
        FOREIGN KEY (set_id) REFERENCES word_sets(id) ON DELETE CASCADE,
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );
    """)
    
    conn.commit()
    
    # Check if DB has 10 exam prep sets, if not seed them
    cursor.execute("SELECT COUNT(*) FROM word_sets")
    count = cursor.fetchone()[0]
    if count < 10:
        seed_10_exam_sets(conn)
        
    conn.close()

def seed_10_exam_sets(conn):
    cursor = conn.cursor()

    # Define 10 Famous University Exam Prep Vocabulary Sets
    exam_sets_data = [
        {
            "title": "[해커스 보카] 수능 필수 고득점 영단어 3000 ✨",
            "description": "해커스 수능 영단어 베스트셀러! 수능 및 평가원 모의고사 고득점 필수 단어 모음",
            "words": [
                ("meticulous", "꼼꼼한, 세심한", "[məˈtɪkjələs]", "https://ssl.pstatic.net/dicimg/endic/audio/us/047/047120.mp3", "She is meticulous about keeping her notes organized.", "그녀는 노트 정리를 꼼꼼하게 하는 편이다."),
                ("resilient", "회복력 있는, 탄력 있는", "[rɪˈzɪliənt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/068/068132.mp3", "Teenagers are remarkably resilient when faced with challenges.", "10대들은 난관에 부딪혔을 때 놀라울 정도로 회복력이 뛰어나다."),
                ("ephemeral", "덧없는, 수명이 짧은", "[ɪˈfemərəl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/028/028492.mp3", "Social media trends can be ephemeral.", "소셜 미디어 트렌드는 덧없이 지나갈 수 있다."),
                ("pragmatic", "실용적인, 현실적인", "[præɡˈmætɪk]", "https://ssl.pstatic.net/dicimg/endic/audio/us/061/061904.mp3", "We need a pragmatic study schedule for exam prep.", "시험 대비를 위해 실용적인 공부 계획표가 필요하다.")
            ]
        },
        {
            "title": "[EBS 수능특강] 2026 수능완성 핵심 어휘 🌸",
            "description": "EBS 수능 특강/수능 완성 지문 연계! 킬러 문항 대비 출제 1순위 어휘",
            "words": [
                ("unprecedented", "전례 없는, 미증유의", "[ʌnˈpresɪdentɪd]", "https://ssl.pstatic.net/dicimg/endic/audio/us/087/087450.mp3", "The technological development brought unprecedented changes.", "기술 발전은 전례 없는 변화를 가져왔다."),
                ("ambiguity", "모호성, 다의성", "[ˌæmbɪˈɡjuːəti]", "https://ssl.pstatic.net/dicimg/endic/audio/us/003/003410.mp3", "The author used ambiguity to enhance the mystery.", "작가는 신비감을 더하기 위해 모호성을 활용했다."),
                ("scrutinize", "면밀히 조사하다, 정밀 점검하다", "[ˈskruːtənaɪz]", "https://ssl.pstatic.net/dicimg/endic/audio/us/071/071280.mp3", "Scientists scrutinize data to avoid biased conclusions.", "과학자들은 편향된 결론을 피하기 위해 데이터를 면밀히 조사한다.")
            ]
        },
        {
            "title": "[워드마스터] 수능 고난도 1등급 마스터 💖",
            "description": "상위권 1등급 변별력을 가르는 수능 최고난도 영어 단어 완벽 마스터",
            "words": [
                ("ubiquitous", "어디에나 있는, 흔한", "[juːˈbɪkwɪtəs]", "https://ssl.pstatic.net/dicimg/endic/audio/us/085/085890.mp3", "Smartphones have become ubiquitous in daily life.", "스마트폰은 일상생활에서 어디서나 볼 수 있게 되었다."),
                ("superfluous", "불필요한, 과잉의", "[suːˈpɜːrfluəs]", "https://ssl.pstatic.net/dicimg/endic/audio/us/077/077610.mp3", "Avoid adding superfluous details in your essay.", "에세이에 불필요한 세부 사항을 넣지 마라."),
                ("tenacious", "끈질긴, 집요한", "[təˈneɪʃəs]", "https://ssl.pstatic.net/dicimg/endic/audio/us/081/081450.mp3", "Her tenacious effort led to top test scores.", "그녀의 끈질긴 노력이 수석 성적으로 이어졌다.")
            ]
        },
        {
            "title": "[능률 VOKA] 수능 기본 다지기 필수 어휘 🎀",
            "description": "탄탄한 기본기를 쌓는 고1~고2 필수 어휘 및 수능 기본 고빈출 단어",
            "words": [
                ("collaborate", "협력하다, 공동 작업하다", "[kəˈlæbəreɪt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/017/017890.mp3", "Students collaborated to create a brilliant presentation.", "학생들은 멋진 발표 자료를 만들기 위해 협력했다."),
                ("innovative", "혁신적인, 독창적인", "[ˈɪnəveɪtɪv]", "https://ssl.pstatic.net/dicimg/endic/audio/us/041/041230.mp3", "An innovative approach solved the tough problem.", "혁신적인 접근 방식이 어려운 문제를 해결했다."),
                ("optimize", "최적화하다, 효율화하다", "[ˈɑːptɪmaɪz]", "https://ssl.pstatic.net/dicimg/endic/audio/us/053/053420.mp3", "Optimize your study time by removing distractions.", "방해 요소를 없애 공부 시간을 최적화하라.")
            ]
        },
        {
            "title": "[대성마이맥] 수능 영어 킬러 구문 대비 어휘 ⚡",
            "description": "평가원 6월/9월 모의고사 및 수능 31~34번 빈칸추론 킬러 문항 대비 어휘",
            "words": [
                ("dichotomy", "이분법, 양분", "[daɪˈkɑːtəmi]", "https://ssl.pstatic.net/dicimg/endic/audio/us/023/023410.mp3", "There is a strict dichotomy between theory and practice.", "이론과 실제 사이에는 엄격한 이분법이 존재한다."),
                ("coercion", "강제, 강요", "[koʊˈɜːrʒn]", "https://ssl.pstatic.net/dicimg/endic/audio/us/017/017510.mp3", "True motivation comes from passion, not coercion.", "진정한 동기부여는 강요가 아닌 열정에서 나온다."),
                ("paradigm", "패러다임, 전형적인 틀", "[ˈpærədaɪm]", "https://ssl.pstatic.net/dicimg/endic/audio/us/057/057390.mp3", "AI technology marks a new shift in paradigm.", "AI 기술은 패러다임의 새로운 전환을 의미한다.")
            ]
        },
        {
            "title": "[메가스터디] 수능 독해 빈출 어휘 BEST 🔮",
            "description": "수능 영어 영역 지문 독해 시 자주 마주치는 핵심 문맥 어휘 모음",
            "words": [
                ("sustainable", "지속 가능한", "[səˈsteɪnəbl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/078/078210.mp3", "We must focus on sustainable eco-friendly growth.", "우리는 지속 가능한 친환경 성장에 집중해야 한다."),
                ("inevitable", "피할 수 없는, 불가피한", "[ɪnˈevɪtəbl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/040/040820.mp3", "Change is inevitable in life.", "변화는 인생에서 피할 수 없는 것이다."),
                ("profound", "깊은, 심오한", "[prəˈfaʊnd]", "https://ssl.pstatic.net/dicimg/endic/audio/us/062/062830.mp3", "The book had a profound impact on her perspective.", "그 책은 그녀의 관점에 심오한 영향을 미쳤다.")
            ]
        },
        {
            "title": "[TOEIC/TEPS] 수능 & 대학입시 연계 어휘 🎓",
            "description": "수시 입시, 학생부 종합 및 어학 특기자 전형 대비 고급 영단어",
            "words": [
                ("accomplish", "성취하다, 완수하다", "[əˈkɑːmplɪʃ]", "https://ssl.pstatic.net/dicimg/endic/audio/us/001/001530.mp3", "You can accomplish your dream with perseverance.", "끈기 있게 노력하면 꿈을 성취할 수 있다."),
                ("subsequent", "그 다음의, 차후의", "[ˈsʌbsɪkwənt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/077/077120.mp3", "Subsequent research confirmed the hypothesis.", "차후 연구를 통해 그 가설이 입증되었다."),
                ("perceive", "인식하다, 감지하다", "[pərˈsiːv]", "https://ssl.pstatic.net/dicimg/endic/audio/us/058/058420.mp3", "How you perceive challenges determines your success.", "도전을 어떻게 인식하느냐가 성공을 결정한다.")
            ]
        },
        {
            "title": "[수능 어휘] 다의어 & 헷갈리는 영어 단어 💯",
            "description": "문맥에 따라 뜻이 달라져 오답률을 높이는 수능 혼동 단어 완벽 정리",
            "words": [
                ("address", "연설하다 / 주소 / (문제를) 다루다", "[əˈdres]", "https://ssl.pstatic.net/dicimg/endic/audio/us/001/001890.mp3", "The principal addressed the student issue carefully.", "교장 선생님은 학생 문제를 신중하게 다루었다."),
                ("observe", "관찰하다 / (법을) 준수하다", "[əbˈzɜːrv]", "https://ssl.pstatic.net/dicimg/endic/audio/us/052/052520.mp3", "All drivers must observe traffic laws.", "모든 운전자는 교통 법규를 준수해야 한다."),
                ("subject", "주제 / 과목 / 피험자 / ~의 지배를 받는", "[ˈsʌbdʒɪkt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/077/077050.mp3", "The participants were subject to safety rules.", "참가자들은 안전 규칙의 지배를 받았다.")
            ]
        },
        {
            "title": "[수능 영어] 핵심 숙어 & 전치사 관용구 💫",
            "description": "지문 해석 속도를 2배 높여주는 필수 수능 관용구 및 구동사",
            "words": [
                ("bring about", "~을 야기하다, 일으키다", "[brɪŋ əˈbaʊt]", "", "New innovations brought about positive social changes.", "새로운 혁신은 긍정적인 사회적 변화를 야기했다."),
                ("carry out", "수행하다, 실천하다", "[ˈkæri aʊt]", "", "Researchers carried out an extensive experiment.", "연구원들은 광범위한 실험을 수행했다."),
                ("take for granted", "~을 당연하게 여기다", "[teɪk fər ˈɡræntɪd]", "", "Never take your friends' support for granted.", "친구들의 지원을 당연하게 여기지 마라.")
            ]
        },
        {
            "title": "[영어독해] 인문·사회·과학 수능 종합 어휘 👑",
            "description": "수능 통합형 지문에 자주 등장하는 인문학, 사회과학, 융합 지문 핵심 단어",
            "words": [
                ("cognitive", "인식의, 인지의", "[ˈkɑːɡnətɪv]", "https://ssl.pstatic.net/dicimg/endic/audio/us/017/017610.mp3", "Sleep plays a vital role in cognitive development.", "수면은 인지 발달에 핵심적인 역할을 한다."),
                ("hypothesis", "가설, 전제", "[haɪˈpɑːθəsɪs]", "https://ssl.pstatic.net/dicimg/endic/audio/us/039/039890.mp3", "Formulate a testable hypothesis before starting.", "시작하기 전 검증 가능한 가설을 세워라."),
                ("empirical", "실증적인, 경험에 의거한", "[ɪmˈpɪrɪkl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/028/028820.mp3", "Empirical evidence supports this scientific claim.", "실증적인 증거가 이 과학적 주장을 뒷받침한다.")
            ]
        }
    ]

    for setData in exam_sets_data:
        cursor.execute("INSERT INTO word_sets (title, description) VALUES (?, ?)", (setData["title"], setData["description"]))
        set_id = cursor.lastrowid

        for word, meaning, phonetic, audio, ex_en, ex_kr in setData["words"]:
            cursor.execute("INSERT OR IGNORE INTO words (word, meaning, phonetic, audio_url, example_en, example_kr) VALUES (?, ?, ?, ?, ?, ?)",
                           (word, meaning, phonetic, audio, ex_en, ex_kr))
            cursor.execute("SELECT id FROM words WHERE word = ?", (word,))
            word_id = cursor.fetchone()[0]
            cursor.execute("INSERT OR IGNORE INTO set_words (set_id, word_id) VALUES (?, ?)", (set_id, word_id))

    conn.commit()


def fetch_naver_dictionary(word_query):
    cleaned_word = word_query.strip().lower()
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://en.dict.naver.com/"
    }

    result = {
        "word": cleaned_word,
        "meaning": "",
        "phonetic": "",
        "audio_url": "",
        "example_en": "",
        "example_kr": ""
    }

    api_urls = [
        f"https://en.dict.naver.com/api/platform/pcode/search/all?query={urllib.parse.quote(cleaned_word)}",
        f"https://dict.naver.com/api/v2/platform/enko/search/all?query={urllib.parse.quote(cleaned_word)}",
        f"https://en.dict.naver.com/api/v2/platform/enko/search/all?query={urllib.parse.quote(cleaned_word)}"
    ]

    for api_url in api_urls:
        try:
            res = requests.get(api_url, headers=headers, timeout=5)
            if res.status_code == 200:
                try:
                    data = res.json()
                    search_map = data.get("searchResultMap", {}).get("searchResultListMap", {}).get("WORD", {})
                    items = search_map.get("items", [])
                    if items:
                        first_item = items[0]
                        means_collector = first_item.get("meansCollector", [])
                        meanings = []
                        for mc in means_collector:
                            for m in mc.get("means", []):
                                val = m.get("value") or m.get("mean")
                                if val and val not in meanings:
                                    meanings.append(val)
                        if meanings:
                            result["meaning"] = ", ".join(meanings)
                            
                        symbol_list = first_item.get("searchPhoneticSymbolList", [])
                        if symbol_list:
                            result["phonetic"] = symbol_list[0].get("symbolValue") or symbol_list[0].get("symbol") or ""
                        elif first_item.get("symbol"):
                            result["phonetic"] = first_item.get("symbol")

                        if first_item.get("soundUrl"):
                            result["audio_url"] = first_item.get("soundUrl")
                        elif symbol_list and symbol_list[0].get("soundUrl"):
                            result["audio_url"] = symbol_list[0].get("soundUrl")

                        examples = first_item.get("EXAMPLE", {}).get("items", []) or first_item.get("exampleList", [])
                        if examples:
                            first_ex = examples[0]
                            result["example_en"] = BeautifulSoup(first_ex.get("exampleOri") or first_ex.get("example_en") or "", "html.parser").get_text()
                            result["example_kr"] = BeautifulSoup(first_ex.get("exampleTrans") or first_ex.get("example_kr") or "", "html.parser").get_text()

                        if result["meaning"]:
                            return result
                except Exception:
                    pass
        except Exception:
            pass

    # Fallback to FreeDictionaryAPI
    try:
        dict_res = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{urllib.parse.quote(cleaned_word)}", timeout=4)
        if dict_res.status_code == 200:
            dict_data = dict_res.json()
            if isinstance(dict_data, list) and len(dict_data) > 0:
                entry = dict_data[0]
                if entry.get("phonetic"):
                    result["phonetic"] = entry.get("phonetic")
                phonetics = entry.get("phonetics", [])
                for p in phonetics:
                    if p.get("audio"):
                        result["audio_url"] = p.get("audio")
                        break
                    if p.get("text") and not result["phonetic"]:
                        result["phonetic"] = p.get("text")

                meanings = entry.get("meanings", [])
                defs = []
                for m in meanings:
                    for d in m.get("definitions", []):
                        defs.append(d.get("definition"))
                        if d.get("example") and not result["example_en"]:
                            result["example_en"] = d.get("example")
                if defs and not result["meaning"]:
                    result["meaning"] = "; ".join(defs[:3])
    except Exception:
        pass

    if not result["meaning"]:
        result["meaning"] = f"{cleaned_word} (뜻 정보를 입력해주세요)"

    return result


# Ensure database and seed data are initialized automatically on app launch
try:
    init_db()
except Exception as _db_err:
    print("Database initialization notice:", _db_err)


# ------------------- REST API ENDPOINTS -------------------

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/api/sets", methods=["GET"])
def get_word_sets():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ws.id, ws.title, ws.description, ws.created_at,
               COUNT(sw.word_id) as word_count
        FROM word_sets ws
        LEFT JOIN set_words sw ON ws.id = sw.set_id
        GROUP BY ws.id
        ORDER BY ws.id ASC;
    """)
    rows = cursor.fetchall()
    conn.close()
    
    sets_list = [dict(row) for row in rows]
    return jsonify(sets_list), 200

@app.route("/api/sets", methods=["POST"])
def create_word_set():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    
    if not title:
        return jsonify({"error": "단어 세트 제목(title)은 필수 입력 사항입니다."}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO word_sets (title, description) VALUES (?, ?)", (title, description))
    new_set_id = cursor.lastrowid
    conn.commit()
    
    cursor.execute("""
        SELECT ws.id, ws.title, ws.description, ws.created_at, 0 as word_count
        FROM word_sets ws WHERE ws.id = ?
    """, (new_set_id,))
    new_set = dict(cursor.fetchone())
    conn.close()
    
    return jsonify(new_set), 201

@app.route("/api/sets/<int:set_id>", methods=["DELETE"])
def delete_word_set(set_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM word_sets WHERE id = ?", (set_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "존재하지 않는 단어 세트입니다."}), 404
        
    cursor.execute("DELETE FROM word_sets WHERE id = ?", (set_id,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "단어 세트가 성공적으로 삭제되었습니다.", "set_id": set_id}), 200

@app.route("/api/sets/<int:set_id>/words", methods=["GET"])
def get_words_in_set(set_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, title, description FROM word_sets WHERE id = ?", (set_id,))
    set_info = cursor.fetchone()
    if not set_info:
        conn.close()
        return jsonify({"error": "존재하지 않는 단어 세트입니다."}), 404
        
    cursor.execute("""
        SELECT w.id, w.word, w.meaning, w.phonetic, w.audio_url, w.example_en, w.example_kr, w.created_at
        FROM words w
        JOIN set_words sw ON w.id = sw.word_id
        WHERE sw.set_id = ?
        ORDER BY w.id ASC;
    """, (set_id,))
    words = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({
        "set_id": set_id,
        "title": set_info["title"],
        "description": set_info["description"],
        "words": words
    }), 200

@app.route("/api/words/auto-add", methods=["POST"])
def auto_add_word():
    data = request.get_json() or {}
    set_id = data.get("set_id")
    word_text = data.get("word", "").strip().lower()
    
    if not set_id or not word_text:
        return jsonify({"error": "set_id와 word는 필수 입력 정보입니다."}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM word_sets WHERE id = ?", (set_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "지정된 단어 세트가 존재하지 않습니다."}), 404
        
    cursor.execute("SELECT id, word, meaning, phonetic, audio_url, example_en, example_kr FROM words WHERE word = ?", (word_text,))
    existing_word = cursor.fetchone()
    
    if existing_word:
        word_id = existing_word["id"]
        word_data = dict(existing_word)
    else:
        dict_data = fetch_naver_dictionary(word_text)
        
        meaning = data.get("meaning") or dict_data.get("meaning") or word_text
        phonetic = data.get("phonetic") or dict_data.get("phonetic") or ""
        audio_url = data.get("audio_url") or dict_data.get("audio_url") or ""
        example_en = data.get("example_en") or dict_data.get("example_en") or ""
        example_kr = data.get("example_kr") or dict_data.get("example_kr") or ""
        
        cursor.execute("""
            INSERT INTO words (word, meaning, phonetic, audio_url, example_en, example_kr)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (word_text, meaning, phonetic, audio_url, example_en, example_kr))
        word_id = cursor.lastrowid
        
        word_data = {
            "id": word_id,
            "word": word_text,
            "meaning": meaning,
            "phonetic": phonetic,
            "audio_url": audio_url,
            "example_en": example_en,
            "example_kr": example_kr
        }
        
    cursor.execute("INSERT OR IGNORE INTO set_words (set_id, word_id) VALUES (?, ?)", (set_id, word_id))
    conn.commit()
    conn.close()
    
    return jsonify({
        "message": f"'{word_text}' 단어가 세트에 성공적으로 등록되었습니다.",
        "set_id": set_id,
        "word": word_data
    }), 200

@app.route("/api/sets/<int:set_id>/words/<int:word_id>", methods=["DELETE"])
def remove_word_from_set(set_id, word_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM set_words WHERE set_id = ? AND word_id = ?", (set_id, word_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    if affected == 0:
        return jsonify({"error": "해당 세트에 등록되지 않은 단어이거나 찾을 수 없습니다."}), 404
        
    return jsonify({"message": "단어가 세트에서 성공적으로 삭제되었습니다.", "set_id": set_id, "word_id": word_id}), 200


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
