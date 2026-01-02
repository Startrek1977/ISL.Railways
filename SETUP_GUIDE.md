# Quick Setup Guide

## Prerequisites Check

Before starting, ensure you have:
- [ ] .NET SDK 8.0 or higher installed
- [ ] Node.js 18 or higher installed
- [ ] SQL Server installed and running
- [ ] SQL Server Management Studio (optional)

## Step-by-Step Setup

### 1. Database Setup (5 minutes)

1. Open SQL Server Management Studio
2. Connect to your server instance
3. Open and execute `database-script.sql`
4. Verify tables created: Station and Train
5. Check sample data inserted (5 stations, 6 trains)

### 2. Backend Configuration (2 minutes)

1. Open `backend/appsettings.json`
2. Update connection string:
   ```json
   "RailwayDatabase": "Server=localhost;Database=RailwayDB;User Id=sa;Password=YourPassword;TrustServerCertificate=True;"
   ```
3. Replace `localhost`, `sa`, and `YourPassword` with your values

### 3. Start Backend (1 minute)

```bash
cd backend
dotnet restore
dotnet run
```

Backend runs at: `https://localhost:5000`  
Swagger UI: `https://localhost:5000/swagger`

### 4. Start Frontend (1 minute)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 5. Test the Application

1. Open browser to `http://localhost:5173`
2. View the pre-seeded stations (read-only)
3. Try adding a train (e.g., 11, from station 1000 to 3000)
4. Test edit and delete operations on trains

**Note:** Stations are pre-seeded and cannot be modified. Only trains can be added, edited, or deleted.

## Troubleshooting

**Backend won't start:**
- Check SQL Server is running
- Verify connection string is correct
- Ensure no other app using port 5000

**Frontend can't connect:**
- Verify backend is running
- Check CORS settings in Program.cs
- Ensure API URL is correct in components

**Database errors:**
- Run database script again
- Check SQL Server authentication mode
- Verify database name matches connection string

## Architecture Overview

```
React Frontend (Port 5173)
    ↓ HTTP Requests
.NET Core API (Port 5000)
    ↓ EF Core
SQL Server Database (RailwayDB)
    - Stations (pre-seeded, immutable)
    - Trains (dynamic, modifiable)
```

## Default Credentials

If using SQL Server authentication:
- Username: `sa`
- Password: (your SQL Server sa password)

If using Windows authentication:
- Connection string: `Server=localhost;Database=RailwayDB;Integrated Security=True;TrustServerCertificate=True;`
