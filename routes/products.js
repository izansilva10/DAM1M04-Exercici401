const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', async (req, res) => {
    try {
        const pagina = parseInt(req.query.pagina) || 0;
        const cerca = req.query.cerca || '';
        const limit = 10;
        const offset = pagina * limit;

        let sql = 'SELECT * FROM products WHERE 1=1';
        let countSql = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
        const params = [];

        if (cerca) {
            sql += ' AND (name LIKE ? OR category LIKE ?)';
            countSql += ' AND (name LIKE ? OR category LIKE ?)';
            params.push(`%${cerca}%`, `%${cerca}%`);
        }

        sql += ' LIMIT ? OFFSET ?';
        const [products] = await db.query(sql, [...params, limit, offset]);
        const [[{ total }]] = await db.query(countSql, params);

        const totalPagines = Math.ceil(total / limit);

        res.render('products/list', {
            products,
            pagina,
            cerca,
            totalPagines,
            paginaActual: pagina,
            teSeguent: pagina + 1 < totalPagines,
            teAnterior: pagina > 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error carregant productes');
    }
});

// Mostrar formulari per afegir producte
router.get('/afegir', (req, res) => {
    res.render('products/form', { 
        producte: null, 
        action: '/create',
        titol: 'Afegir producte'
    });
});

module.exports = router;