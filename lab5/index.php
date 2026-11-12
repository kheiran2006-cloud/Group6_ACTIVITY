<?php

require_once "database.php";


$add = "INSERT INTO task (task_name, task_description) VALUES (:name, :description)";


if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $delete = $_POST['delete'] ?? null;   // null if the delete button wasn't clicked //

    // DELETE //
    if ($delete !== null) {
        $smtm = $pdo->prepare("DELETE FROM task WHERE id = :id");
        $smtm->execute([':id' => $delete]);
    }

    // ADD //
    else {
        $name = $_POST['task_name'] ?? '';
        $description = $_POST['task_description'] ?? '';

        if ($name !== '' && $description !== '') {
            $smtm = $pdo->prepare($add);
            $smtm->execute([':name' => $name, ':description' => $description]);
        }
    }

    // UPDATE //

    if (isset($_POST['status'])) {
        header('Content-Type: application/json');

        $id     = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT);
        $status = $_POST['status'];

        if ($id === false || !in_array($status, ['pending', 'completed'], true)) {
            http_response_code(400);
            exit(json_encode(['ok' => false]));
        }

        $stmt = $pdo->prepare("UPDATE task SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $id]);

        exit(json_encode(['ok' => true]));   // no redirect here
    }

    // Redirect so refreshing the page doesn't resubmit the form // 
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

$tasks = $pdo->query("SELECT * FROM task")->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Task</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <form action="index.php" method="POST">

        <!-- Task Name -->
        <label for="task_name">Task Name:</label>
        <input type="text" name="task_name" id="task_name" required>
        <br>

        <!-- Task Description -->
        <label for="task_description">Task Description:</label>
        <textarea name="task_description" id="task_description" required></textarea>
        <br>

        <button type="submit">Add Task</button>
    </form>

    <ol>
        <?php foreach ( $tasks as $task ): ?>
            <li data-id="<?= $task['id'] ?>" data-status="<?= $task['status'] ?>">
                <?= $task['task_name'] ?>: <?= $task['task_description'] ?>

                <form action="" method="POST" style="display:inline;">
                    <button type="submit" name="delete" value="<?= $task['id'] ?>">Delete</button>
                </form>
            </li>
        <?php endforeach; ?>
    </ol>

    <script src="script.js"></script>
</body>
</html>

