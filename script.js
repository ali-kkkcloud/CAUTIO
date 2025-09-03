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

// Menu configurations
const menuConfigs = {
    customer: {
        title: 'Customer Overview',
        items: [
            { name: 'Dashboard', action: 'showCustomerDashboard' },
            { name: 'POC Management', action: 'showPOCTable' },
            { name: 'Onboarded Customers', action: 'showOnboardedTable' },
            { name: 'Closed POCs', action: 'showClosedPOCTable' }
        ]
    },
    finance: {
        title: 'Finance',
        items: [
            { name: 'Revenue Dashboard', action: 'showFinanceSection' },
            { name: 'Billing', action: 'showFinanceSection' },
            { name: 'Invoices', action: 'showFinanceSection' },
            { name: 'Reports', action: 'showFinanceSection' }
        ]
    },
    ground: {
        title: 'Ground Operations',
        items: [
            { name: 'Fleet Management', action: 'showGroundSection' },
            { name: 'Driver Management', action: 'showGroundSection' },
            { name: 'Route Planning', action: 'showGroundSection' },
            { name: 'Operations Monitor', action: 'showGroundSection' }
        ]
    },
    inventory: {
        title: 'Inventory Management',
        items: [
            { name: 'Stock Overview', action: 'showInventorySection' },
            { name: 'Warehouse Management', action: 'showInventorySection' },
            { name: 'Supply Chain', action: 'showInventorySection' },
            { name: 'Procurement', action: 'showInventorySection' }
        ]
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (localStorage.getItem('cautio_logged_in') === 'true') {
        showLoadingPage();
        setTimeout(() => {
            showMainApp();
            loadData();
        }, 2000);
    } else {
        showLoginPage();
    }
});

// Login functionality
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (email === validCredentials.email && password === validCredentials.password) {
        localStorage.setItem('cautio_logged_in', 'true');
        showLoadingPage();
        
        setTimeout(() => {
            showMainApp();
            loadData();
        }, 3000);
    } else {
        alert('Invalid credentials! Please use admin@gm.com / admin123');
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
}

function logout() {
    localStorage.removeItem('cautio_logged_in');
    location.reload();
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
}

// Sidebar functionality
let hoverTimeout;

