// script.js (Updated with Password Validation)
function showForm(type) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginBtn = document.querySelector('.toggle-btn[onclick="showForm(\'login\')"]');
    const regBtn = document.querySelector('.toggle-btn[onclick="showForm(\'register\')"]');

    if (type === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginBtn.classList.add('active');
        regBtn.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        loginBtn.classList.remove('active');
        regBtn.classList.add('active');
    }
}

function showMessage(msg, type) {
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    
    if (type === 'error') {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
        successMsg.style.display = 'none';
    } else {
        successMsg.textContent = msg;
        successMsg.style.display = 'block';
        errorMsg.style.display = 'none';
    }
    
    setTimeout(() => {
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';
    }, 5000);
}

async function callAPI(url, data) {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Something went wrong!');
        }
        
        return result;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Password Strength Validation
function validatePassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const minLength = password.length >= 8;
    
    return {
        valid: hasUpperCase && hasNumber && hasSymbol && minLength,
        hasUpperCase,
        hasNumber,
        hasSymbol,
        minLength
    };
}

// Login Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    const text = document.getElementById('loginText');
    const spinner = document.getElementById('loginSpinner');

    if (!email || !password) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    btn.disabled = true;
    btn.classList.add('loading');
    text.style.display = 'none';
    spinner.style.display = 'inline';

    try {
        const result = await callAPI('http://localhost:3000/api/login', {
            email,
            password
        });

        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        showMessage('Welcome back! Redirecting to dashboard...', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
        text.style.display = 'inline';
        spinner.style.display = 'none';
    }
});

// Register Handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const btn = document.getElementById('regBtn');
    const text = document.getElementById('regText');
    const spinner = document.getElementById('regSpinner');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        let errors = [];
        if (!passwordValidation.hasUpperCase) errors.push('Uppercase letter');
        if (!passwordValidation.hasNumber) errors.push('Number');
        if (!passwordValidation.hasSymbol) errors.push('Symbol');
        if (!passwordValidation.minLength) errors.push('Minimum 8 characters');
        showMessage(`Password needs: ${errors.join(', ')}`, 'error');
        return;
    }

    btn.disabled = true;
    btn.classList.add('loading');
    text.style.display = 'none';
    spinner.style.display = 'inline';

    try {
        const result = await callAPI('http://localhost:5000/api/createUser', {
            name,
            email,
            password
        });

        showMessage(`Welcome ${name}! Account created successfully.`, 'success');
        
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);

    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
        text.style.display = 'inline';
        spinner.style.display = 'none';
    }
});

// Check if already logged in
if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
}

// Real-time password validation
document.getElementById('regPassword').addEventListener('input', function() {
    const password = this.value;
    const validation = validatePassword(password);
    const req = document.querySelector('.password-requirements');
    
    if (validation.valid && password.length > 0) {
        req.style.color = '#22c55e';
        req.innerHTML = '✅ Password meets all requirements';
    } else {
        req.style.color = '#f59e0b';
        req.innerHTML = '• 1 Uppercase • 1 Number • 1 Symbol • Min 8 chars';
    }
});


// Forgot Password Functions
function openForgotModal() {
    document.getElementById('forgotModal').style.display = 'flex';
    document.getElementById('forgotEmail').focus();
}

function closeForgotModal() {
    document.getElementById('forgotModal').style.display = 'none';
    document.getElementById('forgotForm').reset();
}

// Forgot Password Handler
document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim();
    const btn = document.getElementById('forgotBtn');
    const text = document.getElementById('forgotText');
    const spinner = document.getElementById('forgotSpinner');

    if (!email) {
        showMessage('Please enter your email address', 'error');
        return;
    }

    btn.disabled = true;
    btn.classList.add('loading');
    text.style.display = 'none';
    spinner.style.display = 'inline';

    try {
        const result = await callAPI('http://localhost:3000/api/auth/forgot-password', {
            email
        });

        showMessage(`Reset link sent to ${email}! Check your inbox.`, 'success');
        closeForgotModal();
        
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
        text.style.display = 'inline';
        spinner.style.display = 'none';
    }
});

// Update forgot-pass click handler
document.querySelector('.forgot-pass').onclick = openForgotModal;

// Close modal on outside click
document.getElementById('forgotModal').onclick = function(e) {
    if (e.target === this) closeForgotModal();
};
