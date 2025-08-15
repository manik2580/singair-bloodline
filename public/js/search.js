document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("donor-search-form");
  const results = document.getElementById("search-results");
  const resetBtn = document.getElementById("reset-search-filters");
  const bloodGroups = document.querySelectorAll("input[name='bloodGroup']");

  async function fetchDonors(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/donors?${query}`);
    const data = await res.json();

    if (!data.donors.length) {
      results.innerHTML =
        '<div class="alert alert-info text-center">কোন ডোনার পাওয়া যায়নি।</div>';
      return;
    }

    results.innerHTML = data.donors
      .map(
        (donor) => `
        <a href="#" class="donor-card">
          <h4>
            ${donor.name} 
            <span class="blood-group-badge">${donor.bloodGroup || "N/A"}</span>
          </h4>
          <p>ঠিকানা: ${donor.address || "-"}</p>
          <p>পূর্বে রক্ত দিয়েছেন: ${
            donor.is_donated_before ? "হ্যাঁ" : "না"
          }</p>
          <p>মোবাইল: <span class="phone-link">${donor.phone || "-"}</span></p>
        </a>
      `
      )
      .join("");
  }

  // On form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const bloodGroup = document.getElementById('blood-group').value;
    const errorDiv = document.getElementById('bloodGroupError');
    if (!bloodGroup) {
      errorDiv.style.display = 'block'; // Show error
      return; // Prevent form submission
    } else {
      errorDiv.style.display = 'none'; // Hide error if valid
    }
    const formData = new FormData(form);
    const filters = Object.fromEntries(formData);
    fetchDonors(filters);
  });

  // Reset filters
  resetBtn.addEventListener("click", () => {
    form.reset();
    // fetchDonors();
    results.innerHTML = "";
  });

  // Load donors initially
//   fetchDonors();
});
