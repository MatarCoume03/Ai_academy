document.addEventListener('DOMContentLoaded', () => {
    // Mettre en évidence le lien de navigation actif
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
    link.style.fontWeight = 'bold';
    link.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    }
    });
    // Animation simple pour les messages de succès
    const thanksMessage = document.querySelector('.thanks-message');
    if (thanksMessage) {
    thanksMessage.style.animation = 'fadeIn 1s ease-in';
    }
    });
    // Fonction de validation du formulaire de contact
    const contactForm = document.querySelector('form[action="/contact"]');
    if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
    const emailInput = contactForm.querySelector('#email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value)) {
    e.preventDefault();
    alert('Veuillez entrer une adresse email valide.');
    }
    });
    }