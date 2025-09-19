import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import axios from 'axios';
import './App.css';

// Epic Starfield Component with flowing animations
const StarfieldCanvas = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const starsRef = useRef([]);
    const particlesRef = useRef([]);
    const animationRef = useRef();
    const timeRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Generate floating stars with movement
        const generateStars = () => {
            const stars = [];
            for (let i = 0; i < 120; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2.2 + 0.8,
                    opacity: Math.random() * 0.6 + 0.3,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    twinkleSpeed: Math.random() * 0.012 + 0.005,
                    baseOpacity: Math.random() * 0.5 + 0.3,
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
            starsRef.current = stars;
        };

        // Generate floating particles for ambient effect
        const generateParticles = () => {
            const particles = [];
            for (let i = 0; i < 25; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: (Math.random() - 0.5) * 0.8,
                    opacity: Math.random() * 0.2 + 0.1,
                    size: Math.random() * 1.2 + 0.4,
                    trail: []
                });
            }
            particlesRef.current = particles;
        };

        generateStars();
        generateParticles();

        // Enhanced mouse move handler with smooth interpolation
        const targetMouse = { x: canvas.width / 2, y: canvas.height / 2 };
        const handleMouseMove = (e) => {
            targetMouse.x = e.clientX;
            targetMouse.y = e.clientY;
        };
        
        window.addEventListener('mousemove', handleMouseMove);

        // Epic animation loop
        const animate = () => {
            timeRef.current += 0.016; // ~60fps timing
            
            // Smooth mouse interpolation for fluid movement
            mouseRef.current.x += (targetMouse.x - mouseRef.current.x) * 0.08;
            mouseRef.current.y += (targetMouse.y - mouseRef.current.y) * 0.08;

            // Create subtle dynamic gradient background
            const mouseInfluence = Math.min(300, Math.sqrt(mouseRef.current.x * mouseRef.current.x + mouseRef.current.y * mouseRef.current.y) / 5);
            const gradient = ctx.createRadialGradient(
                mouseRef.current.x, mouseRef.current.y, 0,
                mouseRef.current.x, mouseRef.current.y, mouseInfluence + 200
            );
            gradient.addColorStop(0, `rgba(15, 25, 45, ${0.3 + mouseInfluence / 1000})`);
            gradient.addColorStop(0.7, 'rgba(8, 15, 30, 0.8)');
            gradient.addColorStop(1, 'rgba(5, 8, 18, 1)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const mouse = mouseRef.current;
            const stars = starsRef.current;
            const particles = particlesRef.current;

            // Update and draw floating particles with short trails
            particles.forEach(particle => {
                // Add current position to trail (shorter trail)
                particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity });
                if (particle.trail.length > 8) particle.trail.shift();

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Wrap around screen
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                // Draw subtle particle trail
                particle.trail.forEach((point, i) => {
                    const trailOpacity = (i / particle.trail.length) * particle.opacity * 0.6;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, particle.size * (i / particle.trail.length) * 0.7, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(150, 180, 255, ${trailOpacity})`;
                    ctx.fill();
                });

                // Draw main particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(180, 200, 255, ${particle.opacity})`;
                ctx.fill();
            });

            // Update and draw animated stars
            stars.forEach(star => {
                // Floating movement
                star.x += star.vx;
                star.y += star.vy;

                // Wrap around screen
                if (star.x < -10) star.x = canvas.width + 10;
                if (star.x > canvas.width + 10) star.x = -10;
                if (star.y < -10) star.y = canvas.height + 10;
                if (star.y > canvas.height + 10) star.y = -10;

                // Enhanced twinkling with sine waves
                star.pulsePhase += star.twinkleSpeed;
                const pulse = Math.sin(star.pulsePhase) * 0.25 + 0.75;
                star.opacity = star.baseOpacity * pulse;

                // Dynamic size based on proximity to mouse
                const distanceToMouse = Math.sqrt(
                    Math.pow(mouse.x - star.x, 2) + Math.pow(mouse.y - star.y, 2)
                );
                const proximityFactor = Math.max(0.7, 1 - distanceToMouse / 250);
                const dynamicSize = star.size * proximityFactor;

                // Draw star with moderate glow
                const glowSize = dynamicSize * 2;
                ctx.beginPath();
                ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.08})`;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(star.x, star.y, dynamicSize + 0.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220, 230, 255, ${star.opacity * 0.15})`;
                ctx.fill();

                // Draw core star
                ctx.beginPath();
                ctx.arc(star.x, star.y, dynamicSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.fill();
            });

            // Draw elegant connections from mouse to nearby stars
            stars.forEach(star => {
                const distance = Math.sqrt(
                    Math.pow(mouse.x - star.x, 2) + Math.pow(mouse.y - star.y, 2)
                );
                
                if (distance < 180) {
                    const connectionOpacity = 0.25 * (1 - distance / 180);
                    
                    // Add subtle curve to the line
                    const midX = (mouse.x + star.x) / 2 + Math.sin(timeRef.current + distance * 0.01) * 8;
                    const midY = (mouse.y + star.y) / 2 + Math.cos(timeRef.current + distance * 0.01) * 8;
                    
                    ctx.beginPath();
                    ctx.moveTo(mouse.x, mouse.y);
                    ctx.quadraticCurveTo(midX, midY, star.x, star.y);
                    ctx.strokeStyle = `rgba(150, 200, 255, ${connectionOpacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });

            // Draw connections between nearby stars
            stars.forEach((star1, i) => {
                stars.slice(i + 1, i + 4).forEach(star2 => {
                    const distance = Math.sqrt(
                        Math.pow(star1.x - star2.x, 2) + Math.pow(star1.y - star2.y, 2)
                    );
                    
                    if (distance < 100) {
                        const connectionOpacity = 0.12 * (1 - distance / 100);
                        const animatedOffset = Math.sin(timeRef.current * 0.5 + i) * 1;
                        
                        ctx.beginPath();
                        ctx.moveTo(star1.x, star1.y);
                        ctx.lineTo(star2.x + animatedOffset, star2.y + animatedOffset);
                        ctx.strokeStyle = `rgba(200, 220, 255, ${connectionOpacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });

            // Draw subtle mouse cursor glow
            const mouseGlow = ctx.createRadialGradient(
                mouse.x, mouse.y, 0,
                mouse.x, mouse.y, 30
            );
            mouseGlow.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
            mouseGlow.addColorStop(0.7, 'rgba(150, 200, 255, 0.08)');
            mouseGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 30, 0, Math.PI * 2);
            ctx.fillStyle = mouseGlow;
            ctx.fill();

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return <canvas ref={canvasRef} id="starfield-canvas" />;
};

// Backend API ke liye base URL set karna
const apiClient = axios.create({
    baseURL: 'https://web-production-480aa.up.railway.app/api',
    withCredentials: true // Cookies (session) bhejne ke liye zaroori hai
});

// Authentication context create karna
const AuthContext = createContext(null);

// Auth Provider Component jo puri app ko wrap karega
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // App load hone par current user ko check karna
    useEffect(() => {
        apiClient.get('/@me').then(response => {
            setUser(response.data);
        }).catch(() => {
            setUser(null);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const authContextValue = {
        user,
        setUser,
        loading
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook authentication context ko use karne ke liye
const useAuth = () => useContext(AuthContext);

// Login aur Register Form Component
const AuthPage = () => {
    const { setUser } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const url = isLogin ? '/login' : '/register';
        try {
            const response = await apiClient.post(url, { email, password });
            setUser(response.data);
        } catch (err) {
            setError(err.response?.data?.error || `An error occurred. Please try again.`);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">
                    {isLogin ? '🔑 Sign In' : '📝 Create Account'}
                </h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">📧 Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">🔒 Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && <p className="error-message">❌ {error}</p>}
                    <button
                        type="submit"
                        className="submit-button"
                    >
                        {isLogin ? '🚀 Sign In' : '✨ Create Account'}
                    </button>
                </form>
                <p className="auth-switch">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setIsLogin(!isLogin)} className="switch-button">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

// Dashboard component jo login ke baad dikhega
const Dashboard = () => {
    const { user, setUser } = useAuth();

    const handleLogout = async () => {
        try {
            await apiClient.post('/logout');
            setUser(null);
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-card">
                <h1 className="dashboard-title">🎉 Welcome!</h1>
                <div className="user-info">
                    <p className="welcome-text">
                        You are successfully logged in as:
                    </p>
                    <p className="user-email">📧 {user.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="logout-button"
                >
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};


// Main App Component
export default function App() {
    return (
        <AuthProvider>
            <MainContent />
        </AuthProvider>
    );
}

const MainContent = () => {
    const { user, loading } = useAuth();

    return (
        <div className="app-container">
            <StarfieldCanvas />
            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : user ? (
                <Dashboard />
            ) : (
                <AuthPage />
            )}
        </div>
    );
}
