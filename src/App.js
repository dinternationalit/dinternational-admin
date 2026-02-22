import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const noCacheConfig = () => ({
  params: { _t: Date.now() },
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache'
  }
});

// Auth Context
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('adminToken', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// Main App
export default function AdminApp() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <Dashboard />;
}

// Login Page
function LoginPage() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(credentials.username, credentials.password);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="D-international" className="h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Admin Panel</h2>
          <p className="text-gray-600 mt-2">D-international Store Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Default: admin / admin123</p>
        </div>
      </div>
    </div>
  );
}

// Dashboard
function Dashboard() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} user={user} logout={logout} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'products' && <ProductsView />}
          {currentView === 'categories' && <CategoriesView />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </div>
    </div>
  );
}

// Sidebar
function Sidebar({ currentView, setCurrentView, user, logout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <img src="/logo.png" alt="D-international" className="h-12 mb-4 brightness-0 invert" />
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Logged in as</p>
          <p className="font-medium">{user.username}</p>
          <p className="text-xs text-gray-400 capitalize">{user.role}</p>
        </div>
      </div>

      <nav className="flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full px-6 py-3 text-left flex items-center gap-3 transition-colors ${
              currentView === item.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={logout}
        className="px-6 py-4 text-left hover:bg-gray-800 transition-colors border-t border-gray-800 flex items-center gap-3"
      >
        <span className="text-xl">🚪</span>
        <span>Logout</span>
      </button>
    </div>
  );
}

// Dashboard View
function DashboardView() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    inStock: 0,
    outOfStock: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/categories`)
      ]);
      
      const products = productsRes.data.products || [];
      setStats({
        totalProducts: products.length,
        totalCategories: categoriesRes.data.categories?.length || 0,
        inStock: products.filter(p => p.inStock).length,
        outOfStock: products.filter(p => !p.inStock).length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><div className="spinner mx-auto"></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Products" value={stats.totalProducts} color="blue" icon="📦" />
        <StatCard title="Categories" value={stats.totalCategories} color="purple" icon="🏷️" />
        <StatCard title="In Stock" value={stats.inStock} color="green" icon="✅" />
        <StatCard title="Out of Stock" value={stats.outOfStock} color="red" icon="❌" />
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left">
            <div className="text-2xl mb-2">➕</div>
            <div className="font-semibold">Add Product</div>
            <div className="text-sm text-gray-600">Create new product</div>
          </button>
          <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left">
            <div className="text-2xl mb-2">🏷️</div>
            <div className="font-semibold">Add Category</div>
            <div className="text-sm text-gray-600">Create new category</div>
          </button>
          <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left">
            <div className="text-2xl mb-2">💱</div>
            <div className="font-semibold">Update Rates</div>
            <div className="text-sm text-gray-600">Currency exchange rates</div>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  const colors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500'
  };

  return (
    <div className={`${colors[color]} text-white p-6 rounded-lg shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="text-sm opacity-90">{title}</div>
    </div>
  );
}

