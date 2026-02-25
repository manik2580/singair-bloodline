const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

exports.listUsers = async (req, res) => {
    try {
        const users = await Admin.find().sort({ createdAt: -1 });
        res.render('admin/users/index', {
            users,
            title: 'ইউজার ম্যানেজমেন্ট',
            layout: 'layouts/dashboard.ejs',
            activePage: 'users'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.createUserForm = (req, res) => {
    res.render('admin/users/create', {
        title: 'নতুন ইউজার তৈরি',
        layout: 'layouts/dashboard.ejs',
        activePage: 'users'
    });
};

exports.storeUser = async (req, res) => {
    try {
        const { name, email, username, password, role, status } = req.body;
        
        // Check if user exists
        let user = await Admin.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).send('এই ইমেইল বা ইউজারনেম ইতিমধ্যে ব্যবহৃত হয়েছে');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        user = new Admin({
            name,
            email,
            username,
            passwordHash,
            role,
            status
        });

        await user.save();
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.editUserForm = async (req, res) => {
    try {
        const user = await Admin.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.render('admin/users/edit', {
            user,
            title: 'ইউজার সম্পাদনা',
            layout: 'layouts/dashboard.ejs',
            activePage: 'users'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, email, username, password, role, status } = req.body;
        const user = await Admin.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');

        user.name = name;
        user.email = email;
        user.username = username;
        user.role = role;
        user.status = status;

        if (password && password.trim() !== '') {
            user.passwordHash = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await Admin.findByIdAndDelete(req.params.id);
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
