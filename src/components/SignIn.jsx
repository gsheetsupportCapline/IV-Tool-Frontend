import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import BASE_URL from '../config/apiConfig';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showPassword, setShowPassword] = useState(false);
  let history = useHistory();

  // Create twinkling stars effect
  useEffect(() => {
    const createStars = () => {
      const container = document.getElementById('stars-container');
      if (!container) return;

      // Create 30 stars
      for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'twinkling-star';

        // Random initial position
        const randomTop = Math.random() * 100;
        const randomLeft = Math.random() * 100;
        const randomSize = Math.random() > 0.5 ? 2 : 3;
        const randomDelay = Math.random() * 3;

        // Animation duration between 3-5 seconds
        const animDuration = 3 + Math.random() * 2;

        star.style.top = `${randomTop}%`;
        star.style.left = `${randomLeft}%`;
        star.style.width = `${randomSize}px`;
        star.style.height = `${randomSize}px`;
        star.style.animationDelay = `${randomDelay}s`;
        star.style.animationDuration = `${animDuration}s`;

        container.appendChild(star);

        // Function to reposition star - only when animation cycle completes (opacity is 0)
        const repositionStar = () => {
          const cycleTime = animDuration * 1000; // Full animation cycle time

          setTimeout(() => {
            // Star is now at opacity 0 (end of cycle)
            // Change position instantly while invisible
            star.style.top = `${Math.random() * 100}%`;
            star.style.left = `${Math.random() * 100}%`;

            // Schedule next reposition after next full cycle
            repositionStar();
          }, cycleTime);
        };

        // Start first reposition after initial delay + first cycle
        setTimeout(() => {
          repositionStar();
        }, (randomDelay + animDuration) * 1000);
      }
    };

    createStars();

    return () => {
      const container = document.getElementById('stars-container');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    let isValid = true;

    if (!email.trim()) {
      setSnackbarMessage('Email is required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      isValid = false;
      return;
    }

    if (!password.trim()) {
      setSnackbarMessage('Password is required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      isValid = false;
      return;
    }

    if (isValid) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: email,
          password: password,
        });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem(
          'loggedinUserId',
          response.data.data.userDetails._id
        );
        localStorage.setItem(
          'loggedinUserName',
          response.data.data.userDetails.name
        );
        localStorage.setItem('role', response.data.data.userDetails.role);
        localStorage.setItem(
          'assignedOffice',
          response.data.data.userDetails.assignedOffice
        );

        setSnackbarMessage('Login successful!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        history.push('/schedule-patient');
      } catch (error) {
        setSnackbarOpen(true);
        setSnackbarSeverity('error');
        console.error('Login failed:', error.response);
        if (!error.response) {
          setSnackbarMessage('Server connection lost. Please try again later.');
        } else if (error.response.data.err?.message == 'Incorrect password') {
          setSnackbarMessage(
            'Invalid credentials. Please check your email and password.'
          );
        } else {
          setSnackbarMessage('An error occurred. Please try again.');
        }
      }
    }
  };

  return (
    <div style={styles.body}>
      <style>{`
        @keyframes twinkleAnimation {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .twinkling-star {
          position: absolute;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: twinkleAnimation 4s ease-in-out infinite;
        }

        .login-container {
          animation: fadeIn 0.8s ease-out;
        }

        .input-field:focus {
          outline: none;
          border: 2px solid #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.5);
        }

        .login-btn:active {
          transform: translateY(0);
        }
      `}</style>

      {/* Dynamic Stars Container */}
      <div id="stars-container" style={styles.starsContainer}></div>

      <div className="login-container" style={styles.container}>
        <div style={styles.logoWrapper}>
          <img
            src="https://drive.google.com/thumbnail?sz=w1920&id=1A0xR_WQAM9rpX34fqrqb3WF8YHnkOX1c"
            alt="Logo"
            style={styles.logo}
          />
        </div>

        <h1 style={styles.appName}>SmileIV</h1>
        <h2 style={styles.heading}>Smilepoint's Patient IV System</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <svg
                style={styles.inputIcon}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <svg
                style={styles.inputIcon}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={styles.eyeIcon}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={styles.eyeIcon}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" style={styles.btn}>
            <span style={styles.btnText}>Sign In</span>
            <svg
              style={styles.btnIcon}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </form>
      </div>

      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          style={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

const styles = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    background: '#1e293b',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
  },
  starsContainer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
  container: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: '48px 40px',
    borderRadius: '24px',
    boxShadow:
      '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(59, 130, 246, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'relative',
    zIndex: 10,
  },
  logoWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  logo: {
    width: '180px',
    height: 'auto',
  },
  appName: {
    textAlign: 'center',
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  heading: {
    textAlign: 'center',
    color: '#1e293b',
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '32px',
    fontWeight: '400',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '4px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    width: '20px',
    height: '20px',
    color: '#94a3b8',
    pointerEvents: 'none',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    fontSize: '15px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    transition: 'all 0.3s ease',
    color: '#1e293b',
    fontWeight: '500',
    boxSizing: 'border-box',
  },
  eyeButton: {
    position: 'absolute',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    transition: 'color 0.2s ease',
    outline: 'none',
  },
  eyeIcon: {
    width: '20px',
    height: '20px',
  },
  btn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  btnText: {
    fontSize: '16px',
    fontWeight: '600',
  },
  btnIcon: {
    width: '20px',
    height: '20px',
  },
};

export default SignIn;
