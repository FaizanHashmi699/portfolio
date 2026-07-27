// close the mobile menu after a nav link is clicked
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelectorAll('nav ul li a');

navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        menuToggle.checked = false;
    });
});

// highlight the nav link matching the section currently in view
const sections = document.querySelectorAll('section[id]');

const highlightActiveLink = () => {
    let currentId = sections[0]?.id;

    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 120) {
            currentId = section.id;
        }
    });

    navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
};

window.addEventListener('scroll', highlightActiveLink);
highlightActiveLink();

// fade sections in as they scroll into view (hidden state added here, not
// in CSS, so the sections stay visible if this script never runs)
const revealElements = document.querySelectorAll('.reveal');
revealElements.forEach((el) => el.classList.add('reveal-init'));

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15 }
);

revealElements.forEach((el) => revealObserver.observe(el));
