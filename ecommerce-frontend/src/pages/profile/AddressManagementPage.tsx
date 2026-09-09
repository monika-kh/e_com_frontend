import React from "react";
import Header from "../../components/layout/Header";
import AddressManager from "../../components/profile/AddressManager";
import "../../styles/address.css";

const AddressManagementPage: React.FC = () => (
  <>
    <Header />
    <main className="address-page">
      <div className="address-container">
        <h1 className="address-title">Addresses</h1>
        <AddressManager />
      </div>
    </main>
  </>
);

export default AddressManagementPage;
