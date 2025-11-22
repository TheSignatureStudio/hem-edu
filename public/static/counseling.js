// 상담 내역 관리

// 상담 내역 페이지 표시
async function showCounselingManagement() {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-comments mr-2"></i>상담 내역 관리
                    </h2>
                    <p class="text-gray-600 mt-2">학생 상담 기록을 관리합니다</p>
                </div>
                <button onclick="navigateToPage('counseling-add')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                    <i class="fas fa-plus mr-2"></i>상담 기록 추가
                </button>
            </div>
            
            <!-- 필터 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">학생 검색</label>
                        <input type="text" id="filter-student" placeholder="학생 이름 또는 학번"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">상담 유형</label>
                        <select id="filter-counseling-type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">전체</option>
                            <option value="academic">학업</option>
                            <option value="career">진로</option>
                            <option value="personal">개인</option>
                            <option value="behavior">행동</option>
                            <option value="family">가정</option>
                            <option value="other">기타</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                        <input type="date" id="filter-start-date" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                        <input type="date" id="filter-end-date" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                </div>
                <div class="mt-4 flex justify-end space-x-2">
                    <button onclick="loadCounselingRecords()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <i class="fas fa-search mr-2"></i>검색
                    </button>
                    <button onclick="clearCounselingFilters()" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                        <i class="fas fa-redo mr-2"></i>초기화
                    </button>
                </div>
            </div>
            
            <!-- 상담 내역 목록 -->
            <div id="counseling-list" class="bg-white rounded-lg shadow-md p-6">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                    <p class="text-gray-600 mt-2">로딩 중...</p>
                </div>
            </div>
        </div>
    `;
    
    // 초기 데이터 로드
    loadCounselingRecords();
}

// 상담 내역 로드
async function loadCounselingRecords() {
    try {
        const filters = {
            counseling_type: document.getElementById('filter-counseling-type')?.value || '',
            start_date: document.getElementById('filter-start-date')?.value || '',
            end_date: document.getElementById('filter-end-date')?.value || ''
        };
        
        const queryParams = new URLSearchParams();
        if (filters.counseling_type) queryParams.append('counseling_type', filters.counseling_type);
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);
        
        const response = await axios.get(`/api/counseling?${queryParams.toString()}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const records = response.data.counseling_records;
        const listContainer = document.getElementById('counseling-list');
        
        if (!records || records.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
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
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상담일</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상담자</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">후속조치</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${records.map(record => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${record.counseling_date}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">${record.student_name}</div>
                                    <div class="text-sm text-gray-500">${record.student_number}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 text-xs rounded-full ${getCounselingTypeColor(record.counseling_type)}">
                                        ${getCounselingTypeText(record.counseling_type)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm">${record.title}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${record.counselor_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    ${record.follow_up_required ? 
                                        `<span class="text-orange-600"><i class="fas fa-exclamation-circle mr-1"></i>필요</span>` : 
                                        `<span class="text-gray-400">-</span>`
                                    }
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <button onclick="viewCounselingDetail(${record.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                                        <i class="fas fa-eye"></i> 보기
                                    </button>
                                    <button onclick="editCounseling(${record.id})" class="text-green-600 hover:text-green-800 mr-3">
                                        <i class="fas fa-edit"></i> 수정
                                    </button>
                                    <button onclick="deleteCounseling(${record.id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i> 삭제
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
        alert('상담 내역을 불러오는데 실패했습니다.');
    }
}

