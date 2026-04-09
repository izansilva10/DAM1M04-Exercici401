const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Servidor funcionant correctament');
});

app.listen(PORT, () => {
    console.log(`Servidor a http://localhost:${PORT}`);
});