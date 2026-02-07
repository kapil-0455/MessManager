const form = document.getElementById("signupForm");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");
const strengthBar = document.getElementById("strength-bar");
const strengthText = document.getElementById("strength-text");
const togglePassword = document.querySelector(".toggle-password");

// Show/Hide Password
togglePassword.addEventListener("click", () => {
  const type = password.type === "password" ? "text" : "password";
  password.type = type;
  confirmPassword.type = type;
  togglePassword.textContent = type === "password" ? "" : "";
});

// Password Strength Check
password.addEventListener("input", () => {
  const val = password.value;
  let strength = 0;

  if (val.match(/[a-z]+/)) strength++;
  if (val.match(/[A-Z]+/)) strength++;
  if (val.match(/[0-9]+/)) strength++;
  if (val.match(/[$@#&!]+/)) strength++;
  if (val.length >= 8) strength++;

  strengthBar.style.width = (strength * 20) + "%";

  switch (strength) {
    case 0:
    case 1:
      strengthBar.style.background = "red";
      strengthText.textContent = "Weak";
      break;
    case 2:
    case 3:
      strengthBar.style.background = "orange";
      strengthText.textContent = "Medium";
      break;
    case 4:
    case 5:
      strengthBar.style.background = "green";
      strengthText.textContent = "Strong";
      break;
  }
});

// Form Validation
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match!");
    return;
  }

  if (!document.getElementById("terms").checked) {
    alert("Please agree to the Terms & Conditions.");
    return;
  }

  // Collect form data
  const userData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    rollNumber: document.getElementById("rollno").value,
    hostel: document.getElementById("hostel").value,
    room: document.getElementById("room").value,
    phone: document.getElementById("phone").value,
    password: password.value
  };

  console.log('Signup attempt with data:', userData);

  // Call backend API for signup
  signupUser(userData);
});

// Function to call backend API for user signup
async function signupUser(userData) {
  try {
    const response = await fetch('http://localhost:8080/api/students/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert('✅ Signup successful! You can now login.');
      // Redirect to login page
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } else {
      alert('❌ Signup failed: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert('❌ Network error. Please check if the server is running and try again.');
  }
}
