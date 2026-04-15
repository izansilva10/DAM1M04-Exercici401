const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuració Handlebars (UNA SOLA VEGADA, amb tots els helpers)
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
        },
        formatDate: (date) => {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleDateString('ca-ES');
        },
        stockColor: (stock) => {
            if (stock <= 0) return 'stock-critical';
            if (stock <= 5) return 'stock-low';
            return 'stock-ok';
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

const customersRouter = require('./routes/customers');
app.use('/clients', customersRouter);

const salesRouter = require('./routes/sales');
app.use('/vendes', salesRouter);

// Dashboard amb dades reals
app.get('/', async (req, res) => {
    const db = require('./db/connection');
    try {
        // KPIs
        const [avuiRows] = await db.query("SELECT COALESCE(SUM(total),0) as total FROM sales WHERE DATE(sale_date) = CURDATE()");
        const [mesRows] = await db.query("SELECT COALESCE(SUM(total),0) as total FROM sales WHERE MONTH(sale_date) = MONTH(CURDATE()) AND YEAR(sale_date) = YEAR(CURDATE())");
        const [comandesAvui] = await db.query("SELECT COUNT(*) as total FROM sales WHERE DATE(sale_date) = CURDATE()");
        const [comandesMes] = await db.query("SELECT COUNT(*) as total FROM sales WHERE MONTH(sale_date) = MONTH(CURDATE()) AND YEAR(sale_date) = YEAR(CURDATE())");
        const [stockBaix] = await db.query("SELECT * FROM products WHERE stock <= 5 AND active = 1 ORDER BY stock LIMIT 10");

        // Llistats
        const [ultimesVendes] = await db.query(`
            SELECT s.id, s.sale_date, c.name as client_name, s.total 
            FROM sales s 
            JOIN customers c ON s.customer_id = c.id 
            ORDER BY s.sale_date DESC 
            LIMIT 5
        `);
        const [topProductes] = await db.query(`
            SELECT p.name, SUM(si.qty) as total_venut 
            FROM sale_items si 
            JOIN products p ON si.product_id = p.id 
            GROUP BY p.id 
            ORDER BY total_venut DESC 
            LIMIT 5
        `);

        res.render('dashboard', {
            kpi: {
                vendesAvui: avuiRows[0].total,
                vendesMes: mesRows[0].total,
                comandesAvui: comandesAvui[0].total,
                comandesMes: comandesMes[0].total,
                stockBaix: stockBaix
            },
            ultimesVendes,
            topProductes
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error carregant dashboard');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor a http://localhost:${PORT}`);
});