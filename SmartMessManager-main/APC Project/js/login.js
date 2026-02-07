const loginForm = document.getElementById('loginForm');
const userType = document.getElementById('userType');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

// Password toggle with emoji change
togglePassword.addEventListener('click', () => {
    if(passwordInput.type === "password"){
        passwordInput.type = "text";
        togglePassword.textContent = '🙈';  // Eye closed emoji
        togglePassword.style.color = "#ff6b6b"; // optional highlight
    } else {
        passwordInput.type = "password";
        togglePassword.textContent = '👁️';  // Eye open emoji
        togglePassword.style.color = "#feca57"; // default color
    }
});

// Prefill email and userType if Remember Me used
window.addEventListener('load', () => {
    if(localStorage.getItem('rememberMe') === 'true'){
        emailInput.value = localStorage.getItem('email');
        userType.value = localStorage.getItem('userType');
    }
});

// Form submission
loginForm.addEventListener('submit', function(e){
    e.preventDefault();

    // Clear previous errors
    document.querySelectorAll('.error-msg').forEach(el => el.remove());

    let valid = true;

    // Validate user type
    if(!userType.value){
        showError(userType, "Please select a user type");
        valid = false;
    }

    // Validate email
    if(!emailInput.value){
        showError(emailInput, "Email is required");
        valid = false;
    } else if(!validateEmail(emailInput.value)){
        showError(emailInput, "Invalid email format");
        valid = false;
    }

    // Validate password
    if(!passwordInput.value){
        showError(passwordInput, "Password is required");
        valid = false;
    }

    if(!valid) return;

    // Save Remember Me
    const rememberMe = document.querySelector('input[type="checkbox"]').checked;
    if(rememberMe){
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('email', emailInput.value);
        localStorage.setItem('userType', userType.value);
    } else {
        localStorage.setItem('rememberMe', 'false');
        localStorage.removeItem('email');
        localStorage.removeItem('userType');
    }

    // Perform actual authentication
    performLogin(emailInput.value, passwordInput.value, userType.value);
});

