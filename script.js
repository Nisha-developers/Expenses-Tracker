// Utility functions
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // State management
  let userCurrency = 'USD';
  let currentLocation = '';
  
  // Local Storage keys
  const KEYS = {
    INCOME: 'expense_tracker_income',
    EXPENSES: 'expense_tracker_expenses',
    CURRENCY: 'expense_tracker_currency',
    LOCATION: 'expense_tracker_location'
  };
  
  // Initialize data from localStorage
  let incomeData = JSON.parse(localStorage.getItem(KEYS.INCOME) || '[]');
  let expensesData = JSON.parse(localStorage.getItem(KEYS.EXPENSES) || '[]');
  
  // Fetch user's location and set currency
  async function initializeLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      currentLocation = data.city + ', ' + data.country_name;
      userCurrency = data.currency;
      localStorage.setItem(KEYS.CURRENCY, userCurrency);
      localStorage.setItem(KEYS.LOCATION, currentLocation);
      updateAllDisplays();
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  }
  
  // Income Form Handling
  document.getElementById('incomeForm').addEventListener('click', function(e) {
    e.preventDefault();
    
    const occupation = document.getElementById('occupation').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const isWages = document.getElementById('wages').checked;
    
    if (!occupation || !amount || !date) {
      alert('Please fill all fields');
      return;
    }
    
    const incomeEntry = {
      id: Date.now(),
      occupation,
      amount,
      date,
      type: isWages ? 'wages' : 'salary'
    };
    
    incomeData.push(incomeEntry);
    localStorage.setItem(KEYS.INCOME, JSON.stringify(incomeData));
    
    updateIncomeDetails();
    updateIncomeSummary();
    updateNetBalance();
    resetIncomeForm();
  });
  
  // Expenses Form Handling
  document.getElementById('expensesForm').addEventListener('click', function(e) {
    e.preventDefault();
    
    const item = document.getElementById('item').value;
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseInt(document.getElementById('Quantity').value);
    const date = document.getElementById('exDate').value;
    
    if (!item || !price || !quantity || !date) {
      alert('Please fill all fields');
      return;
    }
    
    const expenseEntry = {
      id: Date.now(),
      item,
      price,
      quantity,
      total: price * quantity,
      date
    };
    
    expensesData.push(expenseEntry);
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expensesData));
    
    updateExpensesDetails();
    updateExpensesSummary();
    updateNetBalance();
    resetExpensesForm();
  });
  
  // Update Income Details with Edit and Delete
  function updateIncomeDetails() {
    const container = document.getElementById('income-details');
    container.innerHTML = `
      <h2>Income Details</h2>
      <div class="table-responsive">
        <table class="details-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Occupation</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${incomeData.map(income => `
              <tr>
                <td>${new Date(income.date).toLocaleDateString()}</td>
                <td>${income.occupation}</td>
                <td><span class="badge ${income.type}">${income.type}</span></td>
                <td class="amount">${formatCurrency(income.amount, userCurrency)}</td>
                <td class="actions">
                  <button onclick="editIncome(${income.id})" class="edit-btn">
                    <i class='bx bx-edit-alt'></i>
                  </button>
                  <button onclick="deleteIncome(${income.id})" class="delete-btn">
                    <i class='bx bx-trash'></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${incomeData.length === 0 ? '<div class="no-data">No income entries yet</div>' : ''}
    `;
  }
  
  // Update Expenses Details with Edit and Delete
  function updateExpensesDetails() {
    const container = document.getElementById('expenses-details');
    container.innerHTML = `
      <h2>Expenses Details</h2>
      <div class="table-responsive">
        <table class="details-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Item</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${expensesData.map(expense => `
              <tr>
                <td>${new Date(expense.date).toLocaleDateString()}</td>
                <td>${expense.item}</td>
                <td>${formatCurrency(expense.price, userCurrency)}</td>
                <td>${expense.quantity}</td>
                <td class="amount">${formatCurrency(expense.total, userCurrency)}</td>
                <td class="actions">
                  <button onclick="editExpense(${expense.id})" class="edit-btn">
                    <i class='bx bx-edit-alt'></i>
                  </button>
                  <button onclick="deleteExpense(${expense.id})" class="delete-btn">
                    <i class='bx bx-trash'></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${expensesData.length === 0 ? '<div class="no-data">No expense entries yet</div>' : ''}
    `;
  }
  
  // CRUD Operations
  function deleteIncome(id) {
    if (confirm('Are you sure you want to delete this income entry?')) {
      incomeData = incomeData.filter(income => income.id !== id);
      localStorage.setItem(KEYS.INCOME, JSON.stringify(incomeData));
      updateAllDisplays();
    }
  }
  
  function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense entry?')) {
      expensesData = expensesData.filter(expense => expense.id !== id);
      localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expensesData));
      updateAllDisplays();
    }
  }
  
  function editIncome(id) {
    const income = incomeData.find(inc => inc.id === id);
    if (income) {
      document.getElementById('occupation').value = income.occupation;
      document.getElementById('amount').value = income.amount;
      document.getElementById('date').value = income.date;
      document.getElementById(income.type).checked = true;
      
      // Remove old entry
      deleteIncome(id);
      // User will submit new entry through the form
    }
  }
  
  function editExpense(id) {
    const expense = expensesData.find(exp => exp.id === id);
    if (expense) {
      document.getElementById('item').value = expense.item;
      document.getElementById('price').value = expense.price;
      document.getElementById('Quantity').value = expense.quantity;
      document.getElementById('exDate').value = expense.date;
      
      // Remove old entry
      deleteExpense(id);
      // User will submit new entry through the form
    }
  }
  
  // Summary Calculations
  function updateIncomeSummary() {
    const now = new Date();
    const totalIncome = incomeData.reduce((sum, income) => sum + income.amount, 0);
    
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome, userCurrency);
    
    // Calculate periodic incomes
    const yearlyIncome = incomeData
      .filter(income => new Date(income.date).getFullYear() === now.getFullYear())
      .reduce((sum, income) => sum + income.amount, 0);
      
    const monthlyIncome = incomeData
      .filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === now.getMonth() && 
               incomeDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, income) => sum + income.amount, 0);
      
    // Update display
    document.getElementById('yearly-income').textContent = formatCurrency(yearlyIncome, userCurrency);
    document.getElementById('monthly-income').textContent = formatCurrency(monthlyIncome, userCurrency);
    
    // Only calculate weekly/daily for wages
    if (incomeData.some(income => income.type === 'wages')) {
      const weeklyIncome = monthlyIncome / 4;
      const dailyIncome = weeklyIncome / 7;
      
      document.getElementById('weekly-income').textContent = formatCurrency(weeklyIncome, userCurrency);
      document.getElementById('daily-income').textContent = formatCurrency(dailyIncome, userCurrency);
    } else {
      document.getElementById('weekly-income').textContent = 'N/A';
      document.getElementById('daily-income').textContent = 'N/A';
    }
  }
  
  function updateExpensesSummary() {
    const now = new Date();
    const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.total, 0);
    
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses, userCurrency);
    
    // Calculate periodic expenses
    const yearlyExpenses = expensesData
      .filter(expense => new Date(expense.date).getFullYear() === now.getFullYear())
      .reduce((sum, expense) => sum + expense.total, 0);
      
    const monthlyExpenses = expensesData
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, expense) => sum + expense.total, 0);
      
    const weeklyExpenses = monthlyExpenses / 4;
    const dailyExpenses = weeklyExpenses / 7;
    
    // Update display
    document.getElementById('yearlyExpenses').textContent = formatCurrency(yearlyExpenses, userCurrency);
    document.getElementById('monthlyExpenses').textContent = formatCurrency(monthlyExpenses, userCurrency);
    document.getElementById('weeklyExpenses').textContent = formatCurrency(weeklyExpenses, userCurrency);
    document.getElementById('dailyExpenses').textContent = formatCurrency(dailyExpenses, userCurrency);
  }
  
  function updateNetBalance() {
    const totalIncome = incomeData.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.total, 0);
    const balance = totalIncome - totalExpenses;
    
    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = formatCurrency(balance, userCurrency);
    balanceElement.className = balance >= 0 ? 'positive' : 'negative';
  }
  
  // Utility functions
  function resetIncomeForm() {
    document.getElementById('occupation').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = '';
    document.getElementById('wages').checked = false;
    document.getElementById('salary').checked = false;
  }
  
  function resetExpensesForm() {
    document.getElementById('item').value = '';
    document.getElementById('price').value = '';
    document.getElementById('Quantity').value = '';
    document.getElementById('exDate').value = '';
  }
  
  function updateAllDisplays() {
    updateIncomeDetails();
    updateIncomeSummary();
    updateExpensesDetails();
    updateExpensesSummary();
    updateNetBalance();
  }
  
  // Scroll to top button
  document.getElementById('circleDesign').addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // Initialize the application
  document.addEventListener('DOMContentLoaded', function() {
    initializeLocation();
    updateAllDisplays();
  });
