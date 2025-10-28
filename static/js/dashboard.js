document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  lucide.createIcons();

  // Set username
  const username = localStorage.getItem("username") || "User";
  document.getElementById("welcomeUser").textContent = `Welcome, ${username}`;

  // Define financial fields
  const fields = [
    "cash", "real-estate", "vehicles", "other-assets",
    "mortgage", "car-loans", "credit-card", "student-loans",
    "stocks", "bonds", "retirement", "crypto",
    "income", "expenses", "tax-rate"
  ];

  // Get summary elements
  const totalAssetsEl = document.getElementById("totalAssets");
  const netWorthEl = document.getElementById("netWorth");
  const totalDebtEl = document.getElementById("totalDebt");
  const investmentRatioEl = document.getElementById("investmentRatio");
  const monthlySavingsEl = document.getElementById("monthlySavings");

  // Initialize charts
  let assetAllocationChart, netWorthChart;
  initializeCharts();

  // Load saved data
  const savedData = JSON.parse(localStorage.getItem("financialData") || "{}");
  fields.forEach(f => {
    const input = document.getElementById(`${f}-amount`);
    if (savedData[f]) input.value = savedData[f];
  });
  updateSummary();
  updateCharts();

  // Add event listeners to all input fields
  fields.forEach(f => {
    document.getElementById(`${f}-amount`).addEventListener("input", updateSummary);
  });

  // Update summary function
  function updateSummary() {
    // Get asset values
    const cash = parseFloat(document.getElementById("cash-amount").value) || 0;
    const realEstate = parseFloat(document.getElementById("real-estate-amount").value) || 0;
    const vehicles = parseFloat(document.getElementById("vehicles-amount").value) || 0;
    const otherAssets = parseFloat(document.getElementById("other-assets-amount").value) || 0;
    
    // Get liability values
    const mortgage = parseFloat(document.getElementById("mortgage-amount").value) || 0;
    const carLoans = parseFloat(document.getElementById("car-loans-amount").value) || 0;
    const creditCard = parseFloat(document.getElementById("credit-card-amount").value) || 0;
    const studentLoans = parseFloat(document.getElementById("student-loans-amount").value) || 0;
    
    // Get investment values
    const stocks = parseFloat(document.getElementById("stocks-amount").value) || 0;
    const bonds = parseFloat(document.getElementById("bonds-amount").value) || 0;
    const retirement = parseFloat(document.getElementById("retirement-amount").value) || 0;
    const crypto = parseFloat(document.getElementById("crypto-amount").value) || 0;
    
    // Get income/expense values
    const income = parseFloat(document.getElementById("income-amount").value) || 0;
    const expenses = parseFloat(document.getElementById("expenses-amount").value) || 0;
    const taxRate = parseFloat(document.getElementById("tax-rate").value) || 0;

    // Calculate totals
    const totalAssets = cash + realEstate + vehicles + otherAssets + stocks + bonds + retirement + crypto;
    const totalLiabilities = mortgage + carLoans + creditCard + studentLoans;
    const netWorth = totalAssets - totalLiabilities;
    
    // Calculate investment ratio
    const totalInvestments = stocks + bonds + retirement + crypto;
    const investmentRatio = totalAssets > 0 ? (totalInvestments / totalAssets * 100).toFixed(1) : 0;
    
    // Calculate monthly savings
    const monthlyIncomeAfterTax = income * (1 - taxRate / 100);
    const monthlySavings = monthlyIncomeAfterTax - expenses;

    // Update UI
    totalAssetsEl.textContent = `$${formatCurrency(totalAssets)}`;
    netWorthEl.textContent = `$${formatCurrency(netWorth)}`;
    totalDebtEl.textContent = `$${formatCurrency(totalLiabilities)}`;
    investmentRatioEl.textContent = `${investmentRatio}%`;
    monthlySavingsEl.textContent = `$${formatCurrency(monthlySavings)}`;

    // Update change indicators (simulated)
    updateChangeIndicators();
    
    // Update charts
    updateCharts();
  }

  // Format currency values
  function formatCurrency(value) {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toLocaleString();
  }

  // Update change indicators (simulated data)
  function updateChangeIndicators() {
    const changes = document.querySelectorAll('.card-change');
    changes.forEach(change => {
      const isPositive = Math.random() > 0.5;
      const value = (Math.random() * 5).toFixed(1);
      
      change.textContent = `${isPositive ? '+' : '-'}${value}%`;
      change.className = `card-change ${isPositive ? 'positive' : 'negative'}`;
    });
  }

  // Initialize charts
  function initializeCharts() {
    const assetCtx = document.getElementById('assetAllocationChart').getContext('2d');
    assetAllocationChart = new Chart(assetCtx, {
      type: 'doughnut',
      data: {
        labels: ['Cash', 'Real Estate', 'Stocks', 'Bonds', 'Retirement', 'Crypto', 'Other'],
        datasets: [{
          data: [25, 30, 20, 10, 10, 3, 2],
          backgroundColor: [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
            }
          }
        }
      }
    });

    const netWorthCtx = document.getElementById('netWorthChart').getContext('2d');
    netWorthChart = new Chart(netWorthCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'Net Worth',
          data: [120000, 125000, 130000, 128000, 135000, 140000, 145000],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  // Update charts with current data
  function updateCharts() {
    // In a real app, this would update with actual data
    // For demo purposes, we'll just regenerate with random data
    const cash = parseFloat(document.getElementById("cash-amount").value) || 0;
    const realEstate = parseFloat(document.getElementById("real-estate-amount").value) || 0;
    const stocks = parseFloat(document.getElementById("stocks-amount").value) || 0;
    const bonds = parseFloat(document.getElementById("bonds-amount").value) || 0;
    const retirement = parseFloat(document.getElementById("retirement-amount").value) || 0;
    const crypto = parseFloat(document.getElementById("crypto-amount").value) || 0;
    const otherAssets = parseFloat(document.getElementById("other-assets-amount").value) || 0;

    // Update asset allocation chart
    assetAllocationChart.data.datasets[0].data = [
      cash, realEstate, stocks, bonds, retirement, crypto, otherAssets
    ];
    assetAllocationChart.update();

    // Update net worth chart with simulated trend
    const netWorth = parseFloat(netWorthEl.textContent.replace(/[$,]/g, '')) || 0;
    const baseValue = netWorth > 0 ? netWorth : 100000;
    const trendData = Array.from({length: 7}, (_, i) => {
      const monthValue = baseValue * (1 + (i * 0.05));
      return Math.round(monthValue);
    });
    
    netWorthChart.data.datasets[0].data = trendData;
    netWorthChart.update();
  }

  // Save data securely
  document.getElementById("saveDataBtn").addEventListener("click", async () => {
    const data = {};
    let hasErrors = false;
    
    for (const f of fields) {
      const val = document.getElementById(`${f}-amount`).value.trim();
      if (val === "" || isNaN(val)) {
        hasErrors = true;
        document.getElementById(`${f}-amount`).style.borderColor = "var(--danger)";
      } else {
        document.getElementById(`${f}-amount`).style.borderColor = "";
        data[f] = val;
      }
    }

    if (hasErrors) {
      showNotification("Please fill in all fields with valid numbers.", "error");
      return;
    }

    try {
      // In a real app, this would send to your backend
      const res = await fetch("/api/save-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showNotification("Data saved securely!", "success");
        localStorage.setItem("financialData", JSON.stringify(data));
      } else {
        const err = await res.json();
        showNotification("Failed to save: " + (err.error || "Unknown error"), "error");
      }
    } catch {
      // Fallback to local storage if offline
      localStorage.setItem("financialData", JSON.stringify(data));
      showNotification("Saved locally (offline mode).", "warning");
    }
  });

  // Clear data
  document.getElementById("clearDataBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      fields.forEach(f => {
        document.getElementById(`${f}-amount`).value = "";
        document.getElementById(`${f}-amount`).style.borderColor = "";
      });
      localStorage.removeItem("financialData");
      updateSummary();
      showNotification("All data cleared.", "info");
    }
  });

  // Export data
  document.getElementById("exportDataBtn").addEventListener("click", () => {
    const data = {};
    fields.forEach(f => {
      data[f] = document.getElementById(`${f}-amount`).value || 0;
    });
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "financial_report.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    showNotification("Financial report exported successfully!", "success");
  });

  // Notification function
  function showNotification(message, type = "info") {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i data-lucide="${getNotificationIcon(type)}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">
        <i data-lucide="x"></i>
      </button>
    `;

    // Add styles for notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border-left: 4px solid ${getNotificationColor(type)};
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 300px;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;

    const notificationContent = notification.querySelector('.notification-content');
    notificationContent.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    `;

    const closeButton = notification.querySelector('.notification-close');
    closeButton.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-light);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    closeButton.addEventListener('click', () => {
      notification.remove();
    });

    document.body.appendChild(notification);
    lucide.createIcons();

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  function getNotificationIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'alert-circle',
      warning: 'alert-triangle',
      info: 'info'
    };
    return icons[type] || 'info';
  }

  function getNotificationColor(type) {
    const colors = {
      success: 'var(--success)',
      error: 'var(--danger)',
      warning: 'var(--warning)',
      info: 'var(--primary-blue)'
    };
    return colors[type] || 'var(--primary-blue)';
  }

  // Add CSS for notification animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  // Add chart action button functionality
  document.querySelectorAll('.chart-action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons in the same group
      this.parentElement.querySelectorAll('.chart-action-btn').forEach(b => {
        b.classList.remove('active');
      });
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // In a real app, this would update the chart data based on the selected timeframe
      showNotification(`Chart updated for ${this.textContent} timeframe`, 'info');
    });
  });
});