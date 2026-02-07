// Dashboard JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    setupNavigation();
    setupDatePicker();
    setupFeedbackRating();
    setupForms();
    setupChangePasswordForm();
    loadUserData();
    
    // Load meal data when meal-booking section is accessed
    refreshMealData();
});

// Initialize dashboard functionality
function initializeDashboard() {
    // Check if user is logged in
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Parse user data
    const userData = JSON.parse(user);
    displayUserInfo(userData);
}

// Display user information in sidebar
function displayUserInfo(userData) {
    document.getElementById('student-name').textContent = userData.name || 'Student Name';
    document.getElementById('student-roll').textContent = `Roll: ${userData.rollNumber || 'N/A'}`;
    document.getElementById('student-hostel').textContent = `Hostel: ${userData.hostel || 'N/A'}`;
    
    // Set avatar initial
    const avatar = document.getElementById('student-avatar');
    avatar.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : '👤';
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
    
    // Quick action button handlers
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionName = button.dataset.section;
            const targetNavItem = document.querySelector(`[data-section="${sectionName}"]`);
            switchSection(sectionName, targetNavItem, sections, sectionTitle);
        });
    });
    
    // Logout handler
    document.getElementById('logout-btn').addEventListener('click', logout);
}

// Switch between dashboard sections
function switchSection(sectionName, navItem, sections, sectionTitle) {
    // Update active navigation
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    navItem.classList.add('active');
    
    // Update active section
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Update section title
    const titles = {
        'overview': 'Dashboard Overview',
        'meal-booking': 'Meal Booking',
        'feedback': 'Share Feedback',
        'complaint': 'File Complaint',
        'profile': 'Profile Settings'
    };
    sectionTitle.textContent = titles[sectionName] || 'Dashboard';
    
    // Refresh meal data when accessing meal-booking section
    if (sectionName === 'meal-booking') {
        setTimeout(refreshMealData, 100); // Small delay to ensure section is visible
    }
}

// Setup date picker with constraints
function setupDatePicker() {
    const dateInput = document.getElementById('booking-date');
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 7); // Allow booking up to 7 days in advance
    
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
    dateInput.value = today.toISOString().split('T')[0];
    
    // Load meal bookings when date changes
    dateInput.addEventListener('change', loadMealBookings);
    
    // Load initial bookings
    loadMealBookings();
}

// Setup feedback rating system
function setupFeedbackRating() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('feedback-rating');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.dataset.rating;
            ratingInput.value = rating;
            
            // Update star display
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
        
        star.addEventListener('mouseover', () => {
            const rating = star.dataset.rating;
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.style.opacity = '1';
                } else {
                    s.style.opacity = '0.3';
                }
            });
        });
    });
    
    // Reset on mouse leave
    document.querySelector('.rating-container').addEventListener('mouseleave', () => {
        const currentRating = ratingInput.value;
        stars.forEach((s, index) => {
            if (index < currentRating) {
                s.style.opacity = '1';
            } else {
                s.style.opacity = '0.3';
            }
        });
    });
}

// Setup form handlers
function setupForms() {
    // Meal booking form
    document.getElementById('save-bookings').addEventListener('click', saveMealBookings);
    
    // Feedback form
    document.getElementById('feedback-form').addEventListener('submit', submitFeedback);
    
    // Complaint form
    document.getElementById('complaint-form').addEventListener('submit', submitComplaint);
    
    // Profile form
    document.getElementById('profile-form').addEventListener('submit', updateProfile);
}

// Load user data into profile form
function loadUserData() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
        document.getElementById('profile-name').value = user.name || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-roll').value = user.rollNumber || '';
        document.getElementById('profile-hostel').value = user.hostel || '';
        document.getElementById('profile-room').value = user.room || '';
        document.getElementById('profile-phone').value = user.phone || '';
    }
}

// Refresh meal data from admin dashboard
function refreshMealData() {
    console.log('Refreshing meal data from admin dashboard...');
    loadMealBookings();
}

