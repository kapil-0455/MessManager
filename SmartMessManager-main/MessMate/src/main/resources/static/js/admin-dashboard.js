// Admin Dashboard JavaScript

// Data arrays - will be populated from real user interactions
let users = [];
let complaints = [];
let feedback = [];
let menus = [];

// Data persistence functions
function loadDataFromStorage() {
    const savedData = localStorage.getItem('messmate_admin_data');
    console.log('Loading data from localStorage:', savedData);
    
    if (savedData) {
        const data = JSON.parse(savedData);
        console.log('Parsed data:', data);
        users = data.users || users;
        complaints = data.complaints || complaints;
        feedback = data.feedback || feedback;
        menus = data.menus || menus;
        
        // Remove duplicate users based on email
        users = removeDuplicateUsers(users);
        
        console.log('Loaded users:', users);
    } else {
        console.log('No saved data found');
    }
}

// Helper function to remove duplicate users
function removeDuplicateUsers(userArray) {
    const seenEmails = new Set();
    const seenRolls = new Set();
    const uniqueUsers = [];
    
    userArray.forEach(user => {
        // Skip if email or roll number already exists
        if (!seenEmails.has(user.email) && (!user.rollNumber || !seenRolls.has(user.rollNumber))) {
            seenEmails.add(user.email);
            if (user.rollNumber && user.rollNumber !== 'Not Assigned') {
                seenRolls.add(user.rollNumber);
            }
            uniqueUsers.push(user);
        } else {
            console.warn('Duplicate user found and removed:', user);
        }
    });
    
    // If duplicates were found, save the cleaned data
    if (uniqueUsers.length !== userArray.length) {
        console.log(`Removed ${userArray.length - uniqueUsers.length} duplicate users`);
        // Update the saved data with cleaned users
        const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
        adminData.users = uniqueUsers;
        adminData.lastUpdated = new Date().toISOString();
        localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
    }
    
    return uniqueUsers;
}

function saveDataToStorage() {
    const data = {
        users: users,
        complaints: complaints,
        feedback: feedback,
        menus: menus,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('messmate_admin_data', JSON.stringify(data));
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage(); // Load persisted data first
    initializeAdminDashboard();
    setupNavigation();
    loadAdminInfo();
    updateStats();
    loadMenus();
    loadUsers();
    loadComplaints();
    loadFeedback();
    loadStudentDetails();
    loadStaffManagement();
    setupAdminChangePasswordForm();
    
    // Setup event listeners for staff management
    document.getElementById('staff-form').addEventListener('submit', saveStaff);
    document.getElementById('staff-status-filter').addEventListener('change', filterStaff);
    document.getElementById('staff-shift-filter').addEventListener('change', filterStaff);
    document.getElementById('staff-search').addEventListener('input', searchStaff);
    
    // Set today's date as default
    document.getElementById('menu-date').value = new Date().toISOString().split('T')[0];
    
    // Add event listeners
    document.getElementById('menu-form').addEventListener('submit', addMenu);
    document.getElementById('user-type-filter').addEventListener('change', filterUsers);
    document.getElementById('user-search').addEventListener('input', searchUsers);
    document.getElementById('complaint-status-filter').addEventListener('change', filterComplaints);
    document.getElementById('complaint-priority-filter').addEventListener('change', filterComplaints);
    document.getElementById('feedback-rating-filter').addEventListener('change', filterFeedback);
    document.getElementById('feedback-date-filter').addEventListener('change', filterFeedback);
    document.getElementById('student-search').addEventListener('input', searchStudents);
    
    // Auto-update stats every 30 seconds
    setInterval(updateStats, 30000);
    
    // Listen for storage changes (if multiple tabs are open)
    window.addEventListener('storage', function(e) {
        if (e.key === 'messmate_admin_data') {
            loadDataFromStorage();
            updateStats();
        }
    });
});

function initializeAdminDashboard() {
    // Check if admin is logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(loggedInUser);
    if (user.userType !== 'ADMIN') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'login.html';
        return;
    }
}

function loadAdminInfo() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        document.getElementById('admin-display-name').textContent = user.name;
        document.getElementById('admin-email').textContent = user.email;
        
        // Update avatar with first letter of name
        const avatarText = user.name.charAt(0).toUpperCase();
        document.getElementById('admin-avatar').textContent = avatarText;
    }
}

