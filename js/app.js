/**
 * app.js - Application Controller & State Management
 * Quản lý trạng thái, DOM events, Search, Pagination, và CRUD UI Updates
 */

// ================= Trạng thái ứng dụng (Application State) =================
const state = {
  users: [],              // Danh sách người dùng lưu trữ ở Client
  searchTerm: '',         // Từ khóa tìm kiếm hiện tại
  currentPage: 1,         // Trang hiện tại
  pageSize: 5,            // Số lượng người dùng trên mỗi trang
  editingUserId: null,    // ID người dùng đang chỉnh sửa (null nếu là thêm mới)
  deletingUserId: null    // ID người dùng đang chờ xác nhận xóa
};

// ================= DOM Elements =================
const elements = {
  // Table & Stats
  userTableBody: document.getElementById('user-table-body'),
  totalUsersCount: document.getElementById('total-users-count'),
  loadingSpinner: document.getElementById('loading-spinner'),
  errorMessage: document.getElementById('error-message'),
  errorText: document.getElementById('error-text'),
  btnRetry: document.getElementById('btn-retry'),
  emptyState: document.getElementById('empty-state'),

  // Search
  searchInput: document.getElementById('search-input'),
  btnClearSearch: document.getElementById('btn-clear-search'),

  // Pagination
  paginationContainer: document.getElementById('pagination-container'),
  paginationInfo: document.getElementById('pagination-info'),
  pageNumbers: document.getElementById('page-numbers'),
  btnPrevPage: document.getElementById('btn-prev-page'),
  btnNextPage: document.getElementById('btn-next-page'),

  // Form Modal (Create / Edit)
  userModal: document.getElementById('user-modal'),
  modalTitle: document.getElementById('modal-title'),
  userForm: document.getElementById('user-form'),
  formUserId: document.getElementById('form-user-id'),
  formName: document.getElementById('form-name'),
  formEmail: document.getElementById('form-email'),
  formPhone: document.getElementById('form-phone'),
  nameFeedback: document.getElementById('name-feedback'),
  emailFeedback: document.getElementById('email-feedback'),
  phoneFeedback: document.getElementById('phone-feedback'),
  btnOpenCreateModal: document.getElementById('btn-open-create-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnCancelModal: document.getElementById('btn-cancel-modal'),
  btnSubmitForm: document.getElementById('btn-submit-form'),

  // Delete Modal
  deleteModal: document.getElementById('delete-modal'),
  deleteConfirmText: document.getElementById('delete-confirm-text'),
  btnCancelDelete: document.getElementById('btn-cancel-delete'),
  btnConfirmDelete: document.getElementById('btn-confirm-delete'),

  // Toast
  toastContainer: document.getElementById('toast-container')
};

// ================= Khởi chạy ứng dụng =================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

/**
 * Hàm khởi tạo và tải dữ liệu ban đầu
 */
async function initApp() {
  showLoading(true);
  hideError();

  try {
    // Gọi API lấy danh sách người dùng ban đầu bằng async/await
    const data = await getUsers();
    state.users = Array.isArray(data) ? data : [];
    state.currentPage = 1;
    render();
    showToast('Tải danh sách người dùng thành công!', 'info');
  } catch (error) {
    showError(error.message || 'Không thể kết nối đến máy chủ API.');
    showToast('Lỗi khi tải danh sách người dùng!', 'error');
  } finally {
    showLoading(false);
  }
}

// ================= Event Listeners =================
function setupEventListeners() {
  // Tìm kiếm theo thời gian thực (Search filter)
  elements.searchInput.addEventListener('input', (e) => {
    state.searchTerm = e.target.value.trim();
    state.currentPage = 1; // Reset về trang 1 khi tìm kiếm
    elements.btnClearSearch.classList.toggle('hidden', state.searchTerm === '');
    render();
  });

  // Nút xóa từ khóa tìm kiếm
  elements.btnClearSearch.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchTerm = '';
    elements.btnClearSearch.classList.add('hidden');
    state.currentPage = 1;
    render();
    elements.searchInput.focus();
  });

  // Nút Thử lại khi tải lỗi
  elements.btnRetry.addEventListener('click', initApp);

  // Mở modal thêm người dùng
  elements.btnOpenCreateModal.addEventListener('click', () => {
    openUserModal('create');
  });

  // Đóng modal thêm/sửa
  elements.btnCloseModal.addEventListener('click', closeUserModal);
  elements.btnCancelModal.addEventListener('click', closeUserModal);

  // Submit form thêm/sửa
  elements.userForm.addEventListener('submit', handleFormSubmit);

  // Đóng modal xóa
  elements.btnCancelDelete.addEventListener('click', closeDeleteModal);

  // Xác nhận xóa
  elements.btnConfirmDelete.addEventListener('click', handleConfirmDelete);

  // Phân trang
  elements.btnPrevPage.addEventListener('click', () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      render();
    }
  });

  elements.btnNextPage.addEventListener('click', () => {
    const totalPages = getTotalPages(getFilteredUsers());
    if (state.currentPage < totalPages) {
      state.currentPage++;
      render();
    }
  });

  // Đóng modal khi bấm ra ngoài nền hoặc nhấn Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeUserModal();
      closeDeleteModal();
    }
  });

  elements.userModal.addEventListener('click', (e) => {
    if (e.target === elements.userModal) closeUserModal();
  });

  elements.deleteModal.addEventListener('click', (e) => {
    if (e.target === elements.deleteModal) closeDeleteModal();
  });
}

