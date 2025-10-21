// --- APP SETUP & STATE ---
const API_BASE_URL = 'https://energymate-backend.vercel.app/api';
let authToken = null;
let currentUser = null;
let chatHistory = [];
let applianceRows = [];
let userPower = null; // Menyimpan daya listrik pengguna (misal: '1300 VA')
let historyCache = [];

const defaultDevices = [
    { name: "Microwave", wattage: 1000, subMeter: "Sub_metering_1" }, { name: "Penanak Nasi", wattage: 300, subMeter: "Sub_metering_1" },
    { name: "Blender", wattage: 250, subMeter: "Sub_metering_1" }, { name: "Dispenser Air", wattage: 200, subMeter: "Sub_metering_1" },
    { name: "Pemanggang Roti", wattage: 850, subMeter: "Sub_metering_1" }, { name: "Mesin Cuci", wattage: 500, subMeter: "Sub_metering_2" },
    { name: "Mesin Pengering", wattage: 3000, subMeter: "Sub_metering_2" }, { name: "Setrika", wattage: 1000, subMeter: "Sub_metering_2" },
    { name: "Pompa Air", wattage: 750, subMeter: "Sub_metering_2" }, { name: "Pengering Rambut", wattage: 600, subMeter: "Sub_metering_2" },
    { name: "Pemanas Air", wattage: 1500, subMeter: "Sub_metering_3" }, { name: "AC (Air Conditioner)", wattage: 800, subMeter: "Sub_metering_3" },
    { name: "Penyedot Debu", wattage: 1200, subMeter: "Sub_metering_3" }, { name: "Kipas Angin", wattage: 100, subMeter: "Sub_metering_3" },
    { name: "Lampu Pijar", wattage: 35, subMeter: "Sub_metering_3" }, { name: "Lampu LED", wattage: 20, subMeter: "Sub_metering_3" },
];

