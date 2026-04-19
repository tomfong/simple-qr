package com.tomfong.simpleqr;

import android.content.ClipData;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

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
    if (intent != null && Intent.ACTION_SEND.equals(intent.getAction())) {
      final String type = intent.getType();
      if ("text/plain".equals(type)) {
        final String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (sharedText != null && !sharedText.isEmpty()) {
          new android.os.Handler(getMainLooper()).postDelayed(() -> {
            notifySharedText(sharedText);
          }, 100);
        }
      } else if (type != null && type.startsWith("image/")) {
        final Uri imageUri = getImageUriFromIntent(intent);
        if (imageUri != null) {
          new android.os.Handler(getMainLooper()).postDelayed(() -> {
            notifySharedImage(imageUri);
          }, 100);
        }
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
    android.util.Log.d("MainActivity", "handleSharedIntent() action=" + action + " type=" + type);

    if (Intent.ACTION_SEND.equals(action)) {
      android.util.Log.d("MainActivity", "ACTION_SEND detected");
      if ("text/plain".equals(type)) {
        String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (sharedText != null && !sharedText.isEmpty()) {
          notifySharedText(sharedText);
        }
      } else if (type != null && type.startsWith("image/")) {
        Uri imageUri = getImageUriFromIntent(intent);
        if (imageUri != null) {
          notifySharedImage(imageUri);
        }
      }
    }
  }

  private Uri getImageUriFromIntent(Intent intent) {
    Uri uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
    if (uri == null) {
      ClipData clipData = intent.getClipData();
      if (clipData != null && clipData.getItemCount() > 0) {
        uri = clipData.getItemAt(0).getUri();
      }
    }
    return uri;
  }

  private void notifySharedText(String text) {
    String encodedText = null;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8).replace("+", "%20");
    }
    String url = "simpleqr://share?text=" + encodedText;

    Intent viewIntent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url));
    viewIntent.setPackage(getPackageName());
    viewIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_FROM_BACKGROUND);
    startActivity(viewIntent);
  }

  private void notifySharedImage(Uri imageUri) {
    android.util.Log.d("MainActivity", "notifySharedImage() called with URI: " + imageUri);
    try {
      InputStream inputStream = getContentResolver().openInputStream(imageUri);
      if (inputStream == null) {
        android.util.Log.e("MainActivity", "InputStream was null for URI: " + imageUri);
        return;
      }

      // Copy image to app cache with unique filename
      File cacheDir = getCacheDir();
      String filename = "shared_" + UUID.randomUUID().toString() + ".jpg";
      File outputFile = new File(cacheDir, filename);
      android.util.Log.d("MainActivity", "Copying image to: " + outputFile.getAbsolutePath());
      FileOutputStream outputStream = new FileOutputStream(outputFile);
      byte[] buffer = new byte[4096];
      int bytesRead;
      while ((bytesRead = inputStream.read(buffer)) != -1) {
        outputStream.write(buffer, 0, bytesRead);
      }
      inputStream.close();
      outputStream.close();

      // Notify via URL with encoded cache path
      String encodedPath = URLEncoder.encode(outputFile.getAbsolutePath(), StandardCharsets.UTF_8).replace("+", "%20");
      String url = "simpleqr://scan-image?path=" + encodedPath;
      android.util.Log.d("MainActivity", "Launching URL: " + url);

      Intent viewIntent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url));
      viewIntent.setPackage(getPackageName());
      viewIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_FROM_BACKGROUND);
      startActivity(viewIntent);
    } catch (Exception e) {
      android.util.Log.e("MainActivity", "Error in notifySharedImage: " + e.getMessage());
    }
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
