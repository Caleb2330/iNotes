import {
  initConnection,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getProducts,
  requestPurchase,
  finishTransaction,
  clearTransactionIOS,
  Product,
  Purchase,
} from 'react-native-iap';

// Define your product IDs
export const REMOVE_ADS_PRODUCT_ID = 'remove_ads_premium';

export class BillingService {
  private static instance: BillingService;
  private isInitialized = false;
  private purchaseUpdateSubscription: any;
  private purchaseErrorSubscription: any;

  static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await initConnection();
      this.isInitialized = true;
      console.log('Billing service initialized');
    } catch (error) {
      console.error('Failed to initialize billing service:', error);
      throw error;
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const products = await getProducts([REMOVE_ADS_PRODUCT_ID]);
      return products;
    } catch (error) {
      console.error('Failed to get products:', error);
      throw error;
    }
  }

  async purchaseRemoveAds(): Promise<Purchase | null> {
    try {
      const purchase = await requestPurchase(REMOVE_ADS_PRODUCT_ID);
      return purchase;
    } catch (error) {
      console.error('Failed to purchase remove ads:', error);
      throw error;
    }
  }

  async finishTransaction(purchase: Purchase): Promise<void> {
    try {
      await finishTransaction(purchase, false);
      console.log('Transaction finished');
    } catch (error) {
      console.error('Failed to finish transaction:', error);
      throw error;
    }
  }

  setPurchaseUpdateListener(callback: (purchase: Purchase) => void): void {
    this.purchaseUpdateSubscription = purchaseUpdatedListener((purchase) => {
      console.log('Purchase updated:', purchase);
      callback(purchase);
    });
  }

  setPurchaseErrorListener(callback: (error: any) => void): void {
    this.purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.error('Purchase error:', error);
      callback(error);
    });
  }

  async cleanup(): Promise<void> {
    try {
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
        this.purchaseUpdateSubscription = null;
      }
      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
        this.purchaseErrorSubscription = null;
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}
