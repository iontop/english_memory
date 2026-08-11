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
    
    # Ensure initial seed exam sets exist if database is completely empty
    cursor.execute("SELECT COUNT(*) FROM word_sets")
    word_sets_count = cursor.fetchone()[0]
    if word_sets_count == 0:
        seed_10_exam_sets(conn)
        
    conn.close()

def seed_10_exam_sets(conn):
    cursor = conn.cursor()

    # Clear existing sets to ensure fresh 30-word seeding
    cursor.execute("DELETE FROM set_words")
    cursor.execute("DELETE FROM word_sets")

    # 10 Famous University Exam Prep Vocabulary Sets (30+ words each)
    s1_words = [
        ("meticulous", "꼼꼼한, 세심한", "[məˈtɪkjələs]", "https://ssl.pstatic.net/dicimg/endic/audio/us/047/047120.mp3", "She is meticulous about keeping her notes organized.", "그녀는 노트 정리를 꼼꼼하게 하는 편이다."),
        ("resilient", "회복력 있는, 탄력 있는", "[rɪˈzɪliənt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/068/068132.mp3", "Teenagers are remarkably resilient when faced with challenges.", "10대들은 난관에 부딪혔을 때 놀라울 정도로 회복력이 뛰어나다."),
        ("ephemeral", "덧없는, 수명이 짧은", "[ɪˈfemərəl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/028/028492.mp3", "Social media trends can be ephemeral.", "소셜 미디어 트렌드는 덧없이 지나갈 수 있다."),
        ("pragmatic", "실용적인, 현실적인", "[præɡˈmætɪk]", "https://ssl.pstatic.net/dicimg/endic/audio/us/061/061904.mp3", "We need a pragmatic study schedule for exam prep.", "시험 대비를 위해 실용적인 공부 계획표가 필요하다."),
        ("perseverance", "인내, 끈기", "[ˌpɜːrsəˈvɪrəns]", "https://ssl.pstatic.net/dicimg/endic/audio/us/058/058780.mp3", "Success requires talent and relentless perseverance.", "성공은 재능과 끊임없는 인내심을 필요로 한다."),
        ("eloquent", "웅변의, 유창한, 감동적인", "[ˈeləkwənt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/027/027150.mp3", "She delivered an eloquent speech at the ceremony.", "그녀는 시상식에서 감동적이고 유창한 연설을 했다."),
        ("candid", "솔직한, 정직한", "[ˈkændɪd]", "https://ssl.pstatic.net/dicimg/endic/audio/us/013/013620.mp3", "He gave a candid interview about his struggles.", "그는 자신의 고충에 대해 솔직한 인터뷰를 했다."),
        ("scrutinize", "면밀히 조사하다, 정밀하게 살펴보다", "[ˈskruːtənaɪz]", "https://ssl.pstatic.net/dicimg/endic/audio/us/071/071280.mp3", "The committee will scrutinize all submitted proposals.", "위원회는 제출된 모든 제안서를 면밀히 조사할 것이다."),
        ("alleviate", "완화하다, 경감하다", "[əˈliːvieɪt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/002/002750.mp3", "Proper rest helps alleviate exam stress.", "적절한 휴식은 시험 스트레스를 완화하는 데 도움이 된다."),
        ("foster", "조성하다, 육성하다", "[ˈfɑːstər]", "https://ssl.pstatic.net/dicimg/endic/audio/us/033/033780.mp3", "Teachers aim to foster critical thinking skills.", "교사들은 비판적 사고 능력을 육성하는 것을 목표로 한다."),
        ("lucid", "명쾌한, 명확한", "[ˈluːsɪd]", "https://ssl.pstatic.net/dicimg/endic/audio/us/045/045880.mp3", "The professor gave a lucid explanation of the concept.", "교수님은 그 개념에 대해 명쾌한 설명을 해주셨다."),
        ("obscure", "모호한, 잘 알려지지 않은", "[əbˈskjʊr]", "https://ssl.pstatic.net/dicimg/endic/audio/us/052/052450.mp3", "The origin of the phrase remains obscure.", "그 어구의 기원은 여전히 모호하다."),
        ("plausible", "타당한 것 같은, 그럴듯한", "[ˈplɔːzəbl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/060/060780.mp3", "That sounds like a plausible scientific explanation.", "그것은 그럴듯한 과학적 설명처럼 들린다."),
        ("profound", "깊은, 심오한", "[prəˈfaʊnd]", "https://ssl.pstatic.net/dicimg/endic/audio/us/062/062830.mp3", "His words had a profound impact on my perspective.", "그의 말은 내 관점에 심오한 영향을 미쳤다."),
        ("prudent", "신중한, 알뜰한", "[ˈpruːdnt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/063/063040.mp3", "It is prudent to save money for emergency needs.", "비상시를 위해 돈을 저축하는 것이 신중한 태도이다."),
        ("redundant", "불필요한, 중복되는", "[rɪˈdʌndənt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/066/066750.mp3", "Remove redundant words to make your text concise.", "글을 간결하게 만들기 위해 중복되는 단어를 제거하라."),
        ("subtle", "미묘한, 감지하기 힘든", "[ˈsʌtl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/077/077210.mp3", "There is a subtle difference between the two terms.", "두 용어 사이에는 미묘한 차이가 존재한다."),
        ("tenacious", "끈질긴, 집요한", "[təˈneɪʃəs]", "https://ssl.pstatic.net/dicimg/endic/audio/us/081/081450.mp3", "Her tenacious attitude brought ultimate victory.", "그녀의 끈질긴 태도가 궁극적인 승리를 가져왔다."),
        ("undermine", "약화시키다, 해치다", "[ˌʌndərˈmaɪn]", "https://ssl.pstatic.net/dicimg/endic/audio/us/086/086110.mp3", "Constant criticism can undermine self-confidence.", "지속적인 비판은 자존감을 약화시킬 수 있다."),
        ("versatile", "다재다능한, 다용도의", "[ˈvɜːrsətl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/089/089330.mp3", "She is a versatile artist who paints and sings.", "그녀는 그림도 그리고 노래도 부르는 다재다능한 아티스트다."),
        ("aesthetic", "미학적인, 심미적인", "[esˈθetɪk]", "https://ssl.pstatic.net/dicimg/endic/audio/us/001/001640.mp3", "The interior design has a clean pastel aesthetic.", "인테리어 디자인이 깔끔한 파스텔톤 미감을 자랑한다."),
        ("benevolent", "자비로운, 친절한", "[bəˈnevələnt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/008/008240.mp3", "A benevolent volunteer helped the lost child.", "자비로운 자원봉사자가 길 잃은 아이를 도왔다."),
        ("comprehensive", "포괄적인, 종합적인", "[ˌkɑːmprɪˈhensɪv]", "https://ssl.pstatic.net/dicimg/endic/audio/us/017/017990.mp3", "This guide offers a comprehensive study overview.", "이 가이드는 종합적인 학습 개요를 제공한다."),
        ("diligent", "근면한, 부지런한", "[ˈdɪlɪdʒənt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/023/023980.mp3", "Diligent effort is the secret to high exam scores.", "부지런한 노력은 수능 고득점의 비결이다."),
        ("empathy", "공감, 감정이입", "[ˈempəθi]", "https://ssl.pstatic.net/dicimg/endic/audio/us/027/027380.mp3", "Empathy enables us to understand others deeply.", "공감 능력은 우리가 타인을 깊이 이해할 수 있게 해준다."),
        ("formidable", "만만치 않은, 가공할", "[ˈfɔːrmɪdəbl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/033/033710.mp3", "They faced a formidable team in the finals.", "그들은 결승전에서 만만치 않은 팀을 상대했다."),
        ("genuine", "진짜의, 진심 어린", "[ˈdʒenjuɪn]", "https://ssl.pstatic.net/dicimg/endic/audio/us/035/035820.mp3", "He showed genuine care for his classmates.", "그는 반 친구들에게 진심 어린 관심을 보였다."),
        ("harmony", "조화, 하모니", "[ˈhɑːrməni]", "https://ssl.pstatic.net/dicimg/endic/audio/us/038/038310.mp3", "Living in harmony with nature is essential.", "자연과 조화를 이루며 사는 것이 필수적이다."),
        ("impartial", "공정한, 치우치지 않은", "[ɪmˈpɑːrʃl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/040/040050.mp3", "A judge must remain strictly impartial in court.", "판사는 법정에서 엄격히 공정해야 한다."),
        ("jubilant", "환희에 찬, 승리감에 넘치는", "[ˈdʒuːbɪlənt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/043/043740.mp3", "The crowd was jubilant after the exam results came.", "합격 발표 후 사람들은 환희에 차 있었다.")
    ]

    # Helper function to generate 30 mock words for other 9 sets
    def build_set_words(prefix_name, theme_tag):
        words_pool = [
            ("unprecedented", "전례 없는, 미증유의", "[ʌnˈpresɪdentɪd]", "https://ssl.pstatic.net/dicimg/endic/audio/us/087/087450.mp3", "An unprecedented score was achieved by the student.", "그 학생은 전례 없는 성적을 거두었다."),
            ("ambiguity", "모호성, 다의성", "[ˌæmbɪˈɡjuːəti]", "https://ssl.pstatic.net/dicimg/endic/audio/us/003/003410.mp3", "Clear language reduces ambiguity in communication.", "명확한 언어는 소통 시 모호성을 줄여준다."),
            ("ubiquitous", "어디에나 있는, 보편적인", "[juːˈbɪkwɪtəs]", "https://ssl.pstatic.net/dicimg/endic/audio/us/085/085890.mp3", "Digital technology is ubiquitous in modern education.", "디지털 기술은 현대 교육 어디에나 존재한다."),
            ("superfluous", "불필요한, 과잉의", "[suːˈpɜːrfluəs]", "https://ssl.pstatic.net/dicimg/endic/audio/us/077/077610.mp3", "Omit superfluous words to improve writing clarity.", "글의 명확성을 위해 불필요한 단어를 생략하라."),
            ("dichotomy", "이분법, 양분", "[daɪˈkɑːtəmi]", "https://ssl.pstatic.net/dicimg/endic/audio/us/023/023410.mp3", "Avoid binary dichotomy in complex moral issues.", "복잡한 도덕적 문제에서 이분법을 피하라."),
            ("coercion", "강제, 강요", "[koʊˈɜːrʒn]", "https://ssl.pstatic.net/dicimg/endic/audio/us/017/017510.mp3", "Learning works best with motivation, not coercion.", "학습은 강요가 아닌 동기부여로 가장 잘 이루어진다."),
            ("paradigm", "패러다임, 전형적인 틀", "[ˈpærədaɪm]", "https://ssl.pstatic.net/dicimg/endic/audio/us/057/057390.mp3", "This invention created a paradigm shift.", "이 발명은 패러다임의 전환을 가져왔다."),
            ("sustainable", "지속 가능한", "[səˈsteɪnəbl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/078/078210.mp3", "We need a sustainable habit for long-term prep.", "장기 시험을 위한 지속 가능한 습관이 필요하다."),
            ("inevitable", "피할 수 없는, 불가피한", "[ɪnˈevɪtəbl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/040/040820.mp3", "Mistakes are an inevitable part of learning.", "실수는 학습의 피할 수 없는 일부이다."),
            ("accomplish", "성취하다, 완수하다", "[əˈkɑːmplɪʃ]", "https://ssl.pstatic.net/dicimg/endic/audio/us/001/001530.mp3", "She accomplished all her daily study goals.", "그녀는 오늘의 모든 공부 목표를 완수했다."),
            ("subsequent", "그 다음의, 차후의", "[ˈsʌbsɪkwənt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/077/077120.mp3", "Subsequent tests showed great improvement.", "차후 테스트에서 큰 성적 향상을 보였다."),
            ("perceive", "인식하다, 감지하다", "[pərˈsiːv]", "https://ssl.pstatic.net/dicimg/endic/audio/us/058/058420.mp3", "Perceive challenges as opportunities for growth.", "도전을 성장의 기회로 인식해라."),
            ("cognitive", "인식의, 인지의", "[ˈkɑːɡnətɪv]", "https://ssl.pstatic.net/dicimg/endic/audio/us/017/017610.mp3", "Cognitive exercises sharpen memory retention.", "인지 훈련은 기억력을 더 예리하게 해준다."),
            ("hypothesis", "가설, 전제", "[haɪˈpɑːθəsɪs]", "https://ssl.pstatic.net/dicimg/endic/audio/us/039/039890.mp3", "Test your hypothesis with empirical research.", "실증적인 연구로 가설을 검증하라."),
            ("empirical", "실증적인, 경험에 의한", "[ɪmˈpɪrɪkl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/028/028820.mp3", "Empirical data supports the conclusion.", "실증적 데이터가 그 결론을 뒷받침한다."),
            ("advocate", "옹호하다, 주장하다", "[ˈædvəkeɪt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/001/001610.mp3", "She advocates for educational equality.", "그녀는 교육적 평등을 옹호한다."),
            ("benevolent", "자비로운, 인자한", "[bəˈnevələnt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/008/008240.mp3", "A benevolent gesture warmed everyone's heart.", "자비로운 행동이 모두의 마음을 따뜻하게 했다."),
            ("chronological", "연대기순의, 발생 순서대로의", "[ˌkrɑːnəˈlɑːdʒɪkl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/016/016320.mp3", "List events in chronological order.", "사건들을 연대기순으로 나열하라."),
            ("deteriorate", "악화되다, 저하되다", "[dɪˈtɪriəreɪt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/022/022880.mp3", "Don't let fatigue deteriorate your focus.", "피로가 집중력을 악화시키지 않게 하라."),
            ("exacerbate", "악화시키다, 더욱 심하게 하다", "[ɪɡˈzæsərbeɪt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/029/029630.mp3", "Stress can exacerbate health issues.", "스트레스는 건강 문제를 악화시킬 수 있다."),
            ("fluctuate", "변동하다, 요동치다", "[ˈflʌktʃueɪt]", "https://ssl.pstatic.net/dicimg/endic/audio/us/033/033090.mp3", "Test scores may fluctuate during preparation.", "수험 기간 동안 성적은 변동할 수 있다."),
            ("gregarious", "사교적인, 군집성의", "[ɡrɪˈɡeriəs]", "https://ssl.pstatic.net/dicimg/endic/audio/us/037/037020.mp3", "She is gregarious and loves study groups.", "그녀는 사교적이어서 스터디 모임을 좋아한다."),
            ("hierarchy", "계급, 위계 질서", "[ˈhaɪərɑːrki]", "https://ssl.pstatic.net/dicimg/endic/audio/us/039/039120.mp3", "Clear font hierarchy improves visual readability.", "명확한 폰트 하이어라키는 시각적 가독성을 높인다."),
            ("indispensable", "없어서는 안 될, 필수적인", "[ˌɪndɪˈspensəbl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/040/040920.mp3", "Vocabulary is indispensable for reading comprehension.", "어휘력은 독해력을 위해 없어서는 안 될 요소다."),
            ("juxtapose", "병치하다, 나란히 놓다", "[ˌdʒʌkstəˈpoʊz]", "https://ssl.pstatic.net/dicimg/endic/audio/us/043/043890.mp3", "Juxtapose opposing ideas to contrast them.", "대립되는 아이디어를 병치하여 대조해라."),
            ("keen", "열심인, 날카로운, 예리한", "[kiːn]", "https://ssl.pstatic.net/dicimg/endic/audio/us/044/044090.mp3", "She has a keen interest in English literature.", "그녀는 영문학에 예리하고 깊은 관심을 가졌다."),
            ("legitimate", "합법적인, 정당한", "[lɪˈdʒɪtɪmət]", "https://ssl.pstatic.net/dicimg/endic/audio/us/044/044980.mp3", "He raised a legitimate concern regarding the test.", "그는 시험에 관해 정당한 우려를 제기했다."),
            ("manifest", "명백히 하다, 나타나다", "[ˈmænɪfest]", "https://ssl.pstatic.net/dicimg/endic/audio/us/046/046520.mp3", "Hard work manifests in great outcomes.", "열심히 한 노력은 훌륭한 결과로 나타난다."),
            ("negligible", "무시해도 될 정도의, 하찮은", "[ˈneɡlɪdʒəbl]", "https://ssl.pstatic.net/dicimg/endic/audio/us/050/050120.mp3", "The price difference was negligible.", "가격 차이는 무시해도 될 수준이었다."),
            ("ominous", "불길한, 징조가 안 좋은", "[ˈɑːmɪnəs]", "https://ssl.pstatic.net/dicimg/endic/audio/us/052/052820.mp3", "Dark clouds formed an ominous sky.", "어두운 구름이 불길한 하늘을 형성했다.")
        ]
        
        # Customize specific words per set by appending theme index tag
        res = []
        for i, (w, m, p, a, ex, exk) in enumerate(words_pool):
            unique_w = f"{w}_{prefix_name}" if i >= 20 else w
            res.append((unique_w, f"[{theme_tag}] {m}", p, a, ex, exk))
        return res

    exam_sets = [
        ("[해커스 보카] 수능 필수 고득점 영단어 3000 ✨", "해커스 수능 영단어 베스트셀러! 수능 및 평가원 모의고사 고득점 필수 단어 30선", s1_words),
        ("[EBS 수능특강] 2026 수능완성 핵심 어휘 🌸", "EBS 수능 특강/수능 완성 지문 연계! 킬러 문항 대비 출제 1순위 핵심 어휘 30선", build_set_words("ebs", "EBS연계")),
        ("[워드마스터] 수능 고난도 1등급 마스터 💖", "상위권 1등급 변별력을 가르는 수능 최고난도 영어 단어 30선 완벽 마스터", build_set_words("wm", "1등급고난도")),
        ("[능률 VOKA] 수능 기본 다지기 필수 어휘 🎀", "탄탄한 기본기를 쌓는 고1~고2 필수 어휘 및 수능 기본 고빈출 단어 30선", build_set_words("nv", "수능기본")),
        ("[대성마이맥] 수능 영어 킬러 구문 대비 어휘 ⚡", "평가원 6월/9월 모의고사 및 수능 31~34번 빈칸추론 킬러 문항 대비 어휘 30선", build_set_words("ds", "킬러구문")),
        ("[메가스터디] 수능 독해 빈출 어휘 BEST 🔮", "수능 영어 영역 지문 독해 시 자주 마주치는 핵심 문맥 어휘 30선 모음", build_set_words("ms", "독해고빈출")),
        ("[TOEIC/TEPS] 수능 & 대학입시 연계 어휘 🎓", "수시 입시, 학생부 종합 및 어학 특기자 전형 대비 고급 영단어 30선", build_set_words("tt", "대학입시")),
        ("[수능 어휘] 다의어 & 헷갈리는 영어 단어 💯", "문맥에 따라 뜻이 달라져 오답률을 높이는 수능 혼동 단어 30선 완벽 정리", build_set_words("cm", "다의어혼동")),
        ("[수능 영어] 핵심 숙어 & 전치사 관용구 💫", "지문 해석 속도를 2배 높여주는 필수 수능 관용구 및 구동사 30선", build_set_words("idiom", "수능숙어")),
        ("[영어독해] 인문·사회·과학 수능 종합 어휘 👑", "수능 통합형 지문에 자주 등장하는 인문학, 사회과학, 융합 지문 핵심 단어 30선", build_set_words("sub", "통합지문"))
    ]

    for title, desc, words in exam_sets:
        cursor.execute("INSERT INTO word_sets (title, description) VALUES (?, ?)", (title, desc))
        set_id = cursor.lastrowid

        for word, meaning, phonetic, audio, ex_en, ex_kr in words:
            cursor.execute("INSERT OR IGNORE INTO words (word, meaning, phonetic, audio_url, example_en, example_kr) VALUES (?, ?, ?, ?, ?, ?)",
                           (word, meaning, phonetic, audio, ex_en, ex_kr))
            cursor.execute("SELECT id FROM words WHERE word = ?", (word,))
            w_row = cursor.fetchone()
            if w_row:
                word_id = w_row[0]
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

    def strip_html(text):
        if not text:
            return ""
        if "<" in text:
            return BeautifulSoup(text, "html.parser").get_text().strip()
        return text.strip()

    api_urls = [
        f"https://en.dict.naver.com/api3/enko/search?query={urllib.parse.quote(cleaned_word)}",
        f"https://dict.naver.com/api3/enko/search?query={urllib.parse.quote(cleaned_word)}"
    ]

    for api_url in api_urls:
        try:
            res = requests.get(api_url, headers=headers, timeout=5)
            if res.status_code == 200:
                try:
                    data = res.json()
                    search_list_map = data.get("searchResultMap", {}).get("searchResultListMap", {})
                    
                    # 1. WORD items parsing
                    word_map = search_list_map.get("WORD", {})
                    items = word_map.get("items", [])
                    if items:
                        first_item = items[0]
                        means_collector = first_item.get("meansCollector", [])
                        meanings = []
                        for mc in means_collector:
                            for m in mc.get("means", []):
                                val = m.get("value") or m.get("mean")
                                if val:
                                    clean_val = strip_html(val)
                                    if clean_val and clean_val not in meanings:
                                        meanings.append(clean_val)
                        if meanings:
                            result["meaning"] = ", ".join(meanings)
                            
                        symbol_list = first_item.get("searchPhoneticSymbolList", [])
                        for sym in symbol_list:
                            if sym.get("symbolValue") and not result["phonetic"]:
                                result["phonetic"] = sym.get("symbolValue")
                            if sym.get("symbolFile") and not result["audio_url"]:
                                result["audio_url"] = sym.get("symbolFile")

                        if first_item.get("symbol") and not result["phonetic"]:
                            result["phonetic"] = first_item.get("symbol")
                        if first_item.get("soundUrl") and not result["audio_url"]:
                            result["audio_url"] = first_item.get("soundUrl")

                        examples_in_word = first_item.get("EXAMPLE", {}).get("items", []) or first_item.get("exampleList", [])
                        if examples_in_word:
                            first_ex = examples_in_word[0]
                            ex_en = first_ex.get("exampleOri") or first_ex.get("example_en") or ""
                            ex_kr = first_ex.get("exampleTrans") or first_ex.get("example_kr") or ""
                            if ex_en and not result["example_en"]:
                                result["example_en"] = strip_html(ex_en)
                            if ex_kr and not result["example_kr"]:
                                result["example_kr"] = strip_html(ex_kr)

                    # 2. Top-level EXAMPLE items parsing if not found in WORD item
                    if not result["example_en"]:
                        ex_map = search_list_map.get("EXAMPLE", {})
                        ex_items = ex_map.get("items", [])
                        if ex_items:
                            first_ex = ex_items[0]
                            ex_en = first_ex.get("expExample1") or first_ex.get("exampleOri") or first_ex.get("example_en") or ""
                            ex_kr = first_ex.get("expExample2") or first_ex.get("exampleTrans") or first_ex.get("example_kr") or ""
                            if ex_en:
                                result["example_en"] = strip_html(ex_en)
                            if ex_kr:
                                result["example_kr"] = strip_html(ex_kr)

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


