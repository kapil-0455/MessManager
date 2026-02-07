// Staff Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeStaffDashboard();
    setupNavigation();
    setupDateTimeDisplay();
    setupEventListeners();
    setupStaffChangePasswordForm();
    loadStaffData();
    loadInventoryData();
    loadFeedbackData();
    updateStats();
});

// Initialize staff dashboard
function initializeStaffDashboard() {
    // Check if staff is logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(loggedInUser);
    if (user.userType !== 'STAFF') {
        alert('Access denied. Staff privileges required.');
        window.location.href = 'login.html';
        return;
    }
    
    displayStaffInfo(user);
}

// Display staff information
function displayStaffInfo(staff) {
    document.getElementById('staff-name').textContent = staff.name || 'Staff Member';
    document.getElementById('staff-shift').textContent = `Shift: ${staff.shift || 'Full Day'}`;
    
    // Set avatar initial
    const avatar = document.getElementById('staff-avatar');
    avatar.textContent = staff.name ? staff.name.charAt(0).toUpperCase() : '👤';
}

// Setup navigation functionality
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

// Switch between sections
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
        'overview': 'Staff Dashboard Overview',
        'daily-menu': 'Daily Menu Management',
        'meal-distribution': 'Meal Distribution Tracking',
        'inventory': 'Inventory Management',
        'feedback': 'Student Feedback Management',
        'profile': 'Staff Profile'
    };
    
    sectionTitle.textContent = titles[sectionName] || 'Staff Dashboard';
    
    // Load section-specific data
    if (sectionName === 'daily-menu') {
        loadTodaysMenu();
    } else if (sectionName === 'meal-distribution') {
        loadMealDistributions();
    } else if (sectionName === 'inventory') {
        loadInventory();
    } else if (sectionName === 'feedback') {
        loadStaffFeedback();
    }
}

// Setup date/time display
function setupDateTimeDisplay() {
    function updateDateTime() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('current-datetime').textContent = now.toLocaleDateString('en-US', options);
    }
    
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
    
    // Set today's date as default
    document.getElementById('menu-date').value = new Date().toISOString().split('T')[0];
}

// Setup event listeners
function setupEventListeners() {
    // Menu form
    document.getElementById('add-menu-form').addEventListener('submit', addMenuItem);
    
    // Inventory category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterInventory(e.target.dataset.category);
        });
    });
    
    // Feedback filters
    document.getElementById('feedback-filter-rating').addEventListener('change', filterFeedback);
    document.getElementById('feedback-filter-status').addEventListener('change', filterFeedback);
    
    // Item form
    document.getElementById('item-form').addEventListener('submit', saveInventoryItem);
    
    // Staff profile form
    document.getElementById('staff-profile-form').addEventListener('submit', updateStaffProfile);
}

// Load staff data
function loadStaffData() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        document.getElementById('profile-name').value = loggedInUser.name || '';
        document.getElementById('profile-email').value = loggedInUser.email || '';
        document.getElementById('profile-phone').value = loggedInUser.phone || '';
        document.getElementById('profile-shift').value = loggedInUser.shift || 'full';
        document.getElementById('profile-role').value = loggedInUser.userType || 'STAFF';
    }
}

// Update stats
function updateStats() {
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {
        users: [],
        complaints: [],
        feedback: [],
        menus: []
    };
    
    const inventoryData = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const distributionData = JSON.parse(localStorage.getItem('meal_distributions')) || [];
    
    // Calculate stats
    const todaysMeals = getTodaysMenuItems().length;
    const mealsServed = getTodaysMealDistributions().length;
    const lowStockItems = inventoryData.filter(item => item.quantity <= item.minStock).length;
    const pendingFeedback = adminData.feedback.filter(f => !f.staffStatus || f.staffStatus === 'unread').length;
    
    // Update UI
    document.getElementById('todays-meals').textContent = todaysMeals;
    document.getElementById('meals-served').textContent = mealsServed;
    document.getElementById('low-stock-items').textContent = lowStockItems;
    document.getElementById('pending-feedback').textContent = pendingFeedback;
    
    // Update distribution stats
    document.getElementById('total-served-today').textContent = mealsServed;
    document.getElementById('remaining-meals').textContent = Math.max(0, todaysMeals * 50 - mealsServed); // Assuming 50 servings per item
}

