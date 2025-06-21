// Form validation function
function validateForm() {
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    const fullnameError = document.getElementById('fullname-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');

    let isValid = true;

    // Reset error messages
    [fullnameError, emailError, phoneError, passwordError, confirmPasswordError].forEach(error => {
        if (error) error.textContent = '';
    });

    // Fullname validation
    if (!fullname) {
        fullnameError.textContent = 'Full name is required';
        isValid = false;
    } else if (fullname.length < 3) {
        fullnameError.textContent = 'Full name must be at least 3 characters';
        isValid = false;
    }

    // Email validation
    if (!email) {
        emailError.textContent = 'Email is required';
        isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        emailError.textContent = 'Please enter a valid email';
        isValid = false;
    }

    // Phone validation
    if (!phone) {
        phoneError.textContent = 'Phone number is required';
        isValid = false;
    } else if (phone.length !== 10) {
        phoneError.textContent = 'Phone number must be 10 digits';
        isValid = false;
    }

    // Password validation
    if (!password) {
        passwordError.textContent = 'Password is required';
        isValid = false;
    } else if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
        confirmPasswordError.textContent = 'Please confirm your password';
        isValid = false;
    } else if (password !== confirmPassword) {
        confirmPasswordError.textContent = 'Passwords do not match';
        isValid = false;
    }

    return isValid;
}

// Show loading state
function setLoading(isLoading) {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Account';
    }
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    const formData = {
        fullname: document.getElementById('fullname').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        password: document.getElementById('password').value
    };

    try {
        setLoading(true);

        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Registration successful! Redirecting to login...';
            document.getElementById('registerForm').appendChild(successMessage);
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = '../login/login.html';
            }, 2000);
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = data.message || 'Registration failed. Please try again.';
            document.getElementById('registerForm').insertBefore(errorDiv, document.querySelector('button'));
        }
    } catch (error) {
        console.error('Error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Network error. Please check your connection and try again.';
        document.getElementById('registerForm').insertBefore(errorDiv, document.querySelector('button'));
    } finally {
        setLoading(false);
    }
});

// Real-time phone number validation
document.getElementById('phone').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    if (e.target.value.length > 10) {
        e.target.value = e.target.value.slice(0, 10);
    }
});