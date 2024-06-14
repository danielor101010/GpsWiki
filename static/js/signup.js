document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Fetch form data
    const formData = new FormData(this);

    // Send POST request to server
    fetch('/signup', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Handle successful signup response
        console.log('Signup successful:', data);
        // Store username and password in cookies
        document.cookie = `username=${formData.get('username')}; path=/`;
        document.cookie = `password=${formData.get('password')}; path=/`;
        alert('Signup successful. You can now login.');
        window.location.href = '/login'; // Redirect to login page after successful signup
    })
    .catch(error => {
        // Handle error (e.g., display error message to user)
        console.error('Error signing up:', error);
        alert('Signup failed. Please try again.');
    });
});