// Daily Menu Management
function loadTodaysMenu() {
    const selectedDate = document.getElementById('menu-date').value || new Date().toISOString().split('T')[0];
    loadMenuForDate(selectedDate);
}

function loadMenuForDate(date = null) {
    const targetDate = date || document.getElementById('menu-date').value;
    const menuData = getMenuForDate(targetDate);
    
    const container = document.getElementById('daily-menu-list');
    
    if (menuData.length === 0) {
        container.innerHTML = '<div class="empty-state">No menu items found for this date</div>';
        return;
    }
    
    container.innerHTML = menuData.map(item => `
        <div class="menu-item">
            <div class="menu-info">
                <div class="menu-name">${item.name}</div>
                <div class="menu-meal-type">${item.mealType}</div>
            </div>
            <span class="menu-status ${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
            <div class="status-actions">
                <button class="status-btn ready-btn" onclick="updateMenuStatus(${item.id}, 'ready')">Ready</button>
                <button class="status-btn preparing-btn" onclick="updateMenuStatus(${item.id}, 'preparing')">Preparing</button>
                <button class="status-btn delayed-btn" onclick="updateMenuStatus(${item.id}, 'delayed')">Delayed</button>
                <button class="status-btn finished-btn" onclick="updateMenuStatus(${item.id}, 'finished')">Finished</button>
            </div>
        </div>
    `).join('');
}

function addMenuItem(e) {
    e.preventDefault();
    
    const menuData = {
        id: Date.now(),
        date: document.getElementById('menu-date').value,
        mealType: document.getElementById('menu-meal-type').value,
        name: document.getElementById('menu-item-name').value,
        status: document.getElementById('menu-status').value,
        addedBy: 'staff',
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    let staffMenuData = JSON.parse(localStorage.getItem('staff_menu_data')) || [];
    staffMenuData.push(menuData);
    localStorage.setItem('staff_menu_data', JSON.stringify(staffMenuData));
    
    // Reset form
    document.getElementById('add-menu-form').reset();
    document.getElementById('menu-date').value = new Date().toISOString().split('T')[0];
    
    // Reload menu
    loadTodaysMenu();
    updateStats();
    
    showNotification('Menu item added successfully!', 'success');
}

function updateMenuStatus(itemId, newStatus) {
    let staffMenuData = JSON.parse(localStorage.getItem('staff_menu_data')) || [];
    const item = staffMenuData.find(m => m.id === itemId);
    
    if (item) {
        item.status = newStatus;
        item.updatedAt = new Date().toISOString();
        localStorage.setItem('staff_menu_data', JSON.stringify(staffMenuData));
        loadTodaysMenu();
        updateStats();
        showNotification(`Menu item status updated to ${newStatus}`, 'success');
    }
}

function getMenuForDate(date) {
    const staffMenuData = JSON.parse(localStorage.getItem('staff_menu_data')) || [];
    return staffMenuData.filter(item => item.date === date);
}

function getTodaysMenuItems() {
    const today = new Date().toISOString().split('T')[0];
    return getMenuForDate(today);
}

// Meal Distribution Management
function loadMealDistributions() {
    const distributions = getTodaysMealDistributions();
    const container = document.getElementById('recent-distributions');
    
    if (distributions.length === 0) {
        container.innerHTML = '<div class="empty-state">No meals distributed today</div>';
        return;
    }
    
    container.innerHTML = distributions.slice(-10).reverse().map(dist => `
        <div class="distribution-item">
            <div>
                <div class="distribution-student">${dist.studentName}</div>
                <div class="distribution-meal">${dist.mealType} - ${dist.itemName}</div>
            </div>
            <div class="distribution-time">${new Date(dist.timestamp).toLocaleTimeString()}</div>
        </div>
    `).join('');
    
    // Update meal summary
    updateMealSummary(distributions);
}

function markMealServed() {
    const studentId = document.getElementById('student-id-input').value.trim();
    
    if (!studentId) {
        showNotification('Please enter a student ID or roll number', 'error');
        return;
    }
    
    // Get admin data to find student
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || { users: [] };
    const student = adminData.users.find(u => 
        u.rollNumber === studentId || 
        u.id.toString() === studentId ||
        u.email === studentId
    );
    
    if (!student) {
        showNotification('Student not found', 'error');
        return;
    }
    
    // Check for duplicate entry today
    const today = new Date().toISOString().split('T')[0];
    const distributions = getTodaysMealDistributions();
    const duplicate = distributions.find(d => 
        d.studentId === student.id && 
        d.date === today &&
        d.mealType === getCurrentMealType()
    );
    
    if (duplicate) {
        showNotification('Meal already marked for this student today', 'error');
        return;
    }
    
    // Create distribution record
    const distribution = {
        id: Date.now(),
        studentId: student.id,
        studentName: student.name,
        studentRollNumber: student.rollNumber,
        mealType: getCurrentMealType(),
        itemName: 'Standard Meal',
        date: today,
        timestamp: new Date().toISOString(),
        markedBy: 'staff'
    };
    
    // Save distribution
    let distributions_data = JSON.parse(localStorage.getItem('meal_distributions')) || [];
    distributions_data.push(distribution);
    localStorage.setItem('meal_distributions', JSON.stringify(distributions_data));
    
    // Clear input and reload
    document.getElementById('student-id-input').value = '';
    loadMealDistributions();
    updateStats();
    
    showNotification(`Meal marked for ${student.name}`, 'success');
}

function getCurrentMealType() {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) return 'breakfast';
    if (hour >= 12 && hour < 15) return 'lunch';
    if (hour >= 19 && hour < 22) return 'dinner';
    return 'general';
}

