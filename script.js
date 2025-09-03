// Configuration
const sourceSheetId = '1chwoYEclmNZb_YxziacE83lD9vPcLa4GEs1CUIlb-sM';
const csvUrl = `https://docs.google.com/spreadsheets/d/${sourceSheetId}/export?format=csv&gid=0`;

// Login credentials
const validCredentials = {
    email: 'admin@gm.com',
    password: 'admin123'
};

// Global variables
let allData = [];
let pocData = [];
let onboardedData = [];
let closedPOCData = [];
let currentView = 'main';
let currentTab = 'customer';
let isDataLoaded = false;

// Loading messages for progress simulation
const loadingMessages = [
    'Loading your data',
    'Connecting to Google Sheets',
    'Processing customer information',
    'Analyzing POC data',
    'Organizing onboarded customers',
    'Finalizing dashboard',
    'Almost ready!'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cautio Dashboard initializing...');
    
    // Check if user is already logged in
    if (localStorage.getItem('cautio_logged_in') === 'true') {
        console.log('User already logged in, showing dashboard...');
        showLoadingPage();
        simulateLoading(() => {
            showMainApp();
            loadData();
        });
    } else {
        console.log('User not logged in, showing login page...');
        showLoginPage();
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Add search functionality
    initializeSearch();
});

// Keyboard shortcuts
function handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
        switch(event.key) {
            case '1':
                event.preventDefault();
                switchTab('customer');
                break;
            case '2':
                event.preventDefault();
                switchTab('finance');
                break;
            case '3':
                event.preventDefault();
                switchTab('ground');
                break;
            case '4':
                event.preventDefault();
                switchTab('inventory');
                break;
            case 'r':
                event.preventDefault();
                if (isDataLoaded) {
                    loadData();
                }
                break;
            case '/':
                event.preventDefault();
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.focus();
                }
                break;
        }
    }
    
    // Escape key to go back
    if (event.key === 'Escape') {
        if (currentView === 'table') {
            showLevel2();
        } else if (currentView === 'level2') {
            showMainDashboard();
        }
    }
}

// Login functionality
function handleLogin(event) {
    event.preventDefault();
    console.log('Login attempt...');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginBtn = event.target.querySelector('.login-btn');
    
    // Disable button during processing
    loginBtn.disabled = true;
    loginBtn.style.opacity = '0.8';
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Signing in...</span>';
    
    // Simulate network delay
    setTimeout(() => {
        if (email === validCredentials.email && password === validCredentials.password) {
            console.log('Login successful!');
            localStorage.setItem('cautio_logged_in', 'true');
            
            // Show success animation
            loginBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
            loginBtn.innerHTML = '<i class="fas fa-check"></i> <span>Login Successful!</span>';
            
            setTimeout(() => {
                showLoadingPage();
                simulateLoading(() => {
                    showMainApp();
                    loadData();
                });
            }, 1200);
            
        } else {
            console.log('Invalid credentials');
            
            // Show error animation
            const loginForm = document.querySelector('.login-form');
            loginForm.style.animation = 'shake 0.5s ease-in-out';
            
            loginBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            loginBtn.innerHTML = '<i class="fas fa-times"></i> <span>Invalid Credentials</span>';
            
            // Show notification
            showNotification('Please check your email and password', 'error');
            
            setTimeout(() => {
                loginBtn.style.background = 'linear-gradient(135deg, #007bff 0%, #00d4aa 100%)';
                loginBtn.innerHTML = '<span>Sign In</span> <i class="fas fa-arrow-right"></i>';
                loginBtn.disabled = false;
                loginBtn.style.opacity = '1';
                loginForm.style.animation = '';
            }, 2500);
        }
    }, 1000);
}

// Add shake animation CSS
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// Logout functionality
function logout() {
    console.log('Logging out...');
    
    // Show confirmation
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }
    
    // Add logout animation
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.style.transform = 'scale(0.8)';
        userProfile.style.opacity = '0.5';
    }
    
    showNotification('Logging out...', 'info');
    
    setTimeout(() => {
        localStorage.removeItem('cautio_logged_in');
        location.reload();
    }, 800);
}

// Page navigation functions
function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('loadingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.title = 'Cautio - Login';
}

function showLoadingPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('loadingPage').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    document.title = 'Cautio - Loading...';
}

function showMainApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('loadingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.title = 'Cautio Dashboard';
    
    // Initialize with customer tab
    switchTab('customer');
}

