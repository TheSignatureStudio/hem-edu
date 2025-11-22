// 구역/소그룹 관리 모듈

const GroupsModule = {
  currentGroups: [],
  allMembers: [],
  
  // 구역 목록 로드
  async loadGroupsList() {
    try {
      const token = localStorage.getItem('token');
      const [groupsRes, membersRes] = await Promise.all([
        axios.get(`${API_URL}/groups`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/members`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      this.currentGroups = groupsRes.data.groups || [];
      this.allMembers = membersRes.data.members || [];
      this.renderGroupsList();
    } catch (error) {
      console.error('Load groups error:', error);
      showToast('구역 목록을 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 구역 목록 렌더링
  renderGroupsList() {
    const content = document.getElementById('main-content');
    
    const groupTypes = {
      '구역': this.currentGroups.filter(g => g.group_type === '구역'),
      '소그룹': this.currentGroups.filter(g => g.group_type === '소그룹'),
      '선교회': this.currentGroups.filter(g => g.group_type === '선교회'),
      '기타': this.currentGroups.filter(g => g.group_type === '기타' || !g.group_type)
    };
    
    content.innerHTML = `
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">구역/소그룹 관리</h2>
          <p class="text-gray-600">총 ${this.currentGroups.length}개의 구역/소그룹이 있습니다.</p>
        </div>
        <button onclick="GroupsModule.showAddModal()" class="btn-pastel-primary px-6 py-3 rounded-lg">
          <i class="fas fa-plus mr-2"></i>구역 생성
        </button>
      </div>
      
      <!-- 구역 카드 그리드 -->
      <div class="space-y-8">
        ${Object.entries(groupTypes).map(([type, groups]) => `
          ${groups.length > 0 ? `
            <div>
              <h3 class="text-lg font-bold text-gray-800 mb-4">${type}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${groups.map(group => this.renderGroupCard(group)).join('')}
              </div>
            </div>
          ` : ''}
        `).join('')}
        
        ${this.currentGroups.length === 0 ? `
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <i class="fas fa-object-group text-gray-300 text-5xl mb-4"></i>
            <p class="text-gray-500">등록된 구역/소그룹이 없습니다.</p>
            <button onclick="GroupsModule.showAddModal()" class="mt-4 btn-pastel-primary px-6 py-2 rounded-lg">
              첫 구역 만들기
            </button>
          </div>
        ` : ''}
      </div>
    `;
  },
  
  // 구역 카드 렌더링
  renderGroupCard(group) {
    const typeColors = {
      '구역': 'purple',
      '소그룹': 'blue',
      '선교회': 'green',
      '기타': 'gray'
    };
    const color = typeColors[group.group_type] || 'gray';
    
    return `
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center">
              <i class="fas fa-users text-${color}-600"></i>
            </div>
            <div>
              <h4 class="font-bold text-gray-800">${group.name}</h4>
              <p class="text-xs text-gray-500">${group.group_type}</p>
            </div>
          </div>
          <div class="flex space-x-1">
            <button onclick="GroupsModule.viewGroup(${group.id})" class="text-blue-600 hover:text-blue-800 p-1">
              <i class="fas fa-eye text-sm"></i>
            </button>
            <button onclick="GroupsModule.editGroup(${group.id})" class="text-green-600 hover:text-green-800 p-1">
              <i class="fas fa-edit text-sm"></i>
            </button>
          </div>
        </div>
        
        <div class="space-y-2 text-sm text-gray-600 mb-4">
          ${group.leader_name ? `
            <div class="flex items-center">
              <i class="fas fa-user-tie w-5 text-${color}-600"></i>
              <span>${group.leader_name}</span>
            </div>
          ` : ''}
          ${group.meeting_day ? `
            <div class="flex items-center">
              <i class="fas fa-calendar w-5 text-${color}-600"></i>
              <span>${group.meeting_day} ${group.meeting_time || ''}</span>
            </div>
          ` : ''}
          ${group.meeting_place ? `
            <div class="flex items-center">
              <i class="fas fa-map-marker-alt w-5 text-${color}-600"></i>
              <span>${group.meeting_place}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-600">
            <i class="fas fa-users mr-1"></i>
            ${group.member_count || 0}명
          </span>
          <button onclick="GroupsModule.viewGroup(${group.id})" class="text-sm text-${color}-600 hover:text-${color}-800 font-medium">
            상세보기 →
          </button>
        </div>
      </div>
    `;
  },
  
  // 구역 추가 모달
  showAddModal() {
    showModal('구역/소그룹 생성', `
      <form id="add-group-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
          <input type="text" name="name" required class="input-modern w-full" placeholder="예: 1구역, 청년부">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">구분 *</label>
          <select name="group_type" required class="input-modern w-full">
            <option value="">선택하세요</option>
            <option value="구역">구역</option>
            <option value="소그룹">소그룹</option>
            <option value="선교회">선교회</option>
            <option value="기타">기타</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">리더</label>
          <select name="leader_member_id" class="input-modern w-full">
            <option value="">선택하세요</option>
            ${this.allMembers.map(m => `
              <option value="${m.id}">${m.name} (${m.member_number})</option>
            `).join('')}
          </select>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">모임 요일</label>
            <select name="meeting_day" class="input-modern w-full">
              <option value="">선택하세요</option>
              <option value="월요일">월요일</option>
              <option value="화요일">화요일</option>
              <option value="수요일">수요일</option>
              <option value="목요일">목요일</option>
              <option value="금요일">금요일</option>
              <option value="토요일">토요일</option>
              <option value="일요일">일요일</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">모임 시간</label>
            <input type="text" name="meeting_time" class="input-modern w-full" placeholder="예: 오후 7시">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">모임 장소</label>
          <input type="text" name="meeting_place" class="input-modern w-full" placeholder="예: 김집사님 댁">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
          <textarea name="description" rows="3" class="input-modern w-full"></textarea>
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
    
    document.getElementById('add-group-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddGroup(new FormData(e.target));
    });
  },
  
  // 구역 추가 처리
  async handleAddGroup(formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      
      // 빈 값 제거
      Object.keys(data).forEach(key => {
        if (data[key] === '') data[key] = null;
      });
      
      await axios.post(`${API_URL}/groups`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('구역/소그룹이 생성되었습니다.', 'success');
      closeModal();
      this.loadGroupsList();
    } catch (error) {
      console.error('Add group error:', error);
      showToast(error.response?.data?.error || '구역 생성에 실패했습니다.', 'error');
    }
  },
  
  // 구역 상세보기
  async viewGroup(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { group, members } = response.data;
      this.renderGroupDetail(group, members);
    } catch (error) {
      console.error('View group error:', error);
      showToast('구역 정보를 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 구역 상세 렌더링
  renderGroupDetail(group, members) {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
      <div class="mb-6">
        <button onclick="GroupsModule.loadGroupsList()" class="text-gray-600 hover:text-gray-800 mb-4">
          <i class="fas fa-arrow-left mr-2"></i>목록으로
        </button>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">${group.name}</h2>
            <p class="text-gray-600">${group.group_type}</p>
          </div>
          <div class="flex space-x-3">
            <button onclick="GroupsModule.showAddMemberModal(${group.id})" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
              <i class="fas fa-user-plus mr-2"></i>회원 추가
            </button>
            <button onclick="GroupsModule.editGroup(${group.id})" class="btn-pastel-primary px-4 py-2 rounded-lg">
              <i class="fas fa-edit mr-2"></i>수정
            </button>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 구역 정보 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">구역 정보</h3>
            <div class="space-y-3">
              ${group.leader_name ? `
                <div>
                  <p class="text-sm text-gray-500">리더</p>
                  <p class="text-base font-medium text-gray-900">${group.leader_name}</p>
                  ${group.leader_phone ? `<p class="text-sm text-gray-600">${group.leader_phone}</p>` : ''}
                </div>
              ` : ''}
              ${group.meeting_day || group.meeting_time ? `
                <div>
                  <p class="text-sm text-gray-500">모임 시간</p>
                  <p class="text-base font-medium text-gray-900">
                    ${group.meeting_day || ''} ${group.meeting_time || ''}
                  </p>
                </div>
              ` : ''}
              ${group.meeting_place ? `
                <div>
                  <p class="text-sm text-gray-500">모임 장소</p>
                  <p class="text-base font-medium text-gray-900">${group.meeting_place}</p>
                </div>
              ` : ''}
              ${group.description ? `
                <div>
                  <p class="text-sm text-gray-500">설명</p>
                  <p class="text-base text-gray-700">${group.description}</p>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <!-- 회원 목록 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">회원 목록 (${members.length}명)</h3>
            ${members.length > 0 ? `
              <div class="space-y-3">
                ${members.map(member => `
                  <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <i class="fas fa-user text-purple-600"></i>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">${member.name}</p>
                        <p class="text-sm text-gray-500">${member.phone || '-'}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        ${member.role}
                      </span>
                      <button onclick="GroupsModule.removeMember(${group.id}, ${member.member_id})" class="text-red-600 hover:text-red-800 p-2">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <p class="text-gray-500 text-center py-8">등록된 회원이 없습니다.</p>
            `}
          </div>
        </div>
      </div>
    `;
  },
  
  // 회원 추가 모달
  showAddMemberModal(groupId) {
    showModal('구역 회원 추가', `
      <form id="add-member-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">교인 선택 *</label>
          <select name="member_id" required class="input-modern w-full">
            <option value="">선택하세요</option>
            ${this.allMembers.map(m => `
              <option value="${m.id}">${m.name} (${m.phone || m.member_number})</option>
            `).join('')}
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">역할</label>
          <select name="role" class="input-modern w-full">
            <option value="회원">회원</option>
            <option value="리더">리더</option>
            <option value="부리더">부리더</option>
          </select>
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
    
    document.getElementById('add-member-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddMember(groupId, new FormData(e.target));
    });
  },
  
  // 회원 추가 처리
  async handleAddMember(groupId, formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      
      await axios.post(`${API_URL}/groups/${groupId}/members`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('회원이 추가되었습니다.', 'success');
      closeModal();
      this.viewGroup(groupId);
    } catch (error) {
      console.error('Add member error:', error);
      showToast(error.response?.data?.error || '회원 추가에 실패했습니다.', 'error');
    }
  },
  
  // 회원 제거
  async removeMember(groupId, memberId) {
    if (!confirm('이 회원을 구역에서 제외하시겠습니까?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/groups/${groupId}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('회원이 제외되었습니다.', 'success');
      this.viewGroup(groupId);
    } catch (error) {
      console.error('Remove member error:', error);
      showToast('회원 제외에 실패했습니다.', 'error');
    }
  },
  
  // 구역 수정
  async editGroup(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const group = response.data.group;
      
      showModal('구역/소그룹 수정', `
        <form id="edit-group-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
            <input type="text" name="name" value="${group.name}" required class="input-modern w-full">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">구분 *</label>
            <select name="group_type" required class="input-modern w-full">
              <option value="구역" ${group.group_type === '구역' ? 'selected' : ''}>구역</option>
              <option value="소그룹" ${group.group_type === '소그룹' ? 'selected' : ''}>소그룹</option>
              <option value="선교회" ${group.group_type === '선교회' ? 'selected' : ''}>선교회</option>
              <option value="기타" ${group.group_type === '기타' ? 'selected' : ''}>기타</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">리더</label>
            <select name="leader_member_id" class="input-modern w-full">
              <option value="">선택하세요</option>
              ${this.allMembers.map(m => `
                <option value="${m.id}" ${group.leader_member_id == m.id ? 'selected' : ''}>${m.name} (${m.member_number})</option>
              `).join('')}
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">모임 요일</label>
              <select name="meeting_day" class="input-modern w-full">
                <option value="">선택하세요</option>
                ${['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'].map(day => `
                  <option value="${day}" ${group.meeting_day === day ? 'selected' : ''}>${day}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">모임 시간</label>
              <input type="text" name="meeting_time" value="${group.meeting_time || ''}" class="input-modern w-full">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">모임 장소</label>
            <input type="text" name="meeting_place" value="${group.meeting_place || ''}" class="input-modern w-full">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
            <textarea name="description" rows="3" class="input-modern w-full">${group.description || ''}</textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">활성 상태</label>
            <select name="is_active" class="input-modern w-full">
              <option value="1" ${group.is_active ? 'selected' : ''}>활성</option>
              <option value="0" ${!group.is_active ? 'selected' : ''}>비활성</option>
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
      
      document.getElementById('edit-group-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEditGroup(id, new FormData(e.target));
      });
    } catch (error) {
      console.error('Edit group error:', error);
      showToast('구역 정보를 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 구역 수정 처리
  async handleEditGroup(id, formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      
      // 빈 값 제거
      Object.keys(data).forEach(key => {
        if (data[key] === '') data[key] = null;
      });
      
      await axios.put(`${API_URL}/groups/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('구역 정보가 수정되었습니다.', 'success');
      closeModal();
      this.viewGroup(id);
    } catch (error) {
      console.error('Update group error:', error);
      showToast(error.response?.data?.error || '구역 수정에 실패했습니다.', 'error');
    }
  }
};

