import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  finishTransaction,
  getSubscriptions,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestSubscription,
  Subscription,
  SubscriptionPurchase,
  Purchase,
} from 'react-native-iap';
import { PremiumStorage } from '../services/storage/PremiumStorage';

const SUBSCRIPTION_ID = 'remove_ads_premium_monthly';

export const useBilling = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [connected, setConnected] = useState(false);
  const purchaseUpdateRef = useRef<ReturnType<typeof purchaseUpdatedListener> | null>(null);
  const purchaseErrorRef = useRef<ReturnType<typeof purchaseErrorListener> | null>(null);

  useEffect(() => {
    initializeBilling();
    return () => {
      purchaseUpdateRef.current?.remove();
      purchaseErrorRef.current?.remove();
    };
  }, []);

  const initializeBilling = async () => {
    try {
      const connectedResult = await initConnection();
      setConnected(!!connectedResult);

      // Listeners
      purchaseUpdateRef.current = purchaseUpdatedListener(async (purchase: Purchase | SubscriptionPurchase) => {
        try {
          if (purchase.productId === SUBSCRIPTION_ID) {
            await PremiumStorage.setPremiumStatus(true);
            setIsPremium(true);
          }
          // Finish the transaction
          await finishTransaction({ purchase, isConsumable: false });
        } catch (err) {
          console.error('Error finishing transaction', err);
        } finally {
          setPurchaseInProgress(false);
        }
      });

      purchaseErrorRef.current = purchaseErrorListener((error) => {
        console.error('Purchase error', error);
        if (error.code !== 'E_USER_CANCELLED') {
          Alert.alert('Purchase Error', 'Failed to complete purchase. Please try again.');
        }
        setPurchaseInProgress(false);
      });

      await loadPremiumStatus();
      await loadSubscriptions();
    } catch (error) {
      console.error('Error initializing billing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPremiumStatus = async () => {
    try {
      const premium = await PremiumStorage.getPremiumStatus();
      setIsPremium(premium);
    } catch (error) {
      console.error('Error loading premium status:', error);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const products = await getSubscriptions({ skus: [SUBSCRIPTION_ID] });
      setSubscriptions(products);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      // fallback mock
      setSubscriptions([
        {
          productId: SUBSCRIPTION_ID,
          localizedPrice: '$4.99/month',
          title: 'Premium Monthly',
          description: 'Ad-free experience with monthly subscription',
          type: 'subs',
          price: '4.99',
          currency: 'USD',
          platform: 'android',
        } as unknown as Subscription,
      ]);
    }
  };

  const purchaseSubscription = async () => {
    if (purchaseInProgress) return;
    setPurchaseInProgress(true);
    try {
      const product = subscriptions.find((p) => p.productId === SUBSCRIPTION_ID);
      const offerToken = (product as any)?.subscriptionOfferDetails?.[0]?.offerToken;
      if (offerToken) {
        await requestSubscription({
          sku: SUBSCRIPTION_ID,
          subscriptionOffers: [{ sku: SUBSCRIPTION_ID, offerToken }] as any,
        } as any);
      } else {
        await requestSubscription({ sku: SUBSCRIPTION_ID } as any);
      }
    } catch (error) {
      console.error('Error initiating subscription:', error);
      setPurchaseInProgress(false);
      Alert.alert('Purchase Error', 'Failed to start subscription. Please try again.');
    }
  };

  return {
    isPremium,
    isLoading,
    products: subscriptions,
    subscriptions,
    purchaseInProgress,
    purchaseRemoveAds: purchaseSubscription,
    purchaseSubscription,
    connected,
  };
};
