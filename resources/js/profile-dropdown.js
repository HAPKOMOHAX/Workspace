document.addEventListener('DOMContentLoaded', () => {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');

    if (!profileBtn || !profileMenu) return;

    const closeMenu = () => {
        profileMenu.classList.remove('show');
        profileBtn.setAttribute('aria-expanded', 'false');
    };

    const toggleMenu = () => {
        const isOpen = profileMenu.classList.toggle('show');
        profileBtn.setAttribute('aria-expanded', String(isOpen));
    };

    profileBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    window.addEventListener('click', (event) => {
        if (!profileBtn.contains(event.target) && !profileMenu.contains(event.target)) {
            closeMenu();
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
});
