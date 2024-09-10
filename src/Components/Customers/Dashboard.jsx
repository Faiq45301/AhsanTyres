import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import './Dashboard.css';
import { FaUsers, FaMoneyBillWave, FaCashRegister, FaHandHoldingUsd } from 'react-icons/fa';

// Utility function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Dashboard() {
  const [totalReceivables, setTotalReceivables] = useState(0);
  const [totalPayables, setTotalPayables] = useState(0);
  const [customerRecovery, setCustomerRecovery] = useState(0);
  const [paidToSuppliers, setPaidToSuppliers] = useState(0);
  const [cashOnHand, setCashOnHand] = useState(0);
  const [error, setError] = useState(null);

  const db = getDatabase();
  const todayDate = getCurrentDate(); // Get the current date in YYYY-MM-DD format

  useEffect(() => {
    // Fetching data
    fetchCustomerData();
    fetchVendorData();
    fetchVendorPayments();
    calculateCustomerRecovery();
    // Removed new card functions
  }, []);

  // Function to fetch customer data and calculate total receivables
  const fetchCustomerData = () => {
    const customersRef = ref(db, 'Customers');
    get(customersRef).then((snapshot) => {
      if (snapshot.exists()) {
        let receivables = 0;
        snapshot.forEach(customer => {
          let balance = parseFloat(customer.val().balance) || 0;
          receivables += balance;
        });
        setTotalReceivables(receivables);
      } else {
        setError('No customer data found');
      }
    }).catch((error) => {
      setError("Error fetching customer data: " + error.message);
    });
  };

  // Function to fetch vendor data and calculate total payables
  const fetchVendorData = () => {
    const vendorsRef = ref(db, 'Vendors');
    get(vendorsRef).then((snapshot) => {
      if (snapshot.exists()) {
        let payables = 0;
        snapshot.forEach(vendor => {
          let balance = parseFloat(vendor.val().balance) || 0;
          payables += balance;
        });
        setTotalPayables(payables);
      } else {
        setError('No vendor data found');
      }
    }).catch((error) => {
      setError("Error fetching vendor data: " + error.message);
    });
  };

  // Function to fetch vendor payments made today
  const fetchVendorPayments = () => {
    const paymentsRef = ref(db, 'VendorPayments');
    get(paymentsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          let totalPaidToday = 0;
          snapshot.forEach((vendorPayments) => {
            vendorPayments.forEach((payment) => {
              const paymentDate = payment.val().paymentDate;
              if (paymentDate === todayDate) {
                let amountPaid = parseFloat(payment.val().amountPaid) || 0;
                totalPaidToday += amountPaid;
              }
            });
          });
          setPaidToSuppliers(totalPaidToday);
        } else {
          setError('No vendor payments found');
        }
      })
      .catch((error) => {
        setError("Error fetching vendor payments: " + error.message);
      });
  };

  // Function to calculate the sum of all customer recovery transactions for today
  const calculateCustomerRecovery = () => {
    const customerPaymentsRef = ref(db, 'CustomerPayments');
    get(customerPaymentsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          let recoveryToday = 0;
          snapshot.forEach((customerPayments) => {
            customerPayments.forEach((payment) => {
              const paymentDate = payment.val().paymentDate;
              if (paymentDate === todayDate) {
                let amountPaid = parseFloat(payment.val().amountPaid) || 0;
                recoveryToday += amountPaid;
              }
            });
          });
          setCustomerRecovery(recoveryToday);
        } else {
          setError('No customer payments found');
        }
      })
      .catch((error) => {
        setError("Error calculating customer recovery: " + error.message);
      });
  };

  // Calculate cash on hand (customer recovery - paid to suppliers)
  useEffect(() => {
    setCashOnHand(customerRecovery - paidToSuppliers);
  }, [customerRecovery, paidToSuppliers]);

  return (
    <div className="dashboard">
      {/* Total Receivables Card */}
      <div className="card">
        <FaUsers className="card-icon" />
        <h3>Total Receivables</h3>
        <p>{typeof totalReceivables === 'number' ? totalReceivables.toFixed(2) : '0.00'} PKR</p>
      </div>

      {/* Total Payables Card */}
      <div className="card">
        <FaMoneyBillWave className="card-icon" />
        <h3>Total Payables</h3>
        <p>{typeof totalPayables === 'number' ? totalPayables.toFixed(2) : '0.00'} PKR</p>
      </div>

      {/* Customer Recovery Card */}
      <div className="card">
        <FaHandHoldingUsd className="card-icon" />
        <h3>Recovery from Customers</h3>
        <p>{typeof customerRecovery === 'number' ? customerRecovery.toFixed(2) : '0.00'} PKR</p>
      </div>

      {/* Paid to Suppliers Card */}
      <div className="card">
        <FaCashRegister className="card-icon" />
        <h3>Paid to Suppliers</h3>
        <p>{typeof paidToSuppliers === 'number' ? paidToSuppliers.toFixed(2) : '0.00'} PKR</p>
      </div>

      {/* Cash on Hand Card */}
      <div className="card">
        <FaMoneyBillWave className="card-icon" />
        <h3>Cash on Hand</h3>
        <p>{typeof cashOnHand === 'number' ? cashOnHand.toFixed(2) : '0.00'} PKR</p>
      </div>

      {/* Error Display */}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
