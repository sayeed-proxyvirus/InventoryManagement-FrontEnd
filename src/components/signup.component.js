import React, { useState } from "react";
import "./formstyles.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userNameFlag, setUserNameFlag] = useState(false);
  const [emailFlag, setEmailFlag] = useState(false);
  const [passwordFlag, setPasswordFlag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const API_URL = "https://localhost:44359/INVApplication";

  // Basic validation
  const checkValidation = () => {
    console.log("CheckValidation Calling...");

    setUserNameFlag(false);
    setEmailFlag(false);
    setPasswordFlag(false);
    setErrorMessage("");

    if (userName === "") {
      setUserNameFlag(true);
    }
    if (email === "") {
      setEmailFlag(true);
    }
    if (password === "") {
      setPasswordFlag(true);
    }

    return userName !== "" && email !== "" && password !== "";
  };

  // Clear sensitive data
  const clearSensitiveData = () => {
    setPassword("");
  };

  // Handle registration errors
  const handleRegistrationError = (error) => {
    clearSensitiveData();

    let errorMessage = "Registration failed. Please try again.";

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          errorMessage =
            data?.message ||
            "Invalid registration data. Please check your input.";
          break;
        case 409:
          errorMessage = data?.message || "Username or email already exists.";
          break;
        case 422:
          errorMessage = data?.message || "Invalid input format.";
          break;
        case 429:
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = data?.message || "Registration failed.";
      }
    } else if (error.request) {
      errorMessage = "Network error. Please check your connection.";
    } else if (error.code === "ECONNABORTED") {
      errorMessage = "Request timeout. Please try again.";
    }

    setErrorMessage(errorMessage);
    console.error("Registration error:", error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");

    // Validate inputs
    if (!checkValidation()) {
      setErrorMessage("Please fill all fields correctly.");
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      const data = {
        userName: userName.trim(),
        password: password,
        fullName: "",
        email: email.trim(),
        
      };

      console.log("SignUp attempt:", {
        userName: data.userName,
        email: data.email,
        password: data.password,
      });

      const url = `${API_URL}/Register`;

      const response = await axios.post(url, data, {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(response);

      // Handle response based on isSuccess flag
      if (response.data.isSuccess === true) {
        clearSensitiveData();

        // Store user data if needed
        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);
        }
        localStorage.setItem("userName", data.userName);

        setSuccessMessage(
          `Welcome '${data.userName}'! Registration successful.`
        );

        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate("/homepage");
        }, 2000);

        console.log("Registration Successful");
      } else {
        // Handle registration failure based on API response
        const errorMessage =
          response.data.message || "Registration failed. Please try again.";

        if (errorMessage.includes("already exists")) {
          setErrorMessage(
            "This username or email is already registered. Please try different credentials."
          );
        } else {
          setErrorMessage(errorMessage);
        }
        console.log("Registration failed:", response.data.message);
      }
    } catch (error) {
      handleRegistrationError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Sign Up</h3>
      <div className="mb-3">
        <label>User name</label>
        <input
          type="text"
          className="form-control"
          placeholder="User name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label>Email address</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
      </div>
      <p className="forgot-password text-right">
        Already registered <a href="/sign-in">sign in?</a>
      </p>
    </form>
  );
};

export default SignUp;
