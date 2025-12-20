// Navigation scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Mobile menu toggle - wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
});

// Smooth scroll function with animation
function smoothScrollTo(targetElement, offset = 0) {
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000; // milliseconds
    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const percentage = Math.min(progress / duration, 1);

        // Easing function (ease-in-out-cubic)
        const ease = percentage < 0.5
            ? 4 * percentage * percentage * percentage
            : 1 - Math.pow(-2 * percentage + 2, 3) / 2;

        window.scrollTo(0, startPosition + distance * ease);

        if (progress < duration) {
            window.requestAnimationFrame(step);
        }
    }

    window.requestAnimationFrame(step);
}

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const navMenu = document.getElementById('navMenu');
    const navToggle = document.getElementById('navToggle');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Only handle hash links (smooth scroll), let other links work normally
            if (!targetId || targetId === '#' || !targetId.startsWith('#')) {
                return; // Allow normal link behavior
            }

            // Check if target is on the same page
            const target = document.querySelector(targetId);

            if (target) {
                e.preventDefault();
                e.stopPropagation();

                const navbarHeight = 80; // Height of fixed navbar
                smoothScrollTo(target, navbarHeight);

                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    });
});

// Custom Popup Functions
function showPopup(title, message, icon = '✨', showDiscord = false) {
    const popup = document.getElementById('customPopup');
    const popupTitle = document.getElementById('popupTitle');
    const popupMessage = document.getElementById('popupMessage');
    const popupIcon = popup.querySelector('.popup-icon');
    const popupDiscord = document.getElementById('popupDiscord');

    popupTitle.textContent = title;
    popupMessage.textContent = message;
    popupIcon.textContent = icon;

    // Show/hide Discord button
    if (popupDiscord) {
        popupDiscord.style.display = showDiscord ? 'block' : 'none';
    }

    popup.classList.add('active');
}

function hidePopup() {
    const popup = document.getElementById('customPopup');
    popup.classList.remove('active');
}

// Popup event listeners
document.addEventListener('DOMContentLoaded', () => {
    const popupClose = document.getElementById('popupClose');
    const popupButton = document.getElementById('popupButton');
    const popup = document.getElementById('customPopup');

    if (popupClose) {
        popupClose.addEventListener('click', hidePopup);
    }

    if (popupButton) {
        popupButton.addEventListener('click', hidePopup);
    }

    // Close on overlay click
    const popupOverlay = popup.querySelector('.popup-overlay');
    if (popupOverlay) {
        popupOverlay.addEventListener('click', hidePopup);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('active')) {
            hidePopup();
        }
    });
});

