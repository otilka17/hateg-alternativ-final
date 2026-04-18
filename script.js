/**
 * Rânduiala Automată - Hațeg Alternativ
 * Gestionează navigarea și meniul pe toate paginile
 */

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. REPARARE AUTOMATĂ LINK-URI EVENIMENTE
    // Caută toate link-urile care duc la pagina veche sau care au textul "Evenimente"
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        const text = link.textContent.trim().toLowerCase();
        const href = link.getAttribute('href');
        
        if (text === 'evenimente' || (href && href.includes('evenimente-tarife.html'))) {
            link.setAttribute('href', 'evenimente.html');
        }
    });

    // 2. LOGICĂ MENIU BURGER (COMUNĂ)
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav-links');
    
    if (burger && nav) {
        // Ștergem eventualele evenimente vechi pentru a evita dublarea
        burger.onclick = null; 
        
        burger.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // 3. MARCARE PAGINĂ ACTIVĂ ÎN MENIU
    const currentPath = window.location.pathname.split("/").pop();
    if (nav) {
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.style.color = "#c5a059"; // Culoarea aurie pentru pagina curentă
            }
        });
    }
});