// Data untuk semua artikel blog. Dalam aplikasi nyata, ini bisa datang dari API.
const articles = {
    'article-1': {
        title: "5 Perubahan Kecil di Rumah yang Menurunkan Tagihan Listrik 20%",
        date: "10 Okt 2025",
        category: "Studi Kasus",
        imageUrl: "https://placehold.co/800x400/3b82f6/ffffff?text=Dampak+Besar",
        imageAlt: "Ilustrasi hemat energi",
        content: `
            <p>Seringkali kita berpikir bahwa menghemat listrik memerlukan investasi besar. Padahal, beberapa perubahan kecil dalam kebiasaan sehari-hari bisa memberikan dampak signifikan. Dalam studi kasus ini, kita akan melihat bagaimana sebuah keluarga berhasil memangkas biaya listrik bulanan mereka hingga 20% hanya dengan lima strategi sederhana.</p>
            <h2>1. Optimalkan Penggunaan Lampu</h2>
            <p>Langkah pertama adalah mengganti semua lampu pijar dengan lampu LED yang mengonsumsi energi hingga 85% lebih sedikit dan membiasakan diri untuk selalu mematikan lampu di ruangan yang tidak terpakai.</p>
            <h2>2. Cabut Peralatan Elektronik yang Tidak Digunakan</h2>
            <p>Banyak peralatan elektronik tetap mengonsumsi listrik meskipun dalam keadaan mati (standby power). Dengan mencabut steker saat tidak digunakan, mereka berhasil menghilangkan konsumsi daya yang terbuang.</p>
            <blockquote>Ini adalah perubahan paling mudah dengan dampak yang cukup terasa. Kami terkejut melihat berapa banyak daya yang terbuang sia-sia.</blockquote>
            <h2>3. Atur Suhu AC dan Kulkas dengan Bijak</h2>
            <p>AC adalah salah satu penyumbang terbesar dalam tagihan listrik. Menetapkan suhu AC pada 25°C dan membersihkan filter secara rutin sangat membantu. Untuk kulkas, pastikan pintu selalu tertutup rapat.</p>
            <h2>4. Gunakan Mesin Cuci Secara Efisien</h2>
            <p>Mengumpulkan pakaian hingga kapasitas mesin cuci penuh akan mengurangi frekuensi penggunaan, yang berarti menghemat listrik dan air sekaligus.</p>
            <h2>5. Periksa dan Perbaiki Kebocoran Daya</h2>
            <p>Memanggil profesional listrik untuk pemeriksaan rutin adalah investasi kecil untuk keamanan dan efisiensi jangka panjang, memastikan tidak ada arus yang terbuang sia-sia.</p>`
    },
    'article-2': {
        title: "Memahami Daya VA vs Watt: Apa Bedanya untuk Tagihan Anda?",
        date: "05 Okt 2025",
        category: "Panduan",
        imageUrl: "https://placehold.co/800x400/10b981/ffffff?text=VA+vs+Watt",
        imageAlt: "Ilustrasi daya listrik",
        content: `
            <p>Saat melihat tagihan listrik atau spesifikasi alat, Anda mungkin menemukan istilah Watt dan VA (Volt-Ampere). Keduanya adalah unit daya, tapi apa perbedaannya dan bagaimana pengaruhnya pada Anda?</p>
            <h2>Apa itu Watt (W)?</h2>
            <p>Watt adalah unit untuk "Daya Nyata" (Real Power). Ini adalah jumlah daya yang benar-benar diubah menjadi hasil kerja, seperti cahaya dari lampu atau panas dari setrika. Ini yang sebenarnya Anda gunakan.</p>
            <h2>Apa itu Volt-Ampere (VA)?</h2>
            <p>Volt-Ampere (VA) adalah unit untuk "Daya Semu" (Apparent Power). Ini adalah hasil perkalian tegangan (Volt) dan arus (Ampere) dalam sebuah sirkuit. Daya semu selalu lebih besar atau sama dengan daya nyata.</p>
            <h2>Faktor Daya (Power Factor)</h2>
            <p>Perbedaan antara VA dan Watt disebabkan oleh "Faktor Daya", sebuah angka antara 0 dan 1. Hubungannya adalah: <strong>Watt = VA × Faktor Daya</strong>. Peralatan dengan motor (seperti AC, kulkas, pompa air) memiliki faktor daya kurang dari 1, artinya mereka menarik lebih banyak daya (VA) dari jaringan daripada yang sebenarnya mereka gunakan (Watt).</p>
            <blockquote>PLN menagih pelanggan rumah tangga berdasarkan energi yang dikonsumsi dalam kWh (kilowatt-hour), yang dihitung dari Watt, bukan VA. Namun, PLN peduli pada faktor daya secara keseluruhan karena faktor daya yang rendah membuat jaringan mereka kurang efisien.</blockquote>
            <p>Jadi, bagi Anda sebagai pengguna rumahan, fokus utama tetaplah pada Watt untuk menghitung konsumsi. Namun, memilih peralatan dengan faktor daya yang baik (mendekati 1) membantu menjaga efisiensi jaringan listrik secara keseluruhan.</p>`
    },
    'article-3': {
        title: "Tanda-tanda Instalasi Listrik di Rumah Anda Perlu Diperiksa",
        date: "01 Okt 2025",
        category: "Tips",
        imageUrl: "https://placehold.co/800x400/ef4444/ffffff?text=Listrik+Aman",
        imageAlt: "Ilustrasi keamanan listrik",
        content: `
            <p>Keselamatan listrik adalah hal yang tidak bisa ditawar. Instalasi yang bermasalah tidak hanya boros energi tetapi juga berisiko menyebabkan kebakaran. Kenali tanda-tanda ini untuk tahu kapan saatnya memanggil ahli listrik.</p>
            <h2>1. Sekring Sering Putus atau MCB Sering Turun</h2>
            <p>Ini adalah tanda paling umum bahwa sirkuit kelebihan beban. Artinya, Anda menyalakan terlalu banyak alat pada satu sirkuit, atau ada korsleting di suatu tempat.</p>
            <h2>2. Lampu Berkedip atau Redup</h2>
            <p>Jika lampu sering berkedip atau meredup saat Anda menyalakan alat lain (seperti AC atau microwave), ini bisa menandakan kabel yang sudah tua atau koneksi yang longgar.</p>
            <h2>3. Stopkontak atau Sakelar Terasa Hangat</h2>
            <p>Stopkontak atau sakelar tidak seharusnya terasa hangat saat disentuh. Jika ya, segera hentikan penggunaan dan panggil ahli. Ini adalah tanda bahaya adanya masalah pada kabel di dalamnya.</p>
            <h2>4. Bau Terbakar</h2>
            <p>Jika Anda mencium bau seperti plastik atau karet terbakar di dekat peralatan listrik atau stopkontak, segera matikan sumber listrik utama dari MCB dan hubungi ahli. Jangan pernah mengabaikan bau ini.</p>
            <h2>5. Stopkontak Gosong atau Berubah Warna</h2>
            <p>Tanda fisik seperti ini jelas menunjukkan adanya masalah panas berlebih di dalam stopkontak. Ini sangat berbahaya dan perlu segera diganti.</p>
            <p>Pemeriksaan rutin oleh profesional setidaknya 5–10 tahun sekali adalah cara terbaik untuk memastikan sistem kelistrikan rumah Anda tetap aman dan efisien.</p>`
    }
};

// Elemen tampilan
const listView = document.getElementById('view-list');
const detailView = document.getElementById('view-detail');

// Fungsi untuk menampilkan detail artikel
function showArticleDetail(articleId, event) {
    if (event) event.preventDefault();
    const article = articles[articleId];
    if (!article) return;

    // Mengisi data ke elemen di view detail
    document.getElementById('detail-title').textContent = article.title;
    document.getElementById('detail-date').innerHTML = `<i class="bi bi-calendar3 mr-1"></i> Dipublikasikan pada ${article.date}`;
    document.getElementById('detail-category').innerHTML = `<i class="bi bi-tag-fill mr-1"></i> ${article.category}`;
    document.getElementById('detail-image').src = article.imageUrl;
    document.getElementById('detail-image').alt = article.imageAlt;
    document.getElementById('detail-content').innerHTML = article.content;

    // Beralih view
    listView.classList.remove('active');
    detailView.classList.add('active');
    window.scrollTo(0, 0); // Gulir ke atas halaman
}