// Mailchimp form response handlers
document.addEventListener('DOMContentLoaded', () => {
    const mailchimpForm = document.getElementById('mc-embedded-subscribe-form');
    const emailInput = document.getElementById('mce-EMAIL');

    if (mailchimpForm && emailInput) {
        const formSpinner = document.getElementById('formSpinner');
        const submitButton = document.getElementById('mc-embedded-subscribe');

        // Function to show loading state
        const showLoading = () => {
            mailchimpForm.classList.add('loading');
            if (formSpinner) {
                formSpinner.style.display = 'block';
            }
            emailInput.disabled = true;
            if (submitButton) {
                submitButton.disabled = true;
            }
        };

        // Function to hide loading state
        const hideLoading = () => {
            mailchimpForm.classList.remove('loading');
            if (formSpinner) {
                formSpinner.style.display = 'none';
            }
            emailInput.disabled = false;
            if (submitButton) {
                submitButton.disabled = false;
            }
        };

        // Subscription Consent Logic
        let isConsented = false;
        const consentPopup = document.getElementById('consentPopup');
        const consentCheckbox = document.getElementById('consentCheckbox');
        const consentConfirmButton = document.getElementById('consentConfirmButton');
        const consentPopupClose = document.getElementById('consentPopupClose');

        if (consentCheckbox && consentConfirmButton) {
            consentCheckbox.addEventListener('change', function () {
                consentConfirmButton.disabled = !this.checked;
                consentConfirmButton.style.opacity = this.checked ? '1' : '0.5';
                consentConfirmButton.style.cursor = this.checked ? 'pointer' : 'not-allowed';
            });

            consentConfirmButton.addEventListener('click', function () {
                if (consentCheckbox.checked) {
                    isConsented = true;
                    consentPopup.classList.remove('active');
                    mailchimpForm.requestSubmit();
                }
            });
        }

        if (consentPopupClose) {
            consentPopupClose.addEventListener('click', function () {
                consentPopup.classList.remove('active');
            });
        }

        // Close consent popup on overlay click
        if (consentPopup) {
            const overlay = consentPopup.querySelector('.popup-overlay');
            if (overlay) {
                overlay.addEventListener('click', function () {
                    consentPopup.classList.remove('active');
                });
            }
        }

        // Check for responses periodically after form submission
        // JSONP Helper Function
        const jsonp = (url, params) => {
            return new Promise((resolve, reject) => {
                const callbackName = 'mailchimp_callback_' + Math.round(100000 * Math.random());
                const script = document.createElement('script');
                let isResolved = false;

                // Cleanup function
                const cleanup = () => {
                    delete window[callbackName];
                    if (document.head.contains(script)) {
                        document.head.removeChild(script);
                    }
                };

                // Define global callback
                window[callbackName] = (data) => {
                    if (isResolved) return;
                    isResolved = true;
                    cleanup();
                    resolve(data);
                };

                // Handle script load error
                script.onerror = () => {
                    if (isResolved) return;
                    isResolved = true;
                    cleanup();
                    reject(new Error('Script load error'));
                };

                // Handle script load success (but potentially no callback)
                script.onload = () => {
                    // If script loaded but callback didn't fire, it means the content wasn't valid JS (e.g. 404 HTML page returned as 200)
                    if (!isResolved) {
                        isResolved = true;
                        cleanup();
                        reject(new Error('Script loaded but callback not executed'));
                    }
                };

                // Construct URL
                // Convert /post? to /post-json? for JSONP support
                // Regex handles /post? and /post (in case of no params)
                let jsonpUrl = url.replace(/\/post(\?|$)/, '/post-json$1');

                // Build query string
                const query = new URLSearchParams(params);
                query.append('c', callbackName); // Add callback parameter
                query.append('_', Date.now()); // Add cache buster

                // Ensure proper joining of URL and query
                const separator = jsonpUrl.includes('?') ? '&' : '?';
                script.src = `${jsonpUrl}${separator}${query.toString()}`;

                document.head.appendChild(script);
            });
        };

        // Handle form submission
        mailchimpForm.addEventListener('submit', function (e) {
            e.preventDefault(); // ALWAYS prevent default submission to avoid new tab

            try {
                const email = emailInput.value.trim();

                // 1. Local Validation
                if (!email || !isValidEmail(email)) {
                    showPopup('Error', 'Please enter a valid email address.', '⚠', false);
                    emailInput.focus();
                    return;
                }

                // 2. Consent Check
                if (!isConsented) {
                    if (consentPopup) {
                        consentPopup.classList.add('active');
                    }
                    return;
                }

                // Prepare form data
                // IMPORTANT: Capture data BEFORE disabling inputs (showLoading), otherwise FormData will be empty!
                const formData = new FormData(mailchimpForm);
                const params = {};
                formData.forEach((value, key) => {
                    params[key] = value;
                });

                // 3. Show Loading
                showLoading();

                // 4. Send Request via JSONP with 15s Timeout
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout')), 15000);
                });

                Promise.race([jsonp(mailchimpForm.action, params), timeoutPromise])
                    .then((data) => {
                        // MailChimp returns specific responses in data.result and data.msg
                        console.log('MailChimp response:', data);
                        hideLoading();

                        if (data.result === 'success') {
                            showPopup('Success!', 'Thank you for subscribing! We\'ll keep you updated.', '✓', true);
                            emailInput.value = '';
                            isConsented = false; // Reset consent
                            // Uncheck box if needed
                            if (consentCheckbox) consentCheckbox.checked = false;
                            if (consentConfirmButton) {
                                consentConfirmButton.disabled = true;
                                consentConfirmButton.style.opacity = '0.5';
                                consentConfirmButton.style.cursor = 'not-allowed';
                            }

                        } else {
                            // Error from MailChimp (e.g. "is already subscribed", invalid email format server-side)
                            isConsented = false; // Reset consent on error
                            if (consentCheckbox) consentCheckbox.checked = false;
                            if (consentConfirmButton) {
                                consentConfirmButton.disabled = true;
                                consentConfirmButton.style.opacity = '0.5';
                                consentConfirmButton.style.cursor = 'not-allowed';
                            }

                            // Clean up error message if it contains HTML (sometimes happens)
                            let msg = data.msg || 'An error occurred.';
                            // Simple strip of HTML if present, or just use as is if text
                            if (msg.includes('0 - ')) msg = msg.replace('0 - ', '');

                            showPopup('Error', msg, '⚠', false);
                        }
                    })
                    .catch((error) => {
                        hideLoading();
                        isConsented = false; // Reset consent on error
                        if (consentCheckbox) consentCheckbox.checked = false;
                        if (consentConfirmButton) {
                            consentConfirmButton.disabled = true;
                            consentConfirmButton.style.opacity = '0.5';
                            consentConfirmButton.style.cursor = 'not-allowed';
                        }
                        console.error('Submission error:', error);
                        if (error.message === 'Timeout') {
                            showPopup('Error', 'The request is taking longer than expected. Please check your connection and try again.', '⚠', false);
                        } else {
                            showPopup('Error', 'An error occurred while connecting to the server. Please try again later.', '⚠', false);
                        }
                    });

            } catch (error) {
                hideLoading();
                console.error('Form logic error:', error);
                showPopup('Error', 'An internal error occurred. Please refresh and try again.', '⚠', false);
            }
        });

        // Allow Enter key to submit
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                mailchimpForm.requestSubmit();
            }
        });
    }
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and team cards
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .team-card');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});



