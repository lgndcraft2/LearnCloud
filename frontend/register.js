window.addEventListener('beforeunload', function(e) {
    console.log('Page is about to unload/reload');
    console.trace(); // This will show you what triggered the reload
});

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = 'Hide';
    } else {
        input.type = 'password';
        button.textContent = 'Show';
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

document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = this;
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;


    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
    }


    const formData = new FormData(this);
    fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.success) {
            console.log("Yayyy, it worked")
            alert(data.message);
            form.reset();
            showMessage('Registration successful! <a href="login.html">Log In Here</a>', 'success');
        } else if(data.error == "Email already exists") {
            showMessage('Invalid email: Used by another.');
        } else{
            alert('An error occurred: ' + data.error);
            console.log("Umm, some error smwhere")
        }
    })
    .catch(error => {
        console.error('Error:', error, "heheeee");
        alert(error.message);
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
});

// Add subtle hover effects to form inputs
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentNode.style.transform = 'translateY(-2px)';
    });
    
    input.addEventListener('blur', function() {
        this.parentNode.style.transform = 'translateY(0)';
    });
});