// 학생 상세 페이지

let currentStudentId = null;
let isEditMode = false;

// 학생 상세 페이지 표시 (조회 모드)
async function showStudentDetail(studentId) {
    currentStudentId = studentId;
    isEditMode = false;
    
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <div class="mb-6">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                    <button onclick="navigateToPage('students')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h2 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-user-graduate mr-2"></i>학생 정보
                    </h2>
                </div>
                <div class="flex gap-3">
                    <button onclick="showLifeRecordPage(${studentId})" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <i class="fas fa-book mr-2"></i>생활기록부
                    </button>
                    <button onclick="showGradeReportPage(${studentId})" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                        <i class="fas fa-file-alt mr-2"></i>성적표
                    </button>
                    <button onclick="editStudent(${studentId})" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <i class="fas fa-edit mr-2"></i>수정
                    </button>
                </div>
            </div>
            
            <div id="student-detail-content">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                </div>
            </div>
        </div>
    `;
    
    await loadStudentDetail();
}

// 학생 추가 페이지 표시
async function showAddStudentPage() {
    currentStudentId = null;
    isEditMode = true;
    
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <div class="mb-6">
            <div class="flex items-center mb-6">
                <button onclick="navigateToPage('students')" class="mr-4 text-gray-600 hover:text-gray-800">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-user-plus mr-2"></i>학생 등록
                </h2>
            </div>
            
            <div id="student-form-content"></div>
        </div>
    `;
    
    renderStudentForm(null);
}

// 학생 수정 모드로 전환
async function editStudent(studentId) {
    currentStudentId = studentId;
    isEditMode = true;
    
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <div class="mb-6">
            <div class="flex items-center mb-6">
                <button onclick="showStudentDetail(${studentId})" class="mr-4 text-gray-600 hover:text-gray-800">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-user-edit mr-2"></i>학생 정보 수정
                </h2>
            </div>
            
            <div id="student-form-content">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                </div>
            </div>
        </div>
    `;
    
    try {
        const response = await axios.get(`/api/students/${studentId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('학생 데이터 로드:', response.data);
        renderStudentForm(response.data.student);
    } catch (error) {
        console.error('학생 정보 로드 실패:', error);
        alert('학생 정보를 불러오는데 실패했습니다.');
        navigateToPage('students');
    }
}

