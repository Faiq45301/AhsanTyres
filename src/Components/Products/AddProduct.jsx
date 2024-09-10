import React, { useState } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '../../firebase'; // Ensure this is correctly set up
import { FaBoxOpen, FaRulerCombined, FaAlignLeft, FaDollarSign, FaSortAmountUp } from 'react-icons/fa';
import './AddProduct.css';

const AddProduct = () => {
  const [product, setProduct] = useState({
    item: '',
    size: '',
    description: '',
    price: '',
    quantity: ''
  });
  const [success, setSuccess] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    });
  };

  // Generate random ID for the product (P-001, P-002, etc.)
  const generateProductId = () => {
    return `P-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };

  // Submit form and add product to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    const productId = generateProductId();
    try {
      await set(ref(db, `Products/${productId}`), {
        ...product,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Reset animation after 3 seconds
      setProduct({
        item: '',
        size: '',
        description: '',
        price: '',
        quantity: ''
      });
    } catch (error) {
      console.error('Error adding product: ', error);
    }
  };

  return (
    <div className="add-product-container-add-product">
      <h2 className="form-title-add-product">Add Product</h2>
      <form onSubmit={handleSubmit} className="product-form-add-product">
        <div className="input-group-add-product">
          <FaBoxOpen className="icon-add-product" />
          <input
            type="text"
            name="item"
            placeholder="Item Name"
            value={product.item}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group-add-product">
          <FaRulerCombined className="icon-add-product" />
          <input
            type="text"
            name="size"
            placeholder="Size"
            value={product.size}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group-add-product">
          <FaAlignLeft className="icon-add-product" />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={product.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group-add-product">
          <FaDollarSign className="icon-add-product" />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={product.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group-add-product">
          <FaSortAmountUp className="icon-add-product" />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={product.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="add-button-add-product">Add Product</button>
      </form>

      {success && <div className="success-animation-add-product">Product Added Successfully!</div>}
    </div>
  );
};

export default AddProduct;
