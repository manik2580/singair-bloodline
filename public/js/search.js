// document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById("donor-search-form");
const results = document.getElementById("search-results");
const resetBtn = document.getElementById("reset-search-filters");
const pagination = document.getElementById("pagination");
// const bloodGroups = document.querySelectorAll("input[name='bloodGroup']");

let currentPage = 1;
const limit = 20;
let bloodGroup = "";

async function fetchDonors(params = {}) {
  params.page = params.page || currentPage;
  params.limit = limit;

  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/donors?${query}`);
  const data = await res.json();

  if (!data.donors.length) {
    results.innerHTML =
      '<div class="alert alert-info text-center">কোন ডোনার পাওয়া যায়নি।</div>';

    pagination.innerHTML = "";
    return;
  }

  bloodGroup = params.bloodGroup || "";
  results.innerHTML = data.donors
    .map(
      (donor) => `
        <a href="#" class="donor-card">
          <h4>
            ${donor.name} 
             ${donor.is_verified 
            ?'<span class="verified-badge"> Verified</span>' 
            : ''
          }
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

  // pagination buttons
  const totalRecords = data.total;
  if (totalRecords > limit) {
    renderPagination(data.page, data.totalPages);
  } else {
    pagination.innerHTML = "";
  }
}

// On form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const bloodGroup = document.getElementById("blood-group").value;
  const errorDiv = document.getElementById("bloodGroupError");
  currentPage = 1; // Reset to first page on new search

  if (!bloodGroup) {
    errorDiv.style.display = "block"; // Show error
    return; // Prevent form submission
  } else {
    errorDiv.style.display = "none"; // Hide error if valid
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
  pagination.innerHTML = "";
  currentPage = 1; // Reset to first page
});

// Load donors initially
//   fetchDonors();

function renderPagination(page, totalPages) {
  let html = "";
  // console.log(page,currentPage);

  if (page > 1) {
    html += `<button class="page-btn" data-page="${page - 1}">আগে</button>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${
      i == page ? "active" : ""
    }" data-page="${i}">${i}</button>`;
  }

  if (page < totalPages) {
    html += `<button class="page-btn" data-page="${page + 1}">পরবর্তী</button>`;
  }

  pagination.innerHTML = html;
}

// Event delegation
pagination.addEventListener("click", (e) => {
  if (e.target.dataset.page) {
    const page = parseInt(e.target.dataset.page);
    currentPage = page;
    fetchDonors({ page, bloodGroup });
  }
});

// function renderPagination(page, totalPages) {
//   let html = "";

//   if (page > 1) {
//     html += `<button class="btn btn-sm btn-outline-primary" onclick="goToPage(${
//       page - 1
//     })">Prev</button>`;
//   }

//   for (let i = 1; i <= totalPages; i++) {
//     html += `<button class="btn btn-sm ${
//       i === page ? "btn-primary" : "btn-outline-primary"
//     }" onclick="goToPage(${i})">${i}</button>`;
//   }

//   if (page < totalPages) {
//     html += `<button class="btn btn-sm btn-outline-primary" onclick="goToPage(${
//       page + 1
//     })">Next</button>`;
//   }

//   document.getElementById("pagination").innerHTML = html;
// }

// const goToPage = (page) => {
//   currentPage = page;
//   fetchDonors({ page });
// }
// });
