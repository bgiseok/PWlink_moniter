const express = require('express');
const path = require('path');
const LocalNaverAdMonitor = require('./naver_ad_monitor');
const { globalProgress } = require('./naver_ad_monitor');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON 파싱 미들웨어 추가
app.use(express.json());
// 프론트엔드 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'docs')));
app.use(cors());

// 광고 순위 병렬 수집 API (임시: 바로 응답)
app.post('/api/collect', async (req, res) => {
  res.json({ success: true, message: "임시 응답: 크롤러 미실행" });
});

// 진행상황 반환 API
app.get('/api/progress', (req, res) => {
  res.json(globalProgress);
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

// CSV 다운로드 API 추가
app.get('/api/csv', (req, res) => {
  const csvPath = path.join(__dirname, 'naver_rankings_local.csv');
  if (fs.existsSync(csvPath)) {
    res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
    res.setHeader('Content-Disposition', 'attachment; filename="naver_rankings_local.csv"');
    res.sendFile(csvPath);
  } else {
    res.status(404).send('CSV 파일이 존재하지 않습니다.');
  }
});

// 루트로 접속 시 임시 텍스트 반환
app.get('/', (req, res) => {
  res.send('서버 정상 동작 중!');
}); 