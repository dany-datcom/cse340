import { fileURLToPath } from 'url';
import path from 'path';
import express from'express';
import dotenv from 'dotenv';
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


app.get('/', async (req, res) => {
    const title = 'Home';
    res.render('home', { title });
});

app.get('/organizations', (req, res) => {
  const title = 'Organizations';
  res.render('organization', { title });
});
app.get('/projects', (req, res) => {
  const title = 'Projects';
  res.render('projects', { title });
});



app.listen(PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});