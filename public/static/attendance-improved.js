// 개선된 출석 관리 (전체 학생 vs 반별)

let attendanceMode = 'all'; // 'all' 또는 'class'
let currentAttendanceClassId = null;

// 출석 관리 페이지 표시 (개선 버전)
async function showAttendanceManagementImproved() {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-clipboard-check mr-2"></i>출석 관리
            </h2>
            
            <!-- 모드 선택 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="flex space-x-4">
                    <button onclick="switchAttendanceMode('all')" id="mode-btn-all"
                            class="flex-1 py-3 rounded-lg font-medium transition border-2 border-blue-600 bg-blue-600 text-white">
                        <i class="fas fa-users mr-2"></i>전체 학생 출석
                    </button>
                    <button onclick="switchAttendanceMode('class')" id="mode-btn-class"
                            class="flex-1 py-3 rounded-lg font-medium transition border-2 border-gray-300 text-gray-700 hover:bg-gray-50">
                        <i class="fas fa-book mr-2"></i>반별 출석
                    </button>
                </div>
                <p class="text-sm text-gray-600 mt-4" id="mode-description">
                    전체 학생의 출석을 조회하고 관리합니다.
                </p>
            </div>
            
            <!-- 출석 컨텐츠 영역 -->
            <div id="attendance-content">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                </div>
            </div>
        </div>
    `;
    
    // 초기 모드 로드
    loadAttendanceContent();
}

// 출석 모드 전환
function switchAttendanceMode(mode) {
    attendanceMode = mode;
    
    // 버튼 스타일 업데이트
    if (mode === 'all') {
        document.getElementById('mode-btn-all').className = 
            'flex-1 py-3 rounded-lg font-medium transition border-2 border-blue-600 bg-blue-600 text-white';
        document.getElementById('mode-btn-class').className = 
            'flex-1 py-3 rounded-lg font-medium transition border-2 border-gray-300 text-gray-700 hover:bg-gray-50';
        document.getElementById('mode-description').textContent = 
            '전체 학생의 출석을 조회하고 관리합니다.';
    } else {
        document.getElementById('mode-btn-all').className = 
            'flex-1 py-3 rounded-lg font-medium transition border-2 border-gray-300 text-gray-700 hover:bg-gray-50';
        document.getElementById('mode-btn-class').className = 
            'flex-1 py-3 rounded-lg font-medium transition border-2 border-blue-600 bg-blue-600 text-white';
        document.getElementById('mode-description').textContent = 
            '특정 반의 학생들만 출석을 조회하고 관리합니다.';
    }
    
    loadAttendanceContent();
}

// 출석 컨텐츠 로드
async function loadAttendanceContent() {
    if (attendanceMode === 'all') {
        await loadAllStudentsAttendance();
    } else {
        await loadClassAttendanceSelection();
    }
}

// 전체 학생 출석 관리
async function loadAllStudentsAttendance() {
    const container = document.getElementById('attendance-content');
    const today = new Date().toISOString().split('T')[0];
    
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800">전체 학생 출석 현황</h3>
                    <div class="flex space-x-2">
                        <input type="date" id="all-attendance-date" value="${today}" 
                               class="px-3 py-2 border border-gray-300 rounded-lg">
                        <button onclick="queryAllAttendance()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-search mr-2"></i>조회
                        </button>
                    </div>
                </div>
                
                <!-- 검색 필터 -->
                <div id="attendance-search-filter" class="hidden">
                    <div class="flex gap-3 mb-4">
                        <input type="text" 
                               id="attendance-search-input" 
                               placeholder="학생 이름 또는 학번으로 검색..."
                               class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                               oninput="filterAttendanceList()">
                        <select id="attendance-class-filter" 
                                class="px-4 py-2 border border-gray-300 rounded-lg"
                                onchange="filterAttendanceList()">
                            <option value="">전체 반</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div id="all-attendance-list">
                <div class="text-center py-8">
                    <i class="fas fa-info-circle text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">날짜를 선택하고 조회 버튼을 클릭하세요.</p>
                </div>
            </div>
        </div>
    `;
}