// Load meal bookings for selected date
function loadMealBookings() {
    const selectedDate = document.getElementById('booking-date').value;
    console.log('Loading meal bookings for date:', selectedDate);
    
    // Get menu data from admin
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
    const menus = adminData.menus || [];
    console.log('Available menus:', menus);
    
    // Filter menus for selected date
    const dayMenus = menus.filter(menu => menu.date === selectedDate);
    console.log('Menus for selected date:', dayMenus);
    
    // Get existing bookings
    const bookings = JSON.parse(localStorage.getItem(`bookings_${selectedDate}`)) || {};
    
    // Update each meal section
    updateMealSection('breakfast', dayMenus, bookings);
    updateMealSection('lunch', dayMenus, bookings);
    updateMealSection('dinner', dayMenus, bookings);
}

// Update individual meal section based on available menu
function updateMealSection(mealType, dayMenus, bookings) {
    console.log(`Updating ${mealType} section...`);
    const mealMenu = dayMenus.find(menu => menu.mealType === mealType);
    console.log(`Menu found for ${mealType}:`, mealMenu);
    
    const checkbox = document.getElementById(`${mealType}-book`);
    const mealCard = checkbox.closest('.meal-card');
    const mealContent = mealCard.querySelector('.meal-content');
    const staticMenuElement = mealCard.querySelector('.meal-menu');
    
    if (mealMenu) {
        console.log(`Enabling ${mealType} booking with menu:`, mealMenu);
        // Menu available - show meal details and enable booking
        checkbox.disabled = false;
        checkbox.checked = bookings[mealType] || false;
        
        // Update the static menu text with dynamic content
        if (staticMenuElement) {
            staticMenuElement.innerHTML = `${mealMenu.items} <strong>(₹${mealMenu.price.toFixed(2)})</strong>`;
        }
        
        // Remove any "not available" message
        const notAvailable = mealCard.querySelector('.not-available');
        if (notAvailable) {
            notAvailable.remove();
        }
        
        // Make sure meal card is not disabled
        mealCard.classList.remove('meal-disabled');
        
    } else {
        console.log(`No menu found for ${mealType}, disabling booking`);
        // No menu available - disable booking and show message
        checkbox.disabled = true;
        checkbox.checked = false;
        
        // Update the static menu text to show unavailable
        if (staticMenuElement) {
            staticMenuElement.innerHTML = 'No menu available for this meal today';
        }
        
        // Add or update "not available" message
        let notAvailable = mealCard.querySelector('.not-available');
        if (!notAvailable) {
            notAvailable = document.createElement('div');
            notAvailable.className = 'not-available';
            mealContent.appendChild(notAvailable);
        }
        
        notAvailable.innerHTML = `
            <div class="no-menu-message">
                <p>❌ Please contact admin or check back later</p>
            </div>
        `;
        
        // Add disabled class to meal card
        mealCard.classList.add('meal-disabled');
    }
}

// Save meal bookings
async function saveMealBookings() {
    const selectedDate = document.getElementById('booking-date').value;
    
    // Only save bookings for enabled (available) meals
    const bookings = {};
    
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const checkbox = document.getElementById(`${mealType}-book`);
        if (!checkbox.disabled && checkbox.checked) {
            bookings[mealType] = true;
        }
    });
    
    // Save to local storage
    localStorage.setItem(`bookings_${selectedDate}`, JSON.stringify(bookings));
    
    // Show success message
    const bookedMeals = Object.keys(bookings);
    if (bookedMeals.length > 0) {
        showNotification(`Meal bookings saved for: ${bookedMeals.join(', ')}!`, 'success');
    } else {
        showNotification('No meals booked. Please select available meals to book.', 'info');
    }
    
    // API call to save meal bookings
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch('http://localhost:8080/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userEmail: user.email,
                orderDate: selectedDate,
                items: Object.entries(bookings).map(([mealType, items]) => ({
                    mealType: mealType.toUpperCase(),
                    menuItems: items
                }))
            })
        });
        
        const result = await response.json();
        if (result.success) {
            showNotification('Meal bookings saved successfully!', 'success');
        } else {
            showNotification('Failed to save bookings: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error saving bookings:', error);
        showNotification('Error saving bookings. Please try again.', 'error');
    }
}

