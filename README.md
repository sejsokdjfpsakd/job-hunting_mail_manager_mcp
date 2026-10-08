# MCP サーバー (mcp_server) 本番環境デプロイガイド

AI エージェントと通信するための Next.js ベースの MCP サーバーです。Vercel 等のサーバーレスプラットフォームにデプロイすることを想定しています。

## Vercel へのデプロイ手順

### 1. プロジェクトのインポート
Vercel のダッシュボードから本リポジトリをインポートし、**Root Directory** を `mcp_server` に設定します。

### 2. 環境変数の設定

#### 本番環境 (Vercel)
Vercel の設定画面 (Settings > Environment Variables) で、`.env.example` を参考に以下の環境変数を設定します。

- `PUBLIC_BASE_URL`: MCP サーバー自身の公開ベース URL (例: `https://your-mcp-server.vercel.app`)
- `RENTAL_API_BASE_URL`: デプロイした `rental_server` の API エンドポイント (例: `https://your-domain.sakura.ne.jp/mailmgr/api.cgi/api`)
- `RENTAL_CONSENT_URL`: `rental_server` の同意画面 URL (例: `https://your-domain.sakura.ne.jp/mailmgr/consent.html`)
- `RENTAL_API_KEY`: `rental_server` と共通の API キー
- `OAUTH_SIGNING_KEY`: OAuth トークン署名用秘密鍵 (32文字以上)
- `OAUTH_BRIDGE_SECRET`: `rental_server` と共通の OAuth Bridge シークレット (32文字以上)

> **注意**: 本番環境では `DEV_BYPASS_AUTH` は絶対に設定しないでください（設定しないことで認証が必須になります）。
> また、シークレット類は `rental_server` の `python manage.py gen-secrets` で生成した値を設定してください。

#### ローカル開発・テスト環境
ローカルで起動して動作確認を行う場合は、必ず `.env.local` を作成する必要があります。
配布されている `.env.local.example` をコピーして `.env.local` を作成してください。

```bash
cp .env.local.example .env.local
```

### 3. 独自ドメインの設定 (オプション)
Vercel の Settings > Domains から、取得済みの独自ドメインを追加し、指示に従って DNS レコード (CNAME 等) を設定することでカスタムドメインを利用できます。

### 4. デプロイの実行
設定を保存してデプロイを実行します。

## アーキテクチャ上の注意点 (Streamable HTTP)
当 MCP サーバーは `mcp-handler` パッケージを使用しており、Vercel などのサーバーレス関数環境に適合する **Streamable HTTP** 方式を採用しています。
- 従来の長寿命な接続を必要とする SSE (Server-Sent Events) 方式とは異なり、リクエスト/レスポンスごとに処理が完結します。
- そのため、エンドポイント (`/api/mcp`) への `GET` リクエストはエラー（405）またはダミー応答を返し、実処理はすべて `POST` リクエストで行われます。

