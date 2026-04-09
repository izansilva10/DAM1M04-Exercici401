const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        res.render('products/list', { products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error carregant productes');
    }
});

module.exports = router;