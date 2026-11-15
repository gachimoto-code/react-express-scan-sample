import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  createTask,
  deleteTask,
  fetchTasks,
  getToken,
  login,
  setToken,
  Task,
  updateTask,
} from "./api";

export default function App() {
  const [loggedIn, setLoggedIn] = useState<boolean>(() => getToken() !== null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ログイン画面用の入力
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("");

  const loadTasks = useCallback(async (q: string) => {
    try {
      setTasks(await fetchTasks(q));
      setError(null);
    } catch (e) {
      if (e instanceof Error && e.message.includes("ログインが必要です")) {
        setToken(null);
        setLoggedIn(false);
      } else {
        setError(e instanceof Error ? e.message : "読み込みに失敗しました");
      }
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      void loadTasks(search);
    }
  }, [loggedIn, search, loadTasks]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    try {
      await login(username, password);
      setLoggedIn(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    }
  }

  function handleLogout() {
    setToken(null);
    setLoggedIn(false);
    setTasks([]);
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (newTitle.trim() === "") return;
    try {
      await createTask(newTitle.trim());
      setNewTitle("");
      await loadTasks(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "追加に失敗しました");
    }
  }

  async function handleToggle(task: Task) {
    try {
      await updateTask(task.id, { done: !task.done });
      await loadTasks(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    }
  }

  async function handleDelete(task: Task) {
    try {
      await deleteTask(task.id);
      await loadTasks(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    }
  }

  if (!loggedIn) {
    return (
      <main className="container">
        <h1>タスク管理サンプル</h1>
        <form onSubmit={handleLogin} className="login-form">
          <label>
            ユーザー名
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label>
            パスワード
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit">ログイン</button>
          <p className="hint">デモユーザー: demo / password</p>
        </form>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="header">
        <h1>タスク管理サンプル</h1>
        <button onClick={handleLogout}>ログアウト</button>
      </header>

      <form onSubmit={handleAdd} className="add-form">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="新しいタスク"
        />
        <button type="submit">追加</button>
      </form>

      <input
        className="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="タスクを検索"
      />

      {error && <p className="error">{error}</p>}

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.done ? "done" : ""}>
            <label>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => void handleToggle(task)}
              />
              <span>{task.title}</span>
            </label>
            <button onClick={() => void handleDelete(task)}>削除</button>
          </li>
        ))}
      </ul>
      {tasks.length === 0 && <p>タスクがありません。</p>}
    </main>
  );
}
