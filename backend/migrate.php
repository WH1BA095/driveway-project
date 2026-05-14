<?php
// migrate.php — запускает SQL-миграции из папки /migrate
// Использование: php migrate.php
// В Docker: docker compose exec php php /var/www/html/migrate.php

define('MIGRATIONS_DIR', '/migrate');
define('DB_HOST',    getenv('DB_HOST')    ?: 'localhost');
define('DB_NAME',    getenv('DB_NAME')    ?: 'driveway_db');
define('DB_USER',    getenv('DB_USER')    ?: 'root');
define('DB_PASS',    getenv('DB_PASS')    ?: '');
define('DB_CHARSET', 'utf8mb4');

function migrate_log(string $msg): void {
    echo date('[Y-m-d H:i:s] ') . $msg . PHP_EOL;
}

function connect(int $attempts = 10, int $delay = 3): PDO {
    for ($i = 1; $i <= $attempts; $i++) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            migrate_log("Connected to database.");
            return $pdo;
        } catch (PDOException $e) {
            migrate_log("Attempt {$i}/{$attempts}: DB not ready — {$e->getMessage()}");
            if ($i < $attempts) sleep($delay);
        }
    }
    migrate_log("ERROR: Could not connect to database after {$attempts} attempts.");
    exit(1);
}

$pdo = connect();

// Создаём таблицу для отслеживания миграций
$pdo->exec("CREATE TABLE IF NOT EXISTS `migrations` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `filename`   VARCHAR(255) NOT NULL,
    `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_filename` (`filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Получаем уже применённые миграции
$applied = $pdo->query("SELECT filename FROM migrations")->fetchAll(PDO::FETCH_COLUMN);
$applied = array_flip($applied);

// Читаем файлы миграций
if (!is_dir(MIGRATIONS_DIR)) {
    migrate_log("ERROR: Migrations directory not found: " . MIGRATIONS_DIR);
    exit(1);
}

$files = glob(MIGRATIONS_DIR . '/*.sql');
if (empty($files)) {
    migrate_log("No migration files found in " . MIGRATIONS_DIR);
    exit(0);
}

sort($files);

$count = 0;
foreach ($files as $file) {
    $filename = basename($file);

    if (isset($applied[$filename])) {
        migrate_log("SKIP  {$filename}");
        continue;
    }

    migrate_log("RUN   {$filename}");

    $sql = file_get_contents($file);
    if ($sql === false) {
        migrate_log("ERROR: Cannot read {$filename}");
        exit(1);
    }

    try {
        $pdo->exec($sql);
        $pdo->prepare("INSERT INTO migrations (filename) VALUES (?)")->execute([$filename]);
        migrate_log("DONE  {$filename}");
        $count++;
    } catch (PDOException $e) {
        migrate_log("ERROR in {$filename}: " . $e->getMessage());
        exit(1);
    }
}

migrate_log("Migrations complete. Applied: {$count}, skipped: " . (count($files) - $count) . ".");
