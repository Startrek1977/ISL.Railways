using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RailwayAPI.Data;
using RailwayAPI.Models;

namespace RailwayAPI.Controllers
{
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

        // POST: api/Stations
        [HttpPost]
        public async Task<ActionResult<Station>> PostStation(Station station)
        {
            if (station.Number < 1000 || station.Number > 8000)
            {
                return BadRequest("Station number must be between 1000 and 8000");
            }

            _context.Stations.Add(station);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (StationExists(station.Number))
                {
                    return Conflict("Station with this number already exists");
                }
                throw;
            }

            return CreatedAtAction(nameof(GetStation), new { number = station.Number }, station);
        }

        // PUT: api/Stations/5
        [HttpPut("{number}")]
        public async Task<IActionResult> PutStation(int number, Station station)
        {
            if (number != station.Number)
            {
                return BadRequest("Station number mismatch");
            }

            _context.Entry(station).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StationExists(number))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Stations/5
        [HttpDelete("{number}")]
        public async Task<IActionResult> DeleteStation(int number)
        {
            var station = await _context.Stations.FindAsync(number);
            if (station == null)
            {
                return NotFound();
            }

            _context.Stations.Remove(station);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool StationExists(int number)
        {
            return _context.Stations.Any(e => e.Number == number);
        }
    }
}