// Fungsi untuk kembali ke tampilan daftar
function showListView() {
    detailView.classList.remove('active');
    listView.classList.add('active');
}

// --- DOM ELEMENT SELECTORS ---
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const userInfo = document.getElementById('user-info');
const userInfoMobile = document.getElementById('user-info-mobile');
const topUser = document.getElementById('topUser');
const btnLogoutTop = document.getElementById('btnLogoutTop');
const allLogoutButtons = document.querySelectorAll('.logout-button');

// --- UI HELPERS ---
function toggleButtonSpinner(buttonId, show) {
    const button = document.getElementById(buttonId);
    if (button) {
        const text = button.querySelector('.btn-text');
        const spinner = button.querySelector('.btn-spinner');
        if (show) {
            text.classList.add('hidden');
            spinner.classList.remove('hidden');
            button.disabled = true;
        } else {
            text.classList.remove('hidden');
            spinner.classList.add('hidden');
            button.disabled = false;
        }
    }
}

// --- MOBILE SIDEBAR ---
const mobileSidebar = document.getElementById('mobileSidebar');
const mobileSidebarContent = document.getElementById('mobileSidebarContent');
const mobileSidebarBackdrop = document.getElementById('mobileSidebarBackdrop');
const mobileToggle = document.getElementById('mobileToggle');
const mobileSidebarClose = document.getElementById('mobileSidebarClose');


function openMobileSidebar() {
    if (mobileSidebar) {
        mobileSidebar.style.display = 'flex';
        setTimeout(() => {
            mobileSidebarContent.classList.remove('-translate-x-full');
            mobileSidebarContent.classList.add('translate-x-0');
        }, 10);
    }
}

function closeMobileSidebar() {
    if (mobileSidebar) {
        mobileSidebarContent.classList.remove('translate-x-0');
        mobileSidebarContent.classList.add('-translate-x-full');
        setTimeout(() => {
            mobileSidebar.style.display = 'none';
        }, 300);
    }
}

// Event Listeners for mobile sidebar
// Check if the element exists before adding an event listener to avoid errors on pages without it
if (mobileToggle) {
    mobileToggle.addEventListener('click', openMobileSidebar);
}
if (mobileSidebarClose) {
    mobileSidebarClose.addEventListener('click', closeMobileSidebar);
}
if (mobileSidebarBackdrop) {
    mobileSidebarBackdrop.addEventListener('click', closeMobileSidebar);
}


// --- AUTH & UI TOGGLING ---
function toggleAuthView(event) {
    event?.preventDefault();
    document.getElementById('login-view').classList.toggle('hidden');
    document.getElementById('register-view').classList.toggle('hidden');
    document.getElementById('auth-result').classList.add('hidden');
}

function updateAuthStatus() {
    if (authToken && currentUser) {
        document.body.classList.add('logged-in');
        if (authContainer) authContainer.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');

        const userName = currentUser.name || currentUser.email;
        const firstName = userName.split(' ')[0];
        
        if (userInfo) userInfo.textContent = userName;
        if (userInfoMobile) userInfoMobile.textContent = userName;
        if (topUser) topUser.innerHTML = `<p class="text-sm font-medium text-gray-600">Selamat datang, ${firstName}!</p>`;
        
        allLogoutButtons.forEach(btn => btn.classList.remove('hidden'));
        
        const plnInput = document.getElementById('billing-pln');
        if(plnInput) plnInput.value = currentUser.plnCustomerId || '';
        
        const plnInput2 = document.getElementById('billing-pln-2');
        if(plnInput2) plnInput2.value = currentUser.plnCustomerId || '';

    } else {
        document.body.classList.remove('logged-in');
        if(authContainer) authContainer.classList.remove('hidden');
        if(appContainer) appContainer.classList.add('hidden');
        allLogoutButtons.forEach(btn => btn.classList.add('hidden'));
    }
}

function showAuthAlert(message, type = 'info') {
    const el = document.getElementById('auth-result');
    el.textContent = message;
    el.className = 'mt-4 text-sm p-3 rounded-md';
    if (type === 'success') el.classList.add('bg-green-100', 'text-green-800');
    else if (type === 'danger') el.classList.add('bg-red-100', 'text-red-800');
    else el.classList.add('bg-blue-100', 'text-blue-800');
    el.classList.remove('hidden');
}

