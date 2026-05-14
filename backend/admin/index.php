<?php
require_once '../config/auth.php';
require_once '../config/db.php';

if (!isLoggedIn() || empty($_SESSION['user_is_admin'])) {
    header('Location: ../index.php'); exit;
}

$db = Database::getInstance()->getConnection();

$totalProducts = (int)$db->query('SELECT COUNT(*) FROM products')->fetchColumn();
$totalUsers    = (int)$db->query('SELECT COUNT(*) FROM users WHERE is_admin = 0')->fetchColumn();
$outOfStock    = (int)$db->query('SELECT COUNT(*) FROM products WHERE quantity = 0')->fetchColumn();
$lowStock      = (int)$db->query('SELECT COUNT(*) FROM products WHERE quantity > 0 AND quantity < 5')->fetchColumn();
$totalValue    = (float)$db->query('SELECT COALESCE(SUM(price * quantity), 0) FROM products')->fetchColumn();
$inStock       = $totalProducts - $outOfStock;

$byCategory = $db->query('
    SELECT c.name, COUNT(p.id) as cnt, COALESCE(SUM(p.price * p.quantity), 0) as val
    FROM categories c LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id, c.name ORDER BY cnt DESC
')->fetchAll();
$maxCnt = max(array_column($byCategory, 'cnt') ?: [1]) ?: 1;

$lowStockList = $db->query('
    SELECT p.name, p.article, p.quantity, c.name as cat
    FROM products p JOIN categories c ON c.id = p.category_id
    WHERE p.quantity > 0 AND p.quantity < 5
    ORDER BY p.quantity ASC LIMIT 8
')->fetchAll();

$recentUsers = $db->query('
    SELECT id, email,
           TRIM(CONCAT(COALESCE(NULLIF(firstname,""),""), " ", COALESCE(NULLIF(lastname,""),""))),
           full_name, created_at
    FROM users WHERE is_admin = 0
    ORDER BY created_at DESC LIMIT 6
')->fetchAll(PDO::FETCH_NUM);

$recentUsersFmt = [];
foreach ($recentUsers as $u) {
    $name = trim($u[2]) ?: $u[3] ?: '—';
    $recentUsersFmt[] = ['email' => $u[1], 'name' => $name, 'created_at' => $u[4]];
}

function fmtMoney(float $v): string { return number_format($v, 0, '.', ' ') . ' ₽'; }
function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES); }

$adminName = trim($_SESSION['user_firstname'] . ' ' . $_SESSION['user_lastname']) ?: 'Администратор';
$adminInit = strtoupper(substr($_SESSION['user_firstname'] ?: 'A', 0, 1));
?>
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Дашборд — Driveway Admin</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="../css/admin.css">
</head>
<body class="admin-body">
<div class="admin-wrap">

<!-- ─── Sidebar ─────────────────────────────────────────────────────────── -->
<aside class="admin-sb">
    <div class="sb-logo">
        <div class="sb-logo-icon"><i class="fas fa-car-side"></i></div>
        <div>
            <div class="sb-logo-name">Driveway</div>
            <div class="sb-logo-sub">Панель управления</div>
        </div>
    </div>
    <nav class="sb-nav">
        <div class="sb-section">Главное</div>
        <a href="index.php" class="sb-item active"><i class="fas fa-chart-line"></i> Дашборд</a>
        <div class="sb-section">Каталог</div>
        <a href="products.php" class="sb-item"><i class="fas fa-boxes"></i> Товары</a>
        <div class="sb-section">Контент</div>
        <a href="reviews.php" class="sb-item"><i class="fas fa-star"></i> Отзывы и вопросы</a>
        <div class="sb-section">Экспорт</div>
        <a href="export.php?type=products" class="sb-item"><i class="fas fa-file-excel"></i> Экспорт товаров</a>
        <a href="export.php?type=users" class="sb-item"><i class="fas fa-file-csv"></i> Экспорт пользователей</a>
        <a href="export.php?type=stats" class="sb-item"><i class="fas fa-chart-bar"></i> Экспорт статистики</a>
        <div class="sb-section">Прочее</div>
<a href="../index.php" class="sb-item"><i class="fas fa-external-link-alt"></i> Перейти на сайт</a>
    </nav>
    <div class="sb-footer">
        <div class="sb-user">
            <div class="sb-avatar"><?= $adminInit ?></div>
            <div>
                <div class="sb-uname"><?= h($adminName) ?></div>
                <div class="sb-urole">Администратор</div>
            </div>
        </div>
        <a href="../api/auth.php?action=logout" class="sb-logout">
            <i class="fas fa-sign-out-alt"></i> Выйти
        </a>
    </div>
</aside>

<!-- ─── Main ─────────────────────────────────────────────────────────────── -->
<div class="admin-main">
    <header class="admin-topbar">
        <div>
            <div class="tb-title">Дашборд</div>
            <div class="tb-sub"><?= date('d F Y') ?></div>
        </div>
        <div class="tb-right">
            <a href="products.php?modal=add" class="btn btn-primary"><i class="fas fa-plus"></i> Добавить товар</a>
        </div>
    </header>

    <main class="admin-content">

        <!-- Статистика -->
        <div class="stats-grid">
            <div class="stat-card blue">
                <div class="stat-icon"><i class="fas fa-boxes"></i></div>
                <div>
                    <div class="stat-val"><?= $totalProducts ?></div>
                    <div class="stat-label">Всего товаров</div>
                </div>
            </div>
            <div class="stat-card green">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div>
                    <div class="stat-val"><?= $totalUsers ?></div>
                    <div class="stat-label">Пользователей</div>
                </div>
            </div>
            <div class="stat-card red">
                <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                <div>
                    <div class="stat-val"><?= $outOfStock ?></div>
                    <div class="stat-label">Нет в наличии</div>
                </div>
            </div>
            <div class="stat-card orange">
                <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div>
                    <div class="stat-val"><?= $lowStock ?></div>
                    <div class="stat-label">Заканчиваются (&lt; 5 шт.)</div>
                </div>
            </div>
        </div>

        <div class="dash-grid">

            <!-- Товары по категориям -->
            <div class="admin-card">
                <div class="card-head">
                    <div class="card-title"><i class="fas fa-chart-bar"></i> Товары по категориям</div>
                    <a href="export.php?type=stats" class="btn btn-secondary btn-sm"><i class="fas fa-download"></i> Скачать</a>
                </div>
                <div class="card-body">
                    <div class="cat-bars">
                        <?php foreach ($byCategory as $row): ?>
                        <div class="cat-bar-row">
                            <div class="cat-bar-label">
                                <?= h($row['name']) ?>
                                <span><?= $row['cnt'] ?> позиций · <?= fmtMoney($row['val']) ?></span>
                            </div>
                            <div class="cat-bar-track">
                                <div class="cat-bar-fill" style="width:<?= $maxCnt > 0 ? round($row['cnt']/$maxCnt*100) : 0 ?>%"></div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- Стоимость склада -->
            <div class="admin-card">
                <div class="card-head">
                    <div class="card-title"><i class="fas fa-ruble-sign"></i> Склад</div>
                </div>
                <div class="card-body" style="display:flex;align-items:center;justify-content:center;padding:36px 24px;">
                    <div style="text-align:center;width:100%;">
                        <div style="font-size:38px;font-weight:900;color:var(--primary);margin-bottom:6px;"><?= fmtMoney($totalValue) ?></div>
                        <div style="font-size:13px;color:var(--text-2);">Суммарная стоимость остатков</div>
                        <div style="display:flex;gap:32px;justify-content:center;margin-top:28px;">
                            <div style="text-align:center;">
                                <div style="font-size:26px;font-weight:800;color:var(--success);"><?= $inStock ?></div>
                                <div style="font-size:12px;color:var(--text-2);">Позиций в наличии</div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:26px;font-weight:800;color:var(--danger);"><?= $outOfStock ?></div>
                                <div style="font-size:12px;color:var(--text-2);">Нет в наличии</div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:26px;font-weight:800;color:var(--warning);"><?= $lowStock ?></div>
                                <div style="font-size:12px;color:var(--text-2);">Заканчиваются</div>
                            </div>
                        </div>
                        <div style="margin-top:24px;">
                            <a href="export.php?type=products" class="btn btn-primary" style="margin-right:8px;"><i class="fas fa-download"></i> Экспорт товаров</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Заканчивается товар -->
            <div class="admin-card">
                <div class="card-head">
                    <div class="card-title"><i class="fas fa-exclamation-triangle"></i> Заканчивается</div>
                    <a href="products.php" class="btn btn-secondary btn-sm">Все товары</a>
                </div>
                <?php if (empty($lowStockList)): ?>
                <div class="empty-state"><i class="fas fa-check-circle" style="color:var(--success);opacity:1;"></i><p>Все товары в достаточном количестве</p></div>
                <?php else: ?>
                <div class="tbl-wrap">
                    <table class="admin-tbl">
                        <thead><tr><th>Товар</th><th>Артикул</th><th>Кол-во</th></tr></thead>
                        <tbody>
                            <?php foreach ($lowStockList as $r): ?>
                            <tr>
                                <td><?= h($r['name']) ?><br><small style="color:var(--text-2)"><?= h($r['cat']) ?></small></td>
                                <td><code style="font-size:11px;"><?= h($r['article']) ?></code></td>
                                <td><span class="badge badge-danger"><?= $r['quantity'] ?> шт.</span></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php endif; ?>
            </div>

            <!-- Новые пользователи -->
            <div class="admin-card">
                <div class="card-head">
                    <div class="card-title"><i class="fas fa-user-plus"></i> Новые пользователи</div>
                    <a href="export.php?type=users" class="btn btn-secondary btn-sm"><i class="fas fa-download"></i> Экспорт</a>
                </div>
                <?php if (empty($recentUsersFmt)): ?>
                <div class="empty-state"><i class="fas fa-users"></i><p>Нет зарегистрированных пользователей</p></div>
                <?php else: ?>
                <div class="tbl-wrap">
                    <table class="admin-tbl">
                        <thead><tr><th>Пользователь</th><th>Email</th><th>Дата</th></tr></thead>
                        <tbody>
                            <?php foreach ($recentUsersFmt as $u): ?>
                            <tr>
                                <td>
                                    <div class="u-row">
                                        <div class="u-avatar"><?= strtoupper(substr($u['name'], 0, 1)) ?></div>
                                        <?= h($u['name']) ?>
                                    </div>
                                </td>
                                <td style="font-size:12px;"><?= h($u['email']) ?></td>
                                <td style="font-size:12px;white-space:nowrap;"><?= date('d.m.Y', strtotime($u['created_at'])) ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php endif; ?>
            </div>

        </div>
    </main>
</div>
</div>
</body>
</html>
