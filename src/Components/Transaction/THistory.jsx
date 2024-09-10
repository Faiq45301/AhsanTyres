import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import './THistory.css';

const THistory = () => {
  const [selectedType, setSelectedType] = useState('customer');
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Fetch customers and vendors from Firebase
    const customerRef = ref(db, 'Customers');
    const vendorRef = ref(db, 'Vendors');

    onValue(customerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const customerList = Object.keys(data).map(id => ({ id, ...data[id] }));
        setCustomers(customerList);
      }
    });

    onValue(vendorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const vendorList = Object.keys(data).map(id => ({ id, ...data[id] }));
        setVendors(vendorList);
      }
    });
  }, []);

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setSelectedEntity('');
    setTransactions([]);
  };

  const handleEntityChange = (e) => {
    const entityName = e.target.value;
    setSelectedEntity(entityName);

    const transactionRef = ref(db, `${selectedType === 'customer' ? 'CustomerPayments' : 'VendorPayments'}/${entityName}`);
    onValue(transactionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transactionList = Object.keys(data).map(id => ({
          id,  // This will still use Firebase ID but we'll show paymentId below
          ...data[id]
        }));
        setTransactions(transactionList);
      } else {
        setTransactions([]);
      }
    });
  };

  const getTotal = () => {
    return transactions.reduce((acc, transaction) => acc + transaction.amountPaid, 0);
  };

  return (
    <div className="history-container">
      <h2 className="history-title">Transaction History</h2>

      <div className="history-selection">
        <label>
          <input
            type="radio"
            value="customer"
            checked={selectedType === 'customer'}
            onChange={handleTypeChange}
          /> Customer
        </label>
        <label>
          <input
            type="radio"
            value="vendor"
            checked={selectedType === 'vendor'}
            onChange={handleTypeChange}
          /> Vendor
        </label>
      </div>

      <div className="history-dropdown">
        <label htmlFor="entity-select">{selectedType === 'customer' ? 'Select Customer' : 'Select Vendor'}</label>
        <select id="entity-select" value={selectedEntity} onChange={handleEntityChange}>
          <option value="">-- Select {selectedType === 'customer' ? 'Customer' : 'Vendor'} --</option>
          {(selectedType === 'customer' ? customers : vendors).map(entity => (
            <option key={entity.id} value={entity.name}>
              {entity.name}
            </option>
          ))}
        </select>
      </div>

      {transactions.length > 0 ? (
        <div className="history-table">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Amount Paid</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  {/* Show paymentId instead of the Firebase-generated ID */}
                  <td>{transaction.paymentId}</td>
                  <td>{transaction.amountPaid}</td>
                  <td>{new Date(transaction.paymentDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="history-total">
            <strong>Total Paid:</strong> {getTotal()}
          </div>
        </div>
      ) : (
        selectedEntity && <p className="history-no-transactions">No transactions found for this {selectedType}.</p>
      )}
    </div>
  );
};

export default THistory;
