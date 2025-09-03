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

// Loading messages
const loadingMessages = [
    'Loading your data',
    'Connecting to Google Sheets',
    'Processing customer information',
    'Analyzing POC data',
    'Finalizing dashboard',
    'Almost ready!'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (localStorage.getItem('cautio_logged_in') === 'true') {
        showLoadingPage();
        simulateLoading(() => {
            showMainApp();
            loadData();
        });
    } else {
        showLoginPage();
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
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
                loadData();
                break;
        }
    }
}

// Login functionality
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (email === validCredentials.email && password === validCredentials.password) {
        localStorage.setItem('cautio_logged_in', 'true');
        
        // Add success animation
        const loginBtn = event.target.querySelector('.login-btn');
        loginBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
        loginBtn.innerHTML = '<i class="fas fa-check"></i> <span>Login Successful!</span>';
        
        setTimeout(() => {
            showLoadingPage();
            simulateLoading(() => {
                showMainApp();
                loadData();
            });
        }, 1000);
    } else {
        // Show error animation
        const loginForm = document.querySelector('.login-form');
        loginForm.style.animation = 'shake 0.5s ease-in-out';
        
        const loginBtn = event.target.querySelector('.login-btn');
        loginBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        loginBtn.innerHTML = '<i class="fas fa-times"></i> <span>Invalid Credentials</span>';
        
        setTimeout(() => {
            loginBtn.style.background = 'linear-gradient(135deg, #007bff 0%, #00d4aa 100%)';
            loginBtn.innerHTML = '<span>Sign In</span> <i class="fas fa-arrow-right"></i>';
            loginForm.style.animation = '';
        }, 2000);
    }
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

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

function logout() {
    // Add logout animation
    const userProfile = document.querySelector('.user-profile');
    userProfile.style.transform = 'scale(0.8)';
    userProfile.style.opacity = '0.5';
    
    setTimeout(() => {
        localStorage.removeItem('cautio_logged_in');
        location.reload();
    }, 300);
}

// Page navigation
function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('loadingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
}

function showLoadingPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('loadingPage').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('loadingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Initialize with customer tab
    switchTab('customer');
}

// Simulate loading with progress bar and changing messages
function simulateLoading(callback) {
    const progressBar = document.getElementById('progressBar');
    const loadingSubText = document.getElementById('loadingSubText');
    let progress = 0;
    let messageIndex = 0;
    
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        
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
            
            // Change message every 20% progress
            if (progress > (messageIndex + 1) * 20 && messageIndex < loadingMessages.length - 1) {
                messageIndex++;
                loadingSubText.textContent = loadingMessages[messageIndex];
            }
        }
    }, 300);
}

// Tab switching functionality
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Hide all sections
    hideAllSections();
    
    // Show appropriate section and update header
    switch(tabName) {
        case 'customer':
            document.getElementById('customerSection').style.display = 'block';
            updateHeader('CUSTOMER OVERVIEW', 'Comprehensive view of your customer management');
            showMainDashboard();
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
    
    // Add tab switching animation
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    activeTab.style.transform = 'translateX(12px)';
    setTimeout(() => {
        activeTab.style.transform = 'translateX(8px)';
    }, 150);
}

function hideAllSections() {
    document.getElementById('customerSection').style.display = 'none';
    document.getElementById('financeSection').style.display = 'none';
    document.getElementById('groundSection').style.display = 'none';
    document.getElementById('inventorySection').style.display = 'none';
}

function updateHeader(title, subtitle) {
    document.getElementById('pageTitle').textContent = title;
    document.getElementById('pageSubtitle').textContent = subtitle;
    
    // Add header update animation
    const headerLeft = document.querySelector('.header-left');
    headerLeft.style.opacity = '0.7';
    setTimeout(() => {
        headerLeft.style.opacity = '1';
    }, 200);
}