// Simulate realistic loading with progress bar
function simulateLoading(callback) {
    const progressBar = document.getElementById('progressBar');
    const loadingSubText = document.getElementById('loadingSubText');
    let progress = 0;
    let messageIndex = 0;
    
    // Reset progress bar
    progressBar.style.width = '0%';
    
    const loadingInterval = setInterval(() => {
        // Variable progress speed for realism
        const increment = Math.random() * 12 + 3;
        progress += increment;
        
        if (progress >= 100) {
            progress = 100;
            progressBar.style.width = '100%';
            loadingSubText.textContent = 'Ready!';
            clearInterval(loadingInterval);
            
            setTimeout(() => {
                callback();
            }, 500);
        } else {
            progressBar.style.width = progress + '%';
            
            // Change message based on progress
            const expectedMessageIndex = Math.floor(progress / (100 / loadingMessages.length));
            if (expectedMessageIndex !== messageIndex && expectedMessageIndex < loadingMessages.length) {
                messageIndex = expectedMessageIndex;
                loadingSubText.textContent = loadingMessages[messageIndex];
            }
        }
    }, 200);
}

// Tab switching functionality
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    currentTab = tabName;
    
    // Update active tab with animation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
        
        // Add switch animation
        activeTab.style.transform = 'translateX(12px)';
        setTimeout(() => {
            activeTab.style.transform = 'translateX(8px)';
        }, 200);
    }
    
    // Hide all sections
    hideAllSections();
    
    // Show appropriate section and update header
    switch(tabName) {
        case 'customer':
            document.getElementById('customerSection').style.display = 'block';
            updateHeader('CUSTOMER OVERVIEW', 'Comprehensive view of your customer management');
            if (isDataLoaded) {
                showMainDashboard();
            }
            break;
        case 'finance':
            document.getElementById('financeSection').style.display = 'block';
            updateHeader('FINANCE MANAGEMENT', 'Revenue analytics and billing dashboard');
            break;
        case 'ground':
            document.getElementById('groundSection').style.display = 'block';
            updateHeader('GROUND OPERATIONS', 'Fleet management and operations control');
            break;
        case 'inventory':
            document.getElementById('inventorySection').style.display = 'block';
            updateHeader('INVENTORY MANAGEMENT', 'Warehouse and stock control system');
            break;
    }
}

function hideAllSections() {
    const sections = ['customerSection', 'financeSection', 'groundSection', 'inventorySection'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
}

function updateHeader(title, subtitle) {
    const titleEl = document.getElementById('pageTitle');
    const subtitleEl = document.getElementById('pageSubtitle');
    
    if (titleEl && subtitleEl) {
        // Add fade animation
        const headerLeft = document.querySelector('.header-left');
        headerLeft.style.opacity = '0.7';
        
        setTimeout(() => {
            titleEl.textContent = title;
            subtitleEl.textContent = subtitle;
            headerLeft.style.opacity = '1';
        }, 150);
    }
}

// Data loading and processing functions
async function loadData() {
    if (!navigator.onLine) {
        showNotification('No internet connection', 'error');
        return;
    }
    
    console.log('Loading data from Google Sheets...');
    
    try {
        showDataLoading(true);
        
        // Add refresh animation
        const refreshBtn = document.querySelector('.action-btn[title="Refresh Data"]');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.style.animation = 'spin 1s linear infinite';
        }
        
        // Try to fetch data
        let response;
        try {
            console.log('Attempting direct fetch...');
            response = await fetch(csvUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/csv',
                    'Cache-Control': 'no-cache'
                }
            });
        } catch (error) {
            console.warn('Direct fetch failed, trying alternative method:', error);
            response = await fetch(csvUrl, {
                method: 'GET',
                mode: 'no-cors'
            });
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('CSV data received, length:', csvText.length);
        
        if (!csvText || csvText.trim() === '') {
            throw new Error('Empty response from Google Sheets');
        }
        
        // Parse the CSV data
        allData = parseCSV(csvText);
        console.log('Parsed data rows:', allData.length);
        
        if (allData.length === 0) {
            throw new Error('No data found in the spreadsheet');
        }
        
        // Process the data into categories
        processData();
        
        // Mark data as loaded
        isDataLoaded = true;
        
        // Update the dashboard if we're on customer tab
        if (currentTab === 'customer') {
            showMainDashboard();
        }
        
        // Show success notification
        showNotification(`Successfully loaded ${allData.length} records`, 'success');
        
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Try alternative URL format
        try {
            console.log('Trying alternative CSV URL format...');
            const alternativeUrl = `https://docs.google.com/spreadsheets/d/${sourceSheetId}/export?format=csv&gid=0&cachebuster=${Date.now()}`;
            const altResponse = await fetch(alternativeUrl);
            const altCsvText = await altResponse.text();
            
            allData = parseCSV(altCsvText);
            if (allData.length > 0) {
                processData();
                isDataLoaded = true;
                
                if (currentTab === 'customer') {
                    showMainDashboard();
                }
                
                showNotification(`Successfully loaded ${allData.length} records`, 'success');
            } else {
                throw new Error('No data in alternative source');
            }
            
        } catch (altError) {
            console.error('Alternative URL also failed:', altError);
            showError(`Failed to load data from Google Sheets.\n\nPossible issues:\n• Sheet is not publicly accessible\n• Internet connection problem\n• Incorrect sheet ID\n• Sheet is empty`);
            showNotification('Failed to load customer data', 'error');
        }
    } finally {
        showDataLoading(false);
        
        // Stop refresh animation
        const refreshBtn = document.querySelector('.action-btn[title="Refresh Data"]');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.style.animation = '';
        }
    }
}

