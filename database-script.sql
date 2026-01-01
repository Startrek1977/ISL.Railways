-- Railway Database Creation Script
-- Run this script on your SQL Server instance to create the database

-- Create Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'RailwayDB')
BEGIN
    CREATE DATABASE RailwayDB;
END
GO

USE RailwayDB;
GO

-- Create Station Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Station')
BEGIN
    CREATE TABLE Station (
        Number INT PRIMARY KEY CHECK (Number >= 1000 AND Number <= 8000),
        Name NVARCHAR(100) NOT NULL
    );
END
GO

-- Create Train Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Train')
BEGIN
    CREATE TABLE Train (
        Number INT PRIMARY KEY CHECK (Number >= 10 AND Number <= 100),
        Origin INT NOT NULL CHECK (Origin >= 1000 AND Origin <= 8000),
        Destination INT NOT NULL CHECK (Destination >= 1000 AND Destination <= 8000),
        CONSTRAINT FK_Train_Origin FOREIGN KEY (Origin) REFERENCES Station(Number) ON DELETE NO ACTION,
        CONSTRAINT FK_Train_Destination FOREIGN KEY (Destination) REFERENCES Station(Number) ON DELETE NO ACTION,
        CONSTRAINT CHK_Train_Different_Stations CHECK (Origin <> Destination)
    );
END
GO

-- Insert Israeli Railway Stations (seeded once, not to be changed)
IF NOT EXISTS (SELECT 1 FROM Station)
BEGIN
    INSERT INTO Station (Number, Name) VALUES
        (1000, 'Tel Aviv Savidor'),
        (2000, 'Tel Aviv HaShalom'),
        (3000, 'Haifa Hof HaCarmel'),
        (4000, 'Beer Sheva Center'),
        (5000, 'Nahariya'),
        (6000, 'Benyamina'),
        (7000, 'Herzliya');
    
    PRINT 'Israeli railway stations inserted successfully';
END
GO

-- Insert Sample Trains
IF NOT EXISTS (SELECT 1 FROM Train)
BEGIN
    INSERT INTO Train (Number, Origin, Destination) VALUES
        (10, 1000, 3000),  -- Tel Aviv Savidor to Haifa Hof HaCarmel
        (20, 3000, 1000),  -- Haifa Hof HaCarmel to Tel Aviv Savidor
        (30, 1000, 4000),  -- Tel Aviv Savidor to Beer Sheva Center
        (40, 2000, 5000),  -- Tel Aviv HaShalom to Nahariya
        (50, 6000, 7000),  -- Benyamina to Herzliya
        (60, 7000, 2000);  -- Herzliya to Tel Aviv HaShalom
    
    PRINT 'Sample trains inserted successfully';
END
GO

PRINT 'Database setup completed successfully';

