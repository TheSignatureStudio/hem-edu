// 과목 추가 폼
async function showAddSubjectForm() {
    const modal = document.createElement('div');
    modal.id = 'student-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-xl w-full mx-4">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">새 과목 추가</h2>
                <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <form id="add-subject-form" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">과목명 *</label>
                        <input type="text" name="name" required placeholder="예: 국어" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">과목 코드 *</label>
                        <input type="text" name="code" required placeholder="예: KOR001" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">학점 *</label>
                        <input type="number" name="credits" required value="3" min="1" max="10" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">구분 *</label>
                        <select name="subject_type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="required">필수</option>
                            <option value="elective">선택</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
                    <textarea name="description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                
                <div class="flex justify-end space-x-4 mt-6">
                    <button type="button" onclick="closeModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        취소
                    </button>
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        추가
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const form = document.getElementById('add-subject-form');
    if (!form) {
        console.error('과목 추가 폼을 찾을 수 없습니다');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // 필수 필드 검증
        if (!data.name || !data.code) {
            alert('과목명과 과목 코드는 필수입니다.');
            return;
        }
        
        // authToken 확인
        if (!authToken) {
            alert('로그인이 필요합니다. 페이지를 새로고침해주세요.');
            return;
        }
        
        console.log('과목 추가 시도:', data);
        
        try {
            const response = await axios.post('/api/subjects', {
                name: data.name,
                code: data.code,
                description: data.description || null,
                credits: parseInt(data.credits) || 3,
                subject_type: data.subject_type || 'required'
            }, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            
            console.log('과목 추가 성공:', response.data);
            alert('과목이 성공적으로 추가되었습니다!');
            
            // 모달 닫기
            const modal = document.getElementById('student-modal');
            if (modal) {
                modal.remove();
            }
            
            // 페이지 새로고침하여 과목 목록 업데이트
            try {
                if (typeof navigateToPage === 'function') {
                    navigateToPage('subjects');
                } else if (typeof showSubjectManagement === 'function') {
                    const contentArea = document.getElementById('main-content');
                    if (contentArea) {
                        await showSubjectManagement(contentArea);
                    } else {
                        location.reload();
                    }
                } else {
                    location.reload();
                }
            } catch (error) {
                console.error('페이지 새로고침 실패:', error);
                location.reload();
            }
        } catch (error) {
            console.error('Failed to add subject:', error);
            const errorMessage = error.response?.data?.error || error.message || '알 수 없는 오류';
            alert('과목 추가에 실패했습니다: ' + errorMessage);
        }
    });
}

// 학기 추가 폼
async function showAddSemesterForm() {
    const modal = document.createElement('div');
    modal.id = 'student-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-xl w-full mx-4">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">새 학기 추가</h2>
                <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <form id="add-semester-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">학기명 *</label>
                    <input type="text" name="name" required placeholder="예: 2024학년도 1학기" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">연도 *</label>
                        <input type="number" name="year" required value="${new Date().getFullYear()}" min="2020" max="2100" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                        <select name="semester" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="1">1학기</option>
                            <option value="2">2학기</option>
                        </select>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">시작일 *</label>
                        <input type="date" name="start_date" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">종료일 *</label>
                        <input type="date" name="end_date" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                </div>
                
                <div>
                    <label class="flex items-center">
                        <input type="checkbox" name="is_current" value="1" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                        <span class="ml-2 text-sm text-gray-700">현재 학기로 설정</span>
                    </label>
                </div>
                
                <div class="flex justify-end space-x-4 mt-6">
                    <button type="button" onclick="closeModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        취소
                    </button>
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        추가
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('add-semester-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await axios.post('/api/semesters', {
                name: data.name,
                year: parseInt(data.year),
                semester: parseInt(data.semester),
                start_date: data.start_date,
                end_date: data.end_date,
                is_current: data.is_current ? 1 : 0
            }, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            
            alert('학기가 성공적으로 추가되었습니다!');
            closeModal();
            navigateToPage('courses');
        } catch (error) {
            console.error('Failed to add semester:', error);
            alert('학기 추가에 실패했습니다: ' + (error.response?.data?.error || error.message));
        }
    });
}

