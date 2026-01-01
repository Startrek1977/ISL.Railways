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
- **Purpose**: Manage railway stations
- **Features**:
  - Display all stations in a table
  - Add new stations (validation: 1000-8000)
  - Edit existing station names
  - Delete stations (with confirmation)
- **API Calls**:
  - GET /api/stations
  - POST /api/stations
  - PUT /api/stations/{id}
  - DELETE /api/stations/{id}

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
    // POST: api/Stations
    // PUT: api/Stations/5
    // DELETE: api/Stations/5
}
```

**Responsibilities**:
- CRUD operations for stations
- Validate station number range (1000-8000)
- Handle duplicate number conflicts
- Return appropriate HTTP status codes

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

### Adding a New Station

```
User Input (React)
    │
    ├─> Validate in Frontend (1000-8000)
    │
    └─> POST /api/stations
            │
            ├─> StationsController.PostStation()
            │       │
            │       ├─> Validate range
            │       ├─> Add to DbContext
            │       └─> SaveChangesAsync()
            │
            └─> SQL INSERT INTO Station
                    │
                    └─> Return 201 Created
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
