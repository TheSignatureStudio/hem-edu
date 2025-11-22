// 교인 관리 모듈

const MembersModule = {
  currentMembers: [],
  currentMember: null,
  revealedMembers: new Set(), // 가려진 정보를 본 멤버 ID 집합
  
  // 교인 목록 로드
  async loadMembersList() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      this.currentMembers = response.data.members || [];
      this.renderMembersList();
    } catch (error) {
      console.error('Load members error:', error);
      showToast('교인 목록을 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 교인 목록 렌더링
  renderMembersList() {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">교인 관리</h2>
          <p class="text-gray-600">총 ${this.currentMembers.length}명의 교인이 등록되어 있습니다.</p>
        </div>
        <button onclick="MembersModule.showAddModal()" class="btn-pastel-primary px-6 py-3 rounded-lg">
          <i class="fas fa-plus mr-2"></i>교인 등록
        </button>
      </div>
      
      <!-- 검색 및 필터 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2">
            <input 
              type="text" 
              id="search-input" 
              placeholder="이름, 전화번호로 검색..." 
              class="input-modern w-full"
              onkeyup="MembersModule.handleSearch()"
            >
          </div>
          <select id="status-filter" class="input-modern" onchange="MembersModule.handleFilter()">
            <option value="">전체 상태</option>
            <option value="active">등록</option>
            <option value="inactive">비활동</option>
            <option value="transferred">이동</option>
            <option value="deceased">소천</option>
          </select>
          <select id="baptism-filter" class="input-modern" onchange="MembersModule.handleFilter()">
            <option value="">전체 세례</option>
            <option value="유아세례">유아세례</option>
            <option value="입교">입교</option>
            <option value="세례">세례</option>
            <option value="미정">미정</option>
          </select>
        </div>
      </div>
      
      <!-- 교인 목록 테이블 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학생번호</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학년</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">반</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생년월일</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody id="members-table-body" class="bg-white divide-y divide-gray-200">
              ${this.renderMembersRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  
  // 교인 목록 행 렌더링
  renderMembersRows() {
    if (this.currentMembers.length === 0) {
      return `
        <tr>
          <td colspan="8" class="px-6 py-8 text-center text-gray-500">
            등록된 교인이 없습니다.
          </td>
        </tr>
      `;
    }
    
    return this.currentMembers.map(member => {
      const statusBadge = this.getStatusBadge(member.member_status);
      const birthDate = member.birth_date ? new Date(member.birth_date).toLocaleDateString('ko-KR') : '-';
      
      const age = member.birth_date ? new Date().getFullYear() - new Date(member.birth_date).getFullYear() : '';
      
      return `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${member.member_number}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${member.name}</div>
            <div class="text-xs text-gray-500">${member.family_name || ''}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
            ${member.school_grade || '-'}
            ${member.grade_override ? '<i class="fas fa-lock text-xs text-yellow-600" title="수동 설정"></i>' : ''}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${member.class_name || '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${birthDate} ${age ? `(${age}세)` : ''}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
            ${this.revealedMembers.has(member.id) 
              ? (member.phone || '-')
              : (member.phone ? '***-****-****' : '-')
            }
            ${member.phone && !this.revealedMembers.has(member.id) ? `
              <button 
                onclick="MembersModule.revealMemberInfo(${member.id})"
                class="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                title="가려진 정보보기"
              >
                <i class="fas fa-eye"></i> 보기
              </button>
            ` : ''}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <button onclick="MembersModule.viewMember(${member.id})" class="text-blue-600 hover:text-blue-800 mr-3">
              <i class="fas fa-eye"></i>
            </button>
            <button onclick="MembersModule.editMember(${member.id})" class="text-green-600 hover:text-green-800 mr-3">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="MembersModule.deleteMember(${member.id})" class="text-red-600 hover:text-red-800">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },
  
  // 상태 뱃지
  getStatusBadge(status) {
    const badges = {
      active: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">등록</span>',
      inactive: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">비활동</span>',
      transferred: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">이동</span>',
      deceased: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">소천</span>'
    };
    return badges[status] || badges.active;
  },
  
  // 검색
  handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredMembers = this.currentMembers.filter(member => 
      member.name.toLowerCase().includes(searchTerm) ||
      (member.phone && member.phone.includes(searchTerm)) ||
      member.member_number.toLowerCase().includes(searchTerm)
    );
    
    const tbody = document.getElementById('members-table-body');
    tbody.innerHTML = this.renderFilteredRows(filteredMembers);
  },
  
  // 필터
  handleFilter() {
    const statusFilter = document.getElementById('status-filter').value;
    const baptismFilter = document.getElementById('baptism-filter').value;
    
    let filteredMembers = [...this.currentMembers];
    
    if (statusFilter) {
      filteredMembers = filteredMembers.filter(m => m.member_status === statusFilter);
    }
    
    if (baptismFilter) {
      filteredMembers = filteredMembers.filter(m => m.baptism_type === baptismFilter);
    }
    
    const tbody = document.getElementById('members-table-body');
    tbody.innerHTML = this.renderFilteredRows(filteredMembers);
  },
  
  // 필터된 행 렌더링
  renderFilteredRows(members) {
    if (members.length === 0) {
      return `
        <tr>
          <td colspan="8" class="px-6 py-8 text-center text-gray-500">
            검색 결과가 없습니다.
          </td>
        </tr>
      `;
    }
    
    const originalMembers = this.currentMembers;
    this.currentMembers = members;
    const rows = this.renderMembersRows();
    this.currentMembers = originalMembers;
    return rows;
  },
  
  // 교인 추가 모달
  async showAddModal() {
    const nextNumber = await this.getNextMemberNumber();
    
    showModal('교인 등록', `
      <form id="add-member-form" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">교인번호 *</label>
            <input type="text" name="member_number" value="${nextNumber}" required class="input-modern w-full" readonly>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
            <input type="text" name="name" required class="input-modern w-full">
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">영문 이름</label>
            <input type="text" name="name_english" class="input-modern w-full">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">성별</label>
            <select name="gender" class="input-modern w-full">
              <option value="">선택</option>
              <option value="남">남</option>
              <option value="여">여</option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
            <input type="date" name="birth_date" class="input-modern w-full">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
            <input type="tel" name="phone" class="input-modern w-full">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
          <input type="email" name="email" class="input-modern w-full">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">주소</label>
          <input type="text" name="address" class="input-modern w-full">
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">세례 구분</label>
            <select name="baptism_type" class="input-modern w-full">
              <option value="">선택</option>
              <option value="유아세례">유아세례</option>
              <option value="입교">입교</option>
              <option value="세례">세례</option>
              <option value="미정">미정</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">세례일</label>
            <input type="date" name="baptism_date" class="input-modern w-full">
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">등록일</label>
            <input type="date" name="registration_date" class="input-modern w-full">
          </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">학년 (자동 계산)</label>
            <input type="text" name="school_grade" class="input-modern w-full" placeholder="생년월일로 자동 계산">
            <p class="text-xs text-gray-500 mt-1">※ 입력하지 않으면 생년월일 기준으로 자동 계산됩니다</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">현재 봉사</label>
            <input type="text" name="current_service" class="input-modern w-full">
          </div>
        </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">비고</label>
          <textarea name="note" rows="3" class="input-modern w-full"></textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            취소
          </button>
          <button type="submit" class="btn-pastel-primary px-6 py-2 rounded-lg">
            등록
          </button>
        </div>
      </form>
    `);
    
    document.getElementById('add-member-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddMember(new FormData(e.target));
    });
  },
  
  // 다음 교인번호 가져오기
  async getNextMemberNumber() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/members/next-member-number`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.member_number;
    } catch (error) {
      console.error('Get next member number error:', error);
      const year = new Date().getFullYear();
      return `M${year}001`;
    }
  },
  
  // 교인 추가 처리
  async handleAddMember(formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      
      await axios.post(`${API_URL}/members`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('교인이 등록되었습니다.', 'success');
      closeModal();
      this.loadMembersList();
    } catch (error) {
      console.error('Add member error:', error);
      showToast(error.response?.data?.error || '교인 등록에 실패했습니다.', 'error');
    }
  },
  
  // 교인 상세보기
  async viewMember(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/members/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      this.currentMember = response.data.member;
      this.renderMemberDetail(response.data);
    } catch (error) {
      console.error('View member error:', error);
      showToast('교인 정보를 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 교인 상세 렌더링
  renderMemberDetail(data) {
    const { member, groups, attendance, counseling, services, donationStats } = data;
    
    const content = document.getElementById('main-content');
    content.innerHTML = `
      <div class="mb-6">
        <button onclick="MembersModule.loadMembersList()" class="text-gray-600 hover:text-gray-800 mb-4">
          <i class="fas fa-arrow-left mr-2"></i>목록으로
        </button>
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800">${member.name} 교인 정보</h2>
          <button onclick="MembersModule.editMember(${member.id})" class="btn-pastel-primary px-4 py-2 rounded-lg">
            <i class="fas fa-edit mr-2"></i>수정
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 기본 정보 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">기본 정보</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">교인번호</p>
                <p class="text-base font-medium text-gray-900">${member.member_number}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">이름</p>
                <p class="text-base font-medium text-gray-900">${member.name}${member.name_english ? ` (${member.name_english})` : ''}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">성별</p>
                <p class="text-base font-medium text-gray-900">${member.gender || '-'}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">생년월일</p>
                <p class="text-base font-medium text-gray-900">${member.birth_date ? new Date(member.birth_date).toLocaleDateString('ko-KR') : '-'}</p>
              </div>
              ${member.school_grade ? `
              <div>
                <p class="text-sm text-gray-500">학년</p>
                <p class="text-base font-medium text-gray-900">
                  ${member.school_grade}
                  ${member.grade_override ? '<span class="text-xs text-yellow-600">(수동 설정)</span>' : ''}
                </p>
              </div>
              ` : ''}
              ${member.class_name ? `
              <div>
                <p class="text-sm text-gray-500">소속 반</p>
                <p class="text-base font-medium text-gray-900">${member.class_name}</p>
                ${member.teacher_name ? `<p class="text-sm text-gray-600">${member.teacher_name} 선생님</p>` : ''}
              </div>
              ` : ''}
              <div>
                <p class="text-sm text-gray-500">연락처</p>
                <div class="flex items-center">
                  <p class="text-base font-medium text-gray-900">
                    ${this.revealedMembers.has(member.id) 
                      ? (member.phone || '-')
                      : (member.phone ? '***-****-****' : '-')
                    }
                  </p>
                  ${member.phone && !this.revealedMembers.has(member.id) ? `
                    <button 
                      onclick="MembersModule.revealMemberInfo(${member.id}, true)"
                      class="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                      title="가려진 정보보기"
                    >
                      <i class="fas fa-eye"></i> 보기
                    </button>
                  ` : ''}
                </div>
              </div>
              <div>
                <p class="text-sm text-gray-500">이메일</p>
                <p class="text-base font-medium text-gray-900">
                  ${this.revealedMembers.has(member.id) 
                    ? (member.email || '-')
                    : (member.email ? '***@***.***' : '-')
                  }
                </p>
              </div>
              <div class="col-span-2">
                <p class="text-sm text-gray-500">주소</p>
                <p class="text-base font-medium text-gray-900">
                  ${this.revealedMembers.has(member.id) 
                    ? (member.address || '-')
                    : (member.address ? '***' : '-')
                  }
                </p>
              </div>
            </div>
          </div>
          
          <!-- 신앙 정보 -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">신앙 정보</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">세례 구분</p>
                <p class="text-base font-medium text-gray-900">${member.baptism_type || '-'}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">세례일</p>
                <p class="text-base font-medium text-gray-900">${member.baptism_date ? new Date(member.baptism_date).toLocaleDateString('ko-KR') : '-'}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">등록일</p>
                <p class="text-base font-medium text-gray-900">${member.registration_date ? new Date(member.registration_date).toLocaleDateString('ko-KR') : '-'}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">이전 교회</p>
                <p class="text-base font-medium text-gray-900">${member.previous_church || '-'}</p>
              </div>
            </div>
          </div>
          
          <!-- 봉사 기록 -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">봉사 기록</h3>
            ${services && services.length > 0 ? `
              <div class="space-y-3">
                ${services.map(s => `
                  <div class="border-l-4 border-purple-500 pl-4 py-2">
                    <p class="font-medium text-gray-900">${s.service_name}</p>
                    <p class="text-sm text-gray-600">${s.start_date} ~</p>
                  </div>
                `).join('')}
              </div>
            ` : '<p class="text-gray-500">봉사 기록이 없습니다.</p>'}
          </div>
        </div>
        
        <!-- 사이드 정보 -->
        <div>
          <!-- 소속 구역 -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">소속 구역/소그룹</h3>
            ${groups && groups.length > 0 ? `
              <div class="space-y-2">
                ${groups.map(g => `
                  <div class="p-3 bg-purple-50 rounded-lg">
                    <p class="font-medium text-gray-900">${g.name}</p>
                    <p class="text-sm text-gray-600">${g.role}</p>
                  </div>
                `).join('')}
              </div>
            ` : '<p class="text-gray-500 text-sm">소속 구역이 없습니다.</p>'}
          </div>
          
          <!-- 최근 출석 -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">최근 출석</h3>
            ${attendance && attendance.length > 0 ? `
              <div class="space-y-2">
                ${attendance.slice(0, 5).map(a => `
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-600">${new Date(a.attendance_date).toLocaleDateString('ko-KR')}</span>
                    <span class="px-2 py-1 rounded-full text-xs ${a.status === '출석' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                      ${a.status}
                    </span>
                  </div>
                `).join('')}
              </div>
            ` : '<p class="text-gray-500 text-sm">출석 기록이 없습니다.</p>'}
          </div>
        </div>
      </div>
    `;
  },
  
  // 교인 수정
  async editMember(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/members/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const member = response.data.member;
      
      showModal('교인 정보 수정', `
        <form id="edit-member-form" class="space-y-4">
          <input type="hidden" name="id" value="${member.id}">
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">교인번호</label>
              <input type="text" value="${member.member_number}" class="input-modern w-full" readonly>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
              <input type="text" name="name" value="${member.name}" required class="input-modern w-full">
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">영문 이름</label>
              <input type="text" name="name_english" value="${member.name_english || ''}" class="input-modern w-full">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">성별</label>
              <select name="gender" class="input-modern w-full">
                <option value="">선택</option>
                <option value="남" ${member.gender === '남' ? 'selected' : ''}>남</option>
                <option value="여" ${member.gender === '여' ? 'selected' : ''}>여</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
              <input type="date" name="birth_date" value="${member.birth_date || ''}" class="input-modern w-full">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
              <input type="tel" name="phone" value="${member.phone || ''}" class="input-modern w-full">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input type="email" name="email" value="${member.email || ''}" class="input-modern w-full">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">주소</label>
            <input type="text" name="address" value="${member.address || ''}" class="input-modern w-full">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">세례 구분</label>
              <select name="baptism_type" class="input-modern w-full">
                <option value="">선택</option>
                <option value="유아세례" ${member.baptism_type === '유아세례' ? 'selected' : ''}>유아세례</option>
                <option value="입교" ${member.baptism_type === '입교' ? 'selected' : ''}>입교</option>
                <option value="세례" ${member.baptism_type === '세례' ? 'selected' : ''}>세례</option>
                <option value="미정" ${member.baptism_type === '미정' ? 'selected' : ''}>미정</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">세례일</label>
              <input type="date" name="baptism_date" value="${member.baptism_date || ''}" class="input-modern w-full">
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">등록일</label>
              <input type="date" name="registration_date" value="${member.registration_date || ''}" class="input-modern w-full">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <select name="member_status" class="input-modern w-full">
                <option value="active" ${member.member_status === 'active' ? 'selected' : ''}>등록</option>
                <option value="inactive" ${member.member_status === 'inactive' ? 'selected' : ''}>비활동</option>
                <option value="transferred" ${member.member_status === 'transferred' ? 'selected' : ''}>이동</option>
                <option value="deceased" ${member.member_status === 'deceased' ? 'selected' : ''}>소천</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">학년</label>
              <input type="text" name="school_grade" value="${member.school_grade || ''}" class="input-modern w-full">
              <p class="text-xs text-gray-500 mt-1">
                ${member.grade_override ? '※ 수동으로 설정된 학년입니다' : '※ 비우면 생년월일로 자동 계산'}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">현재 봉사</label>
              <input type="text" name="current_service" value="${member.current_service || ''}" class="input-modern w-full">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">비고</label>
            <textarea name="note" rows="3" class="input-modern w-full">${member.note || ''}</textarea>
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
      
      document.getElementById('edit-member-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEditMember(id, new FormData(e.target));
      });
    } catch (error) {
      console.error('Edit member error:', error);
      showToast('교인 정보를 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 가려진 정보 보기 (정보 열람 기록)
  async revealMemberInfo(memberId, refreshView = false) {
    try {
      const token = localStorage.getItem('token');
      
      // 정보 열람 기록 저장
      await axios.post(`${API_URL}/information-access/log`, {
        member_id: memberId,
        access_type: 'view',
        accessed_fields: ['phone', 'email', 'address']
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 가려진 정보 표시
      this.revealedMembers.add(memberId);
      
      if (refreshView) {
        // 상세 보기 모달이 열려있으면 새로고침
        await this.viewMember(memberId);
      } else {
        // 목록 새로고침
        this.renderMembersList();
      }
      
      showToast('정보 열람이 기록되었습니다.', 'info');
    } catch (error) {
      console.error('Reveal member info error:', error);
      showToast('정보 열람 기록에 실패했습니다.', 'error');
    }
  },
  
  // 교인 수정 처리
  async handleEditMember(id, formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      
      await axios.put(`${API_URL}/members/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('교인 정보가 수정되었습니다.', 'success');
      closeModal();
      this.loadMembersList();
    } catch (error) {
      console.error('Update member error:', error);
      showToast(error.response?.data?.error || '교인 정보 수정에 실패했습니다.', 'error');
    }
  },
  
  // 교인 삭제
  async deleteMember(id) {
    if (!confirm('정말 이 교인을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/members/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('교인이 삭제되었습니다.', 'success');
      this.loadMembersList();
    } catch (error) {
      console.error('Delete member error:', error);
      showToast(error.response?.data?.error || '교인 삭제에 실패했습니다.', 'error');
    }
  }
};

