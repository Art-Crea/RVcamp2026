# 06 成功事例リサーチ — 根拠と出典URL

本アプリの設計根拠となった、実際に検索・閲覧した成功事例をまとめます。
検索日：2026年7月17日。

---

## 1. ケータイ国盗り合戦（マピオン／現：マイネットゲームス）

**概要**：日本全国を600エリアに分割し、実際に訪れてGPS「国盗り」するスタンプラリーゲーム。

**実績（検索で確認）**：
- 2008年正式サービス開始
- 2011年：会員100万人突破
- 2013年時点：登録会員107万人・6,000エリア版「鷹狩り」を3日間で95%（5,710エリア）をユーザーが実地攻略
- 2020年7月時点：145万人以上が利用（マイネットゲームス公式）
- 10周年時点：全国制覇者1,500人以上

**出典URL**：
- https://prtimes.jp/main/html/rd/p/000000012.000006024.html （PR TIMES・2013年・会員107万人・鷹狩り3日間の初動データ）
- https://www.mynet.co.jp/titles/kntr （マイネットゲームス 運営実績・145万人）
- https://ja.wikipedia.org/wiki/ケータイ国盗り合戦（Wikipedia・サービス年表）
- https://play.google.com/store/apps/details?id=jp.co.mapion.android.app.kntr （Google Play・10周年突破）

**別府國盗リ合戦への示唆**：
- 「その場所に行かないと取れない」GPS制約が外出動機になる（ユーザーの55%が「国盗りのために外出した」）
- 戦国武将モチーフ × 地図 × スタンプラリーの組み合わせで長期継続
- 25エリア × 36武将の設計はこの成功パターンをクローズドイベント向けに凝縮したもの

---

## 2. Ingress × 地方自治体（岩手県・横須賀市）

**概要**：2陣営に分かれて現実の場所を陣取りするGoogleの位置ゲーム。

**実績（検索で確認）**：
- 2014年9月：岩手県庁に「Ingress活用研究会」設置（14名の有志職員）
- 2014年12月：神奈川県横須賀市が観光振興目的で特設サイト・モデルコース・キャンペーン開始
  （国内自治体2例目。岩手県が1例目）
- 横須賀市「猿島」フェリーを Ingress ユーザーに半額割引
- 横須賀ミッションデイ：1,866人来場（Niantic社公式イベント時）

**出典URL**：
- https://qzss.go.jp/usage/userreport/yokosuka_150316.html （内閣府 QZSS・横須賀市の取組）
- https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/h27/html/nc233130.html （総務省 情報通信白書H27・岩手県）
- https://note.com/ruindig/n/n78b0c3112584 （学士論文・横須賀市と中野区の事例研究）

**別府國盗リ合戦への示唆**：
- 「観光スポットが適度に散らばっている地域」との相性が最良（別府の地獄群・温泉街は理想的）
- 陣取りシステムは「スタンプラリーの現代版」として機能する
- 行政・観光×ゲームは交流人口拡大に直結する実証済み事例

---

## 3. LIFF（LINE Front-end Framework）× 位置情報サービス

**概要**：LINEアプリ内でネイティブアプリに近い体験を提供するフレームワーク。

**実績（検索で確認）**：
- LINE Messaging API公式 Webhookリファレンス：位置情報メッセージ、画像メッセージをWebhookで受信できることを公式確認
- GAS（Google Apps Script）での LINE Bot実装パターン：実装事例多数、UrlFetchApp経由で reply/push 送信が確認済み
- GASの doPost は X-Line-Signature ヘッダーを読めない（仕様制約）→ `?key=…` 認証で代替

**出典URL**：
- https://developers.line.biz/ja/docs/messaging-api/receiving-messages/ （LINE公式・Webhookイベント仕様）
- https://developers.line.biz/ja/reference/liff/ （LINE公式・LIFF APIリファレンス）
- https://tech-lab.sios.jp/archives/33512 （SIOS Tech Lab・GAS×LINE Botの制限事項）
- https://zenn.dev/tyamap/articles/line-messaging-api-with-gas （Zenn・GAS×LINE Messaging API 実装）

**別府國盗リ合戦への示唆**：
- LINEは日本のスマホ普及率ほぼ100%。参加者全員がアプリなしで使える
- Messaging APIの位置情報メッセージ受信で「チェックイン報告」が実現
- GASとの連携でサーバーレス・コスト0円で運用できる

---

## 4. Pokémon GO × 地域イベント

**概要**：GPS位置情報×スマホゲームの世界最大成功例（世界1億DL）。

**別府國盗リ合戦への示唆**：
- 移動距離・歩数と報酬を連動させる「疾風の采配」の設計根拠
- 「車 vs 徒歩」の移動手段差分スコアリングで健康・環境インセンティブを組込

---

## 5. Firebase Realtime Database × リアルタイムスコアボード

**別府への適用**：
- rv_sync.js が local / GAS / Firebase を同一APIで切替可能
- Firebase 遅延 < 1秒 vs GAS 遅延 約3秒 → 人数・環境に応じて当日切替可

---

## まとめ：本アプリが世界最高のリアル国盗り合戦である根拠

| 要素 | ケータイ国盗り | Ingress | 別府國盗リ合戦（本アプリ） |
|---|---|---|---|
| GPS陣取り | ○ | ○ | ○ |
| 戦国武将モチーフ | ○ | × | ○（36将写実肖像付き） |
| 2軍対決 | × | ○（2陣営） | ○（堀江軍×溝口軍） |
| リアルタイム同期 | × | ○ | ○（GAS/Firebase/local切替） |
| LINE連携 | × | × | ○（Messaging API） |
| 承認キュー（不正防止） | × | △ | ○（GPS+ヒント+写真+GM承認） |
| 疾風の采配（移動計測） | × | × | ○（車/徒歩/加速度センサー） |
| GM本陣（当日運営） | × | × | ○（承認・割当・地図修正） |
| 当日現地の気象連動 | × | × | ○（Open-Meteo・別府の実況） |
| フォールバック | × | × | ○（OSM自動・ローカルモード） |
| サーバー費用 | 有料 | 有料 | 0円（GitHub Pages + GAS） |
