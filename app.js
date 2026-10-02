// =============================================================================
// CodeCraftHub - Simple Course Tracking REST API
// =============================================================================
// A beginner-friendly Express application demonstrating REST API fundamentals
// with JSON file storage (no database required).

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Initialize Express application
const app = express();
// Default to port 5000 as per requirements, or process.env.PORT if configured
const PORT = process.env.PORT || 5000;

// Path to the JSON data file
const DATA_FILE = path.join(__dirname, 'courses.json');

// Valid status values allowed for courses
const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed'];

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------
// Built-in middleware to automatically parse incoming JSON request bodies
app.use(express.json());

// Enable CORS for frontend dashboard connections (e.g. from Bolt or local UI)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// -----------------------------------------------------------------------------
// Helper Functions for File Operations
// -----------------------------------------------------------------------------

/**
 * Ensures that the courses.json file exists.
 * If the file does not exist, it creates one initialized with an empty array `[]`.
 */
async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // File does not exist, create it with empty array
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
    console.log('Created courses.json file');
  }
}

/**
 * Reads all courses from the JSON file.
 * Returns an array of course objects.
 */
async function readCourses() {
  await initializeDataFile();
  const data = await fs.readFile(DATA_FILE, 'utf8');
  try {
    return JSON.parse(data);
  } catch (error) {
    // If the file is somehow corrupted or empty, reset to empty array
    return [];
  }
}

/**
 * Writes the courses array to the JSON file with 2-space indentation.
 */
async function writeCourses(courses) {
  await initializeDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(courses, null, 2), 'utf8');
}

/**
 * Helper to validate the YYYY-MM-DD date format.
 */
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const timestamp = Date.parse(dateString);
  return !isNaN(timestamp);
}

// -----------------------------------------------------------------------------
// REST API Routes
// -----------------------------------------------------------------------------

/**
 * Root Route - Welcome message and available endpoints (or interactive dashboard in browser)
 */
app.get('/', (req, res) => {
  if (req.accepts('html') && !req.accepts('json')) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  res.json({
    message: 'Welcome to CodeCraftHub API!',
    documentation: {
      'GET /api/courses': 'Get all courses',
      'GET /api/courses/stats': 'Get course statistics by status',
      'GET /api/courses/:id': 'Get a specific course by ID',
      'POST /api/courses': 'Create a new course',
      'PUT /api/courses/:id': 'Update an existing course by ID',
      'DELETE /api/courses/:id': 'Delete a course by ID'
    }
  });
});

/**
 * 1. GET /api/courses
 * Description: Retrieve all courses from courses.json
 */
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await readCourses();
    return res.status(200).json(courses);
  } catch (error) {
    console.error('Error reading courses:', error);
    return res.status(500).json({ error: 'Failed to retrieve courses from storage' });
  }
});

/**
 * 2. GET /api/courses/stats
 * Description: Retrieve statistics about courses (total and counts by status)
 * NOTE: Defined BEFORE /api/courses/:id so Express does not treat 'stats' as a numeric ID parameter.
 */
app.get('/api/courses/stats', async (req, res) => {
  try {
    const courses = await readCourses();

    const stats = {
      total_courses: courses.length,
      by_status: {
        'Not Started': courses.filter((c) => c.status === 'Not Started').length,
        'In Progress': courses.filter((c) => c.status === 'In Progress').length,
        'Completed': courses.filter((c) => c.status === 'Completed').length
      }
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error calculating course statistics:', error);
    return res.status(500).json({ error: 'Failed to calculate course statistics' });
  }
});

/**
 * 3. GET /api/courses/:id
 * Description: Retrieve a single course by its ID
 */
app.get('/api/courses/:id', async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    // Check if ID is a valid number
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Course ID must be a valid number' });
    }

    const courses = await readCourses();
    const course = courses.find((c) => c.id === courseId);

    if (!course) {
      return res.status(404).json({ error: `Course with ID ${courseId} not found` });
    }

    return res.status(200).json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return res.status(500).json({ error: 'Failed to retrieve the course' });
  }
});

/**
 * 4. POST /api/courses
 * Description: Create and add a new course
 * Expected Body: { name, description, target_date, status }
 */
