import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    // Validate registration
    if (!isLoginMode) {
      if (password !== confirmPassword) {
        return;
      }
      if (password.length < 6) {
        return;
      }
    }

    try {
      setIsLoading(true);
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Karthikeya Boutique</h2>
        <p className="login-subtitle">Order Management System</p>
        
        <div className="auth-mode-toggle">
          <button
            type="button"
            className={`mode-button ${isLoginMode ? 'active' : ''}`}
            onClick={() => isLoginMode || switchMode()}
          >
            Login
          </button>
          <button
            type="button"
            className={`mode-button ${!isLoginMode ? 'active' : ''}`}
            onClick={() => !isLoginMode || switchMode()}
          >
            Register
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={isLoginMode ? undefined : 6}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {!isLoginMode && (
            <div className="form-group password-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          )}

          {!isLoginMode && password && confirmPassword && password !== confirmPassword && (
            <p className="error-message">Passwords do not match</p>
          )}

          {!isLoginMode && password && password.length < 6 && (
            <p className="error-message">Password must be at least 6 characters</p>
          )}
          
          {error && <p className="error-message">{error}</p>}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading || (!isLoginMode && (password !== confirmPassword || password.length < 6))}
          >
            {isLoading 
              ? (isLoginMode ? 'Logging in...' : 'Creating account...') 
              : (isLoginMode ? 'Login' : 'Create Account')
            }
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="link-button"
              onClick={switchMode}
              disabled={isLoading}
            >
              {isLoginMode ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
