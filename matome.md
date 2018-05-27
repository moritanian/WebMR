# webmr と　ProgressWebApp
## BlueTooth
GATT (web bluetooth 用のprofile)
BLE(Bluetooth Low Energy)のみ？
- ble はそれまでのBlueTooth とは互換性なし
- 1対1のcentral(端末)+peripheral(ble機器) と 1対多　のadvertising　がある


### 実装状況
chrome, android chrome, webView ,  opera で実装
http://caniuse.com/#feat=web-bluetooth
https://developer.mozilla.org/ja/docs/Web/API/Web_Bluetooth_API

- 日本語サンプル
https://ics.media/entry/15520
- 


## PWA
(repository)
https://github.com/google/web-starter-kit
(公式)
https://developers.google.com/web/tools/starter-kit/

- 日本語紹介
https://www.mitsue.co.jp/knowledge/blog/frontend/201702/23_2217.html
- qita
http://qiita.com/kawakami-kazuyoshi/items/fa0ce47b17a41fb78c82

### firebase 連携
- hosting サービス
http://qiita.com/Ijoru/items/5b27f1c32df2222514fb

- カスタムドメイン
https://firebase.google.com/docs/hosting/custom-domain?hl=ja

- Cloud Functions for Firebase
push通知などローカルにおくとまずいコードをサーバ側で実行する
http://qiita.com/koki_cheese/items/013d4e6ab5aefc792388

### Web App Manifest による　アプリ化
アプリとしてhomeバナーに追加できる

## webStorage について
https://www.html5rocks.com/ja/tutorials/offline/quota-research/
- file system
https://www.html5rocks.com/ja/tutorials/file/filesystem/

## offline APP
https://www.slideshare.net/yoshikawa_t/html5web-13105880

demo 
https://app.ft.com/index_page/reports_innovative-lawyers-pacific

- Aplication cache
html, js css をcache
manifest file で設定
エラーがあるとcacheされない()
非推奨になっている？！ service worker 使う？

- structured clone algorithm

- online/ offline events
ネットワークにつながるとデータに同期
ネットワークの速度、課金の有無のAPI

- File API/ File System API
File API  はドラッグアンドドロップで読み取れるreaderも (canvas chat でつかえそう!)

- Service worker/ cache API
キャッシュは以下がよさげ
https://github.com/GoogleChrome/sw-precache

## no-sleep
https://github.com/richtr/NoSleep.js?utm_source=mobilewebweekly&utm_medium=email

# 環境構築
git clone https://github.com/google/web-starter-kit.git [project-name]
cd [project-name]
npm install --global gulp 
npm install
(sublime に EditorConfig導入)

- サーバ起動
gulp serve

->
localhost:3000 // application
localhost:3001 // browser sync の設定画面？　browsersync はファイル編集を自動でブラウザに反映させるツール

- build
gulp // /dist にビルドされる
* winodws は.eslintrcをプロジェクト直下に置く必要あり

- firebase
npm install -g firebase-tools
firebase login
firebase deploy

- es2015のトランスパイル
そのままでは gulpfile.babel.js のみしかトランスパイルされない
min化するuglifyjsはes2015に対応していないためトランスパイル必須
.babelrcを編集する




# openCV js コンパイル
emscripten
https://github.com/kripken/emscripten
https://github.com/ucisysarch/opencvjs

## emscripten 
- winodws 
http://nanka.hateblo.jp/entry/2017/04/11/005318

# mmd
https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_mmd.html

# freenom をつかったdomain登録方法
1. http://www.freenom.com/ja/index.html ですきなdomain取得
3. firebase のhosting のドメインを接続クリック
4. ドメインの追加でs取得したドメイン入力,　レコードタイプTXT の値をメモ
5. freenomのmanage domain -> manage free nom dns タブで 
	Name: 空欄のまま	
	type:TXT
	Target : メモした値

 で追加

6. 2日くらい待ってfirebaseのhostingのdomainの登録したレコードの表示をクリックしてipアドレスをメモ
7. 5とおなじように
	Name: 空欄
	type: A
	Target :　メモした値

	で追加

