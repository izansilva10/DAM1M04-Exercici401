const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuració Handlebars amb helper 'math'
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        math: (a, op, b) => {
            a = Number(a);
            b = Number(b);
            if (op === '+') return a + b;
            if (op === '-') return a - b;
            return a;
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutes
const productsRouter = require('./routes/products');
app.use('/productes', productsRouter);
const crudRouter = require('./routes/crud');
app.use('/', crudRouter);

app.get('/', (req, res) => {
    res.render('dashboard', { titol: 'Dashboard' });
});

app.listen(PORT, () => {
    console.log(`Servidor a http://localhost:${PORT}`);
});