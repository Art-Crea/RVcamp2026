# 08 GitHub アップロード手順

## 前提

- GitHub アカウント：Art-Crea
- リポジトリ名：RVcamp2026
- 公開URL（GitHub Pages）：`https://art-crea.github.io/RVcamp2026/`
- カスタムドメイン（CNAME設定後）：`https://realvalue.art-crea.jp/`

---

## 方法 A：Git コマンドで行う（推奨・Gitが使える方）

```bash
# 1. リポジトリをクローン（初回のみ）
git clone https://github.com/Art-Crea/RVcamp2026.git
cd RVcamp2026

# 2. ファイルをすべてコピー（zip を展開したフォルダから）
cp -r /path/to/展開フォルダ/* .

# 3. portraits フォルダも確認
ls portraits | wc -l   # 36 と表示されれば OK

# 4. ステージング・コミット・プッシュ
git add .
git commit -m "v1.2: LINE Bot v2, 設営HUB, docs一式"
git push origin main

# 5. GitHub Pages の設定確認（リポジトリ Settings → Pages）
#    Source: Deploy from a branch  /  Branch: main  /  Folder: / (root)

# 6. タグを打つ
git tag v1.2
git push origin v1.2
```

---

## 方法 B：GitHub Web UI でアップロード（Git が使えない方）

1. https://github.com/Art-Crea/RVcamp2026 を開く
2. 「Add file」→「Upload files」
3. ファイルを全部ドラッグ＆ドロップ
4. `portraits/` フォルダはフォルダごとドロップできる（GitHubは対応）
5. 「Commit changes」→「Commit directly to the main branch」

> ⚠ 1回のアップロードで大量ファイルを入れると GitHubがエラーを出すことがあります。  
> その場合は10〜20ファイルずつ分けてアップロードしてください。

---

## GitHub Pages の設定

1. リポジトリ→「Settings」→「Pages」
2. Source：**Deploy from a branch**
3. Branch：**main** ／ Folder：**/ (root)**
4. 「Save」→ 数分後に `https://art-crea.github.io/RVcamp2026/` で公開

---

## カスタムドメイン（realvalue.art-crea.jp）

1. CNAME ファイルが `realvalue.art-crea.jp` と書かれていることを確認（確認済み）
2. ドメインのDNS設定でCNAMEレコードを追加：
   ```
   realvalue  CNAME  art-crea.github.io.
   ```
3. GitHub Pages「Custom domain」欄に `realvalue.art-crea.jp` を入力
4. 「Enforce HTTPS」にチェック（Let's Encrypt が自動対応）

---

## アップロード後の確認

```
https://art-crea.github.io/RVcamp2026/
↓ これらがすべて開けることを確認
https://art-crea.github.io/RVcamp2026/index.html            ← 設営HUB
https://art-crea.github.io/RVcamp2026/Kunitori.html         ← 観戦HUB
https://art-crea.github.io/RVcamp2026/rv_kunitori_board25.html  ← 合戦盤
https://art-crea.github.io/RVcamp2026/rv_gm_dashboard.html  ← GM本陣
https://art-crea.github.io/RVcamp2026/rv_player_app.html    ← 武将画面
https://art-crea.github.io/RVcamp2026/portraits/01_r.jpg    ← 肖像サンプル
```

---

## gs ファイルについて

`rv_gas_backend.gs` と `rv_line_bot.gs` は GitHub に置いてあっても動きません。  
**GAS側（Googleスプレッドシート → 拡張機能 → Apps Script）に別途貼り付けて使います。**  
GitHubはあくまでバックアップ・参照用として置いておいてください。
