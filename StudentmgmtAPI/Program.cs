using Microsoft.EntityFrameworkCore;
using StudentmgmtAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddDbContext<ApiContext>(opt =>
    opt.UseInMemoryDatabase("StudentmgmtDb"));

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Custom schema order
    c.CustomSchemaIds(type =>
    {
        return type.Name switch
        {
            "Student" => "_1_Student",
            "course" => "_2_course",
            "Enrollment" => "_3_Enrollment",
            _ => type.Name
        };
    });
});


var app = builder.Build();

// Enable CORS
app.UseCors();

// Serve frontend FIRST
app.UseDefaultFiles();  // serves wwwroot/index.html automatically
app.UseStaticFiles();   // serves wwwroot files

// Enable HTTPS redirection
app.UseHttpsRedirection();

// Authorization
app.UseAuthorization();

// Map API controllers
app.MapControllers();

// Enable Swagger LAST
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Student API V1");
        c.RoutePrefix = "swagger"; // Swagger now on /swagger
    });
}

app.Run();

