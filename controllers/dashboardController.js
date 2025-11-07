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
        if (diffMonths >= 4) availableDonors++;
        else notAvailableDonors++;
      } else {
        notAvailableDonors++;
      }
    });

     // --- Monthly Registration Chart Data ---
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyRegistrations = new Array(12).fill(0);
  
    donors.forEach((donor) => {
      if (donor.createdAt && !isNaN(new Date(donor.createdAt))) {
        const month = new Date(donor.createdAt).getMonth(); // 0 = Jan ... 11 = Dec
        if (month >= 0 && month < 12) {
          monthlyRegistrations[month]++;
        }
      }
    });

    // --- Blood Group Distribution Chart Data ---
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const bloodGroupCounts = bloodGroups.map(
      (group) => donors.filter((d) => d.bloodGroup === group).length
    );

    // --- Latest Donors (for table) ---
    const latestDonors = donors
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.render("admin/dashboard", {
      title: "ড্যাশবোর্ড",
      layout: "layouts/dashboard.ejs",
      activePage: "dashboard",
      totalDonors,
      availableDonors,
      notAvailableDonors,
      donatedBefore,
      months,
      monthlyRegistrations,
      bloodGroups,
      bloodGroupCounts,
      latestDonors
    });
  } catch (err) {
    console.error("Error fetching donors:", err);
    res.status(500).send("Server error");
  }
};
