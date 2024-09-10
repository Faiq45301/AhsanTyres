import React, { useState } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '../../firebase'; // Ensure this is correctly set up
import { FaUser, FaPhone, FaDollarSign } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './AddVendor.css'; // Assuming the CSS file will be named addvendor.css

const AddVendor = () => {
  const [vendor, setVendor] = useState({
    name: '',
    contact: '',
    balance: ''
  });

  // Handle input change
  const handleChange = (e) => {
    setVendor({
      ...vendor,
      [e.target.name]: e.target.value
    });
  };

  // Generate random ID for the vendor (V-01, V-02, etc.)
  const generateVendorId = () => {
    return `V-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };

  // Submit form and add vendor to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    const vendorId = generateVendorId();
    try {
      await set(ref(db, `Vendors/${vendorId}`), {
        ...vendor
      });

      // SweetAlert2 Success Notification
      Swal.fire({
        icon: 'success',
        title: 'Vendor Added Successfully!',
        showConfirmButton: false,
        timer: 2000, // Display for 2 seconds
      });

      // Reset form after submission
      setVendor({
        name: '',
        contact: '',
        balance: ''
      });
    } catch (error) {
      console.error('Error adding vendor: ', error);
      
      // SweetAlert2 Error Notification
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'There was an error adding the vendor.',
        showConfirmButton: true,
      });
    }
  };

  return (
    <div className="vendor-form-container">
      <h2 className="form-title">Add Vendor</h2>
      <form onSubmit={handleSubmit} className="vendor-form">
        <div className="input-group">
          <FaUser className="icon" />
          <input
            type="text"
            name="name"
            placeholder="Vendor Name"
            value={vendor.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <FaPhone className="icon" />
          <input
            type="text"
            name="contact"
            placeholder="Contact Number"
            value={vendor.contact}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <FaDollarSign className="icon" />
          <input
            type="number"
            name="balance"
            placeholder="Balance"
            value={vendor.balance}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="add-button">Add Vendor</button>
      </form>
    </div>
  );
};

export default AddVendor;
