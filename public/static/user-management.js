// ============================================
// 사용자(교사) 관리 페이지
// ============================================

// HTML 이스케이프 헬퍼
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 사용자 관리 메인 페이지
async function showUserManagement(container) {
    try {
        const response = await axios.get('/api/users?limit=1000', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const users = response.data.users;
        
        // 전역 변수에 저장
        window.allUsers = users;
        window.filteredUsers = users;
        
        container.innerHTML = `
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-8">사용자 관리</h1>
                
                <!-- 학생 등록 안내 -->
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div class="flex items-start">
                        <i class="fas fa-info-circle text-yellow-600 mr-3 mt-0.5"></i>
                        <div class="flex-1">
                            <h3 class="font-semibold text-yellow-900 mb-1">학생 등록 안내</h3>
                            <p class="text-sm text-yellow-800 mb-2">
                                학생 계정은 이 페이지에서 생성할 수 없습니다. 학생은 <strong>"학생 관리"</strong> 메뉴에서 등록해주세요.
                            </p>
                            <button onclick="navigateToPage('students')" class="text-sm bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 font-medium">
                                <i class="fas fa-user-graduate mr-2"></i>학생 관리로 이동
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold text-gray-700">관리자/교사/학부모 목록</h2>
                        <button onclick="navigateToPage('user-add')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            <i class="fas fa-plus mr-2"></i>사용자 추가
                        </button>
                    </div>
                    
                    <!-- 검색 및 필터 -->
                    <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input type="text" 
                               id="user-search-input" 
                               placeholder="이름 또는 아이디 검색..."
                               class="px-4 py-2 border border-gray-300 rounded-lg"
                               oninput="filterUsers()">
                        
                        <select id="user-role-filter" 
                                class="px-4 py-2 border border-gray-300 rounded-lg"
                                onchange="filterUsers()">
                            <option value="">전체 권한</option>
                            <option value="super_admin">최고관리자</option>
                            <option value="admin">관리자</option>
                            <option value="teacher">교사</option>
                            <option value="parent">학부모</option>
                        </select>
                        
                        <button onclick="resetUserFilters()" 
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                            <i class="fas fa-redo mr-2"></i>초기화
                        </button>
                    </div>
                    
                    <!-- 통계 카드 -->
                    <div id="user-stats" class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    </div>
                    
                    <!-- 사용자 목록 테이블 -->
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">아이디</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">권한</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">전화번호</th>
                                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">작업</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200" id="users-tbody">
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-4 text-sm text-gray-600">
                        총 <span id="user-count" class="font-bold text-blue-600">${users.length}</span>명
                    </div>
                </div>
            </div>
        `;
        
        renderUsersList();
    } catch (error) {
        console.error('Failed to load users:', error);
        alert('사용자 목록을 불러오는데 실패했습니다.');
    }
}

// 사용자 목록 렌더링
function renderUsersList() {
    const users = window.filteredUsers || window.allUsers || [];
    const tbody = document.getElementById('users-tbody');
    const countSpan = document.getElementById('user-count');
    
    if (countSpan) {
        countSpan.textContent = users.length;
    }
    
    // 통계 계산
    const stats = {
        total: users.length,
        super_admin: users.filter(u => u.role === 'super_admin').length,
        admin: users.filter(u => u.role === 'admin').length,
        teacher: users.filter(u => u.role === 'teacher').length,
        student: users.filter(u => u.role === 'student').length,
        parent: users.filter(u => u.role === 'parent').length
    };
    
    // 통계 카드 렌더링
    const statsContainer = document.getElementById('user-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="bg-purple-50 p-3 rounded-lg text-center">
                <p class="text-xs text-purple-600 mb-1">최고관리자</p>
                <p class="text-xl font-bold text-purple-800">${stats.super_admin}</p>
            </div>
            <div class="bg-blue-50 p-3 rounded-lg text-center">
                <p class="text-xs text-blue-600 mb-1">관리자</p>
                <p class="text-xl font-bold text-blue-800">${stats.admin}</p>
            </div>
            <div class="bg-green-50 p-3 rounded-lg text-center">
                <p class="text-xs text-green-600 mb-1">교사</p>
                <p class="text-xl font-bold text-green-800">${stats.teacher}</p>
            </div>
            <div class="bg-pink-50 p-3 rounded-lg text-center">
                <p class="text-xs text-pink-600 mb-1">학부모</p>
                <p class="text-xl font-bold text-pink-800">${stats.parent}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
                <p class="text-xs text-gray-600 mb-1">학생 (참고)</p>
                <p class="text-xl font-bold text-gray-800">${stats.student}</p>
                <p class="text-xs text-gray-500 mt-1">학생관리에서</p>
            </div>
        `;
    }
    
    // 권한 레이블 색상
    const roleColors = {
        'super_admin': 'bg-purple-100 text-purple-800',
        'admin': 'bg-blue-100 text-blue-800',
        'teacher': 'bg-green-100 text-green-800',
        'student': 'bg-yellow-100 text-yellow-800',
        'parent': 'bg-pink-100 text-pink-800'
    };
    
    const roleLabels = {
        'super_admin': '최고관리자',
        'admin': '관리자',
        'teacher': '교사',
        'student': '학생',
        'parent': '학부모'
    };
    
    if (!tbody) return;
    
    tbody.innerHTML = users.map(user => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${user.name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                ${user.username}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                ${user.email}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}">
                    ${roleLabels[user.role] || user.role}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                ${user.phone || '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                <button onclick="editUser(${user.id})" class="text-blue-600 hover:text-blue-800 mr-3" title="수정">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="changeUserRole(${user.id}, '${user.name}', '${user.role}')" class="text-purple-600 hover:text-purple-800 mr-3" title="권한 변경">
                    <i class="fas fa-user-shield"></i>
                </button>
                ${user.role === 'teacher' ? `
                    <button onclick="manageTeacherPermissions(${user.id}, '${user.name}')" class="text-green-600 hover:text-green-800 mr-3" title="교사 권한 관리">
                        <i class="fas fa-key"></i>
                    </button>
                    <button onclick="manageTeacherSubjects(${user.id}, '${user.name}')" class="text-indigo-600 hover:text-indigo-800 mr-3" title="담당 과목 연결">
                        <i class="fas fa-book"></i>
                    </button>
                ` : ''}
                ${user.role !== 'super_admin' && user.role !== 'student' ? `
                    <button onclick="deleteUser(${user.id}, '${user.name}', '${user.role}')" class="text-red-600 hover:text-red-800" title="삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : user.role === 'student' ? `
                    <span class="text-gray-400" title="학생은 학생 관리에서 삭제하세요">
                        <i class="fas fa-ban"></i>
                    </span>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// 사용자 필터링
function filterUsers() {
    const searchTerm = document.getElementById('user-search-input').value.toLowerCase();
    const roleFilter = document.getElementById('user-role-filter').value;
    
    let filtered = window.allUsers;
    
    // 검색어 필터
    if (searchTerm) {
        filtered = filtered.filter(u => 
            u.name.toLowerCase().includes(searchTerm) ||
            u.username.toLowerCase().includes(searchTerm)
        );
    }
    
    // 권한 필터
    if (roleFilter) {
        filtered = filtered.filter(u => u.role === roleFilter);
    }
    
    window.filteredUsers = filtered;
    renderUsersList();
}

// 필터 초기화
function resetUserFilters() {
    document.getElementById('user-search-input').value = '';
    document.getElementById('user-role-filter').value = '';
    window.filteredUsers = window.allUsers;
    renderUsersList();
}

// 교사 권한 관리
async function manageTeacherPermissions(userId, userName) {
    try {
        // 교사 정보 가져오기
        const userResponse = await axios.get(`/api/users/${userId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        console.log('userResponse.data:', userResponse.data);
        let teacher = userResponse.data.user?.teacher || userResponse.data.teacher;
        let teacherId;
        
        // teacher 정보가 없으면 생성 시도
        if (!teacher) {
            console.log('teacher 정보가 없어서 생성 시도:', userId, userResponse.data);
            // teacher_number 생성 (T + 연도 + 4자리 숫자)
            const year = new Date().getFullYear();
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const teacherNumber = `T${year}${randomNum}`;
            
            try {
                // teachers 테이블에 레코드 생성
                const createResponse = await axios.post('/api/teachers', {
                    user_id: userId,
                    teacher_number: teacherNumber,
                    subject: null,
                    hire_date: new Date().toISOString().split('T')[0],
                    position: '교사',
                    department: null
                }, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                
                teacherId = createResponse.data.id;
                
                // 다시 교사 정보 가져오기
                const userResponse2 = await axios.get(`/api/users/${userId}`, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                teacher = userResponse2.data.user?.teacher;
            } catch (createError) {
                console.error('교사 정보 생성 실패:', createError);
                // 이미 존재하는 경우 (UNIQUE constraint) - 다시 조회 시도
                if (createError.response?.status === 409 || createError.response?.status === 400) {
                    // 잠시 대기 후 다시 조회 (DB 트랜잭션 완료 대기)
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // 다시 조회
                    try {
                        const userResponse2 = await axios.get(`/api/users/${userId}`, {
                            headers: { 'Authorization': 'Bearer ' + authToken }
                        });
                        teacher = userResponse2.data.user?.teacher;
                        if (teacher) {
                            teacherId = teacher.id;
                        } else {
                            // 여전히 없으면 직접 teachers 테이블에서 조회 시도
                            // 하지만 이건 API가 없으므로, 에러 메시지만 표시
                            alert('교사 정보가 이미 존재하지만 조회할 수 없습니다. 잠시 후 다시 시도해주세요.');
                            return;
                        }
                    } catch (retryError) {
                        console.error('교사 정보 재조회 실패:', retryError);
                        alert('교사 정보를 조회할 수 없습니다. 잠시 후 다시 시도해주세요.');
                        return;
                    }
                } else {
                    alert('교사 정보를 생성할 수 없습니다: ' + (createError.response?.data?.error || createError.message));
                    return;
                }
            }
        } else {
            teacherId = teacher.id;
        }
        
        if (!teacherId) {
            alert('교사 정보를 찾을 수 없습니다.');
            return;
        }
        
        // 현재 권한 가져오기
        const permissionsResponse = await axios.get(`/api/teacher-permissions?teacher_id=${teacherId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const currentPermissions = (permissionsResponse.data.permissions || []).map(p => p.permission_type);
        
        // 권한 관리 모달 표시
        showTeacherPermissionsModal(teacherId, userName, currentPermissions);
    } catch (error) {
        console.error('교사 권한 조회 실패:', error);
        alert('교사 권한 정보를 불러올 수 없습니다: ' + (error.response?.data?.error || error.message));
    }
}

// 교사 권한 관리 모달
function showTeacherPermissionsModal(teacherId, teacherName, currentPermissions) {
    const modal = document.createElement('div');
    modal.id = 'teacher-permissions-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const permissionTypes = [
        { value: 'manage_own_class', label: '자기 반 관리', description: '담당 반의 학생 및 시간표 관리' },
        { value: 'manage_own_courses', label: '자기 과목 관리', description: '담당 과목의 수업 및 성적 관리' },
        { value: 'manage_attendance', label: '출석 관리', description: '담당 반/과목의 출석 관리' },
        { value: 'manage_grades', label: '성적 관리', description: '담당 과목의 성적 입력 및 관리' },
        { value: 'manage_all_students', label: '전체 학생 관리', description: '모든 학생 정보 조회 및 관리' },
        { value: 'manage_teachers', label: '교사 관리', description: '다른 교사 정보 조회 및 관리' },
        { value: 'manage_system', label: '시스템 설정', description: '시스템 전체 설정 관리' }
    ];
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">교사 권한 관리</h2>
                <button onclick="closeTeacherPermissionsModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <div class="mb-6">
                <p class="text-sm text-gray-600">교사: <span class="font-semibold text-lg">${escapeHtml(teacherName)}</span></p>
            </div>
            
            <form id="teacher-permissions-form" class="space-y-4">
                ${permissionTypes.map(perm => `
                    <div class="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input type="checkbox" 
                               id="perm-${perm.value}" 
                               name="permissions" 
                               value="${perm.value}"
                               ${currentPermissions.includes(perm.value) ? 'checked' : ''}
                               class="mt-1 mr-4 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                        <div class="flex-1">
                            <label for="perm-${perm.value}" class="block text-sm font-medium text-gray-800 cursor-pointer">
                                ${perm.label}
                            </label>
                            <p class="text-xs text-gray-500 mt-1">${perm.description}</p>
                        </div>
                    </div>
                `).join('')}
                
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <p class="text-sm text-blue-800">
                        <i class="fas fa-info-circle mr-2"></i>
                        권한을 선택하면 해당 교사가 해당 기능을 사용할 수 있습니다.
                    </p>
                </div>
                
                <div class="flex justify-end space-x-4 mt-6">
                    <button type="button" onclick="closeTeacherPermissionsModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        취소
                    </button>
                    <button type="submit" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-save mr-2"></i>권한 저장
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 폼 제출 이벤트
    document.getElementById('teacher-permissions-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveTeacherPermissions(teacherId, teacherName);
    });
}

// 교사 권한 저장
async function saveTeacherPermissions(teacherId, teacherName) {
    try {
        const form = document.getElementById('teacher-permissions-form');
        const checkboxes = form.querySelectorAll('input[name="permissions"]:checked');
        const selectedPermissions = Array.from(checkboxes).map(cb => cb.value);
        
        // 기존 권한 가져오기
        const permissionsResponse = await axios.get(`/api/teacher-permissions?teacher_id=${teacherId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        const existingPermissions = (permissionsResponse.data.permissions || []).map(p => p.permission_type);
        
        // 추가할 권한
        const toAdd = selectedPermissions.filter(p => !existingPermissions.includes(p));
        // 제거할 권한
        const toRemove = existingPermissions.filter(p => !selectedPermissions.includes(p));
        
        // 권한 추가
        for (const permission of toAdd) {
            await axios.post('/api/teacher-permissions', {
                teacher_id: teacherId,
                permission_type: permission
            }, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
        }
        
        // 권한 제거
        for (const permission of toRemove) {
            const perm = permissionsResponse.data.permissions.find(p => p.permission_type === permission);
            if (perm) {
                await axios.delete(`/api/teacher-permissions/${perm.id}`, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
            }
        }
        
        alert(`${teacherName} 교사의 권한이 업데이트되었습니다.`);
        closeTeacherPermissionsModal();
    } catch (error) {
        console.error('권한 저장 실패:', error);
        alert('권한 저장에 실패했습니다.');
    }
}

// 교사 권한 관리 모달 닫기
function closeTeacherPermissionsModal() {
    const modal = document.getElementById('teacher-permissions-modal');
    if (modal) {
        modal.remove();
    }
}

// 사용자 권한 변경
async function changeUserRole(userId, userName, currentRole) {
    // 학생 계정은 권한 변경 불가
    if (currentRole === 'student') {
        alert('학생 계정은 이 페이지에서 권한을 변경할 수 없습니다.\n\n학생 계정은 "학생 관리" 메뉴에서 관리해주세요.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'role-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">권한 변경</h2>
                <button onclick="closeRoleModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <div class="mb-4">
                <p class="text-sm text-gray-600">사용자: <span class="font-semibold">${userName}</span></p>
                <p class="text-sm text-gray-600">현재 권한: <span class="font-semibold">${getRoleLabel(currentRole)}</span></p>
            </div>
            
            <form id="change-role-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">새 권한 *</label>
                    <select name="role" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="super_admin" ${currentRole === 'super_admin' ? 'selected' : ''}>최고관리자</option>
                        <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>관리자</option>
                        <option value="teacher" ${currentRole === 'teacher' ? 'selected' : ''}>교사</option>
                        <option value="parent" ${currentRole === 'parent' ? 'selected' : ''}>학부모</option>
                    </select>
                    ${currentRole === 'student' ? `
                        <p class="text-xs text-red-600 mt-2">
                            <i class="fas fa-exclamation-circle mr-1"></i>
                            <strong>학생 계정은 권한 변경이 제한됩니다.</strong> 학생은 "학생 관리"에서 관리하세요.
                        </p>
                    ` : ''}
                </div>
                
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p class="text-xs text-yellow-800">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        권한 변경 시 해당 사용자의 접근 권한이 즉시 변경됩니다.
                    </p>
                </div>
                
                <div class="flex justify-end space-x-4">
                    <button type="button" onclick="closeRoleModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        취소
                    </button>
                    <button type="submit" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        변경
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('change-role-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newRole = formData.get('role');
        
        try {
            await axios.put(`/api/users/${userId}/role`, {
                role: newRole
            }, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            
            alert('권한이 변경되었습니다.');
            closeRoleModal();
            navigateToPage('users');
        } catch (error) {
            console.error('권한 변경 실패:', error);
            alert('권한 변경에 실패했습니다: ' + (error.response?.data?.error || error.message));
        }
    });
}

function closeRoleModal() {
    const modal = document.getElementById('role-modal');
    if (modal) {
        modal.remove();
    }
}

function getRoleLabel(role) {
    const labels = {
        'super_admin': '최고관리자',
        'admin': '관리자',
        'teacher': '교사',
        'student': '학생',
        'parent': '학부모'
    };
    return labels[role] || role;
}

// 사용자 수정
async function editUser(userId) {
    window.currentEditUserId = userId;
    navigateToPage('user-edit');
}

// 사용자 삭제
async function deleteUser(userId, userName, userRole) {
    // 학생 계정은 삭제 불가
    if (userRole === 'student') {
        alert('학생 계정은 이 페이지에서 삭제할 수 없습니다.\n\n학생 계정은 "학생 관리" 메뉴에서 관리해주세요.');
        return;
    }
    
    if (!confirm(`정말로 ${userName} 사용자를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }
    
    try {
        await axios.delete(`/api/users/${userId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('사용자가 삭제되었습니다.');
        navigateToPage('users');
    } catch (error) {
        console.error('사용자 삭제 실패:', error);
        alert('사용자 삭제에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}

// 교사 담당 과목 연결 관리
async function manageTeacherSubjects(userId, userName) {
    try {
        // 전역 변수에 저장 (모달 새로고침용)
        window.currentTeacherUserId = userId;
        window.currentTeacherUserName = userName;
        
        // 교사 정보 가져오기
        const userResponse = await axios.get(`/api/users/${userId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        let teacher = userResponse.data.user?.teacher || userResponse.data.teacher;
        let teacherId;
        
        // teacher 정보가 없으면 생성 시도
        if (!teacher) {
            const year = new Date().getFullYear();
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const teacherNumber = `T${year}${randomNum}`;
            
            try {
                const createResponse = await axios.post('/api/teachers', {
                    user_id: userId,
                    teacher_number: teacherNumber,
                    subject: null,
                    position: '교사',
                    department: null
                }, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                
                teacherId = createResponse.data.id;
                // 재조회
                const reUserResponse = await axios.get(`/api/users/${userId}`, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                teacher = reUserResponse.data.user?.teacher || reUserResponse.data.teacher;
                teacherId = teacher.id;
            } catch (createError) {
                if (createError.response?.status === 409) {
                    // 이미 존재하는 경우 재조회
                    const reUserResponse = await axios.get(`/api/users/${userId}`, {
                        headers: { 'Authorization': 'Bearer ' + authToken }
                    });
                    teacher = reUserResponse.data.user?.teacher || reUserResponse.data.teacher;
                    if (teacher) {
                        teacherId = teacher.id;
                    } else {
                        alert('교사 정보를 찾을 수 없습니다.');
                        return;
                    }
                } else {
                    alert('교사 정보를 생성할 수 없습니다: ' + (createError.response?.data?.error || createError.message));
                    return;
                }
            }
        } else {
            teacherId = teacher.id;
        }
        
        // 모든 과목 목록 가져오기
        const subjectsRes = await axios.get('/api/subjects', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const allSubjects = subjectsRes.data.subjects || [];
        const assignedSubjects = allSubjects.filter(s => s.teacher_id == teacherId);
        const unassignedSubjects = allSubjects.filter(s => !s.teacher_id || s.teacher_id != teacherId);
        
        // 모달 생성
        const modal = document.createElement('div');
        modal.id = 'teacher-subjects-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full mx-4 my-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">담당 과목 연결</h2>
                    <button onclick="closeTeacherSubjectsModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <div class="mb-6">
                    <p class="text-sm text-gray-600">교사: <span class="font-semibold text-lg">${escapeHtml(userName)}</span></p>
                    ${teacher.subject ? `<p class="text-sm text-gray-600 mt-1">전공: <span class="font-medium">${escapeHtml(teacher.subject)}</span></p>` : ''}
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- 연결된 과목 -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">연결된 과목 (${assignedSubjects.length})</h3>
                        <div class="space-y-2 max-h-96 overflow-y-auto">
                            ${assignedSubjects.length > 0 ? assignedSubjects.map(subject => `
                                <div class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div>
                                        <span class="font-medium text-gray-800">${escapeHtml(subject.name)}</span>
                                        <span class="text-xs text-gray-500 ml-2">(${escapeHtml(subject.code)})</span>
                                    </div>
                                    <button onclick="unassignSubjectFromTeacher(${subject.id}, ${teacherId}, '${escapeHtml(subject.name)}')" 
                                            class="text-red-600 hover:text-red-800 text-sm">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            `).join('') : `
                                <p class="text-gray-500 text-center py-4">연결된 과목이 없습니다</p>
                            `}
                        </div>
                    </div>
                    
                    <!-- 연결 가능한 과목 -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">연결 가능한 과목 (${unassignedSubjects.length})</h3>
                        <div class="space-y-2 max-h-96 overflow-y-auto">
                            ${unassignedSubjects.length > 0 ? unassignedSubjects.map(subject => `
                                <div class="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">
                                    <div>
                                        <span class="font-medium text-gray-800">${escapeHtml(subject.name)}</span>
                                        <span class="text-xs text-gray-500 ml-2">(${escapeHtml(subject.code)})</span>
                                        ${subject.teacher_name ? `<span class="text-xs text-orange-600 ml-2">[${escapeHtml(subject.teacher_name)} 담당]</span>` : ''}
                                    </div>
                                    <button onclick="assignSubjectToTeacher(${subject.id}, ${teacherId}, '${escapeHtml(subject.name)}')" 
                                            class="text-green-600 hover:text-green-800 text-sm">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            `).join('') : `
                                <p class="text-gray-500 text-center py-4">연결 가능한 과목이 없습니다</p>
                            `}
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end mt-6 pt-6 border-t border-gray-200">
                    <button onclick="closeTeacherSubjectsModal()" 
                            class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700">
                        닫기
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('담당 과목 연결 관리 실패:', error);
        alert('담당 과목 연결 관리를 불러올 수 없습니다: ' + (error.response?.data?.error || error.message));
    }
}

// 과목을 교사에게 연결
async function assignSubjectToTeacher(subjectId, teacherId, subjectName) {
    if (!confirm(`"${subjectName}" 과목을 이 교사에게 연결하시겠습니까?`)) {
        return;
    }
    
    try {
        // 현재 과목 정보 가져오기
        const subjectRes = await axios.get(`/api/subjects/${subjectId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const subject = subjectRes.data.subject;
        
        // 과목 업데이트 (teacher_id 추가)
        await axios.put(`/api/subjects/${subjectId}`, {
            name: subject.name,
            code: subject.code,
            grade: subject.grade,
            credits: subject.credits,
            subject_type: subject.subject_type,
            performance_ratio: subject.performance_ratio,
            written_ratio: subject.written_ratio,
            description: subject.description,
            teacher_id: teacherId
        }, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('과목이 연결되었습니다.');
        // 모달 새로고침
        const modal = document.getElementById('teacher-subjects-modal');
        if (modal) {
            modal.remove();
            // 모달 다시 열기
            const userId = window.currentTeacherUserId;
            const userName = window.currentTeacherUserName;
            if (userId && userName) {
                manageTeacherSubjects(userId, userName);
            }
        }
    } catch (error) {
        console.error('과목 연결 실패:', error);
        alert('과목 연결에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}

// 교사에서 과목 연결 해제
async function unassignSubjectFromTeacher(subjectId, teacherId, subjectName) {
    if (!confirm(`"${subjectName}" 과목의 연결을 해제하시겠습니까?`)) {
        return;
    }
    
    try {
        // 현재 과목 정보 가져오기
        const subjectRes = await axios.get(`/api/subjects/${subjectId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const subject = subjectRes.data.subject;
        
        // 과목 업데이트 (teacher_id 제거)
        await axios.put(`/api/subjects/${subjectId}`, {
            name: subject.name,
            code: subject.code,
            grade: subject.grade,
            credits: subject.credits,
            subject_type: subject.subject_type,
            performance_ratio: subject.performance_ratio,
            written_ratio: subject.written_ratio,
            description: subject.description,
            teacher_id: null
        }, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('과목 연결이 해제되었습니다.');
        // 모달 새로고침
        const modal = document.getElementById('teacher-subjects-modal');
        if (modal) {
            modal.remove();
            // 모달 다시 열기
            const userId = window.currentTeacherUserId;
            const userName = window.currentTeacherUserName;
            if (userId && userName) {
                manageTeacherSubjects(userId, userName);
            }
        }
    } catch (error) {
        console.error('과목 연결 해제 실패:', error);
        alert('과목 연결 해제에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}

// 교사 과목 연결 모달 닫기
function closeTeacherSubjectsModal() {
    const modal = document.getElementById('teacher-subjects-modal');
    if (modal) {
        modal.remove();
    }
    window.currentTeacherUserId = null;
    window.currentTeacherUserName = null;
}
