import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sendbazar.vendor',
  appName: 'Sendbazar Vendor',
  webDir: 'dist',
  server: {
    url: 'https://vendor.sendbazar.com/',
    cleartext: true,
  },
  plugins: {
    FirebaseAuthentication: {
      authDomain: "vendorsendbazar-d065a.firebaseapp.com",
      skipNativeAuth: false,
      providers: ["apple.com", "facebook.com", "google.com",],
    },
    FacebookLogin: {
      permissions: ["email", "public_profile"]
    }
  },
};

export default config;
