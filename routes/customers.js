const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Llistat clients amb paginació i cerca
router.get('/', async (req, res) => {
    try {
        const pagina = parseInt(req.query.pagina) || 0;
        const cerca = req.query.cerca || '';
        const limit = 10;
        const offset = pagina * limit;

        let sql = 'SELECT * FROM customers WHERE 1=1';
        let countSql = 'SELECT COUNT(*) as total FROM customers WHERE 1=1';
        const params = [];

        if (cerca) {
            sql += ' AND (name LIKE ? OR email LIKE ?)';
            countSql += ' AND (name LIKE ? OR email LIKE ?)';
            params.push(`%${cerca}%`, `%${cerca}%`);
        }

        sql += ' LIMIT ? OFFSET ?';
        const [customers] = await db.query(sql, [...params, limit, offset]);
        const [[{ total }]] = await db.query(countSql, params);

        const totalPagines = Math.ceil(total / limit);

        res.render('customers/list', {
            customers,
            pagina,
            cerca,
            totalPagines,
            teAnterior: pagina > 0,
            teSeguent: pagina + 1 < totalPagines
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error carregant clients');
    }
});

// Formulari afegir client
router.get('/afegir', (req, res) => {
    res.render('customers/form', {
        customer: null,
        action: '/create',
        titol: 'Afegir client'
    });
});

// Formulari editar client (segons enunciat: /clientEditar)
router.get('/clientEditar', async (req, res) => {
    const id = req.query.id;
    if (!id) return res.redirect('/clients');

    try {
        const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
        if (rows.length === 0) return res.redirect('/clients');
        res.render('customers/form', {
            customer: rows[0],
            action: '/update',
            titol: 'Editar client'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error carregant client per editar');
    }
});

module.exports = router;