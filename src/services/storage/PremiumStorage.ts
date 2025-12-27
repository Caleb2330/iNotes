import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_STATUS_KEY = '@premium_status';

export class PremiumStorage {
  static async setPremiumStatus(isPremium: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(PREMIUM_STATUS_KEY, JSON.stringify(isPremium));
    } catch (error) {
      console.error('Failed to save premium status:', error);
      throw error;
    }
  }

  static async getPremiumStatus(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
      return value ? JSON.parse(value) : false;
    } catch (error) {
      console.error('Failed to get premium status:', error);
      return false;
    }
  }

  static async clearPremiumStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREMIUM_STATUS_KEY);
    } catch (error) {
      console.error('Failed to clear premium status:', error);
      throw error;
    }
  }
}
