import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue, update } from 'firebase/database';
import { FaUserEdit, FaPhone, FaCar, FaMoneyBillAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './UpdateCustomer.css';

export default function UpdateCustomer() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    vehicleNumber: '',
    balance: '',
  });

  useEffect(() => {
    const customerRef = ref(db, 'Customers');
    onValue(customerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const customerList = Object.keys(data).map(id => ({ id, ...data[id] }));
        setCustomers(customerList);
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customerId);
      setFormData({
        name: customer.name,
        contact: customer.contact,
        vehicleNumber: customer.vehicleNumber,
        balance: customer.balance,
      });
    }
  };

  const handleUpdateCustomer = (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const customerRef = ref(db, `Customers/${selectedCustomer}`);
    update(customerRef, formData)
      .then(() => {
        // SweetAlert2 Success Alert
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Customer updated successfully!',
          showConfirmButton: false,
          timer: 3000,
        });
      })
      .catch((err) => {
        // SweetAlert2 Error Alert
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update customer.',
        });
        console.error('Error updating customer:', err);
      });
  };

  return (
    <div className="update-customer-container">
      <h2 className="update-customer-title">Update Customer</h2>
      
      <div className="update-customer-form">
        <div className="update-customer-dropdown">
          <label htmlFor="customer-select">Select Customer</label>
          <select id="customer-select" onChange={handleCustomerSelect}>
            <option value="">-- Select Customer --</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCustomer && (
          <form onSubmit={handleUpdateCustomer} className="customer-form">
            <div className="form-group">
              <FaUserEdit className="icon" />
              <input
                type="text"
                name="name"
                placeholder="Customer Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <FaPhone className="icon" />
              <input
                type="text"
                name="contact"
                placeholder="Contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <FaCar className="icon" />
              <input
                type="text"
                name="vehicleNumber"
                placeholder="Vehicle Number"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <FaMoneyBillAlt className="icon" />
              <input
                type="number"
                name="balance"
                placeholder="Balance"
                value={formData.balance}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="update-button">
              Update Customer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
