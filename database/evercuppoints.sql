-- EvercupPoints - Coffee Shop Loyalty Membership Web Portal
-- MySQL schema export
--
-- The application creates these tables automatically on first run
-- (TypeORM synchronize). This file is provided as the SQL export
-- deliverable and can also be imported directly in phpMyAdmin.

CREATE DATABASE IF NOT EXISTS `evercuppoints`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `evercuppoints`;

-- ---------------------------------------------------------------
-- Table: staff_users
-- Staff and admin accounts that operate the system.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `staff_users` (
  `StaffID`      INT NOT NULL AUTO_INCREMENT,
  `Username`     VARCHAR(50)  NOT NULL,
  `PasswordHash` VARCHAR(255) NOT NULL,
  `FullName`     VARCHAR(100) NOT NULL,
  `Role`         VARCHAR(20)  NOT NULL DEFAULT 'Staff',
  `IsActive`     TINYINT(1)   NOT NULL DEFAULT 1,
  `DateCreated`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`StaffID`),
  UNIQUE KEY `UQ_staff_username` (`Username`),
  CONSTRAINT `CHK_staff_role` CHECK (`Role` IN ('Staff','Admin'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------
-- Table: customers
-- Loyalty members and their current points balance.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customers` (
  `CustomerID`     INT NOT NULL AUTO_INCREMENT,
  `FirstName`      VARCHAR(50)  NOT NULL,
  `LastName`       VARCHAR(50)  NOT NULL,
  `Email`          VARCHAR(100) NOT NULL,
  `ContactNumber`  VARCHAR(20)  NULL,
  `QRCode`         VARCHAR(100) NOT NULL,
  `PointsBalance`  INT          NOT NULL DEFAULT 0,
  `DateRegistered` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CustomerID`),
  UNIQUE KEY `UQ_customer_email`  (`Email`),
  UNIQUE KEY `UQ_customer_qrcode` (`QRCode`),
  CONSTRAINT `CHK_points_balance` CHECK (`PointsBalance` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------
-- Table: rewards
-- The catalog of rewards members can claim with points.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rewards` (
  `RewardID`       INT NOT NULL AUTO_INCREMENT,
  `RewardName`     VARCHAR(100) NOT NULL,
  `Description`    VARCHAR(255) NULL,
  `PointsRequired` INT          NOT NULL,
  `IsActive`       TINYINT(1)   NOT NULL DEFAULT 1,
  `DateCreated`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RewardID`),
  CONSTRAINT `CHK_points_required` CHECK (`PointsRequired` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------
-- Table: point_transactions
-- One row per verified purchase that awarded points.
-- ReceiptNumber is UNIQUE so the same receipt can never be claimed twice.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `point_transactions` (
  `TransactionID`   INT NOT NULL AUTO_INCREMENT,
  `CustomerID`      INT NOT NULL,
  `StaffID`         INT NOT NULL,
  `ReceiptNumber`   VARCHAR(50)    NOT NULL,
  `PurchaseAmount`  DECIMAL(10,2)  NOT NULL,
  `PointsEarned`    INT            NOT NULL,
  `TransactionDate` DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`TransactionID`),
  UNIQUE KEY `UQ_receipt_number` (`ReceiptNumber`),
  KEY `FK_tx_customer` (`CustomerID`),
  KEY `FK_tx_staff`    (`StaffID`),
  CONSTRAINT `FK_tx_customer` FOREIGN KEY (`CustomerID`)
    REFERENCES `customers` (`CustomerID`) ON DELETE CASCADE,
  CONSTRAINT `FK_tx_staff` FOREIGN KEY (`StaffID`)
    REFERENCES `staff_users` (`StaffID`),
  CONSTRAINT `CHK_purchase_amount` CHECK (`PurchaseAmount` > 0),
  CONSTRAINT `CHK_points_earned`   CHECK (`PointsEarned` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------
-- Table: redemptions
-- One row per reward claimed with points.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `redemptions` (
  `RedemptionID`   INT NOT NULL AUTO_INCREMENT,
  `CustomerID`     INT NOT NULL,
  `RewardID`       INT NOT NULL,
  `StaffID`        INT NOT NULL,
  `PointsUsed`     INT      NOT NULL,
  `RedemptionDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RedemptionID`),
  KEY `FK_rd_customer` (`CustomerID`),
  KEY `FK_rd_reward`   (`RewardID`),
  KEY `FK_rd_staff`    (`StaffID`),
  CONSTRAINT `FK_rd_customer` FOREIGN KEY (`CustomerID`)
    REFERENCES `customers` (`CustomerID`) ON DELETE CASCADE,
  CONSTRAINT `FK_rd_reward` FOREIGN KEY (`RewardID`)
    REFERENCES `rewards` (`RewardID`),
  CONSTRAINT `FK_rd_staff` FOREIGN KEY (`StaffID`)
    REFERENCES `staff_users` (`StaffID`),
  CONSTRAINT `CHK_points_used` CHECK (`PointsUsed` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------
-- Starting rewards catalog.
-- Staff accounts are NOT inserted here because passwords must be
-- hashed by the application. Run `npm run seed` in the backend
-- to create the admin and cashier accounts.
-- ---------------------------------------------------------------
INSERT INTO `rewards` (`RewardName`, `Description`, `PointsRequired`, `IsActive`) VALUES
  ('Free Brewed Coffee',   'One regular-size brewed coffee',      50,  1),
  ('Free Croissant',       'One butter croissant',                75,  1),
  ('Free Specialty Latte', 'One 16oz specialty latte of choice',  100, 1);
