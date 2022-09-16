package com.tomfong.simpleqr;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  static boolean active = false;

  @Override
  public void onStart() {
    super.onStart();
    active = true;
  }

  @Override
  public void onStop() {
    super.onStop();
    active = false;
  }

}
