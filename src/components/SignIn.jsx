import { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import BASE_URL from "../config/apiConfig";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  let history = useHistory();

  const handleSubmit = async (event) => {
    event.preventDefault();
    let isValid = true;

    if (!email.trim()) {
      setSnackbarMessage("Email is required.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      isValid = false;
      return;
    }

    if (!password.trim()) {
      setSnackbarMessage("Password is required.");
      setSnackbarSeverity("error");
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

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("loggedinUserId", response.data.data.userDetails._id);
        localStorage.setItem("loggedinUserName", response.data.data.userDetails.name);
        localStorage.setItem("role", response.data.data.userDetails.role);
        localStorage.setItem("assignedOffice", response.data.data.userDetails.assignedOffice);

        setSnackbarMessage("Login successful!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        history.push("/schedule-patient");
      } catch (error) {
        setSnackbarOpen(true);
        setSnackbarSeverity("error");
        console.error("Login failed:", error.response);
        if (!error.response) {
          setSnackbarMessage("Server connection lost. Please try again later.");
        }  else if (error.response.data.err?.message == "Incorrect password") {
          setSnackbarMessage("Invalid credentials. Please check your email and password.");
        }
           else {
          setSnackbarMessage("An error occurred. Please try again.");
        }
      }
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <img
          src="https://drive.google.com/thumbnail?sz=w1920&id=1A0xR_WQAM9rpX34fqrqb3WF8YHnkOX1c"
          alt="Logo"
          style={styles.logo}
        />
        <h2 style={styles.heading}>Login</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.textbox}>
            <input
              type="email"
              id="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.textbox}>
            <input
              type="password"
              id="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.btn}>
            Login
          </button>
        </form>
      </div>
      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          style={{ width: "100%" }}
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
    fontFamily: "Cambria, sans-serif",
    background: "url('https://drive.google.com/thumbnail?sz=w1920&id=10iAtTzD1Khs1LRCzMvSo510isbNVIqaH') no-repeat center center fixed",
    backgroundSize: "cover",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  container: {
    width: "300px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
  },
  logo: {
    display: "block",
    margin: "0 auto",
    width: "100px",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  textbox: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "10px",
    background: "#f1f1f1",
    border: "none",
    borderRadius: "5px",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    padding: "10px",
    background: "#3498db",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    cursor: "pointer",
    marginBottom: "10px",
  },
};

export default SignIn;


