-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: animal_shelter
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS animal_shelter;
USE animal_shelter;

--
-- Table structure for table `adopter`
--

DROP TABLE IF EXISTS `adopter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adopter` (
  `Adopter_ID` varchar(10) NOT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Experience` varchar(50) DEFAULT NULL,
  `Street_Name` varchar(100) DEFAULT NULL,
  `City` varchar(100) DEFAULT NULL,
  `State` varchar(100) DEFAULT NULL,
  `Password` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`Adopter_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adopter`
--

LOCK TABLES `adopter` WRITE;
/*!40000 ALTER TABLE `adopter` DISABLE KEYS */;
INSERT INTO `adopter` VALUES ('A001','Priya Kulkarni','9823456710','priya@gmail.com','2 years','JM Road','Pune','Maharashtra','priya123'),('A002','Rahul Desai','9712345678','rahul@gmail.com','None','FC Road','Mumbai','Maharashtra','rahul123'),('A003','Sneha Joshi','9634512780','sneha@gmail.com','1 year','MG Road','Nashik','Maharashtra','sneha123');
/*!40000 ALTER TABLE `adopter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adoption_application`
--

DROP TABLE IF EXISTS `adoption_application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adoption_application` (
  `Application_ID` varchar(10) NOT NULL,
  `Application_Date` date DEFAULT NULL,
  `Status` varchar(100) DEFAULT NULL,
  `Interview_Date` date DEFAULT NULL,
  `Pet_ID` varchar(10) DEFAULT NULL,
  `Adopter_ID` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`Application_ID`),
  KEY `Pet_ID` (`Pet_ID`),
  KEY `Adopter_ID` (`Adopter_ID`),
  CONSTRAINT `adoption_application_ibfk_1` FOREIGN KEY (`Pet_ID`) REFERENCES `pet` (`Pet_ID`),
  CONSTRAINT `adoption_application_ibfk_2` FOREIGN KEY (`Adopter_ID`) REFERENCES `adopter` (`Adopter_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adoption_application`
--

LOCK TABLES `adoption_application` WRITE;
/*!40000 ALTER TABLE `adoption_application` DISABLE KEYS */;
INSERT INTO `adoption_application` VALUES ('APP01','2025-04-01','Approved','2025-04-10','P001','A001'),('APP02','2025-04-05','Pending','2025-04-15','P002','A002'),('APP03','2025-04-08','Rejected','2025-04-18','P003','A003');
/*!40000 ALTER TABLE `adoption_application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cares_for`
--

DROP TABLE IF EXISTS `cares_for`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cares_for` (
  `Volunteer_ID` varchar(10) NOT NULL,
  `Pet_ID` varchar(10) NOT NULL,
  `Assigned_Task` varchar(200) DEFAULT NULL,
  `Start_Date` date DEFAULT NULL,
  `End_Date` date DEFAULT NULL,
  PRIMARY KEY (`Volunteer_ID`,`Pet_ID`),
  KEY `Pet_ID` (`Pet_ID`),
  CONSTRAINT `cares_for_ibfk_1` FOREIGN KEY (`Volunteer_ID`) REFERENCES `volunteer` (`Volunteer_ID`),
  CONSTRAINT `cares_for_ibfk_2` FOREIGN KEY (`Pet_ID`) REFERENCES `pet` (`Pet_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cares_for`
--

LOCK TABLES `cares_for` WRITE;
/*!40000 ALTER TABLE `cares_for` DISABLE KEYS */;
INSERT INTO `cares_for` VALUES ('VOL001','P001','Feeding and Walking','2025-01-15','2025-03-31'),('VOL002','P002','Grooming','2025-02-20','2025-05-31'),('VOL003','P003','Feeding and Medication','2025-03-25','2025-07-31');
/*!40000 ALTER TABLE `cares_for` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donates`
--

DROP TABLE IF EXISTS `donates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donates` (
  `Donation_ID` varchar(10) NOT NULL,
  `Donor_ID` varchar(10) DEFAULT NULL,
  `Shelter_ID` varchar(10) DEFAULT NULL,
  `Amount` int DEFAULT NULL,
  `Date` date DEFAULT NULL,
  `Purpose` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`Donation_ID`),
  KEY `Donor_ID` (`Donor_ID`),
  KEY `Shelter_ID` (`Shelter_ID`),
  CONSTRAINT `donates_ibfk_1` FOREIGN KEY (`Donor_ID`) REFERENCES `donor` (`Donor_ID`),
  CONSTRAINT `donates_ibfk_2` FOREIGN KEY (`Shelter_ID`) REFERENCES `shelter` (`Shelter_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donates`
--

LOCK TABLES `donates` WRITE;
/*!40000 ALTER TABLE `donates` DISABLE KEYS */;
INSERT INTO `donates` VALUES ('DON001','D001','SH001',5000,'2025-01-15','Food and Supplies'),('DON002','D002','SH002',10000,'2025-02-20','Medical Expenses'),('DON003','D003','SH003',7500,'2025-03-25','Infrastructure');
/*!40000 ALTER TABLE `donates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donor`
--

DROP TABLE IF EXISTS `donor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donor` (
  `Donor_ID` varchar(10) NOT NULL,
  `Donor_Name` varchar(100) DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Donor_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donor`
--

LOCK TABLES `donor` WRITE;
/*!40000 ALTER TABLE `donor` DISABLE KEYS */;
INSERT INTO `donor` VALUES ('D001','Amit Verma','9811223344','amit@gmail.com'),('D002','Sunita Rao','9733445566','sunita@gmail.com'),('D003','Vijay Malhotra','9655667788','vijay@gmail.com');
/*!40000 ALTER TABLE `donor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_record`
--

DROP TABLE IF EXISTS `medical_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_record` (
  `Record_ID` varchar(10) NOT NULL,
  `Vet_Name` varchar(100) DEFAULT NULL,
  `Treatment_Details` varchar(200) DEFAULT NULL,
  `Checkup_Date` date DEFAULT NULL,
  `Vaccine_Name` varchar(100) DEFAULT NULL,
  `Pet_ID` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`Record_ID`),
  KEY `Pet_ID` (`Pet_ID`),
  CONSTRAINT `medical_record_ibfk_1` FOREIGN KEY (`Pet_ID`) REFERENCES `pet` (`Pet_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_record`
--

LOCK TABLES `medical_record` WRITE;
/*!40000 ALTER TABLE `medical_record` DISABLE KEYS */;
INSERT INTO `medical_record` VALUES ('MR001','Dr.Sharma','General Checkup','2025-03-01','Rabies','P001'),('MR002','Dr.Mehta','Eye infection treatment','2025-03-05','FVRCP','P002'),('MR003','Dr.Sharma','Nutritional supplement course','2025-04-10','Not Given','P003');
/*!40000 ALTER TABLE `medical_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pet`
--

DROP TABLE IF EXISTS `pet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pet` (
  `Pet_ID` varchar(10) NOT NULL,
  `Pet_Name` varchar(100) DEFAULT NULL,
  `Species` varchar(100) DEFAULT NULL,
  `Breed` varchar(100) DEFAULT NULL,
  `Age` int DEFAULT NULL,
  `Gender` varchar(10) DEFAULT NULL,
  `Rescue_Date` date DEFAULT NULL,
  `Adoption_status` varchar(100) DEFAULT NULL,
  `Shelter_ID` varchar(10) DEFAULT NULL,
  `Image_URL` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`Pet_ID`),
  KEY `Shelter_ID` (`Shelter_ID`),
  CONSTRAINT `pet_ibfk_1` FOREIGN KEY (`Shelter_ID`) REFERENCES `shelter` (`Shelter_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pet`
--

LOCK TABLES `pet` WRITE;
/*!40000 ALTER TABLE `pet` DISABLE KEYS */;
INSERT INTO `pet` VALUES ('P001','Bruno','Dog','Pug',3,'Male','2025-01-10','Available','SH001','https://images.unsplash.com/photo-1583337130417-334622a1d47f?w=600&q=80'),('P002','Whiskers','Cat','Persian cat',2,'Female','2025-02-15','Adopted','SH002','https://images.unsplash.com/photo-1574158622686-e22e9961099d?w=600&q=80'),('P003','Goldie','Rabbit',NULL,1,'Female','2025-03-20','Available','SH003','https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&q=80'),('P004','Leo','Dog','Beagle',2,'Male','2025-04-01','Available','SH001','https://images.unsplash.com/photo-1505628346881-b72c2622f88b?w=600&q=80');
/*!40000 ALTER TABLE `pet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shelter`
--

DROP TABLE IF EXISTS `shelter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shelter` (
  `Shelter_ID` varchar(10) NOT NULL,
  `Shelter_Name` varchar(200) DEFAULT NULL,
  `Address` varchar(200) DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Capacity` int DEFAULT NULL,
  PRIMARY KEY (`Shelter_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shelter`
--

LOCK TABLES `shelter` WRITE;
/*!40000 ALTER TABLE `shelter` DISABLE KEYS */;
INSERT INTO `shelter` VALUES ('SH001','Happy Paws Shelter','12,MG Road,Pune','9876543210',50),('SH002','Safe Haven Animal Home','45 FC Road,Mumbai','9123456780',80),('SH003','Furry Friends Rescue','78 Camp, Nashik','9988776655',30);
/*!40000 ALTER TABLE `shelter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `volunteer`
--

DROP TABLE IF EXISTS `volunteer_history`;
DROP TABLE IF EXISTS `volunteer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteer` (
  `Volunteer_ID` varchar(10) NOT NULL,
  `Volunteer_Name` varchar(100) DEFAULT NULL,
  `Contact` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`Volunteer_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteer`
--

LOCK TABLES `volunteer` WRITE;
/*!40000 ALTER TABLE `volunteer` DISABLE KEYS */;
INSERT INTO `volunteer` VALUES ('VOL001','Raj','9812341234'),('VOL002','Nisha','9723456789'),('VOL003','Sahil','9645678901');
/*!40000 ALTER TABLE `volunteer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `volunteer_history`
--

DROP TABLE IF EXISTS `volunteer_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteer_history` (
  `History_ID` varchar(10) NOT NULL,
  `Volunteer_ID` varchar(10) NOT NULL,
  `Organization_Name` varchar(200) DEFAULT NULL,
  `Work_Summary` varchar(500) DEFAULT NULL,
  `Start_Date` date DEFAULT NULL,
  `End_Date` date DEFAULT NULL,
  `Hours_Total` int DEFAULT NULL,
  `Reference_Contact` varchar(150) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`History_ID`),
  KEY `Volunteer_ID` (`Volunteer_ID`),
  CONSTRAINT `volunteer_history_ibfk_1` FOREIGN KEY (`Volunteer_ID`) REFERENCES `volunteer` (`Volunteer_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteer_history`
--

LOCK TABLES `volunteer_history` WRITE;
/*!40000 ALTER TABLE `volunteer_history` DISABLE KEYS */;
INSERT INTO `volunteer_history` VALUES ('VH001','VOL001','City Animal Aid NGO','Community adoption drives and dog walking','2023-06-01','2023-12-15',96,'coordinator@cityanimalaid.demo','Weekend shifts only'),('VH002','VOL002','Blue Cross Mumbai','Cat socialization and kennel cleaning','2024-01-10','2024-08-20',140,'volunteer@bluecross.demo',NULL),('VH003','VOL003','Local school outreach','Presentations on responsible pet ownership','2024-09-01','2025-01-31',24,'teacher@school.demo','One session per month');
/*!40000 ALTER TABLE `volunteer_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_account` (admin / staff sign-in)
--

DROP TABLE IF EXISTS `staff_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_account` (
  `Staff_ID` varchar(20) NOT NULL,
  `Password` varchar(200) NOT NULL,
  PRIMARY KEY (`Staff_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_account`
--

LOCK TABLES `staff_account` WRITE;
/*!40000 ALTER TABLE `staff_account` DISABLE KEYS */;
INSERT INTO `staff_account` VALUES ('ADMIN','admin123');
/*!40000 ALTER TABLE `staff_account` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-13 10:08:36