// Parse CSV data with robust error handling
function parseCSV(csvText) {
    try {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            console.warn('CSV has less than 2 lines');
            return [];
        }
        
        // Clean and parse headers
        const rawHeaders = lines[0].split(',');
        const headers = rawHeaders.map(header => 
            header.replace(/"/g, '').replace(/^\s+|\s+$/g, '')
        ).filter(header => header.length > 0);
        
        console.log('CSV Headers:', headers);
        
        if (headers.length === 0) {
            console.error('No valid headers found');
            return [];
        }
        
        // Parse data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue; // Skip empty lines
            
            const values = parseCSVRow(line);
            if (values.length > 0) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] ? 
                        values[index].replace(/"/g, '').replace(/^\s+|\s+$/g, '') : '';
                });
                
                // Only add row if it has at least some data
                const hasData = Object.values(row).some(value => value && value.trim() !== '');
                if (hasData) {
                    data.push(row);
                }
            }
        }
        
        console.log(`Successfully parsed ${data.length} rows from ${lines.length - 1} CSV lines`);
        return data;
        
    } catch (error) {
        console.error('Error parsing CSV:', error);
        return [];
    }
}

// Parse individual CSV row with quote handling
function parseCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let escapeNext = false;
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (escapeNext) {
            current += char;
            escapeNext = false;
        } else if (char === '\\') {
            escapeNext = true;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current); // Add the last field
    return result;
}

