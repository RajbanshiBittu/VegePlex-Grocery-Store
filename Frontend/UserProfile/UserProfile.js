// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = '../Login/login.html';
}

// Load user data into profile
document.getElementById('user-name').textContent = user.fullname || 'Not Set';
document.getElementById('user-contact').textContent = user.phone || 'Not Set';
document.getElementById('user-email').textContent = user.email || 'Not Set';
document.getElementById('user-location').textContent = user.location || 'Not Set';

// Update profile picture if available
if (user.profile_photo) {
    document.querySelector('.avatar img').src = user.profile_photo;
}

let toggleEdit = () => {
    const popup = document.getElementById("edit-popup");
    popup.style.display = popup.style.display === "flex" ? "none" : "flex";

    // prefill input fields with current data 
    if(popup.style.display === "flex"){
        document.getElementById("nameInput").value = user.fullname || '';
        document.getElementById("contactInput").value = user.phone || '';
        document.getElementById("emailInput").value = user.email || '';
        document.getElementById("locationInput").value = user.location || '';
    }
}

let saveProfile = async () => {
    const formData = {
        userid: user.email, // original email as identifier
        fullname: document.getElementById("nameInput").value,
        email: document.getElementById("emailInput").value,
        phone: document.getElementById("contactInput").value,
        location: document.getElementById("locationInput").value
    };

    try {
        const response = await fetch('http://localhost:3000/api/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Update displayed profile info
            document.getElementById("user-name").textContent = formData.fullname;
            document.getElementById("user-contact").textContent = formData.phone;
            document.getElementById("user-email").textContent = formData.email;
            document.getElementById("user-location").textContent = formData.location;

            // Update local storage with all user data
            const updatedUser = {
                ...user,
                fullname: formData.fullname,
                email: formData.email,
                phone: formData.phone,
                location: formData.location
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            alert('Profile updated successfully!');
            toggleEdit(); // Close the popup
        } else {
            alert(data.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating profile');
    }
}

// Handle logout
document.querySelector('.profile-card > button:last-child').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = '../Login/login.html';
});