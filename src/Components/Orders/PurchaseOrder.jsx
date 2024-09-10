import React, { useState, useEffect } from 'react';
import { ref, onValue, set, update } from 'firebase/database';
import { db } from '../../firebase';
import Swal from 'sweetalert2';
import './PurchaseOrder.css'; // Optional CSS file for styling

export default function PurchaseOrder() {
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [newProduct, setNewProduct] = useState({
    item: '',
    size: '',
    price: '',
    quantity: ''
  });
  const [vendorBalance, setVendorBalance] = useState(0);

  useEffect(() => {
    // Fetch vendors from Firebase
    const vendorRef = ref(db, 'Vendors');
    onValue(vendorRef, (snapshot) => {
      const vendorData = snapshot.val();
      const vendorList = vendorData ? Object.keys(vendorData).map((key) => ({
        id: key,
        ...vendorData[key],
      })) : [];
      setVendors(vendorList);
    });

    // Fetch existing products from Firebase
    const productRef = ref(db, 'Products');
    onValue(productRef, (snapshot) => {
      const productData = snapshot.val();
      const productList = productData ? Object.keys(productData).map((key) => ({
        id: key,
        ...productData[key],
      })) : [];
      setProducts(productList);
    });
  }, []);

  const handleVendorChange = (e) => {
    const selectedVendorId = e.target.value;
    setSelectedVendor(selectedVendorId);

    // Fetch vendor balance
    const vendorRef = ref(db, `Vendors/${selectedVendorId}`);
    onValue(vendorRef, (snapshot) => {
      const vendor = snapshot.val();
      if (vendor) {
        setVendorBalance(parseFloat(vendor.balance) || 0); // Ensure vendor balance is treated as a number
      }
    });
  };

  const calculateTotalPrice = () => {
    if (isNewProduct) {
      return parseFloat(newProduct.price) * quantity; // Convert price to a number
    } else {
      const product = products.find((p) => `${p.item} ${p.size}` === selectedProduct);
      return product ? parseFloat(product.price) * quantity : 0; // Convert price to a number
    }
  };

  const handleNewProductSubmit = () => {
    const totalAmount = calculateTotalPrice();
    const productID = `PROD-${Math.floor(1000 + Math.random() * 9000)}`;

    // Add the new product
    set(ref(db, `Products/${productID}`), newProduct)
      .then(() => {
        const updatedVendorBalance = vendorBalance + totalAmount; // Ensure numeric addition
        update(ref(db, `Vendors/${selectedVendor}`), { balance: updatedVendorBalance })
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Purchase Completed',
              text: `Product added and vendor's balance updated.`,
              showConfirmButton: false,
              timer: 2000,
            });
          });
        setNewProduct({ item: '', size: '', price: '', quantity: '' }); // Reset form
      })
      .catch((error) => {
        Swal.fire('Error', `Failed to add product: ${error.message}`, 'error');
      });
  };

  const handleExistingProductPurchase = () => {
    const totalAmount = calculateTotalPrice();
    const product = products.find((p) => `${p.item} ${p.size}` === selectedProduct);

    if (product) {
      const updatedQty = product.quantity + quantity;

      // Update product quantity
      update(ref(db, `Products/${product.id}`), { quantity: updatedQty })
        .then(() => {
          const updatedVendorBalance = vendorBalance + totalAmount; // Ensure numeric addition
          update(ref(db, `Vendors/${selectedVendor}`), { balance: updatedVendorBalance })
            .then(() => {
              Swal.fire({
                icon: 'success',
                title: 'Purchase Completed',
                text: `Product quantity updated and vendor's balance updated.`,
                showConfirmButton: false,
                timer: 2000,
              });
            });
          setSelectedProduct('');
          setQuantity(1);
        })
        .catch((error) => {
          Swal.fire('Error', `Failed to update product: ${error.message}`, 'error');
        });
    }
  };

  const handleProductToggle = () => {
    setIsNewProduct(!isNewProduct);
    setSelectedProduct('');
    setNewProduct({ item: '', size: '', price: '', quantity: '' });
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderNewProductForm = () => (
    <div className="product-form">
      <h2>Add New Product</h2>
      <input
        type="text"
        name="item"
        placeholder="Product Name"
        value={newProduct.item}
        onChange={handleNewProductChange}
      />
      <input
        type="text"
        name="size"
        placeholder="Product Size"
        value={newProduct.size}
        onChange={handleNewProductChange}
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={newProduct.price}
        onChange={handleNewProductChange}
      />
      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={newProduct.quantity}
        onChange={handleNewProductChange}
      />
      <button onClick={handleNewProductSubmit}>Add Product</button>
    </div>
  );

  const renderExistingProductDropdown = () => (
    <div className="existing-product-section">
      <h2>Select Existing Product</h2>
      <select
        value={selectedProduct}
        onChange={(e) => setSelectedProduct(e.target.value)}
      >
        <option value="">Select Product</option>
        {products.map((product) => (
          <option key={product.id} value={`${product.item} ${product.size}`}>
            {product.item} - {product.size}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        min="1"
      />
      <button onClick={handleExistingProductPurchase}>Purchase Product</button>
    </div>
  );

  const renderVendorDropdown = () => (
    <div className="vendor-section">
      <h2>Select Vendor</h2>
      <select
        value={selectedVendor}
        onChange={handleVendorChange}
      >
        <option value="">Select Vendor</option>
        {vendors.map((vendor) => (
          <option key={vendor.id} value={vendor.id}>
            {vendor.name}
          </option>
        ))}
      </select>
      <p>Current Vendor Balance: Rs. {vendorBalance.toLocaleString()}</p>
    </div>
  );

  return (
    <div className="purchase-order-container">
      <h1>Purchase Order</h1>

      {renderVendorDropdown()}

      <div className="product-toggle">
        <button onClick={handleProductToggle}>
          {isNewProduct ? 'Switch to Existing Product' : 'Switch to New Product'}
        </button>
      </div>

      {isNewProduct ? renderNewProductForm() : renderExistingProductDropdown()}
    </div>
  );
}
