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
    
    # Seed initial data if database is empty
    cursor.execute("SELECT COUNT(*) FROM word_sets")
    if cursor.fetchone()[0] == 0:
        seed_initial_data(conn)
        
    conn.close()

def seed_initial_data(conn):
    cursor = conn.cursor()
    # Create sample word sets
    cursor.execute("INSERT INTO word_sets (title, description) VALUES (?, ?)", 
                   ("기초 필수 영단어 20", "입문자 및 기초 학습자를 위한 필수 기본 단어 모음"))
    set1_id = cursor.lastrowid
    
    cursor.execute("INSERT INTO word_sets (title, description) VALUES (?, ?)", 
                   ("비즈니스 & 학술 핵심 단어", "업무, 이메일 및 학술 논문에 자주 등장하는 고급 단어 모음"))
    set2_id = cursor.lastrowid

    sample_words_set1 = [
        ("apple", "사과, 사과나무", "[ˈæpl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/001/001037.mp3", "I ate a fresh red apple for breakfast.", "나는 아침으로 신선한 빨간 사과를 먹었다."),
        ("resilient", "회복력 있는, 탄력 있는", "[rɪˈzɪliənt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/068/068132.mp3", "She is a resilient person who bounces back from adversity.", "그녀는 역경에서 다시 일어서는 회복력 있는 사람이다."),
        ("ephemeral", "수명이 짧은, 덧없는", "[ɪˈfemərəl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/028/028492.mp3", "Fame in the digital age can be ephemeral.", "디지털 시대의 명성은 덧없을 수 있다."),
        ("meticulous", "꼼꼼한, 세심한", "[məˈtɪkjələs]", "https://ssl.pstatic.net/dicimg/endic/audio/us/047/047120.mp3", "He gave meticulous attention to every detail of the project.", "그는 프로젝트의 모든 세부 사항에 꼼꼼한 주의를 기울였다."),
        ("pragmatic", "실용적인, 실재적인", "[præɡˈmætɪk]", "https://ssl.pstatic.net/dicimg/endic/audio/us/061/061904.mp3", "We need a pragmatic approach to solve this problem.", "우리는 이 문제를 해결하기 위해 실용적인 접근 방식이 필요하다.")
    ]

    sample_words_set2 = [
        ("collaborate", "협력하다, 공동으로 작업하다", "[kəˈlæbəreɪt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/017/017890.mp3", "The two departments collaborated on the new product design.", "두 부서는 신제품 디자인을 위해 협력했다."),
        ("innovative", "혁신적인, 독창적인", "[ˈɪnəveɪtɪv]", "https://ssl.pstatic.net/dicimg/endic/audio/us/041/041230.mp3", "The company is known for its innovative technology.", "그 회사는 혁신적인 기술로 알려져 있다."),
        ("optimize", "최적화하다", "[ˈɑːptɪmaɪz]", "https://ssl.pstatic.net/dicimg/endic/audio/us/053/053420.mp3", "We need to optimize our workflow to improve efficiency.", "효율성을 높이기 위해 워크플로우를 최적화해야 한다."),
        ("sustainability", "지속 가능성", "[səˌsteɪnəˈbɪləti]", "https://ssl.pstatic.net/dicimg/endic/audio/us/078/078210.mp3", "Environmental sustainability is a core company goal.", "환경적 지속 가능성은 회사의 핵심 목표이다.")
    ]

    for word, meaning, phonetic, audio, ex_en, ex_kr in sample_words_set1:
        cursor.execute("INSERT OR IGNORE INTO words (word, meaning, phonetic, audio_url, example_en, example_kr) VALUES (?, ?, ?, ?, ?, ?)",
                       (word, meaning, phonetic, audio, ex_en, ex_kr))
        cursor.execute("SELECT id FROM words WHERE word = ?", (word,))
        word_id = cursor.fetchone()[0]
        cursor.execute("INSERT OR IGNORE INTO set_words (set_id, word_id) VALUES (?, ?)", (set1_id, word_id))

    for word, meaning, phonetic, audio, ex_en, ex_kr in sample_words_set2:
        cursor.execute("INSERT OR IGNORE INTO words (word, meaning, phonetic, audio_url, example_en, example_kr) VALUES (?, ?, ?, ?, ?, ?)",
                       (word, meaning, phonetic, audio, ex_en, ex_kr))
        cursor.execute("SELECT id FROM words WHERE word = ?", (word,))
        word_id = cursor.fetchone()[0]
        cursor.execute("INSERT OR IGNORE INTO set_words (set_id, word_id) VALUES (?, ?)", (set2_id, word_id))

    conn.commit()

