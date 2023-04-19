export {};

declare global {
  interface Window {
    strapi: {
      backendURL: string;
      isEE: boolean;
      features: {
        SSO: 'sso';
        isEnabled: () => boolean;
      };
      projectType: string;
    };
  }
}