function getTodaysMealDistributions() {
    const today = new Date().toISOString().split('T')[0];
    const distributions = JSON.parse(localStorage.getItem('meal_distributions')) || [];
    return distributions.filter(d => d.date === today);
}

function updateMealSummary(distributions) {
    const summary = distributions.reduce((acc, dist) => {
        acc[dist.mealType] = (acc[dist.mealType] || 0) + 1;
        return acc;
    }, {});
    
    const summaryGrid = document.getElementById('meal-summary-grid');
    summaryGrid.innerHTML = Object.entries(summary).map(([meal, count]) => `
        <div class="summary-card">
            <div class="summary-meal">${meal.charAt(0).toUpperCase() + meal.slice(1)}</div>
            <div class="summary-count">${count}</div>
        </div>
    `).join('');
}

// Inventory Management
function loadInventoryData() {
    // Initialize default inventory if empty
    let inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    
    if (inventory.length === 0) {
        inventory = getDefaultInventory();
        localStorage.setItem('mess_inventory', JSON.stringify(inventory));
    }
    
    loadInventory();
    showLowStockAlerts();
}

function getDefaultInventory() {
    return [
        { id: 1, name: 'Rice', category: 'grains', quantity: 50, unit: 'kg', minStock: 10 },
        { id: 2, name: 'Wheat Flour', category: 'grains', quantity: 30, unit: 'kg', minStock: 5 },
        { id: 3, name: 'Dal (Lentils)', category: 'grains', quantity: 25, unit: 'kg', minStock: 5 },
        { id: 4, name: 'Onions', category: 'vegetables', quantity: 20, unit: 'kg', minStock: 5 },
        { id: 5, name: 'Potatoes', category: 'vegetables', quantity: 40, unit: 'kg', minStock: 10 },
        { id: 6, name: 'Tomatoes', category: 'vegetables', quantity: 15, unit: 'kg', minStock: 5 },
        { id: 7, name: 'Salt', category: 'spices', quantity: 5, unit: 'kg', minStock: 1 },
        { id: 8, name: 'Turmeric', category: 'spices', quantity: 2, unit: 'kg', minStock: 0.5 },
        { id: 9, name: 'Milk', category: 'dairy', quantity: 20, unit: 'liters', minStock: 5 },
        { id: 10, name: 'Oil', category: 'others', quantity: 10, unit: 'liters', minStock: 2 }
    ];
}

