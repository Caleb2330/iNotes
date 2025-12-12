import * as LocalAuthentication from 'expo-local-authentication';

export class BiometricService {
    static async hasHardware(): Promise<boolean> {
        return await LocalAuthentication.hasHardwareAsync();
    }

    static async isEnrolled(): Promise<boolean> {
        return await LocalAuthentication.isEnrolledAsync();
    }

    static async authenticate(reason: string = 'Authenticate to access locked note'): Promise<boolean> {
        try {
            const hasHardware = await this.hasHardware();
            const isEnrolled = await this.isEnrolled();

            // Check security level
            const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: reason,
                fallbackLabel: 'Use Passcode',
                disableDeviceFallback: false,
                cancelLabel: 'Cancel'
            });

            return result.success;
        } catch (error) {
            console.error('Authentication error:', error);
            // We return false here instead of throwing to avoid crashing the flow, 
            // but the caller can handle the false return as a failure.
            return false;
        }
    }
}
