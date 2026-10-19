const express = require('express');
const db = require('./db');

const PORT = 3000;

const app = express();

app.listen(PORT, () => console.log(`Batcave sur http://localhost:${PORT}`));
