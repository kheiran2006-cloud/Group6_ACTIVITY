CREATE DATABASE XAMPP;
USE XAMPP;

CREATE TABLE task (
	id INT AUTO_INCREMENT KEY,
    task_name VARCHAR (255) NOT NULL,
    task_description TEXT NOT NULL,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from task;