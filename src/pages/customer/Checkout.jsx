
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAddresses, addAddress, createOrder } from "../../services/api";
import "../../styles/Checkout.css";

function Checkout() {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);


    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(null);


    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        addressType: "Home",
        isDefault: false,
    });

    const navigate = useNavigate();

    useEffect(() => {
        const loadAddresses = async () => {
            try {
                const data = await getAddresses();

                if (data.success) {
                    setAddresses(data.addresses || []);

                    const defaultAddress = data.addresses?.find(
                        (address) => address.isDefault
                    );

                    if (defaultAddress) {
                        setSelectedAddressId(defaultAddress._id);
                    }
                } else {
                    setError("Unable to load addresses.");
                }
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load addresses. Please log in."
                );
            } finally {
                setLoading(false);
            }
        };

        loadAddresses();
    }, []);


    const handleContinue = async () => {
        if (!selectedAddressId) {
            setError("Please select a delivery address.");
            return;
        }

        setError("");
        setPlacingOrder(true);

        try {
            const data = await createOrder(selectedAddressId);

            if (!data.success) {
                throw new Error(data.message || "Unable to place order.");
            }

            setOrderPlaced(data.order || data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to place order. Please try again."
            );
        } finally {
            setPlacingOrder(false);
        }
    };



    const handleAddressChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleAddAddress = async (event) => {
        event.preventDefault();
        setError("");
        setSavingAddress(true);

        try {
            const data = await addAddress(formData);

            if (!data.success) {
                throw new Error(data.message || "Unable to save address");
            }

            const updated = await getAddresses();
            const savedAddresses = updated.addresses || [];

            setAddresses(savedAddresses);
            setSelectedAddressId(data.address._id);
            setShowAddressForm(false);

            setFormData({
                fullName: "",
                phone: "",
                addressLine: "",
                city: "",
                state: "",
                pincode: "",
                country: "India",
                addressType: "Home",
                isDefault: false,
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to save address"
            );
        } finally {
            setSavingAddress(false);
        }
    };
    if (loading) {
        return <p className="checkout-message">Loading addresses...</p>;
    }

    if (orderPlaced) {
        return (
            <div className="checkout-page">
                <h1>Order Placed Successfully!</h1>
                <p>Thank you for shopping with us.</p>

                {orderPlaced._id && (
                    <p>
                        Order ID: <strong>{orderPlaced._id}</strong>
                    </p>
                )}

                <p>Payment Method: Cash on Delivery</p>
                <p>Your order has been created successfully.</p>

                <button type="button" onClick={() => navigate("/")}>
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>
            <p className="checkout-subtitle">
                Choose where you want your jewellery delivered.
            </p>


            <button
                type="button"
                onClick={() => setShowAddressForm((previous) => !previous)}
            >
                {showAddressForm ? "Cancel" : "+ Add New Address"}
            </button>

            {showAddressForm && (
                <form onSubmit={handleAddAddress} className="address-form">
                    <h2>Add Delivery Address</h2>

                    <input
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleAddressChange}
                        required
                    />

                    <input
                        name="phone"
                        placeholder="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={handleAddressChange}
                        required
                    />

                    <textarea
                        name="addressLine"
                        placeholder="House number, street, area"
                        value={formData.addressLine}
                        onChange={handleAddressChange}
                        required
                    />

                    <input
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleAddressChange}
                        required
                    />

                    <input
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleAddressChange}
                        required
                    />

                    <input
                        name="pincode"
                        placeholder="PIN Code"
                        value={formData.pincode}
                        onChange={handleAddressChange}
                        required
                    />

                    <input
                        name="country"
                        placeholder="Country"
                        value={formData.country}
                        onChange={handleAddressChange}
                        required
                    />

                    <label>
                        Address Type
                        <select
                            name="addressType"
                            value={formData.addressType}
                            onChange={handleAddressChange}
                        >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                        </select>
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            name="isDefault"
                            checked={formData.isDefault}
                            onChange={handleAddressChange}
                        />
                        Make this my default address
                    </label>

                    <button type="submit" disabled={savingAddress}>
                        {savingAddress ? "Saving..." : "Save Address"}
                    </button>
                </form>
            )}


            {error && <p className="checkout-error">{error}</p>}

            {addresses.length === 0 ? (
                <div className="empty-address">
                    <h2>No saved addresses</h2>
                    <p>Please add a delivery address before continuing.</p>
                </div>
            ) : (
                <>
                    <h2>Select Delivery Address</h2>

                    <div className="address-list">
                        {addresses.map((address) => (
                            <label
                                key={address._id}
                                className={`address-card ${selectedAddressId === address._id
                                    ? "selected"
                                    : ""
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="deliveryAddress"
                                    value={address._id}
                                    checked={selectedAddressId === address._id}
                                    onChange={() => {
                                        setSelectedAddressId(address._id);
                                        setError("");
                                    }}
                                />

                                <div className="address-details">
                                    <div className="address-heading">
                                        <h3>{address.fullName}</h3>
                                        {address.isDefault && (
                                            <span className="default-label">Default</span>
                                        )}
                                    </div>

                                    <p>{address.phone}</p>
                                    <p>
                                        {address.addressLine}, {address.city},{" "}
                                        {address.state} - {address.pincode}
                                    </p>
                                    <p>{address.country}</p>
                                    <span className="address-type">
                                        {address.addressType || "Home"}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="continue-button"
                        onClick={handleContinue}
                    >
                        Continue to Order
                    </button>
                </>
            )}

            <button
                type="button"
                className="back-button"
                onClick={() => navigate("/cart")}
            >
                Back to Cart
            </button>
        </div>
    );
}

export default Checkout;
