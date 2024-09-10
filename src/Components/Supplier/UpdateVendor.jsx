import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue, update } from 'firebase/database';
import { FaUserEdit, FaPhone, FaMoneyBillAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './UpdateVendor.css';

export default function UpdateVendor() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    balance: '',
  });

  useEffect(() => {
    const vendorRef = ref(db, 'Vendors');
    onValue(vendorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const vendorList = Object.keys(data).map(id => ({ id, ...data[id] }));
        setVendors(vendorList);
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

  const handleVendorSelect = (e) => {
    const vendorId = e.target.value;
    const vendor = vendors.find((v) => v.id === vendorId);
    if (vendor) {
      setSelectedVendor(vendorId);
      setFormData({
        name: vendor.name,
        contact: vendor.contact,
        balance: vendor.balance,
      });
    }
  };

  const handleUpdateVendor = (e) => {
    e.preventDefault();
    if (!selectedVendor) return;

    const vendorRef = ref(db, `Vendors/${selectedVendor}`);
    update(vendorRef, formData)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Vendor updated successfully!',
          timer: 3000,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update vendor.',
        });
        console.error('Error updating vendor:', err);
      });
  };

  return (
    <div className="update-vendor-container">
      <h2 className="update-vendor-title">Update Vendor</h2>
      
      <div className="update-vendor-form">
        <div className="update-vendor-dropdown">
          <label htmlFor="vendor-select">Select Vendor</label>
          <select id="vendor-select" onChange={handleVendorSelect}>
            <option value="">-- Select Vendor --</option>
            {vendors.map(vendor => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        {selectedVendor && (
          <form onSubmit={handleUpdateVendor} className="vendor-form">
            <div className="form-group">
              <FaUserEdit className="icon" />
              <input
                type="text"
                name="name"
                placeholder="Vendor Name"
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
              Update Vendor
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
