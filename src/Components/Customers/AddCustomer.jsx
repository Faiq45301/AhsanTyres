import React, { useState } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '../../firebase'; // Ensure this is correctly set up
import { FaUser, FaPhone, FaCar, FaDollarSign } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './addcustomer.css';

const AddCustomer = () => {
  const [customer, setCustomer] = useState({
    name: '',
    contact: '',
    vehicleNumber: '',
    balance: ''
  });

  // Handle input change
  const handleChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value
    });
  };

  // Generate random ID for the customer (C-01, C-02, etc.)
  const generateCustomerId = () => {
    return `C-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };

  // Submit form and add customer to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    const customerId = generateCustomerId();
    try {
      await set(ref(db, `Customers/${customerId}`), {
        ...customer,
      });

      // SweetAlert2 success notification
      Swal.fire({
        icon: 'success',
        title: 'Customer Added Successfully!',
        showConfirmButton: false,
        timer: 2000,
        customClass: {
          popup: 'swal-add-customer-popup', // Custom class for styling
        },
      });

      // Reset form fields
      setCustomer({
        name: '',
        contact: '',
        vehicleNumber: '',
        balance: ''
      });
    } catch (error) {
      console.error('Error adding customer: ', error);
      // Handle error here
    }
  };

  return (
    <div className="customer-form-container-add-customer">
      <h2 className="form-title-add-customer">Add Customer</h2>
      <form onSubmit={handleSubmit} className="customer-form-add-customer">
        <div className="input-group-add-customer">
          <FaUser className="icon-add-customer" />
          <input
            type="text"
            name="name"
            placeholder="Customer Name"
            value={customer.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group-add-customer">
          <FaPhone className="icon-add-customer" />
          <input
            type="text"
            name="contact"
            placeholder="Contact Number"
            value={customer.contact}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group-add-customer">
          <FaCar className="icon-add-customer" />
          <input
            type="text"
            name="vehicleNumber"
            placeholder="Vehicle Number"
            value={customer.vehicleNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group-add-customer">
          <FaDollarSign className="icon-add-customer" />
          <input
            type="number"
            name="balance"
            placeholder="Balance"
            value={customer.balance}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="add-button-add-customer">Add Customer</button>
      </form>
    </div>
  );
};

export default AddCustomer;
