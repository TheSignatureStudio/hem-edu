// 시스템 설정 모듈

const SettingsModule = {
  serviceTypes: [],
  teachers: [],
  
  // 시스템 설정 페이지 로드
  async loadSettingsPage() {
    try {
      const token = localStorage.getItem('token');
      const [serviceTypesRes, teachersRes] = await Promise.all([
        axios.get(`${API_URL}/settings/service-types`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/settings/teachers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      this.serviceTypes = serviceTypesRes.data.serviceTypes || [];
      this.teachers = teachersRes.data.teachers || [];
      this.renderSettingsPage();
    } catch (error) {
      console.error('Load settings error:', error);
      showToast('설정을 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 설정 페이지 렌더링
  renderSettingsPage() {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">시스템 설정</h2>
        <p class="text-gray-600">예배 구분, 선생님 등을 관리합니다.</p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 예배 구분 설정 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">
              <i class="fas fa-calendar-alt text-purple-600 mr-2"></i>예배 구분
            </h3>
            <button onclick="SettingsModule.showAddServiceTypeModal()" class="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm">
              <i class="fas fa-plus mr-1"></i>추가
            </button>
          </div>
          
          <div class="space-y-2">
            ${this.serviceTypes.map(st => `
              <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div class="flex items-center space-x-3">
                  <i class="fas fa-grip-vertical text-gray-400"></i>
                  <span class="font-medium text-gray-900">${st.name}</span>
                </div>
                <div class="flex space-x-2">
                  <button onclick="SettingsModule.editServiceType(${st.id})" class="text-blue-600 hover:text-blue-800 p-1">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="SettingsModule.deleteServiceType(${st.id})" class="text-red-600 hover:text-red-800 p-1">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            `).join('')}
            ${this.serviceTypes.length === 0 ? '<p class="text-gray-500 text-sm">등록된 예배 구분이 없습니다.</p>' : ''}
          </div>
        </div>
        
        <!-- 선생님 관리 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">
              <i class="fas fa-chalkboard-teacher text-purple-600 mr-2"></i>선생님 관리
            </h3>
            <button onclick="SettingsModule.showAddTeacherModal()" class="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm">
              <i class="fas fa-plus mr-1"></i>추가
            </button>
          </div>
          
          <div class="space-y-2 max-h-96 overflow-y-auto">
            ${this.teachers.map(teacher => `
              <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div>
                  <p class="font-medium text-gray-900">${teacher.name}</p>
                  <p class="text-xs text-gray-500">
                    ${teacher.position || ''} ${teacher.phone ? `· ${teacher.phone}` : ''}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button onclick="SettingsModule.editTeacher(${teacher.id})" class="text-blue-600 hover:text-blue-800 p-1">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="SettingsModule.deleteTeacher(${teacher.id})" class="text-red-600 hover:text-red-800 p-1">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            `).join('')}
            ${this.teachers.length === 0 ? '<p class="text-gray-500 text-sm">등록된 선생님이 없습니다.</p>' : ''}
          </div>
        </div>
      </div>
    `;
  },
  
  // 예배 구분 추가 모달
  showAddServiceTypeModal() {
    showModal('예배 구분 추가', `
      <form id="add-service-type-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">예배 구분 이름 *</label>
          <input type="text" name="name" required class="input-modern w-full" placeholder="예: 주일학교 예배">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">정렬 순서</label>
          <input type="number" name="display_order" value="${this.serviceTypes.length + 1}" class="input-modern w-full">
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            취소
          </button>
          <button type="submit" class="btn-pastel-primary px-6 py-2 rounded-lg">
            추가
          </button>
        </div>
      </form>
    `);
    
    document.getElementById('add-service-type-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddServiceType(new FormData(e.target));
    });
  },
  
  // 예배 구분 추가 처리
  async handleAddServiceType(formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      
      await axios.post(`${API_URL}/settings/service-types`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('예배 구분이 추가되었습니다.', 'success');
      closeModal();
      this.loadSettingsPage();
    } catch (error) {
      console.error('Add service type error:', error);
      showToast(error.response?.data?.error || '예배 구분 추가에 실패했습니다.', 'error');
    }
  },
  
  // 예배 구분 수정
  async editServiceType(id) {
    const serviceType = this.serviceTypes.find(st => st.id === id);
    if (!serviceType) return;
    
    showModal('예배 구분 수정', `
      <form id="edit-service-type-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">예배 구분 이름 *</label>
          <input type="text" name="name" value="${serviceType.name}" required class="input-modern w-full">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">정렬 순서</label>
          <input type="number" name="display_order" value="${serviceType.display_order}" class="input-modern w-full">
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
    
    document.getElementById('edit-service-type-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEditServiceType(id, new FormData(e.target));
    });
  },
  
  // 예배 구분 수정 처리
  async handleEditServiceType(id, formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      
      await axios.put(`${API_URL}/settings/service-types/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('예배 구분이 수정되었습니다.', 'success');
      closeModal();
      this.loadSettingsPage();
    } catch (error) {
      console.error('Edit service type error:', error);
      showToast(error.response?.data?.error || '예배 구분 수정에 실패했습니다.', 'error');
    }
  },
  
  // 예배 구분 삭제
  async deleteServiceType(id) {
    if (!confirm('이 예배 구분을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/settings/service-types/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('예배 구분이 삭제되었습니다.', 'success');
      this.loadSettingsPage();
    } catch (error) {
      console.error('Delete service type error:', error);
      showToast(error.response?.data?.error || '예배 구분 삭제에 실패했습니다.', 'error');
    }
  },
  
  // 선생님 추가 모달
  showAddTeacherModal() {
    showModal('선생님 추가', `
      <form id="add-teacher-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
          <input type="text" name="name" required class="input-modern w-full">
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
            <input type="tel" name="phone" class="input-modern w-full" placeholder="010-1234-5678">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">직책</label>
            <input type="text" name="position" class="input-modern w-full" placeholder="예: 부장, 교사">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
          <input type="email" name="email" class="input-modern w-full">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">비고</label>
          <textarea name="note" rows="2" class="input-modern w-full"></textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            취소
          </button>
          <button type="submit" class="btn-pastel-primary px-6 py-2 rounded-lg">
            추가
          </button>
        </div>
      </form>
    `);
    
    document.getElementById('add-teacher-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddTeacher(new FormData(e.target));
    });
  },
  
  // 선생님 추가 처리
  async handleAddTeacher(formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      
      await axios.post(`${API_URL}/settings/teachers`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('선생님이 추가되었습니다.', 'success');
      closeModal();
      this.loadSettingsPage();
    } catch (error) {
      console.error('Add teacher error:', error);
      showToast(error.response?.data?.error || '선생님 추가에 실패했습니다.', 'error');
    }
  },
  
  // 선생님 수정
  async editTeacher(id) {
    const teacher = this.teachers.find(t => t.id === id);
    if (!teacher) return;
    
    showModal('선생님 정보 수정', `
      <form id="edit-teacher-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
          <input type="text" name="name" value="${teacher.name}" required class="input-modern w-full">
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
            <input type="tel" name="phone" value="${teacher.phone || ''}" class="input-modern w-full">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">직책</label>
            <input type="text" name="position" value="${teacher.position || ''}" class="input-modern w-full">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
          <input type="email" name="email" value="${teacher.email || ''}" class="input-modern w-full">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">비고</label>
          <textarea name="note" rows="2" class="input-modern w-full">${teacher.note || ''}</textarea>
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
    
    document.getElementById('edit-teacher-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEditTeacher(id, new FormData(e.target));
    });
  },
  
  // 선생님 수정 처리
  async handleEditTeacher(id, formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      
      await axios.put(`${API_URL}/settings/teachers/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('선생님 정보가 수정되었습니다.', 'success');
      closeModal();
      this.loadSettingsPage();
    } catch (error) {
      console.error('Edit teacher error:', error);
      showToast(error.response?.data?.error || '선생님 정보 수정에 실패했습니다.', 'error');
    }
  },
  
  // 선생님 삭제
  async deleteTeacher(id) {
    if (!confirm('이 선생님을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/settings/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('선생님이 삭제되었습니다.', 'success');
      this.loadSettingsPage();
    } catch (error) {
      console.error('Delete teacher error:', error);
      showToast(error.response?.data?.error || '선생님 삭제에 실패했습니다.', 'error');
    }
  }
};
