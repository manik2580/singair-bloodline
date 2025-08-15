const Donor = require("../models/Donor");

exports.dashboardData = async (req, res) => {
  try {
    const donors = await Donor.find();

    const totalDonors = donors.length;

    let availableDonors = 0;
    let notAvailableDonors = 0;
    let donatedBefore = 0;

    const now = new Date();

    donors.forEach((donor) => {
      // Donated before count
      if (donor.is_donated_before) donatedBefore++;

      // Last donation available or not
      if (donor.lastDonation) {
        const last = new Date(donor.lastDonation);
        const diffMonths =
          (now.getFullYear() - last.getFullYear()) * 12 +
          (now.getMonth() - last.getMonth());
        if (diffMonths < 4) availableDonors++;
        else notAvailableDonors++;
      } else {
        notAvailableDonors++;
      }
    });

    res.render("admin/dashboard", {
      title: "ড্যাশবোর্ড",
      layout: "layouts/dashboard.ejs",
      activePage: "dashboard",
      totalDonors,
      availableDonors,
      notAvailableDonors,
      donatedBefore,
    });
  } catch (err) {
    console.error("Error fetching donors:", err);
    res.status(500).send("Server error");
  }
};
