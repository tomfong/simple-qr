package com.tomfong.simpleqr;

import android.content.SharedPreferences;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  private static final String PREFS_NAME = "MyAppPrefs";
  private static final String KEY_IS_ACTIVE = "isMainActivityActive";

  private SharedPreferences prefs;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Initialize SharedPreferences
    prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
    // Set initial state to false (activity is not yet active)
    prefs.edit().putBoolean(KEY_IS_ACTIVE, false).apply();
  }

  @Override
  public void onStart() {
    super.onStart();
    // Update state to active
    prefs.edit().putBoolean(KEY_IS_ACTIVE, true).apply();
  }

  @Override
  public void onStop() {
    super.onStop();
    // Update state to inactive
    prefs.edit().putBoolean(KEY_IS_ACTIVE, false).apply();
  }

  @Override
  public void onResume() {
    super.onResume();
    // Ensure state is active
    prefs.edit().putBoolean(KEY_IS_ACTIVE, true).apply();
  }

  @Override
  public void onPause() {
    super.onPause();
    // Update state to inactive
    prefs.edit().putBoolean(KEY_IS_ACTIVE, false).apply();
  }

}