@app.route("/api/words/lookup", methods=["GET"])
def lookup_word():
    """Real-time word lookup for preview (does NOT save to DB)."""
    word_text = request.args.get("word", "").strip().lower()
    if not word_text:
        return jsonify({"error": "word parameter required"}), 400

    # Check if already in DB
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT word, meaning, phonetic, audio_url, example_en, example_kr FROM words WHERE word = ?", (word_text,))
    existing = cursor.fetchone()
    conn.close()

    if existing and existing["meaning"] and not existing["meaning"].endswith("(뜻 정보를 입력해주세요)"):
        return jsonify(dict(existing)), 200

    # Fetch from Naver dictionary
    result = fetch_naver_dictionary(word_text)
    return jsonify(result), 200


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "English Memory Backend is Live"}), 200

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
        ORDER BY ws.id DESC;
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
        
        is_fallback_meaning = not word_data["meaning"] or word_data["meaning"].endswith("(뜻 정보를 입력해주세요)")
        is_missing_details = not word_data.get("phonetic") or not word_data.get("example_en")
        
        if is_fallback_meaning or is_missing_details or data.get("meaning"):
            dict_data = fetch_naver_dictionary(word_text)
            new_meaning = data.get("meaning") or dict_data.get("meaning") or word_data["meaning"]
            new_phonetic = data.get("phonetic") or dict_data.get("phonetic") or word_data.get("phonetic", "")
            new_audio_url = data.get("audio_url") or dict_data.get("audio_url") or word_data.get("audio_url", "")
            new_example_en = data.get("example_en") or dict_data.get("example_en") or word_data.get("example_en", "")
            new_example_kr = data.get("example_kr") or dict_data.get("example_kr") or word_data.get("example_kr", "")
            
            cursor.execute("""
                UPDATE words
                SET meaning = ?, phonetic = ?, audio_url = ?, example_en = ?, example_kr = ?
                WHERE id = ?
            """, (new_meaning, new_phonetic, new_audio_url, new_example_en, new_example_kr, word_id))
            
            word_data.update({
                "meaning": new_meaning,
                "phonetic": new_phonetic,
                "audio_url": new_audio_url,
                "example_en": new_example_en,
                "example_kr": new_example_kr
            })
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
