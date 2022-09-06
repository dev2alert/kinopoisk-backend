CREATE TABLE `movies` (
    `id` INT AUTO_INCREMENT,
    `name` VARCHAR(255),
    `desc` TEXT,
    `year-release` INT,
    PRIMARY KEY(`id`)  
);

CREATE TABLE `actors` (
    `id` INT AUTO_INCREMENT,
    `name` VARCHAR(255),
    `surname` VARCHAR(255),
    `patronymic` VARCHAR(255),
    `year-birth` INT,
    `gender` INT,
    PRIMARY KEY(`id`)
);

CREATE TABLE `movies-actors` (
    `id` INT AUTO_INCREMENT,
    `movie-id` INT,
    `actor-id` INT,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`movie-id`) REFERENCES movies(`id`) ON DELETE CASCADE,
    FOREIGN KEY(`actor-id`) REFERENCES actors(`id`) ON DELETE CASCADE
);

ALTER TABLE `movies` ADD `genre` VARCHAR(255);