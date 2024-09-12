import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Adjust based on your Firebase configuration
import { ref, onValue, remove } from 'firebase/database';
import { FaUser, FaPhone, FaMoneyBill, FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './ViewVendor.css';

export default function ViewVendor() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [filteredVendors, setFilteredVendors] = useState([]);

  // Fetch vendors from Firebase
  useEffect(() => {
    const vendorRef = ref(db, 'Vendors');
    onValue(vendorRef, (snapshot) => {
      const data = snapshot.val();
      const vendorList = data ? Object.keys(data).map(id => ({ id, ...data[id] })) : [];
      setVendors(vendorList);
      setFilteredVendors(vendorList);
    });
  }, []);

  // Handle vendor selection
  const handleSelectVendor = (e) => {
    const selectedId = e.target.value;
    const vendor = vendors.find(v => v.id === selectedId);
    setSelectedVendor(vendor);
  };

  // Handle vendor deletion
  const handleDeleteVendor = () => {
    if (selectedVendor) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          // Delete the vendor if confirmed
          const vendorRef = ref(db, `Vendors/${selectedVendor.id}`);
          remove(vendorRef)
            .then(() => {
              Swal.fire('Deleted!', 'Vendor has been deleted.', 'success');
              setSelectedVendor(null); // Clear the form after deletion
            })
            .catch(err => Swal.fire('Error!', 'Failed to delete the vendor.', 'error'));
        }
      });
    }
  };

  return (
    <div className="view-vendor-container">
      <h2 className="view-vendor-title">View Vendor</h2>

      {/* Vendor Dropdown */}
      <div className="dropdown-container">
        <select className="dropdown" onChange={handleSelectVendor} value={selectedVendor ? selectedVendor.id : ''}>
          <option value="">Select a Vendor</option>
          {filteredVendors.map(vendor => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name}
            </option>
          ))}
        </select>
      </div>

      {selectedVendor && (
        <div className="vendor-details">
          {/* Name Field */}
          <div className="input-group">
            <FaUser className="icon" />
            <input type="text" value={selectedVendor.name} readOnly className="rounded-input" placeholder="Name" />
          </div>

          {/* Contact Field */}
          <div className="input-group">
            <FaPhone className="icon" />
            <input type="text" value={selectedVendor.contact} readOnly className="rounded-input" placeholder="Contact" />
          </div>

          {/* Balance Field */}
          <div className="input-group">
            <FaMoneyBill className="icon" />
            <input type="text" value={selectedVendor.balance} readOnly className="rounded-input" placeholder="Balance" />
          </div>

          {/* Delete Button */}
          <button className="delete-button" onClick={handleDeleteVendor}>
            <FaTrashAlt /> Delete Vendor
          </button>
        </div>
      )}
    </div>
  );
}
