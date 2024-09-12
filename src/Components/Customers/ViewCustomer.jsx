import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Adjust based on your Firebase configuration
import { ref, onValue, remove } from 'firebase/database';
import { FaUser, FaPhone, FaCar, FaMoneyBill, FaTrashAlt } from 'react-icons/fa';
import swal from 'sweetalert'; // Import SweetAlert
import './ViewCustomer.css';

export default function ViewCustomer() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch customers from Firebase
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

  // Handle customer selection
  const handleSelectCustomer = (e) => {
    const selectedId = e.target.value;
    const customer = customers.find(c => c.id === selectedId);
    setSelectedCustomer(customer);
  };

  // Handle customer deletion with SweetAlert confirmation
  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      swal({
        title: "Are you sure?",
        text: "You will not be able to revert this action!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          const customerRef = ref(db, `Customers/${selectedCustomer.id}`);
          remove(customerRef)
            .then(() => {
              swal("Deleted!", "Customer has been deleted successfully.", "success");
              setSelectedCustomer(null); // Clear the form after deletion
            })
            .catch(err => {
              swal("Error!", "Failed to delete the customer.", "error");
              console.error('Error deleting customer:', err);
            });
        } else {
          swal("Cancelled", "Customer deletion was cancelled", "info");
        }
      });
    }
  };

  return (
    <div className="view-customer-container">
      <h2 className="view-customer-title">View Customer</h2>

      {/* Customer Dropdown */}
      <div className="dropdown-container">
        <select className="dropdown" onChange={handleSelectCustomer} value={selectedCustomer ? selectedCustomer.id : ''}>
          <option value="">Select a Customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCustomer && (
        <div className="customer-details">
          {/* Name Field */}
          <div className="input-group">
            <FaUser className="icon" />
            <input type="text" value={selectedCustomer.name} readOnly className="rounded-input" placeholder="Name" />
          </div>

          {/* Contact Field */}
          <div className="input-group">
            <FaPhone className="icon" />
            <input type="text" value={selectedCustomer.contact} readOnly className="rounded-input" placeholder="Contact" />
          </div>

          {/* Vehicle Number Field */}
          <div className="input-group">
            <FaCar className="icon" />
            <input type="text" value={selectedCustomer.vehicleNumber} readOnly className="rounded-input" placeholder="Vehicle Number" />
          </div>

          {/* Balance Field */}
          <div className="input-group">
            <FaMoneyBill className="icon" />
            <input type="text" value={selectedCustomer.balance} readOnly className="rounded-input" placeholder="Balance" />
          </div>

          {/* Delete Button */}
          <button className="delete-button" onClick={handleDeleteCustomer}>
            <FaTrashAlt /> Delete Customer
          </button>
        </div>
      )}
    </div>
  );
}