app.post('/api/courses', async (req, res) => {
  try {
    const { name, description, target_date, status } = req.body;

    // Validation: Check for required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Field "name" is required and cannot be empty' });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Field "description" is required and cannot be empty' });
    }

    if (!target_date || !isValidDate(target_date)) {
      return res.status(400).json({
        error: 'Field "target_date" is required and must be in YYYY-MM-DD format'
      });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Field "status" is required and must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const courses = await readCourses();

    // Auto-generate ID starting from 1
    const newId = courses.length > 0
      ? Math.max(...courses.map((c) => c.id)) + 1
      : 1;

    // Create the new course object
    const newCourse = {
      id: newId,
      name: name.trim(),
      description: description.trim(),
      target_date: target_date.trim(),
      status: status,
      created_at: new Date().toISOString()
    };

    // Add to the list and save
    courses.push(newCourse);
    await writeCourses(courses);

    return res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({ error: 'Failed to save the new course' });
  }
});

/**
 * 5. PUT /api/courses/:id
 * Description: Update an existing course by its ID
 * Expected Body: Any combination of { name, description, target_date, status }
 */
app.put('/api/courses/:id', async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Course ID must be a valid number' });
    }

    const { name, description, target_date, status } = req.body;

    // Check if at least one field to update was provided
    if (
      name === undefined &&
      description === undefined &&
      target_date === undefined &&
      status === undefined
    ) {
      return res.status(400).json({
        error: 'Please provide at least one field to update: name, description, target_date, or status'
      });
    }

    // Validation for fields if they are provided
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ error: 'Field "name" cannot be empty' });
    }

    if (description !== undefined && (typeof description !== 'string' || !description.trim())) {
      return res.status(400).json({ error: 'Field "description" cannot be empty' });
    }

    if (target_date !== undefined && !isValidDate(target_date)) {
      return res.status(400).json({
        error: 'Field "target_date" must be in YYYY-MM-DD format'
      });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Field "status" must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const courses = await readCourses();
    const courseIndex = courses.findIndex((c) => c.id === courseId);

    if (courseIndex === -1) {
      return res.status(404).json({ error: `Course with ID ${courseId} not found` });
    }

    // Preserve original fields and update only provided ones
    const existing = courses[courseIndex];
    const updatedCourse = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      description: description !== undefined ? description.trim() : existing.description,
      target_date: target_date !== undefined ? target_date.trim() : existing.target_date,
      status: status !== undefined ? status : existing.status
    };

    courses[courseIndex] = updatedCourse;
    await writeCourses(courses);

    return res.status(200).json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    return res.status(500).json({ error: 'Failed to update the course' });
  }
});

/**
 * 6. DELETE /api/courses/:id
 * Description: Delete a course by its ID
 */
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Course ID must be a valid number' });
    }

    const courses = await readCourses();
    const courseIndex = courses.findIndex((c) => c.id === courseId);

    if (courseIndex === -1) {
      return res.status(404).json({ error: `Course with ID ${courseId} not found` });
    }

    // Remove the course from array
    const deletedCourse = courses.splice(courseIndex, 1)[0];
    await writeCourses(courses);

    return res.status(200).json({
      message: `Course with ID ${courseId} was successfully deleted`,
      deletedCourse
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return res.status(500).json({ error: 'Failed to delete the course' });
  }
});

// -----------------------------------------------------------------------------
// Start the Server
// -----------------------------------------------------------------------------
if (require.main === module) {
  const server = app.listen(PORT, async () => {
    // Ensure the storage file is ready upon server start
    await initializeDataFile();
    console.log(`- CodeCraftHub API is starting...`);
    console.log(`- Data will be stored in: ${DATA_FILE}`);
    console.log(`- API is available at: http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[ERROR] Port ${PORT} is already in use.`);
      console.error(`Note: On macOS, AirPlay Receiver listens on port 5000.`);
      console.error(`You can turn off AirPlay Receiver in System Settings > General > AirDrop & Handoff,`);
      console.error(`or run on an alternate port: PORT=5001 npm start\n`);
    } else {
      console.error('Server error:', err);
    }
  });
}

module.exports = app;
