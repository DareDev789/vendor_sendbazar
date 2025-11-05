package com.sendbazar.vendor;

import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.content.ContextCompat;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import java.util.ArrayList;
import com.getcapacitor.community.facebooklogin.FacebookLogin;
import java.net.InetAddress;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    registerPlugin(FacebookLogin.class);

    Window window = getWindow();
    
    // Définir la couleur de fond
    window.setStatusBarColor(ContextCompat.getColor(this, R.color.status_bar_color));
    window.setNavigationBarColor(ContextCompat.getColor(this, R.color.status_bar_color));

    // Pour Android M (API 23) et supérieur
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
      // Icônes blanches pour la barre de statut
      window.getDecorView().setSystemUiVisibility(
        View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | 
        View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
      );
    }
    
    // Pour Android O (API 26) et supérieur - gestion améliorée
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
      int flags = window.getDecorView().getSystemUiVisibility();
      flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
      flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
      window.getDecorView().setSystemUiVisibility(flags);
    }

    // if (!isOnline()) {
    //   // Charge le contenu local (dist/index.html)
    //   WebView webView = this.bridge.getWebView();
    //   webView.loadUrl("file:///android_asset/public/offline.html");
    // }
  }
  
  @Override
  public void onBackPressed() {
    WebView webView = (WebView) this.bridge.getWebView();
    if (webView != null && webView.canGoBack()) {
      webView.goBack();
    } else {
      super.onBackPressed();
    }
  }

  private boolean isOnline() {
    try {
      InetAddress ipAddr = InetAddress.getByName("google.com");
      return !ipAddr.equals("");
    } catch (Exception e) {
      return false;
    }
  }
}