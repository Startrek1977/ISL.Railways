using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RailwayAPI.Data;
using RailwayAPI.Models;

namespace RailwayAPI.Controllers
{
    /// <summary>
    /// Read-only controller for stations.
    /// Stations are seeded at database initialization and are immutable at runtime.
    /// To modify stations, update the seed data in RailwayDbContext and recreate the database.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class StationsController : ControllerBase
    {
        private readonly RailwayDbContext _context;

        public StationsController(RailwayDbContext context)
        {
            _context = context;
        }

        // GET: api/Stations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Station>>> GetStations()
        {
            return await _context.Stations
                .OrderBy(s => s.Number)
                .ToListAsync();
        }

        // GET: api/Stations/5
        [HttpGet("{number}")]
        public async Task<ActionResult<Station>> GetStation(int number)
        {
            var station = await _context.Stations.FindAsync(number);

            if (station == null)
            {
                return NotFound();
            }

            return station;
        }
    }
}