// Process and categorize the data
function processData() {
    console.log('Processing data into categories...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Reset arrays
    pocData = [];
    onboardedData = [];
    closedPOCData = [];
    
    // Process each row
    allData.forEach((row, index) => {
        try {
            // Get via field (case insensitive)
            const via = (row['via'] || row['Via'] || row['VIA'] || '').toLowerCase().trim();
            
            if (via === 'poc') {
                // This is a POC customer
                const pocEndDateStr = row['POC End Date'] || row['poc end date'] || row['POC END DATE'] || '';
                const pocEndDate = parseDate(pocEndDateStr);
                
                if (pocEndDate && pocEndDate < today) {
                    // POC has ended
                    console.log(`Row ${index}: POC ended - ${row['Partner Full Name']} (${pocEndDateStr})`);
                    closedPOCData.push(row);
                } else {
                    // POC is active
                    console.log(`Row ${index}: Active POC - ${row['Partner Full Name']}`);
                    pocData.push(row);
                }
            } else {
                // This is an onboarded customer
                const clientType = (row['Client Type'] || row['client type'] || '').toLowerCase().trim();
                
                // Determine if they came from POC or are direct onboarding
                if (clientType === 'poc' || clientType.includes('poc')) {
                    row['Client Type'] = 'POC';
                } else {
                    row['Client Type'] = 'Direct Onboarding';
                }
                
                console.log(`Row ${index}: Onboarded - ${row['Partner Full Name']} (${row['Client Type']})`);
                onboardedData.push(row);
            }
        } catch (error) {
            console.warn(`Error processing row ${index}:`, error, row);
        }
    });
    
    console.log('Data processing completed:');
    console.log(`- POC customers: ${pocData.length}`);
    console.log(`- Onboarded customers: ${onboardedData.length}`);
    console.log(`- Closed POCs: ${closedPOCData.length}`);
    console.log(`- Total: ${allData.length}`);
}

// Date parsing with multiple format support
function parseDate(dateString) {
    if (!dateString || dateString.trim() === '') {
        return null;
    }
    
    const cleanDate = dateString.trim();
    
    // Try different date formats common in Google Sheets
    const formats = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY or MM/DD/YYYY
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY or MM-DD-YYYY
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
        /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // DD/MM/YY or MM/DD/YY
    ];
    
    for (const format of formats) {
        const match = cleanDate.match(format);
        if (match) {
            let day, month, year;
            
            if (format.source.includes('YYYY-')) {
                // YYYY-MM-DD format
                year = parseInt(match[1]);
                month = parseInt(match[2]) - 1;
                day = parseInt(match[3]);
            } else {
                // Assume DD/MM/YYYY format (common in India)
                day = parseInt(match[1]);
                month = parseInt(match[2]) - 1;
                year = parseInt(match[3]);
                
                // Handle 2-digit years
                if (year < 100) {
                    year += year < 50 ? 2000 : 1900;
                }
            }
            
            const date = new Date(year, month, day);
            
            // Validate the date
            if (date.getFullYear() === year && 
                date.getMonth() === month && 
                date.getDate() === day) {
                return date;
            }
        }
    }
    
    // Fallback to native Date parsing
    const fallbackDate = new Date(cleanDate);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

// Format date for display
function formatDate(dateString) {
    const date = parseDate(dateString);
    if (!date) {
        return dateString || '-';
    }
    
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Show/hide data loading
function showDataLoading(show) {
    const loadingElement = document.getElementById('dataLoading');
    if (!loadingElement) return;
    
    if (show) {
        loadingElement.style.display = 'flex';
        loadingElement.style.opacity = '0';
        loadingElement.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            loadingElement.style.opacity = '1';
            loadingElement.style.transform = 'translateY(0)';
        }, 100);
    } else {
        loadingElement.style.opacity = '0';
        loadingElement.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            loadingElement.style.display = 'none';
        }, 300);
    }
}

// Show error in dashboard
function showError(message) {
    const dashboardWrapper = document.querySelector('.dashboard-wrapper');
    if (!dashboardWrapper) return;
    
    dashboardWrapper.innerHTML = `
        <div class="section-content">
            <div class="coming-soon-section">
                <div class="coming-soon-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); box-shadow: 0 10px 40px rgba(239, 68, 68, 0.3);">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 style="color: #ef4444;">Unable to Load Data</h2>
                <p style="white-space: pre-line; max-width: 600px;">${message}</p>
                <button onclick="loadData()" class="action-btn" style="
                    margin-top: 24px; 
                    padding: 12px 24px; 
                    background: linear-gradient(135deg, #007bff 0%, #00d4aa 100%); 
                    color: white; 
                    border: none; 
                    border-radius: 12px; 
                    cursor: pointer; 
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <i class="fas fa-sync-alt"></i>
                    Retry Loading Data
                </button>
            </div>
        </div>
    `;
}

// Customer dashboard navigation functions
function showMainDashboard() {
    console.log('Showing main dashboard...');
    currentView = 'main';
    hideAllViews();
    
    const mainDashboard = document.getElementById('mainDashboard');
    if (mainDashboard) {
        mainDashboard.style.display = 'block';
        
        // Animate total customers count
        const countElement = document.getElementById('totalCustomersCount');
        if (countElement && isDataLoaded) {
            animateNumber(countElement, 0, allData.length, 1500);
        }
    }
}

function showLevel2() {
    console.log('Showing level 2 dashboard...');
    currentView = 'level2';
    hideAllViews();
    
    const level2Dashboard = document.getElementById('level2Dashboard');
    if (level2Dashboard) {
        level2Dashboard.style.display = 'block';
        
        // Animate counts
        if (isDataLoaded) {
            animateNumber(document.getElementById('pocCount'), 0, pocData.length, 1000);
            animateNumber(document.getElementById('onboardedCount'), 0, onboardedData.length, 1200);
            animateNumber(document.getElementById('closedPOCCount'), 0, closedPOCData.length, 800);
        }
        
        // Show/hide closed POC section
        const closedCardWrapper = document.getElementById('closedCardWrapper');
        if (closedCardWrapper) {
            if (closedPOCData.length > 0) {
                closedCardWrapper.style.display = 'block';
                
                // Add entrance animation
                setTimeout(() => {
                    closedCardWrapper.style.opacity = '0';
                    closedCardWrapper.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        closedCardWrapper.style.opacity = '1';
                        closedCardWrapper.style.transform = 'translateY(0)';
                    }, 100);
                }, 200);
            } else {
                closedCardWrapper.style.display = 'none';
            }
        }
    }
}

