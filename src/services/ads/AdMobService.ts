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

// Policy-compliant frequency caps. Google flags apps that show interstitials
// too often or at unexpected moments; these guards keep us well inside the
// "natural transition only" boundary.
const MIN_MS_BETWEEN_INTERSTITIALS = 60_000;       // hard floor between ads
const COLD_START_GRACE_MS = 60_000;                // never show in first 60s after launch
const MIN_ACTIONS_BETWEEN_INTERSTITIALS = 2;       // user must take >= 2 meaningful actions
const TEMP_AD_FREE_KEY_MS = 24 * 60 * 60 * 1000;   // 24h ad-free reward window

const appLaunchedAt = Date.now();

export class AdMobService {
    private static initialized: Promise<void> | null = null;
    private static interstitial: InterstitialAd | null = null;
    private static interstitialReady = false;
    private static rewarded: RewardedAd | null = null;
    private static rewardedReady = false;
    private static lastInterstitialShownAt = 0;
    private static actionsSinceLastInterstitial = 0;
    private static tempAdFreeUntil = 0;

    private static async ensureInitialized(): Promise<void> {
        if (Platform.OS !== 'android') {
            throw new Error('AdMob is not configured for this platform.');
        }

        if (!this.initialized) {
            this.initialized = mobileAds()
                .initialize()
                .then(() => {
                    this.preloadInterstitial();
                    this.preloadRewarded();
                });
        }

        await this.initialized;
    }

    private static preloadInterstitial(): void {
        const ad = InterstitialAd.createForAdRequest(interstitialAdUnitId);
        this.interstitial = ad;
        this.interstitialReady = false;

        const onLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
            this.interstitialReady = true;
        });
        const onClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            onLoaded();
            onClosed();
            onError();
            this.preloadInterstitial();
        });
        const onError = ad.addAdEventListener(AdEventType.ERROR, () => {
            onLoaded();
            onClosed();
            onError();
            // Retry once after a short backoff so we don't tight-loop on failure.
            setTimeout(() => this.preloadInterstitial(), 30_000);
        });

        ad.load();
    }

    private static preloadRewarded(): void {
        const ad = RewardedAd.createForAdRequest(rewardedAdUnitId);
        this.rewarded = ad;
        this.rewardedReady = false;

        const onLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
            this.rewardedReady = true;
        });
        const onClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            onLoaded();
            onClosed();
            onError();
            this.preloadRewarded();
        });
        const onError = ad.addAdEventListener(AdEventType.ERROR, () => {
            onLoaded();
            onClosed();
            onError();
            setTimeout(() => this.preloadRewarded(), 30_000);
        });
    }

    private static async shouldShowAds(): Promise<boolean> {
        if (Date.now() < this.tempAdFreeUntil) {
            return false;
        }
        const isPremium = await PremiumStorage.getPremiumStatus();
        return !isPremium;
    }

    /**
     * Call this when the user completes a meaningful action (save note,
     * delete note, exit settings, etc). It increments the action counter
     * used by the interstitial frequency cap. Does NOT show an ad.
     */
    static recordUserAction(): void {
        this.actionsSinceLastInterstitial += 1;
    }

    /**
     * Initialize the SDK + preload ads. Safe to call early — does NOT show an ad.
     * Call from App.tsx instead of showing an interstitial on launch.
     */
    static async initialize(): Promise<void> {
        if (Platform.OS !== 'android') return;
        try {
            await this.ensureInitialized();
        } catch (error) {
            console.error('AdMob initialize failed:', error);
        }
    }

    /**
     * Show an interstitial at a natural transition point (e.g., user just
     * finished editing a note and is returning to the list). Silently no-ops
     * when frequency cap, cold-start grace, premium, or ad-not-ready conditions
     * aren't met. Never blocks the caller — fire-and-forget.
     *
     * @param trigger A short label for logging which transition this was.
     */
    static async maybeShowInterstitialAtTransition(trigger: string): Promise<void> {
        if (Platform.OS !== 'android') return;

        const now = Date.now();
        if (now - appLaunchedAt < COLD_START_GRACE_MS) return;
        if (now - this.lastInterstitialShownAt < MIN_MS_BETWEEN_INTERSTITIALS) return;
        if (this.actionsSinceLastInterstitial < MIN_ACTIONS_BETWEEN_INTERSTITIALS) return;

        try {
            if (!(await this.shouldShowAds())) return;
            await this.ensureInitialized();

            const ad = this.interstitial;
            if (!ad || !this.interstitialReady) return;

            this.lastInterstitialShownAt = now;
            this.actionsSinceLastInterstitial = 0;
            this.interstitialReady = false;
            ad.show();
            console.log('[Ads] Interstitial shown at transition:', trigger);
        } catch (error) {
            console.error('[Ads] Interstitial show failed:', error);
        }
    }

    /**
     * Opt-in rewarded ad. Caller MUST have shown a confirmation UI describing
     * the reward before invoking this. Returns the reward (or null if the ad
     * didn't complete) so the caller can grant it.
     */
    static async showRewarded(): Promise<RewardedResult> {
        if (Platform.OS !== 'android') return null;

        try {
            await this.ensureInitialized();

            const ad = this.rewarded;
            if (!ad || !this.rewardedReady) {
                // Caller already promised the user a reward; load on-demand
                // as a fallback so we don't silently fail.
                return await this.showRewardedOnDemand();
            }

            return await new Promise<RewardedResult>(resolve => {
                let reward: RewardedResult = null;
                let settled = false;
                const settle = (value: RewardedResult) => {
                    if (settled) return;
                    settled = true;
                    unsubEarned();
                    unsubClosed();
                    unsubError();
                    resolve(value);
                };

                const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, earned => {
                    reward = earned;
                });
                const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => settle(reward));
                const unsubError = ad.addAdEventListener(AdEventType.ERROR, error => {
                    console.error('[Ads] Rewarded error:', error);
                    settle(null);
                });

                this.rewardedReady = false;
                ad.show();
            });
        } catch (error) {
            console.error('[Ads] Rewarded show failed:', error);
            return null;
        }
    }

    private static async showRewardedOnDemand(): Promise<RewardedResult> {
        return new Promise<RewardedResult>(resolve => {
            const ad = RewardedAd.createForAdRequest(rewardedAdUnitId);
            let reward: RewardedResult = null;
            let settled = false;
            const settle = (value: RewardedResult) => {
                if (settled) return;
                settled = true;
                unsubLoaded();
                unsubEarned();
                unsubClosed();
                unsubError();
                resolve(value);
            };

            const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => ad.show());
            const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, earned => {
                reward = earned;
            });
            const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => settle(reward));
            const unsubError = ad.addAdEventListener(AdEventType.ERROR, error => {
                console.error('[Ads] Rewarded on-demand error:', error);
                settle(null);
            });

            ad.load();
            // Hard timeout so the opt-in dialog flow can't hang the user forever.
            setTimeout(() => settle(reward), 15_000);
        });
    }

    /**
     * Grant the user a 24-hour ad-free window. Used as the reward for the
     * opt-in rewarded ad in Settings.
     */
    static grantTemporaryAdFree(): void {
        this.tempAdFreeUntil = Date.now() + TEMP_AD_FREE_KEY_MS;
    }

    static getTemporaryAdFreeUntil(): number {
        return this.tempAdFreeUntil;
    }
}
