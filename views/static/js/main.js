// Main JavaScript file for all pages

// Navigation toggle for mobile
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Dropdown menus
document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('active');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    }
});

// Notification system
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    notification.innerHTML = `
        <i class="bi bi-${type === 'success' ? 'check-circle' : 
                         type === 'error' ? 'x-circle' : 
                         type === 'warning' ? 'exclamation-circle' : 
                         'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">
            <i class="bi bi-x"></i>
        </button>
    `;

    container.appendChild(notification);

    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Form validation
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            
            // Show error message
            let errorMessage = input.getAttribute('data-error') || 'This field is required';
            let errorDiv = input.nextElementSibling;
            
            if (!errorDiv || !errorDiv.classList.contains('error-message')) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                input.parentNode.insertBefore(errorDiv, input.nextSibling);
            }
            
            errorDiv.textContent = errorMessage;
        } else {
            input.classList.remove('error');
            const errorDiv = input.nextElementSibling;
            if (errorDiv && errorDiv.classList.contains('error-message')) {
                errorDiv.remove();
            }
        }
    });

    return isValid;
}

// Image lazy loading
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Dark mode toggle
const darkModeToggle = document.querySelector('.dark-mode-toggle');
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        // Update toggle icon
        const icon = darkModeToggle.querySelector('i');
        icon.className = `bi bi-${isDarkMode ? 'sun' : 'moon'}`;
    });

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const icon = darkModeToggle.querySelector('i');
        if (icon) icon.className = 'bi bi-sun';
    }
}

// Handle file uploads with preview
document.querySelectorAll('.file-upload').forEach(upload => {
    const input = upload.querySelector('input[type="file"]');
    const preview = upload.querySelector('.file-preview');
    
    if (input && preview) {
        input.addEventListener('change', () => {
            preview.innerHTML = '';
            
            if (input.files && input.files[0]) {
                const file = input.files[0];
                
                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(file);
                    preview.appendChild(img);
                } else {
                    const icon = document.createElement('i');
                    icon.className = 'bi bi-file-earmark';
                    const name = document.createElement('span');
                    name.textContent = file.name;
                    preview.appendChild(icon);
                    preview.appendChild(name);
                }
            }
        });
    }
});

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle search inputs
document.querySelectorAll('.search-input').forEach(input => {
    input.addEventListener('input', debounce((e) => {
        const query = e.target.value.trim();
        // Implement search logic here
        console.log('Searching for:', query);
    }, 300));
});

// Initialize tooltips
document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = element.getAttribute('data-tooltip');
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
        tooltip.style.left = rect.left + (rect.width - tooltip.offsetWidth) / 2 + 'px';
        
        element.addEventListener('mouseleave', () => tooltip.remove());
    });
});