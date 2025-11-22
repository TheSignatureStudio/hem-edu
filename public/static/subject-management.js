// 과목 관리 페이지

// 과목 관리 메인 화면
async function showSubjectManagement(container) {
    try {
        const response = await axios.get('/api/subjects', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const subjects = response.data.subjects || [];
        
        // 학년별로 그룹화
        const subjectsByGrade = {};
        subjects.forEach(subject => {
            const grade = subject.grade || 0;
            if (!subjectsByGrade[grade]) {
                subjectsByGrade[grade] = [];
            }
            subjectsByGrade[grade].push(subject);
        });
        
        container.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-book-open mr-3 text-indigo-500"></i>과목 관리
                    </h1>
                    <button onclick="navigateToPage('subjects-add')" class="bg-indigo-500 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-600 shadow-sm transition-all">
                        <i class="fas fa-plus mr-2"></i>과목 추가
                    </button>
                </div>
                
                <!-- 학년별 탭 -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div class="border-b border-gray-100">
                        <nav class="flex">
                            ${[1, 2, 3].map(grade => `
                                <button onclick="switchSubjectGrade(${grade})" 
                                        id="subject-tab-${grade}"
                                        class="subject-tab px-8 py-4 text-sm font-medium transition-all ${grade === 1 ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}">
                                    ${grade}학년
                                </button>
                            `).join('')}
                        </nav>
                    </div>
                    
                    <!-- 학년별 과목 목록 -->
                    ${[1, 2, 3].map(grade => `
                        <div id="subject-grade-${grade}" class="subject-grade-content ${grade === 1 ? '' : 'hidden'} p-8">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                ${(subjectsByGrade[grade] || []).map(subject => `
                                    <div class="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md hover:border-indigo-200 transition-all">
                                        <div class="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 class="text-lg font-bold text-gray-800 mb-1">${subject.name}</h3>
                                                <p class="text-sm text-gray-400 font-mono">${subject.code}</p>
                                            </div>
                                            <span class="px-3 py-1 text-xs font-medium rounded-full ${subject.subject_type === 'required' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}">
                                                ${subject.subject_type === 'required' ? '필수' : '선택'}
                                            </span>
                                        </div>
                                        
                                        <div class="space-y-3 mb-4">
                                            <div class="flex items-center text-gray-600">
                                                <i class="fas fa-graduation-cap w-5 text-indigo-400"></i>
                                                <span class="text-sm ml-2">${subject.credits}학점</span>
                                            </div>
                                            ${subject.teacher_name ? `
                                            <div class="flex items-center text-gray-600">
                                                <i class="fas fa-chalkboard-teacher w-5 text-indigo-400"></i>
                                                <span class="text-sm ml-2">담당: ${subject.teacher_name}</span>
                                            </div>
                                            ` : ''}
                                            <div class="flex items-center text-gray-600">
                                                <i class="fas fa-chart-pie w-5 text-indigo-400"></i>
                                                <span class="text-sm ml-2">수행 ${subject.performance_ratio}% · 지필 ${subject.written_ratio}%</span>
                                            </div>
                                        </div>
                                        
                                        <div class="flex gap-2 pt-3 border-t border-gray-100">
                                            <button onclick="editSubjectPage(${subject.id})" 
                                                    class="flex-1 bg-indigo-50 text-indigo-600 py-2.5 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium">
                                                <i class="fas fa-edit mr-1"></i>수정
                                            </button>
                                            <button onclick="deleteSubject(${subject.id}, '${subject.name}')" 
                                                    class="flex-1 bg-rose-50 text-rose-600 py-2.5 rounded-lg hover:bg-rose-100 transition-colors text-sm font-medium">
                                                <i class="fas fa-trash mr-1"></i>삭제
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                                
                                ${(subjectsByGrade[grade] || []).length === 0 ? `
                                    <div class="col-span-full text-center py-16 text-gray-400">
                                        <i class="fas fa-book text-5xl mb-4 opacity-30"></i>
                                        <p class="text-lg">등록된 과목이 없습니다</p>
                                        <p class="text-sm mt-2">위의 "과목 추가" 버튼을 클릭하여 새 과목을 등록하세요</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load subjects:', error);
        alert('과목 목록을 불러오는데 실패했습니다.');
    }
}

// 학년 탭 전환
function switchSubjectGrade(grade) {
    // 모든 탭 비활성화
    document.querySelectorAll('.subject-tab').forEach(tab => {
        tab.className = 'subject-tab px-8 py-4 text-sm font-medium transition-all text-gray-500 hover:text-gray-700 hover:bg-gray-50';
    });
    
    // 선택된 탭 활성화
    const selectedTab = document.getElementById(`subject-tab-${grade}`);
    selectedTab.className = 'subject-tab px-8 py-4 text-sm font-medium transition-all border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50/50';
    
    // 모든 콘텐츠 숨기기
    document.querySelectorAll('.subject-grade-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // 선택된 학년 콘텐츠 보이기
    document.getElementById(`subject-grade-${grade}`).classList.remove('hidden');
}

// 과목 추가 모달
async function showAddSubjectModal() {
    const modal = document.createElement('div');
    modal.id = 'subject-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">과목 추가</h2>
                <button onclick="closeSubjectModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <form id="add-subject-form" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">과목명 *</label>
                        <input type="text" name="name" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">과목 코드 *</label>
                        <input type="text" name="code" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                               placeholder="예: KOR001">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">학년 *</label>
                        <select name="grade" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">선택</option>
                            <option value="1">1학년</option>
                            <option value="2">2학년</option>
                            <option value="3">3학년</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">학점 *</label>
                        <input type="number" name="credits" required min="1" max="5" value="3"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">과목 유형 *</label>
                        <select name="subject_type" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="required">필수</option>
                            <option value="elective">선택</option>
                        </select>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            수행평가 비율 (%) *
                            <span class="text-xs text-gray-500">0-100</span>
                        </label>
                        <input type="number" name="performance_ratio" required min="0" max="100" value="40"
                               onchange="updateWrittenRatio(this)"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            지필평가 비율 (%) *
                            <span class="text-xs text-gray-500">자동 계산</span>
                        </label>
                        <input type="number" name="written_ratio" required min="0" max="100" value="60" readonly
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
                    <textarea name="description" rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                
                <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" onclick="closeSubjectModal()"
                            class="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                        취소
                    </button>
                    <button type="submit"
                            class="px-6 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-sm transition-all font-medium">
                        <i class="fas fa-check mr-2"></i>추가
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 폼 제출 이벤트
    document.getElementById('add-subject-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitSubjectForm(e.target, 'POST', '/api/subjects');
    });
}

// 수행평가 비율 변경 시 지필평가 비율 자동 계산
function updateWrittenRatio(performanceInput) {
    const performance = parseInt(performanceInput.value) || 0;
    const written = 100 - performance;
    performanceInput.form.written_ratio.value = written;
}

// 과목 수정 모달
async function editSubject(subjectId) {
    try {
        const response = await axios.get(`/api/subjects/${subjectId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const subject = response.data.subject;
        
        const modal = document.createElement('div');
        modal.id = 'subject-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">과목 수정</h2>
                    <button onclick="closeSubjectModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="edit-subject-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">과목명 *</label>
                            <input type="text" name="name" required value="${subject.name}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">과목 코드 *</label>
                            <input type="text" name="code" required value="${subject.code}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학년 *</label>
                            <select name="grade" required 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="1" ${subject.grade === 1 ? 'selected' : ''}>1학년</option>
                                <option value="2" ${subject.grade === 2 ? 'selected' : ''}>2학년</option>
                                <option value="3" ${subject.grade === 3 ? 'selected' : ''}>3학년</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학점 *</label>
                            <input type="number" name="credits" required min="1" max="5" value="${subject.credits}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">과목 유형 *</label>
                            <select name="subject_type" required 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="required" ${subject.subject_type === 'required' ? 'selected' : ''}>필수</option>
                                <option value="elective" ${subject.subject_type === 'elective' ? 'selected' : ''}>선택</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                수행평가 비율 (%) *
                            </label>
                            <input type="number" name="performance_ratio" required min="0" max="100" value="${subject.performance_ratio}"
                                   onchange="updateWrittenRatio(this)"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                지필평가 비율 (%) *
                            </label>
                            <input type="number" name="written_ratio" required min="0" max="100" value="${subject.written_ratio}" readonly
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
                        <textarea name="description" rows="3"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">${subject.description || ''}</textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-3 mt-6">
                        <button type="button" onclick="closeSubjectModal()"
                                class="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                            취소
                        </button>
                        <button type="submit"
                                class="px-6 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-sm transition-all font-medium">
                            <i class="fas fa-check mr-2"></i>수정
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 폼 제출 이벤트
        document.getElementById('edit-subject-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitSubjectForm(e.target, 'PUT', `/api/subjects/${subjectId}`);
        });
    } catch (error) {
        console.error('Failed to load subject:', error);
        alert('과목 정보를 불러오는데 실패했습니다.');
    }
}

// 과목 폼 제출
async function submitSubjectForm(form, method, url) {
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        code: formData.get('code'),
        grade: parseInt(formData.get('grade')),
        credits: parseInt(formData.get('credits')),
        subject_type: formData.get('subject_type'),
        performance_ratio: parseInt(formData.get('performance_ratio')),
        written_ratio: parseInt(formData.get('written_ratio')),
        description: formData.get('description')
    };
    
    try {
        await axios({
            method: method,
            url: url,
            data: data,
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert(method === 'POST' ? '과목이 추가되었습니다.' : '과목이 수정되었습니다.');
        closeSubjectModal();
        
        // 페이지 새로고침
        const contentArea = document.getElementById('content-area');
        showSubjectManagement(contentArea);
    } catch (error) {
        console.error('Failed to submit subject:', error);
        alert('과목 저장에 실패했습니다.\n' + (error.response?.data?.message || error.message));
    }
}

// 과목 삭제
async function deleteSubject(subjectId, subjectName) {
    if (!confirm(`"${subjectName}" 과목을 삭제하시겠습니까?\n이 과목과 관련된 모든 수업 정보도 함께 삭제됩니다.`)) {
        return;
    }
    
    try {
        await axios.delete(`/api/subjects/${subjectId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('과목이 삭제되었습니다.');
        
        // 페이지 새로고침
        const contentArea = document.getElementById('content-area');
        showSubjectManagement(contentArea);
    } catch (error) {
        console.error('Failed to delete subject:', error);
        alert('과목 삭제에 실패했습니다.\n' + (error.response?.data?.message || error.message));
    }
}

// 모달 닫기
function closeSubjectModal() {
    const modal = document.getElementById('subject-modal');
    if (modal) {
        modal.remove();
    }
}

// ============================================
// 과목 추가 페이지 (페이지 기반)
// ============================================
async function showSubjectAddPage(container) {
    try {
        // 교사 목록 가져오기
        const teachersRes = await axios.get('/api/users?role=teacher&limit=1000', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        // 교사 상세 정보 가져오기 (teacher_id 포함)
        const teacherDetailsPromises = teachersRes.data.users.map(async (user) => {
            const res = await axios.get(`/api/users/${user.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            return { ...res.data.teacher, userName: user.name, userId: user.id };
        });
        
        const teachers = (await Promise.all(teacherDetailsPromises)).filter(t => t && t.id);
        
        container.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <div class="mb-6">
                <button onclick="navigateToPage('subjects')" class="text-indigo-600 hover:text-indigo-800 mb-4 inline-flex items-center">
                    <i class="fas fa-arrow-left mr-2"></i>목록으로 돌아가기
                </button>
                <h1 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-book-open mr-3 text-indigo-500"></i>과목 추가
                </h1>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form id="add-subject-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">과목명 <span class="text-red-500">*</span></label>
                            <input type="text" name="name" required 
                                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                   placeholder="예: 국어">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">과목 코드 <span class="text-red-500">*</span></label>
                            <input type="text" name="code" required 
                                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                   placeholder="예: KOR001">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학년 <span class="text-red-500">*</span></label>
                            <select name="grade" required 
                                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">선택</option>
                                <option value="1">1학년</option>
                                <option value="2">2학년</option>
                                <option value="3">3학년</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학점 <span class="text-red-500">*</span></label>
                            <input type="number" name="credits" required min="1" max="5" value="3"
                                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">과목 유형 <span class="text-red-500">*</span></label>
                            <select name="subject_type" required 
                                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="required">필수</option>
                                <option value="elective">선택</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                수행평가 비율 (%) <span class="text-red-500">*</span>
                            </label>
                            <input type="number" name="performance_ratio" required min="0" max="100" value="40"
                                   onchange="updateWrittenRatioPage(this)"
                                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                지필평가 비율 (%) <span class="text-gray-500 text-xs">자동 계산</span>
                            </label>
                            <input type="number" name="written_ratio" required min="0" max="100" value="60" readonly
                                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">기본 담당 교사</label>
                        <select name="teacher_id" 
                                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">선택 안함</option>
                            ${teachers.map(teacher => `
                                <option value="${teacher.id}">${teacher.userName} (${teacher.subject || '전공 미지정'})</option>
                            `).join('')}
                        </select>
                        <p class="text-xs text-gray-500 mt-1">과목의 기본 담당 교사를 선택할 수 있습니다. 선택하지 않아도 됩니다.</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
                        <textarea name="description" rows="4"
                                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="과목에 대한 설명을 입력하세요"></textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                        <button type="button" onclick="navigateToPage('subjects')"
                                class="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                            취소
                        </button>
                        <button type="submit"
                                class="px-6 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-sm transition-all font-medium">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // 폼 제출 이벤트
    document.getElementById('add-subject-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const teacherId = formData.get('teacher_id');
        const data = {
            name: formData.get('name'),
            code: formData.get('code'),
            grade: parseInt(formData.get('grade')),
            credits: parseInt(formData.get('credits')),
            subject_type: formData.get('subject_type'),
            performance_ratio: parseInt(formData.get('performance_ratio')),
            written_ratio: parseInt(formData.get('written_ratio')),
            description: formData.get('description'),
            teacher_id: teacherId ? parseInt(teacherId) : null
        };
        
        try {
            await axios.post('/api/subjects', data, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            alert('과목이 추가되었습니다.');
            navigateToPage('subjects');
        } catch (error) {
            console.error('과목 추가 오류:', error);
            alert('과목 추가에 실패했습니다: ' + (error.response?.data?.message || error.message));
        }
    });
    } catch (error) {
        console.error('과목 추가 페이지 로드 오류:', error);
        container.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">과목 추가 페이지를 불러오는데 실패했습니다</div>`;
    }
}

// ============================================
// 과목 편집 페이지 (페이지 기반)
// ============================================
async function showSubjectEditPage(container) {
    const subjectId = window.currentEditSubjectId;
    if (!subjectId) {
        container.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">과목 ID가 지정되지 않았습니다.</div>`;
        return;
    }
    
    try {
        const [subjectRes, teachersRes] = await Promise.all([
            axios.get(`/api/subjects/${subjectId}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            }),
            axios.get('/api/users?role=teacher&limit=1000', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            })
        ]);
        
        const subject = subjectRes.data.subject;
        
        // 교사 상세 정보 가져오기
        const teacherDetailsPromises = teachersRes.data.users.map(async (user) => {
            const res = await axios.get(`/api/users/${user.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            return { ...res.data.teacher, userName: user.name, userId: user.id };
        });
        
        const teachers = (await Promise.all(teacherDetailsPromises)).filter(t => t && t.id);
        
        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <div class="mb-6">
                    <button onclick="navigateToPage('subjects')" class="text-indigo-600 hover:text-indigo-800 mb-4 inline-flex items-center">
                        <i class="fas fa-arrow-left mr-2"></i>목록으로 돌아가기
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-book-open mr-3 text-indigo-500"></i>과목 편집
                    </h1>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <form id="edit-subject-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">과목명 <span class="text-red-500">*</span></label>
                                <input type="text" name="name" required value="${subject.name}"
                                       class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">과목 코드 <span class="text-red-500">*</span></label>
                                <input type="text" name="code" required value="${subject.code}"
                                       class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학년 <span class="text-red-500">*</span></label>
                                <select name="grade" required 
                                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="1" ${subject.grade === 1 ? 'selected' : ''}>1학년</option>
                                    <option value="2" ${subject.grade === 2 ? 'selected' : ''}>2학년</option>
                                    <option value="3" ${subject.grade === 3 ? 'selected' : ''}>3학년</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학점 <span class="text-red-500">*</span></label>
                                <input type="number" name="credits" required min="1" max="5" value="${subject.credits}"
                                       class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">과목 유형 <span class="text-red-500">*</span></label>
                                <select name="subject_type" required 
                                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="required" ${subject.subject_type === 'required' ? 'selected' : ''}>필수</option>
                                    <option value="elective" ${subject.subject_type === 'elective' ? 'selected' : ''}>선택</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    수행평가 비율 (%) <span class="text-red-500">*</span>
                                </label>
                                <input type="number" name="performance_ratio" required min="0" max="100" value="${subject.performance_ratio}"
                                       onchange="updateWrittenRatioPage(this)"
                                       class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    지필평가 비율 (%) <span class="text-gray-500 text-xs">자동 계산</span>
                                </label>
                                <input type="number" name="written_ratio" required min="0" max="100" value="${subject.written_ratio}" readonly
                                       class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">기본 담당 교사</label>
                            <select name="teacher_id" 
                                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">선택 안함</option>
                                ${teachers.map(teacher => `
                                    <option value="${teacher.id}" ${subject.teacher_id == teacher.id ? 'selected' : ''}>${teacher.userName} (${teacher.subject || '전공 미지정'})</option>
                                `).join('')}
                            </select>
                            <p class="text-xs text-gray-500 mt-1">과목의 기본 담당 교사를 선택할 수 있습니다. 선택하지 않아도 됩니다.</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
                            <textarea name="description" rows="4"
                                      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">${subject.description || ''}</textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                            <button type="button" onclick="navigateToPage('subjects')"
                                    class="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                                취소
                            </button>
                            <button type="submit"
                                    class="px-6 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-sm transition-all font-medium">
                                <i class="fas fa-save mr-2"></i>수정
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // 폼 제출 이벤트
        document.getElementById('edit-subject-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const teacherId = formData.get('teacher_id');
            const data = {
                name: formData.get('name'),
                code: formData.get('code'),
                grade: parseInt(formData.get('grade')),
                credits: parseInt(formData.get('credits')),
                subject_type: formData.get('subject_type'),
                performance_ratio: parseInt(formData.get('performance_ratio')),
                written_ratio: parseInt(formData.get('written_ratio')),
                description: formData.get('description'),
                teacher_id: teacherId ? parseInt(teacherId) : null
            };
            
            try {
                await axios.put(`/api/subjects/${subjectId}`, data, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                alert('과목이 수정되었습니다.');
                navigateToPage('subjects');
            } catch (error) {
                console.error('과목 수정 오류:', error);
                alert('과목 수정에 실패했습니다: ' + (error.response?.data?.message || error.message));
            }
        });
    } catch (error) {
        console.error('과목 로드 오류:', error);
        container.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">과목 정보를 불러오는데 실패했습니다</div>`;
    }
}

// 수행평가 비율 변경 시 지필평가 비율 자동 계산 (페이지용)
function updateWrittenRatioPage(performanceInput) {
    const performance = parseInt(performanceInput.value) || 0;
    const written = 100 - performance;
    const form = performanceInput.closest('form');
    form.querySelector('[name="written_ratio"]').value = written;
}


// 과목 편집 페이지로 이동
function editSubjectPage(subjectId) {
    window.currentEditSubjectId = subjectId;
    navigateToPage('subjects-edit');
}
