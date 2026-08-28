import Razorpay from 'razorpay';

export interface CreateOrderParams {
  amountPaise: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  status: string;
  attempts: number;
  created_at: number;
}

class RazorpayService {
  private client: Razorpay | null = null;
  private keyId: string | null;
  private keySecret: string | null;
  private isDemoMode: boolean;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || null;
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || null;
    this.isDemoMode = process.env.DEMO_MODE === 'true';

    if (this.keyId && this.keySecret) {
      try {
        this.client = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret,
        });
      } catch (err) {
        console.warn('Razorpay client initialization failed, using sandbox fallback:', err);
      }
    }
  }

  async createOrder(params: CreateOrderParams): Promise<RazorpayOrderResponse> {
    // If real Razorpay client is initialized, call official API
    if (this.client && !this.isDemoMode) {
      try {
        const order = await this.client.orders.create({
          amount: params.amountPaise,
          currency: params.currency || 'INR',
          receipt: params.receipt || `rcpt_${Date.now()}`,
          notes: params.notes || {},
        });
        return order as unknown as RazorpayOrderResponse;
      } catch (err: any) {
        console.error('Razorpay API order creation failed:', err);
        throw new Error(`Razorpay API Error: ${err.message || 'Failed to create order'}`);
      }
    }

    // In production without demo mode and without credentials, throw an explicit error
    if (process.env.NODE_ENV === 'production' && !this.isDemoMode && !this.client) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured in production.');
    }

    // Deterministic Test Sandbox Adapter
    const mockOrderId = `order_RAYFlow_${Date.now().toString().slice(-6)}_test`;
    return {
      id: mockOrderId,
      entity: 'order',
      amount: params.amountPaise,
      amount_paid: 0,
      amount_due: params.amountPaise,
      currency: params.currency || 'INR',
      receipt: params.receipt || `rcpt_${Date.now()}`,
      status: 'created',
      attempts: 0,
      created_at: Math.floor(Date.now() / 1000),
    };
  }
}

export const razorpayService = new RazorpayService();