// Setup navigation functionality (same as student dashboard)
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('section-title');
    const actionButtons = document.querySelectorAll('.action-btn');
    
    // Navigation click handlers
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionName = item.dataset.section;
            switchSection(sectionName, item, sections, sectionTitle);
        });
    });
    
    // Action button handlers
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionName = button.dataset.section;
            const targetNavItem = document.querySelector(`[data-section="${sectionName}"]`);
            if (targetNavItem) {
                switchSection(sectionName, targetNavItem, sections, sectionTitle);
            }
        });
    });
}

// Switch between sections (same as student dashboard)
function switchSection(sectionName, activeNavItem, sections, sectionTitle) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked nav item
    activeNavItem.classList.add('active');
    
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update section title
    const titles = {
        'overview': 'Admin Dashboard Overview',
        'menu-management': 'Daily Menu Management',
        'user-management': 'User Management',
        'complaint-management': 'Complaint Management',
        'feedback-management': 'Student Feedback',
        'staff-management': 'Staff Management',
        'student-details': 'Student Details',
        'reports': 'Reports & Analytics'
    };
    
    sectionTitle.textContent = titles[sectionName] || 'Admin Dashboard';
}

function updateStats() {
    // Update overview stats
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('pending-complaints').textContent = complaints.filter(c => c.status === 'pending').length;
    document.getElementById('todays-bookings').textContent = Math.floor(Math.random() * 50) + 20; // Mock data
    
    // Handle empty feedback array
    const avgRating = feedback.length > 0 ? 
        (feedback.reduce((sum, f) => sum + f.foodRating, 0) / feedback.length).toFixed(1) : '0.0';
    document.getElementById('avg-rating').textContent = avgRating;
    
    // Update user stats
    document.getElementById('student-count').textContent = users.filter(u => u.userType === 'STUDENT').length;
    document.getElementById('staff-count').textContent = users.filter(u => u.userType === 'STAFF').length;
    document.getElementById('admin-count').textContent = users.filter(u => u.userType === 'ADMIN').length;
    
    // Update complaint stats
    document.getElementById('pending-count').textContent = complaints.filter(c => c.status === 'pending').length;
    document.getElementById('inprogress-count').textContent = complaints.filter(c => c.status === 'in-progress').length;
    document.getElementById('solved-count').textContent = complaints.filter(c => c.status === 'solved').length;
    
    // Update feedback stats
    document.getElementById('total-feedback').textContent = feedback.length;
    const avgFoodRating = feedback.length > 0 ? 
        (feedback.reduce((sum, f) => sum + f.foodRating, 0) / feedback.length).toFixed(1) : '0.0';
    const avgServiceRating = feedback.length > 0 ? 
        (feedback.reduce((sum, f) => sum + f.serviceRating, 0) / feedback.length).toFixed(1) : '0.0';
    document.getElementById('avg-food-rating').textContent = avgFoodRating;
    document.getElementById('avg-service-rating').textContent = avgServiceRating;
}

function addMenu(event) {
    event.preventDefault();
    
    const menuData = {
        id: menus.length + 1,
        date: document.getElementById('menu-date').value,
        mealType: document.getElementById('meal-type').value,
        items: document.getElementById('menu-items').value,
        price: parseFloat(document.getElementById('menu-price').value)
    };
    
    // Check if menu already exists for this date and meal type
    const existingMenu = menus.find(m => m.date === menuData.date && m.mealType === menuData.mealType);
    if (existingMenu) {
        if (confirm('Menu already exists for this date and meal type. Do you want to update it?')) {
            existingMenu.items = menuData.items;
            existingMenu.price = menuData.price;
        }
    } else {
        menus.push(menuData);
    }
    
    saveDataToStorage(); // Save to localStorage
    
    // Clear form
    document.getElementById('menu-form').reset();
    document.getElementById('menu-date').value = new Date().toISOString().split('T')[0];
    
    // Reload menus
    loadMenus();
    
    alert('Menu added successfully!');
}

