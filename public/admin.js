document.addEventListener('DOMContentLoaded', function () {
    fetchData('projects', 'projects-table');
    fetchData('testimonials', 'testimonials-table');
    fetchData('contacts', 'contacts-table');
    fetchData('blogs', 'blogs-table');
});

function fetchData(endpoint, tableId) {
    fetch(`/api/admin/${endpoint}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById(tableId);
            tableBody.innerHTML = ''; // Clear existing rows

            data.forEach(item => {
                const row = document.createElement('tr');
                for (const key in item) {
                    const cell = document.createElement('td');
                    cell.className = 'py-2 px-4 border';
                    cell.textContent = item[key];
                    row.appendChild(cell);
                }

                // Add action buttons
                const actionCell = document.createElement('td');
                actionCell.className = 'py-2 px-4 border';
                actionCell.innerHTML = `
                    <button onclick="editItem('${endpoint}', ${item.id})" class="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
                    <button onclick="deleteItem('${endpoint}', ${item.id})" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                `;
                row.appendChild(actionCell);

                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${sectionId}-section`).classList.remove('hidden');
}

function editItem(endpoint, id) {
    // Implement edit functionality
    console.log(`Edit ${endpoint} with ID ${id}`);
}

function deleteItem(endpoint, id) {
    if (confirm('Are you sure you want to delete this item?')) {
        fetch(`/api/admin/${endpoint}/${id}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    fetchData(endpoint, `${endpoint}-table`);
                }
            })
            .catch(error => console.error('Error deleting item:', error));
    }
}