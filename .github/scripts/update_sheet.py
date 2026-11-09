#!/usr/bin/env python3
"""
Script chấm điểm tự động đa bài tập (Lý thuyết + Thực hành)
Hỗ trợ:
- Bảo mật đáp án lý thuyết qua GitHub Secret (ANSWER_KEYS)
- Bảo mật bộ test thực hành ẩn qua GitHub Secret (HIDDEN_TESTS_B64)
- Chống gian lận: sinh viên không thể xem file test hoặc đáp án trong repo
"""

import os
import sys
import json
import glob
import base64
import tempfile
import subprocess
from datetime import datetime, timezone, timedelta

def get_vietnam_time():
    tz_vn = timezone(timedelta(hours=7))
    return datetime.now(tz_vn).strftime("%d/%m/%Y %H:%M:%S")

def grade_theory(week_folder, week_name, all_secret_keys=None):
    """Chấm điểm bài tập lý thuyết dựa vào file quiz.json và key bí mật"""
    answer_file = os.path.join(week_folder, "quiz.json")
    if not os.path.exists(answer_file):
        answer_file = os.path.join(week_folder, "tra-loi.json")

    # Ưu tiên lấy đáp án từ GitHub Secret ANSWER_KEYS
    correct_keys = None
    if all_secret_keys:
        correct_keys = all_secret_keys.get(week_name)
    else:
        secret_keys_str = os.environ.get("ANSWER_KEYS")
        if secret_keys_str:
            try:
                keys_json = json.loads(secret_keys_str)
                correct_keys = keys_json.get(week_name)
            except Exception as e:
                print(f"[WARN] Lỗi giải mã ANSWER_KEYS secret: {e}")

    # Fallback nếu không có secret
    if not correct_keys:
        key_file = os.path.join(".github", "keys", f"{week_name}.json")
        if os.path.exists(key_file):
            try:
                with open(key_file, "r", encoding="utf-8") as f:
                    correct_keys = json.load(f)
            except Exception:
                pass

    if not os.path.exists(answer_file) or not correct_keys:
        return None, "Chưa có đề hoặc đáp án"

    try:
        with open(answer_file, "r", encoding="utf-8") as f:
            student_answers = json.load(f)
    except Exception as e:
        return 0, f"Lỗi đọc JSON: {e}"

    total_questions = len(correct_keys)
    if total_questions == 0:
        return None, "Không có câu hỏi"

    correct_count = 0
    has_any_answer = False
    for q_id, correct_ans in correct_keys.items():
        stu_ans = str(student_answers.get(q_id, "")).strip().upper()
        if stu_ans:
            has_any_answer = True
        if stu_ans and stu_ans == str(correct_ans).strip().upper():
            correct_count += 1

    if not has_any_answer:
        return 0, f"0/{total_questions} câu đúng (Chưa làm lý thuyết)"

    score = round((correct_count / total_questions) * 100)
    return score, f"{correct_count}/{total_questions} câu đúng ({score}/100)"

def grade_practice(week_name, hidden_tests_dir=None):
    """Chấm điểm bài tập thực hành bằng bộ test ẩn (hoặc test cục bộ)"""
    test_files = []

    # 1. Ưu tiên dùng bộ test ẩn được giải mã từ Secret
    if hidden_tests_dir:
        hidden_test = os.path.join(hidden_tests_dir, week_name, "eval.test.js")
        if os.path.exists(hidden_test):
            test_files = [hidden_test]

    # 2. Fallback nếu không có test ẩn
    if not test_files:
        test_file = os.path.join("assignments", week_name, "index.test.js")
        if os.path.exists(test_file):
            test_files = [test_file]
        else:
            test_files = glob.glob(os.path.join("assignments", week_name, "**", "*.test.js"), recursive=True)

    if not test_files:
        return None, "Không có file test"

    cmd = ["node", "--test"] + test_files
    # Môi trường an toàn: loại bỏ các biến môi trường nhạy cảm trước khi chạy code học sinh
    safe_env = {
        k: v for k, v in os.environ.items()
        if not any(s in k.upper() for s in ["KEY", "SECRET", "TOKEN", "GCP", "AUTH", "PASS"])
    }
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=safe_env)

    if res.returncode == 0:
        return 100, "Đạt 100% (Pass toàn bộ hidden tests)"
    else:
        return 0, "Chưa đạt (Không vượt qua hidden test)"

