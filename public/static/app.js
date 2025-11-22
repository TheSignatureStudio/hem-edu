// 교회 교적 관리 시스템 - 메인 앱

// API 기본 URL
const API_URL = '/api';

// 전역 상태
let currentUser = null;
let currentPage = 'dashboard';

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

// 인증 확인
async function checkAuth() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    showLogin();
        return;
    }
  
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    currentUser = response.data.user;
        showDashboard();
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('token');
    showLogin();
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 로그인 폼
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 로그아웃 버튼
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  const errorMessage = document.getElementById('error-message');
    
    try {
    const response = await axios.post(`${API_URL}/auth/login`, {
            username,
            password
        });
        
    localStorage.setItem('token', response.data.token);
        currentUser = response.data.user;
    
    errorDiv.classList.add('hidden');
            showDashboard();
    } catch (error) {
    console.error('Login failed:', error);
    errorMessage.textContent = error.response?.data?.error || '로그인에 실패했습니다.';
        errorDiv.classList.remove('hidden');
    }
}

// 로그아웃 처리
function handleLogout() {
  localStorage.removeItem('token');
    currentUser = null;
  showLogin();
}

// 로그인 화면 표시
function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('dashboard-screen').classList.add('hidden');
}

// 대시보드 화면 표시
function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('dashboard-screen').classList.remove('hidden');
  
  // 사용자 정보 표시
    const userInfo = document.getElementById('user-info');
  const roleName = currentUser.role === 'admin' ? '관리자' : '간사';
  userInfo.textContent = `${currentUser.name} (${roleName})`;
  
  // 메뉴 렌더링
  renderMenu();
  
  // 기본 페이지 로드
  loadPage('dashboard');
}

// 메뉴 렌더링
function renderMenu() {
  const menu = document.getElementById('sidebar-menu');
  
  const menuItems = [
    { id: 'dashboard', icon: 'fa-home', label: '대시보드' },
    { id: 'members', icon: 'fa-users', label: '학생 관리' },
    { id: 'classes', icon: 'fa-chalkboard', label: '반 관리' },
    { id: 'groups', icon: 'fa-object-group', label: '구역/소그룹' },
    { id: 'attendance', icon: 'fa-calendar-check', label: '출석 관리' },
    { id: 'counseling', icon: 'fa-comments', label: '상담 기록' },
  ];
  
  // 관리자 전용 메뉴
  if (currentUser.role === 'admin') {
    menuItems.push(
      { id: 'users', icon: 'fa-user-shield', label: '계정 관리' },
      { id: 'settings', icon: 'fa-cog', label: '시스템 설정' }
    );
  }
  
  menu.innerHTML = menuItems.map(item => `
    <a href="#" 
       class="menu-item flex items-center px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
       data-page="${item.id}">
      <i class="fas ${item.icon} w-5"></i>
      <span class="ml-3">${item.label}</span>
    </a>
  `).join('');
  
  // 메뉴 클릭 이벤트
  menu.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.currentTarget.dataset.page;
      loadPage(page);
      
      // 활성 메뉴 표시
      menu.querySelectorAll('.menu-item').forEach(m => {
        m.classList.remove('bg-purple-50', 'text-purple-600');
      });
      e.currentTarget.classList.add('bg-purple-50', 'text-purple-600');
    });
  });
}

// 페이지 로드
async function loadPage(page) {
  currentPage = page;
  const content = document.getElementById('main-content');
  
  switch (page) {
        case 'dashboard':
      await loadDashboard(content);
            break;
    case 'members':
      await loadMembers(content);
            break;
        case 'classes':
      await loadClasses(content);
      break;
    case 'groups':
      await loadGroups(content);
            break;
        case 'attendance':
      await loadAttendance(content);
            break;
    case 'counseling':
      await loadCounseling(content);
            break;
        case 'users':
      await loadUsers(content);
            break;
        case 'settings':
      await loadSettings(content);
            break;
        default:
      content.innerHTML = '<p class="text-gray-500">페이지를 찾을 수 없습니다.</p>';
  }
}