// Load data from Google Sheets
async function loadData() {
    try {
        showDataLoading(true);
        
        // Add refresh animation to button
        const refreshBtn = document.querySelector('.action-btn[title="Refresh Data"]');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.style.animation = 'spin 1s linear infinite';
        }
        
        // First, try direct fetch
        let response;
        try {
            response = await fetch(csvUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/csv'
                }
            });
        } catch (error) {
            console.warn('Direct fetch failed, trying with no-cors:', error);
            // If CORS fails, try with no-cors mode
            response = await fetch(csvUrl, {
                method: 'GET',
                mode: 'no-cors'
            });
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        
        if (!csvText || csvText.trim() === '') {
            throw new Error('Empty response from Google Sheets');
        }
        
        console.log('CSV response received:', csvText.substring(0, 200) + '...');
        
        // Parse CSV
        allData = parseCSV(csvText);
        console.log('Parsed data:', allData);
        
        if (allData.length === 0) {
            throw new Error('No data found in the sheet');
        }
        
        // Process data
        processData();
        
        // Show success message
        showNotification('Data loaded successfully!', 'success');
        
        // Update dashboard
        if (currentTab === 'customer') {
            showMainDashboard();
        }
        
        showDataLoading(false);
        
        // Stop refresh animation
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.style.animation = '';
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Try alternative URL format
        try {
            console.log('Trying alternative CSV URL...');
            const alternativeUrl = `https://docs.google.com/spreadsheets/d/${sourceSheetId}/export?format=csv`;
            const altResponse = await fetch(alternativeUrl);
            const altCsvText = await altResponse.text();
            
            allData = parseCSV(altCsvText);
            processData();
            
            if (currentTab === 'customer') {
                showMainDashboard();
            }
            
            showNotification('Data loaded successfully!', 'success');
            showDataLoading(false);
            
        } catch (altError) {
            console.error('Alternative URL also failed:', altError);
            showError('Failed to load data from Google Sheets. Please check:\n• Sheet is publicly accessible\n• Internet connection is stable\n• Sheet ID is correct');
            showDataLoading(false);
            showNotification('Failed to load data', 'error');
        }
        
        // Stop refresh animation
        const refreshBtn = document.querySelector('.action-btn[title="Refresh Data"]');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.style.animation = '';
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add notification styles
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
        transform: translateY(-20px);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #007bff 0%, #00d4aa 100%)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Parse CSV data (same as before but with better error handling)
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    // Get headers and clean them
    const headers = lines[0].split(',').map(header => 
        header.replace(/"/g, '').replace(/^\s+|\s+$/g, '')
    );
    
    console.log('CSV Headers found:', headers);
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue; // Skip empty lines
        
        const values = parseCSVRow(lines[i]);
        if (values.length >= headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].replace(/"/g, '').replace(/^\s+|\s+$/g, '') : '';
            });
            data.push(row);
        }
    }
    
    console.log(`Parsed ${data.length} rows from CSV`);
    return data;
}

// Parse CSV row handling commas within quotes
function parseCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Process and categorize data
function processData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    pocData = [];
    onboardedData = [];
    closedPOCData = [];
    
    console.log('Processing data...');
    console.log('Sample row:', allData[0]);
    
    allData.forEach((row, index) => {
        const via = (row['via'] || row['Via'] || '').toLowerCase().trim();
        
        console.log(`Row ${index}: via = "${via}"`);
        
        if (via === 'poc') {
            // Check if POC is closed
            const pocEndDateStr = row['POC End Date'] || row['poc end date'] || '';
            const pocEndDate = parseDate(pocEndDateStr);
            
            if (pocEndDate && pocEndDate < today) {
                // POC has ended - move to closed
                console.log(`Moving POC to closed: ${row['Partner Full Name'] || row['partner full name']} - End date: ${pocEndDateStr}`);
                closedPOCData.push(row);
            } else {
                // Active POC
                console.log(`Active POC: ${row['Partner Full Name'] || row['partner full name']}`);
                pocData.push(row);
            }
        } else {
            // All others go to onboarded
            // Set Client Type based on whether they came from POC
            const clientType = (row['Client Type'] || row['client type'] || '').toLowerCase().trim();
            if (clientType === 'poc') {
                row['Client Type'] = 'POC';
            } else {
                row['Client Type'] = 'Direct Onboarding';
            }
            console.log(`Onboarded customer: ${row['Partner Full Name'] || row['partner full name']} - Type: ${row['Client Type']}`);
            onboardedData.push(row);
        }
    });
    
    console.log('Data processing completed:');
    console.log('POC Data:', pocData.length);
    console.log('Onboarded Data:', onboardedData.length);
    console.log('Closed POC Data:', closedPOCData.length);
}

