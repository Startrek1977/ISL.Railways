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

                entity.HasOne(t => t.OriginStation)
                    .WithMany(s => s.OriginTrains)
                    .HasForeignKey(t => t.Origin)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(t => t.DestinationStation)
                    .WithMany(s => s.DestinationTrains)
                    .HasForeignKey(t => t.Destination)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
