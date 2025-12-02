using Microsoft.AspNetCore.Mvc;
using StudentmgmtAPI.Data;
using StudentmgmtAPI.Models;
using Microsoft.AspNetCore.Http;
using System.Linq;

namespace StudentmgmtAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class _1_StudentController : ControllerBase

    {
        private readonly ApiContext _context;

        public _1_StudentController(ApiContext context)
        {
            _context = context;
        }

        // GET /api/student - Get all students
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult GetAll()
        {
            var students = _context.Student.ToList();
            return Ok(students);
        }

        // GET /api/student/{id} - Get student by ID
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Get(int id)
        {
            var student = _context.Student.Find(id);
            if (student == null)
                return NotFound(new { message = "Student not found" });

            return Ok(student);
        }

        // POST /api/student - Create a new student or update if Id exists
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult CreateOrUpdate(Student student)
        {
            var existingStudent = _context.Student.Find(student.Id);

            if (existingStudent == null)
            {
                // Add new student
                _context.Student.Add(student);
            }
            else
            {
                // Update existing student
                existingStudent.FirstName = student.FirstName;
                existingStudent.LastName = student.LastName;
                existingStudent.DateOfBirth = student.DateOfBirth;
                existingStudent.Email = student.Email;
            }

            _context.SaveChanges();

            return Ok(new { message = "Student saved successfully", student });
        }

        // PUT /api/student/{id} - Update student info
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Update(int id, Student student)
        {
            var existingStudent = _context.Student.Find(id);
            if (existingStudent == null)
                return NotFound(new { message = "Student not found" });

            existingStudent.FirstName = student.FirstName;
            existingStudent.LastName = student.LastName;
            existingStudent.DateOfBirth = student.DateOfBirth;
            existingStudent.Email = student.Email;

            _context.SaveChanges();

            return Ok(new { message = "Student updated successfully", student = existingStudent });
        }

        // DELETE /api/student/{id} - Delete student
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Delete(int id)
        {
            var student = _context.Student.Find(id);
            if (student == null)
                return NotFound(new { message = "Student not found" });

            _context.Student.Remove(student);
            _context.SaveChanges();

            return NoContent();
        }
    }
}
