/**
 * api.js - API Service Module
 * Tương tác với REST API: https://jsonplaceholder.typicode.com/users
 * Sử dụng cú pháp async/await (không dùng .then())
 * Đầy đủ xử lý lỗi (Error handling)
 */

const API_BASE_URL = 'https://jsonplaceholder.typicode.com/users';

/**
 * Lấy danh sách tất cả người dùng (Read)
 * @returns {Promise<Array>} Danh sách người dùng
 */
async function getUsers() {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Lỗi kết nối máy chủ: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi gọi getUsers():', error);
    throw error;
  }
}

/**
 * Thêm người dùng mới (Create)
 * @param {Object} userData - Thông tin người dùng { name, email, phone }
 * @returns {Promise<Object>} Người dùng vừa được tạo (kèm ID do server cấp)
 */
async function createUser(userData) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`Không thể thêm người dùng: ${response.status} ${response.statusText}`);
    }

    const createdData = await response.json();
    return createdData;
  } catch (error) {
    console.error('Lỗi khi gọi createUser():', error);
    throw error;
  }
}

/**
 * Cập nhật thông tin người dùng (Update)
 * @param {number|string} id - ID người dùng cần sửa
 * @param {Object} userData - Thông tin cập nhật { name, email, phone }
 * @returns {Promise<Object>} Người dùng sau khi cập nhật
 */
async function updateUser(id, userData) {
  try {
    // Lưu ý: JSONPlaceholder chỉ lưu sẵn ID 1-10. Các ID > 10 do client tạo mới
    // sẽ bị trả về 500 nếu gọi trực tiếp lên máy chủ mock.
    if (Number(id) > 10) {
      // Giả lập độ trễ mạng nhỏ và trả về dữ liệu đã cập nhật
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id: Number(id), ...userData };
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`Không thể cập nhật người dùng ID ${id}: ${response.status} ${response.statusText}`);
    }

    const updatedData = await response.json();
    return updatedData;
  } catch (error) {
    console.error(`Lỗi khi gọi updateUser(${id}):`, error);
    throw error;
  }
}

/**
 * Xóa người dùng (Delete)
 * @param {number|string} id - ID người dùng cần xóa
 * @returns {Promise<boolean>} Trả về true nếu xóa thành công
 */
async function deleteUser(id) {
  try {
    if (Number(id) > 10) {
      // Giả lập độ trễ mạng cho ID vừa tạo ở client
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Không thể xóa người dùng ID ${id}: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error(`Lỗi khi gọi deleteUser(${id}):`, error);
    throw error;
  }
}
