const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database setup - using persistent file storage for data retention
const db = new sqlite3.Database('./railway.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Create trains table
    db.run(`
        CREATE TABLE IF NOT EXISTS trains (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trainNumber TEXT NOT NULL UNIQUE,
            trainName TEXT NOT NULL,
            fromStation TEXT NOT NULL,
            toStation TEXT NOT NULL,
            departureTime TEXT NOT NULL,
            arrivalTime TEXT NOT NULL,
            status TEXT DEFAULT 'On Time'
        )
    `, (err) => {
        if (err) {
            console.error('Error creating trains table:', err);
        } else {
            // Check if trains table is empty before inserting sample data
            db.get('SELECT COUNT(*) as count FROM trains', [], (err, row) => {
                if (err) {
                    console.error('Error checking trains table:', err);
                } else if (row.count === 0) {
                    // Insert sample train data only if table is empty
                    insertSampleTrains();
                }
            });
        }
    });

    // Create bookings table
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bookingId TEXT NOT NULL UNIQUE,
            passengerName TEXT NOT NULL,
            email TEXT NOT NULL,
            fromStation TEXT NOT NULL,
            toStation TEXT NOT NULL,
            travelDate TEXT NOT NULL,
            trainNumber TEXT NOT NULL,
            passengers INTEGER NOT NULL,
            class TEXT NOT NULL,
            bookingDate TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating bookings table:', err);
        }
    });
}

// Insert sample train data
function insertSampleTrains() {
    const trains = [
        ['EXP101', 'Morning Express', 'Central Station', 'North Terminal', '06:00', '08:30', 'On Time'],
        ['EXP102', 'City Shuttle', 'North Terminal', 'South Junction', '07:15', '09:45', 'On Time'],
        ['EXP103', 'East Coast Express', 'Central Station', 'East Plaza', '08:00', '11:00', 'On Time'],
        ['EXP104', 'West Line', 'South Junction', 'West End', '09:30', '12:00', 'Delayed'],
        ['EXP105', 'Business Express', 'Central Station', 'West End', '10:00', '13:30', 'On Time'],
        ['EXP106', 'Afternoon Special', 'East Plaza', 'North Terminal', '12:00', '14:30', 'On Time'],
        ['EXP107', 'Evening Commuter', 'West End', 'Central Station', '14:00', '17:30', 'On Time'],
        ['EXP108', 'Night Express', 'North Terminal', 'South Junction', '18:00', '20:30', 'On Time'],
        ['EXP109', 'Late Night Service', 'Central Station', 'East Plaza', '20:00', '23:00', 'On Time'],
        ['EXP110', 'Midnight Express', 'South Junction', 'West End', '22:00', '01:30', 'On Time']
    ];

    const stmt = db.prepare('INSERT INTO trains (trainNumber, trainName, fromStation, toStation, departureTime, arrivalTime, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    trains.forEach(train => {
        stmt.run(train, (err) => {
            if (err) {
                console.error('Error inserting train:', err);
            }
        });
    });
    
    stmt.finalize(() => {
        console.log('Sample train data inserted');
    });
}

// API Routes

// Get all trains or filter by stations
app.get('/api/schedule', (req, res) => {
    const { from, to } = req.query;
    
    let query = 'SELECT * FROM trains';
    let params = [];
    
    if (from && to) {
        query += ' WHERE fromStation = ? AND toStation = ?';
        params = [from, to];
    } else if (from) {
        query += ' WHERE fromStation = ?';
        params = [from];
    } else if (to) {
        query += ' WHERE toStation = ?';
        params = [to];
    }
    
    query += ' ORDER BY departureTime';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching schedule:', err);
            res.status(500).json({ message: 'Error fetching schedule' });
        } else {
            res.json(rows);
        }
    });
});

// Get train by train number
app.get('/api/trains/:trainNumber', (req, res) => {
    const { trainNumber } = req.params;
    
    db.get('SELECT * FROM trains WHERE trainNumber = ?', [trainNumber], (err, row) => {
        if (err) {
            console.error('Error fetching train:', err);
            res.status(500).json({ message: 'Error fetching train' });
        } else if (!row) {
            res.status(404).json({ message: 'Train not found' });
        } else {
            res.json(row);
        }
    });
});

// Create a booking
app.post('/api/bookings', (req, res) => {
    const { passengerName, email, fromStation, toStation, travelDate, trainNumber, passengers, class: ticketClass } = req.body;
    
    // Validation
    if (!passengerName || !email || !fromStation || !toStation || !travelDate || !trainNumber || !passengers || !ticketClass) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (fromStation === toStation) {
        return res.status(400).json({ message: 'From and To stations cannot be the same' });
    }
    
    // Generate booking ID with timestamp and random component for better uniqueness
    // Format: BK-YYYYMMDDHHMMSS-XXXX where XXXX is a random 4-digit number
    const now = new Date();
    const timestamp = now.getFullYear().toString() + 
                     (now.getMonth() + 1).toString().padStart(2, '0') + 
                     now.getDate().toString().padStart(2, '0') + 
                     now.getHours().toString().padStart(2, '0') + 
                     now.getMinutes().toString().padStart(2, '0') + 
                     now.getSeconds().toString().padStart(2, '0');
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const bookingId = `BK-${timestamp}-${randomPart}`;
    
    // Insert booking
    const query = `
        INSERT INTO bookings (bookingId, passengerName, email, fromStation, toStation, travelDate, trainNumber, passengers, class)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [bookingId, passengerName, email, fromStation, toStation, travelDate, trainNumber, passengers, ticketClass], function(err) {
        if (err) {
            console.error('Error creating booking:', err);
            res.status(500).json({ message: 'Error creating booking' });
        } else {
            res.status(201).json({
                message: 'Booking created successfully',
                bookingId: bookingId,
                id: this.lastID
            });
        }
    });
});

// Get booking by booking ID
app.get('/api/bookings/:bookingId', (req, res) => {
    const { bookingId } = req.params;
    
    db.get('SELECT * FROM bookings WHERE bookingId = ?', [bookingId], (err, row) => {
        if (err) {
            console.error('Error fetching booking:', err);
            res.status(500).json({ message: 'Error fetching booking' });
        } else if (!row) {
            res.status(404).json({ message: 'Booking not found' });
        } else {
            res.json(row);
        }
    });
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
    db.all('SELECT * FROM bookings ORDER BY bookingDate DESC', [], (err, rows) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            res.status(500).json({ message: 'Error fetching bookings' });
        } else {
            res.json(rows);
        }
    });
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`ISL Railways server is running on http://localhost:${PORT}`);
    console.log(`Open your browser and navigate to http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
