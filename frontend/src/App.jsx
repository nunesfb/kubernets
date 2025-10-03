import React from "react";
import { useEffect, useState } from "react";

export default function App() {
  const [ping, setPing] = useState(null);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/ping").then(r => r.json()).then(setPing).catch(()=>{});
    fetch("/api/users").then(r => r.json()).then(setUsers).catch(()=>{});
  }, []);

  const addUser = async () => {
    if (!name.trim()) return;
    await fetch("/api/users", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ name })});
    setName("");
    const list = await fetch("/api/users").then(r=>r.json());
    setUsers(list);
  };

  return (
    <main style={{fontFamily:"system-ui", maxWidth:840, margin:"3rem auto", padding:"0 1rem"}}>
      <h1>K8s Demo: React + Node + Postgres + Redis</h1>
      <p>Ping: {ping ? JSON.stringify(ping) : "..."}</p>

      <section style={{marginTop:24}}>
        <h2>Users</h2>
        <div style={{display:"flex", gap:8}}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome"/>
          <button onClick={addUser}>Add</button>
        </div>
        <ul>{users.map(u=><li key={u.id}>{u.id} — {u.name}</li>)}</ul>
      </section>
    </main>
  );
}
