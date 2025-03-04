// Authentication
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('isAuthenticated', 'true');
            toggleDashboardVisibility(true);
            loadInitialData();
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        alert('Login error: ' + error.message);
    }
});

// Dashboard Functions
function toggleDashboardVisibility(show) {
    document.getElementById('loginSection').classList.toggle('d-none', show);
    document.getElementById('dashboardSection').classList.toggle('d-none', !show);
}

function loadInitialData() {
    const activeTab = document.querySelector('.list-group-item.active').getAttribute('href');
    switch (activeTab) {
        case '#projects': fetchProjects(); break;
        case '#testimonials': fetchTestimonials(); break;
        case '#contacts': fetchContacts(); break;
        case '#blogs': fetchBlogs(); break;
    }
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('isAuthenticated');
    window.location.reload();
});

// Tab Switching
document.querySelectorAll('.list-group-item').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        // Remove active class from all tabs and content
        document.querySelectorAll('.list-group-item').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(content => content.classList.add('d-none'));

        // Add active class to clicked tab and show corresponding content
        this.classList.add('active');
        const contentId = this.getAttribute('href').substring(1) + 'Content';
        document.getElementById(contentId).classList.remove('d-none');

        // Load data for the active tab
        loadInitialData();
    });
});

// Project CRUD
async function fetchProjects() {
    try {
        const response = await fetch('/api/admin/projects');
        const projects = await response.json();
        renderProjectsTable(projects);
    } catch (error) {
        alert('Error fetching projects: ' + error.message);
    }
}

function renderProjectsTable(projects) {
    const tbody = projects.map(project => `
        <tr>
            <td>${project.title}</td>
            <td>${project.description}</td>
            <td><img src="${project.image_url}" alt="${project.title}" width="100"></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProject(${project.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProject(${project.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('projectsTable').innerHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Image</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>${tbody}</tbody>
        </table>`;
}

async function editProject(id) {
    try {
        const response = await fetch(`/api/admin/projects/${id}`);
        const project = await response.json();
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('projectImageUrl').value = project.image_url;
        new bootstrap.Modal(document.getElementById('projectModal')).show();
    } catch (error) {
        alert('Error fetching project: ' + error.message);
    }
}

async function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
            fetchProjects();
        } catch (error) {
            alert('Error deleting project: ' + error.message);
        }
    }
}

document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const projectData = {
        id: document.getElementById('projectId').value,
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        image_url: document.getElementById('projectImageUrl').value
    };

    try {
        const response = await fetch(projectData.id ? `/api/admin/projects/${projectData.id}` : '/api/admin/projects', {
            method: projectData.id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            fetchProjects();
            bootstrap.Modal.getInstance(document.getElementById('projectModal')).hide();
        }
    } catch (error) {
        alert('Error saving project: ' + error.message);
    }
});

// Testimonial CRUD
async function fetchTestimonials() {
    try {
        const response = await fetch('/api/admin/testimonials');
        const testimonials = await response.json();
        renderTestimonialsTable(testimonials);
    } catch (error) {
        alert('Error fetching testimonials: ' + error.message);
    }
}

function renderTestimonialsTable(testimonials) {
    const tbody = testimonials.map(testimonial => `
        <tr>
            <td>${testimonial.author}</td>
            <td>${testimonial.content}</td>
            <td>${testimonial.position}</td>
            <td>${testimonial.rating}</td>
            <td><img src="${testimonial.image}" alt="${testimonial.author}" width="100"></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editTestimonial(${testimonial.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteTestimonial(${testimonial.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('testimonialsTable').innerHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Author</th>
                    <th>Content</th>
                    <th>Position</th>
                    <th>Rating</th>
                    <th>Image</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>${tbody}</tbody>
        </table>`;
}

async function editTestimonial(id) {
    try {
        const response = await fetch(`/api/admin/testimonials/${id}`);
        const testimonial = await response.json();
        document.getElementById('testimonialId').value = testimonial.id;
        document.getElementById('testimonialAuthor').value = testimonial.author;
        document.getElementById('testimonialContent').value = testimonial.content;
        document.getElementById('testimonialPosition').value = testimonial.position;
        document.getElementById('testimonialRating').value = testimonial.rating;
        document.getElementById('testimonialImage').value = testimonial.image;
        new bootstrap.Modal(document.getElementById('testimonialModal')).show();
    } catch (error) {
        alert('Error fetching testimonial: ' + error.message);
    }
}

async function deleteTestimonial(id) {
    if (confirm('Are you sure you want to delete this testimonial?')) {
        try {
            await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
            fetchTestimonials();
        } catch (error) {
            alert('Error deleting testimonial: ' + error.message);
        }
    }
}

document.getElementById('testimonialForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const testimonialData = {
        id: document.getElementById('testimonialId').value,
        author: document.getElementById('testimonialAuthor').value,
        content: document.getElementById('testimonialContent').value,
        position: document.getElementById('testimonialPosition').value,
        rating: document.getElementById('testimonialRating').value,
        image: document.getElementById('testimonialImage').value
    };

    try {
        const response = await fetch(testimonialData.id ? `/api/admin/testimonials/${testimonialData.id}` : '/api/admin/testimonials', {
            method: testimonialData.id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testimonialData)
        });

        if (response.ok) {
            fetchTestimonials();
            bootstrap.Modal.getInstance(document.getElementById('testimonialModal')).hide();
        }
    } catch (error) {
        alert('Error saving testimonial: ' + error.message);
    }
});

