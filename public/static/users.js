// 계정 관리 모듈

const UsersModule = {
  currentUsers: [],
  
  // 계정 목록 로드
  async loadUsersList() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      this.currentUsers = response.data.users || [];
      this.renderUsersList();
    } catch (error) {
      console.error('Load users error:', error);
      showToast('계정 목록을 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 계정 목록 렌더링
  renderUsersList() {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">계정 관리</h2>
          <p class="text-gray-600">총 ${this.currentUsers.length}개의 계정이 있습니다.</p>
        </div>
        <button onclick="UsersModule.showAddModal()" class="btn-pastel-primary px-6 py-3 rounded-lg">
          <i class="fas fa-plus mr-2"></i>계정 추가
        </button>
      </div>
      
      <!-- 역할별 필터 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" 
            id="search-input" 
            placeholder="이름, 아이디, 이메일로 검색..." 
            class="input-modern w-full"
            onkeyup="UsersModule.handleSearch()"
          >
          <select id="role-filter" class="input-modern" onchange="UsersModule.handleFilter()">
            <option value="">전체 역할</option>
            <option value="admin">관리자</option>
            <option value="teacher">간사</option>
          </select>
          <select id="active-filter" class="input-modern" onchange="UsersModule.handleFilter()">
            <option value="">전체 상태</option>
            <option value="1">활성</option>
            <option value="0">비활성</option>
          </select>
        </div>
      </div>
      
      <!-- 계정 목록 테이블 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">아이디</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody id="users-table-body" class="bg-white divide-y divide-gray-200">
              ${this.renderUsersRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  
  // 계정 목록 행 렌더링
  renderUsersRows() {
    if (this.currentUsers.length === 0) {
      return `
        <tr>
          <td colspan="8" class="px-6 py-8 text-center text-gray-500">
            등록된 계정이 없습니다.
          </td>
        </tr>
      `;
    }
    
    return this.currentUsers.map(user => {
      const roleBadge = this.getRoleBadge(user.role);
      const statusBadge = user.is_active 
        ? '<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">활성</span>'
        : '<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">비활성</span>';
      
      return `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.username}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.name}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${user.email}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${user.phone || '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap">${roleBadge}</td>
          <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${new Date(user.created_at).toLocaleDateString('ko-KR')}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <button onclick="UsersModule.editUser(${user.id})" class="text-green-600 hover:text-green-800 mr-3">
              <i class="fas fa-edit"></i>
            </button>
            ${user.username !== 'admin' ? `
              <button onclick="UsersModule.deleteUser(${user.id})" class="text-red-600 hover:text-red-800">
                <i class="fas fa-trash"></i>
              </button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');
  },
  
  // 역할 뱃지
  getRoleBadge(role) {
    const badges = {
      admin: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">관리자</span>',
      teacher: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">간사</span>'
    };
    return badges[role] || role;
  },
  
  // 검색
  handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredUsers = this.currentUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
    this.renderFilteredRows(filteredUsers);
  },
  
  // 필터
  handleFilter() {
    const roleFilter = document.getElementById('role-filter').value;
    const activeFilter = document.getElementById('active-filter').value;
    
    let filtered = [...this.currentUsers];
    
    if (roleFilter) {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    
    if (activeFilter) {
      filtered = filtered.filter(u => u.is_active === parseInt(activeFilter));
    }
    
    this.renderFilteredRows(filtered);
  },
  
  // 필터된 행 렌더링
  renderFilteredRows(users) {
    const originalUsers = this.currentUsers;
    this.currentUsers = users;
    const rows = this.renderUsersRows();
    this.currentUsers = originalUsers;
    
    const tbody = document.getElementById('users-table-body');
    if (tbody) {
      tbody.innerHTML = rows;
    }
  },
  
  // 계정 추가 모달
  showAddModal() {
    showModal('계정 추가', `
      <form id="add-user-form" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">아이디 *</label>
            <input type="text" name="username" required class="input-modern w-full">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
            <input type="text" name="name" required class="input-modern w-full">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>
          <input type="email" name="email" required class="input-modern w-full">
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 *</label>
            <input type="password" name="password" required class="input-modern w-full" placeholder="최소 6자">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
            <input type="tel" name="phone" class="input-modern w-full" placeholder="010-1234-5678">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">역할 *</label>
          <select name="role" required class="input-modern w-full">
            <option value="">선택하세요</option>
            <option value="admin">관리자</option>
            <option value="teacher">간사</option>
          </select>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            취소
          </button>
          <button type="submit" class="btn-pastel-primary px-6 py-2 rounded-lg">
            생성
          </button>
        </div>
      </form>
    `);
    
    document.getElementById('add-user-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddUser(new FormData(e.target));
    });
  },
  
  // 계정 추가 처리
  async handleAddUser(formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      
      if (data.password.length < 6) {
        showToast('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
        return;
      }
      
      await axios.post(`${API_URL}/users`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('계정이 생성되었습니다.', 'success');
      closeModal();
      this.loadUsersList();
    } catch (error) {
      console.error('Add user error:', error);
      showToast(error.response?.data?.error || '계정 생성에 실패했습니다.', 'error');
    }
  },
  
  // 계정 수정
  async editUser(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const user = response.data.user;
      
      showModal('계정 수정', `
        <form id="edit-user-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">아이디</label>
            <input type="text" value="${user.username}" class="input-modern w-full bg-gray-100" readonly>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
              <input type="text" name="name" value="${user.name}" required class="input-modern w-full">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
              <input type="tel" name="phone" value="${user.phone || ''}" class="input-modern w-full">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>
            <input type="email" name="email" value="${user.email}" required class="input-modern w-full">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">역할 *</label>
              <select name="role" required class="input-modern w-full" ${user.username === 'admin' ? 'disabled' : ''}>
                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>관리자</option>
                <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>간사</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <select name="is_active" class="input-modern w-full" ${user.username === 'admin' ? 'disabled' : ''}>
                <option value="1" ${user.is_active ? 'selected' : ''}>활성</option>
                <option value="0" ${!user.is_active ? 'selected' : ''}>비활성</option>
              </select>
            </div>
          </div>
          
          <div class="border-t border-gray-200 pt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 변경 (선택)</label>
            <input type="password" name="password" class="input-modern w-full" placeholder="변경하지 않으려면 비워두세요">
            <p class="text-xs text-gray-500 mt-1">※ 비밀번호를 변경하려면 입력하세요 (최소 6자)</p>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              취소
            </button>
            <button type="submit" class="btn-pastel-primary px-6 py-2 rounded-lg">
              저장
            </button>
          </div>
        </form>
      `);
      
      document.getElementById('edit-user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEditUser(id, new FormData(e.target));
      });
    } catch (error) {
      console.error('Edit user error:', error);
      showToast('계정 정보를 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 계정 수정 처리
  async handleEditUser(id, formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      
      // 비밀번호가 입력되지 않았으면 제거
      if (!data.password) {
        delete data.password;
      } else if (data.password.length < 6) {
        showToast('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
        return;
      }
      
      await axios.put(`${API_URL}/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('계정 정보가 수정되었습니다.', 'success');
      closeModal();
      this.loadUsersList();
    } catch (error) {
      console.error('Update user error:', error);
      showToast(error.response?.data?.error || '계정 수정에 실패했습니다.', 'error');
    }
  },
  
  // 계정 삭제
  async deleteUser(id) {
    const user = this.currentUsers.find(u => u.id === id);
    if (user && user.username === 'admin') {
      showToast('기본 관리자 계정은 삭제할 수 없습니다.', 'error');
      return;
    }
    
    if (!confirm('이 계정을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('계정이 삭제되었습니다.', 'success');
      this.loadUsersList();
    } catch (error) {
      console.error('Delete user error:', error);
      showToast(error.response?.data?.error || '계정 삭제에 실패했습니다.', 'error');
    }
  }
};

