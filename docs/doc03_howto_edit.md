# 03 ここを変えると地図・得点・ランキングが変わる

## A. 地図の切替 → `rv_config.js`

```js
// 全員OpenStreetMap（本番推奨・APIキー不要）
MAP_MODE: 'osm',
GMAP_KEY: '',
LOCK_MAP: true,   // ← true にしないと参加者も設定を変えられてしまう

// 全員Google地図（APIキー公開が必要）
MAP_MODE: 'gmap',
GMAP_KEY: 'AIzaSy…',   // ← リファラー制限必須
LOCK_MAP: true,
```

**Google地図を使う前に必ず：**
1. [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials) → キー制限
2. アプリケーションの制限 → ウェブサイト → `https://art-crea.github.io/*`
3. APIの制限 → Maps JavaScript API のみ
4. 予算アラートを設定（上限は￥1,000/月で十分）

**Googleマイマップ（ナビ用・キー不要）：**
1. 合戦盤「陣所一覧・書出」→ CSV書出
2. [Googleマイマップ](https://www.google.com/maps/d/) → インポート
3. 共有URLを `rv_config.js` の `MYMAP_URL` に貼る
4. 参加者はGoogleマップアプリでそのままナビできる

---

## B. 陣所の追加・変更・得点変更 → `rv_data.js`

```js
const DEFAULT_CP = [
  // ↓ この1行が1つの陣所
  {name:"別府タワー", lat:33.281771, lng:131.505917,
   hint:"展望階は何階？", flag:"🗼", conf:"確定", pt:60, sensor:"GPS"},
  //                                                       ↑ ここが得点
];
```

### 得点を変えたい場合
```js
// 血の池地獄を 120pt → 200pt に変更
{name:"血の池地獄", lat:33.327173, lng:131.478173, …, pt:200, …},
```

### 陣所を追加したい場合（候補に戻す）
```js
// DEFAULT_SPARE から DEFAULT_CP に移動するだけ
{name:"鉄輪むし湯", lat:33.316165, lng:131.477793,
 hint:"石室の入浴時間は何分？", flag:"♨", conf:"確定", pt:80},
```

### 座標を現地で修正したい場合
1. 運営URLで合戦盤を開く → 「陣所編集」タブ → ピンをドラッグ → 全端末に即反映
2. 確定したら「現在の陣所を出力」→ 内容を `rv_data.js` の DEFAULT_CP に貼る

---

## C. 武将の名前・軍を変えたい → `rv_data.js`

```js
const BUSHO = [
 // a:"r" = 堀江軍（赤）, a:"b" = 溝口軍（青）
 {a:"r", name:"武田信玄", img:"portraits/01_r.jpg", …},
 //              ↑ ここを変更。img を消せばSVG兜に戻る
```

---

## D. ランキング（得点加重）の仕組み

ランキングは「占領している陣所の pt の合計」です。盤の数ではなく得点で決まります。

- 高pt陣所（杉乃井 150pt・鶴見岳 200pt）は一発逆転が起きる設計
- pt が設定されていない陣所は 40pt として集計

LINE Botの「ランキング」コマンドでも同様の集計を返します。

### ランキング表示をカスタムしたい場合
`rv_board_core.js` の `renderScore` 関数を編集します。

```js
// 例：pt合計も表示したい場合
function renderScore(s){
  var rCells = s.owner.filter(o=>o==='r').length;
  var rPt    = s.cps.reduce((sum,c,i)=> s.owner[i]==='r' ? sum+(c.pt||40) : sum, 0);
  // ... 描画に rPt を追加
}
```

---

## E. 軍の名前を変えたい → `rv_config.js`

```js
ARMY_R: '堀江軍',   // ← 変更
ARMY_B: '溝口軍',   // ← 変更
```

全画面に即反映されます（ハードコードなし）。

---

## F. ADMIN_TOKEN（必ず変更してください）

```js
ADMIN_TOKEN: 'honjin827',   // ← 自分だけが知る文字列に変更
```

変更後、運営URL は `.../rv_kunitori_board25.html?admin=あなたのトークン` になります。
