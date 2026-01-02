# ISL Railways - Architecture Documentation

## System Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            React Frontend (Vite)                        │ │
│  │  ┌──────────────┐  ┌──────────────┐                   │ │
│  │  │ StationList  │  │  TrainList   │                   │ │
│  │  │  Component   │  │  Component   │                   │ │
│  │  └──────────────┘  └──────────────┘                   │ │
│  │         │                 │                            │ │
│  │         └────────┬────────┘                            │ │
│  │                  ▼                                      │ │
│  │             Axios HTTP                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│              Port: 5173 (Development)                       │
└─────────────────────────────────────────────────────────────┘
                           │
                    HTTP/REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         .NET Core 8 Web API                             │ │
│  │  ┌──────────────────┐  ┌──────────────────┐           │ │
│  │  │ StationsController│  │  TrainsController│           │ │
│  │  └──────────────────┘  └──────────────────┘           │ │
│  │           │                      │                      │ │
│  │           └──────────┬───────────┘                      │ │
│  │                      ▼                                   │ │
│  │            Entity Framework Core                         │ │
│  │           (RailwayDbContext)                            │ │
│  └────────────────────────────────────────────────────────┘ │
│              Ports: 5000 (HTTPS), 5001 (HTTP)              │
└─────────────────────────────────────────────────────────────┘
                           │
                     EF Core ORM
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Microsoft SQL Server                         │ │
│  │                                                         │ │
│  │  ┌──────────────┐        ┌──────────────┐            │ │
│  │  │   Station    │        │    Train     │            │ │
│  │  │──────────────│        │──────────────│            │ │
│  │  │ Number (PK)  │◄───────│ Origin (FK)  │            │ │
│  │  │ Name         │        │ Destination  │            │ │
│  │  └──────────────┘        │   (FK)       │            │ │
│  │                          │ Number (PK)  │            │ │
│  │                          └──────────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
│                    Database: RailwayDB                      │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Components

#### StationList Component
- **Purpose**: View railway stations (read-only)
- **Features**:
  - Display all stations in a table
  - Stations are pre-seeded and immutable
  - Informational display only
- **API Calls**:
  - GET /api/stations

#### TrainList Component
- **Purpose**: Manage trains and routes
- **Features**:
  - Display all trains with origin/destination names
  - Add new trains (validation: 10-100)
  - Edit train routes
  - Delete trains (with confirmation)
  - Prevent same origin/destination
- **API Calls**:
  - GET /api/trains
  - POST /api/trains
  - PUT /api/trains/{id}
  - DELETE /api/trains/{id}

### Backend Controllers

#### StationsController
```csharp
[Route("api/[controller]")]
[ApiController]
public class StationsController : ControllerBase
{
    // GET: api/Stations
    // GET: api/Stations/5
}
```

**Responsibilities**:
- Read-only operations for stations
- Return list of pre-seeded stations
- Return appropriate HTTP status codes
- **Note:** Stations are immutable - no POST/PUT/DELETE endpoints

#### TrainsController
```csharp
[Route("api/[controller]")]
[ApiController]
public class TrainsController : ControllerBase
{
    // GET: api/Trains
    // GET: api/Trains/5
    // POST: api/Trains
    // PUT: api/Trains/5
    // DELETE: api/Trains/5
}
```

**Responsibilities**:
- CRUD operations for trains
- Validate train number range (10-100)
- Verify origin/destination stations exist
- Enforce different origin/destination
- Include station names in responses

### Database Schema

#### Station Table
```sql
CREATE TABLE Station (
    Number INT PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    CONSTRAINT CHK_Station_Range CHECK (Number >= 1000 AND Number <= 8000)
);

-- Stations are seeded at database creation and are immutable
-- Seeded via Entity Framework Core HasData() in RailwayDbContext
```

#### Train Table
```sql
CREATE TABLE Train (
    Number INT PRIMARY KEY,
    Origin INT NOT NULL,
    Destination INT NOT NULL,
    CONSTRAINT CHK_Train_Range CHECK (Number >= 10 AND Number <= 100),
    CONSTRAINT FK_Train_Origin FOREIGN KEY (Origin) 
        REFERENCES Station(Number),
    CONSTRAINT FK_Train_Destination FOREIGN KEY (Destination) 
        REFERENCES Station(Number),
    CONSTRAINT CHK_Different_Stations CHECK (Origin <> Destination)
);
```

## Data Flow

### Viewing Stations (Read-Only)

```
User Request (React)
    │
    └─> GET /api/stations
            │
            ├─> StationsController.GetStations()
            │       │
            │       ├─> Query DbContext
            │       └─> Return seeded stations
            │
            └─> SQL SELECT * FROM Station
                    │
                    └─> Return 200 OK with station list

Note: Stations are pre-seeded in RailwayDbContext.OnModelCreating()
      and cannot be modified at runtime.
```

### Adding a New Train

```
User Input (React)
    │
    ├─> Select Origin Station
    ├─> Select Destination Station
    ├─> Validate in Frontend (10-100)
    │
    └─> POST /api/trains
            │
            ├─> TrainsController.PostTrain()
            │       │
            │       ├─> Validate train number (10-100)
            │       ├─> Validate origin != destination
            │       ├─> Check stations exist
            │       ├─> Add to DbContext
            │       └─> SaveChangesAsync()
            │
            └─> SQL INSERT INTO Train
                    │
                    ├─> Foreign Key Validation
                    └─> Return 201 Created
```

## Security Considerations

### Current Implementation
- ✅ Input validation on both frontend and backend
- ✅ Foreign key constraints
- ✅ Check constraints for ranges
- ✅ CORS configured for specific origins
- ✅ HTTPS enabled by default

### Production Recommendations
- Add authentication (JWT tokens)
- Add authorization (role-based access)
- Implement rate limiting
- Add request logging
- Use environment variables for secrets
- Enable SQL Server encryption
- Add input sanitization
- Implement API versioning

## Performance Considerations

### Database
- Primary keys on Number fields (indexed)
- Foreign key indexes created automatically
- Small dataset (stations < 7000, trains < 100)

### API
- Async/await for all database operations
- EF Core query optimization
- Includes for navigation properties

### Frontend
- Component-based architecture
- State management with React hooks
- Axios for HTTP requests
- Lazy loading (if needed)

## Deployment

### Development
```
Frontend: npm run dev (port 5173)
Backend: dotnet run (ports 5000/5001)
Database: Local SQL Server
```

### Production
```
Frontend: npm run build → Static files
Backend: dotnet publish → Self-contained deployment
Database: Azure SQL / SQL Server on VM
```

## Technology Versions

- **React**: 18.3.1
- **.NET**: 8.0
- **Entity Framework Core**: 8.0.11
- **Vite**: 7.3.0
- **Axios**: Latest
- **SQL Server**: 2019+

## File Structure Summary

```
ISL.Railways/
├── backend/                 # .NET Core API
│   ├── Controllers/         # REST endpoints
│   ├── Data/                # EF Core DbContext
│   ├── Models/              # Entity classes
│   └── Program.cs           # Configuration
│
├── frontend/                # React App
│   └── src/
│       ├── components/      # React components
│       ├── App.jsx          # Main app
│       └── main.jsx         # Entry point
│
└── database-script.sql      # DB setup
```
