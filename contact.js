document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Verificăm capcana: dacă "honeypot" are ceva în el, e un robot!
    if (document.getElementById('honeypot').value !== "") {
        console.log("Robot detectat! Marș de aici.");
        return; // Oprim totul, nu trimitem email-ul
    }

    // ... restul codului tău cu EmailJS merge aici ...
});

function closeSuccess() {
    const overlay = document.getElementById('success-overlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 500);
}
