const BASE_URL = 'https://localhost:7272/api';


const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');
const successElement = document.getElementById('success-message');

function showLoading(show) {
    loadingElement.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => { errorElement.style.display = 'none'; }, 4000);
}

function showSuccess(message) {
    successElement.textContent = message;
    successElement.style.display = 'block';
    setTimeout(() => { successElement.style.display = 'none'; }, 3000);
}


async function request(endpoint, method = 'GET', data = null) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        options.body = JSON.stringify(data);
    }

    showLoading(true);
    try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.status !== 204 ? await res.json() : null;
    } catch (err) {
        showError(err.message);
        throw err;
    } finally {
        showLoading(false);
    }
}


function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}


let students = [];
let courses = [];
let enrollments = [];


let currentView = 'students';
function switchView(viewId) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(viewId);
    if (target) {
        target.style.display = 'block';
        currentView = viewId;
        if (viewId === 'students') loadStudents();
        if (viewId === 'courses') loadCourses();
        if (viewId === 'enrollments') loadDropdowns();
    }
}


async function loadStudents() {
    try {
        document.getElementById('students-loading').style.display = 'block';
        const list = await request('/students');
        students = Array.isArray(list) ? list : [];
        renderStudentsTable();
        document.getElementById('no-students').style.display = students.length ? 'none' : 'block';
    } catch (err) {
        console.error(err);
    } finally {
        document.getElementById('students-loading').style.display = 'none';
    }
}

function renderStudentsTable() {
    const tbody = document.querySelector('#studentTable tbody');
    tbody.innerHTML = '';
    students.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${s.id}</td>
            <td>${s.firstName} ${s.lastName}</td>
            <td>${s.email}</td>
            <td>${s.dateOfBirth ?? ''}</td>
            <td>
                <button onclick="editStudent(${s.id})">Edit</button>
                <button onclick="deleteStudent(${s.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function saveStudent() {
    const id = document.getElementById('s_id').value;
    const firstName = document.getElementById('s_first').value.trim();
    const lastName = document.getElementById('s_last').value.trim();
    const email = document.getElementById('s_email').value.trim();
    const dob = document.getElementById('s_dob').value;

    if (!firstName || !lastName || !email || !dob) return showError('All fields are required');
    if (!validateEmail(email)) return showError('Invalid email');

    const payload = { firstName, lastName, email, dateOfBirth: dob };

    try {
        if (id) {
            await request(`/students/${id}`, 'PUT', payload);
            showSuccess('Student updated successfully!');
        } else {
            await request('/students', 'POST', payload);
            showSuccess('Student added successfully!');
        }

        clearStudentForm();
        toggleStudentEdit(false);
        await loadStudents();
        await loadDropdowns();
    } catch (err) {
        console.error(err);
    }
}

function editStudent(id) {
    const s = students.find(st => st.id === id);
    if (!s) return;
    document.getElementById('s_id').value = s.id;
    document.getElementById('s_first').value = s.firstName;
    document.getElementById('s_last').value = s.lastName;
    document.getElementById('s_email').value = s.email;
    document.getElementById('s_dob').value = s.dateOfBirth ?? '';
    toggleStudentEdit(true);
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
        await request(`/students/${id}`, 'DELETE');
        showSuccess('Student deleted successfully!');
        await loadStudents();
        await loadDropdowns();
    } catch (err) {
        console.error(err);
    }
}

function clearStudentForm() {
    document.getElementById('s_id').value = '';
    document.getElementById('s_first').value = '';
    document.getElementById('s_last').value = '';
    document.getElementById('s_email').value = '';
    document.getElementById('s_dob').value = '';
}

function cancelEditStudent() {
    clearStudentForm();
    toggleStudentEdit(false);
}

function toggleStudentEdit(isEditing) {
    document.getElementById('student-form-title').textContent = isEditing ? 'Edit Student' : 'Add New Student';
    document.getElementById('student-btn-text').textContent = isEditing ? 'Update Student' : 'Add Student';
    document.getElementById('cancel-edit-btn').style.display = isEditing ? 'inline-block' : 'none';
}


async function loadCourses() {
    try {
        document.getElementById('courses-loading').style.display = 'block';
        const list = await request('/courses');
        courses = Array.isArray(list) ? list : [];
        renderCoursesTable();
        document.getElementById('no-courses').style.display = courses.length ? 'none' : 'block';
    } catch (err) {
        console.error(err);
    } finally {
        document.getElementById('courses-loading').style.display = 'none';
    }
}

function renderCoursesTable() {
    const tbody = document.querySelector('#courseTable tbody');
    tbody.innerHTML = '';
    courses.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.description}</td>
            <td>
                <button onclick="editCourse(${c.id})">Edit</button>
                <button onclick="deleteCourse(${c.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function saveCourse() {
    const id = document.getElementById('c_id').value;
    const name = document.getElementById('c_name').value.trim();
    const desc = document.getElementById('c_desc').value.trim();

    if (!name || !desc) return showError('All fields are required');

    const payload = { name, description: desc };

    try {
        if (id) {
            await request(`/courses/${id}`, 'PUT', payload);
            showSuccess('Course updated successfully!');
        } else {
            await request('/courses', 'POST', payload);
            showSuccess('Course added successfully!');
        }

        clearCourseForm();
        toggleCourseEdit(false);
        await loadCourses();
        await loadDropdowns();
    } catch (err) {
        console.error(err);
    }
}

