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

module.exports = router;