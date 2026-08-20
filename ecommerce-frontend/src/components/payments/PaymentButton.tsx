import React, { useMemo, useState } from "react";
import { PaymentService } from "../../services/paymentService";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface PaymentButtonProps {
  orderId: number;
  amountInRupees: number;
  disabled?: boolean;
  onPaid?: () => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  orderId,
  amountInRupees,
  disabled = false,
  onPaid,
}) => {
  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const amountText = useMemo(
    () => `₹${Number(amountInRupees).toLocaleString("en-IN")}`,
    [amountInRupees]
  );

  const pay = async () => {
    if (disabled || isPaying) return;
    setMessage(null);

    try {
      setIsPaying(true);

      const ok = await loadRazorpayScript();
      if (!ok) {
        setMessage("Failed to load payment gateway. Please try again.");
        return;
      }

      const rp = await PaymentService.createRazorpayOrder(orderId);

      const options = {
        key: rp.key,
        amount: rp.amount,
        currency: rp.currency,
        name: "MadeWithLove",
        description: `Payment for Order #${orderId}`,
        order_id: rp.razorpay_order_id,
        handler: async (response: any) => {
          const result = await PaymentService.verifyRazorpayPayment({
            order_id: orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (result.status === "success") {
            setMessage("Payment successful.");
            onPaid?.();
          } else {
            setMessage(result.message || "Payment failed.");
          }
        },
        modal: {
          ondismiss: () => {
            setMessage("Payment cancelled.");
          },
        },
        theme: {
          color: "#593184",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (e: any) {
      setMessage(e?.message || "Payment failed.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={pay}
        disabled={disabled || isPaying}
      >
        {isPaying ? "Opening..." : `Pay Now (${amountText})`}
      </button>
      {message && (
        <div style={{ marginTop: "0.75rem", color: "var(--text-muted-light)" }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default PaymentButton;

