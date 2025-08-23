function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleButton.textContent = 'Show';
    }
}

function showMessage(message, type = 'error') {
    const errorElement = document.getElementById('errorMessage');
    const successElement = document.getElementById('successMessage');
    
    // Hide both messages first
    errorElement.style.display = 'none';
    successElement.style.display = 'none';
    
    if (type === 'error') {
        errorElement.innerHTML = message;
        errorElement.style.display = 'block';
    } else {
        successElement.innerHTML = message;
        successElement.style.display = 'block';
    }
}

function hideMessages() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const form = this
    const formData = new FormData(this);
    const username = formData.get('username');
    const password = formData.get('password');
    
    // Hide any previous messages
    hideMessages();
    
    // Basic validation
    if (!username || !password) {
        showMessage('Please fill in all fields');
        return;
    }
    
    // Simulate login process
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Logging You In...';
    submitBtn.disabled = true;
    
    // Demo login logic
    // setTimeout(() => {
    //     if (username === 'demo@example.com' && password === 'demo123') {
    //         showMessage('Login successful! Redirecting...', 'success');
    //         setTimeout(() => {
    //             alert('Login successful! In a real app, you would be redirected to the dashboard.');
    //         }, 1000);
    //     } else {
    //         showMessage('Invalid email/username or password. Try demo@example.com / demo123');
    //     }
        
    //     submitBtn.textContent = originalText;
    //     submitBtn.disabled = false;
    // }, 1500);
    fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Check what's actually in localStorage
        console.log("All localStorage keys:", Object.keys(localStorage));
        console.log("jwtToken value:", localStorage.getItem('jwtToken'));
        console.log("access_token value:", localStorage.getItem('access_token')); // Just in case
        console.log(data)
        if (data.success && data.access_token) {
            localStorage.setItem('jwtToken', data.access_token);
            console.log("Login successful");
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'C:/Users/LGND/Desktop/Desktop Shii/api playground/frontend/dashboard.html';
            }, 1000);
        } else{
            showMessage('Invalid Credentials');
            console.log(data.error);
        }
    })
    .catch(error => {
        console.log(error)
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
});

// Add subtle hover effects to form inputs
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentNode.style.transform = 'translateY(-2px)';
    });
    
    input.addEventListener('blur', function() {
        this.parentNode.style.transform = 'translateY(0)';
    });
});

// Auto-fill demo credentials when clicking on the demo box
document.querySelector('.demo-credentials').addEventListener('click', function() {
    document.getElementById('username').value = 'demo@example.com';
    document.getElementById('password').value = 'demo123';
    hideMessages();
});

// Clear messages when user starts typing
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', hideMessages);
});