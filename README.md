# 🚀 Lộ Trình Backend Node.js - Hệ Thống Chấm Bài Tự Động

Chào mừng các bạn đến với kho lưu trữ bài tập thực hành theo lộ trình Backend Node.js! Hệ thống được tích hợp **chấm điểm tự động và cập nhật trực tiếp lên Google Sheet theo từng tuần**.

---

## 📂 Cấu trúc thư mục bài tập (Tinh gọn & Dễ dùng)

Mỗi tuần chỉ là **1 thư mục duy nhất**, bên trong chứa đầy đủ đề bài và code làm bài:

```text
assignments/
├── week-01/
│   ├── README.md         # 📖 Đề bài (chứa cả Lý thuyết + Hướng dẫn thực hành)
│   ├── quiz.json         # ✍️ File điền đáp án trắc nghiệm lý thuyết (A, B, C, D)
│   ├── index.js          # 💻 File viết code thực hành
│   └── index.test.js     # 🧪 File test chấm điểm
│
├── week-02/
│   ├── README.md
│   ├── quiz.json
│   ├── index.js
│   └── index.test.js
│
└── ... (các tuần tiếp theo)
```

---

## 📌 Hướng dẫn làm bài (Dành cho học viên)

### Bước 1: Fork & Clone repository
1. Bấm nút **Fork** ở góc trên bên phải để tạo bản sao về GitHub cá nhân của bạn.
2. Clone về máy:
   ```bash
   git clone https://github.com/your-username/github-classroom-auto.git
   cd github-classroom-auto
   ```

### Bước 2: Làm bài tập
Vào thư mục của tuần cần làm (ví dụ: `assignments/week-01`):
1. **Lý thuyết**: Đọc đề trong `README.md`, mở file **`quiz.json`** và điền đáp án `"A"`, `"B"`, `"C"` hoặc `"D"`.
2. **Thực hành**: Mở file **`index.js`** và hoàn thành các hàm theo yêu cầu.

### Bước 3: Chạy thử bài test trên máy
Gõ lệnh tắt để kiểm tra bài làm trước khi nộp:
```bash
# Test riêng tuần 1:
npm run w1

# Test riêng tuần 2:
npm run w2

# Test toàn bộ các tuần:
npm test
```

### Bước 4: Nộp bài tự động (Chỉ 1 lệnh duy nhất)
Sau khi làm bài xong, bạn chỉ cần gõ **đúng 1 lệnh duy nhất** để nộp:
```bash
npm run submit
# Hoặc: node scripts/submit.js
```

🤖 **Script sẽ tự động thực hiện từ A - Z**:
1. Tự động chạy test thực hành tại máy và cảnh báo nếu còn bài bị fail.
2. Kiểm tra xem bạn đã điền đủ câu trắc nghiệm `quiz.json` chưa.
3. Tự động `git add`, `git commit` và `git push` lên GitHub.
4. Cung cấp đường link trực tiếp để xem điểm số trên Google Sheet!

### 🎉 Kết quả:
- Bot GitHub Actions sẽ tự động chấm cả **Lý thuyết** lẫn **Thực hành**.
- Điểm số tự động nhảy vào đúng dòng của Tuần đó và cột của Bạn trên [Bảng Điểm Google Sheet](https://docs.google.com/spreadsheets/d/1-oSqRicyEM3NKcq5mvrwalWFJukSv_F0BxTx5wBqG5c/edit?gid=2081490865#gid=2081490865).
- Bot sẽ để lại bình luận chi tiết điểm số ngay dưới Pull Request của bạn!
