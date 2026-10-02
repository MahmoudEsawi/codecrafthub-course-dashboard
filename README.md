# CodeCraftHub - Personal Learning Goal Tracker API

## Project Overview
**CodeCraftHub** is a lightweight REST API built with Node.js and Express that allows developers to track courses and personal learning goals. It stores course data in a local JSON file (`courses.json`), eliminating the need for a separate database and providing a straightforward, beginner-friendly introduction to backend web development and RESTful architecture.

---

## Features
- **Full CRUD Operations**: Create, Read, Update, and Delete courses seamlessly.
- **File-Based JSON Storage**: Data persists in `courses.json` without requiring database setup.
- **Auto-Initialization**: Automatically creates the `courses.json` storage file if it does not exist.
- **Auto-Generated Attributes**: Auto-increments course IDs and sets ISO timestamps for `created_at`.
- **Input Validation & Error Handling**: Validates required fields, date formats (`YYYY-MM-DD`), and allowed status values.

---

## Course Data Schema

Each course object contains the following attributes:

| Field | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| `id` | Number | Unique identifier (auto-generated starting from 1) | Auto |
| `name` | String | Name of the course | Yes |
| `description` | String | Brief summary of what the course covers | Yes |
| `target_date` | String | Target completion date formatted as `YYYY-MM-DD` | Yes |
| `status` | String | `"Not Started"`, `"In Progress"`, or `"Completed"` | Yes |
| `created_at` | String | ISO timestamp when the course was created | Auto |

---

## Installation Instructions

1. **Clone or Download the Repository**:
   Navigate to the project directory:
   ```bash
   cd codecrafthub
   ```

2. **Verify Node.js Installation**:
   Ensure you have Node.js (v16 or higher) installed:
   ```bash
   node -v
   npm -v
   ```

3. **Install Dependencies**:
   Install Express and required dependencies:
   ```bash
   npm install
   ```

---

## How to Run the Application

### Start the Server
Run the application using the npm start script:
```bash
npm start
```
Or directly using Node:
```bash
node app.js
```

By default, the server will start at:
```text
http://localhost:5000
```

> **Note**: To use a custom port, set the `PORT` environment variable:
> ```bash
> PORT=5001 npm start
> ```

---

## API Endpoint Documentation

### Base URL
```text
http://localhost:5000/api/courses
```

---

### 1. Get All Courses
Retrieve a list of all tracked courses.

- **Method**: `GET`
- **URL**: `/api/courses`
- **Example Request**:
  ```bash
  curl -X GET http://localhost:5000/api/courses
  ```
- **Example Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "name": "Node.js Basics",
      "description": "Learn Express and REST APIs",
      "target_date": "2026-12-01",
      "status": "In Progress",
      "created_at": "2026-10-02T23:07:36.024Z"
    }
  ]
  ```

---

### 2. Get Course Statistics
Retrieve total course count and breakdown by status.

- **Method**: `GET`
- **URL**: `/api/courses/stats`
- **Example Request**:
  ```bash
  curl -X GET http://localhost:5000/api/courses/stats
  ```
- **Example Response (`200 OK`)**:
  ```json
  {
    "total_courses": 3,
    "by_status": {
      "Not Started": 1,
      "In Progress": 1,
      "Completed": 1
    }
  }
  ```

---

### 3. Get a Specific Course by ID
Retrieve details for a single course.

- **Method**: `GET`
- **URL**: `/api/courses/:id`
- **Example Request**:
  ```bash
  curl -X GET http://localhost:5000/api/courses/1
  ```
- **Example Response (`200 OK`)**:
  ```json
  {
    "id": 1,
    "name": "Node.js Basics",
    "description": "Learn Express and REST APIs",
    "target_date": "2026-12-01",
    "status": "In Progress",
    "created_at": "2026-10-02T23:07:36.024Z"
  }
  ```
- **Error Response (`404 Not Found`)**:
  ```json
  {
    "error": "Course with ID 99 not found"
  }
  ```

---

### 4. Add a New Course
Create and store a new course.

- **Method**: `POST`
- **URL**: `/api/courses`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Node.js Basics",
    "description": "Learn Express and REST APIs",
    "target_date": "2026-12-01",
    "status": "In Progress"
  }
  ```
- **Example Request**:
  ```bash
  curl -X POST http://localhost:5000/api/courses \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Node.js Basics",
      "description": "Learn Express and REST APIs",
      "target_date": "2026-12-01",
      "status": "In Progress"
    }'
  ```
- **Example Response (`201 Created`)**:
  ```json
  {
    "id": 1,
    "name": "Node.js Basics",
    "description": "Learn Express and REST APIs",
    "target_date": "2026-12-01",
    "status": "In Progress",
    "created_at": "2026-10-02T23:07:36.024Z"
  }
  ```

---

### 5. Update an Existing Course
Update all editable fields of a course.

- **Method**: `PUT`
- **URL**: `/api/courses/:id`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Node.js Advanced",
    "description": "Master Express and backend architecture",
    "target_date": "2026-12-15",
    "status": "Completed"
  }
  ```
- **Example Request**:
  ```bash
  curl -X PUT http://localhost:5000/api/courses/1 \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Node.js Advanced",
      "description": "Master Express and backend architecture",
      "target_date": "2026-12-15",
      "status": "Completed"
    }'
  ```
- **Example Response (`200 OK`)**:
  ```json
  {
    "id": 1,
    "name": "Node.js Advanced",
    "description": "Master Express and backend architecture",
    "target_date": "2026-12-15",
    "status": "Completed",
    "created_at": "2026-10-02T23:07:36.024Z"
  }
  ```

---

### 6. Delete a Course
Remove a course from tracking by its ID.

- **Method**: `DELETE`
- **URL**: `/api/courses/:id`
- **Example Request**:
  ```bash
  curl -X DELETE http://localhost:5000/api/courses/1
  ```
- **Example Response (`200 OK`)**:
  ```json
  {
    "message": "Course with ID 1 was successfully deleted",
    "deletedCourse": {
      "id": 1,
      "name": "Node.js Advanced",
      "description": "Master Express and backend architecture",
      "target_date": "2026-12-15",
      "status": "Completed",
      "created_at": "2026-10-02T23:07:36.024Z"
    }
  }
  ```

---

## Troubleshooting

### 1. `Error: listen EADDRINUSE: address already in use :::5000`
- **Cause**: Port 5000 is occupied. On macOS, the system **AirPlay Receiver** uses port 5000 by default.
- **Solution 1**: Run the app on a different port:
  ```bash
  PORT=5001 npm start
  ```
- **Solution 2**: Disable AirPlay Receiver:
  - Open **System Settings** > **General** > **AirDrop & Handoff**.
  - Toggle off **AirPlay Receiver**.

### 2. `SyntaxError: Unexpected end of JSON input`
- **Cause**: The `courses.json` file is empty or contains malformed JSON text.
- **Solution**: The application handles this automatically. If you edited `courses.json` manually, reset it to an empty array:
  ```bash
  echo "[]" > courses.json
  ```

### 3. Missing Required Fields (`400 Bad Request`)
- **Cause**: A request payload is missing one of `name`, `description`, `target_date`, or `status`, or date format is not `YYYY-MM-DD`.
- **Solution**: Ensure your request header has `Content-Type: application/json` and the request body contains all required properties with valid values.
