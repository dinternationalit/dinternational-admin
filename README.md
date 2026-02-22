# D-international Admin Panel

Complete admin dashboard for managing D-international furniture store with multi-currency support.

## 🎯 Features

### 📦 **Product Management**
- Add/Edit/Delete products
- Set base prices in USD
- Configure exchange rates per product
- Manage stock status
- Mark products as featured
- Category assignment

### 🏷️ **Category Management**
- Create product categories
- Add icons (emojis)
- Edit/Delete categories
- Organize product catalog

### 💱 **Multi-Currency Settings**
- Set global exchange rates
- Support 10 currencies
- Update rates anytime
- Automatic price conversion

### 📊 **Dashboard**
- Total products count
- Category statistics
- Stock status overview
- Quick actions

## 🚀 Installation

```bash
cd dinternational-admin

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start admin panel
PORT=3001 npm start
```

Admin panel runs at: http://localhost:3001

## 🔐 Login Credentials

After seeding backend database:
- Username: `admin`
- Password: `admin123`

⚠️ Change in production!

## 📁 Project Structure

```
dinternational-admin/
├── src/
│   ├── App.js           # Main admin app
│   │   ├── LoginPage    # Admin login
│   │   ├── Dashboard    # Overview stats
│   │   ├── ProductsView # Product management
│   │   ├── ProductForm  # Add/Edit product
│   │   ├── CategoriesView # Category management
│   │   ├── CategoryForm # Add/Edit category
│   │   └── SettingsView # Exchange rates
│   ├── index.js         # Entry point
│   └── index.css        # Styles
└── public/
    ├── logo.png         # D-international logo
    └── index.html
```

## 🛠️ Admin Features

### Product Management

**Add Product:**
1. Click "Add Product"
2. Enter product details:
   - Name
   - Description
   - Category
   - Base price (USD)
   - Exchange rates for each currency
3. Set stock status
4. Mark as featured (optional)
5. Save

**Edit Product:**
- Click "Edit" on any product
- Modify details
- Update rates
- Save changes

**Delete Product:**
- Click "Delete" on product
- Confirm deletion

### Category Management

**Add Category:**
1. Click "Add Category"
2. Enter:
   - Category name
   - Icon (emoji)
   - Description
3. Save

**Edit/Delete:**
- Similar to products

### Exchange Rate Settings

**Update Rates:**
1. Go to Settings
2. Enter new exchange rates for each currency
3. Click "Save Rates"
4. Rates apply to all products globally

**Supported Currencies:**
- USD (US Dollar) - Base currency
- GBP (British Pound)
- EUR (Euro)
- INR (Indian Rupee)
- AED (UAE Dirham)
- AUD (Australian Dollar)
- CAD (Canadian Dollar)
- JPY (Japanese Yen)
- CNY (Chinese Yuan)
- SAR (Saudi Riyal)

## 💰 Pricing System

### How It Works

1. **Base Price**: Enter product price in USD
2. **Exchange Rates**: Set rate for each currency
3. **Automatic Conversion**: Frontend calculates prices

**Example:**
```
Product: Office Desk
Base Price: $599 USD
INR Rate: 82.5
Final Price in India: ₹49,417
```

### Setting Product Rates

**Option 1: Per Product**
- Set custom rates for specific products
- Override global rates

**Option 2: Global Rates**
- Set rates in Settings
- Apply to all products

## 📊 Dashboard Metrics

- **Total Products**: Count of all products
- **Categories**: Number of categories
- **In Stock**: Available products
- **Out of Stock**: Unavailable products

## 🔧 API Integration

Admin panel connects to backend API:

```
POST   /api/auth/login           - Admin login
GET    /api/products              - Get products
POST   /api/products              - Create product
PUT    /api/products/:id          - Update product
DELETE /api/products/:id          - Delete product
GET    /api/categories            - Get categories
POST   /api/categories            - Create category
PUT    /api/categories/:id        - Update category
DELETE /api/categories/:id        - Delete category
POST   /api/settings/exchange-rates - Update rates
```

## 🎨 Customization

### Change Colors

Edit `src/App.js`:
```javascript
// Blue theme (current)
className="bg-blue-600"

// Change to your brand color
className="bg-purple-600"
```

### Add New Currency

1. Edit `COUNTRIES` array in Settings
2. Add currency code, name, symbol
3. Update rate input fields

## 🐛 Troubleshooting

### Cannot Login
- Check backend is running
- Verify credentials
- Check API_URL in .env

### Products Not Saving
- Check backend API
- Verify all required fields
- Check browser console

### Exchange Rates Not Working
- Ensure rates are positive numbers
- USD rate should be 1.0
- Check Settings page saved successfully

## 📱 Responsive Design

Admin panel works on:
- ✅ Desktop (recommended)
- ✅ Tablet
- ✅ Mobile (limited)

**Best Experience**: Desktop browsers (Chrome, Firefox, Safari)

## 🔒 Security

- JWT authentication
- Protected routes
- Role-based access (if using multi-user)
- Secure password handling

## 📈 Workflow

### Adding New Product

1. **Login** to admin panel
2. **Navigate** to Products
3. **Click** "Add Product"
4. **Fill** product details:
   ```
   Name: Executive Office Desk
   Category: office
   Description: Premium desk with storage
   Base Price: 599
   ```
5. **Set** exchange rates:
   ```
   USD: 1.0
   GBP: 0.79
   EUR: 0.92
   INR: 82.5
   ...
   ```
6. **Check** stock status
7. **Save** product
8. **View** on frontend website

### Updating Exchange Rates

1. **Go to** Settings
2. **Enter** new rates
3. **Click** "Save Rates"
4. **Rates apply** to all products

## 🎓 Tips

### Best Practices

- Keep USD rate at 1.0 (base currency)
- Update exchange rates regularly
- Use clear product names
- Add detailed descriptions
- Set appropriate stock status
- Use categories for organization

### Exchange Rate Sources

Get current rates from:
- https://www.xe.com
- https://www.exchangerate-api.com
- Your bank/payment processor

## 🚢 Deployment

```bash
# Build for production
npm run build

# Deploy build folder
```

Deploy to:
- Vercel
- Netlify
- AWS S3

## 📞 Support

- Email: admin@d-international.com
- Check backend logs for API errors
- Check browser console for frontend errors

## ✅ Feature Checklist

- [x] Admin authentication
- [x] Product CRUD operations
- [x] Category management
- [x] Multi-currency rate cards
- [x] Exchange rate settings
- [x] Dashboard statistics
- [x] Stock management
- [x] Featured products
- [x] Responsive design

## 🎉 Quick Start Guide

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Edit .env with your API URL

# 3. Run
PORT=3001 npm start

# 4. Login
Username: admin
Password: admin123

# 5. Start Managing!
```

---

**Built for D-international Store Management** 🛍️

**Version**: 1.0.0  
**Last Updated**: 2026
