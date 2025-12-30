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

-- Insert Sample Stations
IF NOT EXISTS (SELECT 1 FROM Station)
BEGIN
    INSERT INTO Station (Number, Name) VALUES
        (1000, 'Central Station'),
        (2000, 'North Terminal'),
        (3000, 'South Junction'),
        (4000, 'East Plaza'),
        (5000, 'West End');
    
    PRINT 'Sample stations inserted successfully';
END
GO

-- Insert Sample Trains
IF NOT EXISTS (SELECT 1 FROM Train)
BEGIN
    INSERT INTO Train (Number, Origin, Destination) VALUES
        (10, 1000, 2000),  -- Central to North
        (20, 2000, 3000),  -- North to South
        (30, 1000, 4000),  -- Central to East
        (40, 3000, 5000),  -- South to West
        (50, 4000, 2000),  -- East to North
        (60, 5000, 1000);  -- West to Central
    
    PRINT 'Sample trains inserted successfully';
END
GO

PRINT 'Database setup completed successfully';