function editCourse(id) {
    const c = courses.find(co => co.id === id);
    if (!c) return;
    document.getElementById('c_id').value = c.id;
    document.getElementById('c_name').value = c.name;
    document.getElementById('c_desc').value = c.description;
    toggleCourseEdit(true);
}

async function deleteCourse(id) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
        await request(`/courses/${id}`, 'DELETE');
        showSuccess('Course deleted successfully!');
        await loadCourses();
        await loadDropdowns();
    } catch (err) {
        console.error(err);
    }
}

function clearCourseForm() {
    document.getElementById('c_id').value = '';
    document.getElementById('c_name').value = '';
    document.getElementById('c_desc').value = '';
}

function cancelEditCourse() {
    clearCourseForm();
    toggleCourseEdit(false);
}

function toggleCourseEdit(isEditing) {
    document.getElementById('course-form-title').textContent = isEditing ? 'Edit Course' : 'Add New Course';
    document.getElementById('course-btn-text').textContent = isEditing ? 'Update Course' : 'Add Course';
    document.getElementById('cancel-edit-course-btn').style.display = isEditing ? 'inline-block' : 'none';
}


async function loadDropdowns() {
    try {
        students = await request('/students');
        courses = await request('/courses');

        const studentSelect = document.getElementById('e_student');
        const viewStudentSelect = document.getElementById('e_view_student');
        const courseSelect = document.getElementById('e_course');

        studentSelect.innerHTML = '<option value="">Select Student</option>';
        viewStudentSelect.innerHTML = '<option value="">Select student to view enrollments</option>';
        courseSelect.innerHTML = '<option value="">Select Course</option>';

        students.forEach(s => {
            const opt1 = document.createElement('option');
            opt1.value = s.id;
            opt1.textContent = `${s.firstName} ${s.lastName}`;
            studentSelect.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = s.id;
            opt2.textContent = `${s.firstName} ${s.lastName}`;
            viewStudentSelect.appendChild(opt2);
        });

        courses.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            courseSelect.appendChild(opt);
        });

        await loadEnrollments();
    } catch (err) {
        console.error(err);
    }
}

async function loadEnrollments() {
    const studentId = document.getElementById('e_view_student').value;
    if (!studentId) return;

    try {
        document.getElementById('enrollments-loading').style.display = 'block';
        const list = await request(`/enrollments/student/${studentId}`);
        enrollments = Array.isArray(list) ? list : [];
        renderEnrollmentsTable(enrollments);
        document.getElementById('no-enrollments').style.display = enrollments.length ? 'none' : 'block';
    } catch (err) {
        console.error(err);
    } finally {
        document.getElementById('enrollments-loading').style.display = 'none';
    }
}

function renderEnrollmentsTable(list) {
    const tbody = document.querySelector('#enrollTable tbody');
    tbody.innerHTML = '';
    list.forEach(e => {
        const student = students.find(s => s.id === e.studentId);
        const course = courses.find(c => c.id === e.courseId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${e.id}</td>
            <td>${student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</td>
            <td>${course ? course.name : 'Unknown'}</td>
            <td>${e.enrollmentDate ?? ''}</td>
            <td>
                <button onclick="editEnrollment(${e.id})">Edit</button>
                <button onclick="deleteEnrollment(${e.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function saveEnrollment() {
    const id = document.getElementById('e_id').value;
    const studentId = document.getElementById('e_student').value;
    const courseId = document.getElementById('e_course').value;

    if (!studentId || !courseId) return showError('Select both student and course');

    const payload = {
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
        enrollmentDate: new Date().toISOString().split('T')[0]
    };

    try {
        if (id) {
            await request(`/enrollments/${id}`, 'PUT', payload);
            showSuccess('Enrollment updated successfully!');
        } else {
            await request('/enrollments', 'POST', payload);
            showSuccess('Enrollment added successfully!');
        }

        clearEnrollmentForm();
        toggleEnrollmentEdit(false);
        await loadEnrollments();
    } catch (err) {
        console.error(err);
    }
}

function editEnrollment(id) {
    document.getElementById('e_id').value = id;
    toggleEnrollmentEdit(true);
}

async function deleteEnrollment(id) {
    if (!confirm('Are you sure you want to delete this enrollment?')) return;
    try {
        await request(`/enrollments/${id}`, 'DELETE');
        showSuccess('Enrollment deleted successfully!');
        await loadEnrollments();
    } catch (err) {
        console.error(err);
    }
}

function clearEnrollmentForm() {
    document.getElementById('e_id').value = '';
    document.getElementById('e_student').value = '';
    document.getElementById('e_course').value = '';
}

function cancelEditEnrollment() {
    clearEnrollmentForm();
    toggleEnrollmentEdit(false);
}

function toggleEnrollmentEdit(isEditing) {
    document.getElementById('enrollment-form-title').textContent = isEditing ? 'Edit Enrollment' : 'Add New Enrollment';
    document.getElementById('enrollment-btn-text').textContent = isEditing ? 'Update Enrollment' : 'Add Enrollment';
    document.getElementById('cancel-edit-enrollment-btn').style.display = isEditing ? 'inline-block' : 'none';
}

window.onload = async function () {
    try {
        await Promise.all([loadStudents(), loadCourses(), loadDropdowns()]);
        switchView('students');
    } catch (err) {
        showError('Failed to initialize: ' + err.message);
    }
};
