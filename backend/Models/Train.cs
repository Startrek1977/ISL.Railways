using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RailwayAPI.Models
{
    public class Train
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Range(10, 100)]
        public int Number { get; set; }

        [Required]
        [Range(1000, 8000)]
        public int Origin { get; set; }

        [Required]
        [Range(1000, 8000)]
        public int Destination { get; set; }

        // Navigation properties
        [ForeignKey("Origin")]
        public Station? OriginStation { get; set; }

        [ForeignKey("Destination")]
        public Station? DestinationStation { get; set; }
    }
}
