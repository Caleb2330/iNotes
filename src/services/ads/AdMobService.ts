import { Platform } from 'react-native';
import mobileAds, {
    AdEventType,
    InterstitialAd,
    RewardedAd,
    RewardedAdEventType,
    TestIds,
} from 'react-native-google-mobile-ads';

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

    static async showInterstitial(): Promise<void> {
        await this.ensureInitialized();

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
                cleanup();
                reject(error);
            });

            const cleanup = () => {
                unsubscribeLoaded();
                unsubscribeClosed();
                unsubscribeError();
            };

            interstitial.load();
        });
    }

    static async showRewarded(): Promise<RewardedResult> {
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
                cleanup();
                reject(error);
            });

            const cleanup = () => {
                unsubscribeLoaded();
                unsubscribeEarned();
                unsubscribeClosed();
                unsubscribeError();
            };

            rewarded.load();
        });
    }
}