// Products View
function ProductsView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`, noCacheConfig());
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await axios.delete(`${API_URL}/products/${id}`);
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12"><div className="spinner mx-auto"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Products Management</h1>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No products yet. Click "Add Product" to create one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg border border-gray-200 bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {product.images?.length ? `${product.images.length} image(s)` : '0 images'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">{product.category}</td>
                  <td className="px-6 py-4 font-semibold">${product.basePrice}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.featured ? '⭐' : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingProduct(product); setShowForm(true); }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onSave={loadProducts}
        />
      )}
    </div>
  );
}

// Product Form Component
function ProductForm({ product, onClose, onSave }) {
  const COUNTRIES = ['USD', 'GBP', 'EUR', 'INR', 'AED', 'AUD', 'CAD', 'JPY', 'CNY', 'SAR'];
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    basePrice: product?.basePrice ?? '',
    exchangeRates: product?.exchangeRates || {
      USD: 1,
      GBP: 0.79,
      EUR: 0.92,
      INR: 82.5,
      AED: 3.67,
      AUD: 1.52,
      CAD: 1.35,
      JPY: 148,
      CNY: 7.24,
      SAR: 3.75
    },
    inStock: product?.inStock ?? true,
    featured: product?.featured ?? false
  });
  const [images, setImages] = useState(product?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [replaceIndex, setReplaceIndex] = useState(null);
  const [dragImageIndex, setDragImageIndex] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const replaceFileInputRef = useRef(null);

  const mergeUniqueImages = (existingImages, newImages) => {
    const seen = new Set(existingImages);
    const uniqueToAdd = [];

    newImages.forEach((image) => {
      if (!seen.has(image)) {
        seen.add(image);
        uniqueToAdd.push(image);
      }
    });

    return [...existingImages, ...uniqueToAdd];
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const handleLocalImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      return;
    }

    const invalidFile = files.find((file) => !file.type.startsWith('image/'));
    if (invalidFile) {
      setImageUploadError('Only image files are allowed.');
      e.target.value = '';
      return;
    }

    try {
      const uploadedImages = await Promise.all(files.map(readFileAsDataUrl));
      setImages((prevImages) => mergeUniqueImages(prevImages, uploadedImages));
      setImageUploadError('');
    } catch (error) {
      setImageUploadError('Unable to process one or more files.');
    } finally {
      e.target.value = '';
    }
  };

  const addImageFromUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) {
      return;
    }

    setImages((prevImages) => (prevImages.includes(trimmed) ? prevImages : [...prevImages, trimmed]));
    setImageUrlInput('');
    setImageUploadError('');
  };

  const removeImage = (indexToRemove) => {
    setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const reorderImages = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      return;
    }

    setImages((prevImages) => {
      const nextImages = [...prevImages];
      const [movedImage] = nextImages.splice(fromIndex, 1);
      nextImages.splice(toIndex, 0, movedImage);
      return nextImages;
    });
  };

  const handleDragStart = (index) => {
    setDragImageIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex) => {
    if (dragImageIndex === null) {
      return;
    }
    reorderImages(dragImageIndex, targetIndex);
    setDragImageIndex(null);
  };

  const handleDragEnd = () => {
    setDragImageIndex(null);
  };

  const openReplacePicker = (index) => {
    setReplaceIndex(index);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.click();
    }
  };

  const handleReplaceImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (replaceIndex === null || !file) {
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Only image files are allowed.');
      e.target.value = '';
      return;
    }

    try {
      const newImage = await readFileAsDataUrl(file);
      setImages((prevImages) => prevImages.map((image, index) => (index === replaceIndex ? newImage : image)));
      setImageUploadError('');
    } catch (error) {
      setImageUploadError('Unable to replace image.');
    } finally {
      setReplaceIndex(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      const normalizedImages = Array.from(
        new Set(
          images
            .map((image) => (typeof image === 'string' ? image.trim() : ''))
            .filter(Boolean)
        )
      );

      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice) || 0,
        images: normalizedImages,
        image: normalizedImages[0] || ''
      };

      if (product) {
        await axios.put(`${API_URL}/products/${product._id}`, payload);
      } else {
        await axios.post(`${API_URL}/products`, payload);
      }
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      const message = error.response?.data?.message || 'Error saving product';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const updateExchangeRate = (currency, value) => {
    setFormData({
      ...formData,
      exchangeRates: {
        ...formData.exchangeRates,
        [currency]: parseFloat(value) || 0
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{product ? 'Edit' : 'Add'} Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., office, home, outdoor"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pricing (Base Price in USD)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product Images</h3>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={addImageFromUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Add URL
              </button>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload from local machine</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleLocalImageUpload}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
              />
              <p className="mt-2 text-xs text-gray-500">
                Uploaded files are stored as data URLs in the product images list.
              </p>
              {imageUploadError && (
                <p className="mt-2 text-sm text-red-600">{imageUploadError}</p>
              )}
            </div>
            <input
              ref={replaceFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReplaceImageUpload}
            />
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-full text-xs text-gray-500">
                  Drag images to reorder. The first image is used as the primary thumbnail.
                </div>
                {images.map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={handleDragEnd}
                    className={`rounded-lg border bg-gray-100 overflow-hidden cursor-move ${
                      index === 0 ? 'border-blue-400' : 'border-gray-200'
                    }`}
                  >
                    <div className="w-full aspect-square">
                      <img
                        src={imageUrl}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-gray-600 mb-2">
                        {index === 0 ? 'Primary image' : `Position ${index + 1}`}
                      </div>
                      <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openReplacePicker(index)}
                        className="flex-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="flex-1 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exchange Rates */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Exchange Rates</h3>
            <p className="text-sm text-gray-600 mb-4">Set exchange rates for automatic currency conversion</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {COUNTRIES.map((currency) => (
                <div key={currency}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{currency}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.exchangeRates[currency] || 0}
                    onChange={(e) => updateExchangeRate(currency, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Status</h3>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">In Stock</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Featured Product</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          {saveError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              {saveError}
            </div>
          )}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              {saving ? 'Saving...' : `${product ? 'Update' : 'Create'} Product`}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Categories View
function CategoriesView() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Delete this category?')) {
      try {
        await axios.delete(`${API_URL}/categories/${id}`);
        loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12"><div className="spinner mx-auto"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Categories Management</h1>
        <button
          onClick={() => { setEditingCategory(null); setShowForm(true); }}
          className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No categories yet. Click "Add Category" to create one.
          </div>
        ) : (
          categories.map((category) => (
            <div key={category._id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{category.icon}</div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingCategory(category); setShowForm(true); }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(category._id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => { setShowForm(false); setEditingCategory(null); }}
          onSave={loadCategories}
        />
      )}
    </div>
  );
}

// Category Form
function CategoryForm({ category, onClose, onSave }) {
  const [formData, setFormData] = useState(category || {
    name: '',
    description: '',
    icon: '📦'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (category) {
        await axios.put(`${API_URL}/categories/${category._id}`, formData);
      } else {
        await axios.post(`${API_URL}/categories`, formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{category ? 'Edit' : 'Add'} Category</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({...formData, icon: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="📦"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows="3"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg"
            >
              {category ? 'Update' : 'Create'} Category
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Settings View
function SettingsView() {
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1,
    GBP: 0.79,
    EUR: 0.92,
    INR: 82.5,
    AED: 3.67,
    AUD: 1.52,
    CAD: 1.35,
    JPY: 148,
    CNY: 7.24,
    SAR: 3.75
  });
  const [saved, setSaved] = useState(false);

  const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' }
  ];

  const handleSave = async () => {
    try {
      await axios.post(`${API_URL}/settings/exchange-rates`, { rates: exchangeRates });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving rates:', error);
      alert('Error saving exchange rates');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Store Settings</h1>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Exchange Rates</h2>
            <p className="text-gray-600 mt-1">Set exchange rates for multi-currency pricing</p>
          </div>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            {saved ? '✓ Saved!' : 'Save Rates'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CURRENCIES.map((currency) => (
            <div key={currency.code} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold text-lg">{currency.code}</div>
                  <div className="text-sm text-gray-600">{currency.name}</div>
                </div>
                <div className="text-2xl">{currency.symbol}</div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate (per 1 USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={exchangeRates[currency.code]}
                  onChange={(e) => setExchangeRates({
                    ...exchangeRates,
                    [currency.code]: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How it works</h3>
          <p className="text-sm text-blue-800">
            These rates are used to convert product prices from USD (base currency) to other currencies.
            For example, if a product costs $100 USD and the INR rate is 82.5, the price in India will be ₹8,250.
          </p>
        </div>
      </div>
    </div>
  );
}
