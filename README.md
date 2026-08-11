# English Memory (영단어 암기 & 테스트 웹서비스)

개인 블로그 서브 경로(`iontop.github.io/english_memory`)를 활용한 소규모 모바일 반응형 영단어 암기 및 테스트 웹 애플리케이션입니다.

## 주요 기능 및 스펙

- **백엔드 (Backend):** Python 3.10+, Flask, SQLite 3, Requests, BeautifulSoup4, Gunicorn
- **프론트엔드 (Frontend):** HTML5, Vanilla JavaScript (ES6+), Tailwind CSS (CDN), FontAwesome Icons
- **네이버 사전 자동 수집 (Auto Scraping & API Parsing):**
  - 영단어 입력 시 네이버 사전 API 및 웹 데이터로부터 뜻(`meaning`), 발음기호(`phonetic`), MP3 발음 링크(`audio_url`), 예문 및 한글 번역(`example_en`, `example_kr`)을 자동 파싱하여 저장
  - 다중 폴백(FreeDictionaryAPI + Web Speech Synthesis) 내장으로 수집 안정성 확보
- **데이터베이스 (N:M 다대다 매핑):**
  - `word_sets`: 단어 세트 테이블 (제목, 설명, 생성일)
  - `words`: 단어 Master 테이블 (`word` UNIQUE 제약 조건)
  - `set_words`: 단어 세트 - 단어 매핑 테이블 (`FOREIGN KEY ON DELETE CASCADE`)
- **플래시카드 3D 학습 모드:**
  - Front: 영단어 + 발음기호 + 🔊 MP3 재생 버튼
  - Back: 한글 뜻 + 예문 및 번역
  - 방향키([←], [→], [Space]) 키보드 숏컷 지원 & 단어 순서 섞기(Shuffle)
- **3종류 테스트 / 퀴즈 모드:**
  - 1) 객관식 퀴즈 (영단어 제시 ➔ 4지 선다 한글 뜻 맞추기)
  - 2) 주관식 퀴즈 (한글 뜻 제시 ➔ 영단어 스펠링 작성)
  - 3) 듣기 테스트 (🔊 발음 재생 ➔ 스펠링 작성)
  - 4) 틀린 단어 모아보기 & 재시험 기능 지원

---

## 프로젝트 구조 (Directory Structure)

```
english_memory/
├── app.py              # Flask 백엔드 서버 및 REST API, DB 초기화, 네이버 사전 파서
├── test_app.py         # 백엔드 REST API 유닛테스트 수트
├── requirements.txt    # 백엔드 의존성 패키지 목록
├── Procfile            # Render 백엔드 배포용 설정
├── index.html          # 모바일 퍼스트 프론트엔드 SPA 웹페이지
├── css/
│   └── styles.css      # Custom 3D Flashcard & Glassmorphism 디자인 시스템
└── js/
    ├── config.js       # 백엔드 API BASE URL 설정
    └── app.js          # SPA 라우터, API 바인딩, 학습 및 퀴즈 엔진
```

---

## 로컬 실행 가이드 (Local Development)

### 1. 백엔드 실행
```bash
cd /Users/junhoahn/Python/english_memory

# 의존성 패키지 설치
pip install -r requirements.txt

# Flask 서버 실행
python app.py
```
* 서버가 `http://127.0.0.1:5000` 에서 시작됩니다.

### 2. 백엔드 유닛테스트 실행
```bash
python test_app.py
```

### 3. 브라우저 접속
- `http://127.0.0.1:5000` 으로 접속하면 로컬에서 완벽하게 구동되는 서비스를 확인할 수 있습니다.

---

## 무료 배포 가이드 (Deployment Guide)

### 1) 백엔드 배포 (Render Free Tier)
1. [Render.com](https://render.com) 접속 및 가입
2. **New Web Service** 생성
3. GitHub 리포지토리 연동 (`english_memory`)
4. **Environment:** Python 3
5. **Build Command:** `pip install -r requirements.txt`
6. **Start Command:** `gunicorn app:app`
7. 배포 완료 후 부여받은 Render URL (예: `https://english-memory-backend.onrender.com`) 복사

### 2) 프론트엔드 배포 (GitHub Pages)
1. `js/config.js` 파일의 `PRODUCTION_API_BASE` 상수를 위에서 복사한 Render URL로 업데이트:
   ```javascript
   PRODUCTION_API_BASE: "https://your-render-app.onrender.com/api"
   ```
2. GitHub 리포지토리(`iontop.github.io` 또는 `english_memory`)에 푸시
3. Repository Settings ➔ **Pages** ➔ Branch: `main` (`/root` 또는 `/docs`) 선택 후 Save
4. `https://iontop.github.io/english_memory` 도메인으로 서비스 무료 배포 완료!
