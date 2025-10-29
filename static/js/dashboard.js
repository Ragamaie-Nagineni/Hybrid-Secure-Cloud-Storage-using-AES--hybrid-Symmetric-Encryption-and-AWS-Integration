console.log("dashboard.js loaded");
document.addEventListener("DOMContentLoaded", () => {
    // This code replaces your original dashboard.js
    // It implements the full zero-knowledge flow, algorithm switching,
    // and includes all your original chart/summary logic.
    
    lucide.createIcons();

    // --- 1. DEFINE FIELDS AND GET ELEMENTS ---

    // Define financial fields (from your original file)
    const fieldIds = [
      "cash", "real-estate", "vehicles", "other-assets",
      "mortgage", "car-loans", "credit-card", "student-loans",
      "stocks", "bonds", "retirement", "crypto",
      "income", "expenses", "tax-rate"
    ];

    // Get page elements
    const saveDataBtn = document.getElementById("saveDataBtn");
    const clearDataBtn = document.getElementById("clearDataBtn");
    const logoutForm = document.getElementById("logoutForm");
    const welcomeUser = document.getElementById("welcomeUser");
    const notificationArea = document.getElementById("notificationArea");

    // Get summary elements (from your original file)
    const totalAssetsEl = document.getElementById("totalAssets");
    const netWorthEl = document.getElementById("netWorth");
    const totalDebtEl = document.getElementById("totalDebt");
    const investmentRatioEl = document.getElementById("investmentRatio");
    const monthlySavingsEl = document.getElementById("monthlySavings");

    // Initialize charts (from your original file)
    let assetAllocationChart, netWorthChart;
    initializeCharts(); // This function is defined below

    // This password is the ENCRYPTION KEY.
    let encryptionPassword = sessionStorage.getItem('tempUserPass');

    // --- 2. NOTIFICATION FUNCTION ---
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to notification area
        if (notificationArea) {
            notificationArea.appendChild(notification);
        } else {
            // Fallback to alert if notification area doesn't exist
            alert(message);
            return;
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // --- 3. AUTHENTICATION & DATA LOADING ---
    async function checkAuthentication() {
        try {
            // In a real app, this would call your backend
            // For demo purposes, we'll simulate authentication
            const username = sessionStorage.getItem('username') || 'Demo User';
            welcomeUser.innerHTML = `<i data-lucide="user" class="nav-icon"></i> Welcome, ${username}`;
            lucide.createIcons();
            
            // Now that we're logged in, load the encrypted data
            await loadEncryptedData();
        } catch (error) {
            console.error('Auth check failed:', error);
            // In a real app, redirect to login
            showNotification('Authentication failed. Please log in again.', 'error');
        }
    }

    async function loadEncryptedData() {
        // Check if we have the password (encryption key)
        if (!encryptionPassword) {
            encryptionPassword = prompt("Please enter your password to decrypt your data.\n\nNote: This is required to load your data and is never sent to the server.");
            if (!encryptionPassword) {
                showNotification("Cannot decrypt data without a password.", "error");
                return;
            }
            // Save it for this session
            sessionStorage.setItem('tempUserPass', encryptionPassword);
        }

        try {
            // In a real app, this would fetch from your API
            // For demo, we'll use localStorage
            const encryptedBlob = localStorage.getItem('encryptedFinancialData');

            if (encryptedBlob) {
                let decryptedDataString;

                // --- DECRYPTION SWITCH ---
                // We check the prefix to see which algorithm to use
                if (encryptedBlob.startsWith(AES_PREFIX)) {
                    decryptedDataString = decryptWithAES(encryptedBlob, encryptionPassword);
                } else if (encryptedBlob.startsWith(MATRIX_PREFIX)) {
                    decryptedDataString = decryptWithMatrix(encryptedBlob, encryptionPassword);
                } else {
                    throw new Error("Unknown encryption format. Data may be from an old version or corrupt.");
                }

                if (!decryptedDataString) {
                    throw new Error("Decryption failed. Wrong password?");
                }

                const financialData = JSON.parse(decryptedDataString);
                
                // Populate the forms
                fieldIds.forEach(id => {
                    const field = document.getElementById(`${id}-amount`);
                    if (field && financialData[id]) {
                        field.value = financialData[id];
                    }
                });
                showNotification('Data decrypted and loaded successfully.', 'success');
                // Update dashboard with loaded data
                updateSummary();
                updateCharts();

            } else {
                showNotification('No saved data found for this user.', 'info');
                // Ensure dashboard is calculated even if no data
                updateSummary();
                updateCharts();
            }
        } catch (error) {
            console.error('Failed to load or decrypt data:', error);
            showNotification(`Decryption failed! Password may be incorrect. ${error.message}`, 'error');
            sessionStorage.removeItem('tempUserPass'); // Clear bad password
        }
    }

    // --- 4. SAVE DATA (ENCRYPTION & SWITCHING LOGIC) ---
    saveDataBtn.addEventListener('click', async () => {
       console.log("Save Securely button clicked!"); 
        if (!encryptionPassword) {
            encryptionPassword = prompt("Please enter your password to encrypt your data.");
            if (!encryptionPassword) {
                showNotification("Cannot encrypt data without a password. Save cancelled.", "error");
                return;
            }
            sessionStorage.setItem('tempUserPass', encryptionPassword);
        }

        // 1. Get all data from forms
        const financialData = {};
        fieldIds.forEach(id => {
            const field = document.getElementById(`${id}-amount`);
            if (field) {
                // Use || 0 to ensure we save a number even if blank
                financialData[id] = field.value || 0; 
            }
        });

        const dataString = JSON.stringify(financialData);

        // --- THIS IS THE SWITCH LOGIC YOU ASKED FOR ---
        const dataSizeInBytes = new TextEncoder().encode(dataString).length;
        // Set a threshold (e.g., 512 KB). You can change this.
        const THRESHOLD_KB = 512; 
        
        let encryptedBlob;

        if (dataSizeInBytes < (THRESHOLD_KB * 1024)) {
            // Use Matrix for small data
            encryptedBlob = encryptWithMatrix(dataString, encryptionPassword);
        } else {
            // Use AES for large data
            encryptedBlob = encryptWithAES(dataString, encryptionPassword);
        }

        if (!encryptedBlob) {
            showNotification("Encryption failed! Could not save data.", "error");
            return;
        }
        // -------------------------------------------------

        try {
            // In a real app, this would send to your API
            // For demo, we'll use localStorage
            showNotification("Saving encrypted data...", "info");
            localStorage.setItem('encryptedFinancialData', encryptedBlob);
            
            setTimeout(() => {
                showNotification('Data saved securely!', 'success');
            }, 1000);
        } catch (error) {
            console.error('Save error:', error);
            showNotification('Failed to save data.', 'error');
        }
    });

    // --- 5. OTHER BUTTONS & EVENT LISTENERS ---
    clearDataBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all data from the forms?")) {
            fieldIds.forEach(id => {
                const field = document.getElementById(`${id}-amount`);
                if (field) field.value = '';
            });
            updateSummary();
            updateCharts();
            showNotification('Forms cleared.', 'info');
        }
    });
    
    logoutForm.addEventListener('submit', () => {
        // Clear the encryption key from storage before logging out
        sessionStorage.removeItem('tempUserPass');
    });

    // Add event listeners to all input fields (from your original file)
    fieldIds.forEach(f => {
        const input = document.getElementById(`${f}-amount`);
        if (input) {
            input.addEventListener("input", () => {
                updateSummary();
                updateCharts();
            });
        }
    });

    // --- 6. DASHBOARD CALCULATIONS (From your original dashboard.js) ---
    function getVal(id) {
        // Use the '-amount' suffix from your original file's logic
        const el = document.getElementById(`${id}-amount`);
        return parseFloat(el ? el.value : 0) || 0;
    }

    function updateSummary() {
        // This logic is copied directly from your original dashboard.js
        const assets = {
            cash: getVal('cash'),
            realEstate: getVal('real-estate'),
            vehicles: getVal('vehicles'),
            other: getVal('other-assets')
        };
        const liabilities = {
            mortgage: getVal('mortgage'),
            carLoans: getVal('car-loans'),
            creditCard: getVal('credit-card'),
            studentLoans: getVal('student-loans')
        };
        const investments = {
            stocks: getVal('stocks'),
            bonds: getVal('bonds'),
            retirement: getVal('retirement'),
            crypto: getVal('crypto')
        };
        const cashFlow = {
            income: getVal('income'),
            expenses: getVal('expenses'),
            taxRate: getVal('tax-rate')
        };

        const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0) + 
                            Object.values(investments).reduce((a, b) => a + b, 0);
        const totalDebt = Object.values(liabilities).reduce((a, b) => a + b, 0);
        const netWorth = totalAssets - totalDebt;
        const totalInvestments = Object.values(investments).reduce((a, b) => a + b, 0);
        const investmentRatio = totalAssets > 0 ? (totalInvestments / totalAssets) * 100 : 0;
        const netIncome = cashFlow.income * (1 - (cashFlow.taxRate / 100));
        const monthlySavings = netIncome - cashFlow.expenses;

        // Format and display values
        totalAssetsEl.textContent = `$${totalAssets.toLocaleString()}`;
        netWorthEl.textContent = `$${netWorth.toLocaleString()}`;
        totalDebtEl.textContent = `$${totalDebt.toLocaleString()}`;
        investmentRatioEl.textContent = `${investmentRatio.toFixed(1)}%`;
        monthlySavingsEl.textContent = `$${monthlySavings.toLocaleString()}`;
    }

    function initializeCharts() {
        const assetCtx = document.getElementById('assetAllocationChart');
        const netWorthCtx = document.getElementById('netWorthChart');

        if (!assetCtx || !netWorthCtx) return;

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#1d2939',
                        font: { family: 'Inter', size: 12 }
                    }
                }
            }
        };

        assetAllocationChart = new Chart(assetCtx, {
            type: 'doughnut',
            data: {
                labels: ['Stocks', 'Bonds', 'Real Estate', 'Cash', 'Crypto'],
                datasets: [{
                    label: 'Asset Allocation',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EF4444'],
                    borderColor: '#1F2937',
                    borderWidth: 2
                }]
            },
            options: commonOptions
        });

        netWorthChart = new Chart(netWorthCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Net Worth',
                    data: [150, 200, 250, 230, 280, 320, 350], // Dummy data
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: '#3B82F6',
                    tension: 0.3,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#3B82F6'
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    y: {
                        ticks: { color: '#9CA3AF' },
                        grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#9CA3AF' },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    function updateCharts() {
        if (!assetAllocationChart || !netWorthChart) return;

        const data = {
            stocks: getVal('stocks'),
            bonds: getVal('bonds'),
            realEstate: getVal('real-estate'),
            cash: getVal('cash'),
            crypto: getVal('crypto')
        };

        // Update asset allocation chart
        assetAllocationChart.data.datasets[0].data = [
            data.stocks,
            data.bonds,
            data.realEstate,
            data.cash,
            data.crypto
        ];
        assetAllocationChart.update();

        // (Net worth chart logic would be more complex, involving time-series data)
        // For now, we'll just leave its dummy data.
    }

    // --- 7. RUN ON PAGE LOAD ---
    checkAuthentication();
});