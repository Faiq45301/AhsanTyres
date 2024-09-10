import React, { useState, useEffect } from 'react';
import { ref, onValue, update, set } from 'firebase/database';
import { db } from '../../firebase';
import { FaPlus, FaCheck, FaUser, FaBox } from 'react-icons/fa';
import './SaleOrder.css';
import Swal from 'sweetalert2';

const SaleOrder = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState([]);
  const [updatedBalance, setUpdatedBalance] = useState(null);

  useEffect(() => {
    const customerRef = ref(db, 'Customers');
    onValue(customerRef, (snapshot) => {
      const customerData = snapshot.val();
      const customerList = customerData ? Object.keys(customerData).map((key) => ({
        id: key,
        ...customerData[key],
      })) : [];
      setCustomers(customerList);
    });

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

  const handleAddProduct = () => {
    if (selectedProduct && quantity > 0) {
      const product = products.find((p) => `${p.item} ${p.size}` === selectedProduct);
      if (product && product.quantity >= quantity) {
        const newItem = {
          ...product,
          quantity,
          total: product.price * quantity,
        };
        setOrderItems([...orderItems, newItem]);
        setSelectedProduct('');
        setQuantity(1);
      } else {
        Swal.fire('Error', `Insufficient stock for ${product.item}. Available: ${product.quantity}`, 'error');
      }
    }
  };

  const handleRemoveProduct = (indexToRemove) => {
    const newOrderItems = orderItems.filter((_, index) => index !== indexToRemove);
    setOrderItems(newOrderItems);
  };

  const generateOrderID = () => {
    return `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handlePlaceOrder = () => {
    const totalAmount = orderItems.reduce((acc, item) => acc + item.total, 0);

    if (!selectedCustomer || orderItems.length === 0) {
      Swal.fire('Error', 'Please select a customer and add products to the order.', 'error');
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomer);

    if (customer) {
      const currentBalance = Number(customer.balance) || 0;
      const updatedCustomerBalance = currentBalance + totalAmount;

      setUpdatedBalance(updatedCustomerBalance);

      update(ref(db, `Customers/${selectedCustomer}`), { balance: updatedCustomerBalance });

      // Validate product quantities before updating
      let allProductsAvailable = true;

      orderItems.forEach((item) => {
        const product = products.find((p) => p.id === item.id);
        const updatedQty = product.quantity - item.quantity;
        if (isNaN(updatedQty) || updatedQty < 0) {
          allProductsAvailable = false;
          Swal.fire('Error', `Insufficient stock for ${product.item}. Available: ${product.quantity}`, 'error');
        }
      });

      if (allProductsAvailable) {
        orderItems.forEach((item) => {
          const product = products.find((p) => p.id === item.id);
          const updatedQty = product.quantity - item.quantity;

          update(ref(db, `Products/${product.id}`), { quantity: updatedQty });
        });

        const orderID = generateOrderID();
        const orderData = {
          orderID,
          customerID: selectedCustomer,
          orderItems,
          totalAmount,
          date: new Date().toISOString(),
        };

        set(ref(db, `Orders/${orderID}`), orderData)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Order Placed!',
              text: 'The order has been successfully placed.',
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true,
            });
            setOrderItems([]);
            setSelectedCustomer('');
            setUpdatedBalance(null);
          })
          .catch((error) => {
            Swal.fire('Error', `Failed to place order: ${error.message}`, 'error');
          });
      }
    }
  };

  return (
    <div className="sale-order-container">
      <h1 className="sale-order-title">Sale Order</h1>

      <div className="sale-order-section">
        <h2 className="section-title">Select Customer</h2>
        <div className="input-group">
          <FaUser className="input-icon" />
          <select
            className="rounded-input"
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(e.target.value);
              setUpdatedBalance(null);
            }}
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        {selectedCustomer && (
          <div className="customer-balance">
            Current Balance: {updatedBalance !== null
              ? updatedBalance
              : Number(customers.find((c) => c.id === selectedCustomer)?.balance || 0)}
          </div>
        )}
      </div>

      <div className="sale-order-section">
        <h2 className="section-title">Select Product</h2>
        <div className="product-inputs">
          <div className="input-group">
            <FaBox className="input-icon" />
            <select
              className="rounded-input"
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
          </div>

          <div className="input-group">
            <input
              type="number"
              className="rounded-input"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
            />
            <FaPlus className="add-icon" onClick={handleAddProduct} />
          </div>
        </div>
      </div>

      {orderItems.length > 0 && (
        <table className="order-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Size</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={index}>
                <td>{item.item}</td>
                <td>{item.size}</td>
                <td>{item.price}</td>
                <td>{item.quantity}</td>
                <td>{item.total}</td>
                <td>
                  <button onClick={() => handleRemoveProduct(index)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="place-order-button" onClick={handlePlaceOrder}>
        <FaCheck /> Place Order
      </button>
    </div>
  );
};

export default SaleOrder;