function showSidebarMenu(event, tabType) {
    clearTimeout(hoverTimeout);
    currentTab = tabType;
    
    const sidebarMenu = document.getElementById('sidebarMenu');
    const menuItems = document.getElementById('menuItems');
    const config = menuConfigs[tabType];
    
    // Update menu content
    menuItems.innerHTML = config.items.map(item => 
        `<div class="menu-item" onclick="${item.action}()">${item.name}</div>`
    ).join('');
    
    // Show menu
    sidebarMenu.classList.add('show');
    
    // Update active icon
    document.querySelectorAll('.nav-icon-item').forEach(icon => {
        icon.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

function hideSidebarMenu() {
    hoverTimeout = setTimeout(() => {
        document.getElementById('sidebarMenu').classList.remove('show');
    }, 300);
}

// Load data from Google Sheets
async function loadData() {
    try {
        showDataLoading(true);
        
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
        
        // Show customer dashboard by default
        showCustomerDashboard();
        showDataLoading(false);
        
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Fallback: try alternative URL format
        try {
            console.log('Trying alternative CSV URL...');
            const alternativeUrl = `https://docs.google.com/spreadsheets/d/${sourceSheetId}/export?format=csv`;
            const altResponse = await fetch(alternativeUrl);
            const altCsvText = await altResponse.text();
            
            allData = parseCSV(altCsvText);
            processData();
            showCustomerDashboard();
            showDataLoading(false);
            
        } catch (altError) {
            console.error('Alternative URL also failed:', altError);
            showError('Failed to load data from Google Sheets. Please check:\n1. Sheet is publicly accessible\n2. Internet connection\n3. Sheet ID is correct');
            showDataLoading(false);
        }
    }
}

// Parse CSV data
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
    document.getElementById('dataLoading').style.display = show ? 'flex' : 'none';
}

// Show error message
function showError(message) {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `
        <div class="empty-state">
            <h3>Error Loading Data</h3>
            <p style="white-space: pre-line;">${message}</p>
            <button onclick="loadData()" class="clear-btn" style="margin-top: 16px; padding: 12px 24px;">
                Retry Loading Data
            </button>
        </div>
    `;
}

// Section navigation functions
function showCustomerDashboard() {
    hideAllSections();
    document.getElementById('customerOverview').style.display = 'block';
    showMainDashboard();
    updateHeader('CUSTOMER OVERVIEW', 'Welcome to your customer management dashboard.');
}

function showFinanceSection() {
    hideAllSections();
    document.getElementById('financeSection').style.display = 'block';
    updateHeader('FINANCE', 'Financial data and analytics dashboard.');
}

function showGroundSection() {
    hideAllSections();
    document.getElementById('groundSection').style.display = 'block';
    updateHeader('GROUND OPERATIONS', 'Fleet and operations management dashboard.');
}

function showInventorySection() {
    hideAllSections();
    document.getElementById('inventorySection').style.display = 'block';
    updateHeader('INVENTORY MANAGEMENT', 'Warehouse and inventory control dashboard.');
}

function hideAllSections() {
    document.getElementById('customerOverview').style.display = 'none';
    document.getElementById('financeSection').style.display = 'none';
    document.getElementById('groundSection').style.display = 'none';
    document.getElementById('inventorySection').style.display = 'none';
}

function updateHeader(title, subtitle) {
    document.getElementById('pageTitle').textContent = title;
    document.getElementById('pageSubtitle').textContent = subtitle;
}

// Customer dashboard navigation
function showMainDashboard() {
    currentView = 'main';
    hideAllViews();
    document.getElementById('mainDashboard').style.display = 'block';
    
    // Update total customers count
    const totalCustomers = allData.length;
    document.getElementById('totalCustomersCount').textContent = totalCustomers;
}

function showLevel2() {
    currentView = 'level2';
    hideAllViews();
    document.getElementById('level2Dashboard').style.display = 'block';
    
    // Update counts
    document.getElementById('pocCount').textContent = pocData.length;
    document.getElementById('onboardedCount').textContent = onboardedData.length;
    document.getElementById('closedPOCCount').textContent = closedPOCData.length;
    
    // Show closed section if there are closed POCs
    const closedSection = document.getElementById('closedSection');
    if (closedPOCData.length > 0) {
        closedSection.style.display = 'block';
    } else {
        closedSection.style.display = 'none';
    }
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
        <span onclick="showMainDashboard()" class="breadcrumb-link">Dashboard</span>
        <span class="breadcrumb-separator">></span>
        <span onclick="showLevel2()" class="breadcrumb-link">Customer Overview</span>
        <span class="breadcrumb-separator">></span>
        <span>${title}</span>
    `;
    
    // Update table title and count
    document.getElementById('tableTitle').textContent = title;
    document.getElementById('tableCount').textContent = data.length;
    
    // Generate table headers
    const tableHead = document.getElementById('tableHead');
    const headerRow = columns.map(col => `<th>${col}</th>`).join('');
    tableHead.innerHTML = `<tr>${headerRow}</tr>`;
    
    // Generate table body
    const tableBody = document.getElementById('tableBody');
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="${columns.length}" style="text-align: center; padding: 40px; color: #888;">
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
        
        return `<tr>${cells}</tr>`;
    }).join('');
    
    tableBody.innerHTML = rows;
}

function hideAllViews() {
    document.getElementById('mainDashboard').style.display = 'none';
    document.getElementById('level2Dashboard').style.display = 'none';
    document.getElementById('tableView').style.display = 'none';
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

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            console.log('Searching for:', e.target.value);
            // Future search implementation
        }, 300));
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (event.state) {
        switch (event.state.view) {
            case 'main':
                showMainDashboard();
                break;
            case 'level2':
                showLevel2();
                break;
            default:
                showMainDashboard();
        }
    }
});

// Add history states for better navigation
function addHistoryState(view, title) {
    history.pushState({ view: view }, title, `#${view}`);
}

// Check initial URL hash
window.addEventListener('load', function() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'level2' && allData.length > 0) {
        showLevel2();
    }
});

// Debug function to check data
function debugData() {
    console.log('=== DEBUG DATA ===');
    console.log('Total rows:', allData.length);
    console.log('Sample row:', allData[0]);
    console.log('All headers:', allData[0] ? Object.keys(allData[0]) : 'No data');
    console.log('POC data:', pocData.length);
    console.log('Onboarded data:', onboardedData.length);
    console.log('Closed POC data:', closedPOCData.length);
}

// Make debugData available globally
window.debugData = debugData;
