package com.tomfong.simpleqr;

import android.content.Intent;
import android.os.Build;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;
import android.util.Log;

import androidx.annotation.RequiresApi;

@RequiresApi(api = Build.VERSION_CODES.N)
public class MyQSTileService extends TileService {

  public MyQSTileService() {}

  // Called when the user adds your tile.
  @Override
  public void onTileAdded() {
    super.onTileAdded();
    Log.println(Log.INFO,"MyQSTileService","onTileAdded");
  }

  // Called when your app can update your tile.
  @Override
  public void onStartListening() {
    super.onStartListening();
    Log.println(Log.INFO,"MyQSTileService","onStartListening");
    Tile tile = this.getQsTile();
    if (MainActivity.active) {
      tile.setState(Tile.STATE_ACTIVE);
    } else {
      tile.setState(Tile.STATE_INACTIVE);
    }
    tile.updateTile();
  }

  // Called when your app can no longer update your tile.
  @Override
  public void onStopListening() {
    super.onStopListening();
    Log.println(Log.INFO,"MyQSTileService","onStopListening");
  }

  // Called when the user taps on your tile in an active or inactive state.
  @Override
  public void onClick() {
    super.onClick();
    Log.println(Log.INFO,"MyQSTileService","onClick");
    Tile tile = this.getQsTile();
    Intent intent = new Intent(this.getApplicationContext(), MainActivity.class);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    startActivityAndCollapse(intent);
    tile.setState(Tile.STATE_ACTIVE);
    tile.updateTile();
  }

  // Called when the user removes your tile.
  @Override
  public void onTileRemoved() {
    super.onTileRemoved();
    Log.println(Log.INFO,"MyQSTileService","onTileRemoved");
  }
}
