 lucide.createIcons();

    const username = localStorage.getItem("username") || "User";
    document.getElementById("welcomeUser").textContent = `Welcome, ${username}`;

    document.getElementById("saveDataBtn").addEventListener("click", async () => {
      const data = {
        assets: document.getElementById("assets-amount").value.trim(),
        liabilities: document.getElementById("liabilities-amount").value.trim(),
        loans: document.getElementById("loans-amount").value.trim(),
        investments: document.getElementById("investments-amount").value.trim(),
        expenses: document.getElementById("expenses-amount").value.trim(),
      };

      if (Object.values(data).some(v => v === "" || isNaN(v))) {
        alert("⚠️ Please fill in all fields with valid numbers.");
        return;
      }

      try {
        const res = await fetch("/api/save-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          alert("✅ Financial data saved securely!");
        } else {
          const err = await res.json();
          alert("❌ Failed to save: " + (err.error || "Unknown error"));
        }
      } catch {
        alert("🗂 Saved locally (backend not connected).");
        localStorage.setItem("financialData", JSON.stringify(data));
      }
    });