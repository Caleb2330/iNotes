import React from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AppText } from '../common/AppText';
import { Icon } from '../common/Icon';
import { useTheme } from '../../core/theme/ThemeContext';
import { useBilling } from '../../hooks/useBilling';

interface PremiumSettingsProps {
  onClose?: () => void;
}

export const PremiumSettings: React.FC<PremiumSettingsProps> = ({ onClose }) => {
  const { colors } = useTheme();
  const { isPremium, isLoading, products, purchaseInProgress, purchaseRemoveAds } = useBilling();

  const handlePurchasePress = async () => {
    if (purchaseInProgress) return;
    
    try {
      await purchaseRemoveAds();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to process purchase. Please try again.');
    }
  };

  const removeAdsProduct = products.find((p: any) => p.productId === 'remove_ads_premium_monthly');

  if (isLoading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={{ marginTop: 10 }}>Loading...</AppText>
      </View>
    );
  }

  return (
    <View style={{ padding: 16 }}>
      <View style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Icon name="crown" size={24} color={colors.primary} />
          <AppText size="title3" weight="bold" style={{ marginLeft: 8 }}>
            Premium Features
          </AppText>
        </View>

        {isPremium ? (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Icon name="checkmark-circle" size={20} color="#34C759" />
              <AppText style={{ marginLeft: 8, color: '#34C759' }}>
                Ads Removed - You're Premium!
              </AppText>
            </View>
            <AppText secondary style={{ fontSize: 14 }}>
              Thank you for supporting our app. Enjoy your ad-free experience.
            </AppText>
          </View>
        ) : (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Icon name="close-circle" size={20} color={colors.textSecondary} />
              <AppText style={{ marginLeft: 8 }}>
                Remove Ads - Subscribe to Premium
              </AppText>
            </View>
            
            <AppText secondary style={{ fontSize: 14, marginBottom: 16 }}>
              Enjoy an ad-free experience with monthly subscription. Cancel anytime.
            </AppText>

            {removeAdsProduct && (
              <TouchableOpacity
                onPress={handlePurchasePress}
                disabled={purchaseInProgress}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: purchaseInProgress ? 0.6 : 1,
                }}
              >
                {purchaseInProgress ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <AppText style={{ color: '#FFFFFF', marginLeft: 8 }}>
                      Processing...
                    </AppText>
                  </>
                ) : (
                  <>
                    <Icon name="cart" size={20} color="#FFFFFF" />
                    <AppText style={{ color: '#FFFFFF', marginLeft: 8, fontWeight: 'bold' }}>
                      Subscribe - {removeAdsProduct.localizedPrice}
                    </AppText>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
      }}>
        <AppText size="body" weight="medium" style={{ marginBottom: 8 }}>
          Premium Benefits:
        </AppText>
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Icon name="checkmark" size={16} color={colors.primary} />
            <AppText style={{ marginLeft: 8, fontSize: 14 }}>No interstitial ads</AppText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Icon name="checkmark" size={16} color={colors.primary} />
            <AppText style={{ marginLeft: 8, fontSize: 14 }}>No rewarded ads</AppText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="checkmark" size={16} color={colors.primary} />
            <AppText style={{ marginLeft: 8, fontSize: 14 }}>Support app development</AppText>
          </View>
        </View>
      </View>
    </View>
  );
};