// Parse date string to Date object
function parseDate(dateString) {
    if (!dateString || dateString.trim() === '') return null;
    
    // Try different date formats
    const formats = [
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY or DD/MM/YYYY
        /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
        /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY or MM-DD-YYYY
    ];
    
    for (const format of formats) {
        const match = dateString.match(format);
        if (match) {
            // Assuming DD/MM/YYYY format (Indian format)
            const day = parseInt(match[1]);
            const month = parseInt(match[2]) - 1; // JavaScript months are 0-indexed
            const year = parseInt(match[3]);
            return new Date(year, month, day);
        }
    }
    
    // Try native Date parsing as fallback
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
}

// Format date for display
function formatDate(dateString) {
    const date = parseDate(dateString);
    if (!date) return dateString || '-';
    
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Show/hide data loading
function showDataLoading(show) {
    const loadingElement = document.getElementById('dataLoading');
    if (show) {
        loadingElement.style.display = 'flex';
        // Add loading animation to the card
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

// Show error message
function showError(message) {
    const dashboard = document.querySelector('.dashboard-wrapper');
    dashboard.innerHTML = `
        <div class="section-content">
            <div class="coming-soon-section">
                <div class="coming-soon-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 style="color: #ef4444;">Error Loading Data</h2>
                <p style="white-space: pre-line;">${message}</p>
                <button onclick="loadData()" class="action-btn" style="margin-top: 24px; padding: 12px 24px; background: linear-gradient(135deg, #007bff 0%, #00d4aa 100%); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-sync-alt" style="margin-right: 8px;"></i>
                    Retry Loading Data
                </button>
            </div>
        </div>
    `;
}

// Customer dashboard navigation
function showMainDashboard() {
    currentView = 'main';
    hideAllViews();
    document.getElementById('mainDashboard').style.display = 'block';
    
    // Update total customers count with animation
    const countElement = document.getElementById('totalCustomersCount');
    animateNumber(countElement, 0, allData.length, 1500);
}

function showLevel2() {
    currentView = 'level2';
    hideAllViews();
    document.getElementById('level2Dashboard').style.display = 'block';
    
    // Update counts with animations
    animateNumber(document.getElementById('pocCount'), 0, pocData.length, 1000);
    animateNumber(document.getElementById('onboardedCount'), 0, onboardedData.length, 1200);
    animateNumber(document.getElementById('closedPOCCount'), 0, closedPOCData.length, 800);
    
    // Show closed section if there are closed POCs
    const closedCardWrapper = document.getElementById('closedCardWrapper');
    if (closedPOCData.length > 0) {
        closedCardWrapper.style.display = 'block';
        // Add entrance animation
        closedCardWrapper.style.opacity = '0';
        closedCardWrapper.style.transform = 'translateY(20px)';
        setTimeout(() => {
            closedCardWrapper.style.opacity = '1';
            closedCardWrapper.style.transform = 'translateY(0)';
        }, 300);
    } else {
        closedCardWrapper.style.display = 'none';
    }
}

// Animate number counting
function animateNumber(element, start, end, duration) {
    if (!element) return;
    
    const range = end - start;
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
    currentView = 'table';
    hideAllViews();
    document.getElementById('tableView').style.display = 'block';
    
    // Update breadcrumb
    const breadcrumb = document.getElementById('tableBreadcrumb');
    breadcrumb.innerHTML = `
        <span onclick="showMainDashboard()" class="breadcrumb-link">
            <i class="fas fa-home"></i> Dashboard
        </span>
        <i class="fas fa-chevron-right breadcrumb-separator"></i>
        <span onclick="showLevel2()" class="breadcrumb-link">Customer Breakdown</span>
        <i class="fas fa-chevron-right breadcrumb-separator"></i>
        <span>${title}</span>
    `;
    
    // Update table title and count
    document.getElementById('tableTitle').textContent = title;
    animateNumber(document.getElementById('tableCount'), 0, data.length, 800);
    
    // Generate table headers
    const tableHead = document.getElementById('tableHead');
    const headerRow = columns.map(col => `<th>${col}</th>`).join('');
    tableHead.innerHTML = `<tr>${headerRow}</tr>`;
    
    // Generate table body
    const tableBody = document.getElementById('tableBody');
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="${columns.length}" style="text-align: center; padding: 60px; color: #94a3b8;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 16px; opacity: 0.5;"></i><br>
                    No data available for ${title.toLowerCase()}
                </td>
            </tr>
        `;
        return;
    }
    
    const rows = data.map((row, index) => {
        const cells = columns.map(col => {
            // Handle case variations in column names
            let value = row[col] || row[col.toLowerCase()] || row[col.replace(/\s+/g, ' ')] || '-';
            
            // Format dates
            if (col.includes('Date') && value !== '-') {
                value = formatDate(value);
            }
            
            // Add status classes for certain columns
            let cellClass = '';
            if (col === 'Client Type') {
                cellClass = value === 'POC' ? 'status-pending' : 'status-active';
            }
            
            return `<td class="${cellClass}">${value}</td>`;
        }).join('');
        
        return `<tr style="animation: fadeInUp 0.3s ease ${index * 0.05}s both">${cells}</tr>`;
    }).join('');
    
    tableBody.innerHTML = rows;
    
    // Add fadeInUp animation
    const fadeInUpStyle = `
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
    
    if (!document.getElementById('fadeInUpStyle')) {
        const style = document.createElement('style');
        style.id = 'fadeInUpStyle';
        style.textContent = fadeInUpStyle;
        document.head.appendChild(style);
    }
}

function hideAllViews() {
    document.getElementById('mainDashboard').style.display = 'none';
    document.getElementById('level2Dashboard').style.display = 'none';
    document.getElementById('tableView').style.display = 'none';
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.toLowerCase().trim();
            if (query.length > 2) {
                searchCustomers(query);
            }
        }, 300));
    }
});

