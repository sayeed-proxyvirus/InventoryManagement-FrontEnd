import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./formstyles.css";
import bcrypt from "bcryptjs";
import axios from "axios";
import { ADMIN_HASH } from "./config";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [userNameFlag, setUserNameFlag] = useState(false);
  const [passwordFlag, setPasswordFlag] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const API_URL = "https://localhost:44359/INVApplication";

  const checkValidation = () => {
    console.log("CheckValidation Calling...");

    setUserNameFlag(false);
    setPasswordFlag(false);

    if (email === "") {
      setUserNameFlag(true);
    }
    if (password === "") {
      setPasswordFlag(true);
    }
  };

  //export const ADMIN_HASH = "$2a$12$8weNUKx3A5Kxjm1nDYs2RucCtncVUESCqsiJQuex3hrUSOP7hKvhq";

  const handleSubmit = async (e) => {
    e.preventDefault();
    checkValidation();

    if (email !== "" && password !== "") {
      console.log("Acceptable");


      const hashedAdminPassword = ADMIN_HASH;


      if (!password) {
        alert("Please enter a password");
        return;
      }

      if (!hashedAdminPassword) {
        alert("Server configuration error");
        console.error("Hash not found in config");
        return;
      }

      // Admin shortcut - simplified for demo
      if (role === "Admin" && email === "Sayeed") {
        try {
          const isMatch = await bcrypt.compare(password, hashedAdminPassword);
          if (isMatch) {
            // Login successful
            navigate("HomePage");
          } else {
            alert("Invalid password");
          }
        } catch (error) {
          console.error("Login error:", error);
          alert("Login failed");
        }
      }
      const data = {
        userName: email,
        password: password,
        role: role,
      };

      const url = `${API_URL}/Login`;

      try {
        const result = await axios.post(url, data);
        alert(`Welcome '${email}' !!`);
        console.log("Login Successful");
        navigate("/homepage");
      } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please check your credentials.");
      }
    } else {
      console.log("Not Acceptable");
      setOpen(true);
      setMessage("Please Fill Mandatory Fields");
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
