using Microsoft.AspNetCore.Mvc;
using StudentmgmtAPI.Data;
using StudentmgmtAPI.Models;
using Microsoft.AspNetCore.Http;
using System.Linq;

namespace StudentmgmtAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class _2_CourseController : ControllerBase
    {
        private readonly ApiContext _context;

        public _2_CourseController(ApiContext context)
        {
            _context = context;
        }

        // GET all courses
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult GetAll()
        {
            var courses = _context.course.ToList();
            return Ok(courses);
        }

        // GET course by ID
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Get(int id)
        {
            var course = _context.course.Find(id);
            if (course == null) return NotFound(new { message = "Course not found" });
            return Ok(course);
        }

        // POST create or update (any Id succeeds)
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult CreateOrUpdate(course course)
        {
            var existingCourse = _context.course.Find(course.Id);

            if (existingCourse == null)
            {
                // If course with this Id doesn't exist, add it
                _context.course.Add(course);
            }
            else
            {
                // If course exists, update its data
                existingCourse.Name = course.Name;
                existingCourse.Description = course.Description;
            }

            _context.SaveChanges();

            return Ok(new { message = "Course saved successfully", course });
        }

        // DELETE course by ID
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Delete(int id)
        {
            var course = _context.course.Find(id);
            if (course == null) return NotFound(new { message = "Course not found" });

            _context.course.Remove(course);
            _context.SaveChanges();

            return NoContent();
        }
    }
}
