// document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById("donor-registration-form");
const msgDiv = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msgDiv.innerHTML = "";
  msgDiv.style.display = "none";

  const formData = Object.fromEntries(new FormData(form).entries());
  try {
    const res = await fetch("/api/donors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      // Show error
      msgDiv.innerHTML = `<div class="error-message">${
        data.message || "Something went wrong"
      }</div>`;
      msgDiv.style.display = "block";
      // ইনপুটগুলোতে আবার value বসানো (যদি backend থেকে পুরনো value ফেরত আসে)
      Object.keys(formData).forEach((key) => {
        const field = form.elements[key];
        if (field) {
          if (field.type === "checkbox") {
            field.checked = formData[key] === "1","2";
          } else {
            field.value = formData[key];
          }
        }
      });
      return;
    }

    // Show success
    msgDiv.innerHTML = `<div class="success-message">${
      data.message || "Donor registered successfully"
    }</div>`;
    msgDiv.style.display = "block";

    // Clear form fields
    form.reset();
  } catch (err) {
    msgDiv.innerHTML = `<div class="error-message">Server error, try again later.</div>`;
    msgDiv.style.display = "block";
    console.error(err);
  }

  // Hide message after 5 seconds
  //   setTimeout(() => {
  //     msgDiv.style.display = "none";
  //   }, 5000);
});
// });