function showView(viewName, event) {
    event?.preventDefault();
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const viewEl = document.getElementById('view-' + viewName);
    if(viewEl) viewEl.classList.add('active');

    const navLinkEl = document.querySelector(`.nav-link[data-view="${viewName}"]`);
    if(navLinkEl) navLinkEl.classList.add('active');

    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Ringkasan & aksi cepat' }, appliance: { title: 'Cek Alat', subtitle: 'Prediksi konsumsi energi Anda' },
        billing: { title: 'Cek Tagihan', subtitle: 'Lihat detail tagihan PLN Anda' }, history: { title: 'Riwayat Prediksi', subtitle: 'Lihat prediksi Anda sebelumnya' },
        chatbot: { title: 'Asisten AI', subtitle: 'Dapatkan tips cerdas hemat energi' }
    };
    const viewTitleEl = document.getElementById('view-title');
    if(viewTitleEl) viewTitleEl.textContent = titles[viewName]?.title || 'Dashboard';
    
    const viewSubtitleEl = document.getElementById('view-subtitle');
    if(viewSubtitleEl) viewSubtitleEl.textContent = titles[viewName]?.subtitle || '';

    if (viewName === 'dashboard') {
        fetchInitialDashboardData();
    }

    if (viewName !== 'appliance') closeAllDropdowns();

    if (viewName === 'history') {
        getHistory();
    }
}

// --- API & DATA FETCHING ---
async function fetchAPI(endpoint, options = {}) {
    if (!options.headers) options.headers = {};
    options.headers['Content-Type'] = 'application/json';
    if (authToken) options.headers['Authorization'] = `Bearer ${authToken}`;
    try {
        const res = await fetch(API_BASE_URL + endpoint, options);
        const data = await res.json();
        if (!res.ok) return { isError: true, message: data.message || `Error: ${res.status}`, ...data };
        return data;
    } catch (err) {
        return { isError: true, message: err.message || 'Terjadi kesalahan jaringan.' };
    }
}

async function registerUser(event) {
    event.preventDefault();
    toggleButtonSpinner('register-button', true);
    const body = {
        name: document.getElementById('reg-name').value.trim(), username: document.getElementById('reg-username').value.trim(),
        email: document.getElementById('reg-email').value.trim(), password: document.getElementById('reg-password').value,
        plnCustomerId: document.getElementById('reg-pln').value.trim()
    };
    const data = await fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    toggleButtonSpinner('register-button', false);
    if (data.token) {
        authToken = data.token;
        currentUser = data;
        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('currentUser', JSON.stringify(data));
        showAuthAlert('Pendaftaran berhasil! Mengalihkan...', 'success');
        setTimeout(() => {
            updateAuthStatus();
            initApp();
        }, 1000);
    } else showAuthAlert(data.message || 'Pendaftaran gagal.', 'danger');
}

async function loginUser(event) {
    event.preventDefault();
    toggleButtonSpinner('login-button', true);
    const body = {
        emailOrUsername: document.getElementById('login-email').value.trim(), password: document.getElementById('login-password').value
    };
    const data = await fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(body) });
    toggleButtonSpinner('login-button', false);
    if (data.token) {
        authToken = data.token;
        currentUser = data;
        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('currentUser', JSON.stringify(data));
        updateAuthStatus();
        initApp();
    } else showAuthAlert(data.message || 'Gagal masuk.', 'danger');
}

function logout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    chatHistory = [];
    userPower = null;
    applianceRows = [];
    historyCache = [];

    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) chatWindow.innerHTML = '';
    
    if (userInfo) userInfo.textContent = '-';
    if (userInfoMobile) userInfoMobile.textContent = '-';
    if (topUser) topUser.innerHTML = '';

    updateAuthStatus();
}

