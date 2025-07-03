// const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 진행상황 저장용 글로벌 변수
let globalProgress = {
  total: 0,
  done: 0,
  started: 0,
  results: [],
  running: false
};

// 모바일 User-Agent 리스트
const MOBILE_USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 10; SM-G973N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.94 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1'
];

// PC User-Agent 리스트
const PC_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

// class LocalNaverAdMonitor {
//   constructor(options = {}) {
//     // PC와 모바일 URL 설정
//     this.pcUrl = 'https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=';
//     this.mobileUrl = 'https://m.search.naver.com/search.naver?sm=mtp_hty.top&where=m&query=';
//     this.isMobile = options.isMobile !== false; // 기본값: 모바일
//     this.mode = options.mode || (this.isMobile ? 'mobile' : 'pc'); // 모드 정보 추가
//     this.baseUrl = this.isMobile ? this.mobileUrl : this.pcUrl;
//     
//     this.keywords = options.keywords || [
//       '전화영어', '화상영어', '온라인영어', '영어회화', '토익스피킹',
//       '영어학원', '영어과외', '비즈니스영어', '토플스피킹', '오픽',
//       '영어공부', '영어말하기', '성인영어', '무료영어', '영어앱'
//     ];
//     this.intervalMinutes = options.intervalMinutes || 30;
//     this.maxRankings = options.maxRankings || 5;
//     this.headless = options.headless !== false; // 기본값: headless
//     this.browser = null;
//     this.page = null;
//     this.isRunning = false;
//     this.logFile = options.logFile || 'naver_rankings_local.json';
//   }
//
//   // 브라우저 초기화
//   async initialize() {
//     try {
//       console.log('🚀 브라우저 초기화 중...');
//       this.browser = await puppeteer.launch({
//         headless: this.headless,
//         args: [
//           '--no-sandbox',
//           '--disable-setuid-sandbox',
//           '--disable-dev-shm-usage',
//           '--disable-web-security',
//           '--disable-blink-features=AutomationControlled',
//           // User-Agent는 페이지별로 설정
//         ]
//       });
//       this.page = await this.browser.newPage();
//       
//       // PC와 모바일에 따른 기본 뷰포트 설정
//       if (this.isMobile) {
//         await this.page.setViewport({ 
//           width: 375, 
//           height: 667, 
//           isMobile: true,
//           hasTouch: true,
//           deviceScaleFactor: 2
//         });
//       } else {
//         await this.page.setViewport({ 
//           width: 1366, 
//           height: 768, 
//           isMobile: false
//         });
//       }
//       
//       console.log(`✅ 브라우저 초기화 완료 (${this.isMobile ? 'Mobile' : 'PC'} 모드, Headless: ${this.headless})`);
//       return true;
//     } catch (error) {
//       console.error('❌ 브라우저 초기화 실패:', error);
//       return false;
//     }
//   }
//
//   // 키워드별 광고 순위 수집 (페이지 분리, 탐지 우회)
//   async scrapeKeyword(keyword) {
//     let page = null;
//     try {
//       const encodedKeyword = encodeURIComponent(keyword);
//       const url = `${this.baseUrl}${encodedKeyword}`;
//       
//       // PC/모바일에 따른 User-Agent 랜덤 적용
//       const userAgents = this.isMobile ? MOBILE_USER_AGENTS : PC_USER_AGENTS;
//       const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
//       
//       page = await this.browser.newPage();
//       await page.setUserAgent(randomUA);
//       
//       // PC/모바일에 따른 뷰포트 설정
//       if (this.isMobile) {
//         await page.setViewport({ 
//           width: 375, 
//           height: 667, 
//           isMobile: true,
//           hasTouch: true,
//           deviceScaleFactor: 2
//         });
//       } else {
//         await page.setViewport({ 
//           width: 1366, 
//           height: 768, 
//           isMobile: false
//         });
//       }
//       // Puppeteer 탐지 우회
//       await page.evaluateOnNewDocument(() => {
//         Object.defineProperty(navigator, 'webdriver', { get: () => false });
//         window.navigator.chrome = { runtime: {} };
//         Object.defineProperty(navigator, 'languages', { get: () => ['ko-KR', 'ko'] });
//         Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
//       });
//       console.log(`�� "${keyword}" 스크래핑 중 (${this.isMobile ? 'Mobile' : 'PC'} 모드)...`);
//       console.log(`   URL: ${url}`);
//       console.log(`   User-Agent: ${randomUA.substring(0, 50)}...`);
//       await page.goto(url, { 
//         waitUntil: 'networkidle2',
//         timeout: 30000 
//       });
//       // 페이지 로딩 대기
//       await page.waitForTimeout(3000);
//
//       // 광고 브랜드 추출 - PC와 모바일에 맞는 셀렉터 사용
//       const rankings = await page.evaluate((maxRankings, isMobile) => {
//         let liList;
//         
//         if (isMobile) {
//           // 모바일 셀렉터
//           liList = document.querySelectorAll('#power_link_body > li');
//         } else {
//           // PC 셀렉터 - 모바일과 동일한 구조 사용
//           liList = document.querySelectorAll('#power_link_body > ul > li');
//         }
//         
//         const results = [];
//         for (let i = 0; i < Math.min(liList.length, maxRankings); i++) {
//           const li = liList[i];
//           let brandName = '';
//           let url = '';
//           
//           if (isMobile) {
//             // 모바일용 셀렉터
//             const brandSpan = li.querySelector('div.tit_wrap > div > a > div.url_area > div > span.site');
//             brandName = brandSpan ? brandSpan.textContent.trim() : '';
//             const linkElement = brandSpan ? brandSpan.closest('a') : null;
//             url = linkElement ? linkElement.href : '';
//           } else {
//             // PC용 셀렉터 - div.title_url_area > div > a.site
//             const brandElement = li.querySelector('div.title_url_area > div > a.site');
//             if (brandElement) {
//               brandName = brandElement.textContent.trim();
//             }
//             
//             const linkElement = li.querySelector('a');
//             url = linkElement ? linkElement.href : '';
//           }
//           
//           results.push({
//             rank: i + 1,
//             brandName: brandName, // 브랜드명이 없으면 빈 문자열
//             timestamp: new Date().toISOString(),
//             url: url
//           });
//         }
//         return results;
//       }, this.maxRankings, this.isMobile);
//
//       console.log(`✅ "${keyword}" 완료: ${rankings.length}개 광고 발견 (${this.isMobile ? 'Mobile' : 'PC'})`);
//       if (rankings.length > 0) {
//         rankings.forEach(r => {
//           console.log(`   ${r.rank}위: ${r.brandName || '(브랜드명 없음)'}`);
//         });
//       }
//       
//       await page.close();
//       return {
//         keyword,
//         rankings,
//         timestamp: new Date().toISOString(),
//         mode: this.mode, // 모드 정보 추가
//         success: true
//       };
//       
//     } catch (error) {
//       if (page) await page.close();
//       console.error(`❌ "${keyword}" 스크래핑 실패:`, error.message);
//       return {
//         keyword,
//         rankings: [],
//         error: error.message,
//         timestamp: new Date().toISOString(),
//         mode: this.mode, // 모드 정보 추가
//         success: false
//       };
//     }
//   }
//
//   // 모든 키워드 순차 처리
//   async scrapeAllKeywords() {
//     const startTime = Date.now();
//     console.log(`\n🎯 전체 수집 시작 (${this.keywords.length}개 키워드)`);
//     
//     const results = [];
//     
//     for (const keyword of this.keywords) {
//       const result = await this.scrapeKeyword(keyword);
//       results.push(result);
//       
//       // 키워드 간 간격 (차단 방지) - 조금 더 길게 설정
//       if (this.keywords.indexOf(keyword) < this.keywords.length - 1) {
//         const delay = 2000 + Math.random() * 1000; // 2-3초 랜덤 지연
//         await this.page.waitForTimeout(delay);
//       }
//     }
//     
//     const endTime = Date.now();
//     const duration = (endTime - startTime) / 1000;
//     
//     console.log(`\n📊 수집 완료!`);
//     console.log(`⏱️  총 소요시간: ${duration.toFixed(1)}초`);
//     console.log(`✅ 성공: ${results.filter(r => r.success).length}개`);
//     console.log(`❌ 실패: ${results.filter(r => !r.success).length}개`);
//     
//     return results;
//   }
//
//   // 데이터 저장
//   async saveResults(results) {
//     try {
//       let existingData = [];
//       
//       // 기존 데이터 로드
//       if (fs.existsSync(this.logFile)) {
//         const fileContent = fs.readFileSync(this.logFile, 'utf8');
//         existingData = JSON.parse(fileContent);
//       }
//
//       // 새 데이터 추가
//       const newEntry = {
//         timestamp: new Date().toISOString(),
//         date: new Date().toLocaleDateString('ko-KR'),
//         time: new Date().toLocaleTimeString('ko-KR'),
//         totalKeywords: this.keywords.length,
//         successCount: results.filter(r => r.success).length,
//         failureCount: results.filter(r => !r.success).length,
//         results: results
//       };
//
//       existingData.push(newEntry);
//
//       // 파일 저장
//       fs.writeFileSync(this.logFile, JSON.stringify(existingData, null, 2), 'utf8');
//       
//       console.log(`💾 데이터 저장 완료: ${this.logFile}`);
//       
//       // 현재 순위 출력
//       console.log('\n🏆 === 현재 광고 순위 ===');
//       results.forEach(result => {
//         if (result.success && result.rankings.length > 0) {
//           console.log(`\n📌 [${result.keyword}]`);
//           result.rankings.forEach(ranking => {
//             console.log(`   ${ranking.rank}위: ${ranking.brandName}`);
//           });
//         } else if (!result.success) {
//           console.log(`\n❌ [${result.keyword}] 수집 실패: ${result.error}`);
//         }
//       });
//       console.log('========================\n');
//       
//     } catch (error) {
//       console.error('❌ 데이터 저장 실패:', error);
//     }
//   }
//
//   // CSV 내보내기
//   async exportToCSV() {
//     try {
//       if (!fs.existsSync(this.logFile)) {
//         console.log('저장된 데이터가 없습니다.');
//         return;
//       }
//
//       const data = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
//       // BOM 추가 + 컬럼명 한글로 변경
//       let csvContent = '\uFEFF날짜,시간,키워드,브랜드,순위,URL\n';
//
//       data.forEach(entry => {
//         entry.results.forEach(result => {
//           if (result.success) {
//             result.rankings.forEach(ranking => {
//               csvContent += `"${entry.date}","${entry.time}","${result.keyword}","${ranking.brandName}",${ranking.rank},"${ranking.url || ''}"\n`;
//             });
//           }
//         });
//       });
//
//       const csvFile = this.logFile.replace('.json', '.csv');
//       fs.writeFileSync(csvFile, csvContent, 'utf8');
//       console.log(`📈 CSV 내보내기 완료: ${csvFile}`);
//     } catch (error) {
//       console.error('❌ CSV 내보내기 실패:', error);
//     }
//   }
//
//   // 통계 분석
//   async showStats() {
//     try {
//       if (!fs.existsSync(this.logFile)) {
//         console.log('저장된 데이터가 없습니다.');
//         return;
//       }
//
//       const data = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
//       
//       console.log('\n📊 === 수집 통계 ===');
//       console.log(`총 수집 횟수: ${data.length}회`);
//       
//       if (data.length > 0) {
//         const latestEntry = data[data.length - 1];
//         console.log(`최근 수집: ${latestEntry.date} ${latestEntry.time}`);
//         console.log(`최근 성공률: ${latestEntry.successCount}/${latestEntry.totalKeywords} (${(latestEntry.successCount/latestEntry.totalKeywords*100).toFixed(1)}%)`);
//         
//         // 브랜드별 출현 빈도
//         const brandStats = {};
//         const keywordStats = {};
//         
//         data.forEach(entry => {
//           entry.results.forEach(result => {
//             if (result.success) {
//               // 키워드별 통계
//               if (!keywordStats[result.keyword]) {
//                 keywordStats[result.keyword] = { totalCollections: 0, successfulCollections: 0, totalAds: 0 };
//               }
//               keywordStats[result.keyword].totalCollections++;
//               keywordStats[result.keyword].successfulCollections++;
//               keywordStats[result.keyword].totalAds += result.rankings.length;
//               
//               // 브랜드별 통계
//               result.rankings.forEach(ranking => {
//                 if (!brandStats[ranking.brandName]) {
//                   brandStats[ranking.brandName] = { count: 0, ranks: [], keywords: new Set() };
//                 }
//                 brandStats[ranking.brandName].count++;
//                 brandStats[ranking.brandName].ranks.push(ranking.rank);
//                 brandStats[ranking.brandName].keywords.add(result.keyword);
//               });
//             } else {
//               // 실패한 키워드 통계
//               if (!keywordStats[result.keyword]) {
//                 keywordStats[result.keyword] = { totalCollections: 0, successfulCollections: 0, totalAds: 0 };
//               }
//               keywordStats[result.keyword].totalCollections++;
//             }
//           });
//         });
//
//         console.log('\n🏅 브랜드별 출현 빈도 (상위 10개):');
//         Object.entries(brandStats)
//           .sort(([,a], [,b]) => b.count - a.count)
//           .slice(0, 10)
//           .forEach(([brand, stats]) => {
//             const avgRank = stats.ranks.reduce((a, b) => a + b, 0) / stats.ranks.length;
//             console.log(`   ${brand}: ${stats.count}회 출현, 평균 ${avgRank.toFixed(1)}위, ${stats.keywords.size}개 키워드`);
//           });
//
//         console.log('\n📊 키워드별 수집 성공률:');
//         Object.entries(keywordStats)
//           .sort(([,a], [,b]) => b.successfulCollections - a.successfulCollections)
//           .forEach(([keyword, stats]) => {
//             const successRate = (stats.successfulCollections / stats.totalCollections * 100).toFixed(1);
//             const avgAds = stats.successfulCollections > 0 ? (stats.totalAds / stats.successfulCollections).toFixed(1) : '0';
//             console.log(`   ${keyword}: ${successRate}% (${stats.successfulCollections}/${stats.totalCollections}), 평균 ${avgAds}개 광고`);
//           });
//       }
//       
//       console.log('===================\n');
//     } catch (error) {
//       console.error('❌ 통계 분석 실패:', error);
//     }
//   }
//
//   // 실시간 모니터링 (순위 변동 감지)
//   async detectRankingChanges(newResults, previousResults) {
//     if (!previousResults || previousResults.length === 0) return [];
//     
//     const changes = [];
//     
//     newResults.forEach(newResult => {
//       if (!newResult.success) return;
//       
//       const prevResult = previousResults.find(p => p.keyword === newResult.keyword && p.success);
//       if (!prevResult) return;
//       
//       // 이전 순위 맵 생성
//       const prevRankMap = {};
//       prevResult.rankings.forEach(ranking => {
//         prevRankMap[ranking.brandName] = ranking.rank;
//       });
//       
//       // 현재 순위 맵 생성
//       const currentRankMap = {};
//       newResult.rankings.forEach(ranking => {
//         currentRankMap[ranking.brandName] = ranking.rank;
//       });
//       
//       // 변동 감지
//       Object.keys(currentRankMap).forEach(brand => {
//         const currentRank = currentRankMap[brand];
//         const prevRank = prevRankMap[brand];
//         
//         if (prevRank && prevRank !== currentRank) {
//           changes.push({
//             keyword: newResult.keyword,
//             brand: brand,
//             previousRank: prevRank,
//             currentRank: currentRank,
//             change: prevRank - currentRank // 양수면 순위 상승
//           });
//         } else if (!prevRank) {
//           changes.push({
//             keyword: newResult.keyword,
//             brand: brand,
//             previousRank: null,
//             currentRank: currentRank,
//             change: 'NEW'
//           });
//         }
//       });
//       
//       // 사라진 브랜드 감지
//       Object.keys(prevRankMap).forEach(brand => {
//         if (!currentRankMap[brand]) {
//           changes.push({
//             keyword: newResult.keyword,
//             brand: brand,
//             previousRank: prevRankMap[brand],
//             currentRank: null,
//             change: 'REMOVED'
//           });
//         }
//       });
//     });
//     
//     return changes;
//   }
//
//   // 자동 모니터링 시작
//   async startMonitoring() {
//     if (this.isRunning) {
//       console.log('⚠️  이미 모니터링이 실행 중입니다.');
//       return;
//     }
//
//     const initialized = await this.initialize();
//     if (!initialized) {
//       return;
//     }
//
//     this.isRunning = true;
//     console.log(`🎯 자동 모니터링 시작 (${this.intervalMinutes}분 간격)`);
//
//     // 첫 번째 수집 즉시 실행
//     await this.collectAndSave();
//
//     // 정기적 수집
//     this.intervalId = setInterval(async () => {
//       if (this.isRunning) {
//         await this.collectAndSave();
//       }
//     }, this.intervalMinutes * 60 * 1000);
//
//     console.log('\n💡 명령어:');
//     console.log('   Ctrl+C: 모니터링 중지');
//     console.log('   Enter: 즉시 수집 실행');
//   }
//
//   // 데이터 수집 및 저장
//   async collectAndSave() {
//     try {
//       const results = await this.scrapeAllKeywords();
//       
//       // 이전 결과와 비교하여 변동사항 감지
//       let previousResults = null;
//       if (fs.existsSync(this.logFile)) {
//         const data = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
//         if (data.length > 0) {
//           previousResults = data[data.length - 1].results;
//         }
//       }
//       
//       const changes = await this.detectRankingChanges(results, previousResults);
//       
//       await this.saveResults(results);
//       
//       // 변동사항이 있으면 알림
//       if (changes.length > 0) {
//         console.log('\n🚨 === 순위 변동 감지 ===');
//         changes.forEach(change => {
//           if (change.change === 'NEW') {
//             console.log(`🆕 [${change.keyword}] ${change.brand}: 신규 진입 (${change.currentRank}위)`);
//           } else if (change.change === 'REMOVED') {
//             console.log(`❌ [${change.keyword}] ${change.brand}: 순위 이탈 (이전 ${change.previousRank}위)`);
//           } else if (change.change > 0) {
//             console.log(`📈 [${change.keyword}] ${change.brand}: ${change.previousRank}위 → ${change.currentRank}위 (↑${change.change})`);
//           } else {
//             console.log(`📉 [${change.keyword}] ${change.brand}: ${change.previousRank}위 → ${change.currentRank}위 (↓${Math.abs(change.change)})`);
//           }
//         });
//         console.log('=======================\n');
//       }
//       
//     } catch (error) {
//       console.error('❌ 수집 중 오류:', error);
//     }
//   }
//
//   // 한 번만 수집
//   async collectOnce() {
//     const initialized = await this.initialize();
//     if (!initialized) {
//       return;
//     }
//
//     try {
//       const results = await this.scrapeAllKeywords();
//       await this.saveResults(results);
//       await this.exportToCSV();
//       await this.showStats();
//     } finally {
//       await this.cleanup();
//     }
//   }
//
//   // 모니터링 중지
//   async stopMonitoring() {
//     this.isRunning = false;
//     
//     if (this.intervalId) {
//       clearInterval(this.intervalId);
//     }
//     
//     await this.cleanup();
//     console.log('🛑 모니터링이 중지되었습니다.');
//   }
//
//   // 정리
//   async cleanup() {
//     if (this.browser) {
//       await this.browser.close();
//     }
//   }
//
//   async scrapeAllKeywordsParallel(concurrency = 2) {
//     const keywords = this.keywords;
//     globalProgress.total = keywords.length;
//     globalProgress.done = 0;
//     globalProgress.started = 0;
//     globalProgress.results = [];
//     globalProgress.running = true;
//
//     const results = [];
//     let idx = 0;
//     const runBatch = async () => {
//       const batch = [];
//       for (let i = 0; i < concurrency && idx < keywords.length; i++, idx++) {
//         batch.push((async (kw) => {
//           globalProgress.started++;
//           const result = await this.scrapeKeyword(kw);
//           results.push(result);
//           globalProgress.done++;
//           globalProgress.results.push(result);
//           // 3~5초 랜덤 딜레이
//           await new Promise(res => setTimeout(res, 3000 + Math.random() * 2000));
//         })(keywords[idx]));
//       }
//       await Promise.all(batch);
//       if (idx < keywords.length) {
//         await runBatch();
//       }
//     };
//     await runBatch();
//     globalProgress.running = false;
//     return results;
//   }
// }
//
// // 사용 예시
// // async function main() {
// //   const args = process.argv.slice(2);
// //   const command = args[0] || 'monitor';
// //
// //   // 기본 설정
// //   const monitor = new LocalNaverAdMonitor({
// //     keywords: [
// //       '전화영어', '화상영어', '온라인영어', '영어회화', '토익스피킹',
// //       '영어학원', '영어과외', '비즈니스영어', '토플스피킹', '오픽'
// //     ],
// //     intervalMinutes: 30,
// //     maxRankings: 5,
// //     headless: true,  // false로 하면 브라우저 창 보임
// //     logFile: 'naver_rankings_local.json'
// //   });
// //
// //   // 프로그램 종료 시 정리
// //   process.on('SIGINT', async () => {
// //     console.log('\n 프로그램을 종료합니다...');
// //     await monitor.stopMonitoring();
// //     process.exit(0);
// //   });
// //
// //   // 즉시 수집 (Enter 키)
// //   process.stdin.on('data', async () => {
// //     if (monitor.isRunning) {
// //       console.log('\n⚡ 즉시 수집 실행...');
// //       await monitor.collectAndSave();
// //     }
// //   });
// //
// //   switch (command) {
// //     case 'once':
// //       console.log('🔄 한 번만 수집 실행...');
// //       await monitor.collectOnce();
// //       break;
// //     case 'stats':
// //       await monitor.showStats();
// //       break;
// //     case 'csv':
// //       await monitor.exportToCSV();
// //       break;
// //     default:
// //       await monitor.startMonitoring();
// //       break;
// //   }
// // }
// //
// // 실행
// // if (require.main === module) {
// //   main().catch(console.error);
// // }
//
// module.exports = LocalNaverAdMonitor;
// module.exports.globalProgress = globalProgress;