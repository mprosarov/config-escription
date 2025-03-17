const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");

const server = http.createServer((req, res) => {
  // Парсим URL и параметры запроса
  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;

  // Проверяем, что запрос идет по пути /config
  if (parsedUrl.pathname === "/config") {
    //Если параметр name указан в запросе, то используем его в качестве имени файла, иначе используем имя по умолчанию
    const fileName = 'index';
    if(query.name) fileName = query.name;
    const filePath = path.join(__dirname, 'pageConfig' , `${fileName}.json`);

    // Читаем файл
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        // Если файл не найден или произошла ошибка
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Файл не найдн" }));
      } else {
        // Возвращаем содержимое файла как JSON
        res.writeHead(200, { "Content-Type": "application/json" });
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
