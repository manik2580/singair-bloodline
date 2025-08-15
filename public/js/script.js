document.addEventListener("DOMContentLoaded", () => {
  // --- Global Navigation (Hamburger Menu) ---
  const hamburgerMenu = document.querySelector(".hamburger-menu")
  const navList = document.querySelector(".nav-list")

  if (hamburgerMenu && navList) {
    hamburgerMenu.addEventListener("click", () => {
      navList.classList.toggle("active")
    })
  }
  

  // --- Helper Functions for LocalStorage ---

  /**
   * Retrieves all donor data from localStorage.
   * Ensures each donor object has an 'isVerified' property, defaulting to false.
   * @returns {Array} An array of donor objects.
   */
  const getDonors = () => {
    try {
      const donors = JSON.parse(localStorage.getItem("donors") || "[]")
      // Ensure all donors have an 'isVerified' property
      return donors.map((donor) => ({
        ...donor,
        isVerified: typeof donor.isVerified === "boolean" ? donor.isVerified : false,
      }))
    } catch (e) {
      console.error("Error parsing donors from localStorage:", e)
      return []
    }
  }

  /**
   * Saves an array of donor data to localStorage.
   * @param {Array} donors - The array of donor objects to save.
   */
  const saveDonors = (donors) => {
    localStorage.setItem("donors", JSON.stringify(donors))
  }

  // --- Public Donor Registration Page Logic (register.html) ---
  const publicRegistrationForm = document.getElementById("donor-registration-form")
  const publicSuccessMessage = document.getElementById("success-message")

  if (publicRegistrationForm) {
    publicRegistrationForm.addEventListener("submit", (event) => {
      event.preventDefault() // Prevent default form submission

      const formData = new FormData(publicRegistrationForm)
      const donorData = {}
      for (const [key, value] of formData.entries()) {
        donorData[key] = value
      }

      // Generate a simple unique ID (for demo purposes)
      donorData.id = Date.now().toString()
      donorData.isVerified = false // New donors are unverified by default

      // Get existing donors from localStorage
      const existingDonors = getDonors()
      existingDonors.push(donorData)

      // Save updated donors to localStorage
      saveDonors(existingDonors)

      // Show success message
      if (publicSuccessMessage) {
        publicSuccessMessage.style.display = "block"
        setTimeout(() => {
          publicSuccessMessage.style.display = "none"
        }, 3000) // Hide message after 3 seconds
      }

      // Clear the form
      publicRegistrationForm.reset()
    })
  }

  // --- Admin Login Page Logic (admin.html) ---
  

  // --- Admin Panel Page Logic (admin-panel.html) ---
  const donorForm = document.getElementById("donor-form")
  const donorsTableBody = document.querySelector("#donors-table tbody")
  const noDonorsMessage = document.getElementById("no-donors-message")
  const submitDonorButton = document.getElementById("submit-donor-button")
  const cancelEditButton = document.getElementById("cancel-edit-button")
  const logoutButton = document.getElementById("logout-button")
  const resetDonorsButton = document.getElementById("reset-donors-button")
  const isVerifiedCheckbox = document.getElementById("is-verified")

  if (donorForm && donorsTableBody) {
    // Check if admin is logged in, otherwise redirect
    if (sessionStorage.getItem("isAdminLoggedIn") !== "true") {
      window.location.href = "admin.html"
      return // Stop further execution
    }

    // Logout functionality
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        sessionStorage.removeItem("isAdminLoggedIn") // Clear login status
        window.location.href = "admin.html" // Redirect to login page
      })
    }

    // Reset All Donors functionality
    if (resetDonorsButton) {
      resetDonorsButton.addEventListener("click", () => {
        if (confirm("আপনি কি নিশ্চিত যে আপনি সকল ডোনারের তালিকা রিসেট করতে চান? এই অ্যাকশনটি পূর্বাবস্থায় ফেরানো যাবে না।")) {
          localStorage.removeItem("donors") // Clear all donor data
          renderDonorsTable() // Re-render table (will now be empty)
          // Optional: give a visual confirmation
          alert("সকল ডোনারের তালিকা রিসেট করা হয়েছে।")
        }
      })
    }

    /**
     * Renders the donor table with current data from localStorage.
     */
    const renderDonorsTable = () => {
      const donors = getDonors()
      donorsTableBody.innerHTML = "" // Clear existing rows

      if (donors.length === 0) {
        noDonorsMessage.style.display = "block"
        donorsTableBody.closest("table").style.display = "none" // Hide table
      } else {
        noDonorsMessage.style.display = "none"
        donorsTableBody.closest("table").style.display = "table" // Show table
        donors.forEach((donor) => {
          const row = donorsTableBody.insertRow()
          row.innerHTML = `
                        <td>${donor.id}</td>
                        <td>${donor.name}</td>
                        <td>${donor.blood_group}</td>
                        <td>${donor.phone}</td>
                        <td>${donor.address}</td>
                        <td>${donor.donated_before}</td>
                        <td>${donor.isVerified ? "হ্যাঁ" : "না"}</td>
                        <td class="action-buttons">
                            <button class="button edit-button" data-id="${donor.id}">এডিট</button>
                            <button class="button delete-button" data-id="${donor.id}">ডিলিট</button>
                        </td>
                    `
        })
      }
    }

    /**
     * Handles adding a new donor or updating an existing one.
     */
    donorForm.addEventListener("submit", (event) => {
      event.preventDefault()

      const formData = new FormData(donorForm)
      const donorData = {}
      for (const [key, value] of formData.entries()) {
        donorData[key] = value
      }

      // Get verification status from checkbox
      donorData.isVerified = isVerifiedCheckbox.checked

      let donors = getDonors()
      const existingDonorId = donorForm.elements["donor-id"].value

      if (existingDonorId) {
        // Edit existing donor
        donors = donors.map((donor) =>
          donor.id === existingDonorId ? { ...donor, ...donorData, id: existingDonorId } : donor,
        )
        submitDonorButton.textContent = "ডোনার যোগ করুন" // Reset button text
        cancelEditButton.style.display = "none" // Hide cancel button
        donorForm.elements["donor-id"].value = "" // Clear hidden ID
      } else {
        // Add new donor (isVerified already set to false by default in public registration,
        // but admin can set it here for new entries)
        donorData.id = Date.now().toString() // Simple unique ID
        donors.push(donorData)
      }

      saveDonors(donors)
      renderDonorsTable()
      donorForm.reset() // Clear form
      isVerifiedCheckbox.checked = false // Reset checkbox state
    })

    /**
     * Handles Edit and Delete button clicks in the table.
     */
    donorsTableBody.addEventListener("click", (event) => {
      if (event.target.classList.contains("edit-button")) {
        const donorIdToEdit = event.target.dataset.id
        const donors = getDonors()
        const donorToEdit = donors.find((donor) => donor.id === donorIdToEdit)

        if (donorToEdit) {
          // Populate form for editing
          donorForm.elements.name.value = donorToEdit.name
          donorForm.elements.blood_group.value = donorToEdit.blood_group
          donorForm.elements.phone.value = donorToEdit.phone
          donorForm.elements.address.value = donorToEdit.address
          document.getElementById(`donated-${donorToEdit.donated_before === "হ্যাঁ" ? "yes" : "no"}`).checked = true
          isVerifiedCheckbox.checked = donorToEdit.isVerified // Set verified checkbox

          donorForm.elements["donor-id"].value = donorToEdit.id // Set hidden ID for update
          submitDonorButton.textContent = "ডোনার আপডেট করুন" // Change button text
          cancelEditButton.style.display = "inline-block" // Show cancel button
          window.scrollTo({ top: 0, behavior: "smooth" }) // Scroll to top to show form
        }
      } else if (event.target.classList.contains("delete-button")) {
        const donorIdToDelete = event.target.dataset.id
        if (confirm("আপনি কি নিশ্চিত যে আপনি এই ডোনারকে ডিলিট করতে চান?")) {
          let donors = getDonors()
          donors = donors.filter((donor) => donor.id !== donorIdToDelete)
          saveDonors(donors)
          renderDonorsTable()
        }
      }
    })

    /**
     * Handles canceling an edit operation.
     */
    if (cancelEditButton) {
      cancelEditButton.addEventListener("click", () => {
        donorForm.reset() // Clear form
        donorForm.elements["donor-id"].value = "" // Clear hidden ID
        submitDonorButton.textContent = "ডোনার যোগ করুন" // Reset button text
        cancelEditButton.style.display = "none" // Hide cancel button
        isVerifiedCheckbox.checked = false // Reset checkbox state
      })
    }

    // Initial render of the table when the page loads
    renderDonorsTable()
  }

  // --- Donor Search Page Logic (search.html) ---
  const searchForm = document.getElementById("donor-search-form")
  const searchResultsContainer = document.getElementById("search-results")
  const resetSearchFiltersButton = document.getElementById("reset-search-filters")

  if (searchForm && searchResultsContainer) {
    /**
     * Renders donor search results in a grid/card layout.
     * @param {Array} donors - The array of donor objects to display.
     */
    const renderSearchResults = (donors) => {
      searchResultsContainer.innerHTML = "" // Clear previous results

      if (donors.length === 0) {
        searchResultsContainer.innerHTML = '<p class="no-results">কোনো ডোনার খুঁজে পাওয়া যায়নি।</p>'
        return
      }

      donors.forEach((donor) => {
        const donorCard = document.createElement("a") // Changed to <a> tag
        donorCard.href = `donor-profile.html?id=${donor.id}` // Link to profile page
        donorCard.classList.add("donor-card")
        donorCard.innerHTML = `
                    <h4>${donor.name} <span class="blood-group-badge">${donor.blood_group}</span>
                    ${donor.isVerified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i>ভেরিফাইড</span>' : ""}
                    </h4>
                    <p>ঠিকানা: ${donor.address}</p>
                    <p>পূর্বে রক্ত দিয়েছেন: ${donor.donated_before}</p>
                    <p>মোবাইল: <span class="phone-link">${donor.phone}</span></p>
                `
        searchResultsContainer.appendChild(donorCard)
      })
    }

    /**
     * Filters donors based on search criteria and renders results.
     */
    const filterDonors = () => {
      const allDonors = getDonors()
      const bloodGroup = document.getElementById("blood-group").value
      const district = document.getElementById("district").value.toLowerCase().trim()

      const filtered = allDonors.filter((donor) => {
        let matches = true

        if (bloodGroup && donor.blood_group !== bloodGroup) {
          matches = false
        }
        // Check if district/address input matches any part of the donor's address
        if (district && !donor.address.toLowerCase().includes(district)) {
          matches = false
        }

        return matches
      })
      renderSearchResults(filtered)
    }

    searchForm.addEventListener("submit", (event) => {
      event.preventDefault()
      filterDonors()
    })

    if (resetSearchFiltersButton) {
      resetSearchFiltersButton.addEventListener("click", () => {
        searchForm.reset() // Clear form fields
        filterDonors() // Re-render with no filters
      })
    }

    // Initial render of all donors on page load
    filterDonors()
  }

  // --- Donor Profile Page Logic (donor-profile.html) ---
  const donorProfileContainer = document.getElementById("donor-profile-container")
  const noDonorFoundMessage = document.getElementById("no-donor-found")

  if (donorProfileContainer) {
    const urlParams = new URLSearchParams(window.location.search)
    const donorId = urlParams.get("id")

    if (donorId) {
      const donors = getDonors()
      const donor = donors.find((d) => d.id === donorId)

      if (donor) {
        donorProfileContainer.innerHTML = `
                    <div class="donor-profile-card">
                        <h3>${donor.name}</h3>
                        <span class="blood-group-badge">${donor.blood_group}</span>
                        ${donor.isVerified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i>ভেরিফাইড</span>' : ""}
                        <div class="donor-profile-details">
                            <p><i class="fas fa-phone-alt"></i> মোবাইল: <a href="tel:${donor.phone}" class="phone-link">${donor.phone}</a></p>
                            <p><i class="fas fa-map-marker-alt"></i> ঠিকানা: ${donor.address}</p>
                            <p><i class="fas fa-history"></i> পূর্বে রক্ত দিয়েছেন: ${donor.donated_before}</p>
                            <p><i class="fas fa-id-badge"></i> ডোনার আইডি: ${donor.id}</p>
                        </div>
                    </div>
                `
        noDonorFoundMessage.style.display = "none"
      } else {
        donorProfileContainer.innerHTML = "" // Clear any previous content
        noDonorFoundMessage.style.display = "block"
      }
    } else {
      donorProfileContainer.innerHTML = "" // Clear any previous content
      noDonorFoundMessage.style.display = "block"
    }
  }
})
