-- ============================================================
--  SpaceSync — Database Schema (MySQL 8)
--  CSE 362 Lab Final · Jahangirnagar University
--
--  This DDL reflects what Sequelize creates via sync() when the
--  backend seed is run with:
--      npm run seed:reset
--
--  You do NOT need to run this file manually — it's provided as
--  a reference for the viva / report.
-- ============================================================

CREATE DATABASE IF NOT EXISTS `spacesync`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `spacesync`;

-- ------------------------------------------------------------
-- Drop existing tables (order matters for FKs)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `early_releases`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `resources`;

-- ------------------------------------------------------------
-- Table: resources
-- ------------------------------------------------------------

CREATE TABLE `resources` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(120) NOT NULL,
  `type`       ENUM('Room','Equipment') NOT NULL,
  `capacity`   INT UNSIGNED NOT NULL,
  `facilities` VARCHAR(255) DEFAULT NULL
               COMMENT 'Comma-separated, e.g. "Projector, Whiteboard, 60+ PCs, AC"',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_resources_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: users  (declared BEFORE bookings because bookings.user_id references it)
-- ------------------------------------------------------------
CREATE TABLE `users` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(120) NOT NULL,
  `email`         VARCHAR(160) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt, 10 rounds',
  `role`          ENUM('Student','Teacher','Staff','ClassRep','Admin') NOT NULL DEFAULT 'Student',
  `department`    VARCHAR(80)  NOT NULL DEFAULT 'CSE',
  `identifier`    VARCHAR(60)  DEFAULT NULL COMMENT 'Student ID or Employee ID',
  `reward_points` INT UNSIGNED NOT NULL DEFAULT 0,
  `status`        ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending'
                   COMMENT 'Admin-approval lifecycle; only Approved can log in',
  `created_at`    DATETIME     NOT NULL,
  `updated_at`    DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: bookings
-- ------------------------------------------------------------
CREATE TABLE `bookings` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `resource_id`  INT UNSIGNED NOT NULL,
  `user_id`      INT UNSIGNED DEFAULT NULL COMMENT 'Owner — required via API, nullable for legacy rows',
  `requested_by` VARCHAR(120) NOT NULL,
  `booking_date` DATE         NOT NULL,
  `start_time`   TIME         NOT NULL,
  `end_time`     TIME         NOT NULL,
  `purpose`      ENUM('Class','Lab','Seminar','Meeting','Exam','Other')
                 NOT NULL DEFAULT 'Class',
  `status`       VARCHAR(30)  NOT NULL DEFAULT 'Confirmed',
  `created_at`   DATETIME     NOT NULL,
  `updated_at`   DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_bookings_resource_date` (`resource_id`, `booking_date`),
  KEY `ix_bookings_user` (`user_id`),
  CONSTRAINT `fk_bookings_resource`
    FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: early_releases
-- Records that a booking ended earlier than scheduled.
-- Awards `points_awarded` reward points to the reporting user.
-- ------------------------------------------------------------
CREATE TABLE `early_releases` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_id`     INT UNSIGNED NOT NULL,
  `reporter_id`    INT UNSIGNED NOT NULL,
  `released_at`    TIME         NOT NULL,
  `note`           VARCHAR(200) DEFAULT NULL,
  `points_awarded` INT UNSIGNED NOT NULL DEFAULT 10,
  `created_at`     DATETIME     NOT NULL,
  `updated_at`     DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_early_releases_booking` (`booking_id`),
  CONSTRAINT `fk_early_releases_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_early_releases_reporter`
    FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed data (subset — full list is in backend/src/seeders/seed.js)
-- ============================================================
INSERT INTO `resources` (`name`, `type`, `capacity`, `facilities`, `created_at`, `updated_at`) VALUES
  ('Classroom 101',                'Room',      60, 'Projector, Whiteboard, AC, 60 seats',              NOW(), NOW()),
  ('Classroom 102',                'Room',      60, 'Projector, Whiteboard, AC, 60 seats',              NOW(), NOW()),
  ('Classroom 103',                'Room',      60, 'Projector, Whiteboard, AC, 60 seats',              NOW(), NOW()),
  ('Computer Lab 201',             'Room',      60, 'Projector, Whiteboard, 60+ PCs, AC, LAN',          NOW(), NOW()),
  ('Computer Lab 202',             'Room',      60, 'Projector, Whiteboard, 60+ PCs, AC, LAN',          NOW(), NOW()),
  ('Seminar Library',              'Room',      40, 'Projector, Whiteboard, Books, Study tables, AC',   NOW(), NOW()),
  ('Seminar Room / Exam Room 202', 'Room',      80, 'Projector, Whiteboard, AC, Exam desks',            NOW(), NOW()),
  ('Research Lab (4th Floor)',     'Room',      25, 'Workstations, Projector, Whiteboard, AC',          NOW(), NOW()),
  ('Faculty Meeting Room',         'Room',      15, 'TV, Whiteboard, AC, Conference table',             NOW(), NOW()),
  ('Portable Sound System',        'Equipment',  1, 'Wireless mics, Speakers, Mixer',                   NOW(), NOW()),
  ('DSLR Camera Kit',              'Equipment',  1, 'Canon DSLR, Lenses, Tripod, SD cards',             NOW(), NOW()),
  ('Mobile Whiteboard Set',        'Equipment',  1, '2 rolling whiteboards, markers',                   NOW(), NOW());

-- ============================================================
-- Overlap rule enforced in application code
-- (backend/src/controllers/bookings.controller.js):
--
--   Two bookings for the SAME resource_id and booking_date are
--   considered overlapping iff:
--       existing.start_time < new.end_time
--   AND existing.end_time   > new.start_time
--
-- i.e. ranges [a,b) and [c,d) overlap iff a < d AND c < b.
-- Back-to-back slots (10:30–12:00 right after 09:00–10:30) are OK.
-- ============================================================
