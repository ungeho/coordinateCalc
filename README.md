# coordinateCalc  
  
中心とする座標、半径、角度を入力して座標を計算  
  
splatoonのPreset製作等に。  
  
## 使用例(splatoon)  
  
### 中心座標から座標を設定  
  
マップによって中心座標を調整する。ほとんどの場合は(100,100)  
表示したい座標を半径（長さ）と角度(0度は東、90度は北)で設定する。  
計算結果は`Circle at fixed coordinates`や`Line between two fixed coordinate`等の項目で`reference position`に入力して使用する。  
### オブジェクトの位置から相対的な座標を設定  
  
マップの中心の座標からオブジェクトの座標を引いたものを中心座標として設定する。  
例えば、マップの中心の座標(100,100)、オブジェクト座標(120,100)だった場合、(-20,0)または(100-120,100-100)を中心座標として設定する。  
表示したい座標を半径（長さ）と角度(0度は東、90度は北)で設定する。  
計算結果は`Circle relative to object position`や`Line relative to object position`等の項目で`オフセット`に入力して使用する。