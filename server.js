const express = require('express');
const path = require('path');
const LocalNaverAdMonitor = require('./naver_ad_monitor');
const { globalProgress } = require('./naver_ad_monitor');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON 파싱 미들웨어 추가
app.use(express.json());
// 프론트엔드 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 광고 순위 병렬 수집 API
app.post('/api/collect', async (req, res) => {
  const keywords = req.body && Array.isArray(req.body.keywords) ? req.body.keywords : undefined;
  const searchMode = req.body && req.body.searchMode ? req.body.searchMode : 'mobile'; // 기본값: 모바일
  
  try {
    // 결과 배열 초기화
    globalProgress.results = [];
    globalProgress.running = true;
    
    if (searchMode === 'both') {
      // 전체 모드: PC와 모바일 동시 수집
      const pcMonitor = new LocalNaverAdMonitor({ headless: true, keywords, isMobile: false, mode: 'pc' });
      const mobileMonitor = new LocalNaverAdMonitor({ headless: true, keywords, isMobile: true, mode: 'mobile' });
      
      await pcMonitor.initialize();
      await mobileMonitor.initialize();
      
      // 병렬로 수집
      await Promise.all([
        pcMonitor.scrapeAllKeywordsParallel(3),
        mobileMonitor.scrapeAllKeywordsParallel(3)
      ]);
      
      await pcMonitor.cleanup();
      await mobileMonitor.cleanup();
    } else {
      // 단일 모드
      const isMobile = searchMode === 'mobile';
      const monitor = new LocalNaverAdMonitor({ headless: true, keywords, isMobile });
      await monitor.initialize();
      await monitor.scrapeAllKeywordsParallel(5);
      await monitor.cleanup();
    }
    
    globalProgress.running = false;
    res.json({ success: true });
  } catch (error) {
    globalProgress.running = false;
    res.status(500).json({ success: false, error: error.message });
  }
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