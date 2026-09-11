<?php
require __DIR__ . '/config.php';

date_default_timezone_set('Africa/Dar_es_Salaam');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function sendJson($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function databaseDateTime($value) {
    if ($value === null || $value === '') {
        return null;
    }

    try {
        $date = new DateTime((string)$value);
        $date->setTimezone(new DateTimeZone('Africa/Dar_es_Salaam'));
        return $date->format('Y-m-d H:i:s');
    } catch (Exception $e) {
        return date('Y-m-d H:i:s');
    }
}

// "route" inatolewa na .htaccess (mfano: users, experts, visitors, auth/login)
// Hii inafanya API ifanye kazi bila kujali jina la folda ndani ya htdocs
// (mfano: htdocs/api au htdocs/visitors/api zote zitafanya kazi).
$uri = $_GET['route'] ?? '';
$parts = array_values(array_filter(explode('/', trim($uri, '/')), fn($p) => $p !== ''));

if (count($parts) < 1) {
    sendJson(['message' => 'Not found'], 404);
}

$resource = $parts[0];
$allowedResources = ['users', 'experts', 'visitors'];

if ($resource === 'auth' && isset($parts[1]) && $parts[1] === 'login') {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = strtolower(trim((string)($input['username'] ?? '')));
    $password = (string)($input['password'] ?? '');

    $pdo = getDatabaseConnection();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE LOWER(username) = :username AND password = :password LIMIT 1');
    $stmt->execute([':username' => $username, ':password' => $password]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJson(['message' => 'Invalid username or password'], 401);
    }

    $token = bin2hex(random_bytes(24));
    sendJson([
        'token' => $token,
        'userId' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'name' => $user['fullname'],
    ]);
}

if (!in_array($resource, $allowedResources, true)) {
    sendJson(['message' => 'Resource not found'], 404);
}

$pdo = getDatabaseConnection();

// Keep compatibility with older MySQL installations that still use integer IDs.
foreach (['users', 'experts', 'visitors'] as $idTable) {
    $column = $pdo->prepare(
        'SELECT DATA_TYPE FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table_name AND COLUMN_NAME = "id"'
    );
    $column->execute([':table_name' => $idTable]);
    $dataType = $column->fetchColumn();

    if ($dataType && in_array(strtolower($dataType), ['tinyint', 'smallint', 'mediumint', 'int', 'bigint'], true)) {
        $pdo->exec("ALTER TABLE `{$idTable}` MODIFY id VARCHAR(64) NOT NULL");
    }
}

$table = $resource;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM {$table} ORDER BY 1");
        sendJson($stmt->fetchAll());
        break;

    case 'POST':
        $payload = json_decode(file_get_contents('php://input'), true);
        if (!is_array($payload)) {
            sendJson(['message' => 'Invalid payload'], 400);
        }

        if ($table === 'users') {
            $stmt = $pdo->prepare('INSERT INTO users (id, fullname, username, password, role, created_at) VALUES (:id, :fullname, :username, :password, :role, NOW())');
            $stmt->execute([
                ':id' => $payload['id'] ?? bin2hex(random_bytes(6)),
                ':fullname' => $payload['fullname'] ?? '',
                ':username' => $payload['username'] ?? '',
                ':password' => $payload['password'] ?? '',
                ':role' => $payload['role'] ?? 'receptionist',
            ]);
        } elseif ($table === 'experts') {
            $stmt = $pdo->prepare('INSERT INTO experts (id, fullname, department) VALUES (:id, :fullname, :department)');
            $stmt->execute([
                ':id' => $payload['id'] ?? bin2hex(random_bytes(6)),
                ':fullname' => $payload['fullname'] ?? '',
                ':department' => $payload['department'] ?? '',
            ]);
        } elseif ($table === 'visitors') {
            $stmt = $pdo->prepare('INSERT INTO visitors (id, fullName, email, phone, company, idType, idNumber, expertId, personToVisit, purpose, recordedBy, checkInDate, checkOutDate) VALUES (:id, :fullName, :email, :phone, :company, :idType, :idNumber, :expertId, :personToVisit, :purpose, :recordedBy, :checkInDate, :checkOutDate)');
            $stmt->execute([
                ':id' => $payload['id'] ?? bin2hex(random_bytes(6)),
                ':fullName' => $payload['fullName'] ?? '',
                ':email' => $payload['email'] ?? null,
                ':phone' => $payload['phone'] ?? '',
                ':company' => $payload['company'] ?? null,
                ':idType' => $payload['idType'] ?? null,
                ':idNumber' => $payload['idNumber'] ?? null,
                ':expertId' => $payload['expertId'] ?? null,
                ':personToVisit' => $payload['personToVisit'] ?? null,
                ':purpose' => $payload['purpose'] ?? '',
                ':recordedBy' => $payload['recordedBy'] ?? null,
                ':checkInDate' => databaseDateTime($payload['checkInDate'] ?? null) ?? date('Y-m-d H:i:s'),
                ':checkOutDate' => databaseDateTime($payload['checkOutDate'] ?? null),
            ]);
        }

        sendJson($payload, 201);
        break;

    case 'PUT':
        $payload = json_decode(file_get_contents('php://input'), true);
        if (!is_array($payload)) {
            sendJson(['message' => 'Invalid payload'], 400);
        }

        if (array_is_list($payload)) {
            $pdo->exec("DELETE FROM {$table}");

            foreach ($payload as $row) {
                if (!$row || !is_array($row)) {
                    continue;
                }

                if ($table === 'users') {
                    $stmt = $pdo->prepare('INSERT INTO users (id, fullname, username, password, role, created_at) VALUES (:id, :fullname, :username, :password, :role, NOW())');
                    $stmt->execute([
                        ':id' => $row['id'] ?? bin2hex(random_bytes(6)),
                        ':fullname' => $row['fullname'] ?? '',
                        ':username' => $row['username'] ?? '',
                        ':password' => $row['password'] ?? '',
                        ':role' => $row['role'] ?? 'receptionist',
                    ]);
                } elseif ($table === 'experts') {
                    $stmt = $pdo->prepare('INSERT INTO experts (id, fullname, department) VALUES (:id, :fullname, :department)');
                    $stmt->execute([
                        ':id' => $row['id'] ?? bin2hex(random_bytes(6)),
                        ':fullname' => $row['fullname'] ?? '',
                        ':department' => $row['department'] ?? '',
                    ]);
                } elseif ($table === 'visitors') {
                    $stmt = $pdo->prepare('INSERT INTO visitors (id, fullName, email, phone, company, idType, idNumber, expertId, personToVisit, purpose, recordedBy, checkInDate, checkOutDate) VALUES (:id, :fullName, :email, :phone, :company, :idType, :idNumber, :expertId, :personToVisit, :purpose, :recordedBy, :checkInDate, :checkOutDate)');
                    $stmt->execute([
                        ':id' => $row['id'] ?? bin2hex(random_bytes(6)),
                        ':fullName' => $row['fullName'] ?? '',
                        ':email' => $row['email'] ?? null,
                        ':phone' => $row['phone'] ?? '',
                        ':company' => $row['company'] ?? null,
                        ':idType' => $row['idType'] ?? null,
                        ':idNumber' => $row['idNumber'] ?? null,
                        ':expertId' => $row['expertId'] ?? null,
                        ':personToVisit' => $row['personToVisit'] ?? null,
                        ':purpose' => $row['purpose'] ?? '',
                        ':recordedBy' => $row['recordedBy'] ?? null,
                        ':checkInDate' => databaseDateTime($row['checkInDate'] ?? null) ?? date('Y-m-d H:i:s'),
                        ':checkOutDate' => databaseDateTime($row['checkOutDate'] ?? null),
                    ]);
                }
            }

            sendJson($payload);
        }

        if ($table === 'users') {
            $stmt = $pdo->prepare('UPDATE users SET fullname = :fullname, username = :username, password = :password, role = :role WHERE id = :id');
            $stmt->execute([
                ':id' => $payload['id'],
                ':fullname' => $payload['fullname'] ?? '',
                ':username' => $payload['username'] ?? '',
                ':password' => $payload['password'] ?? '',
                ':role' => $payload['role'] ?? 'receptionist',
            ]);
        } elseif ($table === 'experts') {
            $stmt = $pdo->prepare('UPDATE experts SET fullname = :fullname, department = :department WHERE id = :id');
            $stmt->execute([
                ':id' => $payload['id'],
                ':fullname' => $payload['fullname'] ?? '',
                ':department' => $payload['department'] ?? '',
            ]);
        } elseif ($table === 'visitors') {
            $stmt = $pdo->prepare('UPDATE visitors SET fullName = :fullName, email = :email, phone = :phone, company = :company, idType = :idType, idNumber = :idNumber, expertId = :expertId, personToVisit = :personToVisit, purpose = :purpose, recordedBy = :recordedBy, checkInDate = :checkInDate, checkOutDate = :checkOutDate WHERE id = :id');
            $stmt->execute([
                ':id' => $payload['id'],
                ':fullName' => $payload['fullName'] ?? '',
                ':email' => $payload['email'] ?? null,
                ':phone' => $payload['phone'] ?? '',
                ':company' => $payload['company'] ?? null,
                ':idType' => $payload['idType'] ?? null,
                ':idNumber' => $payload['idNumber'] ?? null,
                ':expertId' => $payload['expertId'] ?? null,
                ':personToVisit' => $payload['personToVisit'] ?? null,
                ':purpose' => $payload['purpose'] ?? '',
                ':recordedBy' => $payload['recordedBy'] ?? null,
                ':checkInDate' => databaseDateTime($payload['checkInDate'] ?? null) ?? date('Y-m-d H:i:s'),
                ':checkOutDate' => databaseDateTime($payload['checkOutDate'] ?? null),
            ]);
        }

        sendJson($payload);
        break;

    case 'DELETE':
        $payload = json_decode(file_get_contents('php://input'), true);
        $id = $payload['id'] ?? null;
        if (!$id) {
            sendJson(['message' => 'Missing id'], 400);
        }

        $stmt = $pdo->prepare("DELETE FROM {$table} WHERE id = :id");
        $stmt->execute([':id' => $id]);
        sendJson(['deleted' => true, 'id' => $id]);
        break;

    default:
        sendJson(['message' => 'Method not allowed'], 405);
}
