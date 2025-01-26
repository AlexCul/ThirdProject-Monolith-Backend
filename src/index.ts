import express from "express";
// Заметка: с ES6 импортом, оно не работает
const { ruruHTML } = require('ruru/server');

import fullHandler from "./graphql/handler";

import initDb from "./db/init";
initDb();

const app = express();

app.all('/graphql', fullHandler);

app.get('/', (_req, res) => {
  res.type('html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}/graphql`);
});