// 학생 상세 정보 로드 (조회 모드)
async function loadStudentDetail() {
    try {
        const response = await axios.get(`/api/students/${currentStudentId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const student = response.data.student;
        renderStudentDetailView(student);
    } catch (error) {
        console.error('학생 정보 로드 실패:', error);
        document.getElementById('student-detail-content').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>학생 정보를 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 학생 정보 조회 뷰 렌더링
function renderStudentDetailView(student) {
    const content = document.getElementById('student-detail-content');
    
    content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- 프로필 카드 -->
            <div class="lg:col-span-1">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="text-center mb-6">
                        ${student.profile_photo_url 
                            ? `<img src="${student.profile_photo_url}" alt="프로필 사진" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">`
                            : `<div class="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center">
                                <i class="fas fa-user text-5xl text-gray-400"></i>
                            </div>`
                        }
                        <h3 class="text-2xl font-bold text-gray-800">${student.name}</h3>
                        <p class="text-gray-600">${student.student_number}</p>
                        <div class="mt-4">
                            <span class="px-3 py-1 rounded-full text-sm ${getStatusColor(student.status)}">
                                ${getStatusText(student.status)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="border-t pt-4">
                        <div class="space-y-3">
                            <div>
                                <p class="text-sm text-gray-500">이메일</p>
                                <p class="font-medium">${student.email || '-'}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">연락처</p>
                                <p class="font-medium">${student.phone || '-'}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">학년</p>
                                <p class="font-medium">${student.grade || '-'}학년</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">현재 반</p>
                                <p class="font-medium">${student.class_name || '미배정'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 상세 정보 -->
            <div class="lg:col-span-2 space-y-6">
                <!-- 기본 정보 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-info-circle mr-2 text-blue-600"></i>기본 정보
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500">생년월일</p>
                            <p class="font-medium">${student.birthdate || '-'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">성별</p>
                            <p class="font-medium">${student.gender === 'male' ? '남' : student.gender === 'female' ? '여' : '-'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">혈액형</p>
                            <p class="font-medium">${student.blood_type || '-'}형</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">종교</p>
                            <p class="font-medium">${student.religion || '-'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">국적</p>
                            <p class="font-medium">${student.nationality || 'KR'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">입학일</p>
                            <p class="font-medium">${student.admission_date || '-'}</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-sm text-gray-500">주소</p>
                            <p class="font-medium">${student.address || '-'}</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-sm text-gray-500">비상연락처</p>
                            <p class="font-medium">${student.emergency_contact || '-'}</p>
                        </div>
                    </div>
                </div>
                
                <!-- 보호자 정보 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-users mr-2 text-green-600"></i>보호자 정보
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500">보호자 이름</p>
                            <p class="font-medium">${student.guardian_name || '-'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">관계</p>
                            <p class="font-medium">${student.guardian_relation || '-'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">연락처</p>
                            <p class="font-medium">${student.guardian_phone || '-'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">이메일</p>
                            <p class="font-medium">${student.guardian_email || '-'}</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-sm text-gray-500">주소</p>
                            <p class="font-medium">${student.guardian_address || '-'}</p>
                        </div>
                    </div>
                </div>
                
                <!-- 학력 정보 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-school mr-2 text-purple-600"></i>이전 학력
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500">이전 학교</p>
                            <p class="font-medium">${student.previous_school || '-'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">학교 유형</p>
                            <p class="font-medium">${getPreviousSchoolTypeText(student.previous_school_type)}</p>
                        </div>
                    </div>
                </div>
                
                <!-- 건강 및 특이사항 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-notes-medical mr-2 text-red-600"></i>건강 및 특이사항
                    </h3>
                    <div class="space-y-4">
                        <div>
                            <p class="text-sm text-gray-500">의료 특이사항</p>
                            <p class="font-medium whitespace-pre-wrap">${student.medical_notes || '-'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">알레르기 정보</p>
                            <p class="font-medium whitespace-pre-wrap">${student.allergy_info || '-'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">기타 특이사항</p>
                            <p class="font-medium whitespace-pre-wrap">${student.special_notes || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 학생 폼 렌더링 (추가/수정)
function renderStudentForm(student) {
    const isNew = !student;
    const container = document.getElementById('student-form-content');
    
    container.innerHTML = `
        <form id="student-form">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- 프로필 카드 -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="text-center mb-6">
                            ${student?.profile_photo_url 
                                ? `<img src="${student.profile_photo_url}" alt="프로필 사진" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">`
                                : `<div class="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center">
                                    <i class="fas fa-user text-5xl text-gray-400"></i>
                                </div>`
                            }
                            <h3 class="text-2xl font-bold text-gray-800">${student?.name || '신규 학생'}</h3>
                            <p class="text-gray-600">${student?.student_number || '학번 미부여'}</p>
                            ${!isNew ? `
                            <div class="mt-4">
                                <span class="px-3 py-1 rounded-full text-sm ${getStatusColor(student?.status || 'enrolled')}">
                                    ${getStatusText(student?.status || 'enrolled')}
                                </span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class="border-t pt-4">
                            <p class="text-sm text-gray-500 mb-4">
                                ${isNew ? '새 학생을 등록합니다.' : '학생 정보를 수정합니다.'}
                            </p>
                            <div class="space-y-2 text-sm text-gray-600">
                                <p><i class="fas fa-info-circle mr-2 text-blue-500"></i>필수 입력 항목: *</p>
                                <p><i class="fas fa-check-circle mr-2 text-green-500"></i>선택 입력 가능</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 입력 폼 -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- 계정 정보 -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-user-circle mr-2 text-blue-600"></i>계정 정보
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            이름 <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="name" required 
                            value="${student?.name || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            학번 <span class="text-red-500">*</span>
                            ${isNew ? '<span class="text-sm text-gray-500">(형식: S연도일련번호, 예: S2024001)</span>' : ''}
                        </label>
                        <div class="flex gap-2">
                            <input type="text" id="student_number" required 
                                value="${student?.student_number || ''}"
                                ${isNew ? 'placeholder="학번 자동 생성 버튼 클릭"' : ''}
                                ${isNew ? '' : 'disabled'}
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isNew ? '' : 'bg-gray-100'}">
                            ${isNew ? `
                            <button type="button" onclick="generateStudentNumber()" 
                                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap">
                                <i class="fas fa-magic mr-1"></i>자동생성
                            </button>
                            ` : ''}
                        </div>
                    </div>
                    ${isNew ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            사용자명 (ID) <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="username" required 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            비밀번호 <span class="text-red-500">*</span>
                        </label>
                        <input type="password" id="password" required 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    ` : ''}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            이메일 <span class="text-red-500">*</span>
                        </label>
                        <input type="email" id="email" required 
                            value="${student?.email || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            연락처
                        </label>
                        <input type="tel" id="phone" 
                            value="${student?.phone || ''}"
                            placeholder="010-1234-5678"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
            </div>
            
            <!-- 기본 정보 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-info-circle mr-2 text-blue-600"></i>기본 정보
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            생년월일
                        </label>
                        <input type="date" id="birthdate" 
                            value="${student?.birthdate || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            성별
                        </label>
                        <select id="gender" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">선택하세요</option>
                            <option value="male" ${student?.gender === 'male' ? 'selected' : ''}>남</option>
                            <option value="female" ${student?.gender === 'female' ? 'selected' : ''}>여</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            혈액형
                        </label>
                        <select id="blood_type" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">선택하세요</option>
                            <option value="A" ${student?.blood_type === 'A' ? 'selected' : ''}>A형</option>
                            <option value="B" ${student?.blood_type === 'B' ? 'selected' : ''}>B형</option>
                            <option value="AB" ${student?.blood_type === 'AB' ? 'selected' : ''}>AB형</option>
                            <option value="O" ${student?.blood_type === 'O' ? 'selected' : ''}>O형</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            종교
                        </label>
                        <input type="text" id="religion" 
                            value="${student?.religion || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            국적
                        </label>
                        <input type="text" id="nationality" 
                            value="${student?.nationality || 'KR'}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            학년
                        </label>
                        <select id="grade" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">선택하세요</option>
                            <option value="1" ${student?.grade === 1 ? 'selected' : ''}>1학년</option>
                            <option value="2" ${student?.grade === 2 ? 'selected' : ''}>2학년</option>
                            <option value="3" ${student?.grade === 3 ? 'selected' : ''}>3학년</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            입학일
                        </label>
                        <input type="date" id="admission_date" 
                            value="${student?.admission_date || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            상태
                        </label>
                        <select id="status" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="enrolled" ${!student || student?.status === 'enrolled' ? 'selected' : ''}>재학</option>
                            <option value="graduated" ${student?.status === 'graduated' ? 'selected' : ''}>졸업</option>
                            <option value="transferred" ${student?.status === 'transferred' ? 'selected' : ''}>전학</option>
                            <option value="dropped" ${student?.status === 'dropped' ? 'selected' : ''}>자퇴</option>
                        </select>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            주소
                        </label>
                        <input type="text" id="address" 
                            value="${student?.address || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            비상연락처
                        </label>
                        <input type="tel" id="emergency_contact" 
                            value="${student?.emergency_contact || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
            </div>
            
            <!-- 보호자 정보 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-users mr-2 text-green-600"></i>보호자 정보
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            보호자 이름
                        </label>
                        <input type="text" id="guardian_name" 
                            value="${student?.guardian_name || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            관계
                        </label>
                        <input type="text" id="guardian_relation" 
                            value="${student?.guardian_relation || ''}"
                            placeholder="예: 부, 모, 조부모 등"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            보호자 연락처
                        </label>
                        <input type="tel" id="guardian_phone" 
                            value="${student?.guardian_phone || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            보호자 이메일
                        </label>
                        <input type="email" id="guardian_email" 
                            value="${student?.guardian_email || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            보호자 주소
                        </label>
                        <input type="text" id="guardian_address" 
                            value="${student?.guardian_address || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
            </div>
            
            <!-- 이전 학력 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-school mr-2 text-purple-600"></i>이전 학력
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            이전 학교명
                        </label>
                        <input type="text" id="previous_school" 
                            value="${student?.previous_school || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            학교 유형
                        </label>
                        <select id="previous_school_type" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">선택하세요</option>
                            <option value="elementary" ${student?.previous_school_type === 'elementary' ? 'selected' : ''}>초등학교</option>
                            <option value="middle" ${student?.previous_school_type === 'middle' ? 'selected' : ''}>중학교</option>
                            <option value="high" ${student?.previous_school_type === 'high' ? 'selected' : ''}>고등학교</option>
                            <option value="other" ${student?.previous_school_type === 'other' ? 'selected' : ''}>기타</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- 건강 및 특이사항 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-notes-medical mr-2 text-red-600"></i>건강 및 특이사항
                </h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            의료 특이사항
                        </label>
                        <textarea id="medical_notes" rows="3" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="지병, 복용 중인 약 등">${student?.medical_notes || ''}</textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            알레르기 정보
                        </label>
                        <textarea id="allergy_info" rows="3" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="음식, 약물, 환경 알레르기 등">${student?.allergy_info || ''}</textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            기타 특이사항
                        </label>
                        <textarea id="special_notes" rows="3" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="교육상 참고할 사항 등">${student?.special_notes || ''}</textarea>
                    </div>
                </div>
                
                <!-- 버튼 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-end space-x-4">
                        <button type="button" onclick="${isNew ? 'navigateToPage(\'students\')' : `showStudentDetail(${currentStudentId})`}" 
                            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            <i class="fas fa-times mr-2"></i>취소
                        </button>
                        <button type="submit" 
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>${isNew ? '등록' : '저장'}
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </form>
    `;
    
    // 폼 제출 이벤트
    document.getElementById('student-form').addEventListener('submit', handleStudentFormSubmit);
}

// 학생 폼 제출 처리
async function handleStudentFormSubmit(e) {
    e.preventDefault();
    
    const isNew = !currentStudentId;
    
    // 기본 데이터
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value || null,
        student_number: document.getElementById('student_number').value,
        grade: document.getElementById('grade').value ? parseInt(document.getElementById('grade').value) : null,
        admission_date: document.getElementById('admission_date').value || null,
        status: document.getElementById('status').value,
        address: document.getElementById('address').value || null,
        emergency_contact: document.getElementById('emergency_contact').value || null,
        
        // 추가 필드
        birthdate: document.getElementById('birthdate').value || null,
        gender: document.getElementById('gender').value || null,
        blood_type: document.getElementById('blood_type').value || null,
        religion: document.getElementById('religion').value || null,
        nationality: document.getElementById('nationality').value || 'KR',
        
        // 보호자 정보
        guardian_name: document.getElementById('guardian_name').value || null,
        guardian_relation: document.getElementById('guardian_relation').value || null,
        guardian_phone: document.getElementById('guardian_phone').value || null,
        guardian_email: document.getElementById('guardian_email').value || null,
        guardian_address: document.getElementById('guardian_address').value || null,
        
        // 이전 학력
        previous_school: document.getElementById('previous_school').value || null,
        previous_school_type: document.getElementById('previous_school_type').value || null,
        
        // 건강 및 특이사항
        medical_notes: document.getElementById('medical_notes').value || null,
        allergy_info: document.getElementById('allergy_info').value || null,
        special_notes: document.getElementById('special_notes').value || null
    };
    
    // 신규 등록 시 계정 정보 추가
    if (isNew) {
        formData.username = document.getElementById('username').value;
        formData.password = document.getElementById('password').value;
    }
    
    try {
        if (isNew) {
            await axios.post('/api/students', formData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('학생이 성공적으로 등록되었습니다.');
        } else {
            await axios.put(`/api/students/${currentStudentId}`, formData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('학생 정보가 수정되었습니다.');
        }
        
        navigateToPage('students');
    } catch (error) {
        console.error('학생 저장 실패:', error);
        alert(error.response?.data?.message || '학생 정보 저장에 실패했습니다.');
    }
}

// 이전 학교 유형 텍스트 변환
function getPreviousSchoolTypeText(type) {
    const texts = {
        'elementary': '초등학교',
        'middle': '중학교',
        'high': '고등학교',
        'other': '기타'
    };
    return texts[type] || '-';
}

// 학번 자동 생성
async function generateStudentNumber() {
    try {
        const response = await axios.get('/api/students/next-student-number', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        document.getElementById('student_number').value = response.data.student_number;
        
        // 작은 성공 메시지
        const button = event.target;
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check mr-1"></i>완료';
        button.classList.remove('bg-green-600', 'hover:bg-green-700');
        button.classList.add('bg-blue-600');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('bg-blue-600');
            button.classList.add('bg-green-600', 'hover:bg-green-700');
        }, 1500);
    } catch (error) {
        console.error('학번 생성 실패:', error);
        alert('학번 생성에 실패했습니다.');
    }
}