// 전체 학생 출석 조회
async function queryAllAttendance() {
    const date = document.getElementById('all-attendance-date').value;
    const listContainer = document.getElementById('all-attendance-list');
    
    listContainer.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            <p class="text-gray-600 mt-2">조회 중...</p>
        </div>
    `;
    
    try {
        const response = await axios.get(`/api/attendance/by-date?date=${date}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const attendance = response.data.attendance;
        console.log('출석 데이터 로드:', attendance);
        
        if (!attendance || attendance.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">학생 데이터가 없습니다.</p>
                </div>
            `;
            return;
        }
        
        // 통계 계산
        const stats = {
            total: attendance.length,
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length,
            late: attendance.filter(a => a.status === 'late').length,
            excused: attendance.filter(a => a.status === 'excused').length,
            not_recorded: attendance.filter(a => a.status === 'not_recorded').length
        };
        
        // 전역 변수에 저장 (저장 및 필터링 시 사용)
        window.currentAttendanceData = attendance;
        window.currentAttendanceDate = date;
        window.allAttendanceData = attendance; // 원본 데이터 보관
        
        // 검색 필터 표시
        document.getElementById('attendance-search-filter').classList.remove('hidden');
        
        // 반 목록 로드 (필터용)
        try {
            const classesResponse = await axios.get('/api/classes', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const classFilter = document.getElementById('attendance-class-filter');
            classFilter.innerHTML = '<option value="">전체 반</option>' + 
                classesResponse.data.classes.map(cls => `
                    <option value="${cls.name}">${cls.name}</option>
                `).join('');
        } catch (err) {
            console.error('반 목록 로드 실패:', err);
        }
        
        listContainer.innerHTML = `
            <!-- 통계 카드 -->
            <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                    <p class="text-sm text-gray-600 mb-1">전체</p>
                    <p class="text-2xl font-bold text-gray-800">${stats.total}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg text-center">
                    <p class="text-sm text-green-600 mb-1">출석</p>
                    <p class="text-2xl font-bold text-green-800">${stats.present}</p>
                </div>
                <div class="bg-red-50 p-4 rounded-lg text-center">
                    <p class="text-sm text-red-600 mb-1">결석</p>
                    <p class="text-2xl font-bold text-red-800">${stats.absent}</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg text-center">
                    <p class="text-sm text-yellow-600 mb-1">지각</p>
                    <p class="text-2xl font-bold text-yellow-800">${stats.late}</p>
                </div>
                <div class="bg-blue-50 p-4 rounded-lg text-center">
                    <p class="text-sm text-blue-600 mb-1">인정결석</p>
                    <p class="text-2xl font-bold text-blue-800">${stats.excused}</p>
                </div>
                <div class="bg-gray-100 p-4 rounded-lg text-center">
                    <p class="text-sm text-gray-600 mb-1">미입력</p>
                    <p class="text-2xl font-bold text-gray-800">${stats.not_recorded}</p>
                </div>
            </div>
            
            <!-- 일괄 저장 버튼 -->
            <div class="mb-4 flex justify-end">
                <button onclick="saveAllAttendance()" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium">
                    <i class="fas fa-save mr-2"></i>전체 저장
                </button>
            </div>
            
            <!-- 출석 입력 테이블 -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">반</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">출석상태</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">비고</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200" id="attendance-table-body">
                        ${attendance.map((record, index) => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${record.student_number || '-'}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    ${record.student_name || 'Unknown'}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    ${record.class_name || '-'}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-center">
                                    <select id="status-${record.student_id}" 
                                            class="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onchange="updateAttendanceStatus(${record.student_id}, this.value)">
                                        <option value="not_recorded" ${record.status === 'not_recorded' ? 'selected' : ''}>미입력</option>
                                        <option value="present" ${record.status === 'present' ? 'selected' : ''}>출석</option>
                                        <option value="absent" ${record.status === 'absent' ? 'selected' : ''}>결석</option>
                                        <option value="late" ${record.status === 'late' ? 'selected' : ''}>지각</option>
                                        <option value="excused" ${record.status === 'excused' ? 'selected' : ''}>인정결석</option>
                                    </select>
                                </td>
                                <td class="px-4 py-3">
                                    <input type="text" 
                                           id="notes-${record.student_id}"
                                           value="${record.notes || ''}"
                                           placeholder="비고 입력..."
                                           class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                           onchange="updateAttendanceNotes(${record.student_id}, this.value)">
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('전체 출석 조회 실패:', error);
        listContainer.innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>출석 기록을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 반별 출석 선택 화면
async function loadClassAttendanceSelection() {
    const container = document.getElementById('attendance-content');
    
    try {
        const response = await axios.get('/api/classes', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const classes = response.data.classes;
        
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-6">반 선택</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${classes.map(cls => `
                        <button onclick="selectClassForAttendance(${cls.id}, '${cls.name}')"
                                class="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition text-left">
                            <h4 class="text-lg font-bold text-gray-800 mb-2">
                                <i class="fas fa-book mr-2"></i>${cls.name}
                            </h4>
                            <div class="text-sm space-y-1 text-gray-600">
                                <p><i class="fas fa-graduation-cap w-5 inline-block"></i>${cls.grade}학년</p>
                                <p><i class="fas fa-calendar w-5 inline-block"></i>${cls.semester_name}</p>
                                <p><i class="fas fa-user-tie w-5 inline-block"></i>${cls.teacher_name || '담임 미지정'}</p>
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('반 목록 로드 실패:', error);
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="text-center py-8 text-red-600">
                    <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <p>반 목록을 불러오는데 실패했습니다.</p>
                </div>
            </div>
        `;
    }
}

// 반 선택 후 출석 관리
async function selectClassForAttendance(classId, className) {
    currentAttendanceClassId = classId;
    const container = document.getElementById('attendance-content');
    const today = new Date().toISOString().split('T')[0];
    
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-6">
                <button onclick="loadClassAttendanceSelection()" class="mr-4 text-gray-600 hover:text-gray-800">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <div>
                    <h3 class="text-xl font-bold text-gray-800">${className} 출석 관리</h3>
                    <p class="text-sm text-gray-600 mt-1">이 반 학생들의 출석을 관리합니다</p>
                </div>
            </div>
            
            <div class="mb-6 flex space-x-2">
                <input type="date" id="class-attendance-date" value="${today}" 
                       class="px-3 py-2 border border-gray-300 rounded-lg">
                <button onclick="loadClassAttendanceInput()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    <i class="fas fa-check mr-2"></i>출석 입력
                </button>
            </div>
            
            <div id="class-attendance-list">
                <div class="text-center py-8">
                    <i class="fas fa-info-circle text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">날짜를 선택하고 출석 입력 버튼을 클릭하세요.</p>
                </div>
            </div>
        </div>
    `;
}

// 반별 출석 조회
async function queryClassAttendance() {
    const date = document.getElementById('class-attendance-date').value;
    const listContainer = document.getElementById('class-attendance-list');
    
    listContainer.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            <p class="text-gray-600 mt-2">조회 중...</p>
        </div>
    `;
    
    try {
        const response = await axios.get(`/api/classes/${currentAttendanceClassId}/attendance?date=${date}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const attendance = response.data.attendance;
        
        if (!attendance || attendance.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">해당 날짜의 출석 기록이 없습니다.</p>
                    <button onclick="takeClassAttendanceNow()" class="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
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
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
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
        console.error('반별 출석 조회 실패:', error);
        listContainer.innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>출석 기록을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 반별 출석 입력 로드
async function loadClassAttendanceInput() {
    const date = document.getElementById('class-attendance-date').value;
    const listContainer = document.getElementById('class-attendance-list');
    
    listContainer.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            <p class="text-gray-600 mt-2">학생 목록 로딩 중...</p>
        </div>
    `;
    
    try {
        // 반의 학생 목록 가져오기
        const studentsResponse = await axios.get(`/api/classes/${currentAttendanceClassId}/students`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const students = studentsResponse.data.students;
        
        if (!students || students.length === 0) {
            listContainer.innerHTML = `
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
        window.currentClassAttendanceData = studentsWithAttendance;
        window.currentClassAttendanceDate = date;
        
        listContainer.innerHTML = `
            <!-- 통계 카드 -->
            <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                    <p class="text-sm text-gray-600 mb-1">전체</p>
                    <p class="text-2xl font-bold text-gray-800">${stats.total}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg text-center">
                    <p class="text-sm text-green-600 mb-1">출석</p>
                    <p class="text-2xl font-bold text-green-800">${stats.present}</p>
                </div>
                <div class="bg-red-50 p-4 rounded-lg text-center">
                    <p class="text-sm text-red-600 mb-1">결석</p>
                    <p class="text-2xl font-bold text-red-800">${stats.absent}</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg text-center">
                    <p class="text-sm text-yellow-600 mb-1">지각</p>
                    <p class="text-2xl font-bold text-yellow-800">${stats.late}</p>
                </div>
                <div class="bg-blue-50 p-4 rounded-lg text-center">
                    <p class="text-sm text-blue-600 mb-1">인정결석</p>
                    <p class="text-2xl font-bold text-blue-800">${stats.excused}</p>
                </div>
                <div class="bg-gray-100 p-4 rounded-lg text-center">
                    <p class="text-sm text-gray-600 mb-1">미입력</p>
                    <p class="text-2xl font-bold text-gray-800">${stats.not_recorded}</p>
                </div>
            </div>
            
            <!-- 일괄 저장 버튼 -->
            <div class="mb-4 flex justify-end">
                <button onclick="saveClassAttendance()" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium">
                    <i class="fas fa-save mr-2"></i>전체 저장
                </button>
            </div>
            
            <!-- 출석 입력 테이블 -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">출석상태</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">비고</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${studentsWithAttendance.map(student => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${student.student_number || '-'}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    ${student.student_name}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-center">
                                    <select id="class-status-${student.student_id}" 
                                            class="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onchange="updateClassAttendanceStatus(${student.student_id}, this.value)">
                                        <option value="not_recorded" ${student.status === 'not_recorded' ? 'selected' : ''}>미입력</option>
                                        <option value="present" ${student.status === 'present' ? 'selected' : ''}>출석</option>
                                        <option value="absent" ${student.status === 'absent' ? 'selected' : ''}>결석</option>
                                        <option value="late" ${student.status === 'late' ? 'selected' : ''}>지각</option>
                                        <option value="excused" ${student.status === 'excused' ? 'selected' : ''}>인정결석</option>
                                    </select>
                                </td>
                                <td class="px-4 py-3">
                                    <input type="text" 
                                           id="class-notes-${student.student_id}"
                                           value="${student.notes || ''}"
                                           placeholder="비고 입력..."
                                           class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                           onchange="updateClassAttendanceNotes(${student.student_id}, this.value)">
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('반별 출석 입력 로드 실패:', error);
        listContainer.innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>출석 입력을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 반별 출석 상태 업데이트
function updateClassAttendanceStatus(studentId, status) {
    if (!window.currentClassAttendanceData) return;
    
    const student = window.currentClassAttendanceData.find(s => s.student_id === studentId);
    if (student) {
        student.status = status;
        refreshClassAttendanceStats();
    }
}

// 반별 출석 비고 업데이트
function updateClassAttendanceNotes(studentId, notes) {
    if (!window.currentClassAttendanceData) return;
    
    const student = window.currentClassAttendanceData.find(s => s.student_id === studentId);
    if (student) {
        student.notes = notes;
    }
}

// 반별 출석 통계 실시간 업데이트
function refreshClassAttendanceStats() {
    if (!window.currentClassAttendanceData) return;
    
    const attendance = window.currentClassAttendanceData;
    const stats = {
        total: attendance.length,
        present: attendance.filter(s => s.status === 'present').length,
        absent: attendance.filter(s => s.status === 'absent').length,
        late: attendance.filter(s => s.status === 'late').length,
        excused: attendance.filter(s => s.status === 'excused').length,
        not_recorded: attendance.filter(s => s.status === 'not_recorded').length
    };
    
    const container = document.querySelector('#class-attendance-list .grid.grid-cols-2');
    if (container) {
        container.innerHTML = `
            <div class="bg-gray-50 p-4 rounded-lg text-center">
                <p class="text-sm text-gray-600 mb-1">전체</p>
                <p class="text-2xl font-bold text-gray-800">${stats.total}</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg text-center">
                <p class="text-sm text-green-600 mb-1">출석</p>
                <p class="text-2xl font-bold text-green-800">${stats.present}</p>
            </div>
            <div class="bg-red-50 p-4 rounded-lg text-center">
                <p class="text-sm text-red-600 mb-1">결석</p>
                <p class="text-2xl font-bold text-red-800">${stats.absent}</p>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg text-center">
                <p class="text-sm text-yellow-600 mb-1">지각</p>
                <p class="text-2xl font-bold text-yellow-800">${stats.late}</p>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg text-center">
                <p class="text-sm text-blue-600 mb-1">인정결석</p>
                <p class="text-2xl font-bold text-blue-800">${stats.excused}</p>
            </div>
            <div class="bg-gray-100 p-4 rounded-lg text-center">
                <p class="text-sm text-gray-600 mb-1">미입력</p>
                <p class="text-2xl font-bold text-gray-800">${stats.not_recorded}</p>
            </div>
        `;
    }
}

// 반별 출석 저장
async function saveClassAttendance() {
    if (!window.currentClassAttendanceData || !window.currentClassAttendanceDate) {
        alert('출석 데이터가 없습니다.');
        return;
    }
    
    const recordsToSave = window.currentClassAttendanceData
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
        const saveBtn = event.target;
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>저장 중...';
        
        const response = await axios.post('/api/attendance/bulk-simple', {
            attendance_date: window.currentClassAttendanceDate,
            records: recordsToSave
        }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.data.success) {
            alert(`출석이 저장되었습니다!\n성공: ${response.data.successCount}명\n실패: ${response.data.errorCount}명`);
            await loadClassAttendanceInput();
        } else {
            alert('출석 저장에 실패했습니다.');
        }
        
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    } catch (error) {
        console.error('반별 출석 저장 실패:', error);
        alert('출석 저장 중 오류가 발생했습니다.');
        
        const saveBtn = event.target;
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>전체 저장';
    }
}

// ==================== 출석 입력 기능 ====================

// 출석 상태 업데이트 (메모리에만)
function updateAttendanceStatus(studentId, status) {
    if (!window.currentAttendanceData) return;
    
    const student = window.currentAttendanceData.find(s => s.student_id === studentId);
    if (student) {
        student.status = status;
        // 통계 실시간 업데이트
        refreshAttendanceStats();
    }
}

// 출석 비고 업데이트 (메모리에만)
function updateAttendanceNotes(studentId, notes) {
    if (!window.currentAttendanceData) return;
    
    const student = window.currentAttendanceData.find(s => s.student_id === studentId);
    if (student) {
        student.notes = notes;
    }
}

// 통계 실시간 업데이트
function refreshAttendanceStats() {
    if (!window.currentAttendanceData) return;
    
    const attendance = window.currentAttendanceData;
    const stats = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        excused: attendance.filter(a => a.status === 'excused').length,
        not_recorded: attendance.filter(a => a.status === 'not_recorded').length
    };
    
    // 통계 카드 업데이트 (DOM 직접 수정으로 성능 향상)
    const container = document.querySelector('.grid.grid-cols-2');
    if (container) {
        container.innerHTML = `
            <div class="bg-gray-50 p-4 rounded-lg text-center">
                <p class="text-sm text-gray-600 mb-1">전체</p>
                <p class="text-2xl font-bold text-gray-800">${stats.total}</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg text-center">
                <p class="text-sm text-green-600 mb-1">출석</p>
                <p class="text-2xl font-bold text-green-800">${stats.present}</p>
            </div>
            <div class="bg-red-50 p-4 rounded-lg text-center">
                <p class="text-sm text-red-600 mb-1">결석</p>
                <p class="text-2xl font-bold text-red-800">${stats.absent}</p>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg text-center">
                <p class="text-sm text-yellow-600 mb-1">지각</p>
                <p class="text-2xl font-bold text-yellow-800">${stats.late}</p>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg text-center">
                <p class="text-sm text-blue-600 mb-1">인정결석</p>
                <p class="text-2xl font-bold text-blue-800">${stats.excused}</p>
            </div>
            <div class="bg-gray-100 p-4 rounded-lg text-center">
                <p class="text-sm text-gray-600 mb-1">미입력</p>
                <p class="text-2xl font-bold text-gray-800">${stats.not_recorded}</p>
            </div>
        `;
    }
}

// 출석 목록 필터링
function filterAttendanceList() {
    if (!window.allAttendanceData) return;
    
    const searchText = document.getElementById('attendance-search-input').value.toLowerCase();
    const classFilter = document.getElementById('attendance-class-filter').value;
    
    const filtered = window.allAttendanceData.filter(student => {
        const matchSearch = !searchText || 
            (student.student_name && student.student_name.toLowerCase().includes(searchText)) ||
            (student.student_number && student.student_number.toLowerCase().includes(searchText));
        
        const matchClass = !classFilter || student.class_name === classFilter;
        
        return matchSearch && matchClass;
    });
    
    // currentAttendanceData 업데이트 (저장 시 사용)
    window.currentAttendanceData = filtered;
    
    // 테이블 재렌더링
    renderAttendanceTable(filtered);
}

// 출석 테이블 렌더링
function renderAttendanceTable(attendanceData) {
    const tbody = document.getElementById('attendance-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = attendanceData.map(record => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                ${record.student_number || '-'}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                ${record.student_name || 'Unknown'}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                ${record.class_name || '-'}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-center">
                <select id="status-${record.student_id}" 
                        class="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onchange="updateAttendanceStatus(${record.student_id}, this.value)">
                    <option value="not_recorded" ${record.status === 'not_recorded' ? 'selected' : ''}>미입력</option>
                    <option value="present" ${record.status === 'present' ? 'selected' : ''}>출석</option>
                    <option value="absent" ${record.status === 'absent' ? 'selected' : ''}>결석</option>
                    <option value="late" ${record.status === 'late' ? 'selected' : ''}>지각</option>
                    <option value="excused" ${record.status === 'excused' ? 'selected' : ''}>인정결석</option>
                </select>
            </td>
            <td class="px-4 py-3">
                <input type="text" 
                       id="notes-${record.student_id}"
                       value="${record.notes || ''}"
                       placeholder="비고 입력..."
                       class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                       onchange="updateAttendanceNotes(${record.student_id}, this.value)">
            </td>
        </tr>
    `).join('');
}

// 전체 출석 저장
async function saveAllAttendance() {
    if (!window.allAttendanceData || !window.currentAttendanceDate) {
        alert('출석 데이터가 없습니다.');
        return;
    }
    
    // 원본 데이터에서 저장 (필터링된 데이터가 아닌)
    const recordsToSave = window.allAttendanceData
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
    
    // 확인 대화상자
    if (!confirm(`${recordsToSave.length}명의 출석을 저장하시겠습니까?`)) {
        return;
    }
    
    try {
        // 로딩 표시
        const saveBtn = event.target;
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>저장 중...';
        
        const response = await axios.post('/api/attendance/bulk-simple', {
            attendance_date: window.currentAttendanceDate,
            records: recordsToSave
        }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.data.success) {
            alert(`출석이 저장되었습니다!\n성공: ${response.data.successCount}명\n실패: ${response.data.errorCount}명`);
            
            // 저장 후 다시 조회
            await queryAllAttendance();
        } else {
            alert('출석 저장에 실패했습니다.');
        }
        
        // 버튼 복원
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    } catch (error) {
        console.error('출석 저장 실패:', error);
        alert('출석 저장 중 오류가 발생했습니다.');
        
        // 버튼 복원
        const saveBtn = event.target;
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>전체 저장';
    }
}
