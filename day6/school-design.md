# School Database Design

## Tables

- **students:** Stores each student's ID, full name, and email address. The ID is the primary key, and the email is both required and unique so that two students cannot share the same email address.
- **courses:** Stores each course's ID, name, and description. The ID is the primary key, and the course name is required and unique.
- **enrolments:** Records which student is taking which course, along with that student's grade for the course. Its primary key is `enrolment_id`; `student_id` and `course_id` are foreign keys referencing `students` and `courses`. Both foreign keys are required. A unique constraint on `(student_id, course_id)` prevents a student from being enrolled in the same course more than once.

## Relationships

The relationship between **students and enrolments is one-to-many**: one student can have several enrolment records, while each enrolment belongs to one student. The relationship between **courses and enrolments is also one-to-many**: one course can appear in many enrolment records, while each enrolment refers to one course.

Together, students and courses have a **many-to-many relationship**. A student can take several courses, and a course can have several students. The `enrolments` table is needed as a join table to represent this relationship. It connects the two tables using foreign keys and stores information specific to that pairing, such as the grade. The unique constraint on the two foreign keys prevents duplicate student-course pairs.

## Index

I would add an index on `enrolments(course_id)`. It would help queries that find all students taking a particular course and queries that count enrolments per course. SQLite automatically creates indexes for primary keys and unique constraints, but a regular foreign-key column does not automatically receive an index.

```sql
CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);
```

## SQL or NoSQL?

I would choose **SQL** for this school system. The data has clear relationships between students, courses, and enrolments, and each enrolment must reference a real student and a real course. A relational database such as SQLite supports primary keys, foreign keys, unique constraints, and joins, which help maintain accurate data and answer questions about enrolments and grades. NoSQL can be useful for flexible or rapidly changing data structures, but the structured relationships and integrity rules in this system make SQL the better fit.
