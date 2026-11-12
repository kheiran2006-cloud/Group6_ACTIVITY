<?php

    $db_server = "127.0.0.1";
    $db_username = "root";
    $db_password = "Scoreboard";
    $db_port = 3306;
    $db_name = "XAMPP";
    
try {
        $pdo = new PDO ("mysql:host=$db_server;
                        port=$db_port;
                        dbname=$db_name", 
                        $db_username, 
                        $db_password);

        $pdo->setAttribute (PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute (PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die ("Connection failed: " . $e->getMessage());
}


?>