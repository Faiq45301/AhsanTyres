import React, { useState } from 'react';
import './App.css';
import AddCustomer from "./Components/Customers/AddCustomer";
import AddProduct from './Components/Products/AddProduct';
import AddVendor from './Components/Supplier/AddVendor';
import ViewCustomer from './Components/Customers/ViewCustomer';
import ViewVendor from './Components/Supplier/ViewVendor';
import ViewProduct from './Components/Products/ViewProduct';
import SaleOrder from './Components/Orders/SaleOrder';
import PurchaseOrder from './Components/Orders/PurchaseOrder';
import CustomerPayment from './Components/Transaction/CustomerPayment';
import VendorPayment from './Components/Transaction/VendorPayment';
import THistory from './Components/Transaction/THistory';
import UpdateCustomer from './Components/Customers/UpdateCustomer';
import UpdateVendor from './Components/Supplier/UpdateVendor';
import UpdateProduct from './Components/Products/UpdateProduct';
import Dashboard from './Components/Customers/Dashboard';


import {
  FaUser, FaPlus, FaEye, FaEdit, FaBox, FaStore,
  FaShoppingCart, FaMoneyCheckAlt, FaHistory, FaBars, FaTimes
} from 'react-icons/fa';
function App() {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const handleMenuItemClick = (submenuItem) => 
  {
    setSelectedContent(submenuItem.label); // Set the selected content
    setSidebarVisible(false); // Close the sidebar after selecting an item (optional)
  };

  return (
    <div className="app-container">
      <div className="hamburger-container">
        <button className="hamburger-icon" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <FaBars />
        </button>
      </div>
      <div className={`sidebar-container ${isSidebarVisible ? 'visible' : ''}`}>
        <button className="close-icon" onClick={toggleSidebar} aria-label="Close Sidebar">
          <FaTimes />
        </button>
        <aside className="sidebar">
          <h4 className="sidebar-header">Dashboard</h4>
          <nav>
            {menuItems.map(item => (
              <div className="menu-item" key={item.title}>
                <div className="menu-title">
                  <item.icon className="menu-icon" />
                  <span className="menu-text">{item.title}</span>
                </div>
                <div className="submenu">
                  {item.submenu.map(sub => (
                    <button
                      className="submenu-item"
                      key={sub.label}
                      aria-label={sub.label}
                      onClick={() => handleMenuItemClick(sub)} // Handle click
                    >
                      <sub.icon className="submenu-icon" />
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>
      </div>
      <main className="content">
        {/* Conditionally render content based on the selected submenu item */}
        {renderContent(selectedContent)}
      </main>
    </div>
  );
}

// Function to render content based on the selected submenu item
const renderContent = (content) => {
  switch (content) {
    case 'Add Customer':
      return <div> <AddCustomer/></div>;
    case 'View Customer':
      return <div><ViewCustomer/></div>;
    case 'Update Customer':
      return <div><UpdateCustomer/></div>;
    case 'Add Vendor':
      return <div><AddVendor/></div>;
    case 'View Vendor':
      return <div><ViewVendor/></div>;
    case 'Update Vendor':
      return <div><UpdateVendor/></div>;
    case 'Add Product':
      return <div><AddProduct/></div>;
    case 'View Product':
      return <div><ViewProduct/></div>;
    case 'Update Product':
      return <div><UpdateProduct/></div>;
    case 'Purchase Order':
      return <div><PurchaseOrder/></div>;
    case 'Sale Order':
      return <div><SaleOrder/></div>;
    case 'Customer Payment':
      return <div><CustomerPayment/></div>;
    case 'Supplier Payment':
      return <div><VendorPayment/></div>;
    case 'Transaction History':
      return <div><THistory/></div>;
    default:
      return <Dashboard/>
  }
};

const menuItems = [
  {
    title: 'Customer',
    icon: FaUser,
    submenu: [
      { label: 'Add Customer', icon: FaPlus },
      { label: 'View Customer', icon: FaEye },
      { label: 'Update Customer', icon: FaEdit }
    ]
  },
  {
    title: 'Vendors',
    icon: FaStore,
    submenu: [
      { label: 'Add Vendor', icon: FaPlus },
      { label: 'View Vendor', icon: FaEye },
      { label: 'Update Vendor', icon: FaEdit }
    ]
  },
  {
    title: 'Products',
    icon: FaBox,
    submenu: [
      { label: 'Add Product', icon: FaPlus },
      { label: 'View Product', icon: FaEye },
      { label: 'Update Product', icon: FaEdit }
    ]
  },
  {
    title: 'Orders',
    icon: FaShoppingCart,
    submenu: [
      { label: 'Purchase Order', icon: FaPlus },
      { label: 'Sale Order', icon: FaPlus }
    ]
  },
  {
    title: 'Transaction',
    icon: FaMoneyCheckAlt,
    submenu: [
      { label: 'Customer Payment', icon: FaPlus },
      { label: 'Supplier Payment', icon: FaPlus },
      { label: 'Transaction History', icon: FaHistory }
    ]
  }
];

export default App;
