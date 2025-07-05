const fs = require("fs");
const { exec } = require("child_process");

let buildTimeout;
const DEBOUNCE_DELAY = 300; // Задержка в мс

// Путь к папке, где должна выполняться команда npm run build (относительно текущего скрипта)
const TARGET_DIR = '../example'; // Пример: папка на уровень выше

// Команда, которую нужно выполнить
const COMMAND = 'npm run build'; // собираем проект
// Путь к папке, которую нужно отслеживать
const WATCH_DIR = "./src/elements/"; // Можно изменить на нужную папку

// Функция для выполнения команды
function runBuild() {
  console.log("🔍 Обнаружены изменения. Запуск сборки...");
  exec(COMMAND,{cwd:TARGET_DIR}, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Ошибка сборки: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ stderr: ${stderr}`);
      return;
    }
    console.log(`✅ Сборка завершена:\n${stdout}`);
  });
}

// Отслеживание изменений в папке
fs.watch(WATCH_DIR, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  clearTimeout(buildTimeout); // Сбрасываем предыдущий таймер
  buildTimeout = setTimeout(()=>{
        console.log(`🔄 Изменение в файле: ${filename}, ${eventType}`);
        runBuild()
    }, DEBOUNCE_DELAY);
});

console.log(`👀 Отслеживание изменений в папке: ${WATCH_DIR}...`);