// Table showing functions
function showPOCTable() {
    const columns = ['Cautio ID', 'Partner Full Name', 'POC Start Date', 'POC End Date'];
    showTable(pocData, 'Active POCs', columns, 'poc');
}

function showOnboardedTable() {
    const columns = ['Cautio ID', 'Partner Full Name', 'Onboarding Date', 'Client Type'];
    showTable(onboardedData, 'Onboarded Customers', columns, 'onboarded');
}

function showClosedPOCTable() {
    const columns = ['Cautio ID', 'Partner Full Name', 'POC Start Date', 'POC End Date'];
    showTable(closedPOCData, 'Closed POCs', columns, 'closed');
}

function showTable(data, title, columns, type) {
    console.log(`Showing ${type} table with ${data.length} records`);
    currentView = 'table';
    hideAllViews();
    
    const tableView = document.getElementById('tableView');
    if (!tableView) return;
    
    tableView.style.display = 'block';
    
    // Update breadcrumb
    const breadcrumb = document.getElementById('tableBreadcrumb');
    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <span onclick="showMainDashboard()" class="breadcrumb-link">
                <i class="fas fa-home"></i> Dashboard
            </span>
            <i class="fas fa-chevron-right breadcrumb-separator"></i>
            <span onclick="showLevel2()" class="breadcrumb-link">Customer Breakdown</span>
            <i class="fas fa-chevron-right breadcrumb-separator"></i>
            <span>${title}</span>
        `;
    }
    
    // Update table title and count
    const tableTitle = document.getElementById('tableTitle');
    const tableCount = document.getElementById('tableCount');
    
    if (tableTitle) tableTitle.textContent = title;
    if (tableCount) animateNumber(tableCount, 0, data.length, 800);
    
    // Generate table headers
    const tableHead = document.getElementById('tableHead');
    if (tableHead) {
        const headerRow = columns.map(col => `<th>${col}</th>`).join('');
        tableHead.innerHTML = `<tr>${headerRow}</tr>`;
    }
    
    // Generate table body
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="${columns.length}" style="text-align: center; padding: 60px; color: #94a3b8;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 16px; opacity: 0.5; display: block;"></i>
                    No data available for ${title.toLowerCase()}
                </td>
            </tr>
        `;
        return;
    }
    
    const rows = data.map((row, index) => {
        const cells = columns.map(col => {
            // Handle different column name variations
            let value = row[col] || 
                       row[col.toLowerCase()] || 
                       row[col.toUpperCase()] ||
                       row[col.replace(/\s+/g, ' ')] || 
                       '-';
            
            // Format dates
            if (col.includes('Date') && value !== '-') {
                value = formatDate(value);
            }
            
            // Add status styling
            let cellClass = '';
            if (col === 'Client Type') {
                cellClass = value === 'POC' ? 'status-pending' : 'status-active';
            }
            
            return `<td class="${cellClass}">${value}</td>`;
        }).join('');
        
        return `<tr style="animation: fadeInUp 0.3s ease ${index * 0.02}s both">${cells}</tr>`;
    }).join('');
    
    tableBody.innerHTML = rows;
    
    // Add fade-in animation styles
    addFadeInAnimation();
}

function hideAllViews() {
    const views = ['mainDashboard', 'level2Dashboard', 'tableView'];
    views.forEach(viewId => {
        const view = document.getElementById(viewId);
        if (view) {
            view.style.display = 'none';
        }
    });
}

// Add fade-in animation CSS
function addFadeInAnimation() {
    if (document.getElementById('fadeInUpStyle')) return;
    
    const style = document.createElement('style');
    style.id = 'fadeInUpStyle';
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Animate number counting
function animateNumber(element, start, end, duration) {
    if (!element) return;
    
    const range = end - start;
    if (range === 0) {
        element.textContent = end;
        return;
    }
    
    const increment = range / (duration / 50);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 50);
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce(function(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (currentView === 'table' && query.length > 0) {
            searchInTable(query);
        } else if (query.length === 0 && currentView === 'table') {
            resetTableSearch();
        }
    }, 300));
    
    // Add search placeholder animation
    searchInput.addEventListener('focus', function() {
        this.style.transform = 'scale(1.02)';
    });
    
    searchInput.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
    });
}

