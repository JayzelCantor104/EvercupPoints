-- EvercupPoints database (ITEC 116 Final Project)
-- tables: staff_users, customers, rewards, point_transactions, redemptions
-- includes some demo data
--
-- import in phpMyAdmin, it creates the evercuppoints database
-- note: this replaces the tables if they already exist
--
-- demo logins: admin / admin123, cashier / cashier123

CREATE DATABASE IF NOT EXISTS `evercuppoints`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `evercuppoints`;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customers` (
  `CustomerID` int(11) NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `ContactNumber` varchar(20) DEFAULT NULL,
  `QRCode` varchar(100) NOT NULL,
  `PointsBalance` int(11) NOT NULL DEFAULT 0,
  `DateRegistered` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`CustomerID`),
  UNIQUE KEY `UQ_customer_qrcode` (`QRCode`),
  UNIQUE KEY `UQ_customer_email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Ana','Santos','ana.santos@example.com','09171234567','EVC-0001-7DE5',55,'2026-11-27 01:13:46.072478'),(2,'Miguel','Reyes','miguel.reyes@example.com',NULL,'EVC-0002-E27D',27,'2026-11-27 01:13:46.312850'),(3,'Bea','Cruz','bea.cruz@example.com','09281112233','EVC-0003-46D4',15,'2026-11-27 01:13:46.543838');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `point_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `point_transactions` (
  `TransactionID` int(11) NOT NULL AUTO_INCREMENT,
  `CustomerID` int(11) NOT NULL,
  `StaffID` int(11) NOT NULL,
  `ReceiptNumber` varchar(50) NOT NULL,
  `PurchaseAmount` decimal(10,2) NOT NULL,
  `PointsEarned` int(11) NOT NULL,
  `TransactionDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`TransactionID`),
  UNIQUE KEY `UQ_receipt_number` (`ReceiptNumber`),
  KEY `FK_tx_customer` (`CustomerID`),
  KEY `FK_tx_staff` (`StaffID`),
  CONSTRAINT `FK_tx_customer` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_tx_staff` FOREIGN KEY (`StaffID`) REFERENCES `staff_users` (`StaffID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `point_transactions` WRITE;
/*!40000 ALTER TABLE `point_transactions` DISABLE KEYS */;
INSERT INTO `point_transactions` VALUES (1,1,2,'OR-2026-004901',450.00,45,'2026-11-27 01:13:46.713580'),(2,1,2,'OR-2026-004917',320.00,32,'2026-11-27 01:13:46.874805'),(3,1,1,'OR-2026-004958',280.00,28,'2026-11-27 01:13:47.008536'),(4,2,2,'OR-2026-004923',180.00,18,'2026-11-27 01:13:47.150525'),(5,2,2,'OR-2026-004966',95.50,9,'2026-11-27 01:13:47.286493'),(6,3,1,'OR-2026-004940',650.00,65,'2026-11-27 01:13:47.433044');
/*!40000 ALTER TABLE `point_transactions` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `redemptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `redemptions` (
  `RedemptionID` int(11) NOT NULL AUTO_INCREMENT,
  `CustomerID` int(11) NOT NULL,
  `RewardID` int(11) NOT NULL,
  `StaffID` int(11) NOT NULL,
  `PointsUsed` int(11) NOT NULL,
  `RedemptionDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`RedemptionID`),
  KEY `FK_rd_customer` (`CustomerID`),
  KEY `FK_rd_reward` (`RewardID`),
  KEY `FK_rd_staff` (`StaffID`),
  CONSTRAINT `FK_rd_customer` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_rd_reward` FOREIGN KEY (`RewardID`) REFERENCES `rewards` (`RewardID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_rd_staff` FOREIGN KEY (`StaffID`) REFERENCES `staff_users` (`StaffID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `redemptions` WRITE;
/*!40000 ALTER TABLE `redemptions` DISABLE KEYS */;
INSERT INTO `redemptions` VALUES (1,1,1,2,50,'2026-11-27 01:13:47.830978'),(2,3,1,2,50,'2026-11-27 01:13:47.998787');
/*!40000 ALTER TABLE `redemptions` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rewards` (
  `RewardID` int(11) NOT NULL AUTO_INCREMENT,
  `RewardName` varchar(100) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `PointsRequired` int(11) NOT NULL,
  `IsActive` tinyint(4) NOT NULL DEFAULT 1,
  `DateCreated` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`RewardID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `rewards` WRITE;
/*!40000 ALTER TABLE `rewards` DISABLE KEYS */;
INSERT INTO `rewards` VALUES (1,'Free Brewed Coffee','One regular-size brewed coffee',50,1,'2026-11-27 01:13:31.547214'),(2,'Free Specialty Latte','One 16oz specialty latte of choice',100,1,'2026-11-27 01:13:31.554877'),(3,'Free Croissant','One butter croissant',75,1,'2026-11-27 01:13:31.562121');
/*!40000 ALTER TABLE `rewards` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `staff_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_users` (
  `StaffID` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Role` varchar(20) NOT NULL DEFAULT 'Staff',
  `IsActive` tinyint(4) NOT NULL DEFAULT 1,
  `DateCreated` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`StaffID`),
  UNIQUE KEY `UQ_staff_username` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `staff_users` WRITE;
/*!40000 ALTER TABLE `staff_users` DISABLE KEYS */;
INSERT INTO `staff_users` VALUES (1,'admin','$2a$10$3Q7OuUVmftX4dcohZWd.eO7ntpEupci8MFt9wtqB1okl/W7GZMGne','Jayzel Cantor','Admin',1,'2026-11-27 01:13:31.321688'),(2,'cashier','$2a$10$5DS3kRESkuWrKe.Llsqc7ORwxZiDsUw1V7PanJ1OFEWBHwYCLtr6W','Mark Lopez','Staff',1,'2026-11-27 01:13:31.531599');
/*!40000 ALTER TABLE `staff_users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


-- check constraints
-- (typeorm can't create these on mysql so they are added here,
-- the api also validates the same rules)
ALTER TABLE `staff_users`
  ADD CONSTRAINT `CHK_staff_role` CHECK (`Role` IN ('Staff','Admin'));
ALTER TABLE `customers`
  ADD CONSTRAINT `CHK_points_balance` CHECK (`PointsBalance` >= 0);
ALTER TABLE `rewards`
  ADD CONSTRAINT `CHK_points_required` CHECK (`PointsRequired` > 0);
ALTER TABLE `point_transactions`
  ADD CONSTRAINT `CHK_purchase_amount` CHECK (`PurchaseAmount` > 0),
  ADD CONSTRAINT `CHK_points_earned`   CHECK (`PointsEarned` >= 0);
ALTER TABLE `redemptions`
  ADD CONSTRAINT `CHK_points_used` CHECK (`PointsUsed` > 0);
