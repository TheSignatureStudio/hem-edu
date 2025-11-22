// 교사 및 담임 배정 관리

// 담임 배정 관리 페이지
async function showHomeroomAssignmentManagement() {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-user-tie mr-2"></i>담임 교사 배정 관리
                    </h2>
                    <p class="text-gray-600 mt-2">학기별 반 담임 교사를 배정하고 관리합니다</p>
                </div>
            </div>
            
            <!-- 학기 선택 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">학기 선택</label>
                        <select id="homeroom-semester-select" onchange="loadHomeroomAssignments()" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">학기를 선택하세요</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="loadHomeroomAssignments()" 
                                class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-sync-alt mr-2"></i>조회
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- 담임 배정 목록 -->
            <div id="homeroom-list" class="bg-white rounded-lg shadow-md p-6">
                <div class="text-center py-8">
                    <i class="fas fa-info-circle text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">학기를 선택하세요.</p>
                </div>
            </div>
        </div>
    `;
    
    // 학기 목록 로드
    await loadSemestersForHomeroom();
}

// 학기 목록 로드
async function loadSemestersForHomeroom() {
    try {
        const response = await axios.get('/api/semesters', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const semesters = response.data.semesters;
        const select = document.getElementById('homeroom-semester-select');
        
        select.innerHTML = '<option value="">학기를 선택하세요</option>' +
            semesters.map(s => 
                `<option value="${s.id}" ${s.is_active ? 'selected' : ''}>${s.name} (${s.year}년 ${s.semester}학기)</option>`
            ).join('');
        
        // 활성 학기가 있으면 자동 로드
        const activeSemester = semesters.find(s => s.is_active);
        if (activeSemester) {
            loadHomeroomAssignments();
        }
    } catch (error) {
        console.error('학기 목록 로드 실패:', error);
    }
}

// 담임 배정 목록 로드
async function loadHomeroomAssignments() {
    const semesterId = document.getElementById('homeroom-semester-select').value;
    const listContainer = document.getElementById('homeroom-list');
    
    if (!semesterId) {
        listContainer.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-info-circle text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600">학기를 선택하세요.</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            <p class="text-gray-600 mt-2">로딩 중...</p>
        </div>
    `;
    
    try {
        // 반 목록과 담임 배정 정보 가져오기
        const [classesResponse, teachersResponse, homeroomResponse] = await Promise.all([
            axios.get(`/api/classes?semester_id=${semesterId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            axios.get('/api/users?role=teacher', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            axios.get(`/api/teacher-homeroom?semester_id=${semesterId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
        ]);
        
        const classes = classesResponse.data.classes;
        const teachers = teachersResponse.data.users;
        const homeroomAssignments = homeroomResponse.data.homeroom_assignments;
        
        if (!classes || classes.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">이 학기에 등록된 반이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        // 담임 배정 맵 생성
        const homeroomMap = {};
        homeroomAssignments.forEach(h => {
            homeroomMap[h.class_id] = h;
        });
        
        listContainer.innerHTML = `
            <div class="mb-4 flex justify-between items-center">
                <h3 class="text-xl font-bold text-gray-800">반별 담임 교사 배정</h3>
                <p class="text-sm text-gray-600">총 ${classes.length}개 반</p>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">반 이름</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학년</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">교실</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">담임 교사</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${classes.map(cls => {
                            const homeroom = homeroomMap[cls.id];
                            return `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        ${cls.name}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        ${cls.grade}학년
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        ${cls.classroom || '-'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        ${homeroom ? 
                                            `<span class="text-green-700 font-medium">
                                                <i class="fas fa-check-circle mr-1"></i>${homeroom.teacher_name}
                                            </span>` : 
                                            `<span class="text-red-600">미배정</span>`
                                        }
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        ${homeroom ?
                                            `<button onclick="changeHomeroomTeacher(${cls.id}, ${homeroom.id}, '${cls.name}')" 
                                                     class="text-blue-600 hover:text-blue-800 mr-3">
                                                <i class="fas fa-edit"></i> 변경
                                            </button>
                                            <button onclick="removeHomeroomTeacher(${homeroom.id}, '${cls.name}')" 
                                                    class="text-red-600 hover:text-red-800">
                                                <i class="fas fa-times"></i> 해제
                                            </button>` :
                                            `<button onclick="assignHomeroomTeacher(${cls.id}, '${cls.name}')" 
                                                     class="text-green-600 hover:text-green-800">
                                                <i class="fas fa-plus"></i> 배정
                                            </button>`
                                        }
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('담임 배정 목록 로드 실패:', error);
        listContainer.innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>담임 배정 목록을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 담임 교사 배정
async function assignHomeroomTeacher(classId, className) {
    const semesterId = document.getElementById('homeroom-semester-select').value;
    
    try {
        // 교사 목록 가져오기
        const teachersResponse = await axios.get('/api/users?role=teacher', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const teachers = teachersResponse.data.users.filter(t => t.teacher_id != null);
        
        if (teachers.length === 0) {
            alert('담임 배정 가능한 교사가 없습니다. 교사 정보를 먼저 등록해주세요.');
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'assign-homeroom-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h3 class="text-2xl font-bold mb-6 text-gray-800">
                    <i class="fas fa-user-plus mr-2"></i>담임 교사 배정
                </h3>
                <p class="text-gray-600 mb-4">반: <span class="font-semibold">${className}</span></p>
                
                <form id="assign-homeroom-form">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">교사 선택 *</label>
                        <select id="teacher-select" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">교사를 선택하세요</option>
                            ${teachers.map(t => `<option value="${t.teacher_id}">${t.name} (${t.username})</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="flex justify-end space-x-3">
                        <button type="button" onclick="document.getElementById('assign-homeroom-modal').remove()"
                                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            취소
                        </button>
                        <button type="submit"
                                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            배정
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('assign-homeroom-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const teacherId = document.getElementById('teacher-select').value;
            
            try {
                await axios.post('/api/teacher-homeroom', {
                    teacher_id: teacherId,
                    class_id: classId,
                    semester_id: semesterId
                }, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                
                alert('담임 교사가 배정되었습니다.');
                modal.remove();
                loadHomeroomAssignments();
            } catch (error) {
                console.error('담임 배정 실패:', error);
                alert(error.response?.data?.message || '담임 배정에 실패했습니다.');
            }
        });
    } catch (error) {
        console.error('교사 목록 로드 실패:', error);
        alert('교사 목록을 불러오는데 실패했습니다.');
    }
}

// 담임 교사 변경
async function changeHomeroomTeacher(classId, homeroomId, className) {
    const semesterId = document.getElementById('homeroom-semester-select').value;
    
    try {
        const teachersResponse = await axios.get('/api/users?role=teacher', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const teachers = teachersResponse.data.users.filter(t => t.teacher_id != null);
        
        if (teachers.length === 0) {
            alert('담임 배정 가능한 교사가 없습니다. 교사 정보를 먼저 등록해주세요.');
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'change-homeroom-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h3 class="text-2xl font-bold mb-6 text-gray-800">
                    <i class="fas fa-exchange-alt mr-2"></i>담임 교사 변경
                </h3>
                <p class="text-gray-600 mb-4">반: <span class="font-semibold">${className}</span></p>
                
                <form id="change-homeroom-form">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">새 담임 교사 *</label>
                        <select id="new-teacher-select" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">교사를 선택하세요</option>
                            ${teachers.map(t => `<option value="${t.teacher_id}">${t.name} (${t.username})</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="flex justify-end space-x-3">
                        <button type="button" onclick="document.getElementById('change-homeroom-modal').remove()"
                                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            취소
                        </button>
                        <button type="submit"
                                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            변경
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('change-homeroom-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newTeacherId = document.getElementById('new-teacher-select').value;
            
            try {
                await axios.put(`/api/teacher-homeroom/${homeroomId}`, {
                    teacher_id: newTeacherId
                }, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                
                alert('담임 교사가 변경되었습니다.');
                modal.remove();
                loadHomeroomAssignments();
            } catch (error) {
                console.error('담임 변경 실패:', error);
                alert('담임 변경에 실패했습니다.');
            }
        });
    } catch (error) {
        console.error('교사 목록 로드 실패:', error);
        alert('교사 목록을 불러오는데 실패했습니다.');
    }
}

// 담임 교사 해제
async function removeHomeroomTeacher(homeroomId, className) {
    if (!confirm(`${className}의 담임 교사 배정을 해제하시겠습니까?`)) {
        return;
    }
    
    try {
        await axios.delete(`/api/teacher-homeroom/${homeroomId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        alert('담임 교사 배정이 해제되었습니다.');
        loadHomeroomAssignments();
    } catch (error) {
        console.error('담임 해제 실패:', error);
        alert('담임 해제에 실패했습니다.');
    }
}
