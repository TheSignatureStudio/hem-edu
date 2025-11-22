// 시스템 설정 관리

// 시스템 설정 페이지 표시
async function showSystemSettings() {
    // 권한 체크
    if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
        alert('시스템 설정은 관리자만 접근할 수 있습니다.');
        navigateToPage('dashboard');
        return;
    }
    
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="mb-6">
            <div class="mb-6">
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-cog mr-2"></i>시스템 설정
                </h2>
                <p class="text-gray-600 mt-2">학교 정보 및 시스템 설정을 관리합니다</p>
            </div>
            
            <!-- 학교 기본 정보 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    <i class="fas fa-school mr-2"></i>학교 기본 정보
                </h3>
                <form id="school-info-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학교명</label>
                            <input type="text" id="setting-school-name" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="학교 이름">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학교 전화번호</label>
                            <input type="text" id="setting-school-phone" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="02-1234-5678">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">학교 주소</label>
                            <input type="text" id="setting-school-address" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="학교 주소">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">교장 이름</label>
                            <input type="text" id="setting-principal-name" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="교장 이름">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">담당 이메일</label>
                            <input type="email" id="setting-school-email" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="school@example.com">
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- 학사 일정 설정 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    <i class="fas fa-calendar-alt mr-2"></i>학사 일정 설정
                </h3>
                <form id="academic-settings-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학년도</label>
                            <input type="number" id="setting-current-year" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="2025">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">현재 학기</label>
                            <select id="setting-current-semester" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="1">1학기</option>
                                <option value="2">2학기</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">1학기 시작일</label>
                            <input type="date" id="setting-semester1-start" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">1학기 종료일</label>
                            <input type="date" id="setting-semester1-end" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">2학기 시작일</label>
                            <input type="date" id="setting-semester2-start" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">2학기 종료일</label>
                            <input type="date" id="setting-semester2-end" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- 출석 관리 설정 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    <i class="fas fa-clipboard-check mr-2"></i>출석 관리 설정
                </h3>
                <form id="attendance-settings-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">출석 확정 기간 (일)</label>
                            <input type="number" id="setting-attendance-lock-days" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="7"
                                   min="1">
                            <p class="text-xs text-gray-500 mt-1">이 기간이 지나면 출석 수정 불가</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">지각 인정 시간 (분)</label>
                            <input type="number" id="setting-late-threshold-minutes" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="10"
                                   min="1">
                        </div>
                        <div class="md:col-span-2">
                            <label class="flex items-center">
                                <input type="checkbox" id="setting-auto-absent" class="mr-2">
                                <span class="text-sm text-gray-700">출석 체크하지 않은 학생 자동 결석 처리</span>
                            </label>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- 성적 관리 설정 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    <i class="fas fa-chart-line mr-2"></i>성적 관리 설정
                </h3>
                <form id="grade-settings-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">성적 계산 방식</label>
                            <select id="setting-grade-calculation-method" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="average">평균</option>
                                <option value="weighted">가중평균</option>
                                <option value="sum">합계</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">합격 기준 점수</label>
                            <input type="number" id="setting-passing-score" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="60"
                                   min="0"
                                   max="100">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">A 등급 기준 (%)</label>
                            <input type="number" id="setting-grade-a-threshold" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="90"
                                   min="0"
                                   max="100">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">B 등급 기준 (%)</label>
                            <input type="number" id="setting-grade-b-threshold" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="80"
                                   min="0"
                                   max="100">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">C 등급 기준 (%)</label>
                            <input type="number" id="setting-grade-c-threshold" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="70"
                                   min="0"
                                   max="100">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">D 등급 기준 (%)</label>
                            <input type="number" id="setting-grade-d-threshold" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="60"
                                   min="0"
                                   max="100">
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- 봉사활동 설정 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    <i class="fas fa-hands-helping mr-2"></i>봉사활동 설정
                </h3>
                <form id="volunteer-settings-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">최소 필수 봉사시간 (시간/년)</label>
                            <input type="number" id="setting-min-volunteer-hours" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="20"
                                   min="0">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">봉사활동 승인 권한</label>
                            <select id="setting-volunteer-approval-role" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="teacher">담임교사</option>
                                <option value="admin">관리자만</option>
                                <option value="both">둘 다</option>
                            </select>
                        </div>
                        <div class="md:col-span-2">
                            <label class="flex items-center">
                                <input type="checkbox" id="setting-require-volunteer-proof" class="mr-2">
                                <span class="text-sm text-gray-700">봉사활동 증빙 자료 필수 제출</span>
                            </label>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // 초기 데이터 로드
    loadSystemSettings();
    
    // 폼 이벤트 리스너 등록
    setupSettingsForms();
}

