const apiUrl = 'http://localhost:3000/api';
let currentUserId = null; // To store the logged-in user's ID

// Helper function to format currency as Rupees
function formatRupees(amount) {
    return '<span class="rupee">₹</span><span class="amount">' + 
        parseFloat(amount).toLocaleString('en-IN') + '</span>';
}

// Helper function to format due amounts in red
function formatTaxDue(amount) {
    const amountValue = parseFloat(amount);
    if (amountValue > 0) {
        return '<span class="rupee">₹</span><span class="amount-due">' + 
            amountValue.toLocaleString('en-IN') + '</span>';
    } else {
        return '<span class="rupee">₹</span><span class="amount">' + 
            amountValue.toLocaleString('en-IN') + '</span>';
    }
}

// Helper function to format status with appropriate CSS class
function formatStatus(status) {
    return `<span class="status-${status}">${status.replace('_', ' ')}</span>`;
}

// Calculate the correct tax due amount (total tax - tax paid)
function calculateTaxDue(totalTax, taxPaid) {
    const total = parseFloat(totalTax);
    const paid = parseFloat(taxPaid);
    return Math.max(0, total - paid).toFixed(2);
}

// Helper function to get the correct status based on tax due
function calculateStatus(taxPaid, totalTax) {
    const paid = parseFloat(taxPaid);
    const total = parseFloat(totalTax);
    const due = Math.max(0, total - paid);
    
    // If paid amount is equal to or greater than the total tax (allowing for small precision errors)
    if (due <= 0.01) {
        return 'paid';
    } else if (paid > 0) {
        return 'partially_paid';
    } else {
        return 'pending';
    }
}

async function register() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;

    try {
        const response = await fetch(`${apiUrl}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();
        
        if (response.ok || data.success) {
            alert('Registration successful! Please login.');
            // Clear the form
            document.getElementById('reg-name').value = '';
            document.getElementById('reg-email').value = '';
            document.getElementById('reg-password').value = '';
        } else {
            alert(`Registration failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration.');
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${apiUrl}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok || data.success) {
            alert('Login successful!');
            currentUserId = data.data.id; // Store the user ID
            
            // Hide login and register sections
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('register-section').style.display = 'none';
            
            // Show tax sections based on role
            if (data.data.role === 'taxpayer') {
                document.getElementById('tax-record-section').style.display = 'block';
                document.getElementById('payment-section').style.display = 'block';
                document.getElementById('tax-records').style.display = 'block';
                document.getElementById('payment-history').style.display = 'block';
                
                // Fetch tax records and payment history
                fetchTaxRecords();
                fetchPaymentHistory();
            }
            // Add admin-specific UI logic here if needed
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login.');
    }
}

async function addTaxRecord() {
    const income = document.getElementById('income').value;
    
    // We'll use the new tax calculation API
    try {
        // First calculate tax
        const calcResponse = await fetch(`${apiUrl}/tax-profiles/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                income: parseFloat(income)
            })
        });
        
        const calcData = await calcResponse.json();
        
        if (!calcResponse.ok && !calcData.success) {
            alert(`Failed to calculate tax: ${calcData.message}`);
            return;
        }
        
        // Now create the tax profile
        const response = await fetch(`${apiUrl}/tax-profiles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                userId: currentUserId, 
                income: parseFloat(income),
                fiscalYear: '2023-2024'
            })
        });

        const data = await response.json();
        
        if (response.ok || data.success) {
            alert('Tax record added successfully!');
            // Clear the form
            document.getElementById('income').value = '';
            
            // Refresh tax records
            fetchTaxRecords();
        } else {
            alert(`Failed to add tax record: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the tax record.');
    }
}

async function makePayment() {
    const amount = document.getElementById('payment-amount').value;

    try {
        // First get the current tax profile
        const profileResponse = await fetch(`${apiUrl}/tax-profiles/user/${currentUserId}/current`);
        const profileData = await profileResponse.json();
        
        if (!profileResponse.ok && !profileData.success) {
            alert('You need to add a tax record before making a payment.');
            return;
        }
        
        const taxProfileId = profileData.data.id;
        
        // Now make the payment
        const response = await fetch(`${apiUrl}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                userId: currentUserId, 
                taxProfileId,
                amount: parseFloat(amount),
                paymentMethod: 'online_payment'
            })
        });

        const data = await response.json();
        
        if (response.ok || data.success) {
            alert('Payment successful!');
            // Clear the form
            document.getElementById('payment-amount').value = '';
            
            // Refresh tax records and payment history
            fetchTaxRecords();
            fetchPaymentHistory();
        } else {
            alert(`Payment failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing the payment.');
    }
}

async function fetchTaxRecords() {
    try {
        const response = await fetch(`${apiUrl}/tax-profiles/user/${currentUserId}`);
        const data = await response.json();
        
        if (response.ok || data.success) {
            const recordsList = document.getElementById('records-list');
            recordsList.innerHTML = '';
            
            if (!data.data || data.data.length === 0) {
                recordsList.innerHTML = '<li>No tax records found.</li>';
                return;
            }
            
            data.data.forEach(record => {
                // Get the original calculated tax (important: we're not adding tax_paid to the total)
                const totalTax = parseFloat(record.tax_due) + parseFloat(record.tax_paid);
                
                // Recalculate tax due as total tax minus tax paid
                const taxDue = calculateTaxDue(record.tax_due, record.tax_paid);
                
                // Calculate the correct status based on the recalculated tax due
                const actualStatus = calculateStatus(record.tax_paid, record.tax_due);
                
                const li = document.createElement('li');
                li.innerHTML = `
                    <div><strong>Fiscal Year:</strong> ${record.fiscal_year}</div>
                    <div><strong>Income:</strong> ${formatRupees(record.income)}</div>
                    <div><strong>Tax Paid:</strong> ${formatRupees(record.tax_paid)}</div>
                    <div><strong>Total Tax:</strong> ${formatRupees(record.tax_due)}</div>
                    <div><strong>Tax Due:</strong> ${formatTaxDue(taxDue)}</div>
                    <div><strong>Status:</strong> ${formatStatus(actualStatus)}</div>
                `;
                recordsList.appendChild(li);
            });
        } else {
            console.error('Failed to fetch tax records');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchPaymentHistory() {
    try {
        const response = await fetch(`${apiUrl}/payments/user/${currentUserId}`);
        const data = await response.json();
        
        if (response.ok || data.success) {
            const paymentsList = document.getElementById('payments-list');
            paymentsList.innerHTML = '';
            
            if (!data.data || data.data.length === 0) {
                paymentsList.innerHTML = '<li>No payment history found.</li>';
                return;
            }
            
            data.data.forEach(payment => {
                const date = new Date(payment.payment_date).toLocaleDateString();
                const li = document.createElement('li');
                li.innerHTML = `
                    <div><strong>Amount:</strong> ${formatRupees(payment.amount)}</div>
                    <div><strong>Date:</strong> ${date}</div>
                    <div><strong>Method:</strong> ${payment.payment_method.replace('_', ' ')}</div>
                    <div><strong>Status:</strong> ${formatStatus(payment.status)}</div>
                `;
                paymentsList.appendChild(li);
            });
        } else {
            console.error('Failed to fetch payment history');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}