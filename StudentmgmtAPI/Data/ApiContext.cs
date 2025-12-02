using Microsoft.EntityFrameworkCore;
using StudentmgmtAPI.Models;

namespace StudentmgmtAPI.Data
{
    public class ApiContext : DbContext
    {
        public DbSet<Student> Student { get; set; } // For students 

        public DbSet<course> course { get; set; }   // For courses

        public DbSet<Enrollment> Enrollment { get; set; } // For enrollment

        public ApiContext(DbContextOptions<ApiContext> options) : base(options) { }
    }
}