// Contact CRUD
async function fetchContacts() {
    try {
        const response = await fetch('/api/admin/contacts');
        const contacts = await response.json();
        renderContactsTable(contacts);
    } catch (error) {
        alert('Error fetching contacts: ' + error.message);
    }
}

function renderContactsTable(contacts) {
    const tbody = contacts.map(contact => `
        <tr>
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${contact.message}</td>
            <td>${new Date(contact.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteContact(${contact.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('contactsTable').innerHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>${tbody}</tbody>
        </table>`;
}

async function deleteContact(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
        try {
            await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
            fetchContacts();
        } catch (error) {
            alert('Error deleting contact: ' + error.message);
        }
    }
}

// Blog CRUD
async function fetchBlogs() {
    try {
        const response = await fetch('/api/admin/blogs');
        const blogs = await response.json();
        renderBlogsTable(blogs);
    } catch (error) {
        alert('Error fetching blogs: ' + error.message);
    }
}

function renderBlogsTable(blogs) {
    const tbody = blogs.map(blog => `
        <tr>
            <td>${blog.title}</td>
            <td>${blog.author}</td>
            <td>${blog.excerpt}</td>
            <td>${blog.category}</td>
            <td><img src="${blog.image}" alt="${blog.title}" width="100"></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editBlog(${blog.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteBlog(${blog.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('blogsTable').innerHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Excerpt</th>
                    <th>Category</th>
                    <th>Image</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>${tbody}</tbody>
        </table>`;
}

async function editBlog(id) {
    try {
        const response = await fetch(`/api/admin/blogs/${id}`);
        const blog = await response.json();
        document.getElementById('blogId').value = blog.id;
        document.getElementById('blogTitle').value = blog.title;
        document.getElementById('blogContent').value = blog.content;
        document.getElementById('blogAuthor').value = blog.author;
        document.getElementById('blogExcerpt').value = blog.excerpt;
        document.getElementById('blogCategory').value = blog.category;
        document.getElementById('blogImage').value = blog.image;
        new bootstrap.Modal(document.getElementById('blogModal')).show();
    } catch (error) {
        alert('Error fetching blog: ' + error.message);
    }
}

async function deleteBlog(id) {
    if (confirm('Are you sure you want to delete this blog?')) {
        try {
            await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
            fetchBlogs();
        } catch (error) {
            alert('Error deleting blog: ' + error.message);
        }
    }
}

document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const blogData = {
        id: document.getElementById('blogId').value,
        title: document.getElementById('blogTitle').value,
        content: document.getElementById('blogContent').value,
        author: document.getElementById('blogAuthor').value,
        excerpt: document.getElementById('blogExcerpt').value,
        category: document.getElementById('blogCategory').value,
        image: document.getElementById('blogImage').value
    };

    try {
        const response = await fetch(blogData.id ? `/api/admin/blogs/${blogData.id}` : '/api/admin/blogs', {
            method: blogData.id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blogData)
        });

        if (response.ok) {
            fetchBlogs();
            bootstrap.Modal.getInstance(document.getElementById('blogModal')).hide();
        }
    } catch (error) {
        alert('Error saving blog: ' + error.message);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('isAuthenticated')) {
        toggleDashboardVisibility(true);
        loadInitialData();
    }
});

// Dark Mode Toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('bg-light');
    document.body.classList.toggle('bg-dark');
    document.body.classList.toggle('text-light');
});

// Profile Form Submission
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const profileData = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        password: document.getElementById('profilePassword').value
    };

    try {
        // Simulate profile update (replace with actual API call)
        alert('Profile updated successfully!');
    } catch (error) {
        alert('Error updating profile: ' + error.message);
    }
});