// Add parallax effect to hero background
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const backgroundVideo = document.querySelector('.background-video');

    if (backgroundVideo && scrolled < window.innerHeight) {
        backgroundVideo.style.transform = `translate(-50%, calc(-50% + ${scrolled * 0.5}px))`;
    }

    // Parallax effect for About section background
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        const aboutRect = aboutSection.getBoundingClientRect();
        const aboutTop = aboutRect.top;
        const aboutHeight = aboutRect.height;
        const windowHeight = window.innerHeight;

        // Calculate parallax when section is in view
        if (aboutTop < windowHeight && aboutTop + aboutHeight > 0) {
            // Calculate how much of the section has scrolled past the top of viewport
            const scrollProgress = (windowHeight - aboutTop) / (windowHeight + aboutHeight);
            // Parallax moves slower than scroll (0.5x speed)
            const parallaxOffset = scrollProgress * aboutHeight * 0.5;
            aboutSection.style.setProperty('--parallax-offset', `${parallaxOffset}px`);
        }
    }

    // Parallax effect for Press section background
    const pressSection = document.querySelector('.press');
    if (pressSection) {
        const pressRect = pressSection.getBoundingClientRect();
        const pressTop = pressRect.top;
        const pressHeight = pressRect.height;
        const windowHeight = window.innerHeight;

        // Calculate parallax when section is in view
        if (pressTop < windowHeight && pressTop + pressHeight > 0) {
            // Calculate how much of the section has scrolled past the top of viewport
            const scrollProgress = (windowHeight - pressTop) / (windowHeight + pressHeight);
            // Parallax moves slower than scroll (0.5x speed)
            const parallaxOffset = scrollProgress * pressHeight * 0.5;
            pressSection.style.setProperty('--parallax-offset', `${parallaxOffset}px`);
        }
    }
});

// Add subtle animations on scroll
const addScrollAnimations = () => {
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.2 });

        sectionObserver.observe(section);
    });
};

// Initialize scroll animations
addScrollAnimations();

