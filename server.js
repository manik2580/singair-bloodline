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
const adminAuthRoutes = require('./routes/adminAuth');



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

//Api routes
app.use('/api/donors', donorsRouter);
app.use('/api/auth', authRouter);
// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});


// admin routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', adminAuthRoutes);

// app.get('/admin/login', (req, res) => {
//   if (req.session && req.session.isAdmin) {
//     return res.redirect('/admin/dashboard');
//   }
//   res.render('login', { 
//     title: 'Admin Login',
//     layout: 'layouts/public.ejs', 
//     activePage: 'login'
//     });
// });

// Dashboard routes 404
app.use('/admin', (req, res) => {
  res.status(404).render('errors/404-dashboard', {
    title: 'পৃষ্ঠা পাওয়া যায়নি (ড্যাশবোর্ড)',
    layout: 'layouts/dashboard.ejs',
    activePage: ''
  });
});

// Public site 404
app.use((req, res) => {
  res.status(404).render('errors/404-public', {
    title: 'পৃষ্ঠা পাওয়া যায়নি',
    layout: 'layouts/public.ejs',
    activePage: ''
  });
});



app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
