// ===== Helper Function: Format as Naira =====
function formatNaira(amount) {
    return "₦" + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 });
}

// ===== Select DOM Elements =====
const productInput = document.getElementById('product');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const dateInput = document.getElementById('date');

const transactionsTableBody = document.querySelector('#transactions-table tbody');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const balanceEl = document.getElementById('balance');

const transactionForm = document.getElementById('transaction-form');

// Purchase Section Elements
const purchaseForm = document.getElementById('purchase-form');
const purchaseResult = document.getElementById('purchase-result');
const purchaseProductInput = document.getElementById('purchase-product');
const purchaseAmountInput = document.getElementById('purchase-amount');

// ===== Initialize Transactions =====
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// ===== Functions =====

// Render Transactions Table
function renderTransactions() {
    transactionsTableBody.innerHTML = '';
    transactions.forEach((tx, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${tx.product}</td>
            <td>${formatNaira(tx.amount)}</td>
            <td class="${tx.type}">${tx.type}</td>
            <td>${tx.date}</td>
            <td><button onclick="deleteTransaction(${index})" class="delete-btn">Delete</button></td>
        `;
        transactionsTableBody.appendChild(tr);
    });
    updateSummary();
}

// Update Summary Section
function updateSummary() {
    const income = transactions
        .filter(tx => tx.type === 'income')
        .reduce((acc, tx) => acc + Number(tx.amount), 0);

    const expense = transactions
        .filter(tx => tx.type === 'expense')
        .reduce((acc, tx) => acc + Number(tx.amount), 0);

    totalIncomeEl.textContent = formatNaira(income);
    totalExpenseEl.textContent = formatNaira(expense);
    balanceEl.textContent = formatNaira(income - expense);
}

// Add Transaction
transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const product = productInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeSelect.value;
    const date = dateInput.value;

    if (!product || !amount || !date) {
        alert("Please fill all fields");
        return;
    }

    const transaction = { product, amount, type, date };
    transactions.push(transaction);

    saveTransactions();
    renderTransactions();
    transactionForm.reset();
});

// Delete Transaction
function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveTransactions();
    renderTransactions();
}

// Save to Local Storage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ===== Purchase Section Logic =====
purchaseForm.addEventListener('submit', function(e){
    e.preventDefault();

    const product = purchaseProductInput.value.trim();
    const amount = Number(purchaseAmountInput.value);
    const today = new Date().toISOString().split('T')[0]; // auto-date

    if (!product || !amount) {
        alert("Please fill all fields");
        return;
    }

    // Calculate current balance
    const balance = transactions
        .filter(tx => tx.type === 'income')
        .reduce((acc, tx) => acc + Number(tx.amount), 0)
        -
        transactions
        .filter(tx => tx.type === 'expense')
        .reduce((acc, tx) => acc + Number(tx.amount), 0);

    if (amount <= balance) {
        // Purchase is successful
        purchaseResult.innerHTML = `
            <p style="color:green;">
                Purchase Successful!<br>
                Description: ${product}<br>
                Amount: ${formatNaira(amount)}<br>
                Date: ${today}
            </p>
        `;

        // Add purchase as expense transaction
        transactions.push({ product, amount, type: "expense", date: today });
        saveTransactions();
        renderTransactions();

    } else {
        // Insufficient balance
        purchaseResult.innerHTML = `<p style="color:red;">Insufficient balance to make this purchase.</p>`;
    }

    purchaseForm.reset();
});

// ===== Initialize =====
renderTransactions();
