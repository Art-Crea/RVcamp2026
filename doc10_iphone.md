# 10 iPhone 14 から GitHub を操作する完全手順

## 結論：3つの方法があります

| 方法 | 難易度 | 向いている作業 |
|---|---|---|
| **A. GitHub公式アプリ** | ★☆☆ 簡単 | ファイル確認・Issue管理 |
| **B. GitHub Webブラウザ（Safari）** | ★☆☆ 簡単 | **ファイル編集・アップロード（今回のメイン）** |
| **C. Working Copy アプリ** | ★★☆ 中級 | ガチのgit操作・全ファイル管理 |

---

## 方法B（推奨）：Safari で GitHub.com を使う

### ファイルをまとめてアップロードする手順

1. **Safari で開く**
   ```
   https://github.com/Art-Crea/RVcamp2026
   ```

2. **「Add file」→「Upload files」**  
   （リポジトリがまだない場合は先に「Create repository」）

3. **ファイルを選ぶ**  
   「choose your files」をタップ → **「ファイル」アプリ**が開く  
   → ダウンロードした `RVcamp2026_v1.2.zip` を選ぶ  
   ※ ZIPのままではなく、先に「ファイル」アプリで展開（長押し→展開）してから選ぶ

4. **コミットメッセージを入力**
   ```
   v1.2: 初回アップロード
   ```

5. **「Commit changes」をタップ**

> ⚠️ iPhoneの1回のアップロードは **最大100ファイル** まで。  
> portraits/ の36枚 + その他15ファイル = 51ファイルなので1回でOK。

---

### 1ファイルだけ編集する手順（例：rv_config.js のトークン変更）

1. GitHub のリポジトリを開く
2. `rv_config.js` をタップ
3. 右上の**鉛筆アイコン（Edit）**をタップ
4. `ADMIN_TOKEN: 'RV827gm-kanae'` の部分を自分の文字列に変更
5. 下にスクロール →「Commit changes」→「Commit directly to main」

---

## 方法A：GitHub 公式アプリ

App Store で「GitHub」を検索してインストール。  
できること：リポジトリ閲覧・Issue・Pull Request・通知管理。  
ファイルの直接編集はできないので、編集はSafariで行う。

---

## 方法C：Working Copy（本格git操作）

**App Store：[Working Copy - Git Client](https://apps.apple.com/jp/app/working-copy-git-client/id896694807)**  
（基本無料、Push機能は買い切り￥2,200）

### 初回設定

1. Working Copy を開く
2. 「+」→「Clone repository」
3. URL に入力：
   ```
   https://github.com/Art-Crea/RVcamp2026.git
   ```
4. GitHub のユーザー名とパスワード（またはPersonal Access Token）でログイン

### Personal Access Token の発行方法（GitHub.com で）

1. GitHub右上のアイコン → **Settings**
2. 左メニュー最下部 **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token** → 名前：`iPhone Working Copy`
5. 有効期限：90日 / スコープ：**repo** にチェック
6. **Generate token** → 表示されたトークンをコピー（1度しか表示されない）
7. Working Copy のパスワード欄にこのトークンを貼る

### 日常の操作（Working Copy）

```
ファイル編集 → 左上「変更」→「+」でステージ → 「Commit」→「Push」
```

---

## GitHub Pages の有効化（初回のみ・Safari で）

1. `https://github.com/Art-Crea/RVcamp2026/settings/pages` を開く
2. **Source**：`Deploy from a branch`
3. **Branch**：`main` ／ **Folder**：`/ (root)`
4. **Save**

5分後に公開URL が発行されます：
```
https://art-crea.github.io/RVcamp2026/
```

---

## カスタムドメイン設定（realvalue.art-crea.jp）

GitHub Pages の設定画面で **Custom domain** に入力：
```
realvalue.art-crea.jp
```

**DNS 設定（レンタルサーバーの管理画面で）**：
```
タイプ: CNAME
ホスト名: realvalue
値: art-crea.github.io.
```

**Enforce HTTPS** にもチェックを入れる（Let's Encrypt が自動対応）。

---

## トラブルシューティング

| 症状 | 解決法 |
|---|---|
| アップロードで「too large」エラー | ファイルを20個ずつに分けてアップロード |
| Push できない | Personal Access Token を再発行（有効期限切れの可能性） |
| ページが404 | GitHub Pages の Source 設定を確認。「main」ブランチか確認 |
| CNAME エラー | DNS の反映に最大48時間かかる場合がある |
