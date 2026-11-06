<?php
session_start();

$_SESSION['tasks'] ??= [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $delete = $_POST['delete'] ?? null;   // null if the delete button wasn't clicked //

    // DELETE //
    if ($delete !== null) {
        unset($_SESSION['tasks'][(int) $delete]);        // no warning if the key doesn't exist //
        $_SESSION['tasks'] = array_values($_SESSION['tasks']); // avoid gaps in the array incase //
    }

    // ADD //
    else {
        $name = $_POST['task_name'] ?? '';
        $description = $_POST['task_description'] ?? '';

        if ($name !== '' && $description !== '') {
            $_SESSION['tasks'][] = [$name, $description];
        }
    }

    // Redirect so refreshing the page doesn't resubmit the form // 
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}
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
        <?php foreach ($_SESSION['tasks'] as $index => $task): ?>
            <li>
                <?= $task[0]?>: <?= $task[1]?>

                <form action="" method="POST" style="display:inline;">
                    <button type="submit" name="delete" value="<?= $index ?>">Delete</button>
                </form>
            </li>
        <?php endforeach; ?>
    </ol>

    <script src="script.js"></script>
</body>
</html>

