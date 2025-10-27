 document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        // Validation
        if (!username || !password) {
            alert("⚠️ Please enter both username and password.");
            return;
        }

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                alert("✅ Login successful!");
                window.location.href = "/dashboard";
            } else {
                alert("❌ " + (data.error || "Invalid credentials."));
            }
        } catch (err) {
            alert("Server error: " + err.message);
        }
    });