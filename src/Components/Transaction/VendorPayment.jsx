import React, { useState, useEffect } from 'react';
import { db } from'../../firebase'; 
import { ref, onValue, push, update } from 'firebase/database';
import './VendorPayment.css'; // Import the CSS file

const VendorPayment = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [date, setDate] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const vendorRef = ref(db, 'Vendors'); // Fetch vendors from 'Vendors' in Firebase
    onValue(vendorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const vendorList = Object.keys(data).map(id => ({ id, ...data[id] }));
        console.log('Vendors Fetched:', vendorList); // Debugging to check fetched data
        setVendors(vendorList);
      } else {
        console.log('No vendor data available');
      }
    });
  }, []);

  const generateTransactionId = (transactions) => {
    const transactionCount = transactions ? Object.keys(transactions).length : 0;
    return `VP-${(transactionCount + 1).toString().padStart(2, '0')}`; // Vendor Payment ID
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (!selectedVendor || !amountPaid || !date) return;

    const vendorRef = ref(db, `Vendors/${selectedVendor}`); 
    onValue(vendorRef, (snapshot) => {
      const vendorData = snapshot.val();
      if (vendorData) {
        const newBalance = parseFloat(vendorData.balance) - parseFloat(amountPaid);

        const paymentRef = ref(db, `VendorPayments/${vendorData.name}`); 
        onValue(paymentRef, (snapshot) => {
          const transactions = snapshot.val();
          const newTransactionId = generateTransactionId(transactions);

          const newPayment = {
            vendorName: vendorData.name,
            amountPaid: parseFloat(amountPaid),
            paymentDate: date,
            paymentId: newTransactionId
          };

          // Push new payment entry to 'VendorPayments'
          push(paymentRef, newPayment);

          // Update vendor balance
          update(vendorRef, { balance: newBalance })
            .then(() => {
              setTransactionId(newTransactionId);
              setSelectedVendor('');
              setAmountPaid('');
              setDate('');
            })
            .catch(error => {
              console.error("Error updating vendor balance: ", error);
            });
        }, { onlyOnce: true });
      }
    }, { onlyOnce: true });
  };

  return (
    <div className="vendor-payment-container">
      <h2 className="vendor-payment-title">Vendor Payment</h2>
      <form className="vendor-payment-form" onSubmit={handlePayment}>
        <div className="vendor-payment-field">
          <label htmlFor="vendor">Vendor</label>
          <select
            id="vendor"
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
          >
            <option value="">-- Select Vendor --</option>
            {vendors.length > 0 ? (
              vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))
            ) : (
              <option value="">No vendors available</option>
            )}
          </select>
        </div>
        <div className="vendor-payment-field">
          <label htmlFor="amountPaid">Amount Paid</label>
          <input
            type="number"
            id="amountPaid"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
          />
        </div>
        <div className="vendor-payment-field">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button type="submit" className="vendor-payment-button">Make Payment</button>
      </form>
      {transactionId && <p className="vendor-payment-id">Transaction ID: <strong>{transactionId}</strong></p>}
    </div>
  );
};

export default VendorPayment;