function loadMenus() {
    const menuList = document.getElementById('menu-list');
    const currentWeekMenus = menus.filter(menu => {
        const menuDate = new Date(menu.date);
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        return menuDate >= weekStart && menuDate <= weekEnd;
    });
    
    menuList.innerHTML = currentWeekMenus.map(menu => `
        <div class="menu-card">
            <div class="menu-card-header">
                <span class="menu-date">${formatDate(menu.date)}</span>
                <span class="meal-type-badge">${menu.mealType}</span>
            </div>
            <div class="menu-items">${menu.items.replace(/\n/g, '<br>')}</div>
            <div class="menu-price">₹${menu.price.toFixed(2)}</div>
        </div>
    `).join('');
}

function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    console.log('Loading users, total count:', users.length);
    console.log('Users data:', users);
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No users registered yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="user-type-badge">${user.userType}</span></td>
            <td>${user.rollNumber || '-'}</td>
            <td>${user.hostel || '-'}</td>
            <td>${user.room || '-'}</td>
            <td>
                <button class="action-button" onclick="viewUser(${user.id})">View</button>
                <button class="action-button" onclick="editUser(${user.id})">Edit</button>
            </td>
        </tr>
    `).join('');
}

function loadComplaints() {
    const container = document.getElementById('complaints-list');
    console.log('Loading complaints:', complaints);
    
    if (complaints.length === 0) {
        container.innerHTML = '<div class="empty-state">No complaints submitted yet</div>';
        return;
    }
    
    container.innerHTML = complaints.map(complaint => `
        <div class="complaint-card">
            <div class="complaint-header">
                <h4 class="complaint-title">${complaint.title}</h4>
                <span class="complaint-status ${complaint.status}">${complaint.status.replace('-', ' ').toUpperCase()}</span>
            </div>
            <div class="complaint-meta">
                <span><strong>Student:</strong> ${complaint.student}</span>
                <span><strong>Priority:</strong> ${complaint.priority.toUpperCase()}</span>
                <span><strong>Date:</strong> ${formatDate(complaint.createdAt || complaint.date)}</span>
            </div>
            <div class="complaint-description">${complaint.description}</div>
            <div class="complaint-actions">
                <button class="status-btn pending" onclick="updateComplaintStatus(${complaint.id}, 'pending')">Mark Pending</button>
                <button class="status-btn in-progress" onclick="updateComplaintStatus(${complaint.id}, 'in-progress')">In Progress</button>
                <button class="status-btn solved" onclick="updateComplaintStatus(${complaint.id}, 'solved')">Mark Solved</button>
            </div>
        </div>
    `).join('');
}

function loadFeedback() {
    const container = document.getElementById('feedback-list');
    console.log('Loading feedback:', feedback);
    
    if (feedback.length === 0) {
        container.innerHTML = '<div class="empty-state">No feedback submitted yet</div>';
        return;
    }
    
    container.innerHTML = feedback.map(fb => `
        <div class="feedback-card">
            <div class="feedback-header">
                <span class="feedback-student">${fb.student}</span>
                <span class="feedback-date">${formatDate(fb.createdAt || fb.date)}</span>
            </div>
            <div class="feedback-ratings">
                <div class="rating-item">
                    <span class="rating-label">Food:</span>
                    <span class="star-display">${'★'.repeat(fb.foodRating)}${'☆'.repeat(5-fb.foodRating)}</span>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Service:</span>
                    <span class="star-display">${'★'.repeat(fb.serviceRating)}${'☆'.repeat(5-fb.serviceRating)}</span>
                </div>
            </div>
            <div class="feedback-comment">"${fb.comment}"</div>
        </div>
    `).join('');
}

function loadStudentDetails() {
    const container = document.getElementById('student-details-list');
    const students = users.filter(user => user.userType === 'STUDENT');
    
    container.innerHTML = students.map(student => {
        const studentComplaints = complaints.filter(c => c.studentId === student.id);
        const studentFeedback = feedback.filter(f => f.studentId === student.id);
        
        return `
            <div class="student-detail-card">
                <div class="student-card-header">
                    <div class="student-card-avatar">${student.name.charAt(0).toUpperCase()}</div>
                    <div class="student-card-info">
                        <h4>${student.name}</h4>
                        <p>${student.rollNumber}</p>
                    </div>
                </div>
                <div class="student-card-details">
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${student.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Hostel:</span>
                        <span class="detail-value">${student.hostel}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Room:</span>
                        <span class="detail-value">${student.room}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${student.phone}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Complaints:</span>
                        <span class="detail-value">${studentComplaints.length}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Feedback Given:</span>
                        <span class="detail-value">${studentFeedback.length}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateComplaintStatus(complaintId, newStatus) {
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
        complaint.status = newStatus;
        saveDataToStorage(); // Save to localStorage
        loadComplaints();
        updateStats(); // Update stats when complaint status changes
        alert(`Complaint status updated to ${newStatus.replace('-', ' ')}`);
    }
}

