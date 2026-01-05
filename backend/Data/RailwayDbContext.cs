using Microsoft.EntityFrameworkCore;
using RailwayAPI.Models;

namespace RailwayAPI.Data
{
    public class RailwayDbContext : DbContext
    {
        public RailwayDbContext(DbContextOptions<RailwayDbContext> options) : base(options)
        {
        }

        public DbSet<Station> Stations { get; set; }
        public DbSet<Train> Trains { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Station entity
            modelBuilder.Entity<Station>(entity =>
            {
                entity.ToTable("Station");
                entity.HasKey(s => s.Number);
                entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
            });

            // Configure Train entity with foreign keys
            modelBuilder.Entity<Train>(entity =>
            {
                entity.ToTable("Train");
                entity.HasKey(t => t.Number);

                entity.Property(t => t.DayOfWeek).IsRequired().HasMaxLength(10);

                entity.HasOne(t => t.OriginStation)
                    .WithMany(s => s.OriginTrains)
                    .HasForeignKey(t => t.Origin)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(t => t.DestinationStation)
                    .WithMany(s => s.DestinationTrains)
                    .HasForeignKey(t => t.Destination)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed Israeli Railway Stations
            // These stations are static and should not be modified at runtime
            modelBuilder.Entity<Station>().HasData(
                new Station { Number = 1000, Name = "Tel Aviv Savidor" },
                new Station { Number = 2000, Name = "Tel Aviv HaShalom" },
                new Station { Number = 3000, Name = "Haifa Hof HaCarmel" },
                new Station { Number = 4000, Name = "Beer Sheva Center" },
                new Station { Number = 5000, Name = "Nahariya" },
                new Station { Number = 6000, Name = "Benyamina" },
                new Station { Number = 7000, Name = "Herzliya" }
            );
        }
    }
}
