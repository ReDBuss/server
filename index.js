const sqlite3 = require('sqlite3').verbose();
const express = require("express");
const app = express();
const port = 3000;

const db = new sqlite3.Database('mydatabase.db');

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, login TEXT UNIQUE NOT NULL, age INTGER NOT NULL, mail TEXT UNIQUE NOT NULL, password TEXT NOT NULL, phone INTEGER UNIQUE )');
  });
  app.get('/user/:login', (req, res) => {
    const login = req.params.id;
  
    // Выполнение запроса к базе данных
    db.get('SELECT * FROM users WHERE id = ?', [login], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
  
      // Проверка наличия пользователя
      if (!row) {
        res.status(404).json({ message: 'Пользователь не найден' });
        return;
      }
  
      // Отправка данных пользователя в ответе
      res.json({ user: row });
    });
  });
app.get("/", function (req, res) {
  res.send("");
});

app.get("/", function (req, res) {
    res.send("");
  });

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});