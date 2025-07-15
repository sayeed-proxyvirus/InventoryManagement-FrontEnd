import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./formstyles.css";
import bcrypt from "bcryptjs";
import axios from "axios";
import { ADMIN_HASH } from "./config";
const Login = () => {
  const [userName, setuserName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [userNameFlag, setUserNameFlag] = useState(false);
  const [passwordFlag, setPasswordFlag] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const API_URL = "https://localhost:44359/INVApplication";

  const checkValidation = () => {
    console.log("CheckValidation Calling...");

    setUserNameFlag(false);
    setPasswordFlag(false);
    setErrorMessage("");

    if (userName === "") {
      setUserNameFlag(true);
    }
    if (password === "") {
      setPasswordFlag(true);
    }

    return userName !== "" && password !== "";
  };

  // Clear sensitive data
  const clearSensitiveData = () => {
    setPassword('');
  };

  // Handle login errors
  const handleLoginError = (error) => {
    clearSensitiveData();
    
    let errorMessage = "Login failed. Please try again.";
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data?.message || "Invalid request. Please check your input.";
          break;
        case 401:
          errorMessage = data?.message || "Invalid credentials.";
          break;
        case 403:
          errorMessage = "Access denied. Please contact administrator.";
          break;
        case 404:
          errorMessage = "Service not available. Please try again later.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = data?.message || "Login failed.";
      }
    } else if (error.request) {
      errorMessage = "Network error. Please check your connection.";
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = "Request timeout. Please try again.";
    }
    
    setErrorMessage(errorMessage);
    console.error("Login error:", error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");
    setOpen(false);

    // Validate inputs
    if (!checkValidation()) {
      setOpen(true);
      setMessage("Please fill all mandatory fields");
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      console.log("Acceptable");

      const hashedAdminPassword = ADMIN_HASH;

      if (!hashedAdminPassword) {
        setErrorMessage("Server configuration error");
        console.error("Hash not found in config");
        setIsLoading(false);
        return;
      }

      // Admin shortcut - simplified for demo
      if (role === "Admin" && userName === "Sayeed") {
        try {
          const isMatch = await bcrypt.compare(password, hashedAdminPassword);
          if (isMatch) {
            clearSensitiveData();
            
            // Store admin session
            localStorage.setItem('userRole', 'Admin');
            localStorage.setItem('userName', userName);
            
            setSuccessMessage(`Welcome Admin '${userName}'!`);
            
            // Navigate after a short delay
            setTimeout(() => {
              navigate("/HomePage");
            }, 1500);
            
            console.log("Admin Login Successful");
          } else {
            setErrorMessage("Invalid password");
          }
        } catch (error) {
          console.error("Admin login error:", error);
          setErrorMessage("Admin login failed");
        }
      } else {
        // Regular user login
        const data = {
          userName: userName.trim(),
          password: password,
          role: role,
        };

        const url = `${API_URL}/Login`;

        const response = await axios.post(url, data, {
          timeout: 15000, // 15 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Handle successful response
        if (response.status === 200) {
          const responseData = response.data;
          
          // Check if login was successful based on API response structure
          if (responseData.isSuccess === true) {
            clearSensitiveData();
            
            // Store authentication data
            if (responseData.token) {
              localStorage.setItem('authToken', responseData.token);
            }
            localStorage.setItem('userRole', role);
            localStorage.setItem('userName', userName);
            
            setSuccessMessage(`Welcome '${userName}'!`);
            
            // Navigate after a short delay
            setTimeout(() => {
              navigate("/HomePage");
            }, 1500);
            alert(`Welcome ${userName}`)
            console.log("Login Successful");
          } else {
            // Handle login failure based on API response
            setErrorMessage(responseData.message || "Invalid credentials. Please try again.");
          }
        }
      }
    } catch (error) {
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  

  

  return (
    <>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <form onSubmit={handleSubmit}>
              <h3 className="text-center mb-4">Sign In</h3>

              {/* Role Selection */}
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">User Name</label>
                <input
                  type="text"
                  className={`form-control ${userNameFlag ? "is-invalid" : ""}`}
                  placeholder="User Name"
                  value={userName}
                  onChange={(e) => setuserName(e.target.value)}
                />
                {userNameFlag && (
                  <div className="invalid-feedback">Username is required</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-control ${passwordFlag ? "is-invalid" : ""}`}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordFlag && (
                  <div className="invalid-feedback">Password is required</div>
                )}
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="customCheck1"
                  />
                  <label className="form-check-label" htmlFor="customCheck1">
                    Remember me
                  </label>
                </div>
              </div>

              {open && (
                <div className="alert alert-danger" role="alert">
                  {message}
                </div>
              )}

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/sign-up")}
                >
                  Sign Up
                </button>
              </div>

              <p className="text-center mt-3">
                Forgot <a href="#">password?</a>
              </p>
            </form>
          </div>
        </div>
      </div>

      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
    </>
  );
};

export default Login;
