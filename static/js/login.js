//  document.getElementById("loginForm").addEventListener("submit", async (e) => {
//         e.preventDefault();

//         const username = document.getElementById("username").value.trim();
//         const password = document.getElementById("password").value.trim();

//         // Validation
//         if (!username || !password) {
//             alert("⚠️ Please enter both username and password.");
//             return;
//         }

//         try {
//             const res = await fetch("/api/login", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ username, password })
//             });

//             const data = await res.json();
//             if (res.ok) {
//                 alert("✅ Login successful!");
//                 window.location.href = "/dashboard";
//             } else {
//                 alert("❌ " + (data.error || "Invalid credentials."));
//             }
//         } catch (err) {
//             alert("Server error: " + err.message);
//         }
//     });


document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            errorMessage.textContent = ""; // Clear old errors

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!username || !password) {
                errorMessage.textContent = "Please enter both username and password.";
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
                    // --- THIS IS THE KEY ---
                    // Login successful! Store the password (our encryption key)
                    // in session storage. It will be cleared when the tab closes.
                    sessionStorage.setItem('tempUserPass', password);
                    
                    // Redirect to the dashboard
                    window.location.href = "/dashboard";
                } else {
                    errorMessage.textContent = data.error || "Invalid credentials.";
                }
            } catch (err) {
                errorMessage.textContent = "Server error. Please try again.";
                console.error("Login Error:", err);
            }
        });
    }
});
