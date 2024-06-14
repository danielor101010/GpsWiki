function startApp() {
    // Check if user is authenticated (example: check if user token exists)
    if (localStorage.getItem('token')) {
        // Redirect to main page
        window.location.href = '/main';
    } else {
        // Redirect to login page if not authenticated
        window.location.href = '/main';
    }
}