function loadInventory() {
    const inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const container = document.getElementById('inventory-list');
    
    if (inventory.length === 0) {
        container.innerHTML = '<div class="empty-state">No inventory items found</div>';
        return;
    }
    
    container.innerHTML = inventory.map(item => {
        const stockStatus = getStockStatus(item);
        return `
            <div class="inventory-item">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-category">${item.category}</div>
                </div>
                <div class="item-stock">${item.quantity}</div>
                <div class="item-unit">${item.unit}</div>
                <div class="stock-status ${stockStatus}">${stockStatus.charAt(0).toUpperCase() + stockStatus.slice(1)}</div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="editInventoryItem(${item.id})">Edit</button>
                    <button class="update-btn" onclick="quickUpdateStock(${item.id})">Update</button>
                </div>
            </div>
        `;
    }).join('');
}

function getStockStatus(item) {
    if (item.quantity <= item.minStock) return 'low';
    if (item.quantity <= item.minStock * 2) return 'medium';
    return 'good';
}

function filterInventory(category) {
    const inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const filtered = category === 'all' ? inventory : inventory.filter(item => item.category === category);
    
    const container = document.getElementById('inventory-list');
    container.innerHTML = filtered.map(item => {
        const stockStatus = getStockStatus(item);
        return `
            <div class="inventory-item">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-category">${item.category}</div>
                </div>
                <div class="item-stock">${item.quantity}</div>
                <div class="item-unit">${item.unit}</div>
                <div class="stock-status ${stockStatus}">${stockStatus.charAt(0).toUpperCase() + stockStatus.slice(1)}</div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="editInventoryItem(${item.id})">Edit</button>
                    <button class="update-btn" onclick="quickUpdateStock(${item.id})">Update</button>
                </div>
            </div>
        `;
    }).join('');
}

function showLowStockAlerts() {
    const inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);
    
    const alertsContainer = document.getElementById('low-stock-alerts');
    
    if (lowStockItems.length === 0) {
        alertsContainer.innerHTML = '';
        return;
    }
    
    alertsContainer.innerHTML = lowStockItems.map(item => `
        <div class="alert-item">
            <span><strong>${item.name}</strong> is running low (${item.quantity} ${item.unit} remaining)</span>
            <button onclick="quickUpdateStock(${item.id})" class="update-btn">Update Stock</button>
        </div>
    `).join('');
}

function addNewItem() {
    document.getElementById('modal-title').textContent = 'Add New Item';
    document.getElementById('item-form').reset();
    document.getElementById('item-modal').style.display = 'block';
}

function editInventoryItem(itemId) {
    const inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const item = inventory.find(i => i.id === itemId);
    
    if (item) {
        document.getElementById('modal-title').textContent = 'Edit Item';
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-quantity').value = item.quantity;
        document.getElementById('item-unit').value = item.unit;
        document.getElementById('item-min-stock').value = item.minStock;
        
        // Store item id for editing
        document.getElementById('item-form').dataset.editId = itemId;
        document.getElementById('item-modal').style.display = 'block';
    }
}

function quickUpdateStock(itemId) {
    const newQuantity = prompt('Enter new stock quantity:');
    if (newQuantity && !isNaN(newQuantity)) {
        updateInventoryStock(itemId, parseFloat(newQuantity));
    }
}

function updateInventoryStock(itemId, newQuantity) {
    let inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const item = inventory.find(i => i.id === itemId);
    
    if (item) {
        item.quantity = newQuantity;
        item.updatedAt = new Date().toISOString();
        localStorage.setItem('mess_inventory', JSON.stringify(inventory));
        
        loadInventory();
        showLowStockAlerts();
        updateStats();
        showNotification(`Stock updated for ${item.name}`, 'success');
    }
}

