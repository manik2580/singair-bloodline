require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');

const donorsRouter = require('./routes/Api/donors');
const authRouter = require('./routes/Api/auth');

const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');



const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// setup EJS templating and layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// session
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 4 } // 4 hours
}));

// connect mongodb
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// routes
app.use('/api/donors', donorsRouter);
app.use('/api/auth', authRouter);

// admin routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

// public routes
// app.get('/', (req, res) => {
//     res.render('index', { title: 'হোম পেজ' });
// });

// app.get('/about', (req, res) => {
//     res.render('about', { title: 'আমাদের সম্পর্কে' });
// });
// app.get('/search', (req, res) => {
//     res.render('search', { title: 'অনুসন্ধান' });
// });

app.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('login', { title: 'Admin Login', activePage: 'login'  });
});

// Protected admin content route (simple check)
// app.get('/admin/dashboard', (req, res) => {
//   if (!req.session || !req.session.isAdmin) {
//     return res.redirect('/login');
//     // return res.status(401).json({ message: 'Unauthorized' });
//   }
//   res.render('admin/dashboard', {
//     title: 'ড্যাশবোর্ড',
//     layout: 'admin/layout',
//     activePage: 'dashboard'
//   });
//   // res.sendFile(path.join(__dirname, 'public/admin/dashboard.html'));
// });

// // Sample donors data (in real app, fetch from MongoDB)
// const donors = [
//   { name: "রাফি", bloodGroup: "A+", phone: "017xxxxxxx1", city: "সিংগাইর" },
//   { name: "নাসরিন", bloodGroup: "B-", phone: "018xxxxxxx2", city: "ঢাকা" },
//   { name: "তাহমিনা", bloodGroup: "O+", phone: "019xxxxxxx3", city: "চট্টগ্রাম" }
// ];

// app.get('/admin/donors', (req, res) => {
//   if (!req.session || !req.session.isAdmin) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }
//   res.render('admin/donors', {
//     title: 'ডোনার তালিকা',
//     layout: 'admin/layout',
//     activePage: 'donors',
//     donors: donors
//   });
// });


// fallback
app.use((req, res) => res.status(404).send('Not Found'));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
