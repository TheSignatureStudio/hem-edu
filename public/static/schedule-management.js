// 시간표 관리 함수들

// 시간표 로드 및 표시
async function loadClassSchedule(classId) {
    try {
        const [scheduleRes, coursesRes] = await Promise.all([
            axios.get(`/api/schedules/weekly/${classId}`, { 
                headers: { 'Authorization': 'Bearer ' + authToken } 
            }),
            axios.get(`/api/courses?class_id=${classId}`, { 
                headers: { 'Authorization': 'Bearer ' + authToken } 
            })
        ]);
        
        const schedule = scheduleRes.data.schedule;
        const courses = coursesRes.data.courses || [];
        
        const container = document.getElementById('class-schedule-view');
        
        container.innerHTML = `
            <div class="mb-6">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <button onclick="editScheduleMode(${classId})" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            <i class="fas fa-edit mr-2"></i>시간표 편집
                        </button>
                        <button onclick="manageCourses(${classId})" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2">
                            <i class="fas fa-book mr-2"></i>수업 관리
                        </button>
                    </div>
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-info-circle mr-1"></i>
                        등록된 수업: ${courses.length}개
                    </div>
                </div>
            </div>
            
            <!-- 시간표 그리드 -->
            <div class="overflow-x-auto">
                <table class="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="border border-gray-300 px-4 py-3 text-center w-20">교시</th>
                            <th class="border border-gray-300 px-4 py-3 text-center">월</th>
                            <th class="border border-gray-300 px-4 py-3 text-center">화</th>
                            <th class="border border-gray-300 px-4 py-3 text-center">수</th>
                            <th class="border border-gray-300 px-4 py-3 text-center">목</th>
                            <th class="border border-gray-300 px-4 py-3 text-center">금</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${[1, 2, 3, 4, 5, 6, 7].map(period => `
                            <tr>
                                <td class="border border-gray-300 px-4 py-3 text-center font-semibold bg-gray-50">
                                    ${period}교시
                                </td>
                                ${['월', '화', '수', '목', '금'].map(day => {
                                    const slot = schedule[day]?.[period];
                                    if (slot) {
                                        return `
                                            <td class="border border-gray-300 px-4 py-3 text-center hover:bg-gray-50 cursor-pointer"
                                                onclick="viewScheduleDetail(${slot.id})">
                                                <div class="font-medium text-gray-900">${slot.subject_name}</div>
                                                <div class="text-xs text-gray-500 mt-1">${slot.teacher_name || '-'}</div>
                                                ${slot.room_number ? `<div class="text-xs text-gray-400 mt-1">${slot.room_number}</div>` : ''}
                                            </td>
                                        `;
                                    } else {
                                        return `
                                            <td class="border border-gray-300 px-4 py-3 text-center text-gray-300">
                                                -
                                            </td>
                                        `;
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
        document.getElementById('class-schedule-view').innerHTML = 
            '<p class="text-red-500 text-center py-8">시간표를 불러오는데 실패했습니다</p>';
    }
}

// 시간표 편집 모드
async function editScheduleMode(classId) {
    try {
        const [scheduleRes, coursesRes] = await Promise.all([
            axios.get(`/api/schedules/weekly/${classId}`, { 
                headers: { 'Authorization': 'Bearer ' + authToken } 
            }),
            axios.get(`/api/courses?class_id=${classId}`, { 
                headers: { 'Authorization': 'Bearer ' + authToken } 
            })
        ]);
        
        const schedule = scheduleRes.data.schedule;
        const courses = coursesRes.data.courses || [];
        
        const modal = document.createElement('div');
        modal.id = 'schedule-edit-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 my-8">
                <div class="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 class="text-2xl font-bold text-gray-800">시간표 편집</h2>
                    <button onclick="closeScheduleEditModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <div class="p-6">
                    <!-- 수업 목록 -->
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-3">사용 가능한 수업</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4" id="course-chips">
                            ${courses.map(course => `
                                <div class="border-2 border-blue-200 bg-blue-50 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition"
                                     data-course-id="${course.id}"
                                     data-course-name="${course.subject_name}"
                                     data-teacher-name="${course.teacher_name || '-'}"
                                     onclick="selectCourseForSchedule(this)">
                                    <div class="font-medium text-sm text-gray-900">${course.subject_name}</div>
                                    <div class="text-xs text-gray-600 mt-1">${course.teacher_name || '-'}</div>
                                </div>
                            `).join('')}
                        </div>
                        ${courses.length === 0 ? `
                            <p class="text-gray-500 text-center py-4">
                                등록된 수업이 없습니다. 먼저 수업을 등록해주세요.
                            </p>
                        ` : ''}
                        <p class="text-sm text-gray-600 mt-2">
                            <i class="fas fa-info-circle mr-1"></i>
                            수업을 선택한 후 시간표 칸을 클릭하세요
                        </p>
                    </div>
                    
                    <!-- 시간표 그리드 (편집 가능) -->
                    <div class="overflow-x-auto">
                        <table class="min-w-full border-collapse border border-gray-300">
                            <thead>
                                <tr class="bg-gray-100">
                                    <th class="border border-gray-300 px-4 py-3 text-center w-20">교시</th>
                                    <th class="border border-gray-300 px-4 py-3 text-center">월</th>
                                    <th class="border border-gray-300 px-4 py-3 text-center">화</th>
                                    <th class="border border-gray-300 px-4 py-3 text-center">수</th>
                                    <th class="border border-gray-300 px-4 py-3 text-center">목</th>
                                    <th class="border border-gray-300 px-4 py-3 text-center">금</th>
                                </tr>
                            </thead>
                            <tbody id="schedule-edit-grid">
                                ${[1, 2, 3, 4, 5, 6, 7].map(period => `
                                    <tr>
                                        <td class="border border-gray-300 px-4 py-3 text-center font-semibold bg-gray-50">
                                            ${period}교시
                                        </td>
                                        ${['월', '화', '수', '목', '금'].map(day => {
                                            const slot = schedule[day]?.[period];
                                            return `
                                                <td class="border border-gray-300 px-2 py-2 text-center hover:bg-blue-50 cursor-pointer schedule-slot"
                                                    data-day="${day}"
                                                    data-period="${period}"
                                                    data-class-id="${classId}"
                                                    onclick="fillScheduleSlot(this)">
                                                    <div class="schedule-slot-content min-h-[60px] flex flex-col justify-center">
                                                        ${slot ? `
                                                            <div class="font-medium text-sm">${slot.subject_name}</div>
                                                            <div class="text-xs text-gray-500 mt-1">${slot.teacher_name || '-'}</div>
                                                            <button onclick="event.stopPropagation(); clearScheduleSlot('${day}', ${period}, ${classId})" 
                                                                    class="text-xs text-red-600 hover:text-red-800 mt-1">
                                                                <i class="fas fa-times"></i> 삭제
                                                            </button>
                                                        ` : `
                                                            <div class="text-gray-300">비어있음</div>
                                                        `}
                                                    </div>
                                                </td>
                                            `;
                                        }).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 p-6 border-t border-gray-200">
                    <button onclick="closeScheduleEditModal()" 
                            class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        닫기
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        window.selectedCourseForSchedule = null;
        
    } catch (error) {
        console.error('시간표 편집 모드 실행 실패:', error);
        alert('시간표 편집 모드를 열 수 없습니다');
    }
}

// 시간표 편집 모달 닫기
function closeScheduleEditModal() {
    const modal = document.getElementById('schedule-edit-modal');
    if (modal) {
        modal.remove();
    }
    // 시간표 새로고침
    if (window.currentClassId) {
        loadClassSchedule(window.currentClassId);
    }
}

// 수업 선택
function selectCourseForSchedule(element) {
    // 기존 선택 해제
    document.querySelectorAll('#course-chips > div').forEach(chip => {
        chip.classList.remove('border-blue-600', 'bg-blue-200');
        chip.classList.add('border-blue-200', 'bg-blue-50');
    });
    
    // 새 선택
    element.classList.remove('border-blue-200', 'bg-blue-50');
    element.classList.add('border-blue-600', 'bg-blue-200');
    
    window.selectedCourseForSchedule = {
        id: element.dataset.courseId,
        name: element.dataset.courseName,
        teacher: element.dataset.teacherName
    };
}

// 시간표 칸 채우기
async function fillScheduleSlot(slotElement) {
    if (!window.selectedCourseForSchedule) {
        alert('먼저 수업을 선택하세요');
        return;
    }
    
    const day = slotElement.dataset.day;
    const period = parseInt(slotElement.dataset.period);
    const classId = parseInt(slotElement.dataset.classId);
    const courseId = parseInt(window.selectedCourseForSchedule.id);
    
    try {
        await axios.post('/api/schedules', {
            class_id: classId,
            course_id: courseId,
            day_of_week: day,
            period: period
        }, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        // UI 업데이트
        slotElement.querySelector('.schedule-slot-content').innerHTML = `
            <div class="font-medium text-sm">${window.selectedCourseForSchedule.name}</div>
            <div class="text-xs text-gray-500 mt-1">${window.selectedCourseForSchedule.teacher}</div>
            <button onclick="event.stopPropagation(); clearScheduleSlot('${day}', ${period}, ${classId})" 
                    class="text-xs text-red-600 hover:text-red-800 mt-1">
                <i class="fas fa-times"></i> 삭제
            </button>
        `;
        
    } catch (error) {
        console.error('시간표 저장 실패:', error);
        alert('시간표 저장에 실패했습니다');
    }
}

// 시간표 칸 비우기
async function clearScheduleSlot(day, period, classId) {
    if (!confirm('이 시간표 항목을 삭제하시겠습니까?')) return;
    
    try {
        await axios.delete(`/api/schedules/slot/${classId}/${day}/${period}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        // UI 업데이트
        const slot = document.querySelector(`[data-day="${day}"][data-period="${period}"]`);
        if (slot) {
            slot.querySelector('.schedule-slot-content').innerHTML = '<div class="text-gray-300">비어있음</div>';
        }
        
    } catch (error) {
        console.error('시간표 삭제 실패:', error);
        alert('시간표 삭제에 실패했습니다');
    }
}

// 수업 관리 모달
async function manageCourses(classId) {
    try {
        const [coursesRes, subjectsRes, teachersRes, classRes] = await Promise.all([
            axios.get(`/api/courses?class_id=${classId}`, { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/subjects', { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/users?role=teacher', { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get(`/api/classes/${classId}`, { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const courses = coursesRes.data.courses || [];
        let subjects = subjectsRes.data.subjects || [];
        const teachers = teachersRes.data.users || [];
        const classInfo = classRes.data;
        
        // 교사인 경우 자신의 전공 과목만 필터링
        let currentTeacher = null;
        let filteredSubjects = subjects;
        let isTeacher = false;
        
        if (currentUser && currentUser.role === 'teacher' && window.currentTeacher) {
            isTeacher = true;
            currentTeacher = window.currentTeacher;
            // 교사의 전공(subject)과 일치하는 과목만 필터링
            if (currentTeacher.subject) {
                filteredSubjects = subjects.filter(s => s.name === currentTeacher.subject);
            }
        }
        
        const modal = document.createElement('div');
        modal.id = 'courses-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 my-8">
                <div class="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 class="text-2xl font-bold text-gray-800">${classInfo.name} 수업 관리</h2>
                    <button onclick="closeCoursesModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">등록된 수업 (${courses.length})</h3>
                        <button onclick="showAddCourseForm(${classId})" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            <i class="fas fa-plus mr-2"></i>수업 추가
                        </button>
                    </div>
                    
                    <div id="courses-list">
                        ${courses.length === 0 ? `
                            <p class="text-gray-500 text-center py-8">등록된 수업이 없습니다</p>
                        ` : `
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">과목명</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">교사</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학점</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${courses.map(course => `
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${course.subject_name}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm">${course.teacher_name || '-'}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm">${course.credits || '-'}학점</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                                <button onclick="deleteCourse(${course.id})" class="text-red-600 hover:text-red-800">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        `}
                    </div>
                    
                    <!-- 수업 추가 폼 (숨김) -->
                    <div id="add-course-form" class="hidden mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h4 class="font-semibold mb-4">새 수업 추가</h4>
                        <form id="course-form" class="space-y-4">
                            <input type="hidden" name="class_id" value="${classId}">
                            <input type="hidden" name="semester_id" value="${classInfo.semester_id}">
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">과목 *</label>
                                <select name="subject_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" ${isTeacher ? 'disabled' : ''}>
                                    <option value="">선택하세요</option>
                                    ${filteredSubjects.filter(s => !s.grade || s.grade == classInfo.grade).map(subject => `
                                        <option value="${subject.id}">${subject.name} (${subject.code})</option>
                                    `).join('')}
                                </select>
                                ${isTeacher ? `<input type="hidden" name="subject_id" value="${filteredSubjects.length > 0 ? filteredSubjects[0].id : ''}">` : ''}
                                ${isTeacher && filteredSubjects.length === 0 ? `
                                    <p class="text-sm text-red-600 mt-1">전공 과목이 등록되지 않았습니다. 관리자에게 문의하세요.</p>
                                ` : ''}
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">담당 교사 *</label>
                                <select name="teacher_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" ${isTeacher ? 'disabled' : ''}>
                                    <option value="">선택하세요</option>
                                    ${teachers.map(teacher => {
                                        // teacher_id는 teachers 테이블의 id
                                        const teacherId = teacher.teacher_id;
                                        if (!teacherId) return ''; // teacher_id가 없으면 스킵
                                        const isCurrentTeacher = isTeacher && currentTeacher && teacherId == currentTeacher.id;
                                        return `<option value="${teacherId}" ${isCurrentTeacher ? 'selected' : ''}>${teacher.name}</option>`;
                                    }).filter(opt => opt).join('')}
                                </select>
                                ${isTeacher && currentTeacher ? `<input type="hidden" name="teacher_id" value="${currentTeacher.id}">` : ''}
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">수업명 *</label>
                                <input type="text" name="course_name" required 
                                       placeholder="예: 국어 (1반)"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            
                            <div class="flex justify-end space-x-3">
                                <button type="button" onclick="hideAddCourseForm()" 
                                        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                                    취소
                                </button>
                                <button type="submit" 
                                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    추가
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 폼 제출 처리
        document.getElementById('course-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitCourseForm(e.target, classId);
        });
        
    } catch (error) {
        console.error('수업 관리 모달 열기 실패:', error);
        alert('수업 관리를 열 수 없습니다');
    }
}

function closeCoursesModal() {
    const modal = document.getElementById('courses-modal');
    if (modal) {
        modal.remove();
    }
}

function showAddCourseForm(classId) {
    document.getElementById('add-course-form').classList.remove('hidden');
}

function hideAddCourseForm() {
    document.getElementById('add-course-form').classList.add('hidden');
}

async function submitCourseForm(form, classId) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        await axios.post('/api/courses', data, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('수업이 추가되었습니다');
        closeCoursesModal();
        manageCourses(classId); // 새로고침
        
    } catch (error) {
        console.error('수업 추가 실패:', error);
        alert('수업 추가에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}

async function deleteCourse(courseId) {
    if (!confirm('이 수업을 삭제하시겠습니까? 시간표에서도 제거됩니다.')) return;
    
    try {
        await axios.delete(`/api/courses/${courseId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('수업이 삭제되었습니다');
        // 모달 새로고침
        const modal = document.getElementById('courses-modal');
        if (modal) {
            closeCoursesModal();
            manageCourses(window.currentClassId);
        }
        
    } catch (error) {
        console.error('수업 삭제 실패:', error);
        alert('수업 삭제에 실패했습니다');
    }
}

function viewScheduleDetail(scheduleId) {
    // 추후 구현: 시간표 항목 상세 정보 표시
    console.log('View schedule detail:', scheduleId);
}
