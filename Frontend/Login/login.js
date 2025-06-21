// Form validation function
function validateForm() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    let isValid = true;

    // Reset error messages
    emailError.textContent = '';
    passwordError.textContent = '';

    // Email validation
    if (!email) {
        emailError.textContent = 'Email is required';
        isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        emailError.textContent = 'Please enter a valid email';
        isValid = false;
    }

    // Password validation
    if (!password) {
        passwordError.textContent = 'Password is required';
        isValid = false;
    }

    return isValid;
}

// Show loading state
function setLoading(isLoading) {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Login';
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const formData = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
    };

    try {
        setLoading(true);

        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Store user info in localStorage for session management
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Login successful! Redirecting...';
            document.getElementById('loginForm').appendChild(successMessage);
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = data.message || 'Login failed. Please check your credentials.';
            document.getElementById('loginForm').insertBefore(errorDiv, document.querySelector('button'));
        }
    } catch (error) {
        console.error('Error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Network error. Please check your connection and try again.';
        document.getElementById('loginForm').insertBefore(errorDiv, document.querySelector('button'));
    } finally {
        setLoading(false);
    }
});