# ISL.Railways

A small Full Stack project for the Railways company - a web-based railway ticket booking system.

## Features

- 🚂 **Train Schedule**: View all available trains with real-time status
- 🎫 **Online Booking**: Book tickets with an intuitive form
- 🔍 **Search Functionality**: Search trains by station names
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 💾 **Database Integration**: SQLite database for storing trains and bookings
- 🎨 **Modern UI**: Clean and professional user interface

## Technology Stack

### Frontend
- HTML5
- CSS3 (with responsive design)
- JavaScript (Vanilla JS)

### Backend
- Node.js
- Express.js
- SQLite3
- CORS & Body Parser middleware

## Project Structure

```
ISL.Railways/
├── public/
│   ├── css/
│   │   └── styles.css          # Stylesheet
│   ├── js/
│   │   └── app.js              # Frontend JavaScript
│   └── index.html              # Main HTML page
├── server/
│   └── index.js                # Express server & API
├── package.json                # Node.js dependencies
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Startrek1977/ISL.Railways.git
   cd ISL.Railways
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Application

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Access the application**:
   Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

## API Endpoints

### Train Schedule
- **GET** `/api/schedule` - Get all trains
- **GET** `/api/schedule?from=Station1&to=Station2` - Get trains between specific stations
- **GET** `/api/trains/:trainNumber` - Get specific train details

### Bookings
- **POST** `/api/bookings` - Create a new booking
- **GET** `/api/bookings` - Get all bookings
- **GET** `/api/bookings/:bookingId` - Get specific booking details

## Usage

### Viewing Train Schedule
1. Navigate to the "Schedule" section
2. View all available trains with their routes and timings
3. Use the search box to filter trains by station name

### Booking a Ticket
1. Go to the "Book Ticket" section
2. Fill in the required information:
   - Passenger name
   - Email address
   - From and To stations
   - Travel date
   - Select train
   - Number of passengers
   - Class (Economy/Business/First Class)
3. Click "Book Now"
4. You'll receive a booking confirmation with a unique booking ID

## Sample Train Data

The application comes pre-loaded with 10 sample trains covering routes between:
- Central Station
- North Terminal
- South Junction
- East Plaza
- West End

## Development

To modify the application:

- **Frontend**: Edit files in the `public/` directory
  - `public/index.html` - HTML structure
  - `public/css/styles.css` - Styling
  - `public/js/app.js` - Client-side logic

- **Backend**: Edit `server/index.js` for:
  - API endpoints
  - Database schema
  - Business logic

## Future Enhancements

Potential improvements for the application:
- User authentication and login system
- Payment gateway integration
- Email notifications for bookings
- Seat selection interface
- Booking history and management
- Admin panel for managing trains
- Real-time train tracking
- Multiple language support

## License

MIT License

## Contact

For questions or support, please contact:
- Email: info@islrailways.com
- Phone: +1-800-RAILWAY