// ================= Render Logic =================
/**
 * Lọc danh sách người dùng theo tên
 */
function getFilteredUsers() {
  if (!state.searchTerm) {
    return state.users;
  }
  const term = state.searchTerm.toLowerCase();
  return state.users.filter(user => 
    user.name && user.name.toLowerCase().includes(term)
  );
}

/**
 * Tính tổng số trang
 */
function getTotalPages(filteredUsers) {
  return Math.ceil(filteredUsers.length / state.pageSize) || 1;
}

/**
 * Cập nhật toàn bộ giao diện bảng và phân trang
 */
function render() {
  const filteredUsers = getFilteredUsers();
  const totalItems = filteredUsers.length;
  const totalPages = getTotalPages(filteredUsers);

  // Đảm bảo currentPage hợp lệ
  if (state.currentPage > totalPages) {
    state.currentPage = totalPages;
  }
  if (state.currentPage < 1) {
    state.currentPage = 1;
  }

  // Cập nhật thống kê
  elements.totalUsersCount.textContent = state.users.length;

  // Lấy dữ liệu cho trang hiện tại
  const startIndex = (state.currentPage - 1) * state.pageSize;
  const endIndex = startIndex + state.pageSize;
  const pageUsers = filteredUsers.slice(startIndex, endIndex);

  // Render bảng
  renderTable(pageUsers);

  // Render phân trang
  renderPagination(totalItems, totalPages, startIndex, endIndex);

  // Hiển thị trạng thái rỗng nếu không có dữ liệu
  if (totalItems === 0) {
    elements.emptyState.classList.remove('hidden');
    elements.paginationContainer.classList.add('hidden');
  } else {
    elements.emptyState.classList.add('hidden');
    elements.paginationContainer.classList.remove('hidden');
  }
}

/**
 * Render dữ liệu ra thẻ <tbody>
 */
function renderTable(users) {
  elements.userTableBody.innerHTML = '';

  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.id = `user-row-${user.id}`;

    // Lấy ký tự đầu tên để làm avatar
    const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

    tr.innerHTML = `
      <td><span class="badge-id">#${user.id}</span></td>
      <td>
        <div class="user-info-name">
          <div class="avatar-placeholder">${escapeHtml(initial)}</div>
          <strong>${escapeHtml(user.name)}</strong>
        </div>
      </td>
      <td>
        <a href="mailto:${escapeHtml(user.email)}" class="user-email">${escapeHtml(user.email)}</a>
      </td>
      <td>
        <a href="tel:${escapeHtml(user.phone)}" class="user-phone">${escapeHtml(user.phone)}</a>
      </td>
      <td style="text-align: center;">
        <div class="action-buttons">
          <button 
            type="button" 
            class="btn-action-icon btn-edit" 
            onclick="handleEditClick(${user.id})"
            title="Chỉnh sửa thông tin"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            type="button" 
            class="btn-action-icon btn-delete" 
            onclick="handleDeleteClick(${user.id})"
            title="Xóa người dùng"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </td>
    `;
    elements.userTableBody.appendChild(tr);
  });
}