function saveInventoryItem(e) {
    e.preventDefault();
    
    let inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const editId = e.target.dataset.editId;
    
    const itemData = {
        name: document.getElementById('item-name').value,
        category: document.getElementById('item-category').value,
        quantity: parseFloat(document.getElementById('item-quantity').value),
        unit: document.getElementById('item-unit').value,
        minStock: parseFloat(document.getElementById('item-min-stock').value)
    };
    
    if (editId) {
        // Edit existing item
        const itemIndex = inventory.findIndex(i => i.id == editId);
        if (itemIndex !== -1) {
            inventory[itemIndex] = { ...inventory[itemIndex], ...itemData, updatedAt: new Date().toISOString() };
        }
        delete e.target.dataset.editId;
    } else {
        // Add new item
        itemData.id = Date.now();
        itemData.createdAt = new Date().toISOString();
        inventory.push(itemData);
    }
    
    localStorage.setItem('mess_inventory', JSON.stringify(inventory));
    closeModal();
    loadInventory();
    showLowStockAlerts();
    updateStats();
    
    showNotification('Inventory item saved successfully!', 'success');
}

function closeModal() {
    document.getElementById('item-modal').style.display = 'none';
}

// Feedback Management
function loadFeedbackData() {
    loadStaffFeedback();
}

function loadStaffFeedback() {
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || { feedback: [] };
    const feedback = adminData.feedback;
    
    const container = document.getElementById('staff-feedback-list');
    
    if (feedback.length === 0) {
        container.innerHTML = '<div class="empty-state">No feedback received yet</div>';
        return;
    }
    
    container.innerHTML = feedback.map(fb => `
        <div class="feedback-item" onclick="viewFeedbackDetails(${fb.id})">
            <div class="feedback-header">
                <span class="feedback-student">${fb.student}</span>
                <span class="feedback-rating">${'★'.repeat(fb.foodRating || 0)}${'☆'.repeat(5-(fb.foodRating || 0))}</span>
            </div>
            <div class="feedback-content">${fb.comment}</div>
            <div class="feedback-meta">
                <span>${formatDate(fb.createdAt)}</span>
                <span class="feedback-status ${fb.staffStatus || 'unread'}">${(fb.staffStatus || 'unread').charAt(0).toUpperCase() + (fb.staffStatus || 'unread').slice(1)}</span>
            </div>
        </div>
    `).join('');
}

function filterFeedback() {
    const ratingFilter = document.getElementById('feedback-filter-rating').value;
    const statusFilter = document.getElementById('feedback-filter-status').value;
    
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || { feedback: [] };
    let filtered = adminData.feedback;
    
    if (ratingFilter) {
        filtered = filtered.filter(fb => fb.foodRating == ratingFilter || fb.serviceRating == ratingFilter);
    }
    
    if (statusFilter) {
        filtered = filtered.filter(fb => (fb.staffStatus || 'unread') === statusFilter);
    }
    
    const container = document.getElementById('staff-feedback-list');
    container.innerHTML = filtered.map(fb => `
        <div class="feedback-item" onclick="viewFeedbackDetails(${fb.id})">
            <div class="feedback-header">
                <span class="feedback-student">${fb.student}</span>
                <span class="feedback-rating">${'★'.repeat(fb.foodRating || 0)}${'☆'.repeat(5-(fb.foodRating || 0))}</span>
            </div>
            <div class="feedback-content">${fb.comment}</div>
            <div class="feedback-meta">
                <span>${formatDate(fb.createdAt)}</span>
                <span class="feedback-status ${fb.staffStatus || 'unread'}">${(fb.staffStatus || 'unread').charAt(0).toUpperCase() + (fb.staffStatus || 'unread').slice(1)}</span>
            </div>
        </div>
    `).join('');
}

let currentFeedbackId = null;