// 대시보드 로드
async function loadDashboard(content) {
  try {
    const token = localStorage.getItem('token');
    
    // 통계 데이터 가져오기
    const [membersRes, groupsRes] = await Promise.all([
      axios.get(`${API_URL}/members`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API_URL}/groups`, { headers: { Authorization: `Bearer ${token}` } })
    ]);
    
    const totalMembers = membersRes.data.members?.length || 0;
    const activeMembers = membersRes.data.members?.filter(m => m.member_status === 'active').length || 0;
    const totalGroups = groupsRes.data.groups?.length || 0;
    
    content.innerHTML = `
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">대시보드</h2>
        <p class="text-gray-600">교회 교적 관리 시스템에 오신 것을 환영합니다.</p>
                </div>
                
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between mb-4">
            <h3 class="text-gray-500 text-sm font-medium">전체 교인</h3>
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-users text-blue-600"></i>
                        </div>
                    </div>
          <p class="text-3xl font-bold text-gray-800">${totalMembers}명</p>
          <p class="text-sm text-gray-500 mt-1">등록 교인: ${activeMembers}명</p>
                </div>
                
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between mb-4">
            <h3 class="text-gray-500 text-sm font-medium">구역/소그룹</h3>
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-object-group text-green-600"></i>
                        </div>
                    </div>
          <p class="text-3xl font-bold text-gray-800">${totalGroups}개</p>
                </div>
                
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between mb-4">
            <h3 class="text-gray-500 text-sm font-medium">오늘 출석률</h3>
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-calendar-check text-purple-600"></i>
                        </div>
                    </div>
          <p class="text-3xl font-bold text-gray-800">-</p>
          <p class="text-sm text-gray-500 mt-1">예배 시작 후 집계</p>
                </div>
            </div>
            
      <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">빠른 메뉴</h3>
          <div class="grid grid-cols-2 gap-3">
            <button onclick="loadPage('members')" class="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <i class="fas fa-user-plus text-purple-600 mb-2"></i>
              <p class="text-sm font-medium text-gray-700">교인 등록</p>
                        </button>
            <button onclick="loadPage('attendance')" class="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <i class="fas fa-check-circle text-purple-600 mb-2"></i>
              <p class="text-sm font-medium text-gray-700">출석 체크</p>
                        </button>
            <button onclick="loadPage('groups')" class="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <i class="fas fa-object-group text-purple-600 mb-2"></i>
              <p class="text-sm font-medium text-gray-700">구역 관리</p>
                    </button>
            <button onclick="loadPage('counseling')" class="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <i class="fas fa-comments text-purple-600 mb-2"></i>
              <p class="text-sm font-medium text-gray-700">상담 기록</p>
                    </button>
                        </div>
                        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">공지사항</h3>
          <div class="space-y-3">
            <p class="text-sm text-gray-600">교회 교적 관리 시스템입니다.</p>
            <p class="text-sm text-gray-600">관리자 또는 간사 권한으로 교인 정보를 관리할 수 있습니다.</p>
                        </div>
            </div>
        </div>
    `;
            } catch (error) {
    console.error('Dashboard load error:', error);
    content.innerHTML = '<p class="text-red-500">대시보드를 불러오는데 실패했습니다.</p>';
  }
}

// 교인 관리 로드
async function loadMembers(content) {
  await MembersModule.loadMembersList();
}

// 반 관리 로드
async function loadClasses(content) {
  await ClassesModule.loadClassesList();
}

// 구역/소그룹 로드
async function loadGroups(content) {
  await GroupsModule.loadGroupsList();
}

// 출석 관리 로드
async function loadAttendance(content) {
  await AttendanceModule.loadAttendancePage();
}

// 상담 기록 로드
async function loadCounseling(content) {
  await CounselingModule.loadCounselingList();
}

// 계정 관리 로드
async function loadUsers(content) {
  await UsersModule.loadUsersList();
}

// 시스템 설정 로드
async function loadSettings(content) {
  await SettingsModule.loadSettingsPage();
}

// ==================== 유틸리티 함수 ====================

// 모달 표시
function showModal(title, content) {
  const modalHtml = `
    <div id="modal-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onclick="closeModalOnOverlay(event)">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800">${title}</h3>
          <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
        <div class="px-6 py-4">
          ${content}
                </div>
                </div>
            </div>
        `;
        
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  document.body.style.overflow = 'hidden';
}

// 모달 닫기
function closeModal() {
  const modal = document.getElementById('modal-overlay');
    if (modal) {
        modal.remove();
    document.body.style.overflow = '';
  }
}

// 오버레이 클릭 시 모달 닫기
function closeModalOnOverlay(event) {
  if (event.target.id === 'modal-overlay') {
        closeModal();
  }
}

// 토스트 메시지 표시
function showToast(message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  const toastHtml = `
    <div id="toast" class="${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 fixed top-4 right-4 z-50 animate-slide-in">
      <i class="fas ${icons[type]} text-xl"></i>
      <span>${message}</span>
            </div>
        `;
  
  // 기존 토스트 제거
  const existingToast = document.getElementById('toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  document.body.insertAdjacentHTML('beforeend', toastHtml);
  
  setTimeout(() => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.classList.add('animate-slide-out');
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}