// 상담 유형 색상
function getCounselingTypeColor(type) {
    const colors = {
        'academic': 'bg-blue-100 text-blue-800',
        'career': 'bg-purple-100 text-purple-800',
        'personal': 'bg-green-100 text-green-800',
        'behavior': 'bg-red-100 text-red-800',
        'family': 'bg-yellow-100 text-yellow-800',
        'other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors['other'];
}

// 상담 유형 텍스트
function getCounselingTypeText(type) {
    const texts = {
        'academic': '학업',
        'career': '진로',
        'personal': '개인',
        'behavior': '행동',
        'family': '가정',
        'other': '기타'
    };
    return texts[type] || '기타';
}

// 상담 필터 초기화
function clearCounselingFilters() {
    document.getElementById('filter-student').value = '';
    document.getElementById('filter-counseling-type').value = '';
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    loadCounselingRecords();
}

// 상담 기록 추가 폼
async function showAddCounselingForm() {
    // 학생 목록 로드
    const studentsResponse = await axios.get('/api/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const students = studentsResponse.data.students;
    
    const modal = document.createElement('div');
    modal.id = 'counseling-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
            <h3 class="text-2xl font-bold mb-6 text-gray-800">
                <i class="fas fa-comments mr-2"></i>상담 기록 추가
            </h3>
            <form id="add-counseling-form" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                        <select id="counseling-student-id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">학생 선택</option>
                            ${students.map(s => `<option value="${s.id}">${s.name} (${s.student_number})</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">상담일 *</label>
                        <input type="date" id="counseling-date" required
                               value="${new Date().toISOString().split('T')[0]}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">상담 유형 *</label>
                        <select id="counseling-type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="academic">학업</option>
                            <option value="career">진로</option>
                            <option value="personal">개인</option>
                            <option value="behavior">행동</option>
                            <option value="family">가정</option>
                            <option value="other">기타</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                        <input type="text" id="counseling-title" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                               placeholder="상담 제목">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">상담 내용 *</label>
                    <textarea id="counseling-content" required rows="6"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="상담 내용을 자세히 기록하세요"></textarea>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex items-center">
                        <input type="checkbox" id="counseling-follow-up" class="mr-2">
                        <label for="counseling-follow-up" class="text-sm text-gray-700">후속 조치 필요</label>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">후속 조치 예정일</label>
                        <input type="date" id="counseling-follow-up-date"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div class="flex items-center">
                        <input type="checkbox" id="counseling-parent-notified" class="mr-2">
                        <label for="counseling-parent-notified" class="text-sm text-gray-700">학부모 통지 완료</label>
                    </div>
                    <div class="flex items-center">
                        <input type="checkbox" id="counseling-confidential" class="mr-2">
                        <label for="counseling-confidential" class="text-sm text-gray-700">비밀 상담</label>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" onclick="document.getElementById('counseling-modal').remove()"
                            class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        취소
                    </button>
                    <button type="submit"
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        저장
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('add-counseling-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = JSON.parse(localStorage.getItem('user'));
        
        const data = {
            student_id: document.getElementById('counseling-student-id').value,
            counselor_id: userData.id,
            counseling_date: document.getElementById('counseling-date').value,
            counseling_type: document.getElementById('counseling-type').value,
            title: document.getElementById('counseling-title').value,
            content: document.getElementById('counseling-content').value,
            follow_up_required: document.getElementById('counseling-follow-up').checked,
            follow_up_date: document.getElementById('counseling-follow-up-date').value || null,
            parent_notified: document.getElementById('counseling-parent-notified').checked,
            is_confidential: document.getElementById('counseling-confidential').checked
        };
        
        try {
            await axios.post('/api/counseling', data, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            alert('상담 기록이 추가되었습니다.');
            modal.remove();
            loadCounselingRecords();
        } catch (error) {
            console.error('상담 기록 추가 실패:', error);
            alert('상담 기록 추가에 실패했습니다.');
        }
    });
}

// 상담 상세 보기
async function viewCounselingDetail(id) {
    try {
        const response = await axios.get(`/api/counseling/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const record = response.data.counseling_record;
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
                <h3 class="text-2xl font-bold mb-6 text-gray-800">
                    <i class="fas fa-comments mr-2"></i>상담 내역 상세
                </h3>
                
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">학생</label>
                            <p class="text-gray-900">${record.student_name} (${record.student_number})</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">상담일</label>
                            <p class="text-gray-900">${record.counseling_date}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">상담 유형</label>
                            <span class="px-2 py-1 text-xs rounded-full ${getCounselingTypeColor(record.counseling_type)}">
                                ${getCounselingTypeText(record.counseling_type)}
                            </span>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">상담자</label>
                            <p class="text-gray-900">${record.counselor_name}</p>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">제목</label>
                        <p class="text-gray-900">${record.title}</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">상담 내용</label>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-gray-900 whitespace-pre-wrap">${record.content}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">후속 조치</label>
                            <p class="text-gray-900">${record.follow_up_required ? '필요' : '불필요'}</p>
                            ${record.follow_up_date ? `<p class="text-sm text-gray-600">예정일: ${record.follow_up_date}</p>` : ''}
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">학부모 통지</label>
                            <p class="text-gray-900">${record.parent_notified ? '완료' : '미완료'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">비밀 상담</label>
                            <p class="text-gray-900">${record.is_confidential ? '예' : '아니오'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">등록일</label>
                            <p class="text-gray-900">${record.created_at}</p>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()"
                            class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        닫기
                    </button>
                    <button onclick="editCounseling(${record.id}); this.closest('.fixed').remove();"
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        수정
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('상담 내역 조회 실패:', error);
        alert('상담 내역을 불러오는데 실패했습니다.');
    }
}

// 상담 기록 수정
async function editCounseling(id) {
    try {
        const response = await axios.get(`/api/counseling/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const record = response.data.counseling_record;
        
        // 학생 목록 로드
        const studentsResponse = await axios.get('/api/students', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const students = studentsResponse.data.students;
        
        const modal = document.createElement('div');
        modal.id = 'edit-counseling-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
                <h3 class="text-2xl font-bold mb-6 text-gray-800">
                    <i class="fas fa-edit mr-2"></i>상담 기록 수정
                </h3>
                <form id="edit-counseling-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                            <select id="edit-counseling-student-id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
                                ${students.map(s => 
                                    `<option value="${s.id}" ${s.id === record.student_id ? 'selected' : ''}>${s.name} (${s.student_number})</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">상담일 *</label>
                            <input type="date" id="edit-counseling-date" required value="${record.counseling_date}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">상담 유형 *</label>
                            <select id="edit-counseling-type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="academic" ${record.counseling_type === 'academic' ? 'selected' : ''}>학업</option>
                                <option value="career" ${record.counseling_type === 'career' ? 'selected' : ''}>진로</option>
                                <option value="personal" ${record.counseling_type === 'personal' ? 'selected' : ''}>개인</option>
                                <option value="behavior" ${record.counseling_type === 'behavior' ? 'selected' : ''}>행동</option>
                                <option value="family" ${record.counseling_type === 'family' ? 'selected' : ''}>가정</option>
                                <option value="other" ${record.counseling_type === 'other' ? 'selected' : ''}>기타</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                            <input type="text" id="edit-counseling-title" required value="${record.title}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">상담 내용 *</label>
                        <textarea id="edit-counseling-content" required rows="6"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg">${record.content}</textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center">
                            <input type="checkbox" id="edit-counseling-follow-up" class="mr-2" ${record.follow_up_required ? 'checked' : ''}>
                            <label for="edit-counseling-follow-up" class="text-sm text-gray-700">후속 조치 필요</label>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">후속 조치 예정일</label>
                            <input type="date" id="edit-counseling-follow-up-date" value="${record.follow_up_date || ''}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" id="edit-counseling-parent-notified" class="mr-2" ${record.parent_notified ? 'checked' : ''}>
                            <label for="edit-counseling-parent-notified" class="text-sm text-gray-700">학부모 통지 완료</label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" id="edit-counseling-confidential" class="mr-2" ${record.is_confidential ? 'checked' : ''}>
                            <label for="edit-counseling-confidential" class="text-sm text-gray-700">비밀 상담</label>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 mt-6">
                        <button type="button" onclick="document.getElementById('edit-counseling-modal').remove()"
                                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            취소
                        </button>
                        <button type="submit"
                                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            저장
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('edit-counseling-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const data = {
                counseling_date: document.getElementById('edit-counseling-date').value,
                counseling_type: document.getElementById('edit-counseling-type').value,
                title: document.getElementById('edit-counseling-title').value,
                content: document.getElementById('edit-counseling-content').value,
                follow_up_required: document.getElementById('edit-counseling-follow-up').checked,
                follow_up_date: document.getElementById('edit-counseling-follow-up-date').value || null,
                parent_notified: document.getElementById('edit-counseling-parent-notified').checked,
                is_confidential: document.getElementById('edit-counseling-confidential').checked
            };
            
            try {
                await axios.put(`/api/counseling/${id}`, data, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                
                alert('상담 기록이 수정되었습니다.');
                modal.remove();
                loadCounselingRecords();
            } catch (error) {
                console.error('상담 기록 수정 실패:', error);
                alert('상담 기록 수정에 실패했습니다.');
            }
        });
    } catch (error) {
        console.error('상담 내역 조회 실패:', error);
        alert('상담 내역을 불러오는데 실패했습니다.');
    }
}

// 상담 기록 삭제
async function deleteCounseling(id) {
    if (!confirm('정말 이 상담 기록을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        await axios.delete(`/api/counseling/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        alert('상담 기록이 삭제되었습니다.');
        loadCounselingRecords();
    } catch (error) {
        console.error('상담 기록 삭제 실패:', error);
        alert('상담 기록 삭제에 실패했습니다.');
    }
}