// Function to add new user
function addNewUser(userData) {
    // Check if user with this email already exists
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
        alert('A user with this email already exists.');
        return null;
    }

    // Check if roll number already exists (if provided)
    if (userData.rollNumber) {
        const existingRoll = users.find(user => user.rollNumber === userData.rollNumber);
        if (existingRoll) {
            alert('A user with this roll number already exists.');
            return null;
        }
    }

    // Generate unique ID
    const generateUniqueId = () => {
        let maxId = 0;
        users.forEach(user => {
            if (user.id > maxId) maxId = user.id;
        });
        return maxId + 1;
    };
    
    const newUser = {
        id: generateUniqueId(),
        name: userData.name,
        email: userData.email,
        userType: userData.userType || 'STUDENT',
        rollNumber: userData.rollNumber || `ID${Date.now()}`,
        hostel: userData.hostel || 'Not Assigned',
        room: userData.room || 'Not Assigned',
        phone: userData.phone || 'Not Provided',
        password: userData.password || 'temp123', // Default password if not provided
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveDataToStorage(); // Save to localStorage
    loadUsers();
    updateStats(); // Update stats when new user is added
    return newUser;
}

// Function to add new complaint
function addNewComplaint(complaintData) {
    const newComplaint = {
        id: complaints.length + 1,
        title: complaintData.title,
        student: complaintData.studentName,
        description: complaintData.description,
        status: 'pending',
        priority: complaintData.priority || 'medium',
        date: new Date().toISOString().split('T')[0],
        studentId: complaintData.studentId
    };
    
    complaints.push(newComplaint);
    saveDataToStorage(); // Save to localStorage
    loadComplaints();
    updateStats(); // Update stats when new complaint is added
    return newComplaint;
}

// Function to add new feedback
function addNewFeedback(feedbackData) {
    const newFeedback = {
        id: feedback.length + 1,
        student: feedbackData.studentName,
        foodRating: feedbackData.foodRating,
        serviceRating: feedbackData.serviceRating,
        comment: feedbackData.comment,
        date: new Date().toISOString().split('T')[0],
        studentId: feedbackData.studentId
    };
    
    feedback.push(newFeedback);
    saveDataToStorage(); // Save to localStorage
    loadFeedback();
    updateStats(); // Update stats when new feedback is added
    return newFeedback;
}

function filterUsers() {
    const filterValue = document.getElementById('user-type-filter').value;
    const searchValue = document.getElementById('user-search').value.toLowerCase();
    
    let filteredUsers = users;
    
    if (filterValue) {
        filteredUsers = filteredUsers.filter(user => user.userType === filterValue);
    }
    
    if (searchValue) {
        filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(searchValue) || 
            user.email.toLowerCase().includes(searchValue) ||
            (user.rollNumber && user.rollNumber.toLowerCase().includes(searchValue))
        );
    }
    
    displayFilteredUsers(filteredUsers);
}

function searchUsers() {
    filterUsers();
}

