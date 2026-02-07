// Student Dashboard JavaScript
class StudentDashboard {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'menu';
        this.currentMealType = 'BREAKFAST';
        this.selectedMenuItems = [];
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.setupTabs();
        this.loadInitialData();
    }

    loadUserData() {
        const userData = localStorage.getItem('loggedInUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUserInterface();
        } else {
            // Redirect to login if no user data
            window.location.href = 'login.html';
        }
    }

    updateUserInterface() {
        const userWelcome = document.getElementById('userWelcome');
        const userInfo = document.getElementById('userInfo');
        
        if (userWelcome) {
            userWelcome.textContent = `Welcome, ${this.currentUser.name}!`;
        }
        
        if (userInfo) {
            userInfo.textContent = `Student | ${this.currentUser.email}`;
        }

        // Hide admin-only sections for students
        document.querySelectorAll('.admin-only').forEach(element => {
            element.style.display = 'none';
        });
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Meal type buttons
        document.querySelectorAll('.meal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.meal-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentMealType = e.target.dataset.meal;
                this.loadMenuItems();
            });
        });

        // Action buttons
        const newOrderBtn = document.getElementById('newOrderBtn');
        if (newOrderBtn) {
            newOrderBtn.addEventListener('click', () => this.showOrderModal());
        }

        const rechargeBtn = document.getElementById('rechargeBtn');
        if (rechargeBtn) {
            rechargeBtn.addEventListener('click', () => this.showRechargeModal());
        }

        const createPassBtn = document.getElementById('createPassBtn');
        if (createPassBtn) {
            createPassBtn.addEventListener('click', () => this.createMessPass());
        }

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Order form
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => this.submitOrder(e));
        }

        // Recharge form
        const rechargeForm = document.getElementById('rechargeForm');
        if (rechargeForm) {
            rechargeForm.addEventListener('submit', (e) => this.submitRecharge(e));
        }

        // Quick amount buttons
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                document.getElementById('rechargeAmount').value = e.target.dataset.amount;
            });
        });

        // Order meal type change
        const orderMealType = document.getElementById('orderMealType');
        if (orderMealType) {
            orderMealType.addEventListener('change', () => this.loadOrderMenuItems());
        }
    }

    setupTabs() {
        document.querySelectorAll('.nav-item:not(.admin-only)').forEach(navItem => {
            navItem.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                if (tabName && !e.target.classList.contains('admin-only')) {
                    this.switchTab(tabName);
                }
            });
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const targetNav = document.querySelector(`[data-tab="${tabName}"]`);
        if (targetNav) {
            targetNav.classList.add('active');
        }

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        const targetContent = document.getElementById(`${tabName}-tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        this.currentTab = tabName;
        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch(tabName) {
            case 'menu':
                this.loadMenuItems();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'messpass':
                this.loadMessPass();
                break;
            case 'payments':
                this.loadPayments();
                break;
        }
    }

    loadInitialData() {
        this.loadMenuItems();
    }

    async loadMenuItems() {
        const menuItems = document.getElementById('menuItems');
        if (!menuItems) return;
        
        menuItems.innerHTML = '<div class="loading">Loading menu items</div>';

        try {
            const response = await fetch(`http://localhost:8080/api/menu/items/meal-type/${this.currentMealType}`);
            const result = await response.json();

            if (response.ok && result.success) {
                this.displayMenuItems(result.data);
            } else {
                menuItems.innerHTML = '<p>No menu items available for this meal type.</p>';
            }
        } catch (error) {
            console.error('Error loading menu items:', error);
            menuItems.innerHTML = '<p>Error loading menu items. Please check if the server is running.</p>';
        }
    }

    displayMenuItems(items) {
        const menuItems = document.getElementById('menuItems');
        
        if (items.length === 0) {
            menuItems.innerHTML = '<p>No menu items available for this meal type.</p>';
            return;
        }

        menuItems.innerHTML = items.map(item => `
            <div class="menu-item">
                <h3>${item.name}</h3>
                <p>${item.description || 'No description available'}</p>
                <div class="menu-item-footer">
                    <span class="price">₹${item.price}</span>
                    <div>
                        <span class="category-badge">${item.category}</span>
                        <span class="category-badge ${item.isVegetarian ? 'veg-badge' : 'non-veg-badge'}">
                            ${item.isVegetarian ? '🥬 VEG' : '🍖 NON-VEG'}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadOrders() {
        const ordersList = document.getElementById('ordersList');
        if (!ordersList) return;
        
        ordersList.innerHTML = '<div class="loading">Loading orders</div>';

        try {
            const response = await fetch(`http://localhost:8080/api/orders/user/${this.currentUser.email}`);
            const result = await response.json();

            if (response.ok && result.success) {
                this.displayOrders(result.data);
            } else {
                ordersList.innerHTML = '<p>No orders found.</p>';
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            ordersList.innerHTML = '<p>Error loading orders. Please check if the server is running.</p>';
        }
    }

    displayOrders(orders) {
        const ordersList = document.getElementById('ordersList');
        
        if (orders.length === 0) {
            ordersList.innerHTML = '<p>No orders found. Place your first order!</p>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                </div>
                <p><strong>Meal Type:</strong> ${order.mealType}</p>
                <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
                <p><strong>Items:</strong> ${order.menuItems ? order.menuItems.map(item => item.name).join(', ') : 'N/A'}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                ${order.specialInstructions ? `<p><strong>Instructions:</strong> ${order.specialInstructions}</p>` : ''}
            </div>
        `).join('');
    }

    async loadMessPass() {
        const messpassInfo = document.getElementById('messpassInfo');
        const createPassBtn = document.getElementById('createPassBtn');
        const rechargeBtn = document.getElementById('rechargeBtn');
        
        if (!messpassInfo) return;
        
        messpassInfo.innerHTML = '<div class="loading">Loading mess pass information</div>';

        try {
            const response = await fetch(`http://localhost:8080/api/mess-pass/user/${this.currentUser.email}`);
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.displayMessPass(result.data);
                    if (createPassBtn) createPassBtn.style.display = 'none';
                    if (rechargeBtn) rechargeBtn.style.display = 'inline-block';
                } else {
                    this.displayNoMessPass();
                    if (createPassBtn) createPassBtn.style.display = 'inline-block';
                    if (rechargeBtn) rechargeBtn.style.display = 'none';
                }
            } else {
                this.displayNoMessPass();
                if (createPassBtn) createPassBtn.style.display = 'inline-block';
                if (rechargeBtn) rechargeBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading mess pass:', error);
            messpassInfo.innerHTML = '<p>Error loading mess pass information.</p>';
        }
    }

    displayMessPass(messPass) {
        const messpassInfo = document.getElementById('messpassInfo');
        messpassInfo.innerHTML = `
            <div class="messpass-card">
                <div class="pass-number">Pass #${messPass.passNumber}</div>
                <div class="pass-balance">₹${messPass.balance}</div>
                <div class="pass-validity">
                    Valid from ${new Date(messPass.validFrom).toLocaleDateString()} 
                    to ${new Date(messPass.validUntil).toLocaleDateString()}
                </div>
                <div class="pass-validity">Type: ${messPass.passType}</div>
            </div>
        `;
    }

    displayNoMessPass() {
        const messpassInfo = document.getElementById('messpassInfo');
        messpassInfo.innerHTML = `
            <div class="messpass-card">
                <h3>No Mess Pass Found</h3>
                <p>You don't have an active mess pass. Create one to start using mess services.</p>
            </div>
        `;
    }

    async loadPayments() {
        const paymentsList = document.getElementById('paymentsList');
        if (!paymentsList) return;
        
        paymentsList.innerHTML = '<div class="loading">Loading payment history</div>';

        try {
            const response = await fetch(`http://localhost:8080/api/payments/user/${this.currentUser.email}`);
            const result = await response.json();

            if (response.ok && result.success) {
                this.displayPayments(result.data);
            } else {
                paymentsList.innerHTML = '<p>No payment history found.</p>';
            }
        } catch (error) {
            console.error('Error loading payments:', error);
            paymentsList.innerHTML = '<p>Error loading payment history.</p>';
        }
    }

    displayPayments(payments) {
        const paymentsList = document.getElementById('paymentsList');
        
        if (payments.length === 0) {
            paymentsList.innerHTML = '<p>No payment history found.</p>';
            return;
        }

        paymentsList.innerHTML = payments.map(payment => `
            <div class="payment-card">
                <div class="payment-header">
                    <span class="payment-id">Transaction #${payment.transactionId}</span>
                    <span class="status-badge status-${payment.status.toLowerCase()}">${payment.status}</span>
                </div>
                <p><strong>Amount:</strong> ₹${payment.amount}</p>
                <p><strong>Type:</strong> ${payment.paymentType.replace('_', ' ')}</p>
                <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</p>
                ${payment.description ? `<p><strong>Description:</strong> ${payment.description}</p>` : ''}
            </div>
        `).join('');
    }

    showOrderModal() {
        const modal = document.getElementById('orderModal');
        if (modal) {
            modal.style.display = 'block';
            this.loadOrderMenuItems();
        }
    }

    async loadOrderMenuItems() {
        const orderMealType = document.getElementById('orderMealType');
        const orderMenuItems = document.getElementById('orderMenuItems');
        
        if (!orderMealType || !orderMenuItems) return;
        
        const mealType = orderMealType.value;
        
        try {
            const response = await fetch(`http://localhost:8080/api/menu/items/meal-type/${mealType}`);
            const result = await response.json();

            if (response.ok && result.success) {
                orderMenuItems.innerHTML = result.data.map(item => `
                    <div class="menu-selection-item">
                        <input type="checkbox" id="item-${item.id}" value="${item.id}" data-price="${item.price}">
                        <label for="item-${item.id}">
                            <strong>${item.name}</strong> - ₹${item.price}
                            <br><small>${item.description || ''}</small>
                        </label>
                    </div>
                `).join('');

                // Add event listeners for price calculation
                orderMenuItems.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', () => this.updateOrderTotal());
                });
            }
        } catch (error) {
            console.error('Error loading order menu items:', error);
        }
    }

    updateOrderTotal() {
        const checkboxes = document.querySelectorAll('#orderMenuItems input[type="checkbox"]:checked');
        let total = 0;
        
        checkboxes.forEach(checkbox => {
            total += parseFloat(checkbox.dataset.price);
        });
        
        const orderTotal = document.getElementById('orderTotal');
        if (orderTotal) {
            orderTotal.textContent = total.toFixed(2);
        }
    }

    async submitOrder(e) {
        e.preventDefault();
        
        const selectedItems = Array.from(document.querySelectorAll('#orderMenuItems input[type="checkbox"]:checked'))
            .map(checkbox => ({ id: parseInt(checkbox.value) }));
        
        if (selectedItems.length === 0) {
            alert('Please select at least one menu item.');
            return;
        }

        const orderData = {
            user: { id: this.currentUser.id },
            menuItems: selectedItems,
            mealType: document.getElementById('orderMealType').value,
            specialInstructions: document.getElementById('orderInstructions').value
        };

        try {
            const response = await fetch('http://localhost:8080/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('✅ Order placed successfully!');
                document.getElementById('orderModal').style.display = 'none';
                this.loadOrders();
            } else {
                alert('❌ Failed to place order: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('❌ Network error. Please try again.');
        }
    }

    showRechargeModal() {
        const modal = document.getElementById('rechargeModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    async submitRecharge(e) {
        e.preventDefault();
        
        const amount = document.getElementById('rechargeAmount').value;
        
        if (!amount || amount < 10) {
            alert('Please enter a valid amount (minimum ₹10).');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/payments/recharge?userEmail=${this.currentUser.email}&amount=${amount}`, {
                method: 'POST'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('✅ Recharge successful!');
                document.getElementById('rechargeModal').style.display = 'none';
                this.loadMessPass();
                this.loadPayments();
            } else {
                alert('❌ Recharge failed: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error processing recharge:', error);
            alert('❌ Network error. Please try again.');
        }
    }

    async createMessPass() {
        try {
            const today = new Date();
            const validUntil = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()); // 1 month validity
            
            const response = await fetch(`http://localhost:8080/api/mess-pass/create?userEmail=${this.currentUser.email}&passType=MONTHLY&validFrom=${today.toISOString().split('T')[0]}&validUntil=${validUntil.toISOString().split('T')[0]}`, {
                method: 'POST'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('✅ Mess pass created successfully!');
                this.loadMessPass();
            } else {
                alert('❌ Failed to create mess pass: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating mess pass:', error);
            alert('❌ Network error. Please try again.');
        }
    }

    logout() {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudentDashboard();
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});
