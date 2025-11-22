// 상담 기록 모듈

const CounselingModule = {
  currentRecords: [],
  allMembers: [],
  
  // 상담 기록 목록 로드
  async loadCounselingList() {
    try {
      const token = localStorage.getItem('token');
      const [recordsRes, membersRes] = await Promise.all([
        axios.get(`${API_URL}/counseling`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/members`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      this.currentRecords = recordsRes.data.records || [];
      this.allMembers = membersRes.data.members || [];
      this.renderCounselingList();
    } catch (error) {
      console.error('Load counseling error:', error);
      showToast('상담 기록을 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 상담 기록 목록 렌더링
  renderCounselingList() {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
      <div class="mb-8 flex items-center justify-between">
                <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">상담 기록</h2>
          <p class="text-gray-600">총 ${this.currentRecords.length}건의 상담 기록이 있습니다.</p>
                </div>
        <button onclick="CounselingModule.showAddModal()" class="btn-pastel-primary px-6 py-3 rounded-lg">
                    <i class="fas fa-plus mr-2"></i>상담 기록 추가
                </button>
            </div>
            
            <!-- 필터 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
            <input 
              type="text" 
              id="search-input" 
              placeholder="교인 이름으로 검색..." 
              class="input-modern w-full"
              onkeyup="CounselingModule.handleSearch()"
            >
                    </div>
          <select id="type-filter" class="input-modern" onchange="CounselingModule.handleFilter()">
            <option value="">전체 유형</option>
            <option value="개인상담">개인상담</option>
            <option value="가정상담">가정상담</option>
            <option value="신앙상담">신앙상담</option>
            <option value="기타">기타</option>
                        </select>
          <input type="month" id="month-filter" class="input-modern" onchange="CounselingModule.handleFilter()">
        </div>
      </div>
      
      <!-- 상담 기록 목록 -->
      <div class="space-y-4">
        ${this.renderRecordCards()}
      </div>
    `;
  },
  
  // 상담 기록 카드 렌더링
  renderRecordCards() {
    if (this.currentRecords.length === 0) {
      return `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <i class="fas fa-comments text-gray-300 text-5xl mb-4"></i>
          <p class="text-gray-500">등록된 상담 기록이 없습니다.</p>
          <button onclick="CounselingModule.showAddModal()" class="mt-4 btn-pastel-primary px-6 py-2 rounded-lg">
            첫 상담 기록 추가
          </button>
                    </div>
      `;
    }
    
    return this.currentRecords.map(record => {
      const typeColors = {
        '개인상담': 'blue',
        '가정상담': 'green',
        '신앙상담': 'purple',
        '기타': 'gray'
      };
      const color = typeColors[record.counseling_type] || 'gray';
      
      return `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h4 class="font-bold text-gray-800">${record.member_name}</h4>
                <span class="px-3 py-1 bg-${color}-100 text-${color}-700 rounded-full text-xs font-medium">
                  ${record.counseling_type}
                </span>
                ${record.is_private ? '<span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"><i class="fas fa-lock"></i> 비공개</span>' : ''}
                    </div>
              <div class="flex items-center space-x-4 text-sm text-gray-600">
                <span><i class="fas fa-calendar mr-1"></i>${new Date(record.counseling_date).toLocaleDateString('ko-KR')}</span>
                <span><i class="fas fa-user mr-1"></i>${record.counselor}</span>
                    </div>
                </div>
            <div class="flex space-x-2">
              <button onclick="CounselingModule.viewRecord(${record.id})" class="text-blue-600 hover:text-blue-800 p-2">
                <i class="fas fa-eye"></i>
              </button>
              <button onclick="CounselingModule.editRecord(${record.id})" class="text-green-600 hover:text-green-800 p-2">
                <i class="fas fa-edit"></i>
                    </button>
              <button onclick="CounselingModule.deleteRecord(${record.id})" class="text-red-600 hover:text-red-800 p-2">
                <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
          <div class="border-t border-gray-100 pt-4">
            <p class="text-sm text-gray-700 line-clamp-3">${record.content}</p>
            ${record.follow_up ? `
              <div class="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p class="text-xs font-medium text-yellow-800 mb-1">후속 조치</p>
                <p class="text-sm text-yellow-700">${record.follow_up}</p>
                </div>
            ` : ''}
            </div>
        </div>
    `;
    }).join('');
  },
  
  // 검색
  handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredRecords = this.currentRecords.filter(r => 
      r.member_name.toLowerCase().includes(searchTerm)
    );
    this.renderFilteredRecords(filteredRecords);
  },
  
  // 필터
  handleFilter() {
    const typeFilter = document.getElementById('type-filter').value;
    const monthFilter = document.getElementById('month-filter').value;
    
    let filtered = [...this.currentRecords];
    
    if (typeFilter) {
      filtered = filtered.filter(r => r.counseling_type === typeFilter);
    }
    
    if (monthFilter) {
      const [year, month] = monthFilter.split('-');
      filtered = filtered.filter(r => {
        const date = new Date(r.counseling_date);
        return date.getFullYear() === parseInt(year) && (date.getMonth() + 1) === parseInt(month);
      });
    }
    
    this.renderFilteredRecords(filtered);
  },
  
  // 필터된 결과 렌더링
  renderFilteredRecords(records) {
    const originalRecords = this.currentRecords;
    this.currentRecords = records;
    const cards = this.renderRecordCards();
    this.currentRecords = originalRecords;
    
    const container = document.querySelector('.space-y-4');
    if (container) {
      container.innerHTML = cards;
    }
  },
  
  // 상담 기록 추가 모달
  showAddModal() {
    showModal('상담 기록 추가', `
            <form id="add-counseling-form" class="space-y-4">
                    <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">교인 선택 *</label>
          <select name="member_id" required class="input-modern w-full">
            <option value="">선택하세요</option>
            ${this.allMembers.map(m => `
              <option value="${m.id}">${m.name} (${m.member_number})</option>
            `).join('')}
                        </select>
                    </div>
        
        <div class="grid grid-cols-2 gap-4">
                    <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">상담 날짜 *</label>
            <input type="date" name="counseling_date" value="${new Date().toISOString().split('T')[0]}" required class="input-modern w-full">
                    </div>
                    <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">상담 유형</label>
            <select name="counseling_type" class="input-modern w-full">
              <option value="개인상담">개인상담</option>
              <option value="가정상담">가정상담</option>
              <option value="신앙상담">신앙상담</option>
              <option value="기타">기타</option>
                        </select>
                    </div>
        </div>
        
                    <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">상담자 *</label>
          <input type="text" name="counselor" value="${currentUser?.name || ''}" required class="input-modern w-full">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">상담 내용 *</label>
          <textarea name="content" rows="5" required class="input-modern w-full" placeholder="상담 내용을 입력하세요"></textarea>
                </div>
                
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">후속 조치</label>
          <textarea name="follow_up" rows="3" class="input-modern w-full" placeholder="후속 조치 사항이 있으면 입력하세요"></textarea>
                    </div>
        
                    <div>
          <label class="flex items-center space-x-2">
            <input type="checkbox" name="is_private" value="1" checked class="rounded border-gray-300">
            <span class="text-sm text-gray-700">비공개 (담당자만 열람 가능)</span>
          </label>
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
    
    document.getElementById('add-counseling-form').addEventListener('submit', (e) => {
        e.preventDefault();
      this.handleAddRecord(new FormData(e.target));
    });
  },
  
  // 상담 기록 추가 처리
  async handleAddRecord(formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      data.is_private = data.is_private ? 1 : 0;
      data.recorded_by = currentUser?.id;
      
      await axios.post(`${API_URL}/counseling`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('상담 기록이 저장되었습니다.', 'success');
      closeModal();
      this.loadCounselingList();
        } catch (error) {
      console.error('Add counseling error:', error);
      showToast(error.response?.data?.error || '상담 기록 저장에 실패했습니다.', 'error');
    }
  },
  
  // 상담 기록 상세보기
  async viewRecord(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/counseling/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const record = response.data;
      
      showModal('상담 기록 상세', `
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
              <p class="text-sm text-gray-500">교인명</p>
              <p class="text-base font-medium text-gray-900">${record.member_name}</p>
                        </div>
                        <div>
              <p class="text-sm text-gray-500">상담 날짜</p>
              <p class="text-base font-medium text-gray-900">${new Date(record.counseling_date).toLocaleDateString('ko-KR')}</p>
                        </div>
                        <div>
              <p class="text-sm text-gray-500">상담 유형</p>
              <p class="text-base font-medium text-gray-900">${record.counseling_type}</p>
                        </div>
                        <div>
              <p class="text-sm text-gray-500">상담자</p>
              <p class="text-base font-medium text-gray-900">${record.counselor}</p>
                        </div>
                    </div>
                    
                    <div>
            <p class="text-sm text-gray-500 mb-2">상담 내용</p>
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p class="text-gray-700 whitespace-pre-wrap">${record.content}</p>
                        </div>
                    </div>
                    
          ${record.follow_up ? `
                        <div>
              <p class="text-sm text-gray-500 mb-2">후속 조치</p>
              <div class="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p class="text-yellow-800 whitespace-pre-wrap">${record.follow_up}</p>
                        </div>
                    </div>
          ` : ''}
          
          <div class="flex justify-end space-x-3 pt-4">
            <button onclick="CounselingModule.editRecord(${record.id}); closeModal();" class="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
              수정
            </button>
            <button onclick="closeModal()" class="btn-pastel-primary px-6 py-2 rounded-lg">
                        닫기
                    </button>
                </div>
            </div>
      `);
    } catch (error) {
      console.error('View counseling error:', error);
      showToast('상담 기록을 불러오는데 실패했습니다.', 'error');
    }
  },

// 상담 기록 수정
  async editRecord(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/counseling/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const record = response.data;
      
      showModal('상담 기록 수정', `
                <form id="edit-counseling-form" class="space-y-4">
                        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">교인</label>
            <input type="text" value="${record.member_name}" class="input-modern w-full" readonly>
                        </div>
          
          <div class="grid grid-cols-2 gap-4">
                        <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">상담 날짜 *</label>
              <input type="date" name="counseling_date" value="${record.counseling_date}" required class="input-modern w-full">
                        </div>
                        <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">상담 유형</label>
              <select name="counseling_type" class="input-modern w-full">
                <option value="개인상담" ${record.counseling_type === '개인상담' ? 'selected' : ''}>개인상담</option>
                <option value="가정상담" ${record.counseling_type === '가정상담' ? 'selected' : ''}>가정상담</option>
                <option value="신앙상담" ${record.counseling_type === '신앙상담' ? 'selected' : ''}>신앙상담</option>
                <option value="기타" ${record.counseling_type === '기타' ? 'selected' : ''}>기타</option>
                            </select>
                        </div>
          </div>
          
                        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">상담자 *</label>
            <input type="text" name="counselor" value="${record.counselor}" required class="input-modern w-full">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">상담 내용 *</label>
            <textarea name="content" rows="5" required class="input-modern w-full">${record.content}</textarea>
                    </div>
                    
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">후속 조치</label>
            <textarea name="follow_up" rows="3" class="input-modern w-full">${record.follow_up || ''}</textarea>
                        </div>
          
                        <div>
            <label class="flex items-center space-x-2">
              <input type="checkbox" name="is_private" value="1" ${record.is_private ? 'checked' : ''} class="rounded border-gray-300">
              <span class="text-sm text-gray-700">비공개</span>
            </label>
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
        
      document.getElementById('edit-counseling-form').addEventListener('submit', (e) => {
            e.preventDefault();
        this.handleEditRecord(id, new FormData(e.target));
      });
    } catch (error) {
      console.error('Edit counseling error:', error);
      showToast('상담 기록을 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 상담 기록 수정 처리
  async handleEditRecord(id, formData) {
    try {
      const token = localStorage.getItem('token');
      const data = Object.fromEntries(formData);
      data.is_private = data.is_private ? 1 : 0;
      
      await axios.put(`${API_URL}/counseling/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('상담 기록이 수정되었습니다.', 'success');
      closeModal();
      this.loadCounselingList();
    } catch (error) {
      console.error('Update counseling error:', error);
      showToast(error.response?.data?.error || '상담 기록 수정에 실패했습니다.', 'error');
    }
  },

// 상담 기록 삭제
  async deleteRecord(id) {
    if (!confirm('이 상담 기록을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/counseling/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
        });
        
      showToast('상담 기록이 삭제되었습니다.', 'success');
      this.loadCounselingList();
    } catch (error) {
      console.error('Delete counseling error:', error);
      showToast('상담 기록 삭제에 실패했습니다.', 'error');
    }
}
};