// Submit feedback
function submitFeedback(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const feedbackData = {
        id: Date.now(),
        studentName: user.name,
        studentId: user.id || user.rollNumber,
        studentEmail: user.email,
        type: document.getElementById('feedback-type').value,
        foodRating: document.getElementById('feedback-rating').value,
        serviceRating: document.getElementById('feedback-rating').value,
        comment: document.getElementById('feedback-message').value,
        student: user.name,
        createdAt: new Date().toISOString()
    };
    
    // Validate rating
    if (!feedbackData.foodRating) {
        showNotification('Please provide a rating', 'error');
        return;
    }
    
    // Save feedback to admin dashboard data
    let adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {
        users: [],
        complaints: [],
        feedback: [],
        menus: []
    };
    
    adminData.feedback.push(feedbackData);
    adminData.lastUpdated = new Date().toISOString();
    localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
    
    // Reset form and show success
    document.getElementById('feedback-form').reset();
    document.getElementById('feedback-rating').value = '';
    document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    
    showNotification('Feedback submitted successfully!', 'success');
}

// Submit complaint
function submitComplaint(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const complaintData = {
        id: Date.now(),
        studentName: user.name,
        studentId: user.id || user.rollNumber,
        studentEmail: user.email,
        title: document.getElementById('complaint-subject').value,
        description: document.getElementById('complaint-description').value,
        category: document.getElementById('complaint-category').value,
        priority: document.getElementById('complaint-priority').value,
        status: 'pending',
        student: user.name,
        createdAt: new Date().toISOString()
    };
    
    // Save complaint to admin dashboard data
    let adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {
        users: [],
        complaints: [],
        feedback: [],
        menus: []
    };
    
    adminData.complaints.push(complaintData);
    adminData.lastUpdated = new Date().toISOString();
    localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
    
    // Reset form and show success
    document.getElementById('complaint-form').reset();
    showNotification('Complaint submitted successfully! You will receive updates soon.', 'success');
}

// Update profile
function updateProfile(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const updatedUser = {
        ...user,
        hostel: document.getElementById('profile-hostel').value,
        room: document.getElementById('profile-room').value,
        phone: document.getElementById('profile-phone').value
    };
    
    // Update user data
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update displayed info
    displayUserInfo(updatedUser);
    
    showNotification('Profile updated successfully!', 'success');
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('rememberMe');
        window.location.href = 'login.html';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
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

// Update stats (placeholder data for now)
function updateDashboardStats() {
    // In a real application, this would fetch data from the backend
    const today = new Date().toISOString().split('T')[0];
    const bookings = JSON.parse(localStorage.getItem(`bookings_${today}`)) || {};
    
    const bookedCount = Object.values(bookings).filter(Boolean).length;
    document.getElementById('todays-meals').textContent = `${bookedCount} Booked`;
    
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    document.getElementById('feedback-count').textContent = `${feedbacks.length} Reviews`;
}

// Call updateDashboardStats when the page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateDashboardStats, 500);
});

// Setup change password form
function setupChangePasswordForm() {
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
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
            if (!loggedInUser) {
                showNotification('User not found!', 'error');
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
            
            // Update in users array if it exists
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.email === loggedInUser.email);
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Update in admin data if it exists
            const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
            if (adminData.students) {
                const studentIndex = adminData.students.findIndex(s => s.email === loggedInUser.email);
                if (studentIndex !== -1) {
                    adminData.students[studentIndex].password = newPassword;
                    localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
                }
            }
            
            // Clear form
            changePasswordForm.reset();
            
            showNotification('Password changed successfully!', 'success');
        });
    }
}