// 시스템 설정 로드
async function loadSystemSettings() {
    try {
        const response = await axios.get('/api/settings', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const settings = response.data.settings;
        
        // 설정값을 입력 필드에 채우기
        settings.forEach(setting => {
            const element = document.getElementById(`setting-${setting.setting_key}`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = setting.setting_value === 'true' || setting.setting_value === '1';
                } else {
                    element.value = setting.setting_value || '';
                }
            }
        });
    } catch (error) {
        console.error('설정 로드 실패:', error);
    }
}

// 설정 폼 이벤트 리스너 설정
function setupSettingsForms() {
    // 학교 기본 정보 저장
    document.getElementById('school-info-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings([
            { key: 'school-name', value: document.getElementById('setting-school-name').value },
            { key: 'school-phone', value: document.getElementById('setting-school-phone').value },
            { key: 'school-address', value: document.getElementById('setting-school-address').value },
            { key: 'principal-name', value: document.getElementById('setting-principal-name').value },
            { key: 'school-email', value: document.getElementById('setting-school-email').value }
        ]);
    });
    
    // 학사 일정 설정 저장
    document.getElementById('academic-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings([
            { key: 'current-year', value: document.getElementById('setting-current-year').value },
            { key: 'current-semester', value: document.getElementById('setting-current-semester').value },
            { key: 'semester1-start', value: document.getElementById('setting-semester1-start').value },
            { key: 'semester1-end', value: document.getElementById('setting-semester1-end').value },
            { key: 'semester2-start', value: document.getElementById('setting-semester2-start').value },
            { key: 'semester2-end', value: document.getElementById('setting-semester2-end').value }
        ]);
    });
    
    // 출석 관리 설정 저장
    document.getElementById('attendance-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings([
            { key: 'attendance-lock-days', value: document.getElementById('setting-attendance-lock-days').value },
            { key: 'late-threshold-minutes', value: document.getElementById('setting-late-threshold-minutes').value },
            { key: 'auto-absent', value: document.getElementById('setting-auto-absent').checked.toString() }
        ]);
    });
    
    // 성적 관리 설정 저장
    document.getElementById('grade-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings([
            { key: 'grade-calculation-method', value: document.getElementById('setting-grade-calculation-method').value },
            { key: 'passing-score', value: document.getElementById('setting-passing-score').value },
            { key: 'grade-a-threshold', value: document.getElementById('setting-grade-a-threshold').value },
            { key: 'grade-b-threshold', value: document.getElementById('setting-grade-b-threshold').value },
            { key: 'grade-c-threshold', value: document.getElementById('setting-grade-c-threshold').value },
            { key: 'grade-d-threshold', value: document.getElementById('setting-grade-d-threshold').value }
        ]);
    });
    
    // 봉사활동 설정 저장
    document.getElementById('volunteer-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings([
            { key: 'min-volunteer-hours', value: document.getElementById('setting-min-volunteer-hours').value },
            { key: 'volunteer-approval-role', value: document.getElementById('setting-volunteer-approval-role').value },
            { key: 'require-volunteer-proof', value: document.getElementById('setting-require-volunteer-proof').checked.toString() }
        ]);
    });
}

// 설정 일괄 저장
async function saveSettings(settingsArray) {
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        
        const settings = settingsArray.map(item => ({
            setting_key: item.key,
            setting_value: item.value,
            setting_type: 'string'
        }));
        
        await axios.post('/api/settings/batch', {
            settings: settings,
            updated_by: userData.id
        }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        alert('설정이 저장되었습니다.');
    } catch (error) {
        console.error('설정 저장 실패:', error);
        alert('설정 저장에 실패했습니다.');
    }
}
