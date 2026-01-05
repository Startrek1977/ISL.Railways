-- Railway Database Creation Script
-- Run this script on your SQL Server instance to create the database
-- This script will DROP existing tables and recreate the schema

-- Create Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'RailwayDB')
BEGIN
    CREATE DATABASE RailwayDB;
END
GO

USE RailwayDB;
GO

-- Drop existing tables (in reverse order of dependencies)
-- Drop Train table first because it has foreign key references to Station
DROP TABLE IF EXISTS Train;
PRINT 'Existing Train table dropped (if it existed)';
GO

-- Drop Station table
DROP TABLE IF EXISTS Station;
PRINT 'Existing Station table dropped (if it existed)';
GO

-- Create Station Table
CREATE TABLE Station (
    Number INT PRIMARY KEY CHECK (Number >= 1000 AND Number <= 8000),
    Name NVARCHAR(100) NOT NULL
);
PRINT 'Station table created';
GO

-- Create Train Table
CREATE TABLE Train (
    Number INT PRIMARY KEY CHECK (Number >= 10 AND Number <= 100),
    Origin INT NOT NULL CHECK (Origin >= 1000 AND Origin <= 8000),
    Destination INT NOT NULL CHECK (Destination >= 1000 AND Destination <= 8000),
    DayOfWeek NVARCHAR(10) NOT NULL,
    CONSTRAINT FK_Train_Origin FOREIGN KEY (Origin) REFERENCES Station(Number) ON DELETE NO ACTION,
    CONSTRAINT FK_Train_Destination FOREIGN KEY (Destination) REFERENCES Station(Number) ON DELETE NO ACTION,
    CONSTRAINT CHK_Train_Different_Stations CHECK (Origin <> Destination),
    CONSTRAINT CHK_Train_DayOfWeek CHECK (DayOfWeek IN ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'))
);
PRINT 'Train table created';
GO

-- Insert Israeli Railway Stations (seeded data)
INSERT INTO Station (Number, Name) VALUES
    (1000, 'Tel Aviv Savidor'),
    (2000, 'Tel Aviv HaShalom'),
    (3000, 'Haifa Hof HaCarmel'),
    (4000, 'Beer Sheva Center'),
    (5000, 'Nahariya'),
    (6000, 'Benyamina'),
    (7000, 'Herzliya');

PRINT 'Israeli railway stations inserted successfully';
GO

-- Insert Sample Trains with random days of week
INSERT INTO Train (Number, Origin, Destination, DayOfWeek) VALUES
    (10, 1000, 3000, 'Monday'),     -- Tel Aviv Savidor to Haifa Hof HaCarmel
    (20, 3000, 1000, 'Wednesday'),  -- Haifa Hof HaCarmel to Tel Aviv Savidor
    (30, 1000, 4000, 'Friday'),     -- Tel Aviv Savidor to Beer Sheva Center
    (40, 2000, 5000, 'Tuesday'),    -- Tel Aviv HaShalom to Nahariya
    (50, 6000, 7000, 'Thursday'),   -- Benyamina to Herzliya
    (60, 7000, 2000, 'Sunday');     -- Herzliya to Tel Aviv HaShalom

PRINT 'Sample trains inserted successfully';
GO

PRINT 'Database setup completed successfully - Tables recreated with fresh data';