// --- APP INITIALIZATION LOGIC ---
function populateHourDropdown() {
    const hourSelect = document.getElementById('hour');
    if (hourSelect) {
        hourSelect.innerHTML = ''; // Clear existing options
        const currentHour = new Date().getHours();
        for (let i = 0; i < 24; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${String(i).padStart(2, '0')}:00`;
            if (i === currentHour) {
                option.selected = true;
            }
            hourSelect.appendChild(option);
        }
    }
}

function initApp() {
    // Populate the time dropdown
    populateHourDropdown();

    // Reset appliance checker to its initial state
    applianceRows = [];
    addApplianceRow();

    // Reset chatbot to its initial state
    chatHistory = [];
    const chatWindow = document.getElementById('chat-window');
    if(chatWindow) {
        chatWindow.innerHTML = '';
        appendToChatWindow('Halo! Saya EnergyMate. Ada yang bisa saya bantu untuk hemat energi hari ini?', 'model');
    }

    // Clear any previous results from other views
    const applianceResult = document.getElementById('appliance-result-container');
    if(applianceResult) applianceResult.innerHTML = `<div class="bg-gray-50 text-center py-12 px-6 rounded-lg border border-gray-200"><i class="bi bi-cpu text-5xl text-gray-400"></i><p class="mt-4 text-sm font-medium text-gray-500">Hasil prediksi akan muncul di sini.</p></div>`;

    const billingResult = document.getElementById('billing-result-container');
    if(billingResult) billingResult.innerHTML = `<div class="bg-gray-50 text-center py-12 px-6 rounded-lg border border-gray-200"><i class="bi bi-receipt-cutoff text-5xl text-gray-400"></i><p class="mt-4 text-sm font-medium text-gray-500">Detail tagihan akan muncul di sini.</p></div>`;
    
    const historyResult = document.getElementById('history-result-container');
    if(historyResult) historyResult.innerHTML = `<div class="text-center py-12 text-gray-400"><i class="bi bi-archive text-4xl"></i><p class="mt-2 text-sm">Memuat riwayat...</p></div>`;

    // Fetch fresh data for the dashboard
    fetchInitialDashboardData();

    // Set the initial view to dashboard
    showView('dashboard');
}

// --- DASHBOARD LOGIC ---
async function fetchInitialDashboardData() {
    const history = await fetchAPI('/predict/history');
    if (history && !history.isError && Array.isArray(history)) {
        historyCache = history;
        const latestBilling = history.find(h => h.inputType === 'pln_bill' && h.predictionResult?.billing_data?.power);
        if (latestBilling) userPower = latestBilling.predictionResult.billing_data.power;
        updateDashboardMetrics(history);
        renderRecentActivity(history.slice(0, 5));
    } else {
        historyCache = [];
        updateDashboardMetrics([]);
        renderRecentActivity([]);
    }
}

function updateDashboardMetrics(history) {
    const kwhEl = document.getElementById('kwh-today');
    const billEl = document.getElementById('bill-estimate');
    if(!kwhEl || !billEl) return;

    const today = new Date().toDateString();

    const todayApplianceHistory = history.filter(h => h.inputType === 'appliances' && new Date(h.createdAt).toDateString() === today);
    
    const totalKwhToday = todayApplianceHistory.reduce((sum, item) => sum + (item.predictionResult.prediction_kw || 0), 0);
    kwhEl.innerHTML = totalKwhToday > 0 ? `${totalKwhToday.toFixed(2)} <span class="text-lg font-medium">kWh</span>` : `- <span class="text-lg font-medium">kWh</span>`;

    const todayPredictionsWithCost = todayApplianceHistory.filter(h => h.estimatedCost != null);
    if (todayPredictionsWithCost.length > 0) {
        // Kept as average, as it represents a "typical" monthly bill based on today's usage patterns
        const avgEstimatedBill = todayPredictionsWithCost.reduce((sum, item) => sum + item.estimatedCost, 0) / todayPredictionsWithCost.length;
        billEl.textContent = `Rp ${Math.round(avgEstimatedBill).toLocaleString('id-ID')}`;
    } else billEl.textContent = 'Rp -';
}

function renderRecentActivity(history) {
    const container = document.getElementById('recent-activity');
    if(!container) return;
    if (history.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-gray-400"><i class="bi bi-archive text-4xl"></i><p class="mt-2 text-sm">Belum ada aktivitas.</p></div>`;
        return;
    }
    container.innerHTML = `
        <ul role="list" class="divide-y divide-gray-200">
            ${history.map(item => `
                <li class="py-3 flex items-center gap-4">
                    <div class="h-8 w-8 rounded-full flex items-center justify-center ${item.inputType === 'appliances' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}">
                        <i class="bi ${item.inputType === 'appliances' ? 'bi-cpu-fill' : 'bi-receipt-cutoff'}"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-800">${item.inputType === 'appliances' ? 'Prediksi Alat' : 'Cek Tagihan'}</p>
                        <p class="text-xs text-gray-500">${new Date(item.createdAt).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</p>
                    </div>
                    <p class="text-sm font-semibold text-gray-700">
                        ${item.inputType === 'appliances' ? `${Number(item.predictionResult.prediction_kw || 0).toFixed(2)} kWh` : `Rp ${Number(item.estimatedCost || 0).toLocaleString('id-ID')}`}
                    </p>
                </li>
            `).join('')}
        </ul>
    `;
}

// --- APPLIANCE PREDICTION LOGIC ---
function renderApplianceRows() {
    const container = document.getElementById('appliance-rows-container');
    if(!container) return;
    container.innerHTML = applianceRows.length === 0 ? `<p class="text-sm text-gray-500">Klik 'Tambah Alat' untuk memulai.</p>` : '';
    applianceRows.forEach((row, index) => {
        const rowElement = document.createElement('div');
        rowElement.className = 'grid grid-cols-12 gap-x-3 gap-y-2 items-end p-3 rounded-lg border bg-gray-50/50';
        rowElement.innerHTML = `
            <div class="col-span-12 md:col-span-5 relative">
                <label class="text-xs font-medium text-gray-500">Alat Elektronik</label>
                <input type="text" id="appliance-search-${index}" value="${row.deviceName}" onfocus="openDeviceDropdown(${index})" oninput="filterDevices(${index}, this.value)" placeholder="Cari alat..." class="w-full mt-1 p-2 border-gray-300 rounded-md shadow-sm text-sm" autocomplete="off">
                <div id="appliance-dropdown-${index}" class="absolute z-10 w-full bg-white border rounded-md mt-1 hidden max-h-48 overflow-y-auto shadow-lg"></div>
            </div>
            <div class="col-span-5 md:col-span-3"><label class="text-xs font-medium text-gray-500">Daya (Watt)</label><input type="number" min="0" value="${row.wattage || 0}" oninput="updateApplianceRow(${index}, 'wattage', this.value)" class="w-full mt-1 p-2 border-gray-300 rounded-md shadow-sm text-sm"></div>
            <div class="col-span-4 md:col-span-2"><label class="text-xs font-medium text-gray-500">Jumlah</label><input type="number" min="1" value="${row.quantity}" oninput="updateApplianceRow(${index}, 'quantity', this.value)" class="w-full mt-1 p-2 border-gray-300 rounded-md shadow-sm text-sm"></div>
            <div class="col-span-3 md:col-span-2 flex items-center justify-end"><button onclick="removeApplianceRow(${index})" class="h-10 px-3 text-red-500 hover:bg-red-100 rounded-md"><i class="bi bi-trash-fill"></i></button></div>`;
        container.appendChild(rowElement);
    });
}

function openDeviceDropdown(index) { closeAllDropdowns(); document.getElementById(`appliance-dropdown-${index}`).classList.remove('hidden'); filterDevices(index, document.getElementById(`appliance-search-${index}`).value); }
function closeAllDropdowns() { document.querySelectorAll('[id^="appliance-dropdown-"]').forEach(d => d.classList.add('hidden')); }
function filterDevices(index, searchTerm) { const dropdown = document.getElementById(`appliance-dropdown-${index}`); const filtered = defaultDevices.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())); dropdown.innerHTML = filtered.length > 0 ? filtered.map(d => `<div class="p-2 hover:bg-gray-100 cursor-pointer text-sm" onclick="selectDevice(${index}, '${d.name.replace(/'/g, "\\'")}')">${d.name}</div>`).join('') : `<div class="p-2 text-sm text-gray-500">Tidak ditemukan.</div>`; }
function selectDevice(index, deviceName) { const device = defaultDevices.find(d => d.name === deviceName); if (device) { applianceRows[index].deviceName = device.name; applianceRows[index].wattage = device.wattage; } closeAllDropdowns(); renderApplianceRows(); }
function addApplianceRow() { if (applianceRows.length < 10) { applianceRows.push({ deviceName: '', quantity: 1, wattage: 0 }); renderApplianceRows(); } else alert("Maksimal 10 alat."); }
function removeApplianceRow(index) { applianceRows.splice(index, 1); renderApplianceRows(); }
function updateApplianceRow(index, field, value) { if (field === 'deviceName') applianceRows[index].deviceName = value; else if (field === 'quantity') applianceRows[index].quantity = parseInt(value, 10) || 1; else if (field === 'wattage') { applianceRows[index].wattage = parseInt(value, 10) || 0; const device = defaultDevices.find(d => d.name === applianceRows[index].deviceName); if(device && device.wattage !== applianceRows[index].wattage) applianceRows[index].deviceName = ''; }}

