const express = require('express');
const router = express.Router();
const {isAdmin} = require('../middlewares/auth'); // Import admin middleware
const donorController = require('../controllers/donorController');
const dashboardController = require('../controllers/dashboardController');


router.use(isAdmin);

router.get('/dashboard', dashboardController.dashboardData);


// donor routes
router.get('/donors', donorController.listDonors);
router.get('/donors/create', donorController.createDonorForm);
router.get('/donors/edit/:id', donorController.editDonorForm);
router.get('/donors/:id', donorController.getDonorDetails);
router.post('/donors/delete/:id', donorController.deleteDonor);
router.post('/donors/verify/:id', donorController.verifyDonor);



module.exports = router;
