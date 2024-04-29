-- Add migration script here

CREATE TABLE Subjects(
    id SERIAL PRIMARY KEY,
    subject VARCHAR(32) NOT NULL UNIQUE
);

CREATE TABLE Rooms(
    id SERIAL PRIMARY KEY,
    room VARCHAR(10) NOT NULL UNIQUE,
    subject_id INTEGER REFERENCES Subjects
);

CREATE TYPE Role AS ENUM('teacher', 'principal');

CREATE TABLE Employees(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(32) NOT NULL,
    last_name VARCHAR(32) NOT NULL,
    middle_name VARCHAR(32),
    phone VARCHAR(16) NOT NULL UNIQUE,
    password_hash VARCHAR(128) NOT NULL,
    employed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    role Role NOT NULL
);

CREATE TABLE Teachers(
    employee_id INTEGER PRIMARY KEY REFERENCES Employees ON DELETE CASCADE,
    room_id INTEGER REFERENCES Rooms,
    subject_id INTEGER NOT NULL REFERENCES Subjects
);

CREATE TABLE Classes(
    id SERIAL PRIMARY KEY,
    class VARCHAR(32) NOT NULL UNIQUE
);

CREATE TABLE Students(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(32) NOT NULL,
    last_name VARCHAR(32) NOT NULL,
    middle_name VARCHAR(32),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    class_id INTEGER NOT NULL REFERENCES Classes,

    UNIQUE (first_name, last_name, middle_name, class_id)
);

CREATE TABLE Marks(
    id SERIAL PRIMARY KEY,
    mark SMALLINT NOT NULL,
    student_id INTEGER NOT NULL REFERENCES Students,
    subject_id INTEGER NOT NULL REFERENCES Subjects,
    teacher_id INTEGER NOT NULL REFERENCES Teachers,
    time TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (mark BETWEEN 2 AND 5)
);
