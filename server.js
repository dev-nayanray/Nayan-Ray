require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Public API routes
app.get('/api/projects', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projects');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/testimonials', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, author, content, position, rating, image, created_at FROM testimonials');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await pool.query(
            'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
            [name, email, message]
        );
        res.json({ message: 'Message sent successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/blogs', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                id, 
                title, 
                author, 
                created_at, 
                excerpt, 
                slug, 
                image, 
                category 
            FROM 
                blogs 
            ORDER BY 
                created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/blogs/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin routes
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUsername && password === adminPassword) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Admin CRUD routes for projects
app.get('/api/admin/projects', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projects');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.post('/api/admin/projects', async (req, res) => {
    const { title, description, image_url } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO projects (title, description, image_url) VALUES (?, ?, ?)',
            [title, description, image_url]
        );
        res.json({ id: result.insertId, title, description, image_url });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.put('/api/admin/projects/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, image_url } = req.body;
    try {
        await pool.query(
            'UPDATE projects SET title = ?, description = ?, image_url = ? WHERE id = ?',
            [title, description, image_url, id]
        );
        res.json({ message: 'Project updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});

app.delete('/api/admin/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM projects WHERE id = ?', [id]);
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Admin CRUD routes for testimonials
app.get('/api/admin/testimonials', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM testimonials');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

app.post('/api/admin/testimonials', async (req, res) => {
    const { author, content, position, rating, image } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO testimonials (author, content, position, rating, image) VALUES (?, ?, ?, ?, ?)',
            [author, content, position, rating, image]
        );
        res.json({ id: result.insertId, author, content, position, rating, image });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create testimonial' });
    }
});

app.delete('/api/admin/testimonials/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM testimonials WHERE id = ?', [id]);
        res.json({ message: 'Testimonial deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete testimonial' });
    }
});

// Admin contact routes
app.get('/api/admin/contacts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching contacts:', err);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

app.delete('/api/admin/contacts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM contacts WHERE id = ?', [id]);
        res.json({ message: 'Contact deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

// Admin Blog Routes
app.get('/api/admin/blogs', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/blogs', async (req, res) => {
    const { title, content, author } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO blogs (title, content, author) VALUES (?, ?, ?)',
            [title, content, author || 'Admin']
        );
        res.json({ 
            success: true, 
            message: 'Blog post created successfully',
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/admin/blogs/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, author } = req.body;
    try {
        await pool.query(
            'UPDATE blogs SET title = ?, content = ?, author = ? WHERE id = ?',
            [title, content, author || 'Admin', id]
        );
        res.json({ success: true, message: 'Blog post updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/admin/blogs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM blogs WHERE id = ?', [id]);
        res.json({ success: true, message: 'Blog post deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Catch-all route for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});