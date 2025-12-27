import { Platform } from 'react-native';
import mobileAds, {
    AdEventType,
    InterstitialAd,
    RewardedAd,
    RewardedAdEventType,
    TestIds,
} from 'react-native-google-mobile-ads';
import { PremiumStorage } from '../storage/PremiumStorage';

export type RewardedResult = { type: string; amount: number } | null;

const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3826884259673002/6117754508';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-3826884259673002/2178509498';

export class AdMobService {
    private static initialized: Promise<void> | null = null;

    private static async ensureInitialized(): Promise<void> {
        if (Platform.OS !== 'android') {
            throw new Error('AdMob is not configured for this platform.');
        }

        if (!this.initialized) {
            this.initialized = mobileAds()
                .initialize()
                .then(() => undefined);
        }

        await this.initialized;
    }

    private static async shouldShowAds(): Promise<boolean> {
        const isPremium = await PremiumStorage.getPremiumStatus();
        return !isPremium;
    }

    static async showInterstitial(): Promise<void> {
        try {
            await this.ensureInitialized();
            
            const shouldShow = await this.shouldShowAds();
            if (!shouldShow) {
                console.log('User is premium, skipping interstitial ad');
                return;
            }

            return new Promise((resolve, reject) => {
                const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId);

                const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
                    interstitial.show();
                });

                const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                    cleanup();
                    resolve();
                });

                const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, error => {
                    console.error('Interstitial Ad Error:', error);
                    cleanup();
                    resolve(); // Resolve anyway to not block user flow
                });

                const cleanup = () => {
                    unsubscribeLoaded();
                    unsubscribeClosed();
                    unsubscribeError();
                };

                interstitial.load();

                // Safety timeout to ensure user is never blocked for more than 5 seconds
                setTimeout(() => {
                    cleanup();
                    resolve();
                }, 5000);
            });
        } catch (error) {
            console.error('AdMob showInterstitial failed:', error);
        }
    }

    static async showRewarded(): Promise<RewardedResult> {
        try {
            await this.ensureInitialized();

            return new Promise((resolve, reject) => {
                const rewarded = RewardedAd.createForAdRequest(rewardedAdUnitId);
                let reward: RewardedResult = null;

                const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
                    rewarded.show();
                });

                const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, earned => {
                    reward = earned;
                });

                const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
                    cleanup();
                    resolve(reward);
                });

                const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, error => {
                    console.error('Rewarded Ad Error:', error);
                    cleanup();
                    resolve(null); // Resolve with null to not block user flow
                });

                const cleanup = () => {
                    unsubscribeLoaded();
                    unsubscribeEarned();
                    unsubscribeClosed();
                    unsubscribeError();
                };

                rewarded.load();

                // Safety timeout
                setTimeout(() => {
                    cleanup();
                    resolve(null);
                }, 8000);
            });
        } catch (error) {
            console.error('AdMob showRewarded failed:', error);
            return null;
        }
    }
}
