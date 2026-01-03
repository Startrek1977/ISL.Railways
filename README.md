# ISL Railways Management System

A full-stack railway management application built with **React**, **.NET Core 8**, and **Microsoft SQL Server**.

## 🚀 Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with responsive design

### Backend
- **.NET Core 8** - High-performance web API
- **Entity Framework Core 8** - ORM for database operations
- **ASP.NET Core** - Web API framework
- **Swagger** - API documentation

### Database
- **Microsoft SQL Server** - Enterprise-grade relational database
- 2 Tables: **Station** and **Train**

## 📋 Database Schema

### Station Table
```sql
Number (INT, Primary Key, Range: 1000-8000)
Name (NVARCHAR(100), Required)
```

**Note:** Stations are pre-seeded and immutable at runtime. They represent the Israeli railway network and cannot be modified through the API.

### Train Table
```sql
Number (INT, Primary Key, Range: 10-100)
Origin (INT, Foreign Key → Station.Number)
Destination (INT, Foreign Key → Station.Number)
```

## 🛠️ Setup Instructions

### Prerequisites
- **.NET SDK 8.0** or higher
- **Node.js 18** or higher
- **Microsoft SQL Server** (2019 or later)
- **SQL Server Management Studio** (optional, for database management)

### 1. Database Setup

1. Open SQL Server Management Studio
2. Connect to your SQL Server instance
3. Run the database creation script:
   ```bash
   # The script is located at: database-script.sql
   ```
4. This will:
   - Create the `RailwayDB` database
   - Create `Station` and `Train` tables with constraints
   - Seed Israeli railway stations (immutable data)
   - Insert sample trains (modifiable data)

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Update the connection string in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "RailwayDatabase": "Server=YOUR_SERVER_NAME;Database=RailwayDB;User Id=YOUR_USERNAME;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
     }
   }
   ```
   
   Replace:
   - `YOUR_SERVER_NAME` - Your SQL Server instance (e.g., `localhost` or `.\SQLEXPRESS`)
   - `YOUR_USERNAME` - Your SQL Server username
   - `YOUR_PASSWORD` - Your SQL Server password

3. Restore dependencies and run:
   ```bash
   dotnet restore
   dotnet run
   ```

   The API will start at `https://localhost:5000` (or `http://localhost:5001`)

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The React app will start at `http://localhost:5173`

## 🎯 Features

### Station Management
- ✅ View all stations (read-only)
- ✅ Stations are pre-seeded and immutable
- ✅ Represents Israeli railway network

**Note:** Stations cannot be added, edited, or deleted at runtime. They are seeded during database initialization and represent the fixed Israeli railway network.

### Train Management
- ✅ View all trains with origin/destination names
- ✅ Add new trains (Number: 10-100)
- ✅ Automatic train number assignment (current max + 10)
- ✅ Edit train routes
- ✅ Delete trains
- ✅ Foreign key validation
- ✅ Prevent same origin/destination

## 🌐 API Endpoints

### Stations (Read-Only)
```
GET    /api/stations        - Get all stations
GET    /api/stations/{id}   - Get station by number
```

**Note:** Stations are immutable. POST, PUT, and DELETE operations are not available.

### Trains
```
GET    /api/trains          - Get all trains (with station names)
GET    /api/trains/{id}     - Get train by number
POST   /api/trains          - Create new train
PUT    /api/trains/{id}     - Update train
DELETE /api/trains/{id}     - Delete train
```

## 📦 Project Structure

```
ISL.Railways/
├── backend/                      # .NET Core API
│   ├── Controllers/              # API Controllers
│   │   ├── StationsController.cs
│   │   └── TrainsController.cs
│   ├── Data/                     # Database Context
│   │   └── RailwayDbContext.cs
│   ├── Models/                   # Entity Models
│   │   ├── Station.cs
│   │   └── Train.cs
│   ├── Program.cs                # Application entry point
│   ├── appsettings.json          # Configuration (connection string)
│   └── RailwayAPI.csproj         # Project file
│
├── frontend/                     # React Application
│   ├── src/
│   │   ├── components/           # React Components
│   │   │   ├── StationList.jsx
│   │   │   ├── StationList.css
│   │   │   ├── TrainList.jsx
│   │   │   └── TrainList.css
│   │   ├── App.jsx               # Main App Component
│   │   ├── App.css               # App Styles
│   │   └── main.jsx              # React entry point
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite configuration
│
├── database-script.sql           # Database creation script
├── README.md                     # This file
└── .gitignore                    # Git ignore rules
```

## 🔧 Development

### Running in Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
dotnet watch run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Backend:**
```bash
cd backend
dotnet publish -c Release -o ./publish
```

**Frontend:**
```bash
cd frontend
npm run build
```

The production build will be in the `frontend/dist` directory.

## 🧪 Testing the API

### Using Swagger UI
Navigate to `https://localhost:5000/swagger` to test the API endpoints interactively.

### Using curl

**Get All Stations:**
```bash
curl https://localhost:5000/api/stations
```

**Get All Trains:**
```bash
curl https://localhost:5000/api/trains
```

**Create a New Train:**
```bash
curl -X POST https://localhost:5000/api/trains \
  -H "Content-Type: application/json" \
  -d '{"number": 11, "origin": 1000, "destination": 3000}'
```

## 🛡️ Validation Rules

### Station
- Number must be between 1000 and 8000
- Name is required (max 100 characters)
- Number must be unique
- **Stations are pre-seeded and immutable** - cannot be modified at runtime

### Train
- Number must be between 10 and 100
- Origin and Destination must be valid station numbers
- Origin and Destination cannot be the same
- Referenced stations must exist in the database
- Number must be unique

## 📝 Sample Data

The `database-script.sql` includes sample data:

**Stations (Pre-seeded, Immutable):**
- 1000 - Tel Aviv Savidor
- 2000 - Tel Aviv HaShalom
- 3000 - Haifa Hof HaCarmel
- 4000 - Beer Sheva Center
- 5000 - Nahariya
- 6000 - Benyamina
- 7000 - Herzliya

**Trains (Sample data, can be modified):**
- Train 10: Tel Aviv Savidor → Haifa Hof HaCarmel
- Train 20: Haifa Hof HaCarmel → Tel Aviv Savidor
- Train 30: Tel Aviv Savidor → Beer Sheva Center
- Train 40: Tel Aviv HaShalom → Nahariya
- Train 50: Benyamina → Herzliya
- Train 60: Herzliya → Tel Aviv HaShalom

## 🤝 Contributing

This is a demonstration project showcasing full-stack development with modern technologies.

## 📄 License

MIT License - feel free to use this project for learning purposes.

## 📧 Contact

For questions or feedback about this project, please open an issue in the repository.

---

**Built with ❤️ using React + .NET Core + SQL Server**
