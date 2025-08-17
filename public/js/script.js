document.addEventListener("DOMContentLoaded", () => {
  // --- Global Navigation (Hamburger Menu) ---
  const hamburgerMenu = document.querySelector(".hamburger-menu")
  const navList = document.querySelector(".nav-list")

  if (hamburgerMenu && navList) {
    hamburgerMenu.addEventListener("click", () => {
      navList.classList.toggle("active")
    })
  }
  

 
})
