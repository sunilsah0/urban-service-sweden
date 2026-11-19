export const API = "http://192.168.1.50:3000/api"; // <-- YOUR laptop IP (or your Vercel URL)

export async function call(path, token, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error");
  return data;
}