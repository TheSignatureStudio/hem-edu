// 정보 열람 기록 관리 모듈 (최고관리자 전용)

const InformationAccessLogsModule = {
  logs: [],
  stats: [],
  
  // 정보 열람 기록 페이지 로드
  async loadAccessLogsPage() {
    try {
      const token = localStorage.getItem('token');
      
      // 최고관리자 확인
      if (!currentUser?.is_super_admin) {
        showToast('최고관리자만 접근할 수 있습니다.', 'error');
        return;
      }
      
      await Promise.all([
        this.loadLogs(),
        this.loadStats()
      ]);
      
      this.renderAccessLogsPage();
    } catch (error) {
      console.error('Load access logs error:', error);
      showToast('정보 열람 기록을 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 기록 목록 로드
  async loadLogs() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/information-access/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      this.logs = response.data.logs || [];
    } catch (error) {
      console.error('Load logs error:', error);
      throw error;
    }
  },
  
  // 통계 로드
  async loadStats() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/information-access/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      this.stats = response.data.stats || [];
    } catch (error) {
      console.error('Load stats error:', error);
      // 통계는 실패해도 계속 진행
    }
  },
  
  // 정보 열람 기록 페이지 렌더링
  renderAccessLogsPage() {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">정보 열람 기록</h2>
        <p class="text-gray-600">누가 언제 누구의 정보를 열람했는지 확인할 수 있습니다.</p>
      </div>
      
      <!-- 통계 카드 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">총 열람 횟수</p>
              <p class="text-2xl font-bold text-gray-800">${this.logs.length}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-eye text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">열람한 사용자</p>
              <p class="text-2xl font-bold text-gray-800">${new Set(this.logs.map(l => l.accessed_by)).size}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-users text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">열람된 학생</p>
              <p class="text-2xl font-bold text-gray-800">${new Set(this.logs.map(l => l.accessed_member_id)).size}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-user text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">오늘 열람</p>
              <p class="text-2xl font-bold text-gray-800">${this.getTodayAccessCount()}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-calendar-day text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 기록 목록 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">열람 기록 목록</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜/시간</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">열람한 사용자</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학생 정보</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">열람 유형</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP 주소</th>
              </tr>
            </thead>
            <tbody id="access-logs-table-body" class="bg-white divide-y divide-gray-200">
              ${this.renderLogsRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  
  // 기록 행 렌더링
  renderLogsRows() {
    if (this.logs.length === 0) {
      return `
        <tr>
          <td colspan="5" class="px-6 py-8 text-center text-gray-500">
            열람 기록이 없습니다.
          </td>
        </tr>
      `;
    }
    
    return this.logs.map(log => {
      const date = new Date(log.created_at);
      const dateStr = date.toLocaleDateString('ko-KR');
      const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      
      return `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            <div>${dateStr}</div>
            <div class="text-xs text-gray-500">${timeStr}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${log.accessed_by_name || '-'}</div>
            <div class="text-xs text-gray-500">${log.accessed_by_username || '-'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${log.member_name || '-'}</div>
            <div class="text-xs text-gray-500">${log.member_number || '-'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              ${log.access_type === 'view' ? '조회' : log.access_type === 'edit' ? '수정' : '내보내기'}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${log.ip_address || '-'}</td>
        </tr>
      `;
    }).join('');
  },
  
  // 오늘 열람 횟수
  getTodayAccessCount() {
    const today = new Date().toISOString().split('T')[0];
    return this.logs.filter(log => {
      const logDate = new Date(log.created_at).toISOString().split('T')[0];
      return logDate === today;
    }).length;
  }
};

