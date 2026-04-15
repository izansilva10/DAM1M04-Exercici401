const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Llistat de vendes amb paginació i cerca per client
router.get('/', async (req, res) => {
    try {
        const pagina = parseInt(req.query.pagina) || 0;
        const cerca = req.query.cerca || '';
        const limit = 10;
        const offset = pagina * limit;

        let sql = `SELECT s.*, c.name as customer_name 
                   FROM sales s 
                   JOIN customers c ON s.customer_id = c.id 
                   WHERE 1=1`;
        let countSql = `SELECT COUNT(*) as total FROM sales s JOIN customers c ON s.customer_id = c.id WHERE 1=1`;
        const params = [];

        if (cerca) {
            sql += ' AND c.name LIKE ?';
            countSql += ' AND c.name LIKE ?';
            params.push(`%${cerca}%`);
        }

        sql += ' ORDER BY s.sale_date DESC LIMIT ? OFFSET ?';
        const [sales] = await db.query(sql, [...params, limit, offset]);
        const [[{ total }]] = await db.query(countSql, params);

        const totalPagines = Math.ceil(total / limit);

        res.render('sales/list', {
            sales,
            pagina,
            cerca,
            totalPagines,
            teAnterior: pagina > 0,
            teSeguent: pagina + 1 < totalPagines
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error carregant vendes');
    }
});
// Formulari per crear venda
router.get('/crear', async (req, res) => {
    try {
        const [customers] = await db.query('SELECT id, name FROM customers ORDER BY name');
        const [products] = await db.query('SELECT id, name, price, stock FROM products WHERE active = 1 AND stock > 0 ORDER BY name');
        res.render('sales/create', { customers, products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error carregant formulari de venda');
    }
});
router.post('/guardar', async (req, res) => {
    const { customer_id, payment_method, total, product_id, qty, unit_price } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Inserir capçalera de venda
        const [saleResult] = await connection.query(
            'INSERT INTO sales (customer_id, payment_method, total) VALUES (?, ?, ?)',
            [customer_id, payment_method, total]
        );
        const saleId = saleResult.insertId;

        // Inserir línies i descomptar stock
        for (let i = 0; i < product_id.length; i++) {
            const pid = product_id[i];
            const q = parseInt(qty[i]);
            const up = parseFloat(unit_price[i]);
            const lineTotal = up * q;
            await connection.query(
                'INSERT INTO sale_items (sale_id, product_id, qty, unit_price, line_total) VALUES (?, ?, ?, ?, ?)',
                [saleId, pid, q, up, lineTotal]
            );
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [q, pid]
            );
        }

        await connection.commit();
        res.redirect('/vendes');
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).send('Error en crear la venda');
    } finally {
        connection.release();
    }
});
module.exports = router;
