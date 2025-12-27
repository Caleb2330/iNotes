import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { PremiumStorage } from '../services/storage/PremiumStorage';

export const useBilling = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);

  useEffect(() => {
    loadPremiumStatus();
    loadProducts();
  }, []);

  const loadPremiumStatus = async () => {
    try {
      const premium = await PremiumStorage.getPremiumStatus();
      setIsPremium(premium);
    } catch (error) {
      console.error('Error loading premium status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    // Mock subscription product for closed testing
    setProducts([{
      productId: 'remove_ads_premium_monthly',
      localizedPrice: '$4.99/month',
      title: 'Premium Monthly',
      description: 'Ad-free experience with monthly subscription',
      type: 'subs',
      price: '4.99',
      currency: 'USD',
    }]);
  };

  const purchaseRemoveAds = async () => {
    if (purchaseInProgress) return;
    
    setPurchaseInProgress(true);
    try {
      // Mock purchase for testing - will be replaced with real IAP
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      await PremiumStorage.setPremiumStatus(true);
      setIsPremium(true);
      Alert.alert('Subscription Successful!', 'Premium subscription activated! (Mock subscription for testing)');
    } catch (error) {
      console.error('Error processing purchase:', error);
      Alert.alert('Purchase Error', 'Failed to complete purchase. Please try again.');
    } finally {
      setPurchaseInProgress(false);
    }
  };

  return {
    isPremium,
    isLoading,
    products,
    purchaseInProgress,
    purchaseRemoveAds,
    connected: true,
  };
};
