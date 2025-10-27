document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirm").value.trim();

  if (!username || !password) {
    alert("⚠️ Please fill in all fields.");
    return;
  }
  if (password.length < 6) {
    alert("⚠️ Password must be at least 6 characters long.");
    return;
  }
  if (password !== confirm) {
    alert("⚠️ Passwords do not match.");
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
      alert("✅ Signup successful!");
      window.location.href = "/";
    } else {
      alert("❌ " + (data.error || "Signup failed."));
    }
  } catch (err) {
    alert("Server error: " + err.message);
  }
});