function viewFeedbackDetails(feedbackId) {
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || { feedback: [] };
    const feedback = adminData.feedback.find(f => f.id === feedbackId);
    
    if (!feedback) return;
    
    currentFeedbackId = feedbackId;
    
    document.getElementById('feedback-details').innerHTML = `
        <div class="feedback-detail">
            <h4>From: ${feedback.student}</h4>
            <div class="rating-display">
                <span>Food Rating: ${'★'.repeat(feedback.foodRating || 0)}${'☆'.repeat(5-(feedback.foodRating || 0))}</span>
                <span>Service Rating: ${'★'.repeat(feedback.serviceRating || 0)}${'☆'.repeat(5-(feedback.serviceRating || 0))}</span>
            </div>
            <div class="feedback-message">
                <strong>Message:</strong>
                <p>${feedback.comment}</p>
            </div>
            <div class="feedback-timestamp">
                <small>Submitted: ${formatDate(feedback.createdAt)}</small>
            </div>
        </div>
    `;
    
    document.getElementById('feedback-modal').style.display = 'block';
}

function markAsRead() {
    updateFeedbackStatus(currentFeedbackId, 'read');
}

function forwardToAdmin() {
    updateFeedbackStatus(currentFeedbackId, 'forwarded');
    showNotification('Feedback forwarded to admin', 'success');
}

function replyToFeedback() {
    document.getElementById('reply-section').style.display = 'block';
}

function sendReply() {
    const replyText = document.getElementById('reply-text').value;
    if (!replyText.trim()) {
        showNotification('Please enter a reply message', 'error');
        return;
    }
    
    updateFeedbackStatus(currentFeedbackId, 'replied', replyText);
    closeFeedbackModal();
    showNotification('Reply sent successfully', 'success');
}

function updateFeedbackStatus(feedbackId, status, replyMessage = null) {
    let adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || { feedback: [] };
    const feedback = adminData.feedback.find(f => f.id === feedbackId);
    
    if (feedback) {
        feedback.staffStatus = status;
        feedback.staffUpdatedAt = new Date().toISOString();
        
        if (replyMessage) {
            feedback.staffReply = replyMessage;
        }
        
        localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
        loadStaffFeedback();
        updateStats();
    }
}

function closeFeedbackModal() {
    document.getElementById('feedback-modal').style.display = 'none';
    document.getElementById('reply-section').style.display = 'none';
    document.getElementById('reply-text').value = '';
    currentFeedbackId = null;
}

// Profile Management
function updateStaffProfile(e) {
    e.preventDefault();
    
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const updatedUser = {
        ...loggedInUser,
        phone: document.getElementById('profile-phone').value,
        shift: document.getElementById('profile-shift').value
    };
    
    localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
    displayStaffInfo(updatedUser);
    showNotification('Profile updated successfully!', 'success');
}

// Utility Functions
function refreshData() {
    updateStats();
    loadTodaysMenu();
    loadMealDistributions();
    loadInventory();
    showLowStockAlerts();
    loadStaffFeedback();
    showNotification('Data refreshed', 'success');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 6px;
        z-index: 3000;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    }
}

// Setup staff change password form
function setupStaffChangePasswordForm() {
    const changePasswordForm = document.getElementById('staff-change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('staff-current-password').value;
            const newPassword = document.getElementById('staff-new-password').value;
            const confirmPassword = document.getElementById('staff-confirm-password').value;
            
            // Validate passwords
            if (newPassword !== confirmPassword) {
                showNotification('New passwords do not match!', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showNotification('Password must be at least 6 characters long!', 'error');
                return;
            }
            
            // Get current user data
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            if (!loggedInUser || loggedInUser.userType !== 'STAFF') {
                showNotification('Staff user not found!', 'error');
                return;
            }
            
            // Verify current password
            if (currentPassword !== loggedInUser.password) {
                showNotification('Current password is incorrect!', 'error');
                return;
            }
            
            // Update password in localStorage
            loggedInUser.password = newPassword;
            localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
            
            // Update in admin data if it exists (staff members created by admin)
            const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
            if (adminData.staff) {
                const staffIndex = adminData.staff.findIndex(s => s.email === loggedInUser.email || s.staffId === loggedInUser.staffId);
                if (staffIndex !== -1) {
                    adminData.staff[staffIndex].password = newPassword;
                    adminData.lastUpdated = new Date().toISOString();
                    localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
                }
            }
            
            // Clear form
            changePasswordForm.reset();
            
            showNotification('Password changed successfully!', 'success');
        });
    }
}