async function getAppliancePrediction() {
    toggleButtonSpinner('predict-button', true);
    let sub_metering_1 = 0, sub_metering_2 = 0, sub_metering_3 = 0;
    applianceRows.forEach(row => {
        const device = defaultDevices.find(d => d.name === row.deviceName);
        const wattage = row.wattage || device?.wattage || 0;
        if (wattage > 0) {
            const usage = (wattage / 1000) * row.quantity;
            const subMeter = device?.subMeter || 'Sub_metering_3'; // Default to sub_metering_3 if not found
            if (subMeter === 'Sub_metering_1') sub_metering_1 += usage;
            else if (subMeter === 'Sub_metering_2') sub_metering_2 += usage;
            else sub_metering_3 += usage;
        }
    });
    const body = {
        Sub_metering_1: sub_metering_1, Sub_metering_2: sub_metering_2, Sub_metering_3: sub_metering_3,
        hour: parseInt(document.getElementById('hour').value) || 0, userPower: userPower,
    };
    const data = await fetchAPI('/predict/appliances/tfjs', { method: 'POST', body: JSON.stringify(body) });
    toggleButtonSpinner('predict-button', false);
    renderApplianceResult(data);
    
    // Perbarui riwayat hanya jika pengguna sudah login
    if(data && !data.isError && authToken) {
        getHistory(true);
    }
}

