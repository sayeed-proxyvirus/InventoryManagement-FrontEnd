import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

class HomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSubmenu: null,
      inactivityTimer: null,
      ItemTransCount: 0,
      GodownCount: 0,
      SupplierCount: 0,
      ItemsCount: 0,
    };

    // Timeout configuration (in milliseconds)
    this.INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  }

  componentDidMount() {
    // Set up event listeners for user activity
    this.resetInactivityTimer();
    window.addEventListener("mousemove", this.resetInactivityTimer);
    window.addEventListener("keydown", this.resetInactivityTimer);
    this.handleCItemTrans();
    this.handleCGodown();
    this.handleCSupplier();
    this.handleCItems();
  }

  componentWillUnmount() {
    // Clean up event listeners and timer
    window.removeEventListener("mouseMove", this.resetInactivityTimer);
    window.removeEventListener("keydown", this.resetInactivityTimer);

    if (this.state.inactivityTimer) {
      clearTimeout(this.state.inactivityTimer);
    }
  }
  resetInactivityTimer = () => {
    // Clear existing timer
    if (this.state.inactivityTimer) {
      clearTimeout(this.state.inactivityTimer);
    }

    // Set new timer
    const newTimer = setTimeout(() => {
      this.handleSignOut("Session timeout due to inactivity");
    }, this.INACTIVITY_TIMEOUT);

    this.setState({ inactivityTimer: newTimer });
  };

  toggleSubmenu = (menu) => {
    this.setState({
      activeSubmenu: this.state.activeSubmenu === menu ? null : menu,
    });
  };

  handleCItemTrans = async () => {
    try {
      const response = await axios.get(
        `https://localhost:44353/api/CrudApplication/ECReadInformation`
      );

      if (response.data?.isSuccess) {
        this.setState({
          employeeCount: response.data.ecreadInformation[0].count || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching employee data:", err);
      this.setState({
        employeeCount: 0,
      });
    }
  };

  handleCGodown = async () => {
    try {
      const response = await axios.get(
        `https://localhost:44353/api/CrudApplication/WCReadInformation`
      );

      if (response.data?.isSuccess) {
        this.setState({
          workerCount: response.data.wcreadInformation[0].count || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching worker data:", err);
      this.setState({
        workerCount: 0,
      });
    }
  };

  handleCSupplier = async () => {
    try {
      const response = await axios.get(
        `https://localhost:44353/api/CrudApplication/JCReadInformation`
      );

      if (response.data?.isSuccess) {
        this.setState({
          jobCount: response.data.jcreadInformation[0].count || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching jobs data:", err);
      this.setState({
        jobCount: 0,
      });
    }
  };

  handleCItems = async () => {
    try {
      const response = await axios.get(
        `https://localhost:44353/api/CrudApplication/JSCReadInformation`
      );

      if (response.data?.isSuccess) {
        this.setState({
          sectionsCount: response.data.jscreadInformation[0].count || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching employee data:", err);
      this.setState({
        sectionsCount: 0,
      });
    }
  };

  handleSignOut = (message = "Signed out successfully") => {
    // Clear any authentication tokens or user session data
    // For example:
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("userSession");

    // Use navigate prop to redirect to SignIn page
    const { navigate } = this.props;
    navigate("/sign-in", { replace: true });
  };

  render() {
    const {
      activeSubmenu,
      ItemTransCount,
      workerCount,
      jobCount,
      sectionsCount,
    } = this.state;
    const { navigate } = this.props; // Access navigate from props

    return (
      <div className="dashboard-wrapper">
        <style jsx>{`
          /* Reset and base styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            overflow-x: hidden;
          }

          /* Blue gradient animations */
          @keyframes blueWave {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          @keyframes deepBlueFlow {
            0% {
              background-position: 0% 0%;
            }
            50% {
              background-position: 100% 100%;
            }
            100% {
              background-position: 0% 0%;
            }
          }

          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          /* Dashboard wrapper */
          .dashboard-wrapper {
            min-height: 100vh;
            background: linear-gradient(
              135deg,
              #1e3c72 0%,
              #2a5298 25%,
              #3498db 50%,
              #74b9ff 75%,
              #0984e3 100%
            );
            background-size: 400% 400%;
            animation: blueWave 20s ease infinite;
            display: flex;
            gap: 0;
          }

          /* Sidebar */
          .sidebar {
            width: 280px;
            background: linear-gradient(
              180deg,
              #0f2027 0%,
              #203a43 50%,
              #2c5364 100%
            );
            background-size: 100% 300%;
            animation: deepBlueFlow 15s ease infinite;
            box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
            z-index: 1000;
          }

          .sidebar::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              45deg,
              transparent 30%,
              rgba(116, 185, 255, 0.1) 50%,
              transparent 70%
            );
            animation: shimmer 3s infinite;
            pointer-events: none;
          }

          .sidebar-content {
            padding: 1.5rem 1rem;
            height: 100vh;
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: 2;
            overflow: hidden;
          }

          .sidebar-content::-webkit-scrollbar {
            width: 4px;
          }

          .sidebar-content::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
          }

          .sidebar-content::-webkit-scrollbar-thumb {
            background: #74b9ff;
            border-radius: 2px;
          }

          /* Brand */
          .brand {
            text-align: center;
            margin-bottom: 2rem;
            padding: 1rem 0;
            border-bottom: 1px solid rgba(116, 185, 255, 0.3);
          }

          .brand h2 {
            color: #ffffff;
            font-weight: 700;
            font-size: 1.8rem;
            margin: 0;
            text-shadow: 0 0 10px rgba(116, 185, 255, 0.5);
          }

          .brand .highlight {
            color: #74b9ff;
            text-shadow: 0 0 15px rgba(116, 185, 255, 0.8);
          }

          /* Navigation */
          .nav-menu {
            flex: 1;
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .nav-item {
            margin-bottom: 0.25rem;
          }
          .nav-container {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding-right: 4px;
            margin-right: -4px;
          }

          .nav-container::-webkit-scrollbar {
            width: 0px;
            background: transparent;
          }

          .nav-link {
            display: flex;
            align-items: center;
            padding: 0.875rem 1rem;
            color: #ffffff;
            text-decoration: none;
            border-radius: 10px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }

          .nav-link::before {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(116, 185, 255, 0.2),
              transparent
            );
            transition: left 0.5s;
          }

          .nav-link:hover::before {
            left: 100%;
          }

          .nav-link:hover,
          .nav-link.active {
            background: rgba(116, 185, 255, 0.2);
            transform: translateX(8px);
            box-shadow: 0 4px 15px rgba(116, 185, 255, 0.3);
            border-left: 3px solid #74b9ff;
          }

          .nav-icon {
            margin-right: 0.75rem;
            font-size: 1.2rem;
            min-width: 20px;
            transition: all 0.3s ease;
            font-weight: 600; /* Make text icons bolder */
            font-family: "Segoe UI", sans-serif;
          }

          .nav-link:hover .nav-icon {
            color: #74b9ff;
            transform: scale(1.1);
          }

          .nav-text {
            font-weight: 600;
            flex: 1;
            font-size: 0.9rem;
            letter-spacing : 0.02rem;
          }

          .nav-badge {
            background: linear-gradient(45deg, #74b9ff, #0984e3);
            color: #ffffff;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            min-width: 20px;
            text-align: center;
          }

          .chevron {
            margin-left: auto;
            transition: transform 0.3s ease;
            font-size: 0.9rem;
          }

          .nav-link.active .chevron {
            transform: rotate(180deg);
          }

          /* Submenu */
          .submenu {
            list-style: none;
            padding: 0;
            margin: 0;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            margin-top: 0.5rem;
          }

          .submenu.open {
            max-height: 200px;
            padding: 0.5rem 0;
          }

          .submenu-item {
            padding: 0.25rem 0;
            margin-left: 1rem;
            opacity: 0;
            transform: translateX(-20px);
            transition: all 0.3s ease;
          }

          .submenu.open .submenu-item {
            opacity: 1;
            transform: translateX(0);
          }

          .submenu.open .submenu-item:nth-child(1) {
            transition-delay: 0.1s;
          }
          .submenu.open .submenu-item:nth-child(2) {
            transition-delay: 0.2s;
          }
          .submenu.open .submenu-item:nth-child(3) {
            transition-delay: 0.3s;
          }

          .submenu-link {
            display: flex;
            align-items: center;
            padding: 0.5rem 1rem;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            border-radius: 6px;
            transition: all 0.3s ease;
            font-size: 0.9rem;
          }

          .submenu-link:hover {
            background: rgba(116, 185, 255, 0.1);
            color: #74b9ff;
            transform: translateX(4px);
          }

          .feature-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            margin-right: 0.75rem;
            background: #74b9ff;
            box-shadow: 0 0 8px rgba(116, 185, 255, 0.6);
          }

          /* User profile */
          .user-profile {
            margin-top: 0; /* Remove auto margin */
            padding: 1rem;
            border-top: 1px solid rgba(116, 185, 255, 0.3);
            border-radius: 12px;
            background: rgba(116, 185, 255, 0.1);
            backdrop-filter: blur(10px);
            position: sticky;
            bottom: 0;
            z-index: 10;
            /* Add a subtle shadow to separate from content */
            box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1);
          }

          .user-info {
            display: flex;
            align-items: center;
            color: white;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid #74b9ff;
            margin-right: 0.75rem;
            transition: all 0.3s ease;
          }

          .user-profile:hover .user-avatar {
            transform: scale(1.1);
            box-shadow: 0 0 20px rgba(116, 185, 255, 0.5);
          }

          .user-details {
            flex: 1;
          }

          .user-name {
            font-weight: 600;
            font-size: 0.95rem;
          }

          .user-role {
            font-size: 0.8rem;
            opacity: 0.7;
            color: #74b9ff;
          }

          /* Main content */
          .main-content {
            flex: 1;
            padding: 0;
            background: transparent;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }

          /* Header */
          .main-header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding: 1rem 2rem;
            position: sticky;
            top: 0;
            z-index: 100;
          }

          .header-nav {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .header-nav-link {
            padding: 0.75rem 1.5rem;
            color: #ffffff;
            text-decoration: none;
            border-radius: 20px;
            transition: all 0.3s ease;
            font-weight: 500;
            font-size: 0.9rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            overflow: hidden;
          }

          .header-nav-link::before {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(116, 185, 255, 0.3),
              transparent
            );
            transition: left 0.5s;
          }

          .header-nav-link:hover::before {
            left: 100%;
          }

          .header-nav-link:hover,
          .header-nav-link.active {
            background: rgba(116, 185, 255, 0.2);
            box-shadow: 0 4px 15px rgba(116, 185, 255, 0.2);
            transform: translateY(-2px);
            border-color: rgba(116, 185, 255, 0.3);
          }

          /* Dashboard content */
          .dashboard-content {
            flex: 1;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          /* Cards grid */
          .dashboard-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
          }

          .dashboard-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }

          .dashboard-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #74b9ff, #0984e3, #74b9ff);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }

          .dashboard-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            border-color: rgba(116, 185, 255, 0.3);
          }

          .card-icon {
            font-size: 2.5rem;
            color: #74b9ff;
            margin-bottom: 1rem;
            text-shadow: 0 0 20px rgba(116, 185, 255, 0.5);
          }

          .card-title {
            font-size: 1.1rem;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 0.5rem;
            font-weight: 600;
          }

          .card-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.5rem;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          }

          .card-description {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
          }

          /* Main overview card */
          .main-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            flex: 1;
          }

          .main-card h3 {
            color: white;
            margin-bottom: 1rem;
            font-size: 1.5rem;
            font-weight: 600;
          }

          .main-card p {
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
          }

          /* Responsive design */
          @media (max-width: 768px) {
            .sidebar {
              width: 70px;
            }

            .nav-text,
            .nav-badge,
            .user-details {
              display: none;
            }

            .brand h2 {
              font-size: 1rem;
            }

            .dashboard-content {
              padding: 1rem;
            }

            .dashboard-cards {
              grid-template-columns: 1fr;
            }

            .header-nav {
              gap: 0.25rem;
            }

            .header-nav-link {
              padding: 0.5rem 1rem;
              font-size: 0.8rem;
            }
          }

          @media (max-width: 480px) {
            .sidebar {
              width: 60px;
            }

            .main-header {
              padding: 1rem;
            }

            .dashboard-content {
              padding: 1rem;
              gap: 1rem;
            }

            .card-icon {
              font-size: 2rem;
            }

            .card-value {
              font-size: 2rem;
            }
          }
        `}</style>

        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-content">
            <div className="brand">
              <h2>
                <span className="highlight">LTD</span>DOT
              </h2>
            </div>

            <div className="nav-container">
              <ul className="nav-menu">
                <li className="nav-item">
                  <a href="#" className="nav-link active">
                    <span className="nav-icon">⌂</span>
                    <span className="nav-text">Home</span>
                    <span className="nav-badge">4</span>
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    href="#"
                    className={`nav-link ${
                      activeSubmenu === "employee" ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      this.toggleSubmenu("employee");
                    }}
                  >
                    <span className="nav-icon">⚑</span>
                    <span className="nav-text">Employee</span>
                    <span className="chevron">▼</span>
                  </a>
                  <ul
                    className={`submenu ${
                      activeSubmenu === "employee" ? "open" : ""
                    }`}
                  >
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Analytics
                      </a>
                    </li>
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Reports
                      </a>
                    </li>
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Metrics
                        <span
                          className="nav-badge"
                          style={{ marginLeft: "auto" }}
                        >
                          New
                        </span>
                      </a>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <a
                    href="#"
                    className={`nav-link ${
                      activeSubmenu === "worker" ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      this.toggleSubmenu("worker");
                    }}
                  >
                    <span className="nav-icon">⚒</span>
                    <span className="nav-text">Worker</span>
                    <span className="chevron">▼</span>
                  </a>
                  <ul
                    className={`submenu ${
                      activeSubmenu === "worker" ? "open" : ""
                    }`}
                  >
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Analytics
                      </a>
                    </li>
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Reports
                      </a>
                    </li>
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Metrics
                      </a>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <a
                    href="#"
                    className={`nav-link ${
                      activeSubmenu === "job" ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      this.toggleSubmenu("job");
                    }}
                  >
                    <span className="nav-icon">◈</span>
                    <span className="nav-text">Job Section</span>
                    <span className="chevron">▼</span>
                  </a>
                  <ul
                    className={`submenu ${
                      activeSubmenu === "job" ? "open" : ""
                    }`}
                  >
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Analytics
                      </a>
                    </li>
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Reports
                      </a>
                    </li>
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Metrics
                      </a>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <a href="#" className="nav-link">
                    <span className="nav-icon">$</span>
                    <span className="nav-text">Salary</span>
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    href="#"
                    className={`nav-link ${
                      activeSubmenu === "bonus" ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      this.toggleSubmenu("bonus");
                    }}
                  >
                    <span className="nav-icon"> ◆</span>
                    <span className="nav-text">Bonus</span>
                    <span className="chevron">▼</span>
                  </a>
                  <ul
                    className={`submenu ${
                      activeSubmenu === "bonus" ? "open" : ""
                    }`}
                  >
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Bonus Type
                      </a>
                    </li>
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Eid Bonus
                      </a>
                    </li>
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Leave Type
                      </a>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <a
                    href="#"
                    className={`nav-link ${
                      activeSubmenu === "wages" ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      this.toggleSubmenu("wages");
                    }}
                  >
                    <span className="nav-icon">₹</span>
                    <span className="nav-text">Wages</span>
                    <span className="chevron">▼</span>
                  </a>
                  <ul
                    className={`submenu ${
                      activeSubmenu === "wages" ? "open" : ""
                    }`}
                  >
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Wages
                      </a>
                    </li>
                    <li className="submenu-item">
                      <a href="#" className="submenu-link">
                        <span className="feature-dot"></span>
                        Wages Slip
                      </a>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <a href="#" className="nav-link">
                    <span className="nav-icon">⏱</span>
                    <span className="nav-text">Over Time</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="user-profile">
              <div className="user-info">
                <img
                  src="https://via.placeholder.com/40x40/74b9ff/ffffff?text=S"
                  alt="User Avatar"
                  className="user-avatar"
                />
                <div className="user-details">
                  <div className="user-name">Sayeed</div>
                  <div className="user-role">Administrator</div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <header className="main-header">
            <nav className="header-nav">
              <a href="#" className="header-nav-link active">
                Home
              </a>
              <a href="#" className="header-nav-link">
                Features
              </a>
              <a href="#" className="header-nav-link">
                Pricing
              </a>
              <a href="#" className="header-nav-link">
                FAQs
              </a>
              <a href="#" className="header-nav-link">
                About
              </a>
            </nav>
          </header>

          <div className="dashboard-content">
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <div className="card-icon"></div>
                <h3 className="card-title">Total Employees</h3>
                <div className="card-value">{ItemTransCount}</div>
                <p className="card-description">Active employees in system</p>
              </div>

              <div className="dashboard-card">
                <div className="card-icon"></div>
                <h3 className="card-title">Total Workers</h3>
                <div className="card-value">{workerCount}</div>
                <p className="card-description">Active workers in system</p>
              </div>

              <div className="dashboard-card">
                <div className="card-icon"></div>
                <h3 className="card-title">Total Job Sections</h3>
                <div className="card-value">{jobCount}</div>
                <p className="card-description">
                  Active job sections in system
                </p>
              </div>

              <div className="dashboard-card">
                <div className="card-icon"></div>
                <h3 className="card-title">Total Job Designations</h3>
                <div className="card-value">{sectionsCount}</div>
                <p className="card-description">
                  Active job designations in system
                </p>
              </div>
            </div>

            <div className="main-card">
              <h3>Dashboard Overview</h3>
              <p>
                Welcome to your modern blue-themed dashboard. This elegant
                interface provides a comprehensive view of your organization's
                key metrics and performance indicators. The animated gradient
                background creates a dynamic, professional atmosphere while
                maintaining excellent readability and user experience.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

// Wrapper function to provide navigation to the class component
const HomePageWithNavigation = (props) => {
  const navigate = useNavigate();
  return <HomePage {...props} navigate={navigate} />;
};
export default HomePageWithNavigation;