// Search within table
function searchInTable(query) {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    let visibleCount = 0;
    
    // Remove previous "no results" row
    const existingNoResults = tableBody.querySelector('.search-no-results');
    if (existingNoResults) {
        existingNoResults.remove();
    }
    
    rows.forEach(row => {
        if (row.classList.contains('search-no-results')) return;
        
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(query);
        
        row.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
    });
    
    // Update count
    const tableCount = document.getElementById('tableCount');
    if (tableCount) {
        tableCount.textContent = visibleCount;
    }
    
    // Show "no results" message if needed
    if (visibleCount === 0) {
        const colspan = rows[0]?.children.length || 4;
        const noResultsRow = document.createElement('tr');
        noResultsRow.className = 'search-no-results';
        noResultsRow.innerHTML = `
            <td colspan="${colspan}" style="text-align: center; padding: 40px; color: #94a3b8; font-style: italic;">
                <i class="fas fa-search" style="margin-right: 8px; opacity: 0.5;"></i>
                No results found for "${query}"
            </td>
        `;
        tableBody.appendChild(noResultsRow);
    }
}

// Reset table search
function resetTableSearch() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        if (row.classList.contains('search-no-results')) {
            row.remove();
        } else {
            row.style.display = '';
        }
    });
    
    // Reset count based on current view
    const tableCount = document.getElementById('tableCount');
    if (tableCount && isDataLoaded) {
        let totalCount = 0;
        if (currentView === 'table') {
            // Determine which data we're showing
            if (document.getElementById('tableTitle')?.textContent.includes('POC')) {
                totalCount = pocData.length;
            } else if (document.getElementById('tableTitle')?.textContent.includes('Onboarded')) {
                totalCount = onboardedData.length;
            } else if (document.getElementById('tableTitle')?.textContent.includes('Closed')) {
                totalCount = closedPOCData.length;
            }
        }
        tableCount.textContent = totalCount;
    }
}

// Notification system
function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const colors = {
        success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        info: 'linear-gradient(135deg, #007bff 0%, #00d4aa 100%)'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Styling
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        max-width: 400px;
        background: ${colors[type] || colors.info};
    `;
    
    // Close button styling
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
        padding: 4px 6px;
        margin-left: auto;
        transition: background 0.2s ease;
    `;
    
    closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debug function for developers
function debugData() {
    console.log('=== CAUTIO DEBUG INFO ===');
    console.log('Data loaded:', isDataLoaded);
    console.log('Total rows:', allData.length);
    console.log('Current tab:', currentTab);
    console.log('Current view:', currentView);
    console.log('POC data:', pocData.length);
    console.log('Onboarded data:', onboardedData.length);
    console.log('Closed POC data:', closedPOCData.length);
    
    if (allData.length > 0) {
        console.log('Sample row:', allData[0]);
        console.log('Available columns:', Object.keys(allData[0]));
    }
    
    console.log('Sheet URL:', csvUrl);
    console.log('========================');
    return {
        isDataLoaded,
        totalRows: allData.length,
        currentTab,
        currentView,
        pocCount: pocData.length,
        onboardedCount: onboardedData.length,
        closedCount: closedPOCData.length,
        sampleRow: allData[0],
        columns: allData[0] ? Object.keys(allData[0]) : []
    };
}

// Make functions available globally for HTML onclick events
window.handleLogin = handleLogin;
window.togglePassword = togglePassword;
window.logout = logout;
window.switchTab = switchTab;
window.showMainDashboard = showMainDashboard;
window.showLevel2 = showLevel2;
window.showPOCTable = showPOCTable;
window.showOnboardedTable = showOnboardedTable;
window.showClosedPOCTable = showClosedPOCTable;
window.loadData = loadData;
window.debugData = debugData;

// Console welcome message
console.log(`
  ██████╗ █████╗ ██╗   ██╗████████╗██╗ ██████╗ 
 ██╔════╝██╔══██╗██║   ██║╚══██╔══╝██║██╔═══██╗
 ██║     ███████║██║   ██║   ██║   ██║██║   ██║
 ██║     ██╔══██║██║   ██║   ██║   ██║██║   ██║
 ╚██████╗██║  ██║╚██████╔╝   ██║   ██║╚██████╔╝
  ╚═════╝╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ 
                                                
🚀 Cautio Dashboard v1.0
📊 Fleet Management Platform
🔧 Debug: window.debugData()
`);

console.log('Cautio Dashboard loaded successfully! 🎉');
