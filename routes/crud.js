const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// CREATE
router.post('/create', async (req, res) => {
    const { taula, name, category, price, stock, active, email, phone } = req.body;
    if (taula === 'products') {
        await db.query(
            'INSERT INTO products (name, category, price, stock, active) VALUES (?, ?, ?, ?, ?)',
            [name, category, parseFloat(price), parseInt(stock), active === '1' ? 1 : 0]
        );
        res.redirect('/productes');
    } else if (taula === 'customers') {
        await db.query(
            'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
            [name, email, phone]
        );
        res.redirect('/clients');
    } else {
        res.status(400).send('Taula no suportada');
    }
});

// UPDATE
router.post('/update', async (req, res) => {
    const { taula, id, name, category, price, stock, active, email, phone } = req.body;
    if (taula === 'products') {
        await db.query(
            'UPDATE products SET name=?, category=?, price=?, stock=?, active=? WHERE id=?',
            [name, category, parseFloat(price), parseInt(stock), active === '1' ? 1 : 0, id]
        );
        res.redirect('/productes');
    } else if (taula === 'customers') {
        await db.query(
            'UPDATE customers SET name=?, email=?, phone=? WHERE id=?',
            [name, email, phone, id]
        );
        res.redirect('/clients');
    } else {
        res.status(400).send('Taula no suportada');
    }
});

// DELETE
router.post('/delete', async (req, res) => {
    const { taula, id } = req.body;
    if (taula === 'products') {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.redirect('/productes');
    } else if (taula === 'customers') {
        await db.query('DELETE FROM customers WHERE id = ?', [id]);
        res.redirect('/clients');
    } else {
        res.status(400).send('Taula no suportada');
    }
});

module.exports = router;