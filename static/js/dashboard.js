document.addEventListener("DOMContentLoaded", () => {
    // This code implements the full zero-knowledge flow, algorithm switching,
    // dynamic summary updates, AND saves the summary values.
    
    lucide.createIcons();

    // --- 1. DEFINE FIELDS AND GET ELEMENTS ---

    // Define financial fields
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
    const notificationArea = document.getElementById("notificationArea"); // For messages

    // Get summary elements
    const totalAssetsEl = document.getElementById("totalAssets");
    const netWorthEl = document.getElementById("netWorth");
    const totalDebtEl = document.getElementById("totalDebt");
    const investmentRatioEl = document.getElementById("investmentRatio");
    const monthlySavingsEl = document.getElementById("monthlySavings");

    // Initialize charts
    let assetAllocationChart, netWorthChart;
    initializeCharts(); // This function is defined below

    // This password is the ENCRYPTION KEY.
    let encryptionPassword = sessionStorage.getItem('tempUserPass');

    // --- 2. NOTIFICATION FUNCTION ---
    function showNotification(message, type = 'info') {
        if (!notificationArea) {
             // Fallback if the notification area is missing
             alert(message);
             console.log("Notification:", message);
             return;
        }

        const colors = { success: '#28a745', error: '#dc3545', info: '#007bff', warning: '#ffc107' };
        const icons = { success: 'check-circle', error: 'alert-circle', info: 'info', warning: 'alert-triangle' };

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '8px';
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.style.color = 'white';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '10px';
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        const iconElement = document.createElement('i');
        iconElement.setAttribute('data-lucide', icons[type] || icons.info);
        notification.appendChild(iconElement);
        lucide.createIcons({ nodes: [iconElement] });

        const textElement = document.createElement('span');
        textElement.textContent = message;
        notification.appendChild(textElement);

        // Append to the specific notification area in the HTML
        notificationArea.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 50);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 350);
        }, 3000);

        // Add console log
        if (type === 'error') console.error("Notification:", message);
        else if (type === 'warning') console.warn("Notification:", message);
        else console.log("Notification:", message);
    }


    // --- 3. AUTHENTICATION & DATA LOADING ---
    async function checkAuthentication() {
        try {
            const response = await fetch('/api/me');
            const result = await response.json();

            if (result.loggedIn && welcomeUser) {
                welcomeUser.innerHTML = `<i data-lucide="user" class="nav-icon"></i> Welcome, ${result.username}`;
                lucide.createIcons();
                // Now that we're logged in, load the encrypted data
                await loadEncryptedData();
            } else {
                window.location.href = '/'; // Not logged in
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/';
        }
    }

    async function loadEncryptedData() {
        // Check if we have the password (encryption key)
        if (!encryptionPassword) {
            encryptionPassword = prompt("Please enter your password to decrypt your data.\n\nNote: This is required to load your data and is never sent to the server.");
            if (!encryptionPassword) {
                showNotification("Cannot decrypt data without a password. Dashboard will be empty.", "error");
                // Update with empty data
                updateSummary();
                updateCharts();
                return;
            }
            // Save it for this session
            sessionStorage.setItem('tempUserPass', encryptionPassword);
        }

        try {
            // Call the "dumb" /api/load_data route
            const response = await fetch('/api/load_data');
             if (!response.ok) {
                 throw new Error(`Server responded with status ${response.status}`);
             }
            const result = await response.json();
            const encryptedBlob = result.data;

            if (encryptedBlob && encryptedBlob !== '{}') {
                let decryptedDataString;

                // --- DECRYPTION SWITCH ---
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
                    if (field && financialData[id] != null) {
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
            showNotification(`Decryption failed! Password may be incorrect or data corrupted. ${error.message}`, 'error');
            // Clear the bad password so user can try again on save
            sessionStorage.removeItem('tempUserPass');
            encryptionPassword = null;
        }
    }

    // --- 4. SAVE DATA (ENCRYPTION & SWITCHING LOGIC) ---
    if (saveDataBtn) {
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

            // --- 1. Get all data from forms ---
            const financialData = {};
            fieldIds.forEach(id => {
                const field = document.getElementById(`${id}-amount`);
                if (field) {
                    const value = parseFloat(field.value);
                    financialData[id] = isNaN(value) ? (field.value || 0) : value;
                } else {
                    console.warn(`Input field ${id}-amount not found during save.`);
                    financialData[id] = 0; // Default missing fields to 0
                }
            });

            // --- 2. Calculate Summary Values ---
            const calculatedSummary = calculateSummaryData(); // Reads directly from forms

            // --- 3. Add Summary Values to the data object to be saved ---
            financialData.summary_totalAssets = calculatedSummary.totalAssets;
            financialData.summary_totalDebt = calculatedSummary.totalDebt;
            financialData.summary_netWorth = calculatedSummary.netWorth;
            financialData.summary_totalInvestments = calculatedSummary.totalInvestments;
            financialData.summary_investmentRatio = calculatedSummary.investmentRatio;
            financialData.summary_monthlySavings = calculatedSummary.monthlySavings;
            financialData.lastSaved = new Date().toISOString();


            // --- 4. Encrypt the combined data (including summaries) ---
            const dataString = JSON.stringify(financialData);
            const dataSizeInBytes = new TextEncoder().encode(dataString).length;
            const THRESHOLD_KB = 512; // Example threshold: 512 KB
            let encryptedBlob;

            try {
                // --- ALGORITHM SWITCH LOGIC ---
                if (dataSizeInBytes < (THRESHOLD_KB * 1024)) {
                    console.log(`Data size (${dataSizeInBytes} bytes) < threshold. Using Matrix.`);
                    encryptedBlob = encryptWithMatrix(dataString, encryptionPassword);
                } else {
                    console.log(`Data size (${dataSizeInBytes} bytes) >= threshold. Using AES.`);
                    encryptedBlob = encryptWithAES(dataString, encryptionPassword);
                }
                // --------------------------------

                if (!encryptedBlob) { 
                    throw new Error("Encryption function returned null or failed.");
                }
            } catch (encError) {
                 showNotification(`Encryption failed! ${encError.message}`, "error");
                 console.error("Encryption Error during save:", encError);
                 return; // Stop the save process
            }

            // --- 5. Send encrypted blob to server ---
            try {
                showNotification("Saving encrypted data to AWS...", "info");
                const response = await fetch('/api/save_data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // Send session cookies
                    body: JSON.stringify({ data: encryptedBlob })
                });
                const result = await response.json();

                if (response.ok) {
                    showNotification('Data saved securely to AWS!', 'success');
                } else {
                    showNotification(`Error saving data: ${result.error || `Server responded with status ${response.status}`}`, 'error');
                }
            } catch (error) {
                console.error('Save API call error:', error);
                showNotification('Failed to connect to server to save data.', 'error');
            }
        });
    } else {
        console.error("Save button with ID 'saveDataBtn' not found!");
    }


    // --- 5. OTHER BUTTONS & EVENT LISTENERS ---
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear all data from the forms? This cannot be undone until you load saved data.")) {
                fieldIds.forEach(id => {
                    const field = document.getElementById(`${id}-amount`);
                    if (field) field.value = ''; // Clear input fields
                });
                updateSummary(); // Recalculate and display zeroed summaries
                updateCharts(); // Update charts to reflect cleared data
                showNotification('Forms cleared.', 'info');
            }
        });
    }
    // --- 8. EXPORT REPORT (Generate PDF from Decrypted Data) ---
