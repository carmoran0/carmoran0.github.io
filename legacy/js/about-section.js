// Legacy copy of about-section.js
document.addEventListener('DOMContentLoaded', function() {
    const aboutButton = document.getElementById('about-button');
    const aboutSection = document.getElementById('about-section');
    if (aboutButton && aboutSection) {
        aboutButton.addEventListener('click', function(e) {
            e.preventDefault();
            aboutSection.classList.toggle('visible');
            aboutButton.classList.toggle('active');
        });
    }
});
