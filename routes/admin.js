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

// User Management Routes
const adminUserController = require('../controllers/adminUserController');
router.get('/users', adminUserController.listUsers);
router.get('/users/create', adminUserController.createUserForm);
router.post('/users/create', adminUserController.storeUser);
router.get('/users/edit/:id', adminUserController.editUserForm);
router.post('/users/edit/:id', adminUserController.updateUser);
router.post('/users/delete/:id', adminUserController.deleteUser);



module.exports = router;