# Ensure database and seed data are initialized automatically on app launch (Gunicorn & Flask)
try:
    init_db()
except Exception as _db_err:
    print("Database initialization notice:", _db_err)


def fetch_naver_dictionary(word_query):
    """
    Extract word information according to section 4 specification:
    1. HTTP GET request to Naver Dictionary Internal API / search endpoint.
    2. JSON parsing:
       - meaning: join all items in meansCollector with comma
       - phonetic: symbol
       - audio_url: soundUrl
       - example_en / example_kr: first example sentence & translation in EXAMPLE
    3. Multi-tier fallback if Naver Internal API format changes or rate-limits.
    """
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

    # Attempt Tier 1: Naver Internal APIs
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
                    # Check for searchResultMap / searchResultListMap / WORD / items
                    search_map = data.get("searchResultMap", {}).get("searchResultListMap", {}).get("WORD", {})
                    items = search_map.get("items", [])
                    if items:
                        first_item = items[0]
                        
                        # 1) meaning from meansCollector
                        means_collector = first_item.get("meansCollector", [])
                        meanings = []
                        for mc in means_collector:
                            for m in mc.get("means", []):
                                val = m.get("value") or m.get("mean")
                                if val and val not in meanings:
                                    meanings.append(val)
                        if meanings:
                            result["meaning"] = ", ".join(meanings)
                            
                        # 2) phonetic from symbol
                        symbol_list = first_item.get("searchPhoneticSymbolList", [])
                        if symbol_list:
                            result["phonetic"] = symbol_list[0].get("symbolValue") or symbol_list[0].get("symbol") or ""
                        elif first_item.get("symbol"):
                            result["phonetic"] = first_item.get("symbol")

                        # 3) audio_url from soundUrl
                        if first_item.get("soundUrl"):
                            result["audio_url"] = first_item.get("soundUrl")
                        elif symbol_list and symbol_list[0].get("soundUrl"):
                            result["audio_url"] = symbol_list[0].get("soundUrl")

                        # 4) examples from EXAMPLE
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

    # Attempt Tier 2: FreeDictionaryAPI fallback for audio/phonetic/examples + Naver scraper
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

    # If meaning is still empty, set a clean fallback default
    if not result["meaning"]:
        result["meaning"] = f"{cleaned_word} (뜻 정보를 입력해주세요)"

    return result


# ------------------- REST API ENDPOINTS -------------------

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

# 1. 단어 세트 전체 목록 조회 (GET /api/sets)
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
        ORDER BY ws.created_at DESC;
    """)
    rows = cursor.fetchall()
    conn.close()
    
    sets_list = [dict(row) for row in rows]
    return jsonify(sets_list), 200

# 2. 신규 단어 세트 생성 (POST /api/sets)
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

# 3. 단어 세트 삭제 (DELETE /api/sets/<int:set_id>)
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

# 4. 특정 세트의 단어 목록 조회 (GET /api/sets/<int:set_id>/words)
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

# 5. 단어 입력 시 자동 수집 후 세트에 등록 (POST /api/words/auto-add)
@app.route("/api/words/auto-add", methods=["POST"])
def auto_add_word():
    data = request.get_json() or {}
    set_id = data.get("set_id")
    word_text = data.get("word", "").strip().lower()
    
    if not set_id or not word_text:
        return jsonify({"error": "set_id와 word는 필수 입력 정보입니다."}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if set exists
    cursor.execute("SELECT id FROM word_sets WHERE id = ?", (set_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "지정된 단어 세트가 존재하지 않습니다."}), 404
        
    # Check if word already exists in words table
    cursor.execute("SELECT id, word, meaning, phonetic, audio_url, example_en, example_kr FROM words WHERE word = ?", (word_text,))
    existing_word = cursor.fetchone()
    
    if existing_word:
        word_id = existing_word["id"]
        word_data = dict(existing_word)
    else:
        # Scrape / fetch from dictionary
        dict_data = fetch_naver_dictionary(word_text)
        
        # Override with user provided custom inputs if available
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
        
    # Link to set_words table (N:M mapping)
    cursor.execute("INSERT OR IGNORE INTO set_words (set_id, word_id) VALUES (?, ?)", (set_id, word_id))
    conn.commit()
    conn.close()
    
    return jsonify({
        "message": f"'{word_text}' 단어가 세트에 성공적으로 등록되었습니다.",
        "set_id": set_id,
        "word": word_data
    }), 200

# 6. 세트에서 특정 단어 제외 (DELETE /api/sets/<int:set_id>/words/<int:word_id>)
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
    # Port configuration for Render or local execution (using port 5001 for Mac compatibility)
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
