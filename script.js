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
        
        // Handle form submission
        mailchimpForm.addEventListener('submit', function(e) {
            try {
                const email = emailInput.value.trim();
                
                if (!email || !isValidEmail(email)) {
                    e.preventDefault();
                    showPopup('Error', 'Please enter a valid email address.', '⚠', false);
                    emailInput.focus();
                    return false;
                }
                
                // Show loading state
                showLoading();
            } catch (error) {
                e.preventDefault();
                hideLoading();
                console.error('Form submission error:', error);
                showPopup('Error', 'An error occurred while submitting the form. Please try again later.', '⚠', false);
                return false;
            }
        });
        
        // Monitor for Mailchimp responses (after form submission)
        let popupShown = false;
        const checkMailchimpResponse = () => {
            try {
                // If popup already shown, don't check again
                if (popupShown) {
                    return;
                }
                
                const errorResponse = document.getElementById('mce-error-response');
                const successResponse = document.getElementById('mce-success-response');
                
                if (errorResponse && errorResponse.textContent.trim()) {
                    const errorText = errorResponse.textContent.trim();
                    if (errorText && !errorText.includes('style')) {
                        popupShown = true;
                        hideLoading();
                        showPopup('Error', errorText, '⚠', false);
                        emailInput.focus();
                        return;
                    }
                }
                
                if (successResponse && successResponse.textContent.trim()) {
                    const successText = successResponse.textContent.trim();
                    if (successText && !successText.includes('style')) {
                        popupShown = true;
                        hideLoading();
                        showPopup('Success!', 'Thank you for subscribing! We\'ll keep you updated.', '✓', true);
                        emailInput.value = '';
                        return;
                    }
                }
            } catch (error) {
                console.error('Error checking Mailchimp response:', error);
                if (!popupShown) {
                    popupShown = true;
                    hideLoading();
                    showPopup('Error', 'An error occurred while processing your subscription. Please try again later.', '⚠', false);
                }
            }
        };
        
        // Check for responses periodically after form submission
        let responseCheckInterval;
        mailchimpForm.addEventListener('submit', function() {
            try {
                // Reset popup flag for new submission
                popupShown = false;
                
                // Clear any existing Mailchimp responses from previous submissions
                const errorResponse = document.getElementById('mce-error-response');
                const successResponse = document.getElementById('mce-success-response');
                if (errorResponse) {
                    errorResponse.textContent = '';
                    errorResponse.style.display = 'none';
                }
                if (successResponse) {
                    successResponse.textContent = '';
                    successResponse.style.display = 'none';
                }
                
                // Clear any existing interval
                if (responseCheckInterval) {
                    clearInterval(responseCheckInterval);
                }
                
                // Start checking for responses
                responseCheckInterval = setInterval(() => {
                    try {
                        checkMailchimpResponse();
                        
                        // Stop checking once popup is shown
                        if (popupShown && responseCheckInterval) {
                            clearInterval(responseCheckInterval);
                        }
                    } catch (error) {
                        console.error('Error in response check interval:', error);
                        if (responseCheckInterval) {
                            clearInterval(responseCheckInterval);
                        }
                        if (!popupShown) {
                            popupShown = true;
                            hideLoading();
                            showPopup('Error', 'An error occurred while processing your subscription. Please try again later.', '⚠', false);
                        }
                    }
                }, 500);
                
                // Stop checking after 10 seconds and hide loading
                setTimeout(() => {
                    try {
                        if (responseCheckInterval) {
                            clearInterval(responseCheckInterval);
                        }
                        if (!popupShown) {
                            hideLoading();
                            showPopup('Error', 'The request is taking longer than expected. Please check your connection and try again.', '⚠', false);
                        }
                    } catch (error) {
                        console.error('Error in timeout handler:', error);
                        hideLoading();
                    }
                }, 10000);
            } catch (error) {
                console.error('Error setting up response monitoring:', error);
                hideLoading();
                showPopup('Error', 'An error occurred while setting up the subscription. Please try again later.', '⚠', false);
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

