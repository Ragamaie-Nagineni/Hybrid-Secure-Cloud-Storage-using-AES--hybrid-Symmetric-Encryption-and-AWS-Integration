// document.getElementById("signupForm").addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const username = document.getElementById("email").value.trim();
//   const password = document.getElementById("password").value.trim();
//   const confirm = document.getElementById("confirm").value.trim();

//   if (!username || !password) {
//     alert("⚠️ Please fill in all fields.");
//     return;
//   }
//   if (password.length < 6) {
//     alert("⚠️ Password must be at least 6 characters long.");
//     return;
//   }
//   if (password !== confirm) {
//     alert("⚠️ Passwords do not match.");
//     return;
//   }

//   try {
//     const res = await fetch("/api/signup", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password })
//     });
//     const data = await res.json();

//     if (res.ok) {
//       alert("✅ Signup successful!");
//       window.location.href = "/";
//     } else {
//       alert("❌ " + (data.error || "Signup failed."));
//     }
//   } catch (err) {
//     alert("Server error: " + err.message);
//   }
// });

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const errorMessage = document.getElementById("errorMessage");

    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            errorMessage.textContent = "";

            // Your HTML uses "email" as the ID for username
            const username = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirm = document.getElementById("confirm").value.trim();

            if (!username || !password || !confirm) {
                errorMessage.textContent = "Please fill in all fields.";
                return;
            }
            if (password.length < 6) {
                errorMessage.textContent = "Password must be at least 6 characters long.";
                return;
            }
            if (password !== confirm) {
                errorMessage.textContent = "Passwords do not match.";
                return;
            }

            try {
                const res = await fetch("/api/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();

                if (res.ok) {
                    // Use a more user-friendly notification
                    alert("✅ Signup successful! Please log in.");
                    window.location.href = "/";
                } else {
                    errorMessage.textContent = data.error || "Signup failed.";
                }
            } catch (err) {
                errorMessage.textContent = "Server error: " + err.message;
            }
        });
    }
});