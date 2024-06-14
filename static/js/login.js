document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Fetch form data
    const formData = new FormData(this);

    fetch('/login', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    })
    .then(data => {
        // Handle successful login response
        console.log('Login successful:', data);
        alert('Login successful.');
        window.location.href = '/main'; // Redirect to main page after successful login
    })
    .catch(error => {
        // Handle error (e.g., display error message to user)
        console.error('Error logging in:', error);
        alert('Login failed. Please check your credentials and try again.');
    });
});