// Function to fetch and display total counts
async function fetchTotalCounts() {
    try {
        // Fetch total projects
        const projectsResponse = await fetch('/api/admin/projects');
        const projects = await projectsResponse.json();
        document.getElementById('totalProjects').textContent = projects.length;

        // Fetch total testimonials
        const testimonialsResponse = await fetch('/api/admin/testimonials');
        const testimonials = await testimonialsResponse.json();
        document.getElementById('totalTestimonials').textContent = testimonials.length;

        // Fetch total contacts
        const contactsResponse = await fetch('/api/admin/contacts');
        const contacts = await contactsResponse.json();
        document.getElementById('totalContacts').textContent = contacts.length;

        // Fetch total blogs
        const blogsResponse = await fetch('/api/admin/blogs');
        const blogs = await blogsResponse.json();
        document.getElementById('totalBlogs').textContent = blogs.length;
    } catch (error) {
        console.error('Error fetching total counts:', error);
    }
}

// Call fetchTotalCounts when the dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('isAuthenticated')) {
        fetchTotalCounts();
    }
});

// Search Functionality
document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('searchInput').value.trim().toLowerCase();

    if (!query) {
        alert('Please enter a search term.');
        return;
    }

    // Fetch all data (projects, testimonials, contacts, blogs)
    try {
        const [projects, testimonials, contacts, blogs] = await Promise.all([
            fetch('/api/admin/projects').then(res => res.json()),
            fetch('/api/admin/testimonials').then(res => res.json()),
            fetch('/api/admin/contacts').then(res => res.json()),
            fetch('/api/admin/blogs').then(res => res.json())
        ]);

        // Filter data based on the search query
        const filteredProjects = projects.filter(project =>
            project.title.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query)
        );

        const filteredTestimonials = testimonials.filter(testimonial =>
            testimonial.author.toLowerCase().includes(query) ||
            testimonial.content.toLowerCase().includes(query)
        );

        const filteredContacts = contacts.filter(contact =>
            contact.name.toLowerCase().includes(query) ||
            contact.email.toLowerCase().includes(query) ||
            contact.message.toLowerCase().includes(query)
        );

        const filteredBlogs = blogs.filter(blog =>
            blog.title.toLowerCase().includes(query) ||
            blog.author.toLowerCase().includes(query) ||
            blog.excerpt.toLowerCase().includes(query) ||
            blog.category.toLowerCase().includes(query)
        );

        // Display search results
        displaySearchResults(filteredProjects, filteredTestimonials, filteredContacts, filteredBlogs);
    } catch (error) {
        console.error('Error searching:', error);
        alert('An error occurred while searching.');
    }
});

// Function to display search results
function displaySearchResults(projects, testimonials, contacts, blogs) {
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'container mt-4';

    // Display projects
    if (projects.length > 0) {
        const projectsSection = document.createElement('div');
        projectsSection.innerHTML = `
            <h3>Projects</h3>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Image</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${projects.map(project => `
                            <tr>
                                <td>${project.title}</td>
                                <td>${project.description}</td>
                                <td><img src="${project.image_url}" alt="${project.title}" width="100"></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        resultsContainer.appendChild(projectsSection);
    }

    // Display testimonials
    if (testimonials.length > 0) {
        const testimonialsSection = document.createElement('div');
        testimonialsSection.innerHTML = `
            <h3>Testimonials</h3>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Author</th>
                            <th>Content</th>
                            <th>Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${testimonials.map(testimonial => `
                            <tr>
                                <td>${testimonial.author}</td>
                                <td>${testimonial.content}</td>
                                <td>${testimonial.rating}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        resultsContainer.appendChild(testimonialsSection);
    }

    // Display contacts
    if (contacts.length > 0) {
        const contactsSection = document.createElement('div');
        contactsSection.innerHTML = `
            <h3>Contacts</h3>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${contacts.map(contact => `
                            <tr>
                                <td>${contact.name}</td>
                                <td>${contact.email}</td>
                                <td>${contact.message}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        resultsContainer.appendChild(contactsSection);
    }

    // Display blogs
    if (blogs.length > 0) {
        const blogsSection = document.createElement('div');
        blogsSection.innerHTML = `
            <h3>Blogs</h3>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Excerpt</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${blogs.map(blog => `
                            <tr>
                                <td>${blog.title}</td>
                                <td>${blog.author}</td>
                                <td>${blog.excerpt}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        resultsContainer.appendChild(blogsSection);
    }

    // Clear previous results and display new results
    const mainContent = document.querySelector('.col-md-9.col-lg-10');
    mainContent.innerHTML = '';
    mainContent.appendChild(resultsContainer);
}