# タスク管理サンプルアプリ（React / Express）

シンプルなタスク管理アプリです。標準構成（`frontend/` = Vite + React + TypeScript、`backend/` = Express + TypeScript）の実例として作成しました。

このリポジトリは、セキュリティ診断ツール（OpenAI codex-security）の診断対象として用意した題材コードです。公開しても問題ないサンプルとして作成しており、実在の利用者情報や本番用の秘密情報は含みません。

## 構成

```
.
├── frontend/   Vite + React + TypeScript（画面: ログイン / タスク一覧・検索・追加・完了・削除）
└── backend/    Express + TypeScript（タスク CRUD API / 簡易ログイン、データはインメモリ）
```

## 機能

- 簡易ログイン（固定のデモユーザーで照合し、トークンを発行）
  - ユーザー名: `demo` / パスワード: `password`
- タスクの CRUD（`GET / POST / PUT / DELETE /api/tasks`）
- タスクのタイトル検索（`GET /api/tasks?q=`）
- データはバックエンドのメモリ上に保持します（再起動で初期状態に戻ります。DBは使いません）

## 起動方法

バックエンド（ポート 3001）:

```bash
cd backend
npm install
npm run dev
```

フロントエンド（ポート 5173）:

```bash
cd frontend
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開き、デモユーザーでログインしてください。

## ビルド

```bash
cd backend && npm run build     # tsc で dist/ へ出力
cd frontend && npm run build    # 型チェック + vite build
```
