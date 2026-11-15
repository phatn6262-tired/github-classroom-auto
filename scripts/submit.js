#!/usr/bin/env node

/**
 * Script nộp bài 1 chạm dành cho học viên Backend Node.js
 * Chức năng:
 * 1. Tự động phát hiện tuần bài tập đang làm.
 * 2. Chạy kiểm tra bài test thực hành tại máy.
 * 3. Kiểm tra tính hợp lệ và số lượng câu đã điền trong quiz.json.
 * 4. Tự động git add, git commit và git push.
 * 5. Cung cấp đường link xem kết quả / mở Pull Request.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const readline = require('readline');

// Màu sắc terminal
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(text) {
  console.log(text);
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function detectWeek() {
  const arg = process.argv[2];
  if (arg) {
    if (arg.startsWith('week-')) return arg;
    if (arg.startsWith('w')) return `week-${arg.replace('w', '').padStart(2, '0')}`;
    const num = parseInt(arg, 10);
    if (!isNaN(num)) return `week-${String(num).padStart(2, '0')}`;
  }

  // 1. Quét git status tìm file đang sửa đổi
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const matches = status.match(/assignments\/(week-\d+)/g);
    if (matches && matches.length > 0) {
      return matches[matches.length - 1].split('/')[1];
    }
  } catch (e) {}

  // 2. Quét commit gần nhất
  try {
    const diff = execSync('git diff --name-only HEAD~1 HEAD 2>/dev/null', { encoding: 'utf8' });
    const matches = diff.match(/assignments\/(week-\d+)/g);
    if (matches && matches.length > 0) {
      return matches[matches.length - 1].split('/')[1];
    }
  } catch (e) {}

  // 3. Mặc định tuần 1
  return 'week-01';
}

async function main() {
  log(`\n${colors.cyan}${colors.bold}====================================================${colors.reset}`);
  log(`${colors.cyan}${colors.bold}  🚀 HỆ THỐNG NỘP BÀI TỰ ĐỘNG (1-COMMAND SUBMIT)   ${colors.reset}`);
  log(`${colors.cyan}${colors.bold}====================================================${colors.reset}\n`);

  const week = detectWeek();
  const weekPath = path.join('assignments', week);
  if (!fs.existsSync(weekPath)) {
    log(`${colors.red}❌ Lỗi: Không tìm thấy thư mục bài tập '${weekPath}'!${colors.reset}`);
    process.exit(1);
  }

  log(`📌 Đang chuẩn bị nộp bài cho: ${colors.bold}${colors.green}${week.toUpperCase()}${colors.reset}\n`);

  // -------------------------------------------------------------
  // BƯỚC 1: KIỂM TRA THỰC HÀNH TẠI MÁY
  // -------------------------------------------------------------
  log(`${colors.bold}🧪 Bước 1: Chạy kiểm tra bài tập Thực hành...${colors.reset}`);
  const testRes = spawnSync('node', ['--test', weekPath], { encoding: 'utf8' });
  const testOutput = testRes.stdout || '';

  const passMatch = testOutput.match(/ℹ pass (\d+)/);
  const failMatch = testOutput.match(/ℹ fail (\d+)/);
  const passCount = passMatch ? parseInt(passMatch[1], 10) : 0;
  const failCount = failMatch ? parseInt(failMatch[1], 10) : 0;

  if (testRes.status === 0 && failCount === 0) {
    log(`  ${colors.green}✔ Tuyệt vời! Thực hành ĐẠT 100% (${passCount}/${passCount} tests PASS)${colors.reset}`);
  } else {
    log(`  ${colors.yellow}⚠️ Cảnh báo: Bài thực hành chỉ đạt ${passCount}/${passCount + failCount} bài test (còn ${failCount} lỗi).${colors.reset}`);
    const proceed = await ask(`\n  👉 Bạn có muốn tiếp tục nộp không? (y/N): `);
    if (proceed.toLowerCase() !== 'y') {
      log(`\n${colors.gray}Đã hủy nộp bài. Hãy sửa lỗi và gõ lại lệnh nộp bài nhé!${colors.reset}\n`);
      process.exit(0);
    }
  }

  // -------------------------------------------------------------
  // BƯỚC 2: KIỂM TRA LÝ THUYẾT (QUIZ.JSON)
  // -------------------------------------------------------------
  log(`\n${colors.bold}📚 Bước 2: Kiểm tra bài tập Lý thuyết...${colors.reset}`);
  const quizPath = path.join(weekPath, 'quiz.json');
  if (fs.existsSync(quizPath)) {
    try {
      const quizContent = fs.readFileSync(quizPath, 'utf8');
      const quizData = JSON.parse(quizContent);
      const totalQuestions = Object.keys(quizData).length;
      const answeredQuestions = Object.values(quizData).filter(v => typeof v === 'string' && v.trim() !== '').length;

      if (answeredQuestions === totalQuestions && totalQuestions > 0) {
        log(`  ${colors.green}✔ Đã hoàn thành đầy đủ ${answeredQuestions}/${totalQuestions} câu trắc nghiệm!${colors.reset}`);
      } else {
        log(`  ${colors.yellow}⚠️ Bạn mới điền ${answeredQuestions}/${totalQuestions} câu trắc nghiệm.${colors.reset}`);
      }
    } catch (e) {
      log(`  ${colors.red}❌ Lỗi cú pháp JSON trong file ${quizPath}: ${e.message}${colors.reset}`);
      const proceed = await ask(`\n  👉 File quiz.json đang bị lỗi cú pháp, tiếp tục nộp? (y/N): `);
      if (proceed.toLowerCase() !== 'y') {
        process.exit(1);
      }
    }
  } else {
    log(`  ${colors.gray}Không có file quiz.json, bỏ qua bước kiểm tra lý thuyết.${colors.reset}`);
  }

  // -------------------------------------------------------------
  // BƯỚC 3: GIT ADD, COMMIT & PUSH
  // -------------------------------------------------------------
  log(`\n${colors.bold}📦 Bước 3: Đồng bộ và đẩy mã nguồn lên GitHub...${colors.reset}`);
  let currentBranch = 'main';
  try {
    currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim() || 'main';

    // 1. Git add
    execSync('git add .', { stdio: 'pipe' });

    // 2. Git commit nếu có thay đổi
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status) {
      const timestamp = new Date().toLocaleString('vi-VN');
      const commitMsg = `Nộp bài ${week} [${timestamp}]`;
      execSync(`git commit -m "${commitMsg}"`, { stdio: 'pipe' });
      log(`  ${colors.green}✔ Đã commit bài làm thành công!${colors.reset}`);
    } else {
      log(`  ${colors.gray}Không có thay đổi mới chưa commit.${colors.reset}`);
    }

    // 3. Git push
    log(`  Đang đẩy nhánh ${colors.bold}${currentBranch}${colors.reset} lên GitHub...`);
    execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
    log(`  ${colors.green}✔ Đã đẩy code lên GitHub thành công!${colors.reset}`);
  } catch (e) {
    log(`\n${colors.red}❌ Lỗi khi push lên GitHub: ${e.message}${colors.reset}`);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // BƯỚC 4: HƯỚNG DẪN HOÀN TẤT & XEM ĐIỂM
  // -------------------------------------------------------------
  let repoUrl = '';
  try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    repoUrl = remote.replace(/\.git$/, '').replace(/^git@github\.com:/, 'https://github.com/');
  } catch (e) {}

  log(`\n${colors.green}${colors.bold}🎉 HOÀN TẤT NỘP BÀI!${colors.reset}`);
  log(`${colors.cyan}----------------------------------------------------${colors.reset}`);
  log(`🤖 Bot GitHub Actions đang tự động chấm bài và cập nhật Google Sheet.`);
  log(`📊 Bạn có thể xem kết quả sau ~30 giây tại:`);
  log(`   ${colors.bold}https://docs.google.com/spreadsheets/d/1-oSqRicyEM3NKcq5mvrwalWFJukSv_F0BxTx5wBqG5c${colors.reset}`);
  if (repoUrl && currentBranch !== 'main') {
    log(`\n🔗 Link xem hoặc mở Pull Request:`);
    log(`   ${colors.bold}${repoUrl}/pull/new/${currentBranch}${colors.reset}`);
  }
  log(`${colors.cyan}----------------------------------------------------${colors.reset}\n`);
}

main().catch(err => {
  console.error('Lỗi không mong muốn:', err);
  process.exit(1);
});
