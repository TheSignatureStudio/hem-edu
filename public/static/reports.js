// 생활기록부 및 성적표 관리

// 현재 보고 있는 데이터 저장 (인쇄용)
let currentLifeRecordData = null;
let currentGradeReportData = null;

// 생활기록부 조회 페이지
async function showLifeRecordPage(studentId) {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="mb-6">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                    <button onclick="navigateToPage('students')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h2 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-book mr-2"></i>생활기록부
                    </h2>
                </div>
                <div class="flex gap-3">
                    <button onclick="printLifeRecord()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-print mr-2"></i>인쇄
                    </button>
                    <button onclick="downloadLifeRecordPDF()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-download mr-2"></i>PDF 다운로드
                    </button>
                </div>
            </div>
            
            <div id="life-record-content">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                </div>
            </div>
        </div>
    `;
    
    await loadLifeRecord(studentId);
}

// 생활기록부 데이터 로드
async function loadLifeRecord(studentId) {
    try {
        const response = await axios.get(`/api/student-report/life-record/${studentId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const data = response.data;
        currentLifeRecordData = data; // 인쇄용으로 저장
        renderLifeRecord(data);
    } catch (error) {
        console.error('생활기록부 로드 실패:', error);
        document.getElementById('life-record-content').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>생활기록부를 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 생활기록부 렌더링
function renderLifeRecord(data) {
    const student = data.student;
    const container = document.getElementById('life-record-content');
    
    container.innerHTML = `
        <div class="space-y-6" id="printable-life-record">
            <!-- 학생 기본 정보 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-3">
                    <i class="fas fa-user-graduate mr-2 text-blue-600"></i>학생 기본 정보
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p class="text-sm text-gray-500">이름</p>
                        <p class="font-medium">${student.name}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">학번</p>
                        <p class="font-medium">${student.student_number}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">생년월일</p>
                        <p class="font-medium">${student.birthdate || '-'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">성별</p>
                        <p class="font-medium">${student.gender === 'male' ? '남' : student.gender === 'female' ? '여' : '-'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">입학일</p>
                        <p class="font-medium">${student.admission_date || '-'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">상태</p>
                        <p class="font-medium">${getStatusText(student.status)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">연락처</p>
                        <p class="font-medium">${student.phone || '-'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">이메일</p>
                        <p class="font-medium">${student.email || '-'}</p>
                    </div>
                </div>
            </div>
            
            <!-- 학급 배정 이력 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-3">
                    <i class="fas fa-school mr-2 text-green-600"></i>학급 배정 이력
                </h3>
                ${data.classHistory.length > 0 ? `
                    <div class="space-y-3">
                        ${data.classHistory.map(ch => `
                            <div class="flex items-center justify-between border-l-4 border-blue-500 pl-4 py-2 bg-gray-50">
                                <div>
                                    <p class="font-medium">${ch.semester_name}: ${ch.class_name}</p>
                                    <p class="text-sm text-gray-600">담임: ${ch.homeroom_teacher_name || '미배정'}</p>
                                </div>
                                <div class="text-sm text-gray-500">
                                    ${ch.start_date} ~ ${ch.end_date || '현재'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-gray-500">학급 배정 이력이 없습니다.</p>'}
            </div>
            
            <!-- 출석 통계 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-3">
                    <i class="fas fa-clipboard-check mr-2 text-purple-600"></i>출석 통계
                </h3>
                ${data.attendanceStats.length > 0 ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${data.attendanceStats.map(stat => `
                            <div class="border rounded-lg p-4">
                                <h4 class="font-bold mb-3">${stat.semester_name}</h4>
                                <div class="grid grid-cols-4 gap-2 text-center">
                                    <div>
                                        <p class="text-2xl font-bold text-green-600">${stat.present_days}</p>
                                        <p class="text-xs text-gray-600">출석</p>
                                    </div>
                                    <div>
                                        <p class="text-2xl font-bold text-red-600">${stat.absent_days}</p>
                                        <p class="text-xs text-gray-600">결석</p>
                                    </div>
                                    <div>
                                        <p class="text-2xl font-bold text-yellow-600">${stat.late_days}</p>
                                        <p class="text-xs text-gray-600">지각</p>
                                    </div>
                                    <div>
                                        <p class="text-2xl font-bold text-blue-600">${stat.excused_days}</p>
                                        <p class="text-xs text-gray-600">인정</p>
                                    </div>
                                </div>
                                <div class="mt-3 pt-3 border-t">
                                    <p class="text-sm">
                                        출석률: <span class="font-bold">${((stat.present_days / stat.total_days) * 100).toFixed(1)}%</span>
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-gray-500">출석 통계가 없습니다.</p>'}
            </div>
            
            <!-- 성적 정보 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-3">
                    <i class="fas fa-chart-line mr-2 text-orange-600"></i>성적 정보
                </h3>
                ${data.grades.length > 0 ? `
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">학기</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">과목</th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">점수</th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">등급</th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">석차</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">비고</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${data.grades.map(grade => `
                                    <tr>
                                        <td class="px-4 py-3 whitespace-nowrap text-sm">${grade.semester_name}</td>
                                        <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">${grade.subject_name}</td>
                                        <td class="px-4 py-3 whitespace-nowrap text-sm text-center">${grade.total_score || '-'}</td>
                                        <td class="px-4 py-3 whitespace-nowrap text-sm text-center">
                                            <span class="px-2 py-1 rounded text-xs ${getGradeColor(grade.letter_grade)}">
                                                ${grade.letter_grade || '-'}
                                            </span>
                                        </td>
                                        <td class="px-4 py-3 whitespace-nowrap text-sm text-center">${grade.class_rank || '-'}</td>
                                        <td class="px-4 py-3 text-sm text-gray-600">${grade.comment || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="text-gray-500">성적 정보가 없습니다.</p>'}
            </div>
            
            <!-- 봉사활동 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-3">
                    <i class="fas fa-hands-helping mr-2 text-pink-600"></i>봉사활동
                </h3>
                ${data.volunteerActivities.length > 0 ? `
                    <div class="mb-4 p-4 bg-blue-50 rounded">
                        <p class="text-lg">
                            총 봉사시간: <span class="font-bold text-blue-600">
                                ${data.volunteerActivities.reduce((sum, v) => sum + (v.hours || 0), 0)}시간
                            </span>
                        </p>
                    </div>
                    <div class="space-y-2">
                        ${data.volunteerActivities.map(va => `
                            <div class="border-l-4 ${va.status === 'approved' ? 'border-green-500' : va.status === 'rejected' ? 'border-red-500' : 'border-gray-300'} pl-4 py-2">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-medium">${va.activity_name}</p>
                                        <p class="text-sm text-gray-600">${va.organization || '-'} | ${va.activity_date}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="font-bold text-blue-600">${va.hours}시간</p>
                                        <p class="text-xs ${va.status === 'approved' ? 'text-green-600' : va.status === 'rejected' ? 'text-red-600' : 'text-gray-600'}">
                                            ${va.status === 'approved' ? '승인됨' : va.status === 'rejected' ? '반려됨' : '대기중'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-gray-500">봉사활동 기록이 없습니다.</p>'}
            </div>
            
            <!-- 동아리 활동 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-3">
                    <i class="fas fa-users mr-2 text-teal-600"></i>동아리 활동
                </h3>
                ${data.clubActivities.length > 0 ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${data.clubActivities.map(club => `
                            <div class="border rounded-lg p-4">
                                <h4 class="font-bold text-lg mb-2">${club.club_name}</h4>
                                <p class="text-sm text-gray-600 mb-2">${club.description || ''}</p>
                                <div class="flex justify-between text-sm">
                                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">${club.role === 'president' ? '회장' : club.role === 'vice_president' ? '부회장' : '회원'}</span>
                                    <span class="text-gray-500">${club.semester_name}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-gray-500">동아리 활동 기록이 없습니다.</p>'}
            </div>
            
            <!-- 특별 기록 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-3">
                    <i class="fas fa-star mr-2 text-yellow-600"></i>특별 기록
                </h3>
                ${data.specialRecords.length > 0 ? `
                    <div class="space-y-3">
                        ${data.specialRecords.map(record => `
                            <div class="border rounded-lg p-4">
                                <div class="flex items-start justify-between mb-2">
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-1 text-xs rounded ${getRecordTypeColor(record.record_type)}">
                                            ${getRecordTypeText(record.record_type)}
                                        </span>
                                        <h4 class="font-bold">${record.title}</h4>
                                    </div>
                                    <span class="text-sm text-gray-500">${record.record_date}</span>
                                </div>
                                <p class="text-sm text-gray-700 whitespace-pre-wrap">${record.content}</p>
                                <p class="text-xs text-gray-500 mt-2">기록자: ${record.recorded_by_name || '-'} | ${record.semester_name}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-gray-500">특별 기록이 없습니다.</p>'}
            </div>
        </div>
    `;
}

// 성적표 조회 페이지
async function showGradeReportPage(studentId, semesterId) {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="mb-6">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                    <button onclick="navigateToPage('students')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h2 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-file-alt mr-2"></i>성적표
                    </h2>
                </div>
                <div class="flex gap-3">
                    <select id="semester-selector" class="px-4 py-2 border border-gray-300 rounded-lg"
                            onchange="showGradeReportPage(${studentId}, this.value)">
                        <option value="">학기 선택</option>
                    </select>
                    <button onclick="printGradeReport()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-print mr-2"></i>인쇄
                    </button>
                    <button onclick="downloadGradeReportPDF()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-download mr-2"></i>PDF 다운로드
                    </button>
                </div>
            </div>
            
            <div id="grade-report-content">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                </div>
            </div>
        </div>
    `;
    
    // 학기 목록 로드 (semesterId가 없으면 현재 학기를 가져옴)
    const selectedSemester = await loadSemestersForSelector(semesterId, studentId);
    
    if (selectedSemester) {
        await loadGradeReport(studentId, selectedSemester);
    }
}

// 학기 목록 로드
async function loadSemestersForSelector(selectedId, studentId) {
    try {
        const response = await axios.get('/api/semesters', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const semesters = response.data.semesters;
        
        // selectedId가 없으면 현재 학기를 찾음
        let finalSelectedId = selectedId;
        if (!finalSelectedId && semesters.length > 0) {
            // 현재 학기 찾기 (is_current가 true인 것)
            const currentSemester = semesters.find(sem => sem.is_current);
            if (currentSemester) {
                finalSelectedId = currentSemester.id;
            } else {
                // 현재 학기가 없으면 가장 최근 학기 선택
                finalSelectedId = semesters[0].id;
            }
        }
        
        const selector = document.getElementById('semester-selector');
        selector.innerHTML = '<option value="">학기 선택</option>' + 
            semesters.map(sem => `
                <option value="${sem.id}" ${sem.id == finalSelectedId ? 'selected' : ''}>
                    ${sem.name}
                </option>
            `).join('');
        
        // 선택된 학기 ID 반환
        return finalSelectedId;
    } catch (error) {
        console.error('학기 목록 로드 실패:', error);
        return null;
    }
}

// 성적표 데이터 로드
async function loadGradeReport(studentId, semesterId) {
    try {
        const response = await axios.get(`/api/student-report/grade-report/${studentId}?semester_id=${semesterId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const data = response.data;
        currentGradeReportData = data; // 인쇄용으로 저장
        renderGradeReport(data);
    } catch (error) {
        console.error('성적표 로드 실패:', error);
        document.getElementById('grade-report-content').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>성적표를 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 성적표 렌더링
function renderGradeReport(data) {
    const student = data.student;
    const semester = data.semester;
    const summary = data.summary;
    const container = document.getElementById('grade-report-content');
    
    container.innerHTML = `
        <div class="space-y-6" id="printable-grade-report">
            <!-- 헤더 -->
            <div class="bg-white rounded-lg shadow-md p-8 text-center">
                <h1 class="text-3xl font-bold mb-6">성 적 표</h1>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
                    <div class="border-b pb-2">
                        <p class="text-sm text-gray-500">학년도/학기</p>
                        <p class="font-medium">${semester.name}</p>
                    </div>
                    <div class="border-b pb-2">
                        <p class="text-sm text-gray-500">학년/반</p>
                        <p class="font-medium">${student.grade || '-'}학년 ${student.class_name || '-'}</p>
                    </div>
                    <div class="border-b pb-2">
                        <p class="text-sm text-gray-500">학번</p>
                        <p class="font-medium">${student.student_number}</p>
                    </div>
                    <div class="border-b pb-2">
                        <p class="text-sm text-gray-500">이름</p>
                        <p class="font-medium">${student.name}</p>
                    </div>
                </div>
            </div>
            
            <!-- 과목별 성적 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">과목별 성적</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">과목명</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">학점</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">점수</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">등급</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">석차</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">출석점수</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">참여점수</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">담당교사</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${data.subjectGrades.map(grade => `
                                <tr>
                                    <td class="px-4 py-3 whitespace-nowrap">
                                        <div>
                                            <p class="font-medium">${grade.subject_name}</p>
                                            <p class="text-xs text-gray-500">${grade.subject_code}</p>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap text-center">${grade.credits || '-'}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-center font-bold">${grade.total_score || '-'}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-center">
                                        <span class="px-3 py-1 rounded ${getGradeColor(grade.letter_grade)}">
                                            ${grade.letter_grade || '-'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap text-center">${grade.class_rank || '-'}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-center">${grade.attendance_score || '-'}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-center">${grade.participation_score || '-'}</td>
                                    <td class="px-4 py-3 whitespace-nowrap">${grade.teacher_name || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot class="bg-gray-50">
                            <tr>
                                <td class="px-4 py-3 font-bold">총 계</td>
                                <td class="px-4 py-3 text-center font-bold">${summary.totalCredits}</td>
                                <td class="px-4 py-3 text-center font-bold text-blue-600">${summary.averageScore}</td>
                                <td colspan="5" class="px-4 py-3"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            <!-- 출석 현황 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">출석 현황</h3>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div class="text-center p-4 bg-gray-50 rounded">
                        <p class="text-2xl font-bold text-gray-800">${data.attendanceStats.total_days}</p>
                        <p class="text-sm text-gray-600">수업일수</p>
                    </div>
                    <div class="text-center p-4 bg-green-50 rounded">
                        <p class="text-2xl font-bold text-green-600">${data.attendanceStats.present_days}</p>
                        <p class="text-sm text-gray-600">출석</p>
                    </div>
                    <div class="text-center p-4 bg-red-50 rounded">
                        <p class="text-2xl font-bold text-red-600">${data.attendanceStats.absent_days}</p>
                        <p class="text-sm text-gray-600">결석</p>
                    </div>
                    <div class="text-center p-4 bg-yellow-50 rounded">
                        <p class="text-2xl font-bold text-yellow-600">${data.attendanceStats.late_days}</p>
                        <p class="text-sm text-gray-600">지각</p>
                    </div>
                    <div class="text-center p-4 bg-blue-50 rounded">
                        <p class="text-2xl font-bold text-blue-600">${summary.attendanceRate}%</p>
                        <p class="text-sm text-gray-600">출석률</p>
                    </div>
                </div>
            </div>
            
            <!-- 세부 성적 (시험별) -->
            ${data.detailedGrades.length > 0 ? `
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">세부 성적</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">과목</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">평가유형</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">점수</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">배점</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">반영비율</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">시험일</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${data.detailedGrades.map(grade => `
                                <tr>
                                    <td class="px-4 py-3 whitespace-nowrap font-medium">${grade.subject_name}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-center">
                                        <span class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                            ${getExamTypeText(grade.exam_type)}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap text-center font-bold">${grade.score}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-center text-gray-600">${grade.max_score}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-center">${(grade.weight * 100).toFixed(0)}%</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-center text-sm">${grade.exam_date || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : ''}
            
            <!-- 발행일 -->
            <div class="text-center text-gray-600">
                <p>발행일: ${new Date().toLocaleDateString('ko-KR')}</p>
            </div>
        </div>
    `;
}

// 등급 색상
function getGradeColor(grade) {
    const colors = {
        'A+': 'bg-green-100 text-green-800 font-bold',
        'A': 'bg-green-100 text-green-700',
        'B+': 'bg-blue-100 text-blue-800',
        'B': 'bg-blue-100 text-blue-700',
        'C+': 'bg-yellow-100 text-yellow-800',
        'C': 'bg-yellow-100 text-yellow-700',
        'D+': 'bg-orange-100 text-orange-800',
        'D': 'bg-orange-100 text-orange-700',
        'F': 'bg-red-100 text-red-800'
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
}

// 시험 유형 텍스트
function getExamTypeText(type) {
    const texts = {
        'midterm': '중간고사',
        'final': '기말고사',
        'assignment': '과제',
        'quiz': '퀴즈',
        'project': '프로젝트'
    };
    return texts[type] || type;
}

// 특별 기록 유형 색상
function getRecordTypeColor(type) {
    const colors = {
        'behavior': 'bg-blue-100 text-blue-800',
        'award': 'bg-yellow-100 text-yellow-800',
        'punishment': 'bg-red-100 text-red-800',
        'special': 'bg-purple-100 text-purple-800',
        'health': 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
}

// 특별 기록 유형 텍스트
function getRecordTypeText(type) {
    const texts = {
        'behavior': '행동',
        'award': '수상',
        'punishment': '징계',
        'special': '특이사항',
        'health': '건강'
    };
    return texts[type] || type;
}

// 인쇄 전용 페이지로 전환
function printLifeRecord() {
    if (!currentLifeRecordData) {
        alert('생활기록부 데이터를 먼저 불러와주세요.');
        return;
    }
    showPrintableLifeRecord(currentLifeRecordData);
}

function printGradeReport() {
    if (!currentGradeReportData) {
        alert('성적표 데이터를 먼저 불러와주세요.');
        return;
    }
    showPrintableGradeReport(currentGradeReportData);
}

// PDF 다운로드 (인쇄 페이지로 이동 후 브라우저 인쇄)
function downloadLifeRecordPDF() {
    printLifeRecord();
}

function downloadGradeReportPDF() {
    printGradeReport();
}

// ==================== 메뉴에서 접근하는 페이지들 ====================

// 성적표 출력 페이지 (학생 선택)
async function showReportsPage(container) {
    container.innerHTML = `
        <div>
            <h2 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-print mr-2"></i>성적표 출력
            </h2>
            
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="flex items-center gap-4 mb-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-2">학생 검색</label>
                        <input type="text" id="report-student-search" 
                               placeholder="이름, 학번으로 검색..." 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div class="w-48">
                        <label class="block text-sm font-medium text-gray-700 mb-2">반 필터</label>
                        <select id="report-class-filter" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option value="">전체</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div id="report-student-list" class="bg-white rounded-lg shadow-md">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                    <p class="text-gray-600 mt-4">학생 목록을 불러오는 중...</p>
                </div>
            </div>
        </div>
    `;
    
    await loadReportStudentList();
    
    // 검색 및 필터 이벤트
    document.getElementById('report-student-search').addEventListener('input', filterReportStudents);
    document.getElementById('report-class-filter').addEventListener('change', filterReportStudents);
}

// 생활기록부 페이지 (학생 선택)
async function showRecordsPage(container) {
    container.innerHTML = `
        <div>
            <h2 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-file-alt mr-2"></i>생활기록부
            </h2>
            
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="flex items-center gap-4 mb-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-2">학생 검색</label>
                        <input type="text" id="record-student-search" 
                               placeholder="이름, 학번으로 검색..." 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div class="w-48">
                        <label class="block text-sm font-medium text-gray-700 mb-2">반 필터</label>
                        <select id="record-class-filter" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option value="">전체</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div id="record-student-list" class="bg-white rounded-lg shadow-md">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                    <p class="text-gray-600 mt-4">학생 목록을 불러오는 중...</p>
                </div>
            </div>
        </div>
    `;
    
    await loadRecordStudentList();
    
    // 검색 및 필터 이벤트
    document.getElementById('record-student-search').addEventListener('input', filterRecordStudents);
    document.getElementById('record-class-filter').addEventListener('change', filterRecordStudents);
}

// 성적표용 학생 목록 로드
let allReportStudents = [];
async function loadReportStudentList() {
    try {
        const [studentsRes, classesRes] = await Promise.all([
            axios.get('/api/students', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            axios.get('/api/classes', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
        ]);
        
        allReportStudents = studentsRes.data.students;
        
        // 반 필터 옵션 채우기
        const classFilter = document.getElementById('report-class-filter');
        classFilter.innerHTML = '<option value="">전체</option>' +
            classesRes.data.classes.map(cls => `
                <option value="${cls.id}">${cls.name}</option>
            `).join('');
        
        renderReportStudentList(allReportStudents);
    } catch (error) {
        console.error('학생 목록 로드 실패:', error);
        document.getElementById('report-student-list').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>학생 목록을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 생활기록부용 학생 목록 로드
let allRecordStudents = [];
async function loadRecordStudentList() {
    try {
        const [studentsRes, classesRes] = await Promise.all([
            axios.get('/api/students', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            axios.get('/api/classes', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
        ]);
        
        allRecordStudents = studentsRes.data.students;
        
        // 반 필터 옵션 채우기
        const classFilter = document.getElementById('record-class-filter');
        classFilter.innerHTML = '<option value="">전체</option>' +
            classesRes.data.classes.map(cls => `
                <option value="${cls.id}">${cls.name}</option>
            `).join('');
        
        renderRecordStudentList(allRecordStudents);
    } catch (error) {
        console.error('학생 목록 로드 실패:', error);
        document.getElementById('record-student-list').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>학생 목록을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 성적표 학생 목록 렌더링
function renderReportStudentList(students) {
    const container = document.getElementById('report-student-list');
    
    if (students.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-user-slash text-4xl mb-4"></i>
                <p>검색 결과가 없습니다.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학번</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학년</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">반</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${students.map(student => `
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${student.student_number}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${student.grade || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${student.class_name || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${student.phone || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <button onclick="showGradeReportPage(${student.id})" 
                                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none">
                                    <i class="fas fa-file-alt mr-1"></i>
                                    성적표 보기
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// 생활기록부 학생 목록 렌더링
function renderRecordStudentList(students) {
    const container = document.getElementById('record-student-list');
    
    if (students.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-user-slash text-4xl mb-4"></i>
                <p>검색 결과가 없습니다.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학번</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학년</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">반</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${students.map(student => `
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${student.student_number}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${student.grade || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${student.class_name || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${student.phone || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <button onclick="showLifeRecordPage(${student.id})" 
                                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none">
                                    <i class="fas fa-book mr-1"></i>
                                    생활기록부 보기
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// 성적표 학생 필터링
function filterReportStudents() {
    const searchText = document.getElementById('report-student-search').value.toLowerCase();
    const classFilter = document.getElementById('report-class-filter').value;
    
    const filtered = allReportStudents.filter(student => {
        const matchSearch = !searchText || 
            student.name.toLowerCase().includes(searchText) ||
            student.student_number.toLowerCase().includes(searchText);
        
        const matchClass = !classFilter || student.class_id == classFilter;
        
        return matchSearch && matchClass;
    });
    
    renderReportStudentList(filtered);
}

// 생활기록부 학생 필터링
function filterRecordStudents() {
    const searchText = document.getElementById('record-student-search').value.toLowerCase();
    const classFilter = document.getElementById('record-class-filter').value;
    
    const filtered = allRecordStudents.filter(student => {
        const matchSearch = !searchText || 
            student.name.toLowerCase().includes(searchText) ||
            student.student_number.toLowerCase().includes(searchText);
        
        const matchClass = !classFilter || student.class_id == classFilter;
        
        return matchSearch && matchClass;
    });
    
    renderRecordStudentList(filtered);
}

// ==================== 인쇄 전용 페이지 ====================

// 생활기록부 인쇄 페이지
function showPrintableLifeRecord(data) {
    const student = data.student;
    
    // 전체 페이지를 인쇄용 레이아웃으로 교체
    document.body.innerHTML = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>생활기록부 - ${student.name}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Malgun Gothic', sans-serif; 
                    background: white;
                    padding: 40px;
                    color: #000;
                }
                .document-container { 
                    max-width: 210mm; 
                    margin: 0 auto; 
                    background: white;
                    padding: 30px;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 3px solid #333;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 { 
                    font-size: 32px; 
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .header .school-name {
                    font-size: 18px;
                    color: #666;
                    margin-top: 5px;
                }
                .section { 
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                }
                .section-title { 
                    font-size: 20px; 
                    font-weight: bold;
                    background: #f0f0f0;
                    padding: 10px 15px;
                    border-left: 5px solid #4A5568;
                    margin-bottom: 15px;
                }
                .info-grid { 
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 15px;
                }
                .info-item {
                    border-bottom: 1px solid #ddd;
                    padding: 8px 0;
                }
                .info-label { 
                    font-size: 12px; 
                    color: #666;
                    margin-bottom: 3px;
                }
                .info-value { 
                    font-size: 15px; 
                    font-weight: 500;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                th, td { 
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                    font-size: 13px;
                }
                th { 
                    background: #f5f5f5;
                    font-weight: bold;
                }
                .text-center { text-align: center; }
                .badge {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-size: 11px;
                    font-weight: 500;
                }
                .badge-green { background: #d4edda; color: #155724; }
                .badge-blue { background: #d1ecf1; color: #0c5460; }
                .badge-yellow { background: #fff3cd; color: #856404; }
                .badge-red { background: #f8d7da; color: #721c24; }
                .footer {
                    margin-top: 50px;
                    text-align: right;
                    padding-top: 20px;
                    border-top: 2px solid #333;
                }
                .print-buttons {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 1000;
                }
                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                }
                .btn-primary { background: #4299e1; color: white; }
                .btn-secondary { background: #718096; color: white; }
                .btn:hover { opacity: 0.9; }
                @media print {
                    body { padding: 0; }
                    .print-buttons { display: none; }
                    .document-container { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="print-buttons">
                <button class="btn btn-secondary" onclick="location.reload()">
                    ← 돌아가기
                </button>
                <button class="btn btn-primary" onclick="window.print()">
                    🖨️ 인쇄/PDF
                </button>
            </div>
            
            <div class="document-container">
                <div class="header">
                    <h1>학생 생활기록부</h1>
                    <div class="school-name">대안학교</div>
                </div>
                
                <!-- 학생 기본 정보 -->
                <div class="section">
                    <div class="section-title">학생 기본 정보</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">이름</div>
                            <div class="info-value">${student.name}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">학번</div>
                            <div class="info-value">${student.student_number}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">생년월일</div>
                            <div class="info-value">${student.birthdate || '-'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">성별</div>
                            <div class="info-value">${student.gender === 'male' ? '남' : student.gender === 'female' ? '여' : '-'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">입학일</div>
                            <div class="info-value">${student.admission_date || '-'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">연락처</div>
                            <div class="info-value">${student.phone || '-'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">이메일</div>
                            <div class="info-value">${student.email || '-'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">주소</div>
                            <div class="info-value">${student.address || '-'}</div>
                        </div>
                    </div>
                </div>
                
                <!-- 반 배정 이력 -->
                ${data.classHistory && data.classHistory.length > 0 ? `
                <div class="section">
                    <div class="section-title">반 배정 이력</div>
                    <table>
                        <thead>
                            <tr>
                                <th class="text-center">학기</th>
                                <th class="text-center">반</th>
                                <th class="text-center">담임교사</th>
                                <th class="text-center">배정일</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.classHistory.map(history => `
                                <tr>
                                    <td class="text-center">${history.semester_name}</td>
                                    <td class="text-center">${history.class_name}</td>
                                    <td class="text-center">${history.teacher_name || '-'}</td>
                                    <td class="text-center">${history.assignment_date || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
                
                <!-- 출석 현황 -->
                ${data.attendanceStats && data.attendanceStats.length > 0 ? `
                <div class="section">
                    <div class="section-title">출석 현황</div>
                    <table>
                        <thead>
                            <tr>
                                <th class="text-center">학기</th>
                                <th class="text-center">수업일수</th>
                                <th class="text-center">출석</th>
                                <th class="text-center">결석</th>
                                <th class="text-center">지각</th>
                                <th class="text-center">출석률</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.attendanceStats.map(stat => `
                                <tr>
                                    <td class="text-center">${stat.semester_name}</td>
                                    <td class="text-center">${stat.total_days || 0}</td>
                                    <td class="text-center">${stat.present_days || 0}</td>
                                    <td class="text-center">${stat.absent_days || 0}</td>
                                    <td class="text-center">${stat.late_days || 0}</td>
                                    <td class="text-center">${stat.attendance_rate || 0}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
                
                <!-- 성적 기록 -->
                ${data.grades && data.grades.length > 0 ? `
                <div class="section">
                    <div class="section-title">성적 기록</div>
                    <table>
                        <thead>
                            <tr>
                                <th class="text-center">학기</th>
                                <th>과목명</th>
                                <th class="text-center">학점</th>
                                <th class="text-center">점수</th>
                                <th class="text-center">등급</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.grades.map(grade => `
                                <tr>
                                    <td class="text-center">${grade.semester_name}</td>
                                    <td>${grade.subject_name}</td>
                                    <td class="text-center">${grade.credits || '-'}</td>
                                    <td class="text-center">${grade.final_score || '-'}</td>
                                    <td class="text-center">${grade.letter_grade || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
                
                <!-- 봉사활동 -->
                ${data.volunteerActivities && data.volunteerActivities.length > 0 ? `
                <div class="section">
                    <div class="section-title">봉사활동</div>
                    <table>
                        <thead>
                            <tr>
                                <th>활동명</th>
                                <th>기관</th>
                                <th class="text-center">시간</th>
                                <th class="text-center">날짜</th>
                                <th class="text-center">승인상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.volunteerActivities.map(activity => `
                                <tr>
                                    <td>${activity.activity_name}</td>
                                    <td>${activity.organization}</td>
                                    <td class="text-center">${activity.hours}시간</td>
                                    <td class="text-center">${activity.activity_date}</td>
                                    <td class="text-center">
                                        <span class="badge ${activity.approval_status === 'approved' ? 'badge-green' : 'badge-yellow'}">
                                            ${activity.approval_status === 'approved' ? '승인' : '대기'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
                
                <!-- 동아리 활동 -->
                ${data.clubActivities && data.clubActivities.length > 0 ? `
                <div class="section">
                    <div class="section-title">동아리 활동</div>
                    <table>
                        <thead>
                            <tr>
                                <th>동아리명</th>
                                <th class="text-center">가입일</th>
                                <th class="text-center">활동 횟수</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.clubActivities.map(club => `
                                <tr>
                                    <td>${club.club_name}</td>
                                    <td class="text-center">${club.joined_date}</td>
                                    <td class="text-center">${club.activity_count || 0}회</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
                
                <div class="footer">
                    <p>발행일: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p style="margin-top: 10px; font-size: 18px; font-weight: bold;">대안학교</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// 성적표 인쇄 페이지
function showPrintableGradeReport(data) {
    const student = data.student;
    const semester = data.semester;
    const summary = data.summary;
    
    // 전체 페이지를 인쇄용 레이아웃으로 교체
    document.body.innerHTML = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>성적표 - ${student.name}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Malgun Gothic', sans-serif; 
                    background: white;
                    padding: 40px;
                    color: #000;
                }
                .document-container { 
                    max-width: 210mm; 
                    margin: 0 auto; 
                    background: white;
                    padding: 30px;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 3px solid #333;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 { 
                    font-size: 32px; 
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .header .semester-info {
                    font-size: 18px;
                    color: #666;
                    margin-top: 5px;
                }
                .student-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    padding: 15px;
                    background: #f9f9f9;
                    border-left: 5px solid #4A5568;
                }
                .student-info-item {
                    font-size: 15px;
                }
                .student-info-label {
                    color: #666;
                    margin-right: 10px;
                }
                .section { 
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                }
                .section-title { 
                    font-size: 20px; 
                    font-weight: bold;
                    background: #f0f0f0;
                    padding: 10px 15px;
                    border-left: 5px solid #4A5568;
                    margin-bottom: 15px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                th, td { 
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                    font-size: 13px;
                }
                th { 
                    background: #f5f5f5;
                    font-weight: bold;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 10px;
                    margin: 20px 0;
                }
                .summary-item {
                    text-align: center;
                    padding: 15px;
                    background: #f9f9f9;
                    border-radius: 5px;
                }
                .summary-label {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 5px;
                }
                .summary-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #333;
                }
                .footer {
                    margin-top: 50px;
                    text-align: right;
                    padding-top: 20px;
                    border-top: 2px solid #333;
                }
                .print-buttons {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 1000;
                }
                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                }
                .btn-primary { background: #4299e1; color: white; }
                .btn-secondary { background: #718096; color: white; }
                .btn:hover { opacity: 0.9; }
                @media print {
                    body { padding: 0; }
                    .print-buttons { display: none; }
                    .document-container { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="print-buttons">
                <button class="btn btn-secondary" onclick="location.reload()">
                    ← 돌아가기
                </button>
                <button class="btn btn-primary" onclick="window.print()">
                    🖨️ 인쇄/PDF
                </button>
            </div>
            
            <div class="document-container">
                <div class="header">
                    <h1>성적표</h1>
                    <div class="semester-info">${semester.name}</div>
                </div>
                
                <div class="student-info">
                    <div class="student-info-item">
                        <span class="student-info-label">학번:</span>
                        <strong>${student.student_number}</strong>
                    </div>
                    <div class="student-info-item">
                        <span class="student-info-label">이름:</span>
                        <strong>${student.name}</strong>
                    </div>
                    <div class="student-info-item">
                        <span class="student-info-label">학년:</span>
                        <strong>${student.grade || '-'}학년</strong>
                    </div>
                    <div class="student-info-item">
                        <span class="student-info-label">반:</span>
                        <strong>${student.class_name || '-'}</strong>
                    </div>
                </div>
                
                <!-- 과목별 성적 -->
                <div class="section">
                    <div class="section-title">과목별 성적</div>
                    <table>
                        <thead>
                            <tr>
                                <th class="text-center">과목코드</th>
                                <th>과목명</th>
                                <th class="text-center">학점</th>
                                <th class="text-center">점수</th>
                                <th class="text-center">등급</th>
                                <th class="text-center">과목유형</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.subjectGrades && data.subjectGrades.length > 0 ? data.subjectGrades.map(grade => `
                                <tr>
                                    <td class="text-center">${grade.subject_code}</td>
                                    <td>${grade.subject_name}</td>
                                    <td class="text-center">${grade.credits}</td>
                                    <td class="text-center"><strong>${grade.final_score || '-'}</strong></td>
                                    <td class="text-center"><strong>${grade.letter_grade || '-'}</strong></td>
                                    <td class="text-center">${grade.subject_type === 'required' ? '필수' : '선택'}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="6" class="text-center">성적 데이터가 없습니다.</td></tr>'}
                            ${data.subjectGrades && data.subjectGrades.length > 0 ? `
                            <tr style="background: #f9f9f9; font-weight: bold;">
                                <td colspan="2" class="text-right">합계</td>
                                <td class="text-center">${summary.totalCredits}</td>
                                <td class="text-center" style="color: #4299e1;">${summary.averageScore}</td>
                                <td colspan="2"></td>
                            </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
                
                <!-- 출석 현황 -->
                ${data.attendanceStats ? `
                <div class="section">
                    <div class="section-title">출석 현황</div>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-label">수업일수</div>
                            <div class="summary-value">${data.attendanceStats.total_days || 0}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">출석</div>
                            <div class="summary-value" style="color: #48bb78;">${data.attendanceStats.present_days || 0}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">결석</div>
                            <div class="summary-value" style="color: #f56565;">${data.attendanceStats.absent_days || 0}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">지각</div>
                            <div class="summary-value" style="color: #ed8936;">${data.attendanceStats.late_days || 0}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">출석률</div>
                            <div class="summary-value" style="color: #4299e1;">${summary.attendanceRate || 0}%</div>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <!-- 세부 성적 -->
                ${data.detailedGrades && data.detailedGrades.length > 0 ? `
                <div class="section">
                    <div class="section-title">세부 성적 (시험별)</div>
                    <table>
                        <thead>
                            <tr>
                                <th>과목명</th>
                                <th class="text-center">평가유형</th>
                                <th class="text-center">점수</th>
                                <th class="text-center">배점</th>
                                <th class="text-center">반영비율</th>
                                <th class="text-center">시험일</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.detailedGrades.map(grade => `
                                <tr>
                                    <td>${grade.subject_name}</td>
                                    <td class="text-center">${getExamTypeText(grade.exam_type)}</td>
                                    <td class="text-center"><strong>${grade.score}</strong></td>
                                    <td class="text-center">${grade.max_score}</td>
                                    <td class="text-center">${(grade.weight * 100).toFixed(0)}%</td>
                                    <td class="text-center">${grade.exam_date || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
                
                <div class="footer">
                    <p>발행일: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p style="margin-top: 10px; font-size: 18px; font-weight: bold;">대안학교</p>
                </div>
            </div>
            
            <script>
                function getExamTypeText(type) {
                    const texts = {
                        'midterm': '중간고사',
                        'final': '기말고사',
                        'assignment': '과제',
                        'quiz': '퀴즈',
                        'project': '프로젝트'
                    };
                    return texts[type] || type;
                }
            </script>
        </body>
        </html>
    `;
}
