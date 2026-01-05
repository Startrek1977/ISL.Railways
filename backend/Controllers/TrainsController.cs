using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RailwayAPI.Data;
using RailwayAPI.Models;

namespace RailwayAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrainsController : ControllerBase
    {
        private readonly RailwayDbContext _context;

        public TrainsController(RailwayDbContext context)
        {
            _context = context;
        }

        private static readonly string[] ValidDaysOfWeek = { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };

        // GET: api/Trains
        // Optional date parameter for filtering by day of week
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetTrains([FromQuery] DateTime? date = null)
        {
            var query = _context.Trains
                .Include(t => t.OriginStation)
                .Include(t => t.DestinationStation)
                .AsQueryable();

            // Filter by day of week derived from the selected date
            if (date.HasValue)
            {
                var dayOfWeek = date.Value.DayOfWeek.ToString();
                query = query.Where(t => t.DayOfWeek == dayOfWeek);
            }

            return await query
                .OrderBy(t => t.Number)
                .Select(t => new
                {
                    t.Number,
                    t.Origin,
                    OriginName = t.OriginStation != null ? t.OriginStation.Name : null,
                    t.Destination,
                    DestinationName = t.DestinationStation != null ? t.DestinationStation.Name : null,
                    t.DayOfWeek
                })
                .ToListAsync();
        }

        // GET: api/Trains/5
        [HttpGet("{number}")]
        public async Task<ActionResult<object>> GetTrain(int number)
        {
            var train = await _context.Trains
                .Include(t => t.OriginStation)
                .Include(t => t.DestinationStation)
                .Where(t => t.Number == number)
                .Select(t => new
                {
                    t.Number,
                    t.Origin,
                    OriginName = t.OriginStation != null ? t.OriginStation.Name : null,
                    t.Destination,
                    DestinationName = t.DestinationStation != null ? t.DestinationStation.Name : null,
                    t.DayOfWeek
                })
                .FirstOrDefaultAsync();

            if (train == null)
            {
                return NotFound();
            }

            return train;
        }

        // POST: api/Trains
        [HttpPost]
        public async Task<ActionResult<Train>> PostTrain(Train train)
        {
            if (train.Number < 10 || train.Number > 100)
            {
                return BadRequest("Train number must be between 10 and 100");
            }

            if (train.Origin < 1000 || train.Origin > 8000 || train.Destination < 1000 || train.Destination > 8000)
            {
                return BadRequest("Station numbers must be between 1000 and 8000");
            }

            if (train.Origin == train.Destination)
            {
                return BadRequest("Origin and destination cannot be the same");
            }

            if (string.IsNullOrEmpty(train.DayOfWeek) || !ValidDaysOfWeek.Contains(train.DayOfWeek))
            {
                return BadRequest("DayOfWeek must be a valid day (Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday)");
            }

            // Verify stations exist
            var originExists = await _context.Stations.AnyAsync(s => s.Number == train.Origin);
            var destinationExists = await _context.Stations.AnyAsync(s => s.Number == train.Destination);

            if (!originExists)
            {
                return BadRequest($"Origin station {train.Origin} does not exist");
            }

            if (!destinationExists)
            {
                return BadRequest($"Destination station {train.Destination} does not exist");
            }

            _context.Trains.Add(train);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (TrainExists(train.Number))
                {
                    return Conflict("Train with this number already exists");
                }
                throw;
            }

            return CreatedAtAction(nameof(GetTrain), new { number = train.Number }, train);
        }

        // PUT: api/Trains/5
        [HttpPut("{number}")]
        public async Task<IActionResult> PutTrain(int number, Train train)
        {
            if (number != train.Number)
            {
                return BadRequest("Train number mismatch");
            }

            if (train.Origin == train.Destination)
            {
                return BadRequest("Origin and destination cannot be the same");
            }

            if (string.IsNullOrEmpty(train.DayOfWeek) || !ValidDaysOfWeek.Contains(train.DayOfWeek))
            {
                return BadRequest("DayOfWeek must be a valid day (Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday)");
            }

            _context.Entry(train).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TrainExists(number))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Trains/5
        [HttpDelete("{number}")]
        public async Task<IActionResult> DeleteTrain(int number)
        {
            var train = await _context.Trains.FindAsync(number);
            if (train == null)
            {
                return NotFound();
            }

            _context.Trains.Remove(train);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TrainExists(int number)
        {
            return _context.Trains.Any(e => e.Number == number);
        }
    }
}
