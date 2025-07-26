package com.tomfong.simpleqr;

import android.app.Dialog;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;
import android.util.Log;

import androidx.annotation.RequiresApi;

@RequiresApi(api = Build.VERSION_CODES.N)
public class MyQSTileService extends TileService {

  private static final String TAG = "MyQSTileService";

  public MyQSTileService() {}

  // Called when the user adds your tile.
  @Override
  public void onTileAdded() {
    super.onTileAdded();
    Log.println(Log.INFO, TAG,"onTileAdded");
  }

  private boolean isMainActivityActive() {
    SharedPreferences prefs = getApplicationContext().getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE);
    return prefs.getBoolean("isMainActivityActive", false);
  }

  // Called when your app can update your tile.
  @Override
  public void onStartListening() {
    super.onStartListening();
    Log.println(Log.INFO, TAG, "onStartListening");
    Tile tile = getQsTile();
    if (tile != null) {
      tile.setState(isMainActivityActive() ? Tile.STATE_ACTIVE : Tile.STATE_INACTIVE);
      tile.updateTile();
    } else {
      Log.println(Log.WARN, TAG, "Tile is null in onStartListening");
    }
  }

  // Called when your app can no longer update your tile.
  @Override
  public void onStopListening() {
    super.onStopListening();
    Log.println(Log.INFO, TAG,"onStopListening");
  }

  // Called when the user taps on your tile in an active or inactive state.
  @Override
  public void onClick() {
    super.onClick();
    Log.println(Log.INFO, TAG, "onClick");
    Tile tile = getQsTile();
    if (tile != null) {
      try {
        if (isMainActivityActive()) {
          // Activity is already active; just collapse the Quick Settings panel
          var dialog = new Dialog(getApplicationContext());
          showDialog(dialog);
          dialog.dismiss();
        } else {
          Intent intent = new Intent(getApplicationContext(), MainActivity.class);
          intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK);
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startActivityAndCollapse(PendingIntent.getActivity(
              getApplicationContext(),
              0,
              intent,
              PendingIntent.FLAG_IMMUTABLE
            ));
          } else {
            startActivityAndCollapse(intent);
          }
          tile.setState(Tile.STATE_ACTIVE);
          tile.updateTile();
        }
      } catch(Exception e){
        Log.println(Log.ERROR, TAG, "Failed to start activity: " + e.getMessage());
      }
    } else {
      Log.println(Log.WARN, TAG, "Tile is null in onClick");
    }
  }

  // Called when the user removes your tile.
  @Override
  public void onTileRemoved() {
    super.onTileRemoved();
    Log.println(Log.INFO,TAG,"onTileRemoved");
  }
}
