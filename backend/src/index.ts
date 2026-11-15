import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import crypto from "crypto";

interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
}

// デモ用の固定ユーザー（サンプルアプリなのでコード内に定義）
const DEMO_USER = { username: "demo", password: "password" };

// 発行したトークン -> ユーザー名 の簡易セッション（インメモリ）
const sessions = new Map<string, string>();

// タスクデータ（インメモリ、DBは使わない）
let tasks: Task[] = [
  { id: 1, title: "買い物リストを作る", done: false, createdAt: new Date().toISOString() },
  { id: 2, title: "請求書を送る", done: true, createdAt: new Date().toISOString() },
  { id: 3, title: "週次レポートを書く", done: false, createdAt: new Date().toISOString() },
];
let nextId = 4;

const app = express();
app.use(cors());
app.use(express.json());

// 認証ミドルウェア: Authorization: Bearer <token> を確認する
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "ログインが必要です" });
  }
  next();
}

// ログイン: 固定のデモユーザーと照合し、トークンを返す
app.post("/api/login", (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "username と password が必要です" });
  }
  if (username !== DEMO_USER.username || password !== DEMO_USER.password) {
    return res.status(401).json({ error: "ユーザー名またはパスワードが違います" });
  }
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, username);
  return res.json({ token, username });
});

// タスク一覧（?q= でタイトル部分一致検索）
app.get("/api/tasks", requireAuth, (req: Request, res: Response) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const result = q ? tasks.filter((t) => t.title.includes(q)) : tasks;
  return res.json(result);
});

// タスク追加
app.post("/api/tasks", requireAuth, (req: Request, res: Response) => {
  const title = req.body?.title;
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title が必要です" });
  }
  const task: Task = {
    id: nextId++,
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return res.status(201).json(task);
});

// タスク更新（タイトル / 完了状態）
app.put("/api/tasks/:id", requireAuth, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: "タスクが見つかりません" });
  }
  const { title, done } = req.body ?? {};
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ error: "title が不正です" });
    }
    task.title = title.trim();
  }
  if (done !== undefined) {
    if (typeof done !== "boolean") {
      return res.status(400).json({ error: "done が不正です" });
    }
    task.done = done;
  }
  return res.json(task);
});

// タスク削除
app.delete("/api/tasks/:id", requireAuth, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "タスクが見つかりません" });
  }
  tasks.splice(index, 1);
  return res.status(204).send();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`backend listening on http://localhost:${PORT}`);
});
