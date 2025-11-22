// 훈련 관리 모듈

const TrainingModule = {
  trainings: [],
  departments: [],
  currentDepartmentId: null,
  
  // 훈련 관리 페이지 로드
  async loadTrainingsPage() {
    try {
      const token = localStorage.getItem('token');
      const [trainingsRes, departmentsRes] = await Promise.all([
        axios.get(`${API_URL}/trainings`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/settings/departments`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      this.trainings = trainingsRes.data.trainings || [];
      this.departments = departmentsRes.data.departments || [];
      
      // 현재 사용자의 부서 설정
      if (currentUser?.department_id) {
        this.currentDepartmentId = currentUser.department_id;
      } else if (this.departments.length > 0) {
        this.currentDepartmentId = this.departments[0].id;
      }
      
      this.renderTrainingsPage();
    } catch (error) {
      console.error('Load trainings error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = '훈련 정보를 불러오는데 실패했습니다.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
      
      // 에러가 발생해도 빈 목록으로 표시
      this.trainings = error.response?.data?.trainings || [];
      this.departments = [];
      this.renderTrainingsPage();
    }
  },
  
  // 훈련 페이지 렌더링
  renderTrainingsPage() {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">훈련 관리</h2>
            <p class="text-gray-600">부서별 훈련을 등록하고 관리합니다.</p>
          </div>
          <button onclick="TrainingModule.showAddTrainingModal()" class="btn-pastel-primary px-6 py-3 rounded-lg">
            <i class="fas fa-plus mr-2"></i>훈련 추가
          </button>
        </div>
      </div>
      
      <!-- 부서 필터 (최고관리자만) -->
      ${currentUser?.is_super_admin ? `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">부서 선택</label>
          <select 
            id="department-filter" 
            class="input-modern w-full md:w-64"
            onchange="TrainingModule.filterByDepartment(this.value)"
          >
            <option value="">전체 부서</option>
            ${this.departments.map(d => `
              <option value="${d.id}" ${this.currentDepartmentId === d.id ? 'selected' : ''}>
                ${d.name}
              </option>
            `).join('')}
          </select>
        </div>
      ` : ''}
      
      <!-- 훈련 목록 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.renderTrainingCards()}
      </div>
    `;
  },
  
  // 훈련 카드 렌더링
  renderTrainingCards() {
    if (this.trainings.length === 0) {
      return `
        <div class="col-span-full">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <i class="fas fa-calendar-times text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500">등록된 훈련이 없습니다.</p>
          </div>
        </div>
      `;
    }
    
    return this.trainings.map(training => `
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-800 mb-1">${training.name}</h3>
            <p class="text-sm text-gray-500">${training.department_name || '부서 미지정'}</p>
          </div>
          <div class="flex space-x-2">
            <button 
              onclick="TrainingModule.editTraining(${training.id})"
              class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button 
              onclick="TrainingModule.deleteTraining(${training.id})"
              class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        ${training.description ? `
          <p class="text-sm text-gray-600 mb-4 line-clamp-2">${training.description}</p>
        ` : ''}
        
        <div class="space-y-2 text-sm">
          ${training.start_date ? `
            <div class="flex items-center text-gray-600">
              <i class="fas fa-calendar-alt w-4 mr-2"></i>
              <span>${training.start_date}${training.end_date ? ` ~ ${training.end_date}` : ''}</span>
            </div>
          ` : ''}
          
          ${training.location ? `
            <div class="flex items-center text-gray-600">
              <i class="fas fa-map-marker-alt w-4 mr-2"></i>
              <span>${training.location}</span>
            </div>
          ` : ''}
          
          ${training.instructor ? `
            <div class="flex items-center text-gray-600">
              <i class="fas fa-user w-4 mr-2"></i>
              <span>${training.instructor}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="mt-4 pt-4 border-t border-gray-200">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            training.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }">
            ${training.is_active ? '활성' : '비활성'}
          </span>
        </div>
      </div>
    `).join('');
  },
  
  // 부서별 필터링
  async filterByDepartment(departmentId) {
    this.currentDepartmentId = departmentId ? Number(departmentId) : null;
    await this.loadTrainingsPage();
  },
  
  // 훈련 추가 모달 표시
  showAddTrainingModal() {
    const defaultDepartmentId = this.currentDepartmentId || (this.departments.length > 0 ? this.departments[0].id : null);
    
    showModal('훈련 추가', `
      <form id="add-training-form" onsubmit="TrainingModule.handleAddTraining(event)">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">부서 *</label>
            <select name="department_id" required class="input-modern w-full" ${!currentUser?.is_super_admin ? 'disabled' : ''}>
              ${this.departments.map(d => `
                <option value="${d.id}" ${d.id === defaultDepartmentId ? 'selected' : ''}>
                  ${d.name}
                </option>
              `).join('')}
            </select>
            ${!currentUser?.is_super_admin ? '<input type="hidden" name="department_id" value="' + defaultDepartmentId + '">' : ''}
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">훈련명 *</label>
            <input type="text" name="name" required class="input-modern w-full" placeholder="예: 제자훈련 1기">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
            <textarea name="description" rows="3" class="input-modern w-full" placeholder="훈련에 대한 설명을 입력하세요"></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">시작일</label>
              <input type="date" name="start_date" class="input-modern w-full">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">종료일</label>
              <input type="date" name="end_date" class="input-modern w-full">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">장소</label>
            <input type="text" name="location" class="input-modern w-full" placeholder="예: 본당 2층">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">강사</label>
            <input type="text" name="instructor" class="input-modern w-full" placeholder="강사명을 입력하세요">
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button type="button" onclick="closeModal()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            취소
          </button>
          <button type="submit" class="btn-pastel-primary px-6 py-2 rounded-lg">
            추가
          </button>
        </div>
      </form>
    `);
  },
  
  // 훈련 추가 처리
  async handleAddTraining(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      await axios.post(`${API_URL}/trainings`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('훈련이 추가되었습니다.', 'success');
      closeModal();
      await this.loadTrainingsPage();
    } catch (error) {
      console.error('Add training error:', error);
      showToast(error.response?.data?.error || '훈련 추가에 실패했습니다.', 'error');
    }
  },
  
  // 훈련 수정
  async editTraining(id) {
    const training = this.trainings.find(t => t.id === id);
    if (!training) return;
    
    showModal('훈련 수정', `
      <form id="edit-training-form" onsubmit="TrainingModule.handleUpdateTraining(event, ${id})">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">부서</label>
            <select name="department_id" class="input-modern w-full" ${!currentUser?.is_super_admin ? 'disabled' : ''}>
              ${this.departments.map(d => `
                <option value="${d.id}" ${d.id === training.department_id ? 'selected' : ''}>
                  ${d.name}
                </option>
              `).join('')}
            </select>
            ${!currentUser?.is_super_admin ? '<input type="hidden" name="department_id" value="' + training.department_id + '">' : ''}
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">훈련명 *</label>
            <input type="text" name="name" required class="input-modern w-full" value="${training.name}">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
            <textarea name="description" rows="3" class="input-modern w-full">${training.description || ''}</textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">시작일</label>
              <input type="date" name="start_date" class="input-modern w-full" value="${training.start_date || ''}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">종료일</label>
              <input type="date" name="end_date" class="input-modern w-full" value="${training.end_date || ''}">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">장소</label>
            <input type="text" name="location" class="input-modern w-full" value="${training.location || ''}">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">강사</label>
            <input type="text" name="instructor" class="input-modern w-full" value="${training.instructor || ''}">
          </div>
          
          <div>
            <label class="flex items-center">
              <input type="checkbox" name="is_active" ${training.is_active ? 'checked' : ''} class="mr-2">
              <span class="text-sm text-gray-700">활성</span>
            </label>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button type="button" onclick="closeModal()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            취소
          </button>
          <button type="submit" class="btn-pastel-primary px-6 py-2 rounded-lg">
            수정
          </button>
        </div>
      </form>
    `);
  },
  
  // 훈련 수정 처리
  async handleUpdateTraining(e, id) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      data.is_active = e.target.is_active.checked;
      
      await axios.put(`${API_URL}/trainings/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('훈련이 수정되었습니다.', 'success');
      closeModal();
      await this.loadTrainingsPage();
    } catch (error) {
      console.error('Update training error:', error);
      showToast(error.response?.data?.error || '훈련 수정에 실패했습니다.', 'error');
    }
  },
  
  // 훈련 삭제
  async deleteTraining(id) {
    if (!confirm('정말 이 훈련을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/trainings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('훈련이 삭제되었습니다.', 'success');
      await this.loadTrainingsPage();
    } catch (error) {
      console.error('Delete training error:', error);
      showToast(error.response?.data?.error || '훈련 삭제에 실패했습니다.', 'error');
    }
  }
};

