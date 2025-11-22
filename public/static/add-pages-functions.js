
// ============================================
// 봉사활동 추가 페이지
// ============================================
async function showVolunteerAddPage(container) {
    try {
        const [studentsRes, semestersRes] = await Promise.all([
            axios.get('/api/students', { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/semesters', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="navigateToPage('volunteer')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">봉사활동 등록</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="volunteer-add-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    ${studentsRes.data.students.map(s => `<option value="${s.id}">${s.name} (${s.student_number})</option>`).join('')}
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
                            <button type="button" onclick="navigateToPage('volunteer')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
        
        document.getElementById('volunteer-add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.post('/api/volunteer', data, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                alert('봉사활동이 등록되었습니다.');
                navigateToPage('volunteer');
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

// ============================================
// 봉사활동 수정 페이지
// ============================================
async function showVolunteerEditPage(container) {
    const volunteerId = window.currentVolunteerId;
    if (!volunteerId) {
        alert('수정할 봉사활동을 선택해주세요.');
        navigateToPage('volunteer');
        return;
    }
    
    try {
        const [volunteerRes, studentsRes, semestersRes] = await Promise.all([
            axios.get(`/api/volunteer/${volunteerId}`, { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/students', { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/semesters', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const volunteer = volunteerRes.data;
        
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="navigateToPage('volunteer')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">봉사활동 수정</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="volunteer-edit-form" class="space-y-6">
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
                            <button type="button" onclick="navigateToPage('volunteer')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
        
        document.getElementById('volunteer-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.put(`/api/volunteer/${volunteerId}`, data, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                alert('봉사활동이 수정되었습니다.');
                navigateToPage('volunteer');
            } catch (error) {
                console.error('봉사활동 수정 실패:', error);
                alert('봉사활동 수정에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load volunteer edit page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
    }
}

// 봉사활동 수정 헬퍼 함수
function editVolunteer(id) {
    window.currentVolunteerId = id;
    navigateToPage('volunteer-edit');
}

// 봉사활동 삭제 헬퍼 함수
async function deleteVolunteer(id) {
    if (!confirm('이 봉사활동을 삭제하시겠습니까?')) return;
    
    try {
        await axios.delete(`/api/volunteer/${id}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        alert('삭제되었습니다.');
        navigateToPage('volunteer');
    } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제에 실패했습니다.');
    }
}

// ============================================
// 수상 추가 페이지
// ============================================
async function showAwardAddPage(container) {
    try {
        const [studentsRes, semestersRes] = await Promise.all([
            axios.get('/api/students', { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/semesters', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="navigateToPage('awards')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">수상 등록</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="award-add-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    ${studentsRes.data.students.map(s => `<option value="${s.id}">${s.name} (${s.student_number})</option>`).join('')}
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
                            <button type="button" onclick="navigateToPage('awards')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
        
        document.getElementById('award-add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.post('/api/awards', data, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                alert('수상이 등록되었습니다.');
                navigateToPage('awards');
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

// ============================================
// 수상 수정 페이지
// ============================================
async function showAwardEditPage(container) {
    const awardId = window.currentAwardId;
    if (!awardId) {
        alert('수정할 수상을 선택해주세요.');
        navigateToPage('awards');
        return;
    }
    
    try {
        const [awardRes, studentsRes, semestersRes] = await Promise.all([
            axios.get(`/api/awards/${awardId}`, { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/students', { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/semesters', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const award = awardRes.data;
        
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="navigateToPage('awards')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">수상 수정</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="award-edit-form" class="space-y-6">
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
                            <button type="button" onclick="navigateToPage('awards')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
        
        document.getElementById('award-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.put(`/api/awards/${awardId}`, data, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                alert('수상이 수정되었습니다.');
                navigateToPage('awards');
            } catch (error) {
                console.error('수상 수정 실패:', error);
                alert('수상 수정에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load award edit page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
    }
}

// 수상 수정/삭제 헬퍼 함수
function editAward(id) {
    window.currentAwardId = id;
    navigateToPage('awards-edit');
}

async function deleteAward(id) {
    if (!confirm('이 수상을 삭제하시겠습니까?')) return;
    
    try {
        await axios.delete(`/api/awards/${id}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        alert('삭제되었습니다.');
        navigateToPage('awards');
    } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제에 실패했습니다.');
    }
}

// ============================================
// 독서활동 추가 페이지
// ============================================
async function showReadingAddPage(container) {
    try {
        const [studentsRes, semestersRes] = await Promise.all([
            axios.get('/api/students', { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/semesters', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="navigateToPage('reading')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">독서활동 등록</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="reading-add-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    ${studentsRes.data.students.map(s => `<option value="${s.id}">${s.name} (${s.student_number})</option>`).join('')}
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
                            <button type="button" onclick="navigateToPage('reading')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
        
        document.getElementById('reading-add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.post('/api/reading', data, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                alert('독서활동이 등록되었습니다.');
                navigateToPage('reading');
            } catch (error) {
                console.error('독서활동 등록 실패:', error);
                alert('독서활동 등록에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load reading add page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
    }
}

// ============================================
// 독서활동 수정 페이지
// ============================================
async function showReadingEditPage(container) {
    const readingId = window.currentReadingId;
    if (!readingId) {
        alert('수정할 독서활동을 선택해주세요.');
        navigateToPage('reading');
        return;
    }
    
    try {
        const [readingRes, studentsRes, semestersRes] = await Promise.all([
            axios.get(`/api/reading/${readingId}`, { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/students', { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/semesters', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const reading = readingRes.data;
        
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="navigateToPage('reading')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">독서활동 수정</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="reading-edit-form" class="space-y-6">
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
                            <button type="button" onclick="navigateToPage('reading')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
        
        document.getElementById('reading-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.put(`/api/reading/${readingId}`, data, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                alert('독서활동이 수정되었습니다.');
                navigateToPage('reading');
            } catch (error) {
                console.error('독서활동 수정 실패:', error);
                alert('독서활동 수정에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load reading edit page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
    }
}

// 독서활동 수정/삭제 헬퍼 함수
function editReading(id) {
    window.currentReadingId = id;
    navigateToPage('reading-edit');
}

async function deleteReading(id) {
    if (!confirm('이 독서활동을 삭제하시겠습니까?')) return;
    
    try {
        await axios.delete(`/api/reading/${id}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        alert('삭제되었습니다.');
        navigateToPage('reading');
    } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제에 실패했습니다.');
    }
}

// ============================================
// 상담기록 추가 페이지
// ============================================
async function showCounselingAddPage(container) {
    try {
        let students = [];
        
        // 교사인 경우 담당 과목 학생 + 담임 반 학생만 가져오기
        if (currentUser && currentUser.role === 'teacher' && window.currentTeacher) {
            // 1. 담임인 반의 학생들 가져오기
            const homeroomResponse = await axios.get(`/api/teacher-homeroom?teacher_id=${window.currentTeacher.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            const homeroomClasses = (homeroomResponse.data.homerooms || []).map(h => h.class_id);
            
            // 2. 담당 과목의 학생들 가져오기
            const coursesResponse = await axios.get(`/api/courses?teacher_id=${window.currentTeacher.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            const courses = coursesResponse.data.courses || [];
            
            // 담임 반 학생들 가져오기
            if (homeroomClasses.length > 0) {
                for (const classId of homeroomClasses) {
                    try {
                        const classStudentsRes = await axios.get(`/api/students?class_id=${classId}`, {
                            headers: { 'Authorization': 'Bearer ' + authToken }
                        });
                        const classStudents = classStudentsRes.data.students || [];
                        students.push(...classStudents);
                    } catch (error) {
                        console.error('반 학생 조회 실패:', error);
                    }
                }
            }
            
            // 담당 과목이 있는 반의 학생들도 포함
            const courseClassIds = [...new Set(courses.map(c => c.class_id).filter(id => id))];
            for (const classId of courseClassIds) {
                if (!homeroomClasses.includes(classId)) {
                    try {
                        const courseClassStudentsRes = await axios.get(`/api/students?class_id=${classId}`, {
                            headers: { 'Authorization': 'Bearer ' + authToken }
                        });
                        const courseClassStudents = courseClassStudentsRes.data.students || [];
                        students.push(...courseClassStudents);
                    } catch (error) {
                        console.error('과목 반 학생 조회 실패:', error);
                    }
                }
            }
            
            // 중복 제거 (student_id 기준)
            const uniqueStudents = [];
            const seenIds = new Set();
            for (const student of students) {
                if (!seenIds.has(student.id)) {
                    seenIds.add(student.id);
                    uniqueStudents.push(student);
                }
            }
            students = uniqueStudents;
        } else {
            // 관리자는 전체 학생
            const studentsRes = await axios.get('/api/students?limit=1000', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            students = studentsRes.data.students || [];
        }
        
        const semestersRes = await axios.get('/api/semesters', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="navigateToPage('counseling')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">상담기록 등록</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="counseling-add-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    ${students.map(s => `<option value="${s.id}">${s.name} (${s.student_number})</option>`).join('')}
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
                            <button type="button" onclick="navigateToPage('counseling')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
        
        document.getElementById('counseling-add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // checkbox 처리
            data.is_confidential = data.is_confidential ? 1 : 0;
            
            try {
                await axios.post('/api/counseling', data, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                alert('상담기록이 등록되었습니다.');
                navigateToPage('counseling');
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

// ============================================
// 상담기록 수정 페이지
// ============================================
async function showCounselingEditPage(container) {
    const counselingId = window.currentCounselingId;
    if (!counselingId) {
        alert('수정할 상담기록을 선택해주세요.');
        navigateToPage('counseling');
        return;
    }
    
    try {
        let students = [];
        
        // 교사인 경우 담당 과목 학생 + 담임 반 학생만 가져오기
        if (currentUser && currentUser.role === 'teacher' && window.currentTeacher) {
            // 1. 담임인 반의 학생들 가져오기
            const homeroomResponse = await axios.get(`/api/teacher-homeroom?teacher_id=${window.currentTeacher.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            const homeroomClasses = (homeroomResponse.data.homerooms || []).map(h => h.class_id);
            
            // 2. 담당 과목의 학생들 가져오기
            const coursesResponse = await axios.get(`/api/courses?teacher_id=${window.currentTeacher.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            const courses = coursesResponse.data.courses || [];
            
            // 담임 반 학생들 가져오기
            if (homeroomClasses.length > 0) {
                for (const classId of homeroomClasses) {
                    try {
                        const classStudentsRes = await axios.get(`/api/students?class_id=${classId}`, {
                            headers: { 'Authorization': 'Bearer ' + authToken }
                        });
                        const classStudents = classStudentsRes.data.students || [];
                        students.push(...classStudents);
                    } catch (error) {
                        console.error('반 학생 조회 실패:', error);
                    }
                }
            }
            
            // 담당 과목이 있는 반의 학생들도 포함
            const courseClassIds = [...new Set(courses.map(c => c.class_id).filter(id => id))];
            for (const classId of courseClassIds) {
                if (!homeroomClasses.includes(classId)) {
                    try {
                        const courseClassStudentsRes = await axios.get(`/api/students?class_id=${classId}`, {
                            headers: { 'Authorization': 'Bearer ' + authToken }
                        });
                        const courseClassStudents = courseClassStudentsRes.data.students || [];
                        students.push(...courseClassStudents);
                    } catch (error) {
                        console.error('과목 반 학생 조회 실패:', error);
                    }
                }
            }
            
            // 중복 제거 (student_id 기준)
            const uniqueStudents = [];
            const seenIds = new Set();
            for (const student of students) {
                if (!seenIds.has(student.id)) {
                    seenIds.add(student.id);
                    uniqueStudents.push(student);
                }
            }
            students = uniqueStudents;
        } else {
            // 관리자는 전체 학생
            const studentsRes = await axios.get('/api/students?limit=1000', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            students = studentsRes.data.students || [];
        }
        
        const [counselingRes, semestersRes] = await Promise.all([
            axios.get(`/api/counseling/${counselingId}`, { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/semesters', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const counseling = counselingRes.data;
        
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="navigateToPage('counseling')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">상담기록 수정</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="counseling-edit-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${students.map(s => `<option value="${s.id}" ${s.id == counseling.student_id ? 'selected' : ''}>${s.name} (${s.student_number})</option>`).join('')}
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
                            <button type="button" onclick="navigateToPage('counseling')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
        
        document.getElementById('counseling-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // checkbox 처리
            data.is_confidential = data.is_confidential ? 1 : 0;
            
            try {
                await axios.put(`/api/counseling/${counselingId}`, data, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                alert('상담기록이 수정되었습니다.');
                navigateToPage('counseling');
            } catch (error) {
                console.error('상담기록 수정 실패:', error);
                alert('상담기록 수정에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load counseling edit page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
    }
}

// 상담기록 수정/삭제 헬퍼 함수
function editCounseling(id) {
    window.currentCounselingId = id;
    navigateToPage('counseling-edit');
}

async function deleteCounseling(id) {
    if (!confirm('이 상담기록을 삭제하시겠습니까?')) return;
    
    try {
        await axios.delete(`/api/counseling/${id}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        alert('삭제되었습니다.');
        navigateToPage('counseling');
    } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제에 실패했습니다.');
    }
}

// ============================================
// 반 추가 페이지
// ============================================
async function showClassAddPage(container) {
    try {
        const [semestersRes, teachersRes] = await Promise.all([
            axios.get('/api/semesters', { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/users?role=teacher&limit=1000', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        // 교사 ID를 teachers 테이블에서 가져오기
        const teacherDetailsPromises = teachersRes.data.users.map(async (user) => {
            const res = await axios.get(`/api/users/${user.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            return res.data.teacher;
        });
        
        const teacherDetails = await Promise.all(teacherDetailsPromises);
        const teachers = teacherDetails.filter(t => t); // null 제거
        
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="navigateToPage('classes')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">반 추가</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="class-add-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">반 이름 *</label>
                                <input type="text" name="name" required placeholder="예: 1학년 1반" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학년 *</label>
                                <select name="grade" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">선택하세요</option>
                                    <option value="1">1학년</option>
                                    <option value="2">2학년</option>
                                    <option value="3">3학년</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <label class="block text-sm font-medium text-gray-700 mb-2">담임교사</label>
                                <select name="homeroom_teacher_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">선택 안함</option>
                                    ${teachers.map(t => {
                                        const teacherUser = teachersRes.data.users.find(u => u.id === t.user_id);
                                        return `<option value="${t.id}">${teacherUser?.name || '알 수 없음'}</option>`;
                                    }).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">교실 번호</label>
                                <input type="text" name="room_number" placeholder="예: 101" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">정원</label>
                                <input type="number" name="max_students" value="30" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="navigateToPage('classes')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                추가
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('class-add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.post('/api/classes', {
                    name: data.name,
                    grade: parseInt(data.grade),
                    semester_id: parseInt(data.semester_id),
                    homeroom_teacher_id: data.homeroom_teacher_id ? parseInt(data.homeroom_teacher_id) : null,
                    room_number: data.room_number || null,
                    max_students: data.max_students ? parseInt(data.max_students) : 30
                }, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                
                alert('반이 추가되었습니다.');
                navigateToPage('classes');
            } catch (error) {
                console.error('반 추가 실패:', error);
                alert('반 추가에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load class add page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
    }
}

// ============================================
// 사용자 추가 페이지
// ============================================
async function showUserAddPage(container) {
    container.innerHTML = `
        <div>
            <div class="flex items-center mb-8">
                <button onclick="navigateToPage('users')" class="mr-4 text-gray-600 hover:text-gray-800">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <h1 class="text-3xl font-bold text-gray-800">사용자 추가</h1>
            </div>
            
            <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                <form id="user-add-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                            <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">아이디 (로그인용) *</label>
                            <input type="text" name="username" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 *</label>
                            <input type="password" name="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인 *</label>
                            <input type="password" name="password_confirm" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>
                            <input type="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                            <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">권한 *</label>
                        <select name="role" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">선택하세요</option>
                            <option value="super_admin">최고관리자</option>
                            <option value="admin">관리자</option>
                            <option value="teacher">교사</option>
                            <option value="parent">학부모</option>
                        </select>
                        <p class="text-xs text-gray-500 mt-1">
                            <i class="fas fa-info-circle mr-1"></i>
                            최고관리자는 모든 권한을 가지며, 관리자는 학생/교사 관리 권한을 가집니다.
                        </p>
                    </div>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div class="flex items-start">
                            <i class="fas fa-exclamation-triangle text-yellow-600 mr-2 mt-0.5"></i>
                            <div>
                                <h4 class="font-semibold text-yellow-900 mb-1">학생 등록 안내</h4>
                                <p class="text-sm text-yellow-800">
                                    <strong>학생 계정은 이곳에서 생성할 수 없습니다.</strong><br>
                                    학생은 <a href="#" onclick="navigateToPage('students'); return false;" class="underline font-semibold hover:text-yellow-900">"학생 관리"</a> 메뉴에서 등록해주세요.<br>
                                    (학번, 학년, 반 등의 학적 정보가 필요합니다)
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 class="font-semibold text-blue-900 mb-2">권한 설명</h4>
                        <ul class="text-sm text-blue-800 space-y-1">
                            <li><i class="fas fa-crown text-purple-600 mr-1"></i> <strong>최고관리자:</strong> 모든 시스템 관리 권한</li>
                            <li><i class="fas fa-user-shield text-blue-600 mr-1"></i> <strong>관리자:</strong> 교사/학생 관리, 성적 입력 권한</li>
                            <li><i class="fas fa-chalkboard-teacher text-green-600 mr-1"></i> <strong>교사:</strong> 담당 반 관리, 출석/성적 입력 권한</li>
                            <li><i class="fas fa-user-friends text-pink-600 mr-1"></i> <strong>학부모:</strong> 자녀 정보 조회 권한</li>
                        </ul>
                    </div>
                    
                    <div class="flex justify-end space-x-4 pt-4">
                        <button type="button" onclick="navigateToPage('users')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            취소
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            추가
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('user-add-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // 비밀번호 확인
        if (data.password !== data.password_confirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        
        try {
            await axios.post('/api/users', {
                username: data.username,
                password: data.password,
                email: data.email,
                name: data.name,
                role: data.role,
                phone: data.phone || null
            }, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            
            alert('사용자가 추가되었습니다.');
            navigateToPage('users');
        } catch (error) {
            console.error('사용자 추가 실패:', error);
            alert('사용자 추가에 실패했습니다: ' + (error.response?.data?.error || error.message));
        }
    });
}

// ============================================
// 사용자 수정 페이지
// ============================================
async function showUserEditPage(container) {
    const userId = window.currentEditUserId;
    if (!userId) {
        alert('수정할 사용자를 선택해주세요.');
        navigateToPage('users');
        return;
    }
    
    try {
        const response = await axios.get(`/api/users/${userId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const user = response.data.user;
        
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="navigateToPage('users')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">사용자 수정</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="user-edit-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                                <input type="text" name="name" value="${user.name}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">아이디</label>
                                <input type="text" value="${user.username}" disabled class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                                <p class="text-xs text-gray-500 mt-1">아이디는 변경할 수 없습니다.</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>
                                <input type="email" name="email" value="${user.email}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                                <input type="tel" name="phone" value="${user.phone || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">현재 권한</label>
                            <input type="text" value="${getRoleLabel(user.role)}" disabled class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                            <p class="text-xs text-gray-500 mt-1">권한은 사용자 목록에서 별도로 변경할 수 있습니다.</p>
                        </div>
                        
                        <div class="border-t pt-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">비밀번호 변경 (선택사항)</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
                                    <input type="password" name="new_password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 확인</label>
                                    <input type="password" name="new_password_confirm" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 mt-2">
                                <i class="fas fa-info-circle mr-1"></i>
                                비밀번호를 변경하지 않으려면 비워두세요.
                            </p>
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="navigateToPage('users')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
        
        document.getElementById('user-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // 비밀번호 확인
            if (data.new_password || data.new_password_confirm) {
                if (data.new_password !== data.new_password_confirm) {
                    alert('새 비밀번호가 일치하지 않습니다.');
                    return;
                }
            }
            
            try {
                const updateData = {
                    name: data.name,
                    email: data.email,
                    phone: data.phone || null
                };
                
                // 비밀번호가 입력된 경우에만 포함
                if (data.new_password) {
                    updateData.password = data.new_password;
                }
                
                await axios.put(`/api/users/${userId}`, updateData, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                
                alert('사용자 정보가 수정되었습니다.');
                navigateToPage('users');
            } catch (error) {
                console.error('사용자 수정 실패:', error);
                alert('사용자 수정에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load user edit page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
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
