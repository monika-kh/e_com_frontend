import api from "./api";

export interface RazorpayOrderResponse {
  razorpay_order_id: string;
  amount: number; // in paise
  currency: string;
  key: string; // Razorpay public key
}

export const PaymentService = {
  async createRazorpayOrder(orderId: number): Promise<RazorpayOrderResponse> {
    try {
      const res = await api.post<RazorpayOrderResponse>("/payments/razorpay/order/", {
        order_id: orderId,
      });
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to start payment"
      );
    }
  },

  async verifyRazorpayPayment(payload: {
    order_id: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ status: "success" | "failed"; message?: string }> {
    try {
      const res = await api.post("/payments/razorpay/verify/", payload);
      return res.data;
    } catch (error: any) {
      const data = error?.response?.data;
      return {
        status: "failed",
        message: data?.error || data?.message || error?.message || "Payment verification failed",
      };
    }
  },
};

