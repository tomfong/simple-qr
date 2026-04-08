package com.tomfong.simpleqr;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class MainActivity extends BridgeActivity {

  private static final String PREFS_NAME = "MyAppPrefs";
  private static final String KEY_IS_ACTIVE = "isMainActivityActive";

  private SharedPreferences prefs;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
    prefs.edit().putBoolean(KEY_IS_ACTIVE, false).apply();

    // Handle shared intent in onCreate with delay to avoid crash
    final Intent intent = getIntent();
    if (intent != null && Intent.ACTION_SEND.equals(intent.getAction()) && "text/plain".equals(intent.getType())) {
      final String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
      if (sharedText != null && !sharedText.isEmpty()) {
        // Post to message queue to ensure activity is fully created
        new android.os.Handler(getMainLooper()).postDelayed(() -> {
          notifySharedText(sharedText);
        }, 100);
      }
    }
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    handleSharedIntent(intent);
  }

  private void handleSharedIntent(Intent intent) {
    String action = intent.getAction();
    String type = intent.getType();

    if (Intent.ACTION_SEND.equals(action) && "text/plain".equals(type)) {
      String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
      if (sharedText != null && !sharedText.isEmpty()) {
        notifySharedText(sharedText);
      }
    }
  }

  private void notifySharedText(String text) {
    // Encode shared text safely for URL query param
    // URLEncoder encodes spaces as '+', but URLs typically expect '%20'
    String encodedText = null;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8).replace("+", "%20");
    }
    String url = "simpleqr://share?text=" + encodedText;

    Intent viewIntent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url));
    // Reuse existing task/activity when possible so Capacitor delivers appUrlOpen/onNewIntent
    viewIntent.setPackage(getPackageName());
    viewIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_FROM_BACKGROUND);
    startActivity(viewIntent);
  }

  @Override
  public void onStart() {
    super.onStart();
    prefs.edit().putBoolean(KEY_IS_ACTIVE, true).apply();
  }

  @Override
  public void onStop() {
    super.onStop();
    prefs.edit().putBoolean(KEY_IS_ACTIVE, false).apply();
  }

  @Override
  public void onResume() {
    super.onResume();
    prefs.edit().putBoolean(KEY_IS_ACTIVE, true).apply();
  }

  @Override
  public void onPause() {
    super.onPause();
    prefs.edit().putBoolean(KEY_IS_ACTIVE, false).apply();
  }

}
