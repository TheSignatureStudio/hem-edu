// 반 관리 모듈

const ClassesModule = {
  currentClasses: [],
  allMembers: [],
  allTeachers: [],
  departments: [],
  
  // 반 목록 로드
  async loadClassesList() {
    try {
      const token = localStorage.getItem('token');
      const [classesRes, membersRes, teachersRes, departmentsRes] = await Promise.all([
        axios.get(`${API_URL}/classes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/members`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/settings/teachers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/settings/departments`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      this.currentClasses = classesRes.data.classes || [];
      this.allMembers = membersRes.data.members || [];
      this.allTeachers = teachersRes.data.teachers || [];
      this.departments = departmentsRes.data.departments || [];
      this.renderClassesList();
    } catch (error) {
      console.error('Load classes error:', error);
      showToast('반 목록을 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 반 목록 렌더링
  renderClassesList() {
    const content = document.getElementById('main-content');
    
    // 부서별로 그룹화
    const classesByDepartment = {};
    this.currentClasses.forEach(cls => {
      const deptName = cls.department_name || '부서 미지정';
      if (!classesByDepartment[deptName]) {
        classesByDepartment[deptName] = [];
      }
      classesByDepartment[deptName].push(cls);
    });
    
    content.innerHTML = `
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">반 관리</h2>
          <p class="text-gray-600">총 ${this.currentClasses.length}개 반, ${this.allMembers.length}명의 학생</p>
        </div>
        <div class="flex space-x-3">
          <button onclick="ClassesModule.updateAllGrades()" class="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            <i class="fas fa-sync mr-2"></i>학년 자동 갱신
          </button>
          <button onclick="ClassesModule.showAddModal()" class="btn-pastel-primary px-6 py-3 rounded-lg">
            <i class="fas fa-plus mr-2"></i>반 추가
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
            onchange="ClassesModule.filterByDepartment(this.value)"
          >
            <option value="">전체 부서</option>
            ${this.departments.map(d => `
              <option value="${d.id}">${d.name}</option>
            `).join('')}
          </select>
        </div>
      ` : ''}
      
      <!-- 부서별 반 목록 -->
      <div class="space-y-8">
        ${Object.entries(classesByDepartment).map(([deptName, classes]) => `
          ${classes.length > 0 ? `
            <div>
              <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-graduation-cap text-purple-600 mr-2"></i>${deptName}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${classes.map(cls => this.renderClassCard(cls)).join('')}
              </div>
            </div>
          ` : ''}
        `).join('')}
        
        ${this.currentClasses.length === 0 ? `
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <i class="fas fa-chalkboard text-gray-300 text-5xl mb-4"></i>
            <p class="text-gray-500">등록된 반이 없습니다.</p>
            <button onclick="ClassesModule.showAddModal()" class="mt-4 btn-pastel-primary px-6 py-2 rounded-lg">
              첫 반 만들기
            </button>
          </div>
        ` : ''}
      </div>
    `;
  },
  
  // 반 카드 렌더링
  renderClassCard(cls) {
    return `
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h4 class="font-bold text-gray-800 text-lg">${cls.name}</h4>
            <p class="text-sm text-gray-500">${cls.grade_level}</p>
          </div>
          <div class="flex space-x-1">
            <button onclick="ClassesModule.viewClass(${cls.id})" class="text-blue-600 hover:text-blue-800 p-1">
              <i class="fas fa-eye text-sm"></i>
            </button>
            <button onclick="ClassesModule.editClass(${cls.id})" class="text-green-600 hover:text-green-800 p-1">
              <i class="fas fa-edit text-sm"></i>
            </button>
            <button onclick="ClassesModule.deleteClass(${cls.id})" class="text-red-600 hover:text-red-800 p-1">
              <i class="fas fa-trash text-sm"></i>
            </button>
          </div>
        </div>
        
        ${cls.teacher_name ? `
          <div class="flex items-center text-sm text-gray-600 mb-2">
            <i class="fas fa-user-tie w-5 text-purple-600"></i>
            <span>${cls.teacher_name}</span>
          </div>
        ` : ''}
        
        ${cls.room_number ? `
          <div class="flex items-center text-sm text-gray-600 mb-2">
            <i class="fas fa-door-open w-5 text-purple-600"></i>
            <span>${cls.room_number}</span>
          </div>
        ` : ''}
        
        ${cls.meeting_time ? `
          <div class="flex items-center text-sm text-gray-600 mb-3">
            <i class="fas fa-clock w-5 text-purple-600"></i>
            <span>${cls.meeting_time}</span>
          </div>
        ` : ''}
        
        <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-600">
            <i class="fas fa-users mr-1"></i>
            ${cls.student_count || 0}명
          </span>
          <button onclick="ClassesModule.viewClass(${cls.id})" class="text-sm text-purple-600 hover:text-purple-800 font-medium">
            상세보기 →
          </button>
        </div>
      </div>
    `;
  },
  
  // 반 추가 모달
  showAddModal() {
    showModal('반 추가', `
      <form id="add-class-form" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">반 이름 *</label>
            <input type="text" name="name" required class="input-modern w-full" placeholder="예: 초등부 1반">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">반 이름 *</label>
            <input type="text" name="name" required class="input-modern w-full" placeholder="예: 초등부 1반">
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">부서 *</label>
            <select name="department_id" required class="input-modern w-full" ${!currentUser?.is_super_admin ? 'disabled' : ''}>
              ${this.departments.map(d => `
                <option value="${d.id}" ${d.id === (currentUser?.department_id || this.departments[0]?.id) ? 'selected' : ''}>
                  ${d.name}
                </option>
              `).join('')}
            </select>
            ${!currentUser?.is_super_admin ? '<input type="hidden" name="department_id" value="' + (currentUser?.department_id || this.departments[0]?.id) + '">' : ''}
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">학년 *</label>
            <select name="grade_level" required class="input-modern w-full">
              <option value="">선택</option>
              <option value="영아부">영아부</option>
              <option value="유치부">유치부</option>
              <option value="유년부">유년부</option>
              <option value="초등부">초등부</option>
              <option value="중등부">중등부</option>
              <option value="고등부">고등부</option>
              <option value="청년부">청년부</option>
            </select>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">담당 선생님</label>
          <select id="teacher-select" class="input-modern w-full" onchange="ClassesModule.selectTeacher(this.value)">
            <option value="">선택하세요</option>
            ${this.allTeachers.map(t => `
              <option value="${t.id}" data-phone="${t.phone || ''}">${t.name} ${t.position ? `(${t.position})` : ''}</option>
            `).join('')}
            <option value="custom">직접 입력</option>
          </select>
        </div>
        
        <div id="teacher-custom-fields" style="display: none;" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">선생님 이름</label>
            <input type="text" id="teacher-name-input" name="teacher_name" class="input-modern w-full">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">선생님 연락처</label>
            <input type="tel" id="teacher-phone-input" name="teacher_phone" class="input-modern w-full">
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">교실</label>
            <input type="text" name="room_number" class="input-modern w-full" placeholder="예: 2층 초등1실">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">예배 시간</label>
            <input type="text" name="meeting_time" class="input-modern w-full" placeholder="예: 주일 오전 11시">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
          <textarea name="description" rows="2" class="input-modern w-full"></textarea>
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
    
    document.getElementById('add-class-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddClass(new FormData(e.target));
    });
  },
  
  // 선생님 선택 처리 (추가 모달)
  selectTeacher(value) {
    const customFields = document.getElementById('teacher-custom-fields');
    const select = document.getElementById('teacher-select');
    const nameInput = document.getElementById('teacher-name-input');
    const phoneInput = document.getElementById('teacher-phone-input');
    
    if (value === 'custom') {
      customFields.style.display = 'grid';
      if (nameInput) nameInput.value = '';
      if (phoneInput) phoneInput.value = '';
    } else if (value) {
      customFields.style.display = 'grid';
      const selectedOption = select.options[select.selectedIndex];
      const teacherName = selectedOption.text.split('(')[0].trim();
      const teacherPhone = selectedOption.dataset.phone || '';
      
      if (nameInput) nameInput.value = teacherName;
      if (phoneInput) phoneInput.value = teacherPhone;
    } else {
      customFields.style.display = 'none';
    }
  },
  
  // 선생님 선택 처리 (수정 모달)
  selectTeacherEdit(value) {
    const customFields = document.getElementById('teacher-custom-fields-edit');
    const select = document.getElementById('teacher-select-edit');
    const nameInput = document.getElementById('teacher-name-input-edit');
    const phoneInput = document.getElementById('teacher-phone-input-edit');
    
    if (value === 'custom') {
      customFields.style.display = 'grid';
      if (nameInput) nameInput.value = '';
      if (phoneInput) phoneInput.value = '';
    } else if (value) {
      customFields.style.display = 'grid';
      const selectedOption = select.options[select.selectedIndex];
      const teacherName = selectedOption.text.split('(')[0].trim();
      const teacherPhone = selectedOption.dataset.phone || '';
      
      if (nameInput) nameInput.value = teacherName;
      if (phoneInput) phoneInput.value = teacherPhone;
    } else {
      customFields.style.display = 'none';
      if (nameInput) nameInput.value = '';
      if (phoneInput) phoneInput.value = '';
    }
  },
  
  // 반 추가 처리
  async handleAddClass(formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      
      await axios.post(`${API_URL}/classes`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('반이 생성되었습니다.', 'success');
      closeModal();
      this.loadClassesList();
    } catch (error) {
      console.error('Add class error:', error);
      showToast(error.response?.data?.error || '반 생성에 실패했습니다.', 'error');
    }
  },
  
  // 반 상세보기
  async viewClass(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { class: classInfo, students } = response.data;
      this.renderClassDetail(classInfo, students);
    } catch (error) {
      console.error('View class error:', error);
      showToast('반 정보를 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 반 상세 렌더링
  renderClassDetail(classInfo, students) {
    const content = document.getElementById('main-content');
    
    // 미배정 학생 목록 (해당 부서)
    const unassignedStudents = this.allMembers.filter(m => 
      !m.class_id && 
      (m.school_grade && (
        (classInfo.grade_level === '영아부' && m.school_grade === '영아부') ||
        (classInfo.grade_level === '유치부' && m.school_grade === '유치부') ||
        (classInfo.grade_level === '유년부' && m.school_grade === '유년부') ||
        (classInfo.grade_level === '초등부' && m.school_grade.startsWith('초')) ||
        (classInfo.grade_level === '중등부' && m.school_grade.startsWith('중')) ||
        (classInfo.grade_level === '고등부' && m.school_grade.startsWith('고')) ||
        (classInfo.grade_level === '청년부' && m.school_grade === '청년부')
      ))
    );
    
    content.innerHTML = `
      <div class="mb-6">
        <button onclick="ClassesModule.loadClassesList()" class="text-gray-600 hover:text-gray-800 mb-4">
          <i class="fas fa-arrow-left mr-2"></i>목록으로
        </button>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">${classInfo.name}</h2>
            <p class="text-gray-600">${classInfo.grade_level} · 학생 ${students.length}명</p>
          </div>
          <div class="flex space-x-3">
            <button onclick="ClassesModule.showAssignModal(${classInfo.id})" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
              <i class="fas fa-user-plus mr-2"></i>학생 배정
            </button>
            <button onclick="ClassesModule.editClass(${classInfo.id})" class="btn-pastel-primary px-4 py-2 rounded-lg">
              <i class="fas fa-edit mr-2"></i>수정
            </button>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 반 정보 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">반 정보</h3>
            <div class="space-y-3 text-sm">
              ${classInfo.teacher_name ? `
                <div>
                  <p class="text-gray-500">담당 선생님</p>
                  <p class="font-medium text-gray-900">${classInfo.teacher_name}</p>
                  ${classInfo.teacher_phone ? `<p class="text-gray-600">${classInfo.teacher_phone}</p>` : ''}
                </div>
              ` : ''}
              ${classInfo.room_number ? `
                <div>
                  <p class="text-gray-500">교실</p>
                  <p class="font-medium text-gray-900">${classInfo.room_number}</p>
                </div>
              ` : ''}
              ${classInfo.meeting_time ? `
                <div>
                  <p class="text-gray-500">예배 시간</p>
                  <p class="font-medium text-gray-900">${classInfo.meeting_time}</p>
                </div>
              ` : ''}
            </div>
          </div>
          
          ${unassignedStudents.length > 0 ? `
            <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p class="text-sm font-medium text-yellow-800 mb-2">
                <i class="fas fa-exclamation-triangle mr-1"></i>
                미배정 학생 ${unassignedStudents.length}명
              </p>
              <button onclick="ClassesModule.showAssignModal(${classInfo.id})" class="text-xs text-yellow-700 hover:text-yellow-900">
                배정하기 →
              </button>
            </div>
          ` : ''}
        </div>
        
        <!-- 학생 목록 -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">학생 목록 (${students.length}명)</h3>
            ${students.length > 0 ? `
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${students.map(student => {
                  const age = student.birth_date ? new Date().getFullYear() - new Date(student.birth_date).getFullYear() : '';
                  return `
                    <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <i class="fas fa-user text-purple-600"></i>
                        </div>
                        <div>
                          <p class="font-medium text-gray-900">${student.name}</p>
                          <p class="text-xs text-gray-500">
                            ${student.school_grade || '-'} ${age ? `· ${age}세` : ''}
                          </p>
                        </div>
                      </div>
                      <button onclick="ClassesModule.unassignStudent(${classInfo.id}, ${student.id})" class="text-red-600 hover:text-red-800 p-2">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <p class="text-gray-500 text-center py-8">배정된 학생이 없습니다.</p>
            `}
          </div>
        </div>
      </div>
    `;
  },
  
  // 학생 배정 모달
  showAssignModal(classId) {
    const classInfo = this.currentClasses.find(c => c.id === classId);
    
    // 미배정 학생 필터링
    const availableStudents = this.allMembers.filter(m => !m.class_id);
    
    showModal('학생 배정', `
      <form id="assign-student-form" class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-600">
            <strong>${classInfo.name}</strong>에 배정할 학생을 선택하세요.
          </p>
          <button type="button" onclick="ClassesModule.toggleSelectAll()" class="text-sm text-purple-600 hover:text-purple-800">
            <i class="fas fa-check-double mr-1"></i>전체 선택
          </button>
        </div>
        
        <!-- 검색 필터 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">학생 검색</label>
          <input 
            type="text" 
            id="student-search" 
            placeholder="이름, 학년으로 검색..."
            class="input-modern w-full"
            onkeyup="ClassesModule.filterStudentsInModal()"
          >
        </div>
        
        <!-- 학생 리스트 (체크박스 방식) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            학생 선택 * 
            <span id="selected-count" class="text-purple-600 font-bold ml-2">0명 선택됨</span>
          </label>
          ${availableStudents.length > 0 ? `
            <div id="student-list" class="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              ${availableStudents.map((m, index) => {
                const age = m.birth_date ? new Date().getFullYear() - new Date(m.birth_date).getFullYear() : '';
                return `
                  <label 
                    class="student-item flex items-center p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    data-name="${m.name.toLowerCase()}"
                    data-grade="${(m.school_grade || '').toLowerCase()}"
                  >
                    <input 
                      type="checkbox" 
                      class="student-checkbox mr-3 rounded border-gray-300" 
                      value="${m.id}"
                      onchange="ClassesModule.updateSelectedCount()"
                    >
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <span class="font-medium text-gray-900">${m.name}</span>
                        ${m.school_grade ? `
                          <span class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                            ${m.school_grade}
                          </span>
                        ` : ''}
                        ${age ? `<span class="text-xs text-gray-500">${age}세</span>` : ''}
                      </div>
                      <p class="text-xs text-gray-500 mt-1">
                        ${m.member_number} ${m.phone ? `· ${m.phone}` : ''}
                      </p>
                    </div>
                  </label>
                `;
              }).join('')}
            </div>
            <p class="text-xs text-gray-500 mt-2">
              총 <span id="student-count">${availableStudents.length}</span>명의 학생
            </p>
          ` : `
            <p class="text-sm text-yellow-600 p-4 bg-yellow-50 rounded-lg">
              <i class="fas fa-info-circle mr-1"></i>
              배정 가능한 학생이 없습니다.
            </p>
          `}
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            취소
          </button>
          <button type="submit" class="btn-pastel-primary px-6 py-2 rounded-lg" ${availableStudents.length === 0 ? 'disabled' : ''}>
            <i class="fas fa-user-plus mr-2"></i>선택한 학생 배정
          </button>
        </div>
      </form>
    `);
    
    document.getElementById('assign-student-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAssignStudent(classId, new FormData(e.target));
    });
  },
  
  // 모달 내 학생 검색 필터
  filterStudentsInModal() {
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    const studentItems = document.querySelectorAll('.student-item');
    let visibleCount = 0;
    
    studentItems.forEach(item => {
      const name = item.dataset.name || '';
      const grade = item.dataset.grade || '';
      
      if (name.includes(searchTerm) || grade.includes(searchTerm)) {
        item.style.display = 'flex';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });
    
    const countElement = document.getElementById('student-count');
    if (countElement) {
      countElement.textContent = visibleCount;
    }
  },
  
  // 전체 선택/해제 토글
  toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    const visibleCheckboxes = Array.from(checkboxes).filter(cb => {
      const item = cb.closest('.student-item');
      return item && item.style.display !== 'none';
    });
    
    const allChecked = visibleCheckboxes.every(cb => cb.checked);
    
    visibleCheckboxes.forEach(cb => {
      cb.checked = !allChecked;
    });
    
    this.updateSelectedCount();
  },
  
  // 선택된 학생 수 업데이트
  updateSelectedCount() {
    const selectedCheckboxes = document.querySelectorAll('.student-checkbox:checked');
    const countElement = document.getElementById('selected-count');
    if (countElement) {
      countElement.textContent = `${selectedCheckboxes.length}명 선택됨`;
    }
  },
  
  // 학생 배정 처리
  async handleAssignStudent(classId, formData) {
    try {
      const token = localStorage.getItem('token');
      
      // 체크된 학생들의 ID 수집
      const selectedCheckboxes = document.querySelectorAll('.student-checkbox:checked');
      const memberIds = Array.from(selectedCheckboxes).map(cb => cb.value);
      
      if (memberIds.length === 0) {
        showToast('배정할 학생을 선택해주세요.', 'warning');
        return;
      }
      
      // 각 학생을 순차적으로 배정
      for (const memberId of memberIds) {
        await axios.post(`${API_URL}/classes/${classId}/assign`, 
          { member_id: memberId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      showToast(`${memberIds.length}명의 학생이 배정되었습니다.`, 'success');
      closeModal();
      this.viewClass(classId);
      
      // allMembers 새로고침
      const membersRes = await axios.get(`${API_URL}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.allMembers = membersRes.data.members || [];
    } catch (error) {
      console.error('Assign student error:', error);
      showToast(error.response?.data?.error || '학생 배정에 실패했습니다.', 'error');
    }
  },
  
  // 학생 배정 해제
  async unassignStudent(classId, memberId) {
    if (!confirm('이 학생의 반 배정을 해제하시겠습니까?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/classes/${classId}/assign/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('반 배정이 해제되었습니다.', 'success');
      this.viewClass(classId);
      
      // allMembers 새로고침
      const membersRes = await axios.get(`${API_URL}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.allMembers = membersRes.data.members || [];
    } catch (error) {
      console.error('Unassign student error:', error);
      showToast('반 배정 해제에 실패했습니다.', 'error');
    }
  },
  
  // 반 수정
  async editClass(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const classInfo = response.data.class;
      
      showModal('반 수정', `
        <form id="edit-class-form" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">반 이름 *</label>
              <input type="text" name="name" value="${classInfo.name}" required class="input-modern w-full">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">부서 *</label>
              <select name="grade_level" required class="input-modern w-full">
                ${this.departments.map(d => `
                  <option value="${d.name}" ${classInfo.grade_level === d.name ? 'selected' : ''}>${d.name}</option>
                `).join('')}
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">담당 선생님</label>
            <select id="teacher-select-edit" class="input-modern w-full" onchange="ClassesModule.selectTeacherEdit(this.value)">
              <option value="">선택하세요</option>
              ${this.allTeachers.map(t => {
                const isSelected = classInfo.teacher_name === t.name;
                return `<option value="${t.id}" data-phone="${t.phone || ''}" ${isSelected ? 'selected' : ''}>${t.name} ${t.position ? `(${t.position})` : ''}</option>`;
              }).join('')}
              <option value="custom">직접 입력</option>
            </select>
          </div>
          
          <div id="teacher-custom-fields-edit" class="grid grid-cols-2 gap-4" style="${classInfo.teacher_name ? 'display: grid;' : 'display: none;'}">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">선생님 이름</label>
              <input type="text" id="teacher-name-input-edit" name="teacher_name" value="${classInfo.teacher_name || ''}" class="input-modern w-full">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">선생님 연락처</label>
              <input type="tel" id="teacher-phone-input-edit" name="teacher_phone" value="${classInfo.teacher_phone || ''}" class="input-modern w-full">
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">교실</label>
              <input type="text" name="room_number" value="${classInfo.room_number || ''}" class="input-modern w-full">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">예배 시간</label>
              <input type="text" name="meeting_time" value="${classInfo.meeting_time || ''}" class="input-modern w-full">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
            <textarea name="description" rows="2" class="input-modern w-full">${classInfo.description || ''}</textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">활성 상태</label>
            <select name="is_active" class="input-modern w-full">
              <option value="1" ${classInfo.is_active ? 'selected' : ''}>활성</option>
              <option value="0" ${!classInfo.is_active ? 'selected' : ''}>비활성</option>
            </select>
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
      
      document.getElementById('edit-class-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEditClass(id, new FormData(e.target));
      });
    } catch (error) {
      console.error('Edit class error:', error);
      showToast('반 정보를 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 반 수정 처리
  async handleEditClass(id, formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      
      await axios.put(`${API_URL}/classes/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('반 정보가 수정되었습니다.', 'success');
      closeModal();
      this.loadClassesList();
    } catch (error) {
      console.error('Update class error:', error);
      showToast(error.response?.data?.error || '반 수정에 실패했습니다.', 'error');
    }
  },
  
  // 전체 학년 자동 갱신
  async updateAllGrades() {
    if (!confirm('모든 학생의 학년을 생년월일 기준으로 자동 갱신하시겠습니까?\n(수동으로 설정된 학년은 제외됩니다)')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/classes/update-grades`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('학년이 자동 갱신되었습니다.', 'success');
      this.loadClassesList();
    } catch (error) {
      console.error('Update grades error:', error);
      showToast('학년 갱신에 실패했습니다.', 'error');
    }
  },
  
  // 부서별 필터링
  async filterByDepartment(departmentId) {
    const deptId = departmentId ? Number(departmentId) : null;
    try {
      const token = localStorage.getItem('token');
      const params = deptId ? { department_id: deptId } : {};
      const response = await axios.get(`${API_URL}/classes`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      this.currentClasses = response.data.classes || [];
      this.renderClassesList();
    } catch (error) {
      console.error('Filter classes error:', error);
      showToast('반 목록을 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 반 삭제
  async deleteClass(id) {
    if (!confirm('이 반을 삭제하시겠습니까?\n(학생이 배정된 반은 삭제할 수 없습니다)')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('반이 삭제되었습니다.', 'success');
      this.loadClassesList();
    } catch (error) {
      console.error('Delete class error:', error);
      showToast(error.response?.data?.error || '반 삭제에 실패했습니다.', 'error');
    }
  }
};

