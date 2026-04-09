const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.post('/create', async (req, res) => {
    const { taula, name, category, price, stock, active } = req.body;

    if (taula === 'productes') {
        try {
            await db.query(
                'INSERT INTO products (name, category, price, stock, active) VALUES (?, ?, ?, ?, ?)',
                [name, category, parseFloat(price), parseInt(stock), active === '1' ? 1 : 0]
            );
            res.redirect('/productes');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error creant producte');
        }
    } else {
        res.status(400).send('Taula no suportada');
    }
});

module.exports = router;