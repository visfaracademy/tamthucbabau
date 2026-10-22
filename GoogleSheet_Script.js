/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT CHO GOOGLE SHEET:
 * "DANH SÁCH KHÁCH HÀNG TÂM THỨC BẦU"
 * Link Sheet: https://docs.google.com/spreadsheets/d/19aY-57grdDqSha4rpdlq5_BW2YITPokF5xunFyRjdkg/edit?usp=sharing
 * ==============================================================================
 * 
 * HƯỚNG DẪN 3 BƯỚC ĐỂ KÍCH HOẠT ĐỔ DỮ LIỆU TỰ ĐỘNG (Chỉ mất 1 phút):
 * 
 * BƯỚC 1: Mở Google Sheet trên trình duyệt, vào menu:
 *         Tiện ích mở rộng (Extensions) -> Apps Script
 * 
 * BƯỚC 2: Xóa toàn bộ mã mặc định trong khung soạn thảo,
 *         Copy toàn bộ nội dung file này dán vào -> Bấm biểu tượng Lưu (Ctrl + S).
 * 
 * BƯỚC 3: Bấm nút "Triển khai" (Deploy) màu xanh ở góc trên bên phải:
 *         -> Chọn "Triển khai mới" (New deployment)
 *         -> Chọn loại: "Ứng dụng web" (Web app)
 *         -> Mô tả: "API Đăng ký Tâm Thức Bầu"
 *         -> Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *         -> Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)  <-- BẮT BUỘC CHỌN MỤC NÀY
 *         -> Bấm "Triển khai" (Deploy) -> Cấp quyền truy cập Google tài khoản -> Copy lấy "URL Ứng dụng web" (dạng https://script.google.com/macros/s/.../exec)
 * 
 * BƯỚC 4: Dán đường link URL vừa copy vào biến GOOGLE_SCRIPT_WEBAPP_URL trong file app.js là xong!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Đợi tối đa 10 giây để tránh xung đột khi nhiều người đăng ký cùng lúc
  lock.tryLock(10000);

  try {
    var SPREADSHEET_ID = "19aY-57grdDqSha4rpdlq5_BW2YITPokF5xunFyRjdkg";
    var doc = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = doc.getSheets()[0];

    // Trích xuất dữ liệu gửi lên (hỗ trợ cả JSON và form urlencoded)
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    // Thời gian đăng ký (Múi giờ Việt Nam GMT+7)
    var timestamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    var fullName = data.fullName || data["Họ và Tên"] || "";
    var phone = data.phone || data["Số điện thoại"] || "";
    var email = data.email || data["Email"] || "";
    var pregnancyWeek = data.pregnancyWeek || data["Tuần thai"] || "";
    var planType = data.planType || data["Gói đăng ký"] || data["Hình thức tham gia"] || "";
    var notes = data.notes || data["Lời nhắn"] || "";

    // Tự động kiểm tra và thêm tiêu đề nếu sheet mới
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời gian",
        "Họ và Tên",
        "Số điện thoại",
        "Email",
        "Tuần thai của mẹ",
        "Gói đăng ký",
        "Lời nhắn / Băn khoăn"
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#FBEFEA");
      sheet.setFrozenRows(1);
    }

    // Ghi dòng dữ liệu mới (thêm dấu nháy đơn ' trước số điện thoại để giữ nguyên số 0 đầu)
    sheet.appendRow([
      timestamp,
      fullName,
      "'" + phone,
      email,
      pregnancyWeek,
      planType,
      notes
    ]);

    // Trả về kết quả thành công cho Web
    return ContentService
      .createTextOutput(JSON.stringify({ 
        "result": "success", 
        "message": "Đã lưu đăng ký thành công vào Google Sheet!",
        "row": sheet.getLastRow() 
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        "result": "error", 
        "error": error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput("Tâm Thức Bầu - Google Sheet API đang hoạt động ổn định!")
    .setMimeType(ContentService.MimeType.TEXT);
}
