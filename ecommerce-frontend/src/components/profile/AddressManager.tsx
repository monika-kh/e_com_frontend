import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AddressService } from "../../services/addressService";
import { Address, CreateAddressPayload } from "../../types/address";

const emptyForm: CreateAddressPayload = {
  full_name: "",
  phone: "",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
  is_default: false,
};

interface AddressFormProps {
  value: CreateAddressPayload;
  isEditing: boolean;
  isSubmitting: boolean;
  onChange: React.Dispatch<React.SetStateAction<CreateAddressPayload>>;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  value,
  isEditing,
  isSubmitting,
  onChange,
  onCancel,
  onSubmit,
}) => {
  const canSubmit = useMemo(
    () =>
      Boolean(
        value.full_name.trim() &&
          value.phone.trim() &&
          value.address_line.trim() &&
          value.city.trim() &&
          value.state.trim() &&
          value.pincode.trim()
      ),
    [value]
  );

  return (
    <form className="address-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="full_name">Full name</label>
        <input
          id="full_name"
          value={value.full_name}
          onChange={(event) => onChange((current) => ({ ...current, full_name: event.target.value }))}
          disabled={isSubmitting}
        />
      </div>
      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          inputMode="numeric"
          value={value.phone}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              phone: event.target.value.replace(/\D/g, "").slice(0, 10),
            }))
          }
          disabled={isSubmitting}
        />
      </div>
      <div className="field">
        <label htmlFor="address_line">Address line</label>
        <textarea
          id="address_line"
          rows={3}
          value={value.address_line}
          onChange={(event) => onChange((current) => ({ ...current, address_line: event.target.value }))}
          disabled={isSubmitting}
        />
      </div>
      <div className="field">
        <label htmlFor="city">City</label>
        <input
          id="city"
          value={value.city}
          onChange={(event) => onChange((current) => ({ ...current, city: event.target.value }))}
          disabled={isSubmitting}
        />
      </div>
      <div className="field">
        <label htmlFor="state">State</label>
        <input
          id="state"
          value={value.state}
          onChange={(event) => onChange((current) => ({ ...current, state: event.target.value }))}
          disabled={isSubmitting}
        />
      </div>
      <div className="field">
        <label htmlFor="pincode">Pincode</label>
        <input
          id="pincode"
          inputMode="numeric"
          value={value.pincode}
          onChange={(event) => onChange((current) => ({ ...current, pincode: event.target.value }))}
          disabled={isSubmitting}
        />
      </div>
      <div className="address-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Address" : "Save Address"}
        </button>
      </div>
    </form>
  );
};

const AddressManager: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CreateAddressPayload>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAddresses(await AddressService.list());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load addresses.");
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const closeForm = useCallback(() => {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  }, []);

  const editAddress = useCallback((address: Address) => {
    setEditingId(address.id);
    setForm({
      full_name: address.full_name,
      phone: address.phone,
      address_line: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      is_default: address.is_default,
    });
    setIsFormOpen(true);
  }, []);

  const submitAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const payload: CreateAddressPayload = {
      ...form,
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      address_line: form.address_line.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    };

    if (!payload.full_name || !payload.phone || !payload.address_line || !payload.city || !payload.state || !payload.pincode) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      if (editingId === null) {
        const created = await AddressService.add(payload);
        setAddresses((current) => [created, ...current]);
      } else {
        const updated = await AddressService.update(editingId, payload);
        setAddresses((current) => current.map((address) => (address.id === updated.id ? updated : address)));
      }
      closeForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAddress = async (id: number) => {
    if (deleteId !== null || !window.confirm("Delete this address?")) return;

    try {
      setDeleteId(id);
      setError(null);
      await AddressService.remove(id);
      setAddresses((current) => current.filter((address) => address.id !== id));
      if (Number(localStorage.getItem("selected_address_id")) === id) {
        localStorage.removeItem("selected_address_id");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete address.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <section className="address-section" aria-labelledby="addresses-heading">
      <div className="address-section-header">
        <div>
          <h2 id="addresses-heading">Addresses</h2>
          <p className="address-subtitle">Manage your saved delivery addresses.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setIsFormOpen(true);
          }}
          disabled={isSubmitting}
        >
          Add Address
        </button>
      </div>

      {error && <div className="address-error">{error}</div>}

      {isFormOpen && (
        <section className="address-card address-form-card">
          <h3>{editingId === null ? "Add Address" : "Edit Address"}</h3>
          <AddressForm
            value={form}
            isEditing={editingId !== null}
            isSubmitting={isSubmitting}
            onChange={setForm}
            onCancel={closeForm}
            onSubmit={submitAddress}
          />
        </section>
      )}

      {isLoading ? (
        <div className="address-loading">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="address-empty">No saved addresses yet.</div>
      ) : (
        <div className="saved-list">
          {addresses.map((address) => (
            <article key={address.id} className="saved-item">
              <div className="saved-item-main">
                <div className="saved-name">{address.full_name}</div>
                <div className="saved-lines">
                  {address.address_line}
                  <br />
                  {address.city}, {address.state} - {address.pincode}
                  <br />
                  Phone: {address.phone}
                </div>
              </div>
              <div className="saved-actions">
                <button type="button" className="btn btn-outline" onClick={() => editAddress(address)} disabled={isSubmitting || deleteId === address.id}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger" onClick={() => removeAddress(address.id)} disabled={deleteId === address.id}>
                  {deleteId === address.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default AddressManager;
