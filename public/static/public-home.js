// ============================================
// 공개 홈페이지 (로그인 전)
// ============================================

// 공개 홈페이지 표시
function showPublicHome() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <!-- 공개 학교 홈페이지 -->
        <div id="public-home" class="min-h-screen bg-white">
            <!-- 헤더 -->
            <header class="bg-white shadow-sm sticky top-0 z-50">
                <div class="container mx-auto px-4 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4 cursor-pointer" onclick="navigatePublicPage('home')">
                            <div class="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                                <i class="fas fa-graduation-cap text-white text-xl"></i>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-800">대안학교</h1>
                                <p class="text-sm text-gray-500">꿈을 키우는 학교</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-8">
                            <nav class="hidden md:flex space-x-8">
                                <a href="#" class="public-nav-item text-gray-600 hover:text-purple-600 font-medium transition-colors" data-page="home">홈</a>
                                <a href="#" class="public-nav-item text-gray-600 hover:text-purple-600 font-medium transition-colors" data-page="about">학교소개</a>
                                <a href="#" class="public-nav-item text-gray-600 hover:text-purple-600 font-medium transition-colors" data-page="education">교육과정</a>
                                <a href="#" class="public-nav-item text-gray-600 hover:text-purple-600 font-medium transition-colors" data-page="notice">공지사항</a>
                                <a href="#" class="public-nav-item text-gray-600 hover:text-purple-600 font-medium transition-colors" data-page="location">오시는 길</a>
                            </nav>
                            <button onclick="showLoginModal()" class="btn-pastel-primary px-6 py-2 rounded-lg font-medium">
                                <i class="fas fa-sign-in-alt mr-2"></i>로그인
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <!-- 메인 컨텐츠 -->
            <main id="public-content">
                <!-- 여기에 동적으로 컨텐츠 로드 -->
            </main>

            <!-- 푸터 -->
            <footer class="bg-gray-800 text-white py-12 mt-20">
                <div class="container mx-auto px-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 class="text-xl font-bold mb-4">대안학교</h3>
                            <p class="text-gray-400 text-sm">
                                꿈을 키우고 가능성을 발견하는<br>
                                행복한 배움의 공간
                            </p>
                        </div>
                        <div>
                            <h4 class="font-semibold mb-4">바로가기</h4>
                            <ul class="space-y-2 text-sm text-gray-400">
                                <li><a href="#" onclick="navigatePublicPage('about')" class="hover:text-white transition-colors">학교소개</a></li>
                                <li><a href="#" onclick="navigatePublicPage('education')" class="hover:text-white transition-colors">교육과정</a></li>
                                <li><a href="#" onclick="navigatePublicPage('notice')" class="hover:text-white transition-colors">공지사항</a></li>
                                <li><a href="#" onclick="navigatePublicPage('location')" class="hover:text-white transition-colors">오시는 길</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 class="font-semibold mb-4">문의</h4>
                            <ul class="space-y-2 text-sm text-gray-400">
                                <li><i class="fas fa-phone mr-2"></i>대표전화: 000-0000-0000</li>
                                <li><i class="fas fa-envelope mr-2"></i>이메일: school@example.com</li>
                                <li><i class="fas fa-map-marker-alt mr-2"></i>주소: 서울시 강남구</li>
                            </ul>
                        </div>
                    </div>
                    <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
                        <p>&copy; 2024 대안학교. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>

        <!-- 로그인 모달 -->
        <div id="login-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
                <button onclick="closeLoginModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-2xl"></i>
                </button>
                
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-100 mb-4">
                        <i class="fas fa-graduation-cap text-2xl text-purple-600"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-1">로그인</h2>
                    <p class="text-gray-500 text-sm">학적 관리 시스템</p>
                </div>
                
                <div id="login-error" class="hidden bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4">
                    <span id="error-message"></span>
                </div>
                
                <form id="login-form" class="space-y-5">
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">아이디</label>
                        <input type="text" id="username" required class="input-modern w-full">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">비밀번호</label>
                        <input type="password" id="password" required class="input-modern w-full">
                    </div>
                    <button type="submit" class="btn-pastel-primary w-full py-3 rounded-lg font-medium">
                        로그인
                    </button>
                </form>
                
                <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p class="text-xs font-semibold text-gray-700 mb-2">테스트 계정</p>
                    <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div><span class="font-medium">관리자:</span> admin</div>
                        <div><span class="font-medium">교사:</span> teacher1</div>
                        <div><span class="font-medium">학생:</span> student1</div>
                        <div><span class="font-medium">학부모:</span> parent1</div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">비밀번호: [계정명]123</p>
                </div>
            </div>
        </div>
    `;

    // 기본 홈 페이지 로드
    showPublicHomePage();
    
    // 네비게이션 이벤트 설정
    setupPublicNavigation();
}

// 공개 네비게이션 설정
function setupPublicNavigation() {
    document.querySelectorAll('.public-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            
            // 활성 상태 업데이트
            document.querySelectorAll('.public-nav-item').forEach(link => {
                link.classList.remove('text-purple-600', 'font-semibold');
                link.classList.add('text-gray-600');
            });
            e.target.classList.add('text-purple-600', 'font-semibold');
            e.target.classList.remove('text-gray-600');
            
            navigatePublicPage(page);
        });
    });
}

// 공개 페이지 네비게이션
function navigatePublicPage(page) {
    switch (page) {
        case 'home':
            showPublicHomePage();
            break;
        case 'about':
            showAboutPage();
            break;
        case 'education':
            showEducationPage();
            break;
        case 'notice':
            showPublicNoticePage();
            break;
        case 'location':
            showLocationPage();
            break;
        default:
            showPublicHomePage();
    }
}

// ============================================
// 메인 홈 페이지
// ============================================
function showPublicHomePage() {
    const content = document.getElementById('public-content');
    
    content.innerHTML = `
        <!-- 히어로 섹션 -->
        <section class="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white py-24">
            <div class="container mx-auto px-4 text-center">
                <h2 class="text-5xl font-bold mb-6">꿈을 키우는 학교</h2>
                <p class="text-2xl mb-8 text-purple-100">우리 모두가 주인공이 되는 배움의 공간</p>
                <div class="flex justify-center space-x-4">
                    <button onclick="navigatePublicPage('about')" class="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        학교 소개 보기
                    </button>
                    <button onclick="showLoginModal()" class="bg-purple-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-900 transition-colors">
                        로그인
                    </button>
                </div>
            </div>
        </section>

        <!-- 학교 교훈 -->
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4">
                <h3 class="text-3xl font-bold text-center text-gray-800 mb-12">교훈</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="text-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-heart text-3xl text-purple-600"></i>
                        </div>
                        <h4 class="text-xl font-bold text-gray-800 mb-3">사랑</h4>
                        <p class="text-gray-600">서로를 존중하고 배려하며 사랑하는 마음</p>
                    </div>
                    <div class="text-center p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-lightbulb text-3xl text-blue-600"></i>
                        </div>
                        <h4 class="text-xl font-bold text-gray-800 mb-3">지혜</h4>
                        <p class="text-gray-600">끊임없이 배우고 성장하는 지혜로운 사람</p>
                    </div>
                    <div class="text-center p-8 bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-hands-helping text-3xl text-green-600"></i>
                        </div>
                        <h4 class="text-xl font-bold text-gray-800 mb-3">섬김</h4>
                        <p class="text-gray-600">이웃과 사회를 섬기는 따뜻한 마음</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 공지사항 미리보기 -->
        <section class="py-16 bg-gray-50">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="text-3xl font-bold text-gray-800">공지사항</h3>
                    <button onclick="navigatePublicPage('notice')" class="text-purple-600 hover:text-purple-700 font-medium">
                        전체보기 →
                    </button>
                </div>
                <div id="public-notice-preview" class="bg-white rounded-xl shadow-md p-6">
                    <p class="text-gray-500 text-center py-8">로딩 중...</p>
                </div>
            </div>
        </section>

        <!-- 특징 -->
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4">
                <h3 class="text-3xl font-bold text-center text-gray-800 mb-12">우리 학교의 특징</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="text-center p-6">
                        <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-users text-4xl text-purple-600"></i>
                        </div>
                        <h4 class="font-bold text-gray-800 mb-2">소규모 학급</h4>
                        <p class="text-sm text-gray-600">학생 개개인을 세심하게 돌보는 소규모 학급 운영</p>
                    </div>
                    <div class="text-center p-6">
                        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-book-reader text-4xl text-blue-600"></i>
                        </div>
                        <h4 class="font-bold text-gray-800 mb-2">맞춤형 교육</h4>
                        <p class="text-sm text-gray-600">학생의 흥미와 적성에 맞춘 개별화 교육</p>
                    </div>
                    <div class="text-center p-6">
                        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-palette text-4xl text-green-600"></i>
                        </div>
                        <h4 class="font-bold text-gray-800 mb-2">예체능 교육</h4>
                        <p class="text-sm text-gray-600">다양한 예술과 체육 활동으로 감성 발달</p>
                    </div>
                    <div class="text-center p-6">
                        <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-globe text-4xl text-yellow-600"></i>
                        </div>
                        <h4 class="font-bold text-gray-800 mb-2">체험 학습</h4>
                        <p class="text-sm text-gray-600">현장 중심의 살아있는 배움 경험</p>
                    </div>
                </div>
            </div>
        </section>
    `;

    // 공지사항 로드
    loadPublicNoticePreview();
}

// 공개 공지사항 미리보기 로드
async function loadPublicNoticePreview() {
    try {
        // 게시판 API 호출 (인증 없이)
        const response = await axios.get('/api/boards/posts?board_type=student&is_notice=1&limit=5');
        
        const container = document.getElementById('public-notice-preview');
        const notices = response.data.posts || [];
        
        if (notices.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">등록된 공지사항이 없습니다.</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="space-y-3">
                ${notices.map(notice => `
                    <div class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                        <div class="flex items-center space-x-3 flex-1">
                            <i class="fas fa-bullhorn text-purple-600"></i>
                            <span class="font-medium text-gray-800">${escapeHtml(notice.title)}</span>
                        </div>
                        <span class="text-sm text-gray-500">${formatDate(notice.created_at)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('공지사항 로드 실패:', error);
        document.getElementById('public-notice-preview').innerHTML = 
            '<p class="text-gray-500 text-center py-8">공지사항을 불러올 수 없습니다.</p>';
    }
}