const exportBtn = document.getElementById("exportDataBtn");
if (exportBtn) {
  exportBtn.addEventListener("click", async () => {
    showNotification("Preparing PDF report...", "info");

    try {
      // Reuse logic from loadEncryptedData()
      const response = await fetch("/api/load_data");
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const { data: encryptedBlob } = await response.json();

      if (!encryptedBlob || encryptedBlob === "{}") {
        showNotification("No saved data found to export.", "warning");
        return;
      }

      // Ensure we have the encryption key
      let password = sessionStorage.getItem("tempUserPass");
      if (!password) {
        password = prompt("Enter your password to decrypt your report:");
        if (!password) return showNotification("Export cancelled.", "warning");
      }

      // --- DECRYPTION SWITCH ---
      let decryptedDataString;
      if (encryptedBlob.startsWith(AES_PREFIX)) {
        decryptedDataString = decryptWithAES(encryptedBlob, password);
      } else if (encryptedBlob.startsWith(MATRIX_PREFIX)) {
        decryptedDataString = decryptWithMatrix(encryptedBlob, password);
      } else {
        throw new Error("Unknown encryption format.");
      }

      if (!decryptedDataString) throw new Error("Decryption failed. Wrong password?");

      const data = JSON.parse(decryptedDataString);

      // --- Generate PDF (client-side) ---
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Financial Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

      let y = 40;
      for (const [key, value] of Object.entries(data)) {
        doc.text(`${key}: ${value}`, 14, y);
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      }

      doc.save("financial_report.pdf");
      showNotification("Report exported successfully!", "success");

    } catch (err) {
      console.error("Export failed:", err);
      showNotification("Failed to export report. " + err.message, "error");
    }
  });
}


    if (logoutForm) {
         logoutForm.addEventListener('submit', (e) => {
             // Clear the sensitive encryption key from session storage before leaving
             sessionStorage.removeItem('tempUserPass');
             // Allow the form to submit to the /api/logout route
         });
    }

    // --- THIS MAKES THE DASHBOARD DYNAMIC ---
    // Add event listeners to input fields for dynamic updates
     fieldIds.forEach(f => {
        const input = document.getElementById(`${f}-amount`);
        if (input) {
            // Use 'input' event for real-time updates as user types
            input.addEventListener("input", () => {
                console.log(`Input changed: ${f}`); // DEBUG LOG
                // Call updateSummary which now handles both calculation and display
                updateSummary();
                // Update charts dynamically as well
                updateCharts();
            });
        } else {
            console.warn(`Input element with ID '${f}-amount' not found for input listener.`);
        }
    });

    // --- 6. DASHBOARD CALCULATIONS & DISPLAY ---

    // Helper to get numeric value from an input field ID (without '-amount')
    function getVal(id) {
        const el = document.getElementById(`${id}-amount`);
        return parseFloat(el?.value) || 0; // Return 0 if not found or invalid number
    }

    // Helper function to calculate all summary data (reads from current form state)
    function calculateSummaryData() {
        // Reads directly from form fields using getVal helper
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
            taxRate: getVal('tax-rate') // Assume percentage (e.g., 20)
        };

        const totalPhysicalAssets = assets.cash + assets.realEstate + assets.vehicles + assets.other;
        const totalInvestments = investments.stocks + investments.bonds + investments.retirement + investments.crypto;
        const totalAssets = totalPhysicalAssets + totalInvestments;
        const totalDebt = liabilities.mortgage + liabilities.carLoans + liabilities.creditCard + liabilities.studentLoans;
        const netWorth = totalAssets - totalDebt;
        const investmentRatio = totalAssets > 0 ? (totalInvestments / totalAssets) * 100 : 0;
        const netIncome = cashFlow.income * (1 - (cashFlow.taxRate / 100));
        const monthlySavings = netIncome - cashFlow.expenses; // Assuming monthly values

        // Return an object containing all calculated values
        return {
            totalAssets,
            totalDebt,
            netWorth,
            totalInvestments, // Include this as it's used in ratio
            investmentRatio,
            monthlySavings
        };
    }


    // Function to update the summary display elements in the HTML
    function updateSummary() {
        console.log("Updating summary..."); // DEBUG LOG
        // First, calculate the latest values based on current form inputs
        const summary = calculateSummaryData();

        // Format and display the values, checking if elements exist
        const formatCurrency = (value) => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        if (totalAssetsEl) totalAssetsEl.textContent = formatCurrency(summary.totalAssets);
        if (netWorthEl) netWorthEl.textContent = formatCurrency(summary.netWorth);
        if (totalDebtEl) totalDebtEl.textContent = formatCurrency(summary.totalDebt);
        if (investmentRatioEl) investmentRatioEl.textContent = `${summary.investmentRatio.toFixed(1)}%`;
        if (monthlySavingsEl) monthlySavingsEl.textContent = formatCurrency(summary.monthlySavings);
    }


    // Function to initialize the charts
    function initializeCharts() {
         const assetCtx = document.getElementById('assetAllocationChart');
        const netWorthCtx = document.getElementById('netWorthChart');

        if (!assetCtx || !netWorthCtx) {
             console.warn("One or both chart canvas elements not found. Skipping chart initialization.");
             return;
        }

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9CA3AF', font: { family: 'Inter', size: 12 } }
                },
                 tooltip: {
                     bodyFont: { family: 'Inter' }, titleFont: { family: 'Inter' }
                 }
            }
        };

        try {
            assetAllocationChart = new Chart(assetCtx, {
                type: 'doughnut',
                data: {
                    // Expanded labels to match calculations
                     labels: ['Stocks', 'Bonds', 'Retirement', 'Crypto', 'Real Estate', 'Cash', 'Vehicles', 'Other Assets'],
                    datasets: [{
                        label: 'Asset Allocation',
                        data: [0, 0, 0, 0, 0, 0, 0, 0], // Initial zero data
                        backgroundColor: [
                             '#3B82F6', '#10B981', '#6366F1', '#F59E0B',
                             '#EF4444', '#8B5CF6', '#EC4899', '#A855F7'
                        ],
                        borderColor: '#111827', // Use dark background color
                        borderWidth: 3
                    }]
                },
                 options: { ...commonOptions, cutout: '70%' }
            });

            netWorthChart = new Chart(netWorthCtx, {
                type: 'line',
                data: {
                    labels: [], // Start empty, will populate dynamically
                    datasets: [{
                        label: 'Net Worth History', // Changed label
                        data: [], // Start empty
                        fill: true,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderColor: '#3B82F6',
                        tension: 0.4,
                        pointBackgroundColor: '#3B82F6',
                        pointBorderColor: '#fff',
                        pointHoverRadius: 7,
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#3B82F6',
                        pointRadius: 4
                    }]
                },
                options: {
                    ...commonOptions,
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                 color: '#9CA3AF',
                                 callback: function(value) { return '$' + value.toLocaleString(); }
                             },
                            grid: { color: 'rgba(55, 65, 81, 0.5)' }
                        },
                        x: {
                            ticks: { color: '#9CA3AF' },
                            grid: { display: false }
                        }
                    }
                }
            });
        } catch (chartError) {
             console.error("Error initializing charts:", chartError);
        }
    }


    // Function to update the charts based on current form values
    function updateCharts() {
        console.log("Updating charts..."); // DEBUG LOG
        if (!assetAllocationChart || !netWorthChart) {
            return;
        }

        // --- Update Asset Allocation Chart ---
        const allocationData = [ // Ensure order matches labels in initializeCharts
            getVal('stocks'),
            getVal('bonds'),
            getVal('retirement'),
            getVal('crypto'),
            getVal('real-estate'),
            getVal('cash'),
            getVal('vehicles'),
            getVal('other-assets')
        ];
        assetAllocationChart.data.datasets[0].data = allocationData;
        assetAllocationChart.update();

        // --- Update Net Worth Chart (Simple History Example) ---
        const currentNetWorth = calculateSummaryData().netWorth;
        const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' });

        const maxHistoryPoints = 20; 
        if (netWorthChart.data.labels.length >= maxHistoryPoints) {
            netWorthChart.data.labels.shift();
            netWorthChart.data.datasets[0].data.shift();
        }

        netWorthChart.data.labels.push(nowLabel);
        netWorthChart.data.datasets[0].data.push(currentNetWorth);
        netWorthChart.update();
    }


    // --- 7. RUN ON PAGE LOAD ---
    checkAuthentication(); // This also triggers loadEncryptedData if logged in
    // Initial calculation/display based on fields (which might be populated by load)
    updateSummary();
    updateCharts();

});

