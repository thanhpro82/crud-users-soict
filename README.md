# Ứng Dụng Quản Lý Người Dùng (CRUD Web App)

> **Môn học**: Công nghệ Web - SOICT (Trường Công nghệ Thông tin & Truyền thông - Đại học Bách Khoa Hà Nội)  
> **API tương tác**: [JSONPlaceholder Users REST API](https://jsonplaceholder.typicode.com/users)

---

## 📋 Tính Năng Đã Triển Khai (Features)

- ✅ **Read (Xem danh sách)**:
  - Hiển thị danh sách người dùng dưới dạng bảng trực quan với các trường: `#ID`, `Họ và Tên (name)`, `Email`, `Số điện thoại (phone)` và cột `Hành động (Actions)`.
- ✅ **Create (Thêm người dùng mới)**:
  - Form Modal thêm mới người dùng với kiểm tra tính hợp lệ dữ liệu (Validation: tên, định dạng email, số điện thoại).
  - Gửi request `POST https://jsonplaceholder.typicode.com/users`.
  - Cập nhật trực tiếp lên giao diện ngay sau khi tạo thành công.
- ✅ **Update/Edit (Chỉnh sửa)**:
  - Form Modal chỉnh sửa thông tin người dùng được điền sẵn dữ liệu cũ.
  - Gửi request `PUT https://jsonplaceholder.typicode.com/users/{id}`.
  - Cập nhật dòng tương ứng trên bảng và giao diện ngay sau khi cập nhật thành công.
- ✅ **Delete (Xóa người dùng)**:
  - Hộp thoại Modal xác nhận xóa để tránh thao tác nhầm lẫn.
  - Gửi request `DELETE https://jsonplaceholder.typicode.com/users/{id}`.
  - Xóa người dùng khỏi bảng và cập nhật số lượng ngay lập tức.
- ✅ **Search (Tìm kiếm)**:
  - Lọc người dùng theo tên (`name`) theo thời gian thực (real-time filtering), không phân biệt hoa thường.
  - Nút xóa nhanh từ khóa tìm kiếm (`×`).
- ✅ **Pagination (Phân trang)**:
  - Phân trang 5 người dùng / trang.
  - Điều hướng bằng nút Trước (Prev), Sau (Next) và các nút số trang.
- ✅ **Trải nghiệm người dùng & Xử lý lỗi (UX & Error Handling)**:
  - Bắt lỗi mạng và HTTP bằng `try...catch...finally`.
  - Hệ thống Toast Notification thông báo kết quả (Success / Error / Info).
  - Hiệu ứng Loading Spinner và trạng thái vô hiệu hóa (disabled) nút bấm khi đang gửi request để tránh bấm đúp.
  - Xử lý trạng thái rỗng khi không tìm thấy kết quả.

---

## ⚙️ Yêu Cầu Kỹ Thuật Đặc Biệt (Compliance)

1. **Cú pháp bất đồng bộ**: 100% sử dụng `async/await` kết hợp Native Fetch API (tuyệt đối không sử dụng chuỗi `.then()`).
2. **Cập nhật UI**: Do JSONPlaceholder là Mock REST API (không lưu dữ liệu thật vào database của server), ứng dụng quản lý trạng thái mảng `state.users` ở Client để cập nhật UI ngay lập tức sau các thao tác `POST`, `PUT`, `DELETE`.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
Bài tập/
│── index.html          # Giao diện chính ứng dụng
│── README.md           # Tài liệu hướng dẫn và báo cáo bài tập
│── css/
│   └── style.css       # Giao diện hiện đại, responsive, hiệu ứng mượt mà
└── js/
    ├── api.js          # Module API Service (getUsers, createUser, updateUser, deleteUser)
    └── app.js          # Module Controller (State management, DOM events, UI updates)
```

---

## 🚀 Hướng Dẫn Chạy Ứng Dụng

Ứng dụng được xây dựng hoàn toàn bằng **HTML5, CSS3 và Vanilla JavaScript (ES6+)**, không yêu cầu cài đặt `npm` hay build tools:

1. **Cách 1: Mở trực tiếp bằng trình duyệt**
   - Click đúp vào file `index.html` hoặc chuột phải chọn **Open with Chrome/Edge/Firefox**.

2. **Cách 2: Sử dụng Live Server trong VS Code**
   - Mở thư mục dự án trong Visual Studio Code.
   - Cài extension **Live Server** (nếu chưa có).
   - Chuột phải vào `index.html` và chọn **Open with Live Server**.

---

## 👨‍💻 Tác giả
- Sinh viên: **Nguyễn Tuấn Thành**
- Trường: **SOICT - Đại học Bách Khoa Hà Nội**