// ============================================
// 학교 소개
// ============================================
function showAboutPage() {
    const content = document.getElementById('public-content');
    
    content.innerHTML = `
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4 max-w-4xl">
                <h2 class="text-4xl font-bold text-gray-800 mb-8 text-center">학교 소개</h2>
                
                <div class="prose prose-lg max-w-none">
                    <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 mb-8">
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">설립 이념</h3>
                        <p class="text-gray-700 leading-relaxed">
                            우리 학교는 학생 한 명 한 명의 꿈과 가능성을 소중히 여기며,
                            서로 존중하고 배려하는 공동체를 만들어갑니다.
                            기독교 정신을 바탕으로 사랑과 지혜, 섬김의 가치를 실천하며,
                            미래 사회를 이끌어갈 창의적인 인재를 양성합니다.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div class="bg-white border-2 border-purple-100 rounded-xl p-6">
                            <h4 class="text-xl font-bold text-gray-800 mb-3">
                                <i class="fas fa-flag text-purple-600 mr-2"></i>교육 목표
                            </h4>
                            <ul class="space-y-2 text-gray-700">
                                <li>• 자기주도적 학습 능력 함양</li>
                                <li>• 창의적 문제해결 능력 개발</li>
                                <li>• 공동체 의식과 협력 정신</li>
                                <li>• 올바른 인성과 가치관 확립</li>
                            </ul>
                        </div>

                        <div class="bg-white border-2 border-blue-100 rounded-xl p-6">
                            <h4 class="text-xl font-bold text-gray-800 mb-3">
                                <i class="fas fa-star text-blue-600 mr-2"></i>교육 특징
                            </h4>
                            <ul class="space-y-2 text-gray-700">
                                <li>• 소규모 학급 운영 (학급당 15~20명)</li>
                                <li>• 학생 맞춤형 개별화 교육</li>
                                <li>• 현장 체험 중심 학습</li>
                                <li>• 예체능 통합 교육과정</li>
                            </ul>
                        </div>
                    </div>

                    <div class="bg-gray-50 rounded-xl p-8">
                        <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">연혁</h3>
                        <div class="space-y-4">
                            <div class="flex">
                                <span class="font-bold text-purple-600 w-32">2020.03</span>
                                <span class="text-gray-700">학교 설립 인가</span>
                            </div>
                            <div class="flex">
                                <span class="font-bold text-purple-600 w-32">2021.03</span>
                                <span class="text-gray-700">제1회 입학식 (신입생 30명)</span>
                            </div>
                            <div class="flex">
                                <span class="font-bold text-purple-600 w-32">2023.02</span>
                                <span class="text-gray-700">제1회 졸업식</span>
                            </div>
                            <div class="flex">
                                <span class="font-bold text-purple-600 w-32">2024.03</span>
                                <span class="text-gray-700">현재 재학생 100여명</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ============================================
// 교육과정
// ============================================
function showEducationPage() {
    const content = document.getElementById('public-content');
    
    content.innerHTML = `
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4 max-w-5xl">
                <h2 class="text-4xl font-bold text-gray-800 mb-12 text-center">교육과정</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div class="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 text-center">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-book text-3xl text-red-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">기초 교과</h3>
                        <p class="text-gray-600 text-sm">국어, 영어, 수학, 사회, 과학 등 기본 교과목 학습</p>
                    </div>

                    <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-palette text-3xl text-blue-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">예체능</h3>
                        <p class="text-gray-600 text-sm">음악, 미술, 체육 등 감성 계발 교육</p>
                    </div>

                    <div class="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 text-center">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-leaf text-3xl text-green-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">체험 학습</h3>
                        <p class="text-gray-600 text-sm">현장 견학, 봉사활동, 프로젝트 학습</p>
                    </div>
                </div>

                <div class="bg-gray-50 rounded-xl p-8 mb-8">
                    <h3 class="text-2xl font-bold text-gray-800 mb-6">특별 프로그램</h3>
                    <div class="space-y-6">
                        <div class="flex items-start space-x-4">
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-users text-xl text-purple-600"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 mb-2">동아리 활동</h4>
                                <p class="text-gray-600 text-sm">코딩, 음악, 미술, 스포츠 등 다양한 동아리 운영</p>
                            </div>
                        </div>

                        <div class="flex items-start space-x-4">
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-hands-helping text-xl text-blue-600"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 mb-2">봉사활동</h4>
                                <p class="text-gray-600 text-sm">지역사회 봉사, 환경 보호 활동 등</p>
                            </div>
                        </div>

                        <div class="flex items-start space-x-4">
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-mountain text-xl text-green-600"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 mb-2">현장 체험</h4>
                                <p class="text-gray-600 text-sm">문화재 답사, 자연 생태 학습, 직업 체험 등</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ============================================
// 공지사항
// ============================================
function showPublicNoticePage() {
    const content = document.getElementById('public-content');
    
    content.innerHTML = `
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4 max-w-4xl">
                <h2 class="text-4xl font-bold text-gray-800 mb-8 text-center">공지사항</h2>
                
                <div id="public-notice-list" class="space-y-4">
                    <p class="text-gray-500 text-center py-12">로딩 중...</p>
                </div>
            </div>
        </section>
    `;

    loadPublicNoticeList();
}

async function loadPublicNoticeList() {
    try {
        const response = await axios.get('/api/boards/posts?board_type=student&is_notice=1&limit=20');
        
        const container = document.getElementById('public-notice-list');
        const notices = response.data.posts || [];
        
        if (notices.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-12">등록된 공지사항이 없습니다.</p>';
            return;
        }
        
        container.innerHTML = notices.map(notice => `
            <div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-2">
                    <h3 class="text-lg font-bold text-gray-800 flex items-center">
                        <i class="fas fa-bullhorn text-purple-600 mr-2"></i>
                        ${escapeHtml(notice.title)}
                    </h3>
                    <span class="text-sm text-gray-500">${formatDate(notice.created_at)}</span>
                </div>
                <p class="text-gray-600 text-sm">${escapeHtml(notice.content).substring(0, 100)}...</p>
                <div class="mt-3 text-sm text-gray-500">
                    <i class="fas fa-eye mr-1"></i>${notice.view_count || 0}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('공지사항 로드 실패:', error);
        document.getElementById('public-notice-list').innerHTML = 
            '<p class="text-red-500 text-center py-12">공지사항을 불러올 수 없습니다.</p>';
    }
}

// ============================================
// 오시는 길
// ============================================
function showLocationPage() {
    const content = document.getElementById('public-content');
    
    content.innerHTML = `
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4 max-w-5xl">
                <h2 class="text-4xl font-bold text-gray-800 mb-12 text-center">오시는 길</h2>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div class="bg-gray-50 rounded-xl p-8">
                        <h3 class="text-2xl font-bold text-gray-800 mb-6">
                            <i class="fas fa-map-marker-alt text-purple-600 mr-2"></i>학교 위치
                        </h3>
                        <div class="space-y-4 text-gray-700">
                            <div class="flex items-start">
                                <i class="fas fa-home text-purple-600 mr-3 mt-1"></i>
                                <div>
                                    <p class="font-semibold">주소</p>
                                    <p class="text-sm">서울시 강남구 테헤란로 123</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-phone text-purple-600 mr-3 mt-1"></i>
                                <div>
                                    <p class="font-semibold">전화</p>
                                    <p class="text-sm">02-000-0000</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-fax text-purple-600 mr-3 mt-1"></i>
                                <div>
                                    <p class="font-semibold">팩스</p>
                                    <p class="text-sm">02-000-0001</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-envelope text-purple-600 mr-3 mt-1"></i>
                                <div>
                                    <p class="font-semibold">이메일</p>
                                    <p class="text-sm">school@example.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-50 rounded-xl p-8">
                        <h3 class="text-2xl font-bold text-gray-800 mb-6">
                            <i class="fas fa-bus text-blue-600 mr-2"></i>대중교통
                        </h3>
                        <div class="space-y-4 text-gray-700">
                            <div>
                                <p class="font-semibold mb-2">지하철</p>
                                <ul class="text-sm space-y-1">
                                    <li>• 2호선 강남역 3번 출구 도보 10분</li>
                                    <li>• 신분당선 강남역 5번 출구 도보 8분</li>
                                </ul>
                            </div>
                            <div>
                                <p class="font-semibold mb-2">버스</p>
                                <ul class="text-sm space-y-1">
                                    <li>• 간선버스: 146, 740, 341</li>
                                    <li>• 지선버스: 3411, 4318</li>
                                    <li>• 강남역 하차 후 도보 5분</li>
                                </ul>
                            </div>
                            <div>
                                <p class="font-semibold mb-2">자가용</p>
                                <ul class="text-sm space-y-1">
                                    <li>• 학교 내 주차장 이용 가능</li>
                                    <li>• 방문 시 사전 예약 필요</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 지도 영역 (실제로는 카카오맵 또는 구글맵 삽입) -->
                <div class="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
                    <p class="text-gray-500">
                        <i class="fas fa-map text-4xl mb-2"></i><br>
                        지도 영역 (카카오맵 또는 구글맵)
                    </p>
                </div>
            </div>
        </section>
    `;
}

// ============================================
// 로그인 모달 제어
// ============================================
function showLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
    document.getElementById('username').focus();
    
    // 로그인 폼 이벤트 재설정
    const loginForm = document.getElementById('login-form');
    if (loginForm && !loginForm.hasAttribute('data-listener')) {
        loginForm.setAttribute('data-listener', 'true');
        loginForm.addEventListener('submit', handleLogin);
    }
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('login-error').classList.add('hidden');
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLoginModal();
    }
});

