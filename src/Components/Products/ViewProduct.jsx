import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Adjust based on your Firebase configuration
import { ref, onValue, remove } from 'firebase/database';
import { FaTag, FaBox, FaSortAmountUp, FaDollarSign, FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './ViewProduct.css'; // CSS file to style the component

export default function ViewProduct() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products from Firebase
  useEffect(() => {
    const productRef = ref(db, 'Products');
    onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map(id => ({ id, ...data[id] }));
        setProducts(productList);
      }
    });
  }, []);

  // Handle product selection
  const handleSelectProduct = (e) => {
    const selectedId = e.target.value;
    const product = products.find(p => p.id === selectedId);
    setSelectedProduct(product);
  };

  // Calculate total (quantity * price)
  const calculateTotal = (quantity, price) => {
    const qty = parseFloat(quantity) || 0;
    const prc = parseFloat(price) || 0;
    return qty * prc;
  };

  // Handle product deletion with SweetAlert2 confirmation
  const handleDeleteProduct = () => {
    if (selectedProduct) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          const productRef = ref(db, `Products/${selectedProduct.id}`);
          remove(productRef)
            .then(() => {
              Swal.fire('Deleted!', 'Product has been deleted.', 'success');
              setSelectedProduct(null); // Clear selection after deletion
            })
            .catch(err => {
              Swal.fire('Error!', 'Failed to delete the product.', 'error');
            });
        }
      });
    }
  };

  return (
    <div className="view-product-container">
      <h2 className="view-product-title">View Product</h2>

      {/* Product Dropdown */}
      <div className="dropdown-container view-product-dropdown-container">
        <select className="dropdown view-product-dropdown" onChange={handleSelectProduct} value={selectedProduct ? selectedProduct.id : ''}>
          <option value="">Select a Product</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.item}
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <div className="product-details view-product-product-details">
          {/* Item Field */}
          <div className="input-group view-product-input-group">
            <FaTag className="icon view-product-icon" />
            <input type="text" value={selectedProduct.item} readOnly className="rounded-input view-product-rounded-input" placeholder="Item" />
          </div>

          {/* Size Field */}
          <div className="input-group view-product-input-group">
            <FaBox className="icon view-product-icon" />
            <input type="text" value={selectedProduct.size} readOnly className="rounded-input view-product-rounded-input" placeholder="Size" />
          </div>

          {/* Quantity Field */}
          <div className="input-group view-product-input-group">
            <FaSortAmountUp className="icon view-product-icon" />
            <input type="text" value={selectedProduct.quantity} readOnly className="rounded-input view-product-rounded-input" placeholder="Quantity" />
          </div>

          {/* Price Field */}
          <div className="input-group view-product-input-group">
            <FaDollarSign className="icon view-product-icon" />
            <input type="text" value={selectedProduct.price} readOnly className="rounded-input view-product-rounded-input" placeholder="Price" />
          </div>

          {/* Total Field */}
          <div className="input-group view-product-input-group">
            <FaDollarSign className="icon view-product-icon" />
            <input
              type="text"
              value={calculateTotal(selectedProduct.quantity, selectedProduct.price)}
              readOnly
              className="rounded-input view-product-rounded-input"
              placeholder="Total"
            />
          </div>

          {/* Delete Button */}
          <button className="delete-button view-product-delete-button" onClick={handleDeleteProduct}>
            <FaTrashAlt /> Delete Product
          </button>
        </div>
      )}
    </div>
  );
}