function displayFilteredUsers(filteredUsers) {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="user-type-badge">${user.userType}</span></td>
            <td>${user.rollNumber || '-'}</td>
            <td>${user.hostel || '-'}</td>
            <td>${user.room || '-'}</td>
            <td>
                <button class="action-button" onclick="viewUser(${user.id})">View</button>
                <button class="action-button" onclick="editUser(${user.id})">Edit</button>
            </td>
        </tr>
    `).join('');
}

function filterComplaints() {
    const statusFilter = document.getElementById('complaint-status-filter').value;
    const priorityFilter = document.getElementById('complaint-priority-filter').value;
    
    let filteredComplaints = complaints;
    
    if (statusFilter) {
        filteredComplaints = filteredComplaints.filter(complaint => complaint.status === statusFilter);
    }
    
    if (priorityFilter) {
        filteredComplaints = filteredComplaints.filter(complaint => complaint.priority === priorityFilter);
    }
    
    displayFilteredComplaints(filteredComplaints);
}

function displayFilteredComplaints(filteredComplaints) {
    const container = document.getElementById('complaints-list');
    container.innerHTML = filteredComplaints.map(complaint => `
        <div class="complaint-card">
            <div class="complaint-header">
                <h4 class="complaint-title">${complaint.title}</h4>
                <span class="complaint-status ${complaint.status}">${complaint.status.replace('-', ' ').toUpperCase()}</span>
            </div>
            <div class="complaint-meta">
                <span><strong>Student:</strong> ${complaint.student}</span>
                <span><strong>Priority:</strong> ${complaint.priority.toUpperCase()}</span>
                <span><strong>Date:</strong> ${formatDate(complaint.date)}</span>
            </div>
            <div class="complaint-description">${complaint.description}</div>
            <div class="complaint-actions">
                <button class="status-btn pending" onclick="updateComplaintStatus(${complaint.id}, 'pending')">Mark Pending</button>
                <button class="status-btn in-progress" onclick="updateComplaintStatus(${complaint.id}, 'in-progress')">In Progress</button>
                <button class="status-btn solved" onclick="updateComplaintStatus(${complaint.id}, 'solved')">Mark Solved</button>
            </div>
        </div>
    `).join('');
}

function filterFeedback() {
    const ratingFilter = document.getElementById('feedback-rating-filter').value;
    const dateFilter = document.getElementById('feedback-date-filter').value;
    
    let filteredFeedback = feedback;
    
    if (ratingFilter) {
        filteredFeedback = filteredFeedback.filter(fb => 
            fb.foodRating == ratingFilter || fb.serviceRating == ratingFilter
        );
    }
    
    if (dateFilter) {
        filteredFeedback = filteredFeedback.filter(fb => fb.date === dateFilter);
    }
    
    displayFilteredFeedback(filteredFeedback);
}

function displayFilteredFeedback(filteredFeedback) {
    const container = document.getElementById('feedback-list');
    container.innerHTML = filteredFeedback.map(fb => `
        <div class="feedback-card">
            <div class="feedback-header">
                <span class="feedback-student">${fb.student}</span>
                <span class="feedback-date">${formatDate(fb.date)}</span>
            </div>
            <div class="feedback-ratings">
                <div class="rating-item">
                    <span class="rating-label">Food:</span>
                    <span class="star-display">${'★'.repeat(fb.foodRating)}${'☆'.repeat(5-fb.foodRating)}</span>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Service:</span>
                    <span class="star-display">${'★'.repeat(fb.serviceRating)}${'☆'.repeat(5-fb.serviceRating)}</span>
                </div>
            </div>
            <div class="feedback-comment">"${fb.comment}"</div>
        </div>
    `).join('');
}

function searchStudents() {
    const searchValue = document.getElementById('student-search').value.toLowerCase();
    const students = users.filter(user => user.userType === 'STUDENT');
    
    let filteredStudents = students;
    if (searchValue) {
        filteredStudents = students.filter(student => 
            student.name.toLowerCase().includes(searchValue) || 
            student.email.toLowerCase().includes(searchValue) ||
            (student.rollNumber && student.rollNumber.toLowerCase().includes(searchValue)) ||
            (student.hostel && student.hostel.toLowerCase().includes(searchValue))
        );
    }
    
    displayFilteredStudents(filteredStudents);
}

function displayFilteredStudents(filteredStudents) {
    const container = document.getElementById('student-details-list');
    
    container.innerHTML = filteredStudents.map(student => {
        const studentComplaints = complaints.filter(c => c.studentId === student.id);
        const studentFeedback = feedback.filter(f => f.studentId === student.id);
        
        return `
            <div class="student-detail-card">
                <div class="student-card-header">
                    <div class="student-card-avatar">${student.name.charAt(0).toUpperCase()}</div>
                    <div class="student-card-info">
                        <h4>${student.name}</h4>
                        <p>${student.rollNumber}</p>
                    </div>
                </div>
                <div class="student-card-details">
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${student.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Hostel:</span>
                        <span class="detail-value">${student.hostel}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Room:</span>
                        <span class="detail-value">${student.room}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${student.phone}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Complaints:</span>
                        <span class="detail-value">${studentComplaints.length}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Feedback Given:</span>
                        <span class="detail-value">${studentFeedback.length}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Report generation functions
async function generateDailyReport() {
    try {
        const response = await fetch('http://localhost:8080/api/orders');
        const result = await response.json();
        if (result.success) {
            const orders = result.data;
            const today = new Date().toDateString();
            const todayOrders = orders.filter(order => 
                new Date(order.createdAt).toDateString() === today
            );
            
            const totalRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            alert(`Daily Report Generated!\n\nDate: ${today}\nTotal Orders: ${todayOrders.length}\nTotal Revenue: ₹${totalRevenue}\n\nDetailed report would be exported to PDF.`);
        }
    } catch (error) {
        alert('Error generating daily report. Please try again.');
    }
}

async function generateUserReport() {
    try {
        const response = await fetch('http://localhost:8080/api/students/all');
        const result = await response.json();
        if (result.success) {
            const students = result.data;
            const totalUsers = students.length;
            const activeUsers = students.filter(s => s.isActive).length;
            alert(`User Registration Report!\n\nTotal Students: ${totalUsers}\nActive Students: ${activeUsers}\nInactive Students: ${totalUsers - activeUsers}\n\nDetailed demographics would be exported to PDF.`);
        }
    } catch (error) {
        alert('Error generating user report. Please try again.');
    }
}

async function generateFeedbackReport() {
    try {
        // This would connect to a feedback API when implemented
        alert('Feedback Analysis Report!\n\nAverage Rating: 4.2/5\nTotal Feedback: 156\nPositive: 78%\nNegative: 22%\n\nDetailed analysis would be exported to PDF.');
    } catch (error) {
        alert('Error generating feedback report. Please try again.');
    }
}

async function generateComplaintReport() {
    try {
        // This would connect to a complaints API when implemented
        alert('Complaint Summary Report!\n\nTotal Complaints: 23\nResolved: 18\nPending: 5\nAverage Resolution Time: 2.3 days\n\nDetailed report would be exported to PDF.');
    } catch (error) {
        alert('Error generating complaint report. Please try again.');
    }
}

// Utility functions
function viewUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nType: ${user.userType}\nRoll/ID: ${user.rollNumber}\nHostel: ${user.hostel}\nRoom: ${user.room}\nPhone: ${user.phone}`);
    }
}

function editUser(userId) {
    alert('Edit user functionality will be implemented with a proper modal dialog.');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Staff Management Functions
let staffMembers = [];

function loadStaffManagement() {
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || { staff: [] };
    staffMembers = adminData.staff || [];
    loadStaffList();
    updateStaffStats();
}

function loadStaffList() {
    const container = document.getElementById('staff-list');
    
    if (staffMembers.length === 0) {
        container.innerHTML = '<div class="empty-state">No staff members added yet. Click "Add New Staff" to get started.</div>';
        return;
    }
    
    container.innerHTML = staffMembers.map(staff => `
        <div class="staff-card">
            <div class="staff-header-card">
                <div class="staff-info">
                    <h4>${staff.name}</h4>
                    <div class="staff-id">ID: ${staff.staffId}</div>
                    <div class="staff-role">${staff.role || 'Kitchen Staff'}</div>
                </div>
                <span class="staff-status ${staff.status}">${staff.status}</span>
            </div>
            
            <div class="staff-details">
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Email:</span>
                    <span class="staff-detail-value">${staff.email}</span>
                </div>
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Phone:</span>
                    <span class="staff-detail-value">${staff.phone || 'N/A'}</span>
                </div>
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Shift:</span>
                    <span class="staff-shift">${getShiftDisplayName(staff.shift)}</span>
                </div>
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Created:</span>
                    <span class="staff-detail-value">${formatDate(staff.createdAt)}</span>
                </div>
            </div>
            
            <div class="staff-actions">
                <button onclick="editStaff(${staff.id})" class="edit-staff-btn">Edit</button>
                <button onclick="toggleStaffStatus(${staff.id})" class="toggle-staff-btn">
                    ${staff.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button onclick="deleteStaff(${staff.id})" class="delete-staff-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateStaffStats() {
    const totalStaff = staffMembers.length;
    const activeStaff = staffMembers.filter(s => s.status === 'active').length;
    const morningShift = staffMembers.filter(s => s.shift === 'morning' && s.status === 'active').length;
    const eveningShift = staffMembers.filter(s => s.shift === 'evening' && s.status === 'active').length;
    
    document.getElementById('total-staff').textContent = totalStaff;
    document.getElementById('active-staff').textContent = activeStaff;
    document.getElementById('morning-shift').textContent = morningShift;
    document.getElementById('evening-shift').textContent = eveningShift;
}

function openAddStaffModal() {
    document.getElementById('staff-modal-title').textContent = 'Add New Staff';
    document.getElementById('staff-form').reset();
    document.getElementById('staff-id').value = generateStaffId();
    generateStaffPassword();
    document.getElementById('staff-form').removeAttribute('data-edit-id');
    document.getElementById('staff-modal').style.display = 'block';
}

function generateStaffId() {
    const prefix = 'STF';
    const year = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${year}${randomNum}`;
}

function generateStaffPassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('staff-password').value = password;
}

function saveStaff(e) {
    e.preventDefault();
    
    console.log('saveStaff function called');
    
    const editId = document.getElementById('staff-form').getAttribute('data-edit-id');
    const staffData = {
        id: editId ? parseInt(editId) : Date.now(),
        staffId: document.getElementById('staff-id').value,
        name: document.getElementById('staff-name').value,
        email: document.getElementById('staff-email').value,
        phone: document.getElementById('staff-phone').value,
        shift: document.getElementById('staff-shift').value,
        password: document.getElementById('staff-password').value,
        status: document.getElementById('staff-status').value,
        role: document.getElementById('staff-role').value,
        userType: 'STAFF',
        createdAt: editId ? staffMembers.find(s => s.id == editId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    console.log('Staff data to save:', staffData);
    
    // Validate staff ID uniqueness
    const existingStaff = staffMembers.find(s => s.staffId === staffData.staffId && s.id != staffData.id);
    if (existingStaff) {
        alert('Staff ID already exists. Please generate a new one.');
        return;
    }
    
    // Validate email uniqueness
    const existingEmail = staffMembers.find(s => s.email === staffData.email && s.id != staffData.id);
    if (existingEmail) {
        alert('Email already exists. Please use a different email.');
        return;
    }
    
    if (editId) {
        // Update existing staff
        const index = staffMembers.findIndex(s => s.id == editId);
        if (index !== -1) {
            staffMembers[index] = staffData;
        }
    } else {
        // Add new staff
        staffMembers.push(staffData);
        console.log('Added new staff, total staff members:', staffMembers.length);
    }
    
    // Save to localStorage
    saveStaffData();
    
    // Refresh UI
    loadStaffList();
    updateStaffStats();
    closeStaffModal();
    
    alert(`Staff ${editId ? 'updated' : 'created'} successfully!`);
}

function editStaff(staffId) {
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff) return;
    
    document.getElementById('staff-modal-title').textContent = 'Edit Staff';
    document.getElementById('staff-name').value = staff.name;
    document.getElementById('staff-email').value = staff.email;
    document.getElementById('staff-phone').value = staff.phone || '';
    document.getElementById('staff-shift').value = staff.shift;
    document.getElementById('staff-id').value = staff.staffId;
    document.getElementById('staff-password').value = staff.password;
    document.getElementById('staff-status').value = staff.status;
    document.getElementById('staff-role').value = staff.role || '';
    
    document.getElementById('staff-form').setAttribute('data-edit-id', staffId);
    document.getElementById('staff-modal').style.display = 'block';
}

function toggleStaffStatus(staffId) {
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff) return;
    
    const newStatus = staff.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    if (confirm(`Are you sure you want to ${action} ${staff.name}?`)) {
        staff.status = newStatus;
        staff.updatedAt = new Date().toISOString();
        
        saveStaffData();
        loadStaffList();
        updateStaffStats();
        
        alert(`Staff ${action}d successfully!`);
    }
}

function deleteStaff(staffId) {
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff) return;
    
    if (confirm(`Are you sure you want to delete ${staff.name}? This action cannot be undone.`)) {
        staffMembers = staffMembers.filter(s => s.id !== staffId);
        
        saveStaffData();
        loadStaffList();
        updateStaffStats();
        
        alert('Staff deleted successfully!');
    }
}

function filterStaff() {
    const statusFilter = document.getElementById('staff-status-filter').value;
    const shiftFilter = document.getElementById('staff-shift-filter').value;
    
    let filtered = staffMembers;
    
    if (statusFilter) {
        filtered = filtered.filter(s => s.status === statusFilter);
    }
    
    if (shiftFilter) {
        filtered = filtered.filter(s => s.shift === shiftFilter);
    }
    
    displayFilteredStaff(filtered);
}

function searchStaff() {
    const searchTerm = document.getElementById('staff-search').value.toLowerCase();
    
    if (!searchTerm) {
        loadStaffList();
        return;
    }
    
    const filtered = staffMembers.filter(staff => 
        staff.name.toLowerCase().includes(searchTerm) ||
        staff.staffId.toLowerCase().includes(searchTerm) ||
        staff.email.toLowerCase().includes(searchTerm)
    );
    
    displayFilteredStaff(filtered);
}

function displayFilteredStaff(filtered) {
    const container = document.getElementById('staff-list');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No staff members match your search criteria.</div>';
        return;
    }
    
    container.innerHTML = filtered.map(staff => `
        <div class="staff-card">
            <div class="staff-header-card">
                <div class="staff-info">
                    <h4>${staff.name}</h4>
                    <div class="staff-id">ID: ${staff.staffId}</div>
                    <div class="staff-role">${staff.role || 'Kitchen Staff'}</div>
                </div>
                <span class="staff-status ${staff.status}">${staff.status}</span>
            </div>
            
            <div class="staff-details">
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Email:</span>
                    <span class="staff-detail-value">${staff.email}</span>
                </div>
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Phone:</span>
                    <span class="staff-detail-value">${staff.phone || 'N/A'}</span>
                </div>
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Shift:</span>
                    <span class="staff-shift">${getShiftDisplayName(staff.shift)}</span>
                </div>
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Created:</span>
                    <span class="staff-detail-value">${formatDate(staff.createdAt)}</span>
                </div>
            </div>
            
            <div class="staff-actions">
                <button onclick="editStaff(${staff.id})" class="edit-staff-btn">Edit</button>
                <button onclick="toggleStaffStatus(${staff.id})" class="toggle-staff-btn">
                    ${staff.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button onclick="deleteStaff(${staff.id})" class="delete-staff-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

function closeStaffModal() {
    document.getElementById('staff-modal').style.display = 'none';
    document.getElementById('staff-form').reset();
    document.getElementById('staff-form').removeAttribute('data-edit-id');
}

function getShiftDisplayName(shift) {
    const shiftNames = {
        'morning': 'Morning (6 AM - 2 PM)',
        'evening': 'Evening (2 PM - 10 PM)',
        'full': 'Full Day (6 AM - 10 PM)'
    };
    return shiftNames[shift] || shift;
}

function saveStaffData() {
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || { staff: [] };
    adminData.staff = staffMembers;
    adminData.lastUpdated = new Date().toISOString();
    localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
    console.log('Staff data saved:', adminData.staff);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('staff-modal');
    if (event.target === modal) {
        closeStaffModal();
    }
});

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    }
}

// Setup admin change password form
function setupAdminChangePasswordForm() {
    const changePasswordForm = document.getElementById('admin-change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('admin-current-password').value;
            const newPassword = document.getElementById('admin-new-password').value;
            const confirmPassword = document.getElementById('admin-confirm-password').value;
            
            // Validate passwords
            if (newPassword !== confirmPassword) {
                showNotification('New passwords do not match!', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showNotification('Password must be at least 6 characters long!', 'error');
                return;
            }
            
            // Get current admin user data
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            if (!loggedInUser || loggedInUser.email !== 'admin@messmate.com') {
                showNotification('Admin user not found!', 'error');
                return;
            }
            
            // For admin, the default password is 'admin123'
            if (currentPassword !== loggedInUser.password) {
                showNotification('Current password is incorrect!', 'error');
                return;
            }
            
            // Update password in localStorage
            loggedInUser.password = newPassword;
            localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
            
            // Update in admin data if it exists
            const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
            adminData.adminPassword = newPassword;
            adminData.lastUpdated = new Date().toISOString();
            localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
            
            // Clear form
            changePasswordForm.reset();
            
            showNotification('Admin password changed successfully!', 'success');
        });
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease',
        background: type === 'success' ? 'linear-gradient(135deg, #4caf50, #45a049)' : 
                   type === 'error' ? 'linear-gradient(135deg, #f44336, #da190b)' : 
                   'linear-gradient(135deg, #2196f3, #0b7dda)'
    });
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}