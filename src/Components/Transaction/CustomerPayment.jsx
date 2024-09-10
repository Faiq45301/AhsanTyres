import React, { useState, useEffect } from 'react';
import { db } from'../../firebase'; 
import { ref, onValue, push, update } from 'firebase/database';
import './CustomerPayemet.css'; // Import the CSS file

const CustomerPayment = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [date, setDate] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const customerRef = ref(db, 'Customers'); // Corrected path
    onValue(customerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const customerList = Object.keys(data).map(id => ({ id, ...data[id] }));
        console.log('Customers Fetched:', customerList); // Debugging to check fetched data
        setCustomers(customerList);
      } else {
        console.log('No customer data available');
      }
    });
  }, []);

  const generateTransactionId = (transactions) => {
    const transactionCount = transactions ? Object.keys(transactions).length : 0;
    return `CP-${(transactionCount + 1).toString().padStart(2, '0')}`;
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (!selectedCustomer || !amountPaid || !date) return;

    const customerRef = ref(db, `Customers/${selectedCustomer}`); 
    onValue(customerRef, (snapshot) => {
      const customerData = snapshot.val();
      if (customerData) {
        const newBalance = parseFloat(customerData.balance) - parseFloat(amountPaid);

        const paymentRef = ref(db, `CustomerPayments/${customerData.name}`); 
        onValue(paymentRef, (snapshot) => {
          const transactions = snapshot.val();
          const newTransactionId = generateTransactionId(transactions);

          const newPayment = {
            customerName: customerData.name,
            amountPaid: parseFloat(amountPaid),
            paymentDate: date,
            paymentId: newTransactionId
          };

          push(paymentRef, newPayment);

          update(customerRef, { balance: newBalance })
            .then(() => {
              setTransactionId(newTransactionId);
              setSelectedCustomer('');
              setAmountPaid('');
              setDate('');
            })
            .catch(error => {
              console.error("Error updating customer balance: ", error);
            });
        }, { onlyOnce: true });
      }
    }, { onlyOnce: true });
  };

  return (
    <div className="customer-payment-container">
      <h2 className="customer-payment-title">Customer Payment</h2>
      <form className="customer-payment-form" onSubmit={handlePayment}>
        <div className="customer-payment-field">
          <label htmlFor="customer">Customer</label>
          <select
            id="customer"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">-- Select Customer --</option>
            {customers.length > 0 ? (
              customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))
            ) : (
              <option value="">No customers available</option>
            )}
          </select>
        </div>
        <div className="customer-payment-field">
          <label htmlFor="amountPaid">Amount Paid</label>
          <input
            type="number"
            id="amountPaid"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
          />
        </div>
        <div className="customer-payment-field">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button type="submit" className="customer-payment-button">Receive</button>
      </form>
      {transactionId && <p className="customer-payment-id">Transaction ID: <strong>{transactionId}</strong></p>}
    </div>
  );
};

export default CustomerPayment;
