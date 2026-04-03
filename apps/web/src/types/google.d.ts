/**
 * TypeScript definitions for Google Identity Services (GIS)
 */

declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClient {
        callback: (response: TokenResponse) => void;
        requestAccessToken(overrideConfig?: OverridableTokenClientConfig): void;
      }

      interface TokenResponse {
        access_token: string;
        expires_in: number;
        scope: string;
        token_type: string;
        error?: string;
        error_description?: string;
        error_uri?: string;
      }

      interface TokenClientConfig {
        client_id: string;
        scope: string;
        callback?: (response: TokenResponse) => void;
        error_callback?: (error: any) => void;
      }

      interface OverridableTokenClientConfig {
        prompt?: '' | 'none' | 'consent' | 'select_account';
        enable_granular_consent?: boolean;
        login_hint?: string;
        state?: string;
      }

      function initTokenClient(config: TokenClientConfig): TokenClient;
      function revoke(token: string, callback?: () => void): void;
      function hasGrantedAnyScope(
        tokenResponse: TokenResponse,
        firstScope: string,
        ...restScopes: string[]
      ): boolean;
      function hasGrantedAllScopes(
        tokenResponse: TokenResponse,
        firstScope: string,
        ...restScopes: string[]
      ): boolean;
    }
  }
}

declare interface Window {
  gapi: any;
  google: typeof google;
}
