// 반 상세 페이지

let currentClassId = null;
let currentClassInfo = null;

// 학생 상태 색상 반환
function getStatusColor(status) {
    const colors = {
        'enrolled': 'bg-green-100 text-green-800',
        'graduated': 'bg-blue-100 text-blue-800',
        'transferred': 'bg-yellow-100 text-yellow-800',
        'dropped': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

// 학생 상태 텍스트 반환
function getStatusText(status) {
    const texts = {
        'enrolled': '재학',
        'graduated': '졸업',
        'transferred': '전학',
        'dropped': '자퇴'
    };
    return texts[status] || '알 수 없음';
}

// 반 상세 페이지 표시
async function showClassDetail(classId) {
    currentClassId = classId;
    
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <div class="mb-6">
            <div class="flex items-center mb-6">
                <button onclick="navigateToPage('classes')" class="mr-4 text-gray-600 hover:text-gray-800">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <div>
                    <h2 class="text-3xl font-bold text-gray-800" id="class-title">
                        <i class="fas fa-spinner fa-spin mr-2"></i>로딩 중...
                    </h2>
                    <p class="text-gray-600 mt-2" id="class-subtitle"></p>
                </div>
            </div>
            
            <!-- 반 정보 카드 -->
            <div class="bg-white rounded-lg shadow-md p-4 mb-4" id="class-info-card">
                <div class="text-center py-4">
                    <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                </div>
            </div>
            
            <!-- 탭 메뉴 -->
            <div class="bg-white rounded-lg shadow-md mb-6">
                <div class="border-b border-gray-200">
                    <nav class="flex -mb-px overflow-x-auto">
                        <button onclick="showClassTab('students')" data-tab="students" 
                                class="class-tab px-6 py-4 text-sm font-medium border-b-2 border-blue-500 text-blue-600 whitespace-nowrap">
                            <i class="fas fa-users mr-2"></i>학생 목록
                        </button>
                        <button onclick="showClassTab('attendance')" data-tab="attendance"
                                class="class-tab px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap">
                            <i class="fas fa-clipboard-check mr-2"></i>출석 관리
                        </button>
                        <button onclick="showClassTab('grades')" data-tab="grades"
                                class="class-tab px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap">
                            <i class="fas fa-chart-line mr-2"></i>성적 관리
                        </button>
                        <button onclick="showClassTab('awards')" data-tab="awards"
                                class="class-tab px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap">
                            <i class="fas fa-trophy mr-2"></i>수상
                        </button>
                        <button onclick="showClassTab('reading')" data-tab="reading"
                                class="class-tab px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap">
                            <i class="fas fa-book mr-2"></i>독서활동
                        </button>
                        <button onclick="showClassTab('volunteer')" data-tab="volunteer"
                                class="class-tab px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap">
                            <i class="fas fa-hands-helping mr-2"></i>봉사활동
                        </button>
                        <button onclick="showClassTab('counseling')" data-tab="counseling"
                                class="class-tab px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap">
                            <i class="fas fa-comments mr-2"></i>상담
                        </button>
                        <button onclick="showClassTab('schedule')" data-tab="schedule"
                                class="class-tab px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap">
                            <i class="fas fa-calendar-alt mr-2"></i>시간표
                        </button>
                        <button onclick="showClassTab('statistics')" data-tab="statistics"
                                class="class-tab px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap">
                            <i class="fas fa-chart-bar mr-2"></i>통계
                        </button>
                    </nav>
                </div>
            </div>
            
            <!-- 탭 컨텐츠 -->
            <div id="class-tab-content" class="bg-white rounded-lg shadow-md p-6">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                    <p class="text-gray-600 mt-2">로딩 중...</p>
                </div>
            </div>
        </div>
    `;
    
    // 반 정보 로드
    await loadClassInfo();
    
    // 기본 탭 표시
    showClassTab('students');
}

// 반 정보 로드
async function loadClassInfo() {
    try {
        const response = await axios.get(`/api/classes/${currentClassId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        currentClassInfo = response.data.class;
        
        // 제목 업데이트
        document.getElementById('class-title').innerHTML = `
            <i class="fas fa-book mr-2"></i>${currentClassInfo.name}
        `;
        document.getElementById('class-subtitle').textContent = 
            `${currentClassInfo.semester_name} | ${currentClassInfo.grade}학년 | 학생 ${currentClassInfo.student_count}명`;
        
        // 반 정보 카드 업데이트 (작은 크기)
        document.getElementById('class-info-card').innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                    <p class="text-xs text-gray-600 mb-1">학기</p>
                    <p class="text-sm font-semibold text-gray-800">${currentClassInfo.semester_name}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-600 mb-1">학년</p>
                    <p class="text-sm font-semibold text-gray-800">${currentClassInfo.grade}학년</p>
                </div>
                <div>
                    <p class="text-xs text-gray-600 mb-1">학생 수</p>
                    <p class="text-sm font-semibold text-gray-800">${currentClassInfo.student_count}명</p>
                </div>
                <div>
                    <p class="text-xs text-gray-600 mb-1">담임</p>
                    <p class="text-sm font-semibold text-gray-800">
                        ${currentClassInfo.homeroom_teacher ? currentClassInfo.homeroom_teacher.teacher_name : '미배정'}
                    </p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('반 정보 로드 실패:', error);
        alert('반 정보를 불러오는데 실패했습니다.');
    }
}

// 탭 전환
function showClassTab(tabName) {
    // 탭 버튼 스타일 업데이트
    document.querySelectorAll('.class-tab').forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.className = 'class-tab px-6 py-4 text-sm font-medium border-b-2 border-blue-500 text-blue-600';
        } else {
            tab.className = 'class-tab px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
        }
    });
    
    // 탭 컨텐츠 로드
    switch(tabName) {
        case 'students':
            loadClassStudents();
            break;
        case 'attendance':
            loadClassAttendance();
            break;
        case 'grades':
            loadClassGrades();
            break;
        case 'awards':
            loadClassAwards();
            break;
        case 'reading':
            loadClassReading();
            break;
        case 'volunteer':
            loadClassVolunteer();
            break;
        case 'counseling':
            loadClassCounseling();
            break;
        case 'schedule':
            loadClassSchedule();
            break;
        case 'statistics':
            loadClassStatistics();
            break;
    }
}