// Authentication function
async function performLogin(email, password, selectedUserType) {
    const loginButton = loginForm.querySelector('button');
    loginButton.innerText = 'Logging in...';
    loginButton.disabled = true;

    try {
        // Call backend API for login
        const response = await fetch('http://localhost:8080/api/students/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            localStorage.setItem('loggedInUser', JSON.stringify(result.data));
            alert(`✅ Login successful! Welcome ${result.data.name}`);
            
            // Redirect to student dashboard
            window.location.href = 'studentDashboard.html';
        } else {
            showError(loginForm, result.message || 'Invalid credentials. Please check your email and password.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(loginForm, 'Network error. Please check if the server is running and try again.');
    } finally {
        loginButton.innerText = 'Login';
        loginButton.disabled = false;
    }
}

// Client-side authentication function
function tryClientSideLogin(email, password, userType) {
    try {
        console.log('Attempting login for:', email, userType);
        
        // Check for admin login
        if (userType === 'ADMIN' && email === 'admin@messmate.com') {
            const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
            const adminPassword = adminData.adminPassword || 'admin123';
            
            if (password === adminPassword) {
                return {
                    success: true,
                    user: {
                        id: 1,
                        name: 'Admin User',
                        email: 'admin@messmate.com',
                        userType: 'ADMIN',
                        role: 'System Administrator',
                        password: adminPassword
                    }
                };
            }
        }
        
        // Check for student login
        if (userType === 'STUDENT') {
            const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
            const users = adminData.users || [];
            console.log('=== STUDENT LOGIN DEBUG ===');
            console.log('Attempting login for email:', email);
            console.log('Attempting login for password:', password);
            console.log('Current messmate_admin_data:', localStorage.getItem('messmate_admin_data'));
            console.log('Available users in admin data:', users);
            console.log('Looking for user with email:', email, 'and userType: STUDENT');
            
            const user = users.find(u => {
                console.log('Checking user:', u);
                console.log('Email match:', u.email === email);
                console.log('Password match:', u.password === password);
                console.log('UserType match:', u.userType === 'STUDENT');
                return u.email === email && 
                       u.password === password && 
                       u.userType === 'STUDENT';
            });
            
            if (user) {
                console.log('Student login successful for:', user);
                return {
                    success: true,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        userType: 'STUDENT',
                        rollNumber: user.rollNumber,
                        hostel: user.hostel,
                        room: user.room,
                        phone: user.phone,
                        password: user.password
                    }
                };
            } else {
                console.log('❌ No student user found with provided credentials');
                console.log('Checked', users.length, 'users');
                if (users.length === 0) {
                    console.log('❌ NO USERS IN SYSTEM - Did you sign up yet?');
                } else {
                    console.log('Available user emails:', users.map(u => u.email));
                }
            }
        }
        
        // Check for staff login
        if (userType === 'STAFF') {
            const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
            const staffMembers = adminData.staff || [];
            
            const staff = staffMembers.find(s => 
                (s.email === email || s.staffId === email) && 
                s.password === password && 
                s.status === 'active'
            );
            
            if (staff) {
                return {
                    success: true,
                    user: {
                        id: staff.id,
                        staffId: staff.staffId,
                        name: staff.name,
                        email: staff.email,
                        phone: staff.phone,
                        shift: staff.shift,
                        role: staff.role,
                        userType: 'STAFF',
                        status: staff.status
                    }
                };
            }
        }
        
        return { success: false, message: 'Invalid credentials' };
    } catch (error) {
        console.error('Error in client-side login:', error);
        return { success: false, message: 'Login error' };
    }
}

// Debug function - call this from browser console to check localStorage
function debugUserData() {
    console.log('=== DEBUGGING USER DATA ===');
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
    console.log('messmate_admin_data:', adminData);
    console.log('Number of users:', (adminData.users || []).length);
    console.log('All users:', adminData.users || []);
    
    // Check password field for each user
    console.log('=== PASSWORD CHECK ===');
    (adminData.users || []).forEach((user, index) => {
        console.log(`User ${index + 1} (${user.email}):`, {
            hasPassword: !!user.password,
            passwordValue: user.password || 'MISSING',
            userType: user.userType
        });
    });
    
    // Also check for other storage keys
    console.log('Other localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(`${key}:`, localStorage.getItem(key));
    }
    return adminData;
}

// Function to fix users without passwords
function fixMissingPasswords() {
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
    let fixed = 0;
    
    (adminData.users || []).forEach(user => {
        if (!user.password) {
            // Add a temporary password based on their name
            user.password = user.name.toLowerCase().replace(/\s+/g, '') + '123';
            fixed++;
            console.log(`Fixed password for ${user.email}, new password: ${user.password}`);
        }
    });
    
    if (fixed > 0) {
        adminData.lastUpdated = new Date().toISOString();
        localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
        console.log(`Fixed ${fixed} users with missing passwords`);
    } else {
        console.log('No users needed password fixes');
    }
    
    return fixed;
}

// Function to set custom password for any user
function setUserPassword(email, newPassword) {
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
    const user = (adminData.users || []).find(u => u.email === email);
    
    if (!user) {
        console.log(`❌ User with email ${email} not found`);
        return false;
    }
    
    user.password = newPassword;
    adminData.lastUpdated = new Date().toISOString();
    localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
    
    console.log(`✅ Password updated for ${user.name} (${email})`);
    console.log(`New password: ${newPassword}`);
    return true;
}

// Function to set password for multiple users at once
function setPasswordsForUsers(userPasswordMap) {
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
    let updated = 0;
    
    for (const [email, password] of Object.entries(userPasswordMap)) {
        const user = (adminData.users || []).find(u => u.email === email);
        if (user) {
            user.password = password;
            updated++;
            console.log(`✅ Updated password for ${user.name} (${email}): ${password}`);
        } else {
            console.log(`❌ User not found: ${email}`);
        }
    }
    
    if (updated > 0) {
        adminData.lastUpdated = new Date().toISOString();
        localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
        console.log(`✅ Updated passwords for ${updated} users`);
    }
    
    return updated;
}

// Make it globally available
window.debugUserData = debugUserData;
window.fixMissingPasswords = fixMissingPasswords;
window.setUserPassword = setUserPassword;
window.setPasswordsForUsers = setPasswordsForUsers;

// Show error function
function showError(input, message){
    const error = document.createElement('div');
    error.className = 'error-msg';
    error.style.color = 'red';
    error.style.fontSize = '13px';
    error.style.marginTop = '-15px';
    error.style.marginBottom = '10px';
    error.innerText = message;
    input.parentNode.appendChild(error);
}

// Email regex validation
function validateEmail(email){
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}


// Cursor follower glow
const cursor = document.createElement('div');
cursor.style.width = '15px';
cursor.style.height = '15px';
cursor.style.borderRadius = '50%';
cursor.style.position = 'absolute';
cursor.style.pointerEvents = 'none';
cursor.style.background = 'rgba(255, 107, 107, 0.7)'; // pinkish glow
cursor.style.transition = 'transform 0.1s ease-out';
cursor.style.zIndex = '1000';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    cursor.style.transform = `translate(${e.clientX - 7.5}px, ${e.clientY - 7.5}px)`;
});

// Cursor follower glow
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.createElement('div');
    cursor.id = 'cursor-follower';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
});
