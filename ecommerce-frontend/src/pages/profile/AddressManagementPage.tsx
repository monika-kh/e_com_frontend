import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/layout/Header";
import { AddressService } from "../../services/addressService";
import { Address, CreateAddressPayload } from "../../types/address";
import "../../styles/address.css";

const emptyForm: CreateAddressPayload = {
  full_name: "",
  phone: "",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
  is_default: false,
};

const AddressManagementPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateAddressPayload>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const canSubmit = useMemo(() => {
    return (
      form.full_name.trim() &&
      form.phone.trim() &&
      form.address_line.trim() &&
      form.city.trim() &&
      form.state.trim() &&
      form.pincode.trim()
    );
  }, [form]);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const list = await AddressService.list();
      setAddresses(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load addresses.");
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const payload: CreateAddressPayload = {
        ...form,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address_line: form.address_line.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      };

      if (editingId) {
        const updated = await AddressService.update(editingId, payload);
        setAddresses((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        );
        setEditingId(null);
      } else {
        const created = await AddressService.add(payload);
        setAddresses((prev) => [created, ...prev]);
      }

      setForm(emptyForm);
    } catch (e: any) {
      setError(e?.message || "Failed to save address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    if (deleteId) return;
    if (!window.confirm("Delete this address?")) return;

    try {
      setDeleteId(id);
      setError(null);
      await AddressService.remove(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));

      const selectedId = Number(localStorage.getItem("selected_address_id"));
      if (selectedId === id) localStorage.removeItem("selected_address_id");
    } catch (e: any) {
      setError(e?.message || "Failed to delete address.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      <Header />
      <main className="address-page">
        <div className="address-container">
          <h2 className="address-title">Profile → Addresses</h2>
          <p className="address-subtitle">
            Add a new address and manage your saved addresses.
          </p>

          <div className="address-grid">
            {/* Add Address Form */}
            <section className="address-card">
              <h3>{editingId ? "Edit Address" : "Add Address"}</h3>
              <form className="address-form" onSubmit={submit}>
                <div className="field">
                  <label htmlFor="full_name">Full name</label>
                  <input
                    id="full_name"
                    value={form.full_name}
                    onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                    placeholder="e.g. Monika Sharma"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="field">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setForm((p) => ({ ...p, phone: digitsOnly }));
                    }}
                    placeholder="e.g. 9876543210"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="field">
                  <label htmlFor="address_line">Address line</label>
                  <textarea
                    id="address_line"
                    rows={3}
                    value={form.address_line}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, address_line: e.target.value }))
                    }
                    placeholder="House no, street, area"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="field">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="field">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    id="pincode"
                    value={form.pincode}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, pincode: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="address-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setForm(emptyForm);
                      setEditingId(null);
                    }}
                    disabled={isSubmitting}
                  >
                    {editingId ? "Cancel" : "Clear"}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : editingId ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </form>

              {error && <div className="address-error">{error}</div>}
            </section>

            {/* Saved Addresses */}
            <section className="address-card">
              <h3>Saved Addresses</h3>
              {isLoading ? (
                <div className="address-loading">Loading addresses...</div>
              ) : addresses.length === 0 ? (
                <div className="address-empty">
                  No saved addresses yet. Add one using the form.
                </div>
              ) : (
                <div className="saved-list">
                  {addresses.map((a) => (
                    <div key={a.id} className="saved-item">
                      <div className="saved-item-main">
                        <div className="saved-name">{a.full_name}</div>
                        <div className="saved-lines">
                          {a.address_line}
                          <br />
                          {a.city}, {a.state} — {a.pincode}
                          <br />
                          Phone: {a.phone}
                        </div>
                      </div>
                      <div className="saved-actions">
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => {
                            setEditingId(a.id);
                            setForm({
                              full_name: a.full_name,
                              phone: a.phone,
                              address_line: a.address_line,
                              city: a.city,
                              state: a.state,
                              pincode: a.pincode,
                              is_default: a.is_default,
                            });
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          disabled={isSubmitting || deleteId === a.id}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => remove(a.id)}
                          disabled={deleteId === a.id}
                        >
                          {deleteId === a.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default AddressManagementPage;

