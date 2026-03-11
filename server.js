import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import { testConnection } from './src/models/db.js';
import { getAllOrganizations } from './src/models/organizations.js';
import { getAllServiceProjects } from './src/models/service_project.js';
import { getAllCategories } from './src/models/categories.js';
dotenv.config();
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'development';
const PORT = process.env.PORT || 3000;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Configure express middleware
 */
// Set EJS as the tempalate engine
app.set('view engine', 'ejs');

// Tell express where to find the views
app.set('views', path.join(__dirname, 'src/views'));

//Server static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
// Home route
app.get('/', async (req, res) => {
  const title = 'Home';
  res.render('home', { title });
});
// Organizations route
app.get('/organization', async (req, res) => {
  const organizations = await getAllOrganizations();
  const title = 'Our Partner Organizations';
  res.render('organization', { title, organizations });
});

// Projects route
app.get('/projects', async (req, res) => {
  const projects = await getAllServiceProjects();
  const title = 'Projects';
  res.render('projects', { title, projects });
});
// Categories route
app.get('/categories', async (req, res) => {
  const categories = await getAllCategories();
  const title = 'Categories';
  res.render('categories', {
    title, categories
  });
});



app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
  } catch (error) {
    console.error('Failed to start server due to database connection error:', error.message);
  }
});