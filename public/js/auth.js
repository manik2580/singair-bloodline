document.addEventListener("DOMContentLoaded", () => {
  const f = document.getElementById("admin-login-form");
  const msg = document.getElementById("login-error-message");
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = "";
    const body = Object.fromEntries(new FormData(f).entries());
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      msg.innerHTML = `<div class="alert alert-danger text-center">${
        data.message || "Login failed"
      }</div>`;

      // Remove message after 10 seconds
      setTimeout(() => {
        msg.innerHTML = "";
      }, 3000); // 10000 ms = 10 seconds

      return;
    }
    // go to admin dashboard
    window.location = "/admin/dashboard";
  });
});
