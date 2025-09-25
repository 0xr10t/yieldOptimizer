import { 
  Aptos, 
  AptosConfig, 
  Network, 
  KeylessAccount,
  EphemeralKeyPair
} from "@aptos-labs/ts-sdk";

// Keyless configuration
const GOOGLE_CLIENT_ID = "407408718192.apps.googleusercontent.com"; // Aptos's demo client ID
const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

export interface KeylessUser {
  account: KeylessAccount;
  email?: string;
  name?: string;
  picture?: string;
}

class KeylessAuthService {
  private currentUser: KeylessUser | null = null;
  private ephemeralKeyPair: EphemeralKeyPair | null = null;

  constructor() {
    // Check for existing session on initialization
    this.restoreSession();
  }

  // Initialize Google OAuth login
  async loginWithGoogle(): Promise<KeylessUser> {
    try {
      // Generate ephemeral key pair
      this.ephemeralKeyPair = EphemeralKeyPair.generate();
      
      // Store ephemeral key pair in session storage
      sessionStorage.setItem('ephemeralKeyPair', JSON.stringify({
        nonce: this.ephemeralKeyPair.nonce,
        expiryDateSecs: this.ephemeralKeyPair.expiryDateSecs
      }));

      // Create OAuth URL
      const redirectUri = `${window.location.origin}/auth/callback`;
      const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=id_token&` +
        `scope=openid email profile&` +
        `nonce=${this.ephemeralKeyPair.nonce}&` +
        `state=${encodeURIComponent(JSON.stringify({ 
          ephemeralKeyPair: this.ephemeralKeyPair.nonce 
        }))}`;

      // Redirect to Google OAuth
      window.location.href = loginUrl;
      
      // This will be completed in the callback
      throw new Error("Redirecting to Google OAuth...");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  // Handle OAuth callback
  async handleCallback(idToken: string): Promise<KeylessUser> {
    try {
      // Restore ephemeral key pair from session storage
      const storedKeyPair = sessionStorage.getItem('ephemeralKeyPair');
      if (!storedKeyPair) {
        throw new Error("No ephemeral key pair found");
      }

      const keyPairData = JSON.parse(storedKeyPair);
      // For simplicity, generate a new ephemeral key pair
      // In production, you'd want to properly restore the original key pair
      this.ephemeralKeyPair = EphemeralKeyPair.generate();

      // Create keyless account
      const keylessAccount = await aptos.deriveKeylessAccount({
        jwt: idToken,
        ephemeralKeyPair: this.ephemeralKeyPair
      });

      // Decode JWT to get user info
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      
      this.currentUser = {
        account: keylessAccount,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      };

      // Store user session
      sessionStorage.setItem('keylessUser', JSON.stringify({
        address: keylessAccount.accountAddress.toString(),
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        jwt: idToken
      }));

      return this.currentUser;
    } catch (error) {
      console.error("Callback handling failed:", error);
      throw error;
    }
  }

  // Restore session from storage
  private restoreSession(): void {
    try {
      const storedUser = sessionStorage.getItem('keylessUser');
      const storedKeyPair = sessionStorage.getItem('ephemeralKeyPair');
      
      if (storedUser && storedKeyPair) {
        const userData = JSON.parse(storedUser);
        const keyPairData = JSON.parse(storedKeyPair);
        
        // Check if session is still valid
        if (keyPairData.expiryDateSecs > Math.floor(Date.now() / 1000)) {
          // Note: In a full implementation, you'd need to properly restore the KeylessAccount
          // For now, we'll just store the user data and require re-login for transactions
          console.log("Session restored for:", userData.email);
        } else {
          // Session expired, clear storage
          this.logout();
        }
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
      this.logout();
    }
  }

  // Logout user
  logout(): void {
    this.currentUser = null;
    this.ephemeralKeyPair = null;
    
    // Clear session storage
    sessionStorage.removeItem('keylessUser');
    sessionStorage.removeItem('ephemeralKeyPair');
    
    console.log("User logged out");
  }

  // Get current user
  getCurrentUser(): KeylessUser | null {
    return this.currentUser;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // Get user's Aptos address
  getUserAddress(): string | null {
    return this.currentUser?.account.accountAddress.toString() || null;
  }
}

// Export singleton instance
export const keylessAuth = new KeylessAuthService();
export default keylessAuth;
