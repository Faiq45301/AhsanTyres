import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue, update } from 'firebase/database';
import { FaTag, FaRuler, FaBox, FaDollarSign } from 'react-icons/fa';
import Swal from 'sweetalert2'; // Import SweetAlert2
import './UpdateProduct.css';

export default function UpdateProduct() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    item: '',
    size: '',
    quantity: '',
    price: '',
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(productId);
      setFormData({
        item: product.item,
        size: product.size,
        quantity: product.quantity,
        price: product.price,
      });
    }
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const productRef = ref(db, `Products/${selectedProduct}`);
    update(productRef, formData)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Product Updated Successfully!',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      })
      .catch((err) => console.error('Error updating product:', err));
  };

  return (
    <div className="update-product-container">
      <h2 className="update-product-title">Update Product</h2>
      
      <div className="update-product-form">
        <div className="update-product-dropdown">
          <label htmlFor="product-select">Select Product</label>
          <select id="product-select" className="update-product-dropdown-select" onChange={handleProductSelect}>
            <option value="">-- Select Product --</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.item}
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <form onSubmit={handleUpdateProduct} className="update-product-form-content">
            <div className="update-product-form-group">
              <FaTag className="update-product-icon" />
              <input
                type="text"
                name="item"
                placeholder="Item"
                value={formData.item}
                onChange={handleInputChange}
                className="update-product-rounded-input"
                required
              />
            </div>

            <div className="update-product-form-group">
              <FaRuler className="update-product-icon" />
              <input
                type="text"
                name="size"
                placeholder="Size"
                value={formData.size}
                onChange={handleInputChange}
                className="update-product-rounded-input"
                required
              />
            </div>

            <div className="update-product-form-group">
              <FaBox className="update-product-icon" />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="update-product-rounded-input"
                required
              />
            </div>

            <div className="update-product-form-group">
              <FaDollarSign className="update-product-icon" />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleInputChange}
                className="update-product-rounded-input"
                required
              />
            </div>

            <button type="submit" className="update-product-button">
              Update Product
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
