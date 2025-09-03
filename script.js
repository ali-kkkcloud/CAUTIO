// Configuration
const sourceSheetId = '1chwoYEclmNZb_YxziacE83lD9vPcLa4GEs1CUIlb-sM';
const csvUrl = `https://docs.google.com/spreadsheets/d/${sourceSheetId}/export?format=csv&gid=0`;

// Global variables
let allData = [];
let pocData = [];
let onboardedData = [];
let closedPOCData = [];
let currentView = 'main';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// Load data from Google Sheets
async function loadData() {
    try {
        showLoading(true);
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        
        // Parse CSV
        allData = parseCSV(csvText);
        console.log('Raw data loaded:', allData);
        
        // Process data
        processData();
        
        // Show main dashboard
        showMainDashboard();
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data from Google Sheets');
        showLoading(false);
    }
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    // Get headers and clean them
    const headers = lines[0].split(',').map(header => 
        header.replace(/"/g, '').trim()
    );
    
    console.log('CSV Headers:', headers);
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVRow(lines[i]);
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index].replace(/"/g, '').trim();
            });
            data.push(row);
        }
    }
    
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
    
    allData.forEach(row => {
        const via = row['via'] || '';
        
        if (via.toLowerCase() === 'poc') {
            // Check if POC is closed
            const pocEndDate = parseDate(row['POC End Date']);
            
            if (pocEndDate && pocEndDate < today) {
                // POC has ended - move to closed
                closedPOCData.push(row);
            } else {
                // Active POC
                pocData.push(row);
            }
        } else {
            // All others go to onboarded
            // Set Client Type based on whether they came from POC
            const clientType = row['Client Type'] || '';
            if (clientType.toLowerCase() === 'poc') {
                row['Client Type'] = 'POC';
            } else {
                row['Client Type'] = 'Direct Onboarding';
            }
            onboardedData.push(row);
        }
    });
    
    console.log('Processed data:');
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
            // Assuming MM/DD/YYYY format for now
            const month = parseInt(match[1]) - 1; // JavaScript months are 0-indexed
            const day = parseInt(match[2]);
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
    if (!date) return dateString;
    
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Show/hide loading
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

// Show error message
function showError(message) {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `
        <div class="empty-state">
            <h3>Error Loading Data</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="clear-btn" style="margin-top: 16px;">
                Retry
            </button>
        </div>
    `;
}

// Navigation functions
function showMainDashboard() {
    currentView = 'main';
    hideAllViews();
    document.getElementById('mainDashboard').style.display = 'block';
    
    // Update header
    document.getElementById('pageTitle').textContent = 'COMMAND CENTER';
    document.getElementById('pageSubtitle').textContent = 'Welcome to a world where vehicles speak - and you listen in.';
    
    // Update total customers count
    const totalCustomers = allData.length;
    document.getElementById('totalCustomersCount').textContent = totalCustomers;
}

function showLevel2() {
    currentView = 'level2';
    hideAllViews();
    document.getElementById('level2Dashboard').style.display = 'block';
    
    // Update header
    document.getElementById('pageTitle').textContent = 'CUSTOMER OVERVIEW';
    document.getElementById('pageSubtitle').textContent = 'Detailed breakdown of your customer base.';
    
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
    
    // Update header
    document.getElementById('pageTitle').textContent = title.toUpperCase();
    document.getElementById('pageSubtitle').textContent = `Detailed view of ${title.toLowerCase()}.`;
    
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
                    No data available
                </td>
            </tr>
        `;
        return;
    }
    
    const rows = data.map(row => {
        const cells = columns.map(col => {
            let value = row[col] || '-';
            
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

// Search functionality (for future enhancement)
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            // Search functionality can be implemented here
            console.log('Searching for:', e.target.value);
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

// Enhanced navigation with history
function showMainDashboard() {
    currentView = 'main';
    hideAllViews();
    document.getElementById('mainDashboard').style.display = 'block';
    
    // Update header
    document.getElementById('pageTitle').textContent = 'COMMAND CENTER';
    document.getElementById('pageSubtitle').textContent = 'Welcome to a world where vehicles speak - and you listen in.';
    
    // Update total customers count
    const totalCustomers = allData.length;
    document.getElementById('totalCustomersCount').textContent = totalCustomers;
    
    addHistoryState('main', 'Dashboard');
}

function showLevel2() {
    currentView = 'level2';
    hideAllViews();
    document.getElementById('level2Dashboard').style.display = 'block';
    
    // Update header
    document.getElementById('pageTitle').textContent = 'CUSTOMER OVERVIEW';
    document.getElementById('pageSubtitle').textContent = 'Detailed breakdown of your customer base.';
    
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
    
    addHistoryState('level2', 'Customer Overview');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if there's a hash in URL
    const hash = window.location.hash.replace('#', '');
    if (hash === 'level2') {
        // Wait for data to load first
        const checkData = setInterval(() => {
            if (allData.length > 0) {
                clearInterval(checkData);
                showLevel2();
            }
        }, 100);
    }
});
