import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Spinner,
  Form,
  Modal,
  Alert,
  Card,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";

const ItemDataTable = () => {
  const [itemData, setitemData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [showModal, setShowModal] = useState(false);
  const [selecteditem, setSelecteditem] = useState(null);
  const [categories, setcategories] = useState([]);
  const [subcategories, setsubcategories] = useState([]);
  const [selectedCategory, setselectedCategory] = useState("");
  const [selectedSubCategory, setselectedSubCategory] = useState("");
  const [iscategoryLoading, setcategoryLoading] = useState(false);
  const [issubCategoryLoading, setsubCategoryLoading] = useState(false);

  // API base URL
  const URL = API_URL;

  // Form state for the modal - matching the API field names
  const [formData, setFormData] = useState({
    itemCode: 0,
    itemName: "",
    catName: 0,
    subCatName: 0,
    openingStock: 0,
    reorderStock: 0,
    maxStock: 0,
    prefAlt: "",
    hScode: "",
    isActive: true,
    createdAT: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchcategories();
  }, []);

  useEffect(() => {
    filteritemData();
  }, [searchTerm, itemData, selectedCategory, selectedSubCategory]);

  // Reset form when modal opens
  useEffect(() => {
    if (showModal) {
      if (selecteditem) {
        // Edit mode - populate form with selected item data
        setFormData({
          itemCode: selecteditem.itemCode || 0,
          itemName: selecteditem.itemName || "",
          catName: selecteditem.catName || "", // This should be categoryID
          subCatName: selecteditem.subCatName || "", // This should be subCatID
          openingStock: selecteditem.openingStock || 0,
          reorderStock: selecteditem.reorderStock || 0,
          maxStock: selecteditem.maxStock || 0,
          prefAlt: selecteditem.prefAlt || "",
          hScode: selecteditem.hScode || "",
          isActive:
            selecteditem.isActive !== undefined ? selecteditem.isActive : true,
          createdAT: selecteditem.createdAT
            ? selecteditem.createdAT.split("T")[0]
            : new Date().toISOString().split("T")[0],
        });

        // Fetch subcategories for the selected item's category
        if (selecteditem.catName) {
          fetchsubcategories(selecteditem.catName); // catName should be categoryID
        }
      } else {
        // Add mode - reset form
        setFormData({
          itemCode: 0,
          itemName: "",
          catName: "",
          subCatName: "",
          openingStock: 0,
          reorderStock: 0,
          maxStock: 0,
          prefAlt: "",
          hScode: "",
          isActive: true,
          createdAT: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [showModal, selecteditem, categories]);

  // Separate function to handle filtering logic
  const filteritemData = () => {
    let result = [...itemData];

    // Filter data based on search term
    if (searchTerm.trim() !== "") {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          (item.itemName || "").toLowerCase().includes(lowercasedSearch) ||
          (item.catName || "").toLowerCase().includes(lowercasedSearch) ||
          (item.subCatName || "").toLowerCase().includes(lowercasedSearch) ||
          (item.itemCode || "").toString().includes(lowercasedSearch)
      );
    }

    // Update the filtered data state
    setFilteredData(result);
    console.log(result);
  };

  const fetchitemData = async (subCatName) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching data from:", `${URL}/ItemSearchbyCatInfo`);

      const response = await axios.post(`${URL}/ItemSearchbyCatInfo`, {
        id: subCatName,
      });
      console.log("API Response:", response);

      // Check if data exists and has the correct structure
      if (response.data && response.data.isSuccess) {
        // The API returns ereadInformation (note the capital I)
        if (Array.isArray(response.data.itemsearchInformationByCat)) {
          setitemData(response.data.itemsearchInformationByCat);
          setFilteredData(response.data.itemsearchInformationByCat);
          console.log(
            "item data loaded:",
            response.data.itemsearchInformationByCat
          );
        } else {
          console.error("Unexpected response format:", response.data);
          throw new Error("Unexpected data format received from API");
        }
      } else {
        console.error("API response indicates failure:", response.data);
        throw new Error(
          response.data?.message || "Failed to retrieve item data"
        );
      }
    } catch (err) {
      console.error("Error fetching item data:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while fetching data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdditem = async (itemData) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${URL}/ItemCreateInfo`, itemData);
      console.log(response);
      if (response.data && response.data.isSuccess) {
        fetchitemData(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to add item");
      }
    } catch (err) {
      console.error("Error adding item:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while adding item"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateitem = async (itemData) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`${URL}/ItemUpInfo`, {
        itemCode: itemData.itemCode,
        itemName: itemData.itemName,
        catName: itemData.catName,
        subCatName: itemData.subCatName,
        openingStock: itemData.openingStock,
        reorderStock: itemData.reorderStock,
        maxStock: itemData.maxStock,
        prefAlt: itemData.prefAlt,
        hScode: itemData.hScode,
        isActive: itemData.isActive,
        createdAT: new Date().toISOString().split("T")[0],
      });

      if (response.status === 200) {
        fetchitemData(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update item");
      }
    } catch (err) {
      console.error("Error updating item:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while updating item"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteitem = async (itemCode) => {
    try {
      setIsLoading(true);

      const response = await axios.post(`${URL}/ItemDeleteInfo`, {
        id: itemCode,
      });

      if (response.status === 200) {
        fetchitemData(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to delete item");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while deleting item"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = a[key] || "";
      const bValue = b[key] || "";

      if (aValue < bValue) {
        return direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(sortedData);
  };

  const handleEdit = (item) => {
    setSelecteditem(item);
    setShowModal(true);
  };

  const handleDelete = (itemCode) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      handleDeleteitem(itemCode);
    }
  };

  const handleSaveitem = (formData) => {
    const itemData = {
      itemCode: formData.itemCode,
      itemName: formData.itemName,
      catName: formData.catName,
      subCatName: formData.subCatName, // lowercase 'n' to match API
      openingStock: parseInt(formData.openingStock) || 0,
      reorderStock: parseInt(formData.reorderStock) || 0,
      maxStock: parseInt(formData.maxStock) || 0,
      prefAlt: formData.prefAlt,
      hScode: formData.hScode,
      isActive: formData.isActive,
      createdAT: formData.createdAT,
    };
    

    if (selecteditem) {
      // Update existing item
      handleUpdateitem({
        ...itemData,
        itemCode: selecteditem.itemCode,
      }).then((success) => {
        if (success) {
          alert("item updated successfully!");
          setShowModal(false);
        }
      });
    } else {
      // Add new item
      handleAdditem(itemData).then((success) => {
        if (success) {
          alert("item added successfully!");
          setShowModal(false);
        }
      });
    }
  };

  const fetchcategories = async () => {
    try {
      setcategoryLoading(true);
      setError(null);

      const response = await axios.get(`${URL}/ItemCatInfoView`);

      if (response.data && response.data.isSuccess) {
        if (Array.isArray(response.data.itemcatreadinformation)) {
          setcategories(response.data.itemcatreadinformation);
          console.log(
            "categories loaded:",
            response.data.itemcatreadinformation
          );
        } else {
          throw new Error("Unexpected data format received from API");
        }
      } else {
        throw new Error(
          response.data?.message || "Failed to retrieve category data"
        );
      }
    } catch (err) {
      console.error("Error fetching category data:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while fetching categories"
      );
    } finally {
      setcategoryLoading(false);
    }
  };

  const fetchsubcategories = async (categoriesId) => {
    if (!categoriesId) {
      setsubcategories([]);
      return;
    }

    try {
      setsubCategoryLoading(true);
      setError(null);

      console.log("Fetching subcategories for category ID:", categoriesId);

      const response = await axios.post(`${URL}/SubCatSearchbyCatInfo`, {
        id: categoriesId,
      });

      if (response.data && response.data.isSuccess) {
        // Use the correct field name from the response
        if (Array.isArray(response.data.subcatsearchinformationByCat)) {
          setsubcategories(response.data.subcatsearchinformationByCat);
          console.log(
            "subcategories loaded:",
            response.data.subcatsearchinformationByCat
          );
        } else {
          console.error(
            "Unexpected data format received from API:",
            response.data
          );
          throw new Error("Unexpected data format received from API");
        }
      } else {
        throw new Error(
          response.data?.message || "Failed to retrieve subCategory data"
        );
      }
    } catch (err) {
      console.error("Error fetching subCategory data:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while fetching subcategories"
      );
      // Set empty subcategories array to avoid UI issues
      setsubcategories([]);
    } finally {
      setsubCategoryLoading(false);
    }
  };

  const handlecategoryChange = (e) => {
    const categoryId = e.target.value;
    setselectedCategory(categoryId);
    console.log("Selected category ID:", categoryId);

    // Reset subCategory selection when category changes
    setselectedSubCategory("");

    // Call fetchsubcategories with the selected category's ID
    if (categoryId) {
      fetchsubcategories(categoryId);
    } else {
      setsubcategories([]);
    }
  };

  const handlesubCategoryChange = (e) => {
    const subCategoryId = e.target.value;
    setselectedSubCategory(subCategoryId);
    console.log("Selected subCategory ID:", subCategoryId);

    if (subCategoryId) {
      fetchitemData(subCategoryId);
    } else {
      setitemData([]);
    }
  };

  const clearFilters = () => {
    setselectedCategory("");
    setselectedSubCategory("");
    setSearchTerm("");
    setsubcategories([]);
    // This will trigger the useEffect to reset the filtered data
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return "⇵";
    }
    return sortConfig.direction === "ascending" ? "↑" : "↓";
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // When category changes in modal form, fetch subcategories
    if (name === "catName" && value) {

      
      const category = categories.find((s) => s.categoryName === value);
      if (category) {
        console.log(category.categoryID);
        fetchsubcategories(category.categoryID);
        
      } // value is the categoryID
    }
  };

  if (iscategoryLoading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading item data...</p>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        /* Complete Glass UI Styles */

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

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Animated background wrapper */
        .animated-background {
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #1e3c72 95%,
            #2a5298 75%,
            #3498db 50%,
            #74b9ff 25%,
            #0984e3 5%
          );
          background-size: 400% 400%;
          animation: blueWave 10s ease infinite;
          padding: 2rem 0;
        }

        /* Enhanced card styles with glassmorphism */
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .glass-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #74b9ff, #0984e3, #74b9ff);
          background-size: 200% 100%;
          animation: shimmer 2s infinite; /*card up animation*/
        }

        .glass-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          border-color: rgba(116, 185, 255, 0.3);
        }

        /* Enhanced header */
        .glass-header {
          background: rgba(116, 185, 255, 0.2);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        /* Enhanced buttons */
        .glass-btn {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          color: white !important;
          backdrop-filter: blur(10px);
          border-radius: 8px;
          font-weight: 500;
          padding: 0.75rem 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .glass-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .glass-btn:hover::before {
          left: 100%;
        }

        .glass-btn:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .glass-btn-success {
          background: rgba(40, 167, 69, 0.2) !important;
          border-color: rgba(40, 167, 69, 0.3) !important;
        }

        .glass-btn-success:hover {
          background: rgba(40, 167, 69, 0.4) !important;
          border-color: rgba(40, 167, 69, 0.6) !important;
          color: white !important;
        }

        .glass-btn-danger {
          background: rgba(220, 53, 69, 0.2) !important;
          border-color: rgba(220, 53, 69, 0.3) !important;
        }

        .glass-btn-danger:hover {
          background: rgba(220, 53, 69, 0.4) !important;
          border-color: rgba(220, 53, 69, 0.6) !important;
          color: white !important;
        }

        .glass-btn.btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
          border: 1px solid rgba(59, 130, 246, 0.3) !important;
          color: white !important;
        }

        .glass-btn.btn-primary:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .glass-btn.btn-secondary {
          background: rgba(75, 85, 99, 0.8) !important;
          border: 1px solid rgba(107, 114, 128, 0.3) !important;
        }

        .glass-btn.btn-secondary:hover {
          background: rgba(107, 114, 128, 0.9) !important;
        }

        /* Enhanced form controls */
        .glass-form-control {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          color: white !important;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .glass-form-control:focus {
          background: rgba(255, 255, 255, 0.15) !important;
          border-color: rgba(59, 130, 246, 0.6) !important;
          box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
          color: white !important;
          outline: none;
        }

        .glass-form-control::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        .glass-form-control option {
          background: #374151 !important;
          color: white !important;
        }

        .glass-form-control[type="date"] {
          color-scheme: dark;
        }

        .glass-form-control[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.8;
        }

        /* Enhanced table */
        .glass-table {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-table th {
          background: rgba(116, 185, 255, 0.2);
          color: white;
          border-color: rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .glass-table th:hover {
          background: rgba(116, 185, 255, 0.3);
        }

        .glass-table td {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border-color: rgba(255, 255, 255, 0.1);
          transition: background 0.3s ease;
        }

        .glass-table tbody tr:hover td {
          background: rgba(116, 185, 255, 0.1);
        }

        /* DARK GLASS MODAL - Main Styles */
        .glass-modal .modal-content {
          background: linear-gradient(
            135deg,
            rgba(45, 55, 72, 0.95),
            rgba(55, 65, 81, 0.95)
          ) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          animation: slideIn 0.3s ease-out;
        }

        .glass-modal .modal-header {
          background: transparent !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 1.5rem;
        }

        .glass-modal .modal-title {
          color: white !important;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .glass-modal .btn-close {
          background: none !important;
          border: none !important;
          color: white !important;
          font-size: 1.5rem;
          opacity: 0.7;
          filter: brightness(0) invert(1);
        }

        .glass-modal .btn-close:hover {
          opacity: 1;
        }

        .glass-modal .modal-body {
          background: transparent !important;
          border: none !important;
          padding: 1.5rem;
        }

        .glass-modal .form-label {
          color: white !important;
          font-weight: 500;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .glass-modal .form-check-label {
          color: white !important;
          font-weight: 500;
        }

        .glass-modal .form-check-input:checked {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }

        .glass-modal .modal-footer {
          background: transparent !important;
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 1.5rem;
        }

        /* Scrollbar Styling for Modal */
        .glass-modal .modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .glass-modal .modal-body::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .glass-modal .modal-body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }

        .glass-modal .modal-body::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Enhanced alert */
        .glass-alert {
          background: rgba(248, 215, 218, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(245, 198, 203, 0.3);
          color: white;
          border-radius: 8px;
        }

        /* Text colors for better visibility */
        .text-white-custom {
          color: white !important;
        }

        .text-muted-custom {
          color: rgba(255, 255, 255, 0.7) !important;
        }
      `}</style>

      <div className="animated-background">
        <Container fluid className="p-4">
          {error && (
            <Alert
              variant="danger"
              className="mb-4 glass-alert"
              dismissible
              onClose={() => setError(null)}
            >
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
              <Button
                variant="outline-danger"
                className="glass-btn glass-btn-danger"
                onClick={fetchitemData}
              >
                Retry
              </Button>
            </Alert>
          )}

          <Card className="glass-card">
            <Card.Header className="glass-header">
              <h2 className="mb-0">Item Information Management</h2>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="glass-form-control"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <div className="position-relative">
                      <Form.Control
                        as="select"
                        className="glass-form-control"
                        onChange={handlecategoryChange}
                        disabled={iscategoryLoading}
                        value={selectedCategory}
                      >
                        <option value="">
                          {iscategoryLoading ? "Loading..." : "All categories"}
                        </option>
                        {categories.map((category) => (
                          <option
                            key={category.categoryID}
                            value={category.categoryID}
                            style={{ background: "#2a5298", color: "white" }}
                          >
                            {category.categoryName}
                          </option>
                        ))}
                      </Form.Control>
                      {iscategoryLoading && (
                        <Spinner
                          animation="border"
                          size="sm"
                          className="position-absolute"
                          style={{ right: "10px", top: "10px", color: "white" }}
                        />
                      )}
                    </div>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <div className="position-relative">
                      <Form.Control
                        as="select"
                        className="glass-form-control"
                        onChange={handlesubCategoryChange}
                        disabled={issubCategoryLoading || !selectedCategory}
                        value={selectedSubCategory}
                      >
                        <option value="">
                          {issubCategoryLoading
                            ? "Loading..."
                            : "All subcategories"}
                        </option>
                        {subcategories.map((subCategory) => (
                          <option
                            key={subCategory.subCatID}
                            value={subCategory.subCatID}
                            style={{ background: "#2a5298", color: "white" }}
                          >
                            {subCategory.subCatName}
                          </option>
                        ))}
                      </Form.Control>
                      {issubCategoryLoading && (
                        <Spinner
                          animation="border"
                          size="sm"
                          className="position-absolute"
                          style={{ right: "10px", top: "10px", color: "white" }}
                        />
                      )}
                    </div>
                  </Form.Group>
                </Col>
                <Col md={3} className="text-end">
                  <Button
                    variant="success"
                    className="me-2 glass-btn glass-btn-success"
                    onClick={() => {
                      setSelecteditem(null);
                      setShowModal(true);
                    }}
                  >
                    Add New item
                  </Button>
                  <Button
                    variant="secondary"
                    className="me-2 glass-btn md-3"
                    onClick={fetchitemData}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span className="visually-hidden">Loading...</span>
                      </>
                    ) : (
                      "Refresh Data"
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="me-2 mt-2 glass-btn"
                    onClick={clearFilters}
                    disabled={
                      !selectedCategory && !selectedSubCategory && !searchTerm
                    }
                  >
                    Clear Filters
                  </Button>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table striped bordered hover className="glass-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort("itemCode")}>
                        Item Code {renderSortIcon("itemCode")}
                      </th>
                      <th onClick={() => handleSort("itemName")}>
                        item Name {renderSortIcon("itemName")}
                      </th>
                      <th onClick={() => handleSort("categoryName")}>
                        category {renderSortIcon("categoryName")}
                      </th>
                      <th onClick={() => handleSort("subCategoryname")}>
                        subCategory {renderSortIcon("subCategoryname")}
                      </th>
                      <th onClick={() => handleSort("openingStock")}>
                        Opening Stock {renderSortIcon("openingStock")}
                      </th>
                      <th onClick={() => handleSort("reorderStock")}>
                        Reorder Stock {renderSortIcon("reorderStock")}
                      </th>
                      <th onClick={() => handleSort("maxStock")}>
                        Max Stock {renderSortIcon("maxStock")}
                      </th>
                      <th onClick={() => handleSort("prefAlt")}>
                        Pref Alt {renderSortIcon("prefAlt")}
                      </th>
                      <th onClick={() => handleSort("hScode")}>
                        HS Code {renderSortIcon("hScode")}
                      </th>
                      <th onClick={() => handleSort("isActive")}>
                        Active {renderSortIcon("isActive")}
                      </th>
                      <th onClick={() => handleSort("createdAT")}>
                        Created At {renderSortIcon("createdAT")}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item) => (
                        <tr key={item.itemID}>
                          <td>{item.itemCode}</td>
                          <td>{item.itemName}</td>
                          <td>{item.catName}</td>
                          <td>{item.subCatName}</td>
                          <td>{item.openingStock}</td>
                          <td>{item.reorderStock}</td>
                          <td>{item.maxStock}</td>
                          <td>{item.prefAlt}</td>
                          <td>{item.hScode}</td>
                          <td>{item.isActive}</td>
                          <td>{item.createdAT}</td>
                          <td>
                            <Button
                              variant="primary"
                              size="sm"
                              className="me-1 glass-btn"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="glass-btn glass-btn-danger"
                              onClick={() => handleDelete(item.itemCode)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No item data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-between mt-3">
                <div>
                  <small className="text-muted-custom">
                    Total Workers: {filteredData.length}{" "}
                    {filteredData.length !== itemData.length &&
                      `(filtered from ${itemData.length})`}
                  </small>
                </div>
                <div>
                  <small className="text-muted-custom">
                    Last Updated: {new Date().toLocaleString()}
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Modal for Add/Edit item */}
          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            className="glass-modal"
          >
            <Modal.Header>
              <Modal.Title>
                {selecteditem ? "Edit item" : "Add New item"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body
              style={{
                minHeight: "70vh",
                overflowY: "auto",
                padding: "1.5rem",
                position: "relative", // Add this
              }}
            >
              <Form
                style={{
                  maxHeight: "100%",
                  
                  margin: 0,
                  padding: 0,
                  background: "transparent",
                  boxShadow: "none",
                }}
              >
                <Form.Group className="mb-3" style={{ marginTop: 0 }}>
                  <Form.Label>Item Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="itemCode"
                    value={formData.itemCode}
                    onChange={handleInputChange}
                    className="glass-form-control"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" >
                  <Form.Label>item Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleInputChange}
                    className="glass-form-control"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>category</Form.Label>
                  <Form.Control
                    as="select"
                    name="catName"
                    value={formData.catName}
                    onChange={handleInputChange}
                    className="glass-form-control"
                    required
                  >
                    <option
                      value=""
                      style={{ background: "#2a5298", color: "white" }}
                    >
                      Select category
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category.categoryID}
                        value={category.categoryName}
                        style={{ background: "#2a5298", color: "white" }}
                      >
                        {category.categoryName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>subCategory</Form.Label>
                  <Form.Control
                    as="select"
                    name="subCatName"
                    value={formData.subCatName}
                    onChange={handleInputChange}
                    className="glass-form-control"
                    required
                    disabled={!formData.catName}
                  >
                    <option
                      value=""
                      style={{ background: "#2a5298", color: "white" }}
                    >
                      Select subCategory
                    </option>
                    {subcategories.map((subCategory) => (
                      <option
                        key={subCategory.subCatID}
                        value={subCategory.subCatName}
                        style={{ background: "#2a5298", color: "white" }}
                      >
                        {subCategory.subCatName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Opening Stock</Form.Label>
                  <Form.Control
                    type="number"
                    name="openingStock"
                    value={formData.openingStock}
                    onChange={handleInputChange}
                    className="glass-form-control"
                    placeholder="Enter opening stock"
                    min="0"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Reorder Stock</Form.Label>
                  <Form.Control
                    type="number"
                    name="reorderStock"
                    value={formData.reorderStock}
                    onChange={handleInputChange}
                    className="glass-form-control"
                    placeholder="Enter reorder stock"
                    min="0"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Max Stock</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxStock"
                    value={formData.maxStock}
                    onChange={handleInputChange}
                    className="glass-form-control"
                    placeholder="Enter max stock"
                    min="0"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Preferred Alternative</Form.Label>
                  <Form.Control
                    type="text"
                    name="prefAlt"
                    value={formData.prefAlt}
                    onChange={handleInputChange}
                    className="glass-form-control"
                    placeholder="Enter preferred alternative"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>HS Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="hScode"
                    value={formData.hScode}
                    onChange={handleInputChange}
                    className="glass-form-control"
                    placeholder="Enter HS code"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Created Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="createdAT"
                    value={formData.createdAT}
                    onChange={handleInputChange}
                    className="glass-form-control"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isActive"
                    label="Active"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mt-4"
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                className="glass-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="glass-btn"
                onClick={() => handleSaveitem(formData)}
                disabled={
                  !formData.itemName ||
                  !formData.catName || // This will be categoryID
                  !formData.subCatName // This will be subCatID
                }
              >
                {selecteditem ? "Update" : "Add"} item
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </>
  );
};

export default ItemDataTable;
