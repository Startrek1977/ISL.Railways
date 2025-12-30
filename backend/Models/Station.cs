using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RailwayAPI.Models
{
    public class Station
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Range(1000, 8000)]
        public int Number { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<Train> OriginTrains { get; set; } = new List<Train>();
        public ICollection<Train> DestinationTrains { get; set; } = new List<Train>();
    }
}