/**
 * Render thanh điều hướng phân trang
 */
function renderPagination(totalItems, totalPages, startIndex, endIndex) {
  if (totalItems === 0) {
    elements.paginationInfo.textContent = '0 người dùng';
    elements.btnPrevPage.disabled = true;
    elements.btnNextPage.disabled = true;
    elements.pageNumbers.innerHTML = '';
    return;
  }

  const currentDisplayStart = startIndex + 1;
  const currentDisplayEnd = Math.min(endIndex, totalItems);
  elements.paginationInfo.textContent = `Hiển thị ${currentDisplayStart} - ${currentDisplayEnd} trong tổng số ${totalItems}`;

  elements.btnPrevPage.disabled = state.currentPage <= 1;
  elements.btnNextPage.disabled = state.currentPage >= totalPages;

  elements.pageNumbers.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `page-btn ${i === state.currentPage ? 'active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => {
      state.currentPage = i;
      render();
    });
    elements.pageNumbers.appendChild(btn);
  }
}

// ================= CRUD Handlers =================

/**
 * Mở modal thêm mới hoặc chỉnh sửa
 */
function openUserModal(mode, user = null) {
  clearValidation();
  elements.userForm.reset();

  if (mode === 'create') {
    state.editingUserId = null;
    elements.modalTitle.textContent = 'Thêm người dùng mới';
    elements.formUserId.value = '';
    elements.btnSubmitForm.querySelector('.btn-text').textContent = 'Thêm mới';
  } else if (mode === 'edit' && user) {
    state.editingUserId = user.id;
    elements.modalTitle.textContent = `Chỉnh sửa: ${user.name}`;
    elements.formUserId.value = user.id;
    elements.formName.value = user.name || '';
    elements.formEmail.value = user.email || '';
    elements.formPhone.value = user.phone || '';
    elements.btnSubmitForm.querySelector('.btn-text').textContent = 'Lưu thay đổi';
  }

  elements.userModal.classList.remove('hidden');
  elements.formName.focus();
}

function closeUserModal() {
  elements.userModal.classList.add('hidden');
  state.editingUserId = null;
  clearValidation();
}

/**
 * Xử lý khi nhấn nút Sửa trên từng dòng
 */
window.handleEditClick = function(id) {
  const user = state.users.find(u => u.id === id);
  if (!user) {
    showToast('Không tìm thấy người dùng!', 'error');
    return;
  }
  openUserModal('edit', user);
};

/**
 * Xử lý khi nhấn nút Xóa trên từng dòng
 */
window.handleDeleteClick = function(id) {
  const user = state.users.find(u => u.id === id);
  if (!user) {
    showToast('Không tìm thấy người dùng!', 'error');
    return;
  }
  state.deletingUserId = id;
  elements.deleteConfirmText.innerHTML = `Bạn có chắc chắn muốn xóa người dùng <strong>${escapeHtml(user.name)}</strong> (ID: #${user.id}) không?`;
  elements.deleteModal.classList.remove('hidden');
};

function closeDeleteModal() {
  elements.deleteModal.classList.add('hidden');
  state.deletingUserId = null;
}

/**
 * Xác nhận xóa người dùng (DELETE API + Update UI)
 */
async function handleConfirmDelete() {
  if (!state.deletingUserId) return;

  const id = state.deletingUserId;
  const btn = elements.btnConfirmDelete;
  setButtonLoading(btn, true);

  try {
    // 1. Gọi API DELETE bằng async/await
    await deleteUser(id);

    // 2. Cập nhật state cục bộ ngay lập tức để cập nhật UI
    state.users = state.users.filter(u => u.id !== id);

    // 3. Render lại giao diện
    render();

    closeDeleteModal();
    showToast(`Đã xóa thành công người dùng #${id}!`, 'success');
  } catch (error) {
    showToast(error.message || 'Không thể xóa người dùng. Vui lòng thử lại!', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

/**
 * Submit form Thêm mới hoặc Cập nhật (POST / PUT API + Update UI)
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  const name = elements.formName.value.trim();
  const email = elements.formEmail.value.trim();
  const phone = elements.formPhone.value.trim();

  // Validate form
  if (!validateForm(name, email, phone)) {
    return;
  }

  const userData = { name, email, phone };
  const btn = elements.btnSubmitForm;
  setButtonLoading(btn, true);

  try {
    if (state.editingUserId) {
      // === CẬP NHẬT (PUT) ===
      const id = state.editingUserId;
      const updatedUser = await updateUser(id, userData);

      // Cập nhật dữ liệu trong mảng cục bộ
      const index = state.users.findIndex(u => u.id === id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...updatedUser };
      }

      render();
      closeUserModal();
      showToast(`Đã cập nhật thông tin người dùng #${id}!`, 'success');
    } else {
      // === THÊM MỚI (POST) ===
      const createdUser = await createUser(userData);

      // Nếu API trả về ID đã tồn tại do mock server luôn trả về 11, tạo ID duy nhất
      let newId = createdUser.id || 11;
      const maxExistingId = state.users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0);
      if (state.users.some(u => u.id === newId)) {
        newId = maxExistingId + 1;
      }
      createdUser.id = newId;

      // Thêm người dùng mới vào đầu mảng và cập nhật UI ngay lập tức
      state.users.unshift(createdUser);
      state.currentPage = 1; // Nhảy về trang 1 để người dùng thấy ngay
      render();

      closeUserModal();
      showToast('Đã thêm người dùng mới thành công!', 'success');
    }
  } catch (error) {
    showToast(error.message || 'Thao tác không thành công. Vui lòng thử lại!', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

// ================= Form Validation =================
function validateForm(name, email, phone) {
  let isValid = true;
  clearValidation();

  // Validate Name
  if (!name) {
    showInputError(elements.formName, elements.nameFeedback, 'Vui lòng nhập họ và tên');
    isValid = false;
  } else if (name.length < 2) {
    showInputError(elements.formName, elements.nameFeedback, 'Họ và tên tối thiểu 2 ký tự');
    isValid = false;
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showInputError(elements.formEmail, elements.emailFeedback, 'Vui lòng nhập địa chỉ email');
    isValid = false;
  } else if (!emailRegex.test(email)) {
    showInputError(elements.formEmail, elements.emailFeedback, 'Địa chỉ email không hợp lệ (ví dụ: user@example.com)');
    isValid = false;
  }

  // Validate Phone
  if (!phone) {
    showInputError(elements.formPhone, elements.phoneFeedback, 'Vui lòng nhập số điện thoại');
    isValid = false;
  } else if (phone.length < 6) {
    showInputError(elements.formPhone, elements.phoneFeedback, 'Số điện thoại tối thiểu 6 ký tự');
    isValid = false;
  }

  return isValid;
}

function showInputError(inputEl, feedbackEl, message) {
  inputEl.classList.add('is-invalid');
  feedbackEl.textContent = message;
}

function clearValidation() {
  [elements.formName, elements.formEmail, elements.formPhone].forEach(input => {
    input.classList.remove('is-invalid');
  });
  elements.nameFeedback.textContent = '';
  elements.emailFeedback.textContent = '';
  elements.phoneFeedback.textContent = '';
}

// ================= UI Helpers & Notifications =================

function showLoading(isLoading) {
  if (isLoading) {
    elements.loadingSpinner.classList.remove('hidden');
    elements.userTableBody.innerHTML = '';
  } else {
    elements.loadingSpinner.classList.add('hidden');
  }
}

function showError(msg) {
  elements.errorText.textContent = msg;
  elements.errorMessage.classList.remove('hidden');
}

function hideError() {
  elements.errorMessage.classList.add('hidden');
}

function setButtonLoading(button, isLoading) {
  const spinner = button.querySelector('.btn-spinner');
  const text = button.querySelector('.btn-text');
  if (isLoading) {
    button.disabled = true;
    if (spinner) spinner.classList.remove('hidden');
  } else {
    button.disabled = false;
    if (spinner) spinner.classList.add('hidden');
  }
}

/**
 * Hiển thị Toast thông báo trạng thái
 * @param {string} message - Nội dung thông báo
 * @param {'success'|'error'|'info'} type - Loại thông báo
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
  } else if (type === 'error') {
    iconSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `;
  } else {
    iconSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;
  }

  toast.innerHTML = `
    ${iconSvg}
    <span class="toast-message">${escapeHtml(message)}</span>
  `;

  elements.toastContainer.appendChild(toast);

  // Tự động xóa sau 3.5 giây
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
