-- Day 6 assignment: school database (SQLite)
PRAGMA foreign_keys = ON;

-- 1. Students: each student has a unique email address.
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- 2. Courses: each course has a unique name.
CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL
);

-- 3. Enrolments: join table for the many-to-many student/course relationship.
-- A student can enrol in many courses and each course can have many students.
-- UNIQUE(student_id, course_id) prevents duplicate enrolments.
CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    UNIQUE (student_id, course_id)
);

-- Sample data: four students, three courses, and five enrolments.
INSERT INTO students (student_id, full_name, email) VALUES
    (1, 'Amina Otieno', 'amina.otieno@example.com'),
    (2, 'Brian Kamau', 'brian.kamau@example.com'),
    (3, 'Carol Wanjiku', 'carol.wanjiku@example.com'),
    (4, 'David Mwangi', 'david.mwangi@example.com');

INSERT INTO courses (course_id, course_name, description) VALUES
    (1, 'Introduction to Programming', 'Programming fundamentals'),
    (2, 'Database Systems', 'Relational databases and SQL'),
    (3, 'Web Development', 'Building websites and web applications');

INSERT INTO enrolments (enrolment_id, student_id, course_id, grade) VALUES
    (1, 1, 1, 'A'),
    (2, 1, 2, 'B'),
    (3, 2, 1, 'B'),
    (4, 2, 3, 'A'),
    (5, 3, 2, 'A');

-- QUERY 1: All courses taken by one student, selected by the student's name.
SELECT s.full_name, c.course_name, e.grade
FROM students AS s
JOIN enrolments AS e ON e.student_id = s.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE s.full_name = 'Amina Otieno'
ORDER BY c.course_name;

-- QUERY 2: All students enrolled in one course.
SELECT c.course_name, s.full_name, s.email
FROM courses AS c
JOIN enrolments AS e ON e.course_id = c.course_id
JOIN students AS s ON s.student_id = e.student_id
WHERE c.course_name = 'Introduction to Programming'
ORDER BY s.full_name;

-- QUERY 3: Number of students enrolled in each course, including courses with zero enrolments.
SELECT c.course_name, COUNT(e.student_id) AS student_count
FROM courses AS c
LEFT JOIN enrolments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name
ORDER BY c.course_name;

-- QUERY 4: Students who have no enrolments.
SELECT s.student_id, s.full_name, s.email
FROM students AS s
LEFT JOIN enrolments AS e ON e.student_id = s.student_id
WHERE e.enrolment_id IS NULL
ORDER BY s.full_name;

-- QUERY 5: Update the grade for Amina Otieno in Introduction to Programming.
UPDATE enrolments
SET grade = 'A-'
WHERE student_id = 1 AND course_id = 1;