// 반 학생 목록 로드
async function loadClassStudents() {
    const container = document.getElementById('class-tab-content');
    container.innerHTML = `
        <div class="mb-4 flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-800">학생 목록</h4>
            <button onclick="showAddStudentToClassForm()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <i class="fas fa-plus mr-2"></i>학생 추가
            </button>
        </div>
        <div id="students-list">
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            </div>
        </div>
    `;
    
    try {
        const response = await axios.get(`/api/classes/${currentClassId}/students`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const students = response.data.students;
        const listContainer = document.getElementById('students-list');
        
        if (!students || students.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-users text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">이 반에 배정된 학생이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">전화번호</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${students.map(student => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${student.student_number}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${student.student_name}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    ${student.email || '-'}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    ${student.phone || '-'}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 text-xs rounded-full ${getStatusColor(student.status)}">
                                        ${getStatusText(student.status)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <button onclick="viewStudentDetail(${student.student_id})" class="text-blue-600 hover:text-blue-800 mr-3">
                                        <i class="fas fa-eye"></i> 보기
                                    </button>
                                    <button onclick="removeStudentFromClass(${student.student_id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-times"></i> 제외
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('학생 목록 로드 실패:', error);
        document.getElementById('students-list').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>학생 목록을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 반 출석 현황 로드
async function loadClassAttendance() {
    const container = document.getElementById('class-tab-content');
    
    const today = new Date().toISOString().split('T')[0];
    
    container.innerHTML = `
        <div class="mb-4 flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-800">출석 관리</h4>
            <div class="flex space-x-2">
                <input type="date" id="attendance-date" value="${today}" 
                       class="px-3 py-2 border border-gray-300 rounded-lg">
                <button onclick="loadClassAttendanceByDate()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <i class="fas fa-search mr-2"></i>조회
                </button>
                <button onclick="takeClassAttendance()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    <i class="fas fa-check mr-2"></i>출석 체크
                </button>
            </div>
        </div>
        <div id="attendance-list">
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            </div>
        </div>
    `;
    
    loadClassAttendanceByDate();
}

// 날짜별 반 출석 조회
async function loadClassAttendanceByDate() {
    const date = document.getElementById('attendance-date').value;
    const listContainer = document.getElementById('attendance-list');
    
    try {
        const response = await axios.get(`/api/classes/${currentClassId}/attendance?date=${date}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const attendance = response.data.attendance;
        
        if (!attendance || attendance.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-clipboard text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">해당 날짜의 출석 기록이 없습니다.</p>
                    <button onclick="takeClassAttendance()" class="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        출석 체크하기
                    </button>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">출석 상태</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">비고</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${attendance.map(record => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${record.student_number}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${record.student_name}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 text-xs rounded-full ${getAttendanceStatusColor(record.status)}">
                                        ${getAttendanceStatusText(record.status)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-600">
                                    ${record.notes || '-'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('출석 조회 실패:', error);
        listContainer.innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>출석 기록을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 출석 상태 색상
function getAttendanceStatusColor(status) {
    const colors = {
        'present': 'bg-green-100 text-green-800',
        'absent': 'bg-red-100 text-red-800',
        'late': 'bg-yellow-100 text-yellow-800',
        'excused': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

// 출석 상태 텍스트
function getAttendanceStatusText(status) {
    const texts = {
        'present': '출석',
        'absent': '결석',
        'late': '지각',
        'excused': '인정결석'
    };
    return texts[status] || status;
}

// 반 출석 체크 - 입력 UI 로드
async function takeClassAttendance() {
    // 날짜 요소 확인
    const dateElement = document.getElementById('attendance-date');
    if (!dateElement) {
        alert('출석 페이지가 아직 로드되지 않았습니다.');
        return;
    }
    
    const date = dateElement.value;
    const container = document.getElementById('attendance-list');
    
    container.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            <p class="text-gray-600 mt-2">학생 목록 로딩 중...</p>
        </div>
    `;
    
    try {
        // 반의 학생 목록 가져오기
        const studentsResponse = await axios.get(`/api/classes/${currentClassId}/students`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const students = studentsResponse.data.students;
        
        if (!students || students.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-user-slash text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">이 반에 배정된 학생이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        // 해당 날짜의 출석 기록 가져오기
        const attendanceResponse = await axios.get(`/api/attendance/by-date?date=${date}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const attendanceRecords = attendanceResponse.data.attendance || [];
        
        // 학생 목록과 출석 기록 매칭
        const studentsWithAttendance = students.map(student => {
            const record = attendanceRecords.find(a => a.student_id === student.student_id);
            return {
                student_id: student.student_id,
                student_number: student.student_number,
                student_name: student.student_name,
                status: record ? record.status : 'not_recorded',
                notes: record ? record.notes : ''
            };
        });
        
        // 통계 계산
        const stats = {
            total: studentsWithAttendance.length,
            present: studentsWithAttendance.filter(s => s.status === 'present').length,
            absent: studentsWithAttendance.filter(s => s.status === 'absent').length,
            late: studentsWithAttendance.filter(s => s.status === 'late').length,
            excused: studentsWithAttendance.filter(s => s.status === 'excused').length,
            not_recorded: studentsWithAttendance.filter(s => s.status === 'not_recorded').length
        };
        
        // 전역 변수에 저장
        window.currentClassDetailAttendanceData = studentsWithAttendance;
        window.currentClassDetailAttendanceDate = date;
        
        container.innerHTML = `
            <!-- 통계 카드 -->
            <div class="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                <div class="bg-gray-50 p-3 rounded-lg text-center">
                    <p class="text-xs text-gray-600 mb-1">전체</p>
                    <p class="text-xl font-bold text-gray-800">${stats.total}</p>
                </div>
                <div class="bg-green-50 p-3 rounded-lg text-center">
                    <p class="text-xs text-green-600 mb-1">출석</p>
                    <p class="text-xl font-bold text-green-800">${stats.present}</p>
                </div>
                <div class="bg-red-50 p-3 rounded-lg text-center">
                    <p class="text-xs text-red-600 mb-1">결석</p>
                    <p class="text-xl font-bold text-red-800">${stats.absent}</p>
                </div>
                <div class="bg-yellow-50 p-3 rounded-lg text-center">
                    <p class="text-xs text-yellow-600 mb-1">지각</p>
                    <p class="text-xl font-bold text-yellow-800">${stats.late}</p>
                </div>
                <div class="bg-blue-50 p-3 rounded-lg text-center">
                    <p class="text-xs text-blue-600 mb-1">인정결석</p>
                    <p class="text-xl font-bold text-blue-800">${stats.excused}</p>
                </div>
                <div class="bg-gray-100 p-3 rounded-lg text-center">
                    <p class="text-xs text-gray-600 mb-1">미입력</p>
                    <p class="text-xl font-bold text-gray-800">${stats.not_recorded}</p>
                </div>
            </div>
            
            <!-- 일괄 출석 및 저장 버튼 -->
            <div class="mb-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div class="flex items-center gap-3">
                    <span class="text-sm font-medium text-gray-700">일괄 출석 처리:</span>
                    <select id="bulk-attendance-status" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">상태 선택</option>
                        <option value="present">출석</option>
                        <option value="absent">결석</option>
                        <option value="late">지각</option>
                        <option value="excused">인정결석</option>
                        <option value="not_recorded">미입력</option>
                    </select>
                    <button onclick="applyBulkAttendanceToSelected()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm">
                        <i class="fas fa-check-double mr-2"></i>선택 학생에 적용
                    </button>
                    <button onclick="applyBulkAttendanceToAll()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium text-sm">
                        <i class="fas fa-users mr-2"></i>전체 학생에 적용
                    </button>
                </div>
                <button onclick="saveClassDetailAttendance()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm">
                    <i class="fas fa-save mr-2"></i>전체 저장
                </button>
            </div>
            
            <!-- 출석 입력 테이블 -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                                <input type="checkbox" 
                                       id="cd-select-all-attendance"
                                       onchange="toggleAllAttendanceCheckboxes(this.checked)"
                                       class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                            </th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                            <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">출석상태</th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">비고</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200" id="class-detail-attendance-tbody">
                        ${studentsWithAttendance.map(student => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-3 py-2 text-center">
                                    <input type="checkbox" 
                                           class="cd-attendance-checkbox"
                                           data-student-id="${student.student_id}"
                                           class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${student.student_number || '-'}
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    ${student.student_name}
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap text-center">
                                    <select id="cd-status-${student.student_id}" 
                                            class="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onchange="updateClassDetailAttendanceStatus(${student.student_id}, this.value)">
                                        <option value="not_recorded" ${student.status === 'not_recorded' ? 'selected' : ''}>미입력</option>
                                        <option value="present" ${student.status === 'present' ? 'selected' : ''}>출석</option>
                                        <option value="absent" ${student.status === 'absent' ? 'selected' : ''}>결석</option>
                                        <option value="late" ${student.status === 'late' ? 'selected' : ''}>지각</option>
                                        <option value="excused" ${student.status === 'excused' ? 'selected' : ''}>인정결석</option>
                                    </select>
                                </td>
                                <td class="px-3 py-2">
                                    <input type="text" 
                                           id="cd-notes-${student.student_id}"
                                           value="${student.notes || ''}"
                                           placeholder="비고..."
                                           class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                           onchange="updateClassDetailAttendanceNotes(${student.student_id}, this.value)">
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('출석 입력 로드 실패:', error);
        container.innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>출석 입력을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 반 상세 출석 상태 업데이트
function updateClassDetailAttendanceStatus(studentId, status) {
    if (!window.currentClassDetailAttendanceData) return;
    
    const student = window.currentClassDetailAttendanceData.find(s => s.student_id === studentId);
    if (student) {
        student.status = status;
        refreshClassDetailAttendanceStats();
    }
}

// 반 상세 출석 비고 업데이트
function updateClassDetailAttendanceNotes(studentId, notes) {
    if (!window.currentClassDetailAttendanceData) return;
    
    const student = window.currentClassDetailAttendanceData.find(s => s.student_id === studentId);
    if (student) {
        student.notes = notes;
    }
}

// 반 상세 출석 통계 실시간 업데이트
function refreshClassDetailAttendanceStats() {
    if (!window.currentClassDetailAttendanceData) return;
    
    const attendance = window.currentClassDetailAttendanceData;
    const stats = {
        total: attendance.length,
        present: attendance.filter(s => s.status === 'present').length,
        absent: attendance.filter(s => s.status === 'absent').length,
        late: attendance.filter(s => s.status === 'late').length,
        excused: attendance.filter(s => s.status === 'excused').length,
        not_recorded: attendance.filter(s => s.status === 'not_recorded').length
    };
    
    const container = document.querySelector('#class-attendance-data .grid.grid-cols-2');
    if (container) {
        container.innerHTML = `
            <div class="bg-gray-50 p-3 rounded-lg text-center">
                <p class="text-xs text-gray-600 mb-1">전체</p>
                <p class="text-xl font-bold text-gray-800">${stats.total}</p>
            </div>
            <div class="bg-green-50 p-3 rounded-lg text-center">
                <p class="text-xs text-green-600 mb-1">출석</p>
                <p class="text-xl font-bold text-green-800">${stats.present}</p>
            </div>
            <div class="bg-red-50 p-3 rounded-lg text-center">
                <p class="text-xs text-red-600 mb-1">결석</p>
                <p class="text-xl font-bold text-red-800">${stats.absent}</p>
            </div>
            <div class="bg-yellow-50 p-3 rounded-lg text-center">
                <p class="text-xs text-yellow-600 mb-1">지각</p>
                <p class="text-xl font-bold text-yellow-800">${stats.late}</p>
            </div>
            <div class="bg-blue-50 p-3 rounded-lg text-center">
                <p class="text-xs text-blue-600 mb-1">인정결석</p>
                <p class="text-xl font-bold text-blue-800">${stats.excused}</p>
            </div>
            <div class="bg-gray-100 p-3 rounded-lg text-center">
                <p class="text-xs text-gray-600 mb-1">미입력</p>
                <p class="text-xl font-bold text-gray-800">${stats.not_recorded}</p>
            </div>
        `;
    }
}

// 전체 선택/해제
function toggleAllAttendanceCheckboxes(checked) {
    const checkboxes = document.querySelectorAll('.cd-attendance-checkbox');
    checkboxes.forEach(cb => cb.checked = checked);
}

// 선택된 학생에게 일괄 출석 상태 적용
function applyBulkAttendanceToSelected() {
    const bulkStatus = document.getElementById('bulk-attendance-status').value;
    if (!bulkStatus) {
        alert('적용할 출석 상태를 선택해주세요.');
        return;
    }
    
    const checkboxes = document.querySelectorAll('.cd-attendance-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('출석 상태를 적용할 학생을 선택해주세요.');
        return;
    }
    
    const statusText = {
        'present': '출석',
        'absent': '결석',
        'late': '지각',
        'excused': '인정결석',
        'not_recorded': '미입력'
    };
    
    if (!confirm(`선택한 ${checkboxes.length}명의 학생을 "${statusText[bulkStatus]}"로 변경하시겠습니까?`)) {
        return;
    }
    
    checkboxes.forEach(checkbox => {
        const studentId = parseInt(checkbox.getAttribute('data-student-id'));
        const selectElement = document.getElementById(`cd-status-${studentId}`);
        if (selectElement) {
            selectElement.value = bulkStatus;
            updateClassDetailAttendanceStatus(studentId, bulkStatus);
        }
    });
    
    alert(`${checkboxes.length}명의 출석 상태를 "${statusText[bulkStatus]}"로 변경했습니다.`);
    
    // 체크박스 초기화
    document.getElementById('cd-select-all-attendance').checked = false;
    checkboxes.forEach(cb => cb.checked = false);
}

// 전체 학생에게 일괄 출석 상태 적용
function applyBulkAttendanceToAll() {
    const bulkStatus = document.getElementById('bulk-attendance-status').value;
    if (!bulkStatus) {
        alert('적용할 출석 상태를 선택해주세요.');
        return;
    }
    
    if (!window.currentClassDetailAttendanceData) {
        alert('출석 데이터가 없습니다.');
        return;
    }
    
    const statusText = {
        'present': '출석',
        'absent': '결석',
        'late': '지각',
        'excused': '인정결석',
        'not_recorded': '미입력'
    };
    
    const studentCount = window.currentClassDetailAttendanceData.length;
    
    if (!confirm(`전체 ${studentCount}명의 학생을 "${statusText[bulkStatus]}"로 변경하시겠습니까?`)) {
        return;
    }
    
    window.currentClassDetailAttendanceData.forEach(student => {
        const selectElement = document.getElementById(`cd-status-${student.student_id}`);
        if (selectElement) {
            selectElement.value = bulkStatus;
            updateClassDetailAttendanceStatus(student.student_id, bulkStatus);
        }
    });
    
    alert(`전체 ${studentCount}명의 출석 상태를 "${statusText[bulkStatus]}"로 변경했습니다.`);
}

// 반 상세 출석 저장
async function saveClassDetailAttendance() {
    if (!window.currentClassDetailAttendanceData || !window.currentClassDetailAttendanceDate) {
        alert('출석 데이터가 없습니다.');
        return;
    }
    
    const recordsToSave = window.currentClassDetailAttendanceData
        .filter(student => student.status !== 'not_recorded')
        .map(student => ({
            student_id: student.student_id,
            status: student.status,
            notes: student.notes || ''
        }));
    
    if (recordsToSave.length === 0) {
        alert('저장할 출석 데이터가 없습니다.\n(미입력 상태는 저장되지 않습니다)');
        return;
    }
    
    if (!confirm(`${recordsToSave.length}명의 출석을 저장하시겠습니까?`)) {
        return;
    }
    
    try {
        const response = await axios.post('/api/attendance/bulk-simple', {
            attendance_date: window.currentClassDetailAttendanceDate,
            records: recordsToSave
        }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.data.success) {
            alert(`출석이 저장되었습니다!\n성공: ${response.data.successCount}명\n실패: ${response.data.errorCount}명`);
            await takeClassAttendance();
        } else {
            alert('출석 저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('출석 저장 실패:', error);
        alert('출석 저장 중 오류가 발생했습니다: ' + (error.response?.data?.error || error.message));
    }
}

// 반 성적 현황 로드
async function loadClassGrades() {
    const container = document.getElementById('class-tab-content');
    container.innerHTML = `
        <div class="mb-4 flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-800">성적 현황</h4>
            <button onclick="showAddClassGradeForm()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <i class="fas fa-plus mr-2"></i>성적 추가
            </button>
        </div>
        <div id="grades-list">
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            </div>
        </div>
    `;
    
    try {
        const response = await axios.get(`/api/classes/${currentClassId}/grades`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const grades = response.data.grades;
        const listContainer = document.getElementById('grades-list');
        
        if (!grades || grades.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-chart-line text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">등록된 성적이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">과목</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평가 유형</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">점수</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${grades.map(grade => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${grade.student_number}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${grade.student_name}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    ${grade.subject_name}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    ${grade.assessment_type}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                    ${grade.score}점
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <button onclick="editClassGrade(${grade.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteClassGrade(${grade.id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('성적 조회 실패:', error);
        document.getElementById('grades-list').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>성적을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 반 통계 로드
async function loadClassStatistics() {
    const container = document.getElementById('class-tab-content');
    container.innerHTML = `
        <div class="mb-4">
            <h3 class="text-xl font-bold text-gray-800">반 통계</h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-blue-50 p-6 rounded-lg">
                <p class="text-sm text-blue-600 font-medium mb-2">전체 학생 수</p>
                <p class="text-3xl font-bold text-blue-900">${currentClassInfo.student_count}명</p>
            </div>
            <div class="bg-green-50 p-6 rounded-lg">
                <p class="text-sm text-green-600 font-medium mb-2">평균 출석률</p>
                <p class="text-3xl font-bold text-green-900">--%</p>
                <p class="text-xs text-gray-600 mt-1">계산 중...</p>
            </div>
            <div class="bg-purple-50 p-6 rounded-lg">
                <p class="text-sm text-purple-600 font-medium mb-2">평균 성적</p>
                <p class="text-3xl font-bold text-purple-900">--점</p>
                <p class="text-xs text-gray-600 mt-1">계산 중...</p>
            </div>
        </div>
    `;
}

// 반 수상 내역 로드
async function loadClassAwards() {
    const container = document.getElementById('class-tab-content');
    container.innerHTML = `
        <div class="mb-4 flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-800">수상 내역</h4>
            <button onclick="showAddClassAwardForm()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <i class="fas fa-plus mr-2"></i>수상 추가
            </button>
        </div>
        <div id="awards-list">
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            </div>
        </div>
    `;
    
    try {
        const [studentsRes, awardsRes] = await Promise.all([
            axios.get(`/api/classes/${currentClassId}/students`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            axios.get('/api/awards?limit=1000', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
        ]);
        
        const students = studentsRes.data.students;
        window.currentClassStudents = students; // 전역 변수에 저장
        
        const allAwards = awardsRes.data.awards || [];
        const studentIds = students.map(s => s.student_id);
        const classAwards = allAwards.filter(a => studentIds.includes(a.student_id));
        
        const listContainer = document.getElementById('awards-list');
        
        if (!classAwards || classAwards.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-trophy text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">등록된 수상 내역이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수상명</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">분야</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">등급</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수상일</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${classAwards.map(award => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${award.student_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${award.award_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${award.award_category || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${award.award_level || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${award.award_date}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <button onclick="editClassAward(${award.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteClassAward(${award.id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('수상 내역 로드 실패:', error);
        document.getElementById('awards-list').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>수상 내역을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 반 독서활동 로드
async function loadClassReading() {
    const container = document.getElementById('class-tab-content');
    container.innerHTML = `
        <div class="mb-4 flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-800">독서 활동</h4>
            <button onclick="showAddClassReadingForm()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <i class="fas fa-plus mr-2"></i>독서 추가
            </button>
        </div>
        <div id="reading-list">
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            </div>
        </div>
    `;
    
    try {
        const [studentsRes, readingRes] = await Promise.all([
            axios.get(`/api/classes/${currentClassId}/students`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            axios.get('/api/reading?limit=1000', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
        ]);
        
        const students = studentsRes.data.students;
        window.currentClassStudents = students; // 전역 변수에 저장
        
        const allReading = readingRes.data.reading || [];
        const studentIds = students.map(s => s.student_id);
        const classReading = allReading.filter(r => studentIds.includes(r.student_id));
        
        const listContainer = document.getElementById('reading-list');
        
        if (!classReading || classReading.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">등록된 독서 활동이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">도서명</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">저자</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">완료일</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${classReading.map(reading => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${reading.student_name}</td>
                                <td class="px-6 py-4 text-sm font-medium">${reading.book_title}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${reading.author || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${reading.completion_date || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <button onclick="editClassReading(${reading.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteClassReading(${reading.id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('독서 활동 로드 실패:', error);
        document.getElementById('reading-list').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>독서 활동을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 반 봉사활동 로드
async function loadClassVolunteer() {
    const container = document.getElementById('class-tab-content');
    container.innerHTML = `
        <div class="mb-4 flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-800">봉사 활동</h4>
            <button onclick="showAddClassVolunteerForm()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <i class="fas fa-plus mr-2"></i>봉사 추가
            </button>
        </div>
        <div id="volunteer-list">
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            </div>
        </div>
    `;
    
    try {
        const [studentsRes, volunteerRes] = await Promise.all([
            axios.get(`/api/classes/${currentClassId}/students`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            axios.get('/api/volunteer?limit=1000', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
        ]);
        
        const students = studentsRes.data.students;
        window.currentClassStudents = students; // 전역 변수에 저장
        
        const allVolunteer = volunteerRes.data.volunteer || [];
        const studentIds = students.map(s => s.student_id);
        const classVolunteer = allVolunteer.filter(v => studentIds.includes(v.student_id));
        
        const listContainer = document.getElementById('volunteer-list');
        
        if (!classVolunteer || classVolunteer.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-hands-helping text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">등록된 봉사 활동이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">활동명</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">시간</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">활동일</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${classVolunteer.map(volunteer => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${volunteer.student_name}</td>
                                <td class="px-6 py-4 text-sm font-medium">${volunteer.activity_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${volunteer.hours}시간</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${volunteer.activity_date}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <button onclick="editClassVolunteer(${volunteer.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteClassVolunteer(${volunteer.id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('봉사 활동 로드 실패:', error);
        document.getElementById('volunteer-list').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>봉사 활동을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 반 상담 내역 로드
async function loadClassCounseling() {
    const container = document.getElementById('class-tab-content');
    container.innerHTML = `
        <div class="mb-4 flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-800">상담 내역</h4>
            <button onclick="showAddClassCounselingForm()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <i class="fas fa-plus mr-2"></i>상담 추가
            </button>
        </div>
        <div id="counseling-list">
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            </div>
        </div>
    `;
    
    try {
        const [studentsRes, counselingRes] = await Promise.all([
            axios.get(`/api/classes/${currentClassId}/students`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            axios.get('/api/counseling?limit=1000', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
        ]);
        
        const students = studentsRes.data.students;
        window.currentClassStudents = students; // 전역 변수에 저장
        
        const allCounseling = counselingRes.data.counseling || [];
        const studentIds = students.map(s => s.student_id);
        const classCounseling = allCounseling.filter(c => studentIds.includes(c.student_id));
        
        const listContainer = document.getElementById('counseling-list');
        
        if (!classCounseling || classCounseling.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-comments text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">등록된 상담 내역이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상담일</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상담자</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${classCounseling.map(counseling => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${counseling.student_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${counseling.counseling_type || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${counseling.counseling_date}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${counseling.counselor_name || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <button onclick="editClassCounseling(${counseling.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteClassCounseling(${counseling.id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('상담 내역 로드 실패:', error);
        document.getElementById('counseling-list').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>상담 내역을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 반 시간표 로드
async function loadClassSchedule() {
    const container = document.getElementById('class-tab-content');
    container.innerHTML = `
        <div class="mb-4 flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-800">시간표</h4>
            <button onclick="navigateToPage('schedules')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <i class="fas fa-calendar-alt mr-2"></i>시간표 관리 페이지로
            </button>
        </div>
        <div id="schedule-content">
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            </div>
        </div>
    `;
    
    try {
        const response = await axios.get(`/api/schedules/weekly/${currentClassId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const schedule = response.data.schedule;
        const listContainer = document.getElementById('schedule-content');
        
        if (!schedule || Object.keys(schedule).length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-calendar-times text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">등록된 시간표가 없습니다.</p>
                </div>
            `;
            return;
        }
        
        const weekDays = ['월', '화', '수', '목', '금'];
        const periods = [1, 2, 3, 4, 5, 6, 7];
        
        listContainer.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full border-collapse border border-gray-300">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="border border-gray-300 px-4 py-2 text-xs font-medium text-gray-500">교시</th>
                            ${weekDays.map(day => `
                                <th class="border border-gray-300 px-4 py-2 text-xs font-medium text-gray-500">${day}</th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody class="bg-white">
                        ${periods.map(period => `
                            <tr>
                                <td class="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">${period}교시</td>
                                ${weekDays.map(day => {
                                    const slot = schedule[day] && schedule[day][period];
                                    if (slot) {
                                        return `
                                            <td class="border border-gray-300 px-4 py-3 text-center">
                                                <div class="font-medium text-sm text-gray-800">${slot.subject_name}</div>
                                                <div class="text-xs text-gray-500">${slot.teacher_name || ''}</div>
                                                ${slot.room_number ? `<div class="text-xs text-gray-400">${slot.room_number}</div>` : ''}
                                            </td>
                                        `;
                                    } else {
                                        return `<td class="border border-gray-300 px-4 py-3 text-center text-gray-400">-</td>`;
                                    }
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('시간표 로드 실패:', error);
        document.getElementById('schedule-content').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>시간표를 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 학생 상세 보기 (기존 함수 재사용)
function viewStudentDetail(studentId) {
    alert(`학생 상세 정보 (ID: ${studentId})\n\n학생 관리 페이지로 이동하거나 상세 모달을 구현해주세요.`);
}

// 반에서 학생 제외
async function removeStudentFromClass(studentId) {
    if (!confirm('정말 이 학생을 반에서 제외하시겠습니까?')) {
        return;
    }
    
    try {
        // student_class_history에서 비활성화
        const response = await axios.get(`/api/student-class-history/student/${studentId}/current`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const currentAssignment = response.data.current_class;
        
        if (currentAssignment && currentAssignment.class_id == currentClassId) {
            await axios.delete(`/api/student-class-history/${currentAssignment.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            alert('학생이 반에서 제외되었습니다.');
            loadClassStudents();
        } else {
            alert('이 학생은 현재 이 반에 배정되어 있지 않습니다.');
        }
    } catch (error) {
        console.error('학생 제외 실패:', error);
        alert('학생 제외에 실패했습니다.');
    }
}

// 반에 학생 일괄 추가 (트리 구조 UI)
async function showAddStudentToClassForm() {
    try {
        // 모든 학생과 반 정보 가져오기
        const [allStudentsRes, classesRes, semestersRes] = await Promise.all([
            axios.get('/api/students', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            axios.get('/api/classes', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            axios.get('/api/semesters', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
        ]);
        
        const allStudents = allStudentsRes.data.students;
        const classes = classesRes.data.classes;
        const currentSemester = semestersRes.data.semesters.find(s => s.is_current);
        
        if (!currentSemester) {
            alert('현재 활성화된 학기가 없습니다.');
            return;
        }
        
        // 학생들을 현재 반별로 그룹화
        const studentsByClass = {};
        const unassignedStudents = [];
        
        allStudents.forEach(student => {
            // class_name이 null이면 classes에서 찾아서 사용
            const classInfo = student.class_name 
                ? { id: student.class_id, name: student.class_name, grade: student.current_class_grade || student.grade }
                : classes.find(c => c.id === student.class_id);
            
            if (student.class_id && classInfo) {
                if (!studentsByClass[student.class_id]) {
                    studentsByClass[student.class_id] = {
                        classInfo: classInfo,
                        students: []
                    };
                }
                studentsByClass[student.class_id].students.push(student);
            } else {
                unassignedStudents.push(student);
            }
        });
        
        // 학년별로 반 그룹화
        const classesByGrade = {};
        Object.values(studentsByClass).forEach(({ classInfo, students }) => {
            const grade = classInfo.grade || '기타';
            if (!classesByGrade[grade]) {
                classesByGrade[grade] = [];
            }
            classesByGrade[grade].push({ classInfo, students });
        });
        
        // 모달 생성
        const modal = document.createElement('div');
        modal.id = 'add-student-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
                <!-- 헤더 -->
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">
                            <i class="fas fa-exchange-alt mr-2"></i>학생 소속 변경
                        </h4>
                        <p class="text-sm text-gray-600 mt-1">
                            학생을 선택하여 <span class="font-semibold text-blue-600">${currentClassInfo.name}</span> 반으로 이동
                        </p>
                    </div>
                    <button onclick="document.getElementById('add-student-modal').remove()" 
                            class="text-gray-400 hover:text-gray-600 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- 본문 -->
                <div class="flex-1 overflow-y-auto p-6">
                    <div class="grid grid-cols-2 gap-6">
                        <!-- 왼쪽: 현재 소속 트리 -->
                        <div class="border border-gray-300 rounded-lg p-4 bg-gray-50">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="font-bold text-gray-800">
                                    <i class="fas fa-sitemap mr-2"></i>현재 소속
                                </h4>
                                <div class="text-xs text-gray-600">
                                    선택: <span id="selected-count" class="font-bold text-blue-600">0</span>명
                                </div>
                            </div>
                            
                            <div class="space-y-2 max-h-[60vh] overflow-y-auto">
                                ${Object.keys(classesByGrade).sort().map(grade => `
                                    <div class="mb-3">
                                        <div class="flex items-center mb-2">
                                            <button onclick="toggleGrade('grade-${grade}')" 
                                                    class="text-left font-semibold text-gray-700 hover:text-gray-900 flex items-center">
                                                <i class="fas fa-chevron-down mr-2 text-xs grade-toggle" id="toggle-grade-${grade}"></i>
                                                <i class="fas fa-layer-group mr-2 text-blue-600"></i>
                                                ${grade}학년
                                            </button>
                                        </div>
                                        <div id="grade-${grade}" class="ml-6 space-y-2">
                                            ${classesByGrade[grade].map(({ classInfo, students }) => `
                                                <div class="mb-2">
                                                    <button onclick="toggleClass('class-${classInfo.id}')"
                                                            class="text-left text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center w-full">
                                                        <i class="fas fa-chevron-down mr-2 text-xs class-toggle" id="toggle-class-${classInfo.id}"></i>
                                                        <i class="fas fa-door-open mr-2 text-green-600"></i>
                                                        ${classInfo.name} (${students.length}명)
                                                    </button>
                                                    <div id="class-${classInfo.id}" class="ml-6 mt-1 space-y-1">
                                                        ${students.map(student => `
                                                            <label class="flex items-center p-2 hover:bg-white rounded cursor-pointer text-sm">
                                                                <input type="checkbox" 
                                                                       class="student-checkbox mr-2" 
                                                                       value="${student.id}"
                                                                       data-name="${student.name}"
                                                                       data-number="${student.student_number}"
                                                                       onchange="updateSelectedCount()">
                                                                <i class="fas fa-user mr-2 text-gray-400 text-xs"></i>
                                                                <span>${student.name}</span>
                                                                <span class="text-gray-500 text-xs ml-2">(${student.student_number})</span>
                                                            </label>
                                                        `).join('')}
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                                
                                ${unassignedStudents.length > 0 ? `
                                    <div class="mb-3">
                                        <div class="flex items-center mb-2">
                                            <button onclick="toggleClass('unassigned')"
                                                    class="text-left font-semibold text-gray-700 hover:text-gray-900 flex items-center">
                                                <i class="fas fa-chevron-down mr-2 text-xs class-toggle" id="toggle-unassigned"></i>
                                                <i class="fas fa-user-slash mr-2 text-red-600"></i>
                                                미소속 (${unassignedStudents.length}명)
                                            </button>
                                        </div>
                                        <div id="unassigned" class="ml-6 space-y-1">
                                            ${unassignedStudents.map(student => `
                                                <label class="flex items-center p-2 hover:bg-white rounded cursor-pointer text-sm">
                                                    <input type="checkbox" 
                                                           class="student-checkbox mr-2" 
                                                           value="${student.id}"
                                                           data-name="${student.name}"
                                                           data-number="${student.student_number}"
                                                           onchange="updateSelectedCount()">
                                                    <i class="fas fa-user mr-2 text-gray-400 text-xs"></i>
                                                    <span>${student.name}</span>
                                                    <span class="text-gray-500 text-xs ml-2">(${student.student_number})</span>
                                                </label>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="mt-4 pt-4 border-t border-gray-300 flex gap-2">
                                <button onclick="selectAllStudents()" 
                                        class="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                                    <i class="fas fa-check-double mr-1"></i>전체 선택
                                </button>
                                <button onclick="deselectAllStudents()" 
                                        class="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                                    <i class="fas fa-times mr-1"></i>선택 해제
                                </button>
                            </div>
                        </div>
                        
                        <!-- 오른쪽: 새로운 소속 -->
                        <div class="border border-blue-300 rounded-lg p-4 bg-blue-50">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="font-bold text-gray-800">
                                    <i class="fas fa-arrow-right mr-2 text-blue-600"></i>새로운 소속
                                </h4>
                            </div>
                            
                            <!-- 심플한 반 정보 -->
                            <div class="bg-white rounded-lg p-3 mb-4 border border-blue-200">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <i class="fas fa-door-open text-blue-600 mr-2"></i>
                                        <div>
                                            <p class="font-semibold text-gray-800 text-sm">${currentClassInfo.name}</p>
                                            <p class="text-xs text-gray-600">${currentClassInfo.semester_name} · ${currentClassInfo.grade}학년</p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-xs text-gray-600">담임: ${currentClassInfo.homeroom_teacher ? currentClassInfo.homeroom_teacher.teacher_name : '미배정'}</p>
                                        <p class="text-xs text-gray-600">학생 ${currentClassInfo.student_count}명</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 선택된 학생 목록 -->
                            <div class="bg-white rounded-lg p-3 max-h-[55vh] overflow-y-auto">
                                <h5 class="font-semibold text-gray-700 mb-2 text-sm">
                                    <i class="fas fa-users mr-2"></i>이동할 학생
                                </h5>
                                <div id="selected-students-list" class="space-y-1 text-sm text-gray-500">
                                    <p class="text-center py-4 text-xs">학생을 선택해주세요</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 푸터 -->
                <div class="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-info-circle mr-2"></i>
                        선택한 학생들의 현재 학기(${currentSemester.name}) 소속이 변경됩니다
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="document.getElementById('add-student-modal').remove()"
                                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            취소
                        </button>
                        <button onclick="submitBulkStudentAdd()"
                                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-check mr-2"></i>선택한 학생 이동
                        </button>
                    </div>
                </div>
            </div>
        `;;
    } catch (error) {
        console.error('=== 학생 목록 로드 실패 ===');
        console.error('에러:', error);
        console.error('에러 응답:', error.response?.data);
        console.error('에러 상태:', error.response?.status);
        console.error('에러 메시지:', error.message);
        alert('학생 목록을 불러오는데 실패했습니다.\n에러: ' + (error.response?.data?.message || error.message));
    }
}

// 학년 토글
function toggleGrade(gradeId) {
    const gradeDiv = document.getElementById(gradeId);
    const toggleIcon = document.getElementById('toggle-' + gradeId);
    
    if (gradeDiv.style.display === 'none') {
        gradeDiv.style.display = 'block';
        toggleIcon.className = 'fas fa-chevron-down mr-2 text-xs grade-toggle';
    } else {
        gradeDiv.style.display = 'none';
        toggleIcon.className = 'fas fa-chevron-right mr-2 text-xs grade-toggle';
    }
}

// 반 토글
function toggleClass(classId) {
    const classDiv = document.getElementById(classId);
    const toggleIcon = document.getElementById('toggle-' + classId);
    
    if (classDiv.style.display === 'none') {
        classDiv.style.display = 'block';
        toggleIcon.className = 'fas fa-chevron-down mr-2 text-xs class-toggle';
    } else {
        classDiv.style.display = 'none';
        toggleIcon.className = 'fas fa-chevron-right mr-2 text-xs class-toggle';
    }
}

// 선택된 학생 수 업데이트
function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    const count = checkboxes.length;
    document.getElementById('selected-count').textContent = count;
    
    // 선택된 학생 목록 표시
    const listContainer = document.getElementById('selected-students-list');
    if (count === 0) {
        listContainer.innerHTML = '<p class="text-center py-4">학생을 선택해주세요</p>';
    } else {
        listContainer.innerHTML = Array.from(checkboxes).map(cb => `
            <div class="flex items-center p-2 bg-blue-50 rounded">
                <i class="fas fa-user mr-2 text-blue-600 text-xs"></i>
                <span class="font-medium">${cb.dataset.name}</span>
                <span class="text-gray-500 text-xs ml-2">(${cb.dataset.number})</span>
            </div>
        `).join('');
    }
}

// 전체 선택
function selectAllStudents() {
    document.querySelectorAll('.student-checkbox').forEach(cb => {
        cb.checked = true;
    });
    updateSelectedCount();
}

// 선택 해제
function deselectAllStudents() {
    document.querySelectorAll('.student-checkbox').forEach(cb => {
        cb.checked = false;
    });
    updateSelectedCount();
}

// 일괄 학생 추가 제출
async function submitBulkStudentAdd() {
    console.log('=== submitBulkStudentAdd 시작 ===');
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    console.log('선택된 체크박스:', checkboxes.length);
    
    if (checkboxes.length === 0) {
        alert('이동할 학생을 선택해주세요.');
        return;
    }
    
    const studentIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    console.log('학생 IDs:', studentIds);
    console.log('목표 반:', currentClassId, currentClassInfo.name);
    console.log('학기 ID:', currentClassInfo.semester_id);
    
    if (!confirm(`선택한 ${studentIds.length}명의 학생을 ${currentClassInfo.name} 반으로 이동하시겠습니까?`)) {
        return;
    }
    
    try {
        // 각 학생에 대해 새 배정 생성 (서버에서 기존 배정 자동 비활성화)
        const promises = studentIds.map(async (studentId, index) => {
            console.log(`\n--- 학생 ${index + 1}/${studentIds.length} (ID: ${studentId}) 처리 시작 ---`);
            
            // 새 배정 생성 (서버에서 기존 배정을 자동으로 비활성화함)
            const newAssignment = {
                student_id: studentId,
                class_id: currentClassId,
                semester_id: currentClassInfo.semester_id,
                start_date: new Date().toISOString().split('T')[0]
            };
            console.log(`학생 ${studentId}: 새 배정 생성 중...`, newAssignment);
            
            try {
                const result = await axios.post('/api/student-class-history', newAssignment, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                console.log(`학생 ${studentId}: 새 배정 생성 완료`, result.data);
                return result;
            } catch (err) {
                console.error(`학생 ${studentId}: 새 배정 생성 실패!`, err.response?.data || err.message);
                throw err;
            }
        });
        
        console.log('\n모든 학생 처리 대기 중...');
        const results = await Promise.allSettled(promises);
        console.log('모든 학생 처리 완료!', results);
        
        // 성공/실패 카운트
        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        console.log(`성공: ${succeeded}명, 실패: ${failed}명`);
        
        if (failed > 0) {
            const failedReasons = results
                .filter(r => r.status === 'rejected')
                .map(r => r.reason?.response?.data?.message || r.reason?.message)
                .join('\n');
            console.error('실패 이유:', failedReasons);
        }
        
        // 결과 메시지
        if (succeeded > 0) {
            if (failed > 0) {
                alert(`${succeeded}명의 학생이 이동되었습니다.\n${failed}명은 실패했습니다. (콘솔 확인)`);
            } else {
                alert(`${succeeded}명의 학생이 ${currentClassInfo.name} 반으로 이동되었습니다.`);
            }
            document.getElementById('add-student-modal').remove();
            loadClassStudents();
            loadClassInfo(); // 학생 수 업데이트
        } else {
            alert('모든 학생 이동에 실패했습니다. 콘솔을 확인해주세요.');
        }
    } catch (error) {
        console.error('=== 학생 일괄 추가 실패 ===');
        console.error('에러 상세:', error);
        console.error('에러 응답:', error.response?.data);
        console.error('에러 상태:', error.response?.status);
        alert('학생 이동 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
    }
}

// ========== 수상 관리 함수 ==========

// 수상 추가 폼 표시
async function showAddClassAwardForm() {
    if (!window.currentClassStudents || window.currentClassStudents.length === 0) {
        alert('이 반에 학생이 없습니다.');
        return;
    }
    
    try {
        const semestersRes = await axios.get('/api/semesters', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const container = document.getElementById('awards-list');
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="loadClassAwards()" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">수상 등록</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="class-award-add-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    ${window.currentClassStudents.map(s => `<option value="${s.student_id}">${s.student_name} (${s.student_number})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                                <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${semestersRes.data.semesters.map(sem => `<option value="${sem.id}" ${sem.is_current ? 'selected' : ''}>${sem.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">수상명 *</label>
                            <input type="text" name="award_name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">수상 분야</label>
                                <select name="award_category" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="학업우수상">학업우수상</option>
                                    <option value="봉사상">봉사상</option>
                                    <option value="체육상">체육상</option>
                                    <option value="예술상">예술상</option>
                                    <option value="모범상">모범상</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">수상 등급</label>
                                <select name="award_level" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="교내">교내</option>
                                    <option value="지역">지역</option>
                                    <option value="전국">전국</option>
                                    <option value="국제">국제</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">수상일 *</label>
                                <input type="date" name="award_date" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">주최기관</label>
                                <input type="text" name="organizer" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">내용</label>
                            <textarea name="description" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="loadClassAwards()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                등록
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('class-award-add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.post('/api/awards', data, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                alert('수상이 등록되었습니다.');
                loadClassAwards();
            } catch (error) {
                console.error('수상 등록 실패:', error);
                alert('수상 등록에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load award add page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
    }
}



// 수상 수정
async function editClassAward(awardId) {
    try {
        const [awardRes, studentsRes, semestersRes] = await Promise.all([
            axios.get(`/api/awards/${awardId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/students', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/semesters', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);
        
        const award = awardRes.data.award;
        
        const container = document.getElementById('awards-list');
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="loadClassAwards()" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">수상 수정</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="class-award-edit-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${studentsRes.data.students.map(s => `<option value="${s.id}" ${s.id == award.student_id ? 'selected' : ''}>${s.name} (${s.student_number})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                                <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${semestersRes.data.semesters.map(sem => `<option value="${sem.id}" ${sem.id == award.semester_id ? 'selected' : ''}>${sem.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">수상명 *</label>
                            <input type="text" name="award_name" value="${award.award_name || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">수상 분야</label>
                                <select name="award_category" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="학업우수상" ${award.award_category === '학업우수상' ? 'selected' : ''}>학업우수상</option>
                                    <option value="봉사상" ${award.award_category === '봉사상' ? 'selected' : ''}>봉사상</option>
                                    <option value="체육상" ${award.award_category === '체육상' ? 'selected' : ''}>체육상</option>
                                    <option value="예술상" ${award.award_category === '예술상' ? 'selected' : ''}>예술상</option>
                                    <option value="모범상" ${award.award_category === '모범상' ? 'selected' : ''}>모범상</option>
                                    <option value="기타" ${award.award_category === '기타' ? 'selected' : ''}>기타</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">수상 등급</label>
                                <select name="award_level" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="교내" ${award.award_level === '교내' ? 'selected' : ''}>교내</option>
                                    <option value="지역" ${award.award_level === '지역' ? 'selected' : ''}>지역</option>
                                    <option value="전국" ${award.award_level === '전국' ? 'selected' : ''}>전국</option>
                                    <option value="국제" ${award.award_level === '국제' ? 'selected' : ''}>국제</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">수상일 *</label>
                                <input type="date" name="award_date" value="${award.award_date || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">주최기관</label>
                                <input type="text" name="organizer" value="${award.organizer || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">내용</label>
                            <textarea name="description" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${award.description || ''}</textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="loadClassAwards()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                수정
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('class-award-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.put(`/api/awards/${awardId}`, data, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                alert('수상이 수정되었습니다.');
                loadClassAwards();
            } catch (error) {
                console.error('수상 수정 실패:', error);
                alert('수상 수정에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('수상 정보 로드 실패:', error);
        alert('수상 정보를 불러오는데 실패했습니다.');
    }
}

// 수상 삭제
async function deleteClassAward(awardId) {
    if (!confirm('이 수상을 삭제하시겠습니까?')) return;
    
    try {
        await axios.delete(`/api/awards/${awardId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        alert('수상이 삭제되었습니다.');
        loadClassAwards();
    } catch (error) {
        console.error('수상 삭제 실패:', error);
        alert('수상 삭제에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}

// ========== 독서 관리 함수 ==========

async function showAddClassReadingForm() {
    if (!window.currentClassStudents || window.currentClassStudents.length === 0) {
        alert('이 반에 학생이 없습니다.');
        return;
    }
    
    try {
        const semestersRes = await axios.get('/api/semesters', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const container = document.getElementById('reading-list');
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="loadClassReading()" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">독서활동 등록</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="class-reading-add-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    ${window.currentClassStudents.map(s => `<option value="${s.student_id}">${s.student_name} (${s.student_number})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                                <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${semestersRes.data.semesters.map(sem => `<option value="${sem.id}" ${sem.is_current ? 'selected' : ''}>${sem.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">도서명 *</label>
                            <input type="text" name="book_title" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">저자</label>
                                <input type="text" name="author" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">출판사</label>
                                <input type="text" name="publisher" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">페이지 수</label>
                                <input type="number" name="pages" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">독서일 *</label>
                                <input type="date" name="read_date" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">독서 유형</label>
                                <select name="reading_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="필독">필독</option>
                                    <option value="선택">선택</option>
                                    <option value="추천">추천</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">평점</label>
                                <select name="rating" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="5">⭐⭐⭐⭐⭐ (5점)</option>
                                    <option value="4">⭐⭐⭐⭐ (4점)</option>
                                    <option value="3">⭐⭐⭐ (3점)</option>
                                    <option value="2">⭐⭐ (2점)</option>
                                    <option value="1">⭐ (1점)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">줄거리/요약</label>
                            <textarea name="summary" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">독후감</label>
                            <textarea name="review" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="loadClassReading()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                등록
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('class-reading-add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.post('/api/reading', data, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                alert('독서활동이 등록되었습니다.');
                loadClassReading();
            } catch (error) {
                console.error('독서 등록 실패:', error);
                alert('독서활동 등록에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load reading add page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
    }
}

async function editClassReading(readingId) {
    try {
        const [readingRes, studentsRes, semestersRes] = await Promise.all([
            axios.get(`/api/reading/${readingId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/students', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/semesters', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);
        
        const reading = readingRes.data.reading;
        
        const container = document.getElementById('reading-list');
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="loadClassReading()" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">독서활동 수정</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="class-reading-edit-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${studentsRes.data.students.map(s => `<option value="${s.id}" ${s.id == reading.student_id ? 'selected' : ''}>${s.name} (${s.student_number})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                                <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${semestersRes.data.semesters.map(sem => `<option value="${sem.id}" ${sem.id == reading.semester_id ? 'selected' : ''}>${sem.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">도서명 *</label>
                            <input type="text" name="book_title" value="${reading.book_title || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">저자</label>
                                <input type="text" name="author" value="${reading.author || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">출판사</label>
                                <input type="text" name="publisher" value="${reading.publisher || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">페이지 수</label>
                                <input type="number" name="pages" value="${reading.pages || ''}" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">독서일 *</label>
                                <input type="date" name="read_date" value="${reading.read_date || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">독서 유형</label>
                                <select name="reading_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="필독" ${reading.reading_type === '필독' ? 'selected' : ''}>필독</option>
                                    <option value="선택" ${reading.reading_type === '선택' ? 'selected' : ''}>선택</option>
                                    <option value="추천" ${reading.reading_type === '추천' ? 'selected' : ''}>추천</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">평점</label>
                                <select name="rating" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="5" ${reading.rating == 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐ (5점)</option>
                                    <option value="4" ${reading.rating == 4 ? 'selected' : ''}>⭐⭐⭐⭐ (4점)</option>
                                    <option value="3" ${reading.rating == 3 ? 'selected' : ''}>⭐⭐⭐ (3점)</option>
                                    <option value="2" ${reading.rating == 2 ? 'selected' : ''}>⭐⭐ (2점)</option>
                                    <option value="1" ${reading.rating == 1 ? 'selected' : ''}>⭐ (1점)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">줄거리/요약</label>
                            <textarea name="summary" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${reading.summary || ''}</textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">독후감</label>
                            <textarea name="review" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${reading.review || ''}</textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="loadClassReading()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                수정
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('class-reading-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.put(`/api/reading/${readingId}`, data, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                alert('독서활동이 수정되었습니다.');
                loadClassReading();
            } catch (error) {
                console.error('독서활동 수정 실패:', error);
                alert('독서활동 수정에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('독서 정보 로드 실패:', error);
        alert('독서 정보를 불러오는데 실패했습니다.');
    }
}

async function deleteClassReading(readingId) {
    if (!confirm('이 독서 활동을 삭제하시겠습니까?')) return;
    
    try {
        await axios.delete(`/api/reading/${readingId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        alert('독서 활동이 삭제되었습니다.');
        loadClassReading();
    } catch (error) {
        console.error('독서 삭제 실패:', error);
        alert('독서 활동 삭제에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}

// ========== 봉사 관리 함수 ==========

async function showAddClassVolunteerForm() {
    if (!window.currentClassStudents || window.currentClassStudents.length === 0) {
        alert('이 반에 학생이 없습니다.');
        return;
    }
    
    try {
        const semestersRes = await axios.get('/api/semesters', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const container = document.getElementById('volunteer-list');
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="loadClassVolunteer()" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">봉사활동 등록</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="class-volunteer-add-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    ${window.currentClassStudents.map(s => `<option value="${s.student_id}">${s.student_name} (${s.student_number})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                                <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${semestersRes.data.semesters.map(sem => `<option value="${sem.id}" ${sem.is_current ? 'selected' : ''}>${sem.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">활동명 *</label>
                            <input type="text" name="activity_name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">기관/단체</label>
                                <input type="text" name="organization" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">활동 유형</label>
                                <select name="activity_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="교육">교육</option>
                                    <option value="환경">환경</option>
                                    <option value="복지">복지</option>
                                    <option value="의료">의료</option>
                                    <option value="문화">문화</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">활동일 *</label>
                                <input type="date" name="activity_date" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">시간 (시간) *</label>
                                <input type="number" name="hours" step="0.5" min="0" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">장소</label>
                            <input type="text" name="location" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">활동 내용</label>
                            <textarea name="description" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">인정 사항</label>
                            <input type="text" name="recognition" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="loadClassVolunteer()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                등록
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('class-volunteer-add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.post('/api/volunteer', data, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                alert('봉사활동이 등록되었습니다.');
                loadClassVolunteer();
            } catch (error) {
                console.error('봉사활동 등록 실패:', error);
                alert('봉사활동 등록에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load volunteer add page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
    }
}

async function editClassVolunteer(volunteerId) {
    try {
        const [volunteerRes, studentsRes, semestersRes] = await Promise.all([
            axios.get(`/api/volunteer/${volunteerId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/students', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/semesters', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);
        
        const volunteer = volunteerRes.data.volunteer;
        
        const container = document.getElementById('volunteer-list');
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="loadClassVolunteer()" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">봉사활동 수정</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="class-volunteer-edit-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${studentsRes.data.students.map(s => `<option value="${s.id}" ${s.id == volunteer.student_id ? 'selected' : ''}>${s.name} (${s.student_number})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                                <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${semestersRes.data.semesters.map(sem => `<option value="${sem.id}" ${sem.id == volunteer.semester_id ? 'selected' : ''}>${sem.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">활동명 *</label>
                            <input type="text" name="activity_name" value="${volunteer.activity_name || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">기관/단체</label>
                                <input type="text" name="organization" value="${volunteer.organization || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">활동 유형</label>
                                <select name="activity_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="교육" ${volunteer.activity_type === '교육' ? 'selected' : ''}>교육</option>
                                    <option value="환경" ${volunteer.activity_type === '환경' ? 'selected' : ''}>환경</option>
                                    <option value="복지" ${volunteer.activity_type === '복지' ? 'selected' : ''}>복지</option>
                                    <option value="의료" ${volunteer.activity_type === '의료' ? 'selected' : ''}>의료</option>
                                    <option value="문화" ${volunteer.activity_type === '문화' ? 'selected' : ''}>문화</option>
                                    <option value="기타" ${volunteer.activity_type === '기타' ? 'selected' : ''}>기타</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">활동일 *</label>
                                <input type="date" name="activity_date" value="${volunteer.activity_date || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">시간 (시간) *</label>
                                <input type="number" name="hours" step="0.5" min="0" value="${volunteer.hours || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">장소</label>
                            <input type="text" name="location" value="${volunteer.location || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">활동 내용</label>
                            <textarea name="description" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${volunteer.description || ''}</textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">인정 사항</label>
                            <input type="text" name="recognition" value="${volunteer.recognition || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="loadClassVolunteer()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                수정
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('class-volunteer-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.put(`/api/volunteer/${volunteerId}`, data, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                alert('봉사활동이 수정되었습니다.');
                loadClassVolunteer();
            } catch (error) {
                console.error('봉사활동 수정 실패:', error);
                alert('봉사활동 수정에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('봉사 정보 로드 실패:', error);
        alert('봉사 정보를 불러오는데 실패했습니다.');
    }
}

async function deleteClassVolunteer(volunteerId) {
    if (!confirm('이 봉사 활동을 삭제하시겠습니까?')) return;
    
    try {
        await axios.delete(`/api/volunteer/${volunteerId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        alert('봉사 활동이 삭제되었습니다.');
        loadClassVolunteer();
    } catch (error) {
        console.error('봉사 삭제 실패:', error);
        alert('봉사 활동 삭제에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}

// ========== 상담 관리 함수 ==========

async function showAddClassCounselingForm() {
    if (!window.currentClassStudents || window.currentClassStudents.length === 0) {
        alert('이 반에 학생이 없습니다.');
        return;
    }
    
    try {
        const semestersRes = await axios.get('/api/semesters', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const container = document.getElementById('counseling-list');
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="loadClassCounseling()" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">상담기록 등록</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="class-counseling-add-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    ${window.currentClassStudents.map(s => `<option value="${s.student_id}">${s.student_name} (${s.student_number})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                                <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${semestersRes.data.semesters.map(sem => `<option value="${sem.id}" ${sem.is_current ? 'selected' : ''}>${sem.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">상담일 *</label>
                                <input type="date" name="counseling_date" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">상담 유형</label>
                                <select name="counseling_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="학업">학업</option>
                                    <option value="진로">진로</option>
                                    <option value="교우관계">교우관계</option>
                                    <option value="가정">가정</option>
                                    <option value="심리/정서">심리/정서</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">상담자</label>
                                <input type="text" name="counselor_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">상담 주제 *</label>
                            <input type="text" name="topic" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">상담 내용 *</label>
                            <textarea name="content" rows="5" required class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">후속 조치</label>
                            <textarea name="follow_up" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" name="is_confidential" value="1" class="mr-2">
                                <span class="text-sm font-medium text-gray-700">기밀 상담 (비공개)</span>
                            </label>
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="loadClassCounseling()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                등록
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('class-counseling-add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // checkbox 처리
            data.is_confidential = data.is_confidential ? 1 : 0;
            
            try {
                await axios.post('/api/counseling', data, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                alert('상담기록이 등록되었습니다.');
                loadClassCounseling();
            } catch (error) {
                console.error('상담기록 등록 실패:', error);
                alert('상담기록 등록에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load counseling add page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
    }
}

async function editClassCounseling(counselingId) {
    try {
        const [counselingRes, studentsRes, semestersRes] = await Promise.all([
            axios.get(`/api/counseling/${counselingId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/students', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/semesters', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);
        
        const counseling = counselingRes.data.counseling;
        
        const container = document.getElementById('counseling-list');
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="loadClassCounseling()" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">상담기록 수정</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="class-counseling-edit-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${studentsRes.data.students.map(s => `<option value="${s.id}" ${s.id == counseling.student_id ? 'selected' : ''}>${s.name} (${s.student_number})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                                <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${semestersRes.data.semesters.map(sem => `<option value="${sem.id}" ${sem.id == counseling.semester_id ? 'selected' : ''}>${sem.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">상담일 *</label>
                                <input type="date" name="counseling_date" value="${counseling.counseling_date || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">상담 유형</label>
                                <select name="counseling_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="학업" ${counseling.counseling_type === '학업' ? 'selected' : ''}>학업</option>
                                    <option value="진로" ${counseling.counseling_type === '진로' ? 'selected' : ''}>진로</option>
                                    <option value="교우관계" ${counseling.counseling_type === '교우관계' ? 'selected' : ''}>교우관계</option>
                                    <option value="가정" ${counseling.counseling_type === '가정' ? 'selected' : ''}>가정</option>
                                    <option value="심리/정서" ${counseling.counseling_type === '심리/정서' ? 'selected' : ''}>심리/정서</option>
                                    <option value="기타" ${counseling.counseling_type === '기타' ? 'selected' : ''}>기타</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">상담자</label>
                                <input type="text" name="counselor_name" value="${counseling.counselor_name || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">상담 주제 *</label>
                            <input type="text" name="topic" value="${counseling.topic || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">상담 내용 *</label>
                            <textarea name="content" rows="5" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">${counseling.content || ''}</textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">후속 조치</label>
                            <textarea name="follow_up" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${counseling.follow_up || ''}</textarea>
                        </div>
                        
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" name="is_confidential" value="1" ${counseling.is_confidential ? 'checked' : ''} class="mr-2">
                                <span class="text-sm font-medium text-gray-700">기밀 상담 (비공개)</span>
                            </label>
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="loadClassCounseling()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                수정
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('class-counseling-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // checkbox 처리
            data.is_confidential = data.is_confidential ? 1 : 0;
            
            try {
                await axios.put(`/api/counseling/${counselingId}`, data, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                alert('상담기록이 수정되었습니다.');
                loadClassCounseling();
            } catch (error) {
                console.error('상담기록 수정 실패:', error);
                alert('상담기록 수정에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('상담 정보 로드 실패:', error);
        alert('상담 정보를 불러오는데 실패했습니다.');
    }
}

async function deleteClassCounseling(counselingId) {
    if (!confirm('이 상담 내역을 삭제하시겠습니까?')) return;
    
    try {
        await axios.delete(`/api/counseling/${counselingId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        alert('상담 내역이 삭제되었습니다.');
        loadClassCounseling();
    } catch (error) {
        console.error('상담 삭제 실패:', error);
        alert('상담 내역 삭제에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}

// ========== 성적 관리 함수 (간단 버전) ==========

async function showAddClassGradeForm() {
    if (!window.currentClassStudents || window.currentClassStudents.length === 0) {
        alert('이 반에 학생이 없습니다.');
        return;
    }
    
    try {
        const [semestersRes, subjectsRes] = await Promise.all([
            axios.get('/api/semesters', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/subjects', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);
        
        const container = document.getElementById('grades-list');
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="loadClassGrades()" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">성적 입력</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="class-grade-add-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    ${window.currentClassStudents.map(s => `<option value="${s.student_id}">${s.student_name} (${s.student_number})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                                <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${semestersRes.data.semesters.map(sem => `<option value="${sem.id}" ${sem.is_current ? 'selected' : ''}>${sem.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">과목 *</label>
                                <select name="subject_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    ${subjectsRes.data.subjects.map(sub => `<option value="${sub.id}">${sub.name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">평가 유형 *</label>
                                <select name="exam_type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="중간고사">중간고사</option>
                                    <option value="기말고사">기말고사</option>
                                    <option value="수행평가">수행평가</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">점수 *</label>
                                <input type="number" name="score" min="0" max="100" step="0.1" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">등급</label>
                                <select name="grade" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="A+">A+</option>
                                    <option value="A">A</option>
                                    <option value="B+">B+</option>
                                    <option value="B">B</option>
                                    <option value="C+">C+</option>
                                    <option value="C">C</option>
                                    <option value="D+">D+</option>
                                    <option value="D">D</option>
                                    <option value="F">F</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">비고</label>
                            <textarea name="notes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="loadClassGrades()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                등록
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('class-grade-add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.post('/api/grades', data, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                alert('성적이 등록되었습니다.');
                loadClassGrades();
            } catch (error) {
                console.error('성적 등록 실패:', error);
                alert('성적 등록에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load grade add page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
    }
}

async function editClassGrade(gradeId) {
    try {
        const [gradeRes, studentsRes, semestersRes, subjectsRes] = await Promise.all([
            axios.get(`/api/grades/${gradeId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/students', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/semesters', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/subjects', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);
        
        const grade = gradeRes.data.grade;
        
        const container = document.getElementById('grades-list');
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="loadClassGrades()" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">성적 수정</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="class-grade-edit-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${studentsRes.data.students.map(s => `<option value="${s.id}" ${s.id == grade.student_id ? 'selected' : ''}>${s.name} (${s.student_number})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                                <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${semestersRes.data.semesters.map(sem => `<option value="${sem.id}" ${sem.id == grade.semester_id ? 'selected' : ''}>${sem.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">과목 *</label>
                                <select name="subject_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${subjectsRes.data.subjects.map(sub => `<option value="${sub.id}" ${sub.id == grade.subject_id ? 'selected' : ''}>${sub.name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">평가 유형 *</label>
                                <select name="exam_type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="중간고사" ${grade.exam_type === '중간고사' ? 'selected' : ''}>중간고사</option>
                                    <option value="기말고사" ${grade.exam_type === '기말고사' ? 'selected' : ''}>기말고사</option>
                                    <option value="수행평가" ${grade.exam_type === '수행평가' ? 'selected' : ''}>수행평가</option>
                                    <option value="기타" ${grade.exam_type === '기타' ? 'selected' : ''}>기타</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">점수 *</label>
                                <input type="number" name="score" min="0" max="100" step="0.1" value="${grade.score || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">등급</label>
                                <select name="grade" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="A+" ${grade.grade === 'A+' ? 'selected' : ''}>A+</option>
                                    <option value="A" ${grade.grade === 'A' ? 'selected' : ''}>A</option>
                                    <option value="B+" ${grade.grade === 'B+' ? 'selected' : ''}>B+</option>
                                    <option value="B" ${grade.grade === 'B' ? 'selected' : ''}>B</option>
                                    <option value="C+" ${grade.grade === 'C+' ? 'selected' : ''}>C+</option>
                                    <option value="C" ${grade.grade === 'C' ? 'selected' : ''}>C</option>
                                    <option value="D+" ${grade.grade === 'D+' ? 'selected' : ''}>D+</option>
                                    <option value="D" ${grade.grade === 'D' ? 'selected' : ''}>D</option>
                                    <option value="F" ${grade.grade === 'F' ? 'selected' : ''}>F</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">비고</label>
                            <textarea name="notes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${grade.notes || ''}</textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="loadClassGrades()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                수정
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('class-grade-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.put(`/api/grades/${gradeId}`, data, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                alert('성적이 수정되었습니다.');
                loadClassGrades();
            } catch (error) {
                console.error('성적 수정 실패:', error);
                alert('성적 수정에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('성적 정보 로드 실패:', error);
        alert('성적 정보를 불러오는데 실패했습니다.');
    }
}

async function deleteClassGrade(gradeId) {
    if (!confirm('이 성적을 삭제하시겠습니까?')) return;
    
    try {
        await axios.delete(`/api/grades/${gradeId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        alert('성적이 삭제되었습니다.');
        loadClassGrades();
    } catch (error) {
        console.error('성적 삭제 실패:', error);
        alert('성적 삭제에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}
