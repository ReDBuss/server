const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const port = 3001;

const db = new sqlite3.Database("mydatabase.db");

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Change this to true in a production environment with HTTPS
  })
);

app.get('/', (req, res) => {
  if (req.session.views) {
    req.session.views++;
  } else {
    req.session.views = 1;
  }

  res.send(`Views: ${req.session.views}`);
});



// Login route
app.get('/login', (req, res) => {
  const { login, password } = req.body;

  db.get('SELECT * FROM users WHERE login = ? AND password = ?', [login, password], (err, row) => {
    if (err) {
      return res.send(json({ error: 'Error authenticating user' }));
    }

    if (!row) {
      return res.send(json({ error: 'Invalid credentials' }));
    }

    req.session.userId = row.id; // Store user ID in the session

    res.send(json({ message: 'Login successful' }));
  });
});





// Protected route
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.send(json({ error: 'Unauthorized' }));
  }

  // Fetch user data from the database using req.session.userId
  // ...

  res.send(json({ message: 'Welcome to the dashboard' }));
});


db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, login TEXT UNIQUE NOT NULL, age INTGER NOT NULL, mail TEXT UNIQUE NOT NULL, password TEXT NOT NULL, phone INTEGER UNIQUE )"
  );
});
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS achivements (id INTEGER PRIMARY KEY, olimpiad TEXT NOT NULL, place INTEGER NOT NULL, type TEXT NOT NULL, prize NUMERIC NOT NULL, user_id INTEGER, FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE)"
  );
});

const defaultUser = {
  name: "Default User",
  login: "default_user",
  age: 25,
  mail: "default_user@example.com",
  password: "default_password",
  phone: 1234567890,
};




// Разрешение приложению парсить JSON в теле запроса
app.use(express.json());


// Обработчик POST запроса для регистрации нового пользователя
app.post('/register', (req, res) => {
  const { login, name, age, mail, phone, password } = req.body;

  // Проверка наличия всех необходимых полей в теле запроса
  if (!login || !name || !age || !mail || !phone || !password) {
    res.send(json({ message: 'Все поля (login, name, age, mail, phone, password) должны быть предоставлены' }));
    return;
  }

  // Выполнение запроса к базе данных для вставки нового пользователя
  db.run('INSERT INTO users (login, name, age, mail, phone, password) VALUES (?, ?, ?, ?, ?, ?)', [login, name, age, mail, phone, password], function(err) {
    if (err) {
      res.send(json({ error: err.message }));
      return;
    }

    // Отправка данных нового пользователя в ответе
    res.json({ user: { id: this.lastID, login, name, age, mail, phone, password } });
  });
});
app.get('/getachivments', (req, res) => {
  const { olimpiad, place, type, prize, user_id } = req.body;

  // Проверка наличия всех необходимых полей в теле запроса
  if (!olimpiad || !place || !type || !prize || !user_id ) {
    res.send(json({ message: 'Все поля (olimpiad, place, type, prize, user_id ) должны быть предоставлены' }));
    return;
  }

  // Выполнение запроса к базе данных для вставки нового пользователя
  db.run('SELECT * FROM achivments WHERE user_id = ?', [user_id], function(err) {
    if (err) {
      res.send(json({ error: err.message }));
      return;
    }

    // Отправка данных нового пользователя в ответе
    res.json({ user: { id: this.lastID, olimpiad, place, type, prize, user_id } });
  });
});

app.post('/achivements', (req, res) => {
  const { olimpiad, place, type, prize, user_id } = req.body;

  // Проверка наличия всех необходимых полей в теле запроса
  if (!olimpiad || !place || !type || !prize || !user_id ) {
    res.send(json({ message: 'Все поля (olimpiad, place, type, prize, user_id ) должны быть предоставлены' }));
    return;
  }

  // Выполнение запроса к базе данных для вставки нового пользователя
  db.run('INSERT INTO users (olimpiad, place, type, prize, user_id ) VALUES (?, ?, ?, ?, ?)', [olimpiad, place, type, prize, user_id ], function(err) {
    if (err) {
      res.send(json({ error: err.message }));
      return;
    }

    // Отправка данных нового пользователя в ответе
    res.json({ user: { id: this.lastID, olimpiad, place, type, prize, user_id } });
  });
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});