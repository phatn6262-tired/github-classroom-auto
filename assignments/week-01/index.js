/**
 * ==============================================================================
 * BÀI TẬP THỰC HÀNH TUẦN 01: JAVASCRIPT ES6+ NỀN TẢNG
 * Chủ đề: let/const/var, Scope, Closure, Arrow Functions, Template Literals
 * ==============================================================================
 * 
 * HƯỚNG DẪN:
 * 1. Đọc kỹ yêu cầu đề bài trong assignments/week-01/README.md.
 * 2. Cài đặt các hàm bên dưới theo đúng đặc tả kỹ thuật.
 * 3. Chạy lệnh: `node --test assignments/week-01/sample.test.js` để kiểm tra.
 */

// ==============================================================================
// BÀI 1: QUẢN LÝ STATE BẰNG CLOSURE & BẪY VÒNG LẶP SCOPE
// ==============================================================================

/**
 * Khởi tạo bộ đếm an toàn với private state qua Closure và Default Parameters.
 * 
 * @param {number} [initialValue=0] - Giá trị khởi tạo ban đầu (mặc định 0)
 * @param {number} [step=1] - Bước tăng/giảm mỗi lần gọi (mặc định 1)
 * @returns {object} Đối tượng chứa các phương thức (Arrow Functions):
 *   - increment(): Tăng giá trị thêm `step`, trả về giá trị mới.
 *   - decrement(): Giảm giá trị đi `step`, trả về giá trị mới.
 *   - getValue(): Trả về giá trị hiện tại của bộ đếm.
 *   - reset(): Đặt lại giá trị về `initialValue` ban đầu và trả về giá trị đó.
 */
function createCounter(initialValue = 0, step = 1) {
  // TODO: Cài đặt hàm tại đây
  throw new Error("Chưa cài đặt hàm createCounter");
}

/**
 * Tạo một mảng gồm `count` hàm xử lý, giải quyết bẫy scope vòng lặp.
 * 
 * @param {number} count - Số lượng handler cần tạo
 * @param {string} [prefix='task'] - Tiền tố của chuỗi trả về (mặc định 'task')
 * @returns {Function[]} Mảng gồm `count` hàm. Hàm thứ `i` (0 đến count - 1)
 *   khi được gọi không truyền tham số trả về chuỗi: `${prefix}-${i}`.
 *   Nếu count <= 0, trả về mảng rỗng [].
 *   LƯU Ý: Phải sử dụng đúng cơ chế block scope (`let`) trong vòng lặp.
 */
function createBatchHandlers(count, prefix = 'task') {
  // TODO: Cài đặt hàm tại đây
  throw new Error("Chưa cài đặt hàm createBatchHandlers");
}

// ==============================================================================
// BÀI 2: TEMPLATE LITERALS & CHUẨN HÓA CHUỖI TRONG BACKEND
// ==============================================================================

/**
 * Format thông điệp log chuẩn hóa cho server Backend bằng Template Literal.
 * 
 * @param {string} level - Mức độ log ('info', 'warn', 'error', ...)
 * @param {string} message - Nội dung log
 * @param {object} [metadata={}] - Dữ liệu ngữ cảnh đi kèm (mặc định {})
 * @returns {string} Chuỗi log đã chuẩn hóa:
 *   - level luôn được chuyển thành chữ in hoa [LEVEL].
 *   - Nếu metadata có ít nhất 1 key: `[${LEVEL}] ${message} | metadata: ${JSON.stringify(metadata)}`
 *   - Nếu metadata rỗng hoặc không truyền: `[${LEVEL}] ${message}`
 */
function formatLogMessage(level, message, metadata = {}) {
  // TODO: Cài đặt hàm tại đây
  throw new Error("Chưa cài đặt hàm formatLogMessage");
}

/**
 * Chuẩn hóa chuỗi truy vấn SQL multiline thành 1 dòng duy nhất.
 * 
 * @param {string} sql - Chuỗi SQL nhiều dòng được viết bằng Template String
 * @returns {string} Chuỗi SQL đã được chuẩn hóa:
 *   - Bỏ qua các dòng trống ở đầu và cuối.
 *   - Xóa khoảng trắng thừa (trim) ở mỗi dòng.
 *   - Bỏ qua các dòng rỗng ở giữa.
 *   - Nối các dòng lại với nhau thành 1 dòng duy nhất, ngăn cách bởi 1 dấu cách " ".
 */
function cleanQueryString(sql) {
  // TODO: Cài đặt hàm tại đây
  throw new Error("Chưa cài đặt hàm cleanQueryString");
}

// ==============================================================================
// BÀI 3: MODULE CẤU HÌNH BACKEND AN TOÀN (IMMUTABLE CONFIG)
// ==============================================================================

/**
 * Tạo đối tượng quản lý cấu hình hệ thống an toàn, bảo vệ tính bất biến của Config.
 * 
 * @param {object} [initialConfig={}] - Cấu hình khởi tạo ban đầu
 * @returns {object} Đối tượng quản lý cấu hình:
 *   - get(key, defaultValue = null): Lấy giá trị của key; nếu không tồn tại hoặc undefined, trả về defaultValue.
 *   - set(key, value): Gán hoặc cập nhật giá trị của key.
 *   - has(key): Kiểm tra key có tồn tại trong cấu hình không (trả về true/false).
 *   - exportConfig(): Xuất bản sao cấu hình đã được đóng băng bằng Object.freeze() để không thể bị sửa đổi từ bên ngoài.
 */
function createConfigManager(initialConfig = {}) {
  // TODO: Cài đặt hàm tại đây
  throw new Error("Chưa cài đặt hàm createConfigManager");
}

module.exports = {
  createCounter,
  createBatchHandlers,
  formatLogMessage,
  cleanQueryString,
  createConfigManager,
};
