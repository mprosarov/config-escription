const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");

const server = http.createServer((req, res) => {
  // Устанавливаем заголовки CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Обработка preflight запросов (OPTIONS) для CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Парсим URL и параметры запроса
  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;

  // POST /saveData — сохранение данных таблиц
  // Формат данных: { configName: string, data: { tableId: row[] } }
  if (req.method === 'POST' && parsedUrl.pathname === '/saveData') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        let data = JSON.parse(body);
        let dirPath = path.join(__dirname, 'savedData');
        fs.mkdirSync(dirPath, { recursive: true });
        let filePath = path.join(dirPath, `${data.configName || 'default'}.json`);
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', err => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: 'Ошибка сохранения данных' }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          }
        });
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: 'Некорректный JSON' }));
      }
    });
    return;
  }

  // POST /saveUserConfig — сохранение пользовательской конфигурации
  // Формат данных: { configName: string, params: {}, tables: {}, savedAt: string }
  if (req.method === 'POST' && parsedUrl.pathname === '/saveUserConfig') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        let data = JSON.parse(body);
        let dirPath = path.join(__dirname, 'userConfigs');
        fs.mkdirSync(dirPath, { recursive: true });
        let filePath = path.join(dirPath, `${data.configName || 'default'}.json`);
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', err => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: 'Ошибка сохранения конфигурации' }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          }
        });
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: 'Некорректный JSON' }));
      }
    });
    return;
  }

  // GET /loadUserConfig?name=... — загрузка пользовательской конфигурации
  if (req.method === 'GET' && parsedUrl.pathname === '/loadUserConfig') {
    let fileName = query.name || 'default';
    let filePath = path.join(__dirname, 'userConfigs', `${fileName}.json`);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: 'Конфигурация не найдена' }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(data);
      }
    });
    return;
  }

  // Проверяем, что запрос идет по пути /config
  if (parsedUrl.pathname === "/config") {
    //Если параметр name указан в запросе, то используем его в качестве имени файла, иначе используем имя по умолчанию
    let fileName = "index";
    if (query.name) fileName = query.name;
    const filePath = path.join(__dirname, "pageConfig", `${fileName}.json`);

    // Читаем файл
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        // Если файл не найден или произошла ошибка
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Файл не найдн" }));
      } else {
        // Возвращаем содержимое файла как JSON
        res.writeHead(200, { "Content-Type": "application/json" });
        //console.log("ЧИТАЕМ ФАЙЛ И ВОЗВРАЩАЕМ ДАННЫЕ: ", data);
        res.end(data);
      }
    });
  } else {
    // Если путь или параметры неверные
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Некорректный запрос" }));
  }
});

// Запускаем сервер на порту 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен по адрессу http://localhost:${PORT}`);
});