function renderApplianceResult(data) {
    const cont = document.getElementById('appliance-result-container');
    if(!cont) return;
    if (!data || data.isError || data.prediction_kw === undefined) {
        cont.innerHTML = `<div class="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">${data?.message || 'Gagal memuat prediksi.'}</div>`; return;
    }
    
    let warningHtml = '';
    if (data.warning) {
        // Modal konfirmasi sederhana
        if (!confirm(data.warning + "\nApakah Anda yakin ingin melanjutkan prediksi?")) {
            return; // user cancel → hentikan render
        }
        warningHtml = `
            <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-r-lg" role="alert">
                <div class="flex">
                    <div class="py-1"><i class="bi bi-exclamation-triangle-fill mr-3"></i></div>
                    <div>
                        <p class="font-bold">Perhatian</p>
                        <p class="text-sm">${data.warning}</p>
                    </div>
                </div>
            </div>`;
    }   

    const { prediction_kw, category, focus_area, specific_recommendation, breakdown, estimated_monthly_cost } = data;
    let badgeClass = 'bg-green-100 text-green-800';
    if (category === 'Tinggi') badgeClass = 'bg-red-100 text-red-800';
    else if (category === 'Sedang') badgeClass = 'bg-yellow-100 text-yellow-800';
    const recommendationHtml = marked.parse(specific_recommendation || 'Tidak ada.');
    
    cont.innerHTML = `
        ${warningHtml}
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
                    <p class="text-sm font-medium text-blue-700">Prediksi Konsumsi (1 Jam)</p>
                    <p class="text-5xl font-extrabold text-blue-900 my-2">${Number(prediction_kw).toFixed(2)} <span class="text-2xl font-medium">kWh</span></p>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeClass}">Konsumsi ${category}</span>
                </div>
                <div class="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
                    <p class="text-sm font-medium text-green-700">Estimasi Biaya Bulanan</p>
                    ${estimated_monthly_cost != null ? `<p class="text-5xl font-extrabold text-green-900 my-2">Rp ${Math.round(estimated_monthly_cost).toLocaleString('id-ID')}</p><p class="text-xs text-gray-500">Estimasi jika penggunaan konstan 24/7.</p>` : `<p class="my-2 text-gray-500">Masuk untuk mendapat estimasi biaya.</p>`}
                </div>
            </div>
            <div class="bg-white p-6 rounded-lg border">
                <h4 class="font-semibold text-gray-800">Rekomendasi Hemat Energi</h4>
                <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><p class="font-medium text-sm">Area Fokus</p><p class="text-sm text-gray-600 mt-1">${focus_area || 'N/A'}</p></div>
                    <div><p class="font-medium text-sm">Saran Spesifik</p><div class="text-sm text-gray-600 mt-1">${recommendationHtml}</div></div>
                </div>
            </div>
        </div>`;
}

// --- Other Feature Functions ---
async function getBillingEstimation() {
    // This function is triggered from the dashboard quick check.
    // First, we ensure the main billing page input is synced.
    const plnCustomerId = document.getElementById('billing-pln').value;
    document.getElementById('billing-pln-2').value = plnCustomerId;

    // Then, show the billing view.
    showView('billing', event);

    // Finally, run the estimation which reads from billing-pln-2.
    getBillingEstimationFromField();
}
async function getBillingEstimationFromField() {
    const plnCustomerId = document.getElementById('billing-pln-2').value;
    if (!plnCustomerId) { renderBillingResult({isError:true, message:'ID Pelanggan tidak boleh kosong.'}); return; }
    toggleButtonSpinner('billing-check-button', true);
    const data = await fetchAPI('/predict/billing', { method: 'POST', body: JSON.stringify({ plnCustomerId }) });
    toggleButtonSpinner('billing-check-button', false);
    renderBillingResult(data);

    if(data && !data.isError) {
        getHistory(true);
    }
}

function renderBillingResult(data) {
    const cont = document.getElementById('billing-result-container');
    if(!cont) return;
    if (data.isError || !data.billing_data) {
        cont.innerHTML = `<div class="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">${data.message || 'Gagal memuat data.'}</div>`; return;
    }
    const { billing_data } = data;
    if (billing_data.power) userPower = billing_data.power; // Update user power
    cont.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="bg-gray-50 p-4 rounded-lg"><p class="text-xs text-gray-500">Nama</p><p class="font-semibold truncate">${billing_data.customerName}</p></div><div class="bg-gray-50 p-4 rounded-lg"><p class="text-xs text-gray-500">Periode</p><p class="font-semibold">${billing_data.period}</p></div><div class="bg-gray-50 p-4 rounded-lg"><p class="text-xs text-gray-500">Daya</p><p class="font-semibold">${billing_data.power}</p></div></div>
            <div class="bg-green-100 border border-green-200 text-green-800 p-6 rounded-lg text-center"><p class="text-sm font-medium">Total Tagihan</p><p class="text-4xl font-bold">Rp ${Number(billing_data.totalBill).toLocaleString('id-ID')}</p></div>
        </div>`;
}

async function getHistory(forceRefresh = false) {
    const cont = document.getElementById('history-result-container');
    if (!cont) return;

    // If we have cached data and are not forcing a refresh, use it.
    if (historyCache.length > 0 && !forceRefresh) {
        renderHistory(historyCache);
        return;
    }

    cont.innerHTML = `<div class="text-center py-12 text-gray-400"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>`;
    const data = await fetchAPI('/predict/history');
    
    if (data && !data.isError) {
        historyCache = data; // Update cache
        renderHistory(data);
        updateDashboardMetrics(data);
    } else {
        historyCache = []; // Clear cache on error
        renderHistory([]);
    }
}

function renderHistory(data) {
    const cont = document.getElementById('history-result-container');
    if(!cont) return;
    if (!Array.isArray(data) || data.length === 0) { cont.innerHTML = `<div class="text-center py-12 text-gray-400"><i class="bi bi-archive text-4xl"></i><p class="mt-2 text-sm">Riwayat kosong.</p></div>`; return; }
    cont.innerHTML = `<ul role="list" class="divide-y divide-gray-200">${data.map(item => `
        <li class="py-4"><div class="flex space-x-3"><div class="flex-1 space-y-1"><div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">${item.inputType === 'appliances' ? 'Prediksi Alat' : 'Cek Tagihan'}</h3>
            <p class="text-sm text-gray-500">${new Date(item.createdAt).toLocaleString('id-ID', {dateStyle:'medium', timeStyle:'short'})}</p>
        </div><p class="text-sm text-gray-500">${item.inputType === 'appliances' ? `Hasil: ${Number(item.predictionResult.prediction_kw || 0).toFixed(2)} kWh (${item.predictionResult.category || 'N/A'})` : `Tagihan: Rp ${Number(item.estimatedCost || 0).toLocaleString('id-ID')}`}</p></div></div></li>`).join('')}</ul>`;
}

async function sendMessageToChatbot() {
    const input = document.getElementById('chat-input');
    if(!input) return;
    const message = input.value.trim();
    if (!message) return;
    appendToChatWindow(message, 'user'); chatHistory.push({ role: 'user', parts: [{ text: message }] }); input.value = ''; input.disabled = true;
    const data = await fetchAPI('/chatbot', { method: 'POST', body: JSON.stringify({ message, history: chatHistory.slice(-10) }) });
    if (data && data.reply) { appendToChatWindow(data.reply, 'model'); chatHistory.push({ role: 'model', parts: [{ text: data.reply }] }); } 
    else appendToChatWindow(`Error: ${data.message || 'Gagal.'}`, 'model');
    input.disabled = false; input.focus();
}

function appendToChatWindow(message, role) {
    const chatWindow = document.getElementById('chat-window');
    if(!chatWindow) return;
    const msgWrapper = document.createElement('div');
    const isUser = role === 'user';
    const chatbotMessage = marked.parse(message);
    msgWrapper.className = `flex my-2 ${isUser ? 'justify-end' : 'justify-start'}`;
    msgWrapper.innerHTML = `<div class="p-3 rounded-2xl max-w-sm md:max-w-md ${isUser ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-gray-200 text-gray-800 rounded-bl-lg'}">${chatbotMessage}</div>`;
    chatWindow.appendChild(msgWrapper); chatWindow.scrollTop = chatWindow.scrollHeight;
}

// --- PAGE LOAD INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Jalankan kode spesifik dashboard hanya jika elemennya ada
    if (document.getElementById('app-container')) {
        const storedToken = sessionStorage.getItem('authToken');
        const storedUser = sessionStorage.getItem('currentUser');

        if (storedToken && storedUser) {
            authToken = storedToken;
            currentUser = JSON.parse(storedUser);
            updateAuthStatus();
            initApp();
        } else {
            updateAuthStatus();
        }
        
        // Populate the dropdown initially
        populateHourDropdown();
        
        // Tambahkan event listener
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => { 
                if (e.key === 'Enter') { 
                    e.preventDefault(); 
                    sendMessageToChatbot(); 
                }
            });
        }
        
        // Sync PLN ID inputs
        const plnInput1 = document.getElementById('billing-pln');
        const plnInput2 = document.getElementById('billing-pln-2');

        if (plnInput1 && plnInput2) {
            plnInput1.addEventListener('input', (e) => {
                plnInput2.value = e.target.value;
            });
            plnInput2.addEventListener('input', (e) => {
                plnInput1.value = e.target.value;
            });
        }

        document.addEventListener('click', (e) => { 
            if (!e.target.closest('[id^="appliance-search-"]') && !e.target.closest('[id^="appliance-dropdown-"]')) {
                closeAllDropdowns(); 
            }
        });
    }

    // Jalankan inisialisasi untuk demo di index.html
    if (document.getElementById('demo')) {
        populateHourDropdown();
        applianceRows = [];
        addApplianceRow();
        document.addEventListener('click', (e) => {
            if (!e.target.closest('[id^="appliance-search-"]') && !e.target.closest('[id^="appliance-dropdown-"]')) {
                closeAllDropdowns();
            }
        });
    }

    // Cek dulu apakah showListView relevan dijalankan (untuk halaman blog)
    if (typeof showListView === 'function' && document.getElementById('view-list')) {
        showListView();
    }
});
