export interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
}

const API_BASE = "http://localhost:3001";

let token: string | null = localStorage.getItem("token");

export function setToken(value: string | null) {
  token = value;
  if (value) {
    localStorage.setItem("token", value);
  } else {
    localStorage.removeItem("token");
  }
}

export function getToken() {
  return token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `エラーが発生しました (${res.status})`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export async function login(username: string, password: string) {
  const data = await request<{ token: string; username: string }>("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data;
}

export function fetchTasks(q: string) {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return request<Task[]>(`/api/tasks${query}`);
}

export function createTask(title: string) {
  return request<Task>("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function updateTask(id: number, patch: { title?: string; done?: boolean }) {
  return request<Task>(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

export function deleteTask(id: number) {
  return request<void>(`/api/tasks/${id}`, { method: "DELETE" });
}