function searchCustomers(query) {
    if (currentView !== 'table') return;
    
    const rows = document.querySelectorAll('#tableBody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(query)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update count
    document.getElementById('tableCount').textContent = visibleCount;
    
    // Show message if no results
    if (visibleCount === 0 && query.length > 0) {
        const tbody = document.getElementById('tableBody');
        const colspan = tbody.querySelector('tr').children.length;
        tbody.innerHTML += `
            <tr class="search-no-results">
                <td colspan="${colspan}" style="text-align: center; padding: 40px; color: #94a3b8; font-style: italic;">
                    <i class="fas fa-search" style="margin-right: 8px;"></i>
                    No results found for "${query}"
                </td>
            </tr>
        `;
    }
}

// Utility functions
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

// Debug function
function debugData() {
    console.log('=== DEBUG DATA ===');
    console.log('Total rows:', allData.length);
    console.log('Sample row:', allData[0]);
    console.log('All headers:', allData[0] ? Object.keys(allData[0]) : 'No data');
    console.log('POC data:', pocData.length);
    console.log('Onboarded data:', onboardedData.length);
    console.log('Closed POC data:', closedPOCData.length);
}

// Make functions available globally
window.debugData = debugData;
window.switchTab = switchTab;
window.showMainDashboard = showMainDashboard;
window.showLevel2 = showLevel2;
window.showPOCTable = showPOCTable;
window.showOnboardedTable = showOnboardedTable;
window.showClosedPOCTable = showClosedPOCTable;
window.loadData = loadData;
window.handleLogin = handleLogin;
window.togglePassword = togglePassword;
window.logout = logout;