def main():
    sa_key_str = os.environ.get("GCP_SA_KEY")
    if not sa_key_str:
        print("[ERROR] Missing GCP_SA_KEY environment variable.", file=sys.stderr)
        sys.exit(1)

    try:
        sa_credentials = json.loads(sa_key_str)
    except Exception as e:
        print(f"[ERROR] Invalid JSON in GCP_SA_KEY: {e}", file=sys.stderr)
        sys.exit(1)

    # Đọc đáp án lý thuyết từ secret (nếu có)
    answer_keys_str = os.environ.get("ANSWER_KEYS")
    answer_keys_data = None
    if answer_keys_str:
        try:
            answer_keys_data = json.loads(answer_keys_str)
        except Exception as e:
            print(f"[WARN] Lỗi giải mã ANSWER_KEYS secret: {e}")

    student_username = os.environ.get("STUDENT_USERNAME", "unknown_user").strip()
    commit_url = os.environ.get("COMMIT_URL", "")
    spreadsheet_id = os.environ.get("SPREADSHEET_ID", "1-oSqRicyEM3NKcq5mvrwalWFJukSv_F0BxTx5wBqG5c")
    sheet_name = os.environ.get("SHEET_NAME", "bang diem")
    submit_time = get_vietnam_time()

    # Giải nén bộ test ẩn từ GitHub Secret (nếu có)
    hidden_tests_b64 = os.environ.get("HIDDEN_TESTS_B64")
    hidden_temp_dir = None
    if hidden_tests_b64:
        try:
            hidden_temp_dir = tempfile.mkdtemp(prefix="eval_tests_")
            archive_data = base64.b64decode(hidden_tests_b64.strip())
            archive_path = os.path.join(hidden_temp_dir, "tests.tar.gz")
            with open(archive_path, "wb") as f:
                f.write(archive_data)
            subprocess.run(["tar", "-xzf", archive_path, "-C", hidden_temp_dir], check=True)
            print("[INFO] Đã giải mã thành công bộ test bí mật (Hidden Tests) từ GitHub Secret.")
        except Exception as e:
            print(f"[WARN] Không thể giải nén HIDDEN_TESTS_B64: {e}")
            hidden_temp_dir = None

    # Xóa các biến môi trường chứa secrets nhạy cảm trước khi chấm bài
    for secret_var in ["GCP_SA_KEY", "ANSWER_KEYS", "HIDDEN_TESTS_B64"]:
        os.environ.pop(secret_var, None)

    try:
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError:
        print("[ERROR] gspread or google-auth not installed.", file=sys.stderr)
        sys.exit(1)

    week_folders = sorted(glob.glob("assignments/week-*"))
    if not week_folders:
        print("Không tìm thấy bài tập nào trong assignments/week-*")
        sys.exit(0)

    results = {}
    report_lines = []

    print(f"=== Bắt đầu chấm bài cho học viên: @{student_username} ===")
    for wf in week_folders:
        week_name = os.path.basename(wf)
        try:
            week_num = int(week_name.replace("week-", ""))
        except ValueError:
            continue

        score_lt, detail_lt = grade_theory(wf, week_name, answer_keys_data)
        score_th, detail_th = grade_practice(week_name, hidden_temp_dir)

        results[week_num] = {
            "week_name": week_name,
            "score_lt": score_lt,
            "detail_lt": detail_lt,
            "score_th": score_th,
            "detail_th": detail_th
        }

        print(f"\n--- {week_name.upper()} ---")
        print(f"  Lý thuyết: {detail_lt} => Điểm: {score_lt}")
        print(f"  Thực hành: {detail_th} => Điểm: {score_th}")

        report_lines.append(f"#### 📌 **Tuần {week_num:02d}**:")
        report_lines.append(f"- 📚 **Lý thuyết**: `{score_lt}` ({detail_lt})")
        report_lines.append(f"- 💻 **Thực hành**: `{score_th}` ({detail_th})")

    # Dọn dẹp thư mục tạm của test ẩn
    if hidden_temp_dir and os.path.exists(hidden_temp_dir):
        import shutil
        shutil.rmtree(hidden_temp_dir, ignore_errors=True)

    # Kết nối Google Sheet
    print("\nConnecting to Google Sheet...")
    scopes = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
    creds = Credentials.from_service_account_info(sa_credentials, scopes=scopes)
    gc = gspread.authorize(creds)
    sh = gc.open_by_key(spreadsheet_id)
    ws = sh.worksheet(sheet_name)

    headers = [h.strip() for h in ws.row_values(1)]
    weeks_col = [w.strip() for w in ws.col_values(1)]

    def clean_h(val):
        return str(val).replace(" ", "").lower()

    target_clean_lt = clean_h(f"{student_username}(LT)")
    target_clean_th = clean_h(f"{student_username}(TH)")

    col_lt_idx = None
    col_th_idx = None

    for idx, h in enumerate(headers, start=1):
        h_clean = clean_h(h)
        if h_clean == target_clean_lt:
            col_lt_idx = idx
        elif h_clean == target_clean_th:
            col_th_idx = idx

    if not col_lt_idx or not col_th_idx:
        col_lt_name = f"{student_username} (LT)"
        col_th_name = f"{student_username} (TH)"
        new_col_start = len(headers) + 1
        ws.update_cell(1, new_col_start, col_lt_name)
        ws.update_cell(1, new_col_start + 1, col_th_name)
        col_lt_idx = new_col_start
        col_th_idx = new_col_start + 1
        headers.extend([col_lt_name, col_th_name])
        print(f"Đã tự động thêm cột cho học viên: Cột {col_lt_idx} ({col_lt_name}), Cột {col_th_idx} ({col_th_name})")

    updates = []
    for week_num, res in results.items():
        week_tag = f"Tuần {week_num:02d}"
        target_row = None
        for r_idx, w_text in enumerate(weeks_col, start=1):
            if w_text.startswith(week_tag):
                target_row = r_idx
                break

        if not target_row:
            continue

        if res["score_lt"] is not None:
            updates.append({
                "range": gspread.utils.rowcol_to_a1(target_row, col_lt_idx),
                "values": [[str(res["score_lt"])]]
            })

        if res["score_th"] is not None:
            updates.append({
                "range": gspread.utils.rowcol_to_a1(target_row, col_th_idx),
                "values": [[str(res["score_th"])]]
            })

    if updates:
        ws.batch_update(updates)
        print(f"Đã cập nhật thành công {len(updates)} ô điểm số lên Google Sheet!")

    summary_md = f"### 🤖 Kết quả chấm bài tự động - @{student_username}\n\n" + \
                 "\n".join(report_lines) + \
                 f"\n\n- 🕒 **Thời gian cập nhật**: {submit_time}\n" + \
                 f"- 📊 **Bảng điểm**: Đã cập nhật vào dòng tương ứng trên Google Sheet."

    with open("grading_summary.md", "w", encoding="utf-8") as f:
        f.write(summary_md)

    print("\nChấm bài hoàn tất!")

if __name__ == "__main__":
    main()
