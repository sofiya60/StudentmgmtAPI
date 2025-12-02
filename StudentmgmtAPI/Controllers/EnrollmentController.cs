using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentmgmtAPI.Data;
using StudentmgmtAPI.Models;

namespace StudentmgmtAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class _3_EnrollmentController : ControllerBase
    {
        private readonly ApiContext _context;

        public _3_EnrollmentController(ApiContext context)
        {
            _context = context;
        }

        // POST /api/enrollment - Enroll a student in a course
        [HttpPost]
        public IActionResult Enroll([FromBody] Enrollment enrollment)
        {
            // Check if Student and Course exist
            var studentExists = _context.Student.Any(s => s.Id == enrollment.StudentId);
            var courseExists = _context.course.Any(c => c.Id == enrollment.CourseId);

            if (!studentExists)
                return NotFound(new { message = "Student not found" });

            if (!courseExists)
                return NotFound(new { message = "Course not found" });

            enrollment.EnrollmentDate = DateTime.UtcNow;

            _context.Enrollment.Add(enrollment);
            _context.SaveChanges();

            return Ok(new { message = "Student enrolled successfully", enrollment });
        }

        // GET /api/enrollment/student/{studentId}
        [HttpGet("student/{studentId}")]
        public IActionResult GetEnrollmentsByStudent(int studentId)
        {
            var studentExists = _context.Student.Any(s => s.Id == studentId);
            if (!studentExists)
                return NotFound(new { message = "Student not found" });

            var enrollments = _context.Enrollment
                .Include(e => e.Course)
                .Where(e => e.StudentId == studentId)
                .Select(e => new
                {
                    e.Id,
                    e.CourseId,
                    CourseName = e.Course != null ? e.Course.Name : "Unknown",
                    e.EnrollmentDate
                })
                .ToList();

            return Ok(enrollments);
        }
    }
}
