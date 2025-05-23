import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';

// API utility
const api = {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3002/api',
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    },

    get(endpoint) {
        return this.request(endpoint);
    },

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};

// Login Component
function Login({ onLogin }) {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const endpoint = isAdmin ? '/auth/admin-login' : '/auth/login';
            const response = await api.post(endpoint, credentials);
            
            localStorage.setItem('token', response.token);
            onLogin(response.user);
            toast.success('Login successful!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '40px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '2rem', color: '#2d3748' }}>
                    {isAdmin ? '?? Admin Panel' : '?? LAN Chat'}
                </h1>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email</label>
                        <input
                            type="email"
                            value={credentials.email}
                            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                            required
                            style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Password</label>
                        <input
                            type="password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            required
                            style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={isAdmin}
                                onChange={(e) => setIsAdmin(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            Admin Login
                        </label>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ 
                            width: '100%', 
                            padding: '14px', 
                            background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontSize: '16px', 
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', padding: '16px', background: '#f7fafc', borderRadius: '8px', fontSize: '14px' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Test Accounts:</p>
                    <p style={{ margin: '0', fontFamily: 'monospace' }}>
                        Admin: admin@localhost / admin123<br/>
                        User: user@localhost / admin123
                    </p>
                </div>
            </div>
        </div>
    );
}

// Dashboard Component
function Dashboard({ user, onLogout }) {
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        loadData();
        initSocket();
        
        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    const loadData = async () => {
        try {
            if (user.role === 'admin') {
                const [statsData, usersData] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/users')
                ]);
                setStats(statsData);
                setUsers(usersData.users || []);
            }
        } catch (error) {
            toast.error('Failed to load data');
        }
    };

    const initSocket = () => {
        const newSocket = io('http://localhost:3001');
        
        newSocket.on('connect', () => {
            setConnected(true);
            toast.success('Connected to chat server');
        });

        newSocket.on('disconnect', () => {
            setConnected(false);
        });

        newSocket.on('welcome', (data) => {
            console.log('Welcome message:', data);
        });

        setSocket(newSocket);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
            {/* Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#2d3748' }}>
                        LAN Chat Dashboard
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ color: connected ? '#38a169' : '#e53e3e' }}>
                            {connected ? '?? Connected' : '?? Disconnected'}
                        </span>
                        <span style={{ color: '#4a5568' }}>
                            {user.full_name} ({user.role})
                        </span>
                        <button
                            onClick={onLogout}
                            style={{ padding: '8px 16px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                {/* Welcome Card */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ margin: '0 0 16px 0', color: '#2d3748' }}>
                        Welcome back, {user.full_name}! ??
                    </h2>
                    <p style={{ margin: 0, color: '#4a5568' }}>
                        {user.role === 'admin' ? 'Manage users and monitor the system from your admin dashboard.' : 'Connect with support team and manage your tickets.'}
                    </p>
                </div>

                {/* Stats Cards (Admin only) */}
                {user.role === 'admin' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>Total Users</h3>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3182ce' }}>
                                {(stats.users?.admin || 0) + (stats.users?.support || 0) + (stats.users?.user || 0)}
                            </p>
                        </div>
                        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>Online Users</h3>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#38a169' }}>
                                {stats.online_users || 0}
                            </p>
                        </div>
                        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>Total Messages</h3>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#805ad5' }}>
                                {stats.total_messages || 0}
                            </p>
                        </div>
                        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>Socket Status</h3>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: connected ? '#38a169' : '#e53e3e' }}>
                                {connected ? '? Connected' : '? Disconnected'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Users Table (Admin only) */}
                {user.role === 'admin' && users.length > 0 && (
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#2d3748' }}>Recent Users</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', color: '#4a5568' }}>Name</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: '#4a5568' }}>Email</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: '#4a5568' }}>Role</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: '#4a5568' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.slice(0, 5).map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '12px', color: '#2d3748' }}>{user.full_name}</td>
                                            <td style={{ padding: '12px', color: '#4a5568' }}>{user.email}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ 
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px', 
                                                    fontSize: '12px', 
                                                    fontWeight: '600',
                                                    background: user.role === 'admin' ? '#fed7d7' : user.role === 'support' ? '#bee3f8' : '#c6f6d5',
                                                    color: user.role === 'admin' ? '#c53030' : user.role === 'support' ? '#2b6cb0' : '#25855a'
                                                }}>
                                                    {user.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ color: user.is_online ? '#38a169' : '#a0aec0' }}>
                                                    {user.is_online ? '?? Online' : '? Offline'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Regular User Content */}
                {user.role !== 'admin' && (
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#2d3748' }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <button style={{ 
                                padding: '16px', 
                                background: '#667eea', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>
                                ?? Start Chat
                            </button>
                            <button style={{ 
                                padding: '16px', 
                                background: '#48bb78', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>
                                ?? Create Ticket
                            </button>
                            <button style={{ 
                                padding: '16px', 
                                background: '#ed8936', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>
                                ?? My Tickets
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Main App Component
function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/verify');
            setUser(response.user);
        } catch (error) {
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.info('Logged out successfully');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', border: '4px solid #e2e8f0', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                    <p style={{ color: '#4a5568' }}>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <div>
                <Routes>
                    <Route 
                        path="/" 
                        element={
                            user ? (
                                <Dashboard user={user} onLogout={handleLogout} />
                            ) : (
                                <Login onLogin={handleLogin} />
                            )
                        } 
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <ToastContainer position="top-right" autoClose={5000} />
                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </div>
        </Router>
    );
}

export default App;