// 동아리 추가 폼
async function showAddClubForm() {
    try {
        const [semestersRes, teachersRes] = await Promise.all([
            axios.get('/api/semesters', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            }),
            axios.get('/api/users?role=teacher&limit=1000', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            })
        ]);
        
        const teacherDetailsPromises = teachersRes.data.users.map(async (user) => {
            const res = await axios.get(`/api/users/${user.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            return { ...res.data.teacher, userName: user.name };
        });
        
        const teachers = (await Promise.all(teacherDetailsPromises)).filter(t => t);
        
        const modal = document.createElement('div');
        modal.id = 'student-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-xl w-full mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">새 동아리 추가</h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="add-club-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">동아리명 *</label>
                        <input type="text" name="name" required placeholder="예: 코딩 동아리" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
                        <textarea name="description" rows="3" placeholder="동아리 소개" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                            <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">선택하세요</option>
                                ${semestersRes.data.semesters.map(s => `
                                    <option value="${s.id}" ${s.is_current ? 'selected' : ''}>${s.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">지도교사</label>
                            <select name="advisor_teacher_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">선택 안함</option>
                                ${teachers.map(t => `<option value="${t.id}">${t.userName}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">정원</label>
                        <input type="number" name="max_members" value="20" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div class="flex justify-end space-x-4 mt-6">
                        <button type="button" onclick="closeModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            취소
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            추가
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('add-club-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.post('/api/clubs', {
                    name: data.name,
                    description: data.description || null,
                    advisor_teacher_id: data.advisor_teacher_id ? parseInt(data.advisor_teacher_id) : null,
                    semester_id: parseInt(data.semester_id),
                    max_members: parseInt(data.max_members)
                }, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                
                alert('동아리가 성공적으로 추가되었습니다!');
                closeModal();
                navigateToPage('clubs');
            } catch (error) {
                console.error('Failed to add club:', error);
                alert('동아리 추가에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load form:', error);
        alert('폼을 불러오는데 실패했습니다.');
    }
}

// 봉사활동 추가 폼
async function showAddVolunteerForm() {
    try {
        const studentsRes = await axios.get('/api/students?limit=1000', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const modal = document.createElement('div');
        modal.id = 'student-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">봉사활동 등록</h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="add-volunteer-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                        <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">선택하세요</option>
                            ${studentsRes.data.students.map(s => 
                                `<option value="${s.id}">${s.name} (${s.student_number})</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">활동명 *</label>
                        <input type="text" name="activity_name" required placeholder="예: 지역 청소 활동" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">기관명</label>
                        <input type="text" name="organization" placeholder="예: 00복지관" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">활동일 *</label>
                            <input type="date" name="activity_date" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">시간 *</label>
                            <input type="number" name="hours" required min="0.5" step="0.5" placeholder="시간" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
                        <select name="category" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="community">지역사회</option>
                            <option value="environment">환경보호</option>
                            <option value="welfare">복지</option>
                            <option value="education">교육</option>
                            <option value="other">기타</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">활동 내용</label>
                        <textarea name="description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-4 mt-6">
                        <button type="button" onclick="closeModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            취소
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            등록
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('add-volunteer-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.post('/api/volunteer', {
                    student_id: parseInt(data.student_id),
                    activity_name: data.activity_name,
                    organization: data.organization || null,
                    activity_date: data.activity_date,
                    hours: parseFloat(data.hours),
                    category: data.category,
                    description: data.description || null
                }, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                
                alert('봉사활동이 성공적으로 등록되었습니다!');
                closeModal();
                navigateToPage('volunteer');
            } catch (error) {
                console.error('Failed to add volunteer activity:', error);
                alert('봉사활동 등록에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load form:', error);
        alert('폼을 불러오는데 실패했습니다.');
    }
}
