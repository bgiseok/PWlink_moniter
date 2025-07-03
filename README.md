# 🎯 Powerlink Rank Monitor

네이버 모바일 검색에서 파워링크 광고 순위를 자동으로 수집하고 모니터링하는 도구입니다.

## 📁 프로젝트 구조
```
powerlink-rank/
├── naver_ad_monitor.js     # 메인 스크립트
├── package.json            # 의존성 설정
├── README.md              # 이 파일
├── naver_rankings_local.json  # 수집 데이터 (실행 후 생성)
└── naver_rankings_local.csv   # CSV 데이터 (실행 후 생성)
```

## 🚀 설치 및 실행

### 1단계: 프로젝트 폴더로 이동
```bash
cd /Users/byeongiseog/Downloads/powerlink-rank
```

### 2단계: 의존성 설치
```bash
npm install
```

### 3단계: 실행

#### 🔍 테스트 실행 (한 번만 수집)
```bash
npm run once
```

#### 🎯 자동 모니터링 시작 (30분 간격)
```bash
npm start
```

#### 📊 통계 보기
```bash
npm run stats
```

#### 📈 CSV 내보내기
```bash
npm run csv
```

## ⚙️ 설정 변경

`naver_ad_monitor.js` 파일에서 다음 설정을 변경할 수 있습니다:

```javascript
const monitor = new LocalNaverAdMonitor({
  keywords: [
    '전화영어', '화상영어', '온라인영어', '영어회화', '토익스피킹',
    '영어학원', '영어과외', '비즈니스영어', '토플스피킹', '오픽',
    '영어공부', '영어말하기', '성인영어', '무료영어', '영어앱'
  ],
  intervalMinutes: 30,      // 수집 간격 (분)
  maxRankings: 5,           // 최대 수집 순위
  headless: true,           // false로 하면 브라우저 창 보임
  logFile: 'naver_rankings_local.json'  // 저장 파일명
});
```

## 📊 출력 파일

### JSON 데이터 (`naver_rankings_local.json`)
- 전체 수집 히스토리
- 타임스탬프별 상세 정보
- 성공/실패 통계

### CSV 데이터 (`naver_rankings_local.csv`)
- 엑셀에서 바로 열 수 있는 형식
- 날짜, 시간, 키워드, 브랜드, 순위, URL 정보

## 🎮 사용법

### 기본 명령어
```bash
# 프로젝트 폴더로 이동
cd /Users/byeongiseog/Downloads/powerlink-rank

# 의존성 설치 (처음 한 번만)
npm install

# 테스트 실행
npm run once

# 자동 모니터링 시작
npm start

# 통계 보기
npm run stats

# CSV 내보내기
npm run csv
```

### 모니터링 중 명령어
- **Enter 키**: 즉시 수집 실행
- **Ctrl+C**: 모니터링 중지

## 🔧 고급 설정

### 키워드 변경
스크립트 파일에서 `keywords` 배열을 수정하세요:
```javascript
keywords: [
  '당신의키워드1', '당신의키워드2', '당신의키워드3'
]
```

### 수집 간격 변경
```javascript
intervalMinutes: 60  // 60분 간격으로 변경
```

### 브라우저 창 보기 (디버깅용)
```javascript
headless: false  // 브라우저 창이 열려서 동작을 볼 수 있음
```

## 📈 출력 예시

### 콘솔 출력
```
🎯 전체 수집 시작 (10개 키워드)

🔍 "전화영어" 스크래핑 중...
✅ "전화영어" 완료: 3개 브랜드 발견

🏆 === 현재 광고 순위 ===

📌 [전화영어]
   1위: 스픽
   2위: 캠블리
   3위: 엔구

🚨 === 순위 변동 감지 ===
📈 [전화영어] 스픽: 2위 → 1위 (↑1)
📉 [전화영어] 캠블리: 1위 → 2위 (↓1)
```

## 💡 사용 팁

1. **처음 사용**: `npm run once`로 테스트 후 `npm start`로 모니터링 시작
2. **브라우저 확인**: 문제가 있으면 `headless: false`로 설정해서 확인
3. **차단 방지**: 수집 간격을 너무 짧게 하지 마세요 (최소 30분 권장)
4. **데이터 백업**: JSON/CSV 파일을 정기적으로 백업하세요
5. **키워드 최적화**: 너무 많은 키워드는 차단 위험을 높일 수 있습니다

## 🚨 문제 해결

### Puppeteer 설치 오류
```bash
npm install puppeteer --force
```

### 권한 오류 (macOS)
```bash
sudo npm install
```

### 차단당한 경우
- `intervalMinutes`를 더 크게 설정 (60분 이상)
- 키워드 수를 줄이기
- 잠시 대기 후 재시도

### 브라우저 실행 오류
- Chrome/Chromium이 설치되어 있는지 확인
- 시스템 재시작 후 재시도

## 📞 지원

문제가 있거나 개선 사항이 있으면 언제든 말씀해주세요!