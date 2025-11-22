// 출석 관리 모듈

const AttendanceModule = {
  currentDate: new Date().toISOString().split('T')[0],
  currentServiceType: '주일학교 예배',
  members: [],
  serviceTypes: [],
  
  // 출석 관리 페이지 로드
  async loadAttendancePage() {
    try {
      const token = localStorage.getItem('token');
      const [attendanceRes, serviceTypesRes] = await Promise.all([
        axios.get(
          `${API_URL}/attendance/by-date?date=${this.currentDate}&service_type=${this.currentServiceType}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(`${API_URL}/settings/service-types`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      this.members = attendanceRes.data.members || [];
      this.serviceTypes = serviceTypesRes.data.serviceTypes || [];
      
      // 사용자의 부서에 맞는 예배 구분만 필터링 (최고관리자가 아니면)
      if (!currentUser?.is_super_admin && currentUser?.department_id) {
        // 자신의 부서 예배 + 통합예배만 표시
        this.serviceTypes = this.serviceTypes.filter(st => 
          !st.department_id || 
          st.department_id === currentUser.department_id || 
          st.name === '통합예배'
        );
      }
      
      // 기본 예배 구분 설정
      if (this.serviceTypes.length > 0 && !this.currentServiceType) {
        this.currentServiceType = this.serviceTypes[0].name;
      }
      
      this.renderAttendancePage();
    } catch (error) {
      console.error('Load attendance error:', error);
      showToast('출석 정보를 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 출석 페이지 렌더링
  renderAttendancePage() {
    const content = document.getElementById('main-content');
    
    const stats = this.calculateStats();
    
    content.innerHTML = `
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">출석 관리</h2>
        <p class="text-gray-600">예배 출석을 기록하고 관리합니다.</p>
      </div>
      
      <!-- 날짜 및 예배 선택 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">날짜</label>
            <input 
              type="date" 
              id="attendance-date" 
              value="${this.currentDate}" 
              class="input-modern w-full"
              onchange="AttendanceModule.changeDate(this.value)"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">예배 구분</label>
            <select 
              id="service-type" 
              class="input-modern w-full"
              onchange="AttendanceModule.changeServiceType(this.value)"
            >
              ${this.serviceTypes.map(st => `
                <option value="${st.name}" ${this.currentServiceType === st.name ? 'selected' : ''}>
                  ${st.name}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="flex items-end">
            <button onclick="AttendanceModule.saveBulkAttendance()" class="btn-pastel-primary w-full py-3 rounded-lg">
              <i class="fas fa-save mr-2"></i>일괄 저장
            </button>
          </div>
        </div>
      </div>
      
      <!-- 출석 통계 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">전체</p>
              <p class="text-2xl font-bold text-gray-800">${stats.total}명</p>
            </div>
            <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-users text-gray-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">출석</p>
              <p class="text-2xl font-bold text-green-600">${stats.present}명</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">결석</p>
              <p class="text-2xl font-bold text-red-600">${stats.absent}명</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-times-circle text-red-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">출석률</p>
              <p class="text-2xl font-bold text-purple-600">${stats.rate}%</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-chart-pie text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 빠른 액션 -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <i class="fas fa-lightbulb text-blue-600 text-xl"></i>
          <span class="text-sm text-blue-800">빠른 체크:</span>
        </div>
        <div class="flex space-x-2">
          <button onclick="AttendanceModule.markAllAsPresent()" class="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-sm">
            <i class="fas fa-check-double mr-1"></i>전체 출석
          </button>
          <button onclick="AttendanceModule.clearAll()" class="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-sm">
            <i class="fas fa-eraser mr-1"></i>전체 초기화
          </button>
        </div>
      </div>
      
      <!-- 출석 체크 테이블 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">교인번호</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가족</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">출석 상태</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비고</th>
              </tr>
            </thead>
            <tbody id="attendance-table-body" class="bg-white divide-y divide-gray-200">
              ${this.renderAttendanceRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  
  // 통계 계산
  calculateStats() {
    const total = this.members.length;
    const present = this.members.filter(m => m.status === '출석').length;
    const absent = this.members.filter(m => m.status === '결석').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { total, present, absent, rate };
  },
  
  // 출석 행 렌더링
  renderAttendanceRows() {
    if (this.members.length === 0) {
      return `
        <tr>
          <td colspan="6" class="px-6 py-8 text-center text-gray-500">
            등록된 교인이 없습니다.
          </td>
        </tr>
      `;
    }
    
    return this.members.map((member, index) => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${member.member_number}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${member.name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${member.family_name || '-'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${member.phone || '-'}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex justify-center space-x-2">
            <button 
              onclick="AttendanceModule.setStatus(${index}, '출석')"
              class="px-3 py-1 rounded-lg text-sm font-medium transition-colors ${member.status === '출석' ? 'bg-green-100 text-green-700 border-2 border-green-600' : 'bg-gray-100 text-gray-600 hover:bg-green-50'}"
            >
              <i class="fas fa-check mr-1"></i>출석
            </button>
            <button 
              onclick="AttendanceModule.setStatus(${index}, '결석')"
              class="px-3 py-1 rounded-lg text-sm font-medium transition-colors ${member.status === '결석' ? 'bg-red-100 text-red-700 border-2 border-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50'}"
            >
              <i class="fas fa-times mr-1"></i>결석
            </button>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <input 
            type="text" 
            id="note-${member.member_id}"
            value="${member.note || ''}"
            placeholder="비고 입력"
            class="input-modern w-full text-sm"
            onchange="AttendanceModule.updateNote(${index}, this.value)"
          >
        </td>
      </tr>
    `).join('');
  },
  
  // 날짜 변경
  async changeDate(date) {
    this.currentDate = date;
    await this.loadAttendancePage();
  },
  
  // 예배 구분 변경
  async changeServiceType(serviceType) {
    this.currentServiceType = serviceType;
    await this.loadAttendancePage();
  },
  
  // 상태 설정
  setStatus(index, status) {
    this.members[index].status = status;
    this.renderAttendancePage();
  },
  
  // 비고 업데이트
  updateNote(index, note) {
    this.members[index].note = note;
  },
  
  // 전체 출석 처리
  markAllAsPresent() {
    this.members.forEach(member => {
      member.status = '출석';
    });
    this.renderAttendancePage();
  },
  
  // 전체 초기화
  clearAll() {
    if (!confirm('모든 출석 상태를 초기화하시겠습니까?')) {
      return;
    }
    
    this.members.forEach(member => {
      member.status = null;
      member.note = null;
    });
    this.renderAttendancePage();
  },
  
  // 일괄 저장
  async saveBulkAttendance() {
    try {
      const token = localStorage.getItem('token');
      const currentUserId = currentUser?.id;
      
      // 상태가 설정된 교인만 필터링
      const records = this.members
        .filter(m => m.status)
        .map(m => ({
          member_id: m.member_id,
          status: m.status,
          note: document.getElementById(`note-${m.member_id}`)?.value || null
        }));
      
      if (records.length === 0) {
        showToast('출석 상태가 설정된 교인이 없습니다.', 'warning');
        return;
      }
      
      await axios.post(
        `${API_URL}/attendance/bulk`,
        {
          attendance_date: this.currentDate,
          service_type: this.currentServiceType,
          records: records,
          recorded_by: currentUserId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showToast(`${records.length}명의 출석이 저장되었습니다.`, 'success');
      await this.loadAttendancePage();
    } catch (error) {
      console.error('Save bulk attendance error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      let errorMessage = '출석 저장에 실패했습니다.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        // 서버에서 전달된 상세 정보가 있으면 표시
        if (error.response.data.details) {
          console.error('Server error details:', error.response.data.details);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    }
  },
  
  // 출석 통계 보기
  async viewStats() {
    try {
      const token = localStorage.getItem('token');
      const dateFrom = prompt('시작 날짜 (YYYY-MM-DD):', this.currentDate);
      if (!dateFrom) return;
      
      const dateTo = prompt('종료 날짜 (YYYY-MM-DD):', this.currentDate);
      if (!dateTo) return;
      
      const response = await axios.get(
        `${API_URL}/attendance/stats?date_from=${dateFrom}&date_to=${dateTo}&service_type=${this.currentServiceType}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const stats = response.data.stats;
      this.showStatsModal(stats, dateFrom, dateTo);
    } catch (error) {
      console.error('Get stats error:', error);
      showToast('통계를 불러오는데 실패했습니다.', 'error');
    }
  },
  
  // 통계 모달 표시
  showStatsModal(stats, dateFrom, dateTo) {
    const grouped = {};
    stats.forEach(s => {
      if (!grouped[s.attendance_date]) {
        grouped[s.attendance_date] = { date: s.attendance_date, present: 0, absent: 0, total: 0 };
      }
      if (s.status === '출석') grouped[s.attendance_date].present = s.count;
      if (s.status === '결석') grouped[s.attendance_date].absent = s.count;
      grouped[s.attendance_date].total += s.count;
    });
    
    const rows = Object.values(grouped).map(g => {
      const rate = g.total > 0 ? Math.round((g.present / g.total) * 100) : 0;
      return `
        <tr>
          <td class="px-4 py-2 border">${g.date}</td>
          <td class="px-4 py-2 border text-center">${g.present}</td>
          <td class="px-4 py-2 border text-center">${g.absent}</td>
          <td class="px-4 py-2 border text-center">${g.total}</td>
          <td class="px-4 py-2 border text-center font-bold">${rate}%</td>
        </tr>
      `;
    }).join('');
    
    showModal('출석 통계', `
      <div class="mb-4">
        <p class="text-sm text-gray-600">기간: ${dateFrom} ~ ${dateTo}</p>
        <p class="text-sm text-gray-600">예배: ${this.currentServiceType}</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border border-gray-300">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2 border">날짜</th>
              <th class="px-4 py-2 border">출석</th>
              <th class="px-4 py-2 border">결석</th>
              <th class="px-4 py-2 border">합계</th>
              <th class="px-4 py-2 border">출석률</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
      <div class="flex justify-end mt-4">
        <button onclick="closeModal()" class="btn-pastel-primary px-6 py-2 rounded-lg">
          닫기
        </button>
      </div>
    `);
  }
};

