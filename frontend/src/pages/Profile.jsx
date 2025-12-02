// frontend/src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { Api } from "../api";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    actual: "",
    nueva: "",
  });

  async function loadUser() {
    try {
      const data = await Api.me();
      setForm({
        nombre: data.nombre || "",
        email: data.email || "",
      });
    } catch (e) {
      console.error(e);
      setMsg("No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg("");

      // 👇 aquí usamos la función correcta del api.js
      await Api.updateMe(form);

      setMsg("Datos actualizados correctamente ✔️");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg("");

      if (passwordForm.nueva.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      }

      // 👇 llamamos al endpoint de cambio de contraseña
      await Api.changePassword({
        actual: passwordForm.actual,
        nueva: passwordForm.nueva,
      });

      setMsg("Contraseña actualizada correctamente ✔️");
      setPasswordForm({ actual: "", nueva: "" });
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) return <p className="p-6">Cargando perfil…</p>;

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">Mi perfil</h1>

      {msg && (
        <p className="text-sm p-3 rounded-lg bg-emerald-50 text-emerald-700">
          {msg}
        </p>
      )}

      {/* ------------------ DATOS PERSONALES ------------------ */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Datos personales</h2>

        <form onSubmit={saveProfile} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500">Nombre</label>
            <input
              className="input"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-500">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button className="btn-primary text-xs" disabled={saving}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>

      {/* ------------------ CAMBIAR CONTRASEÑA ------------------ */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Cambiar contraseña</h2>

        <form onSubmit={changePassword} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500">Contraseña actual</label>
            <input
              className="input"
              type="password"
              value={passwordForm.actual}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, actual: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-500">Nueva contraseña</label>
            <input
              className="input"
              type="password"
              value={passwordForm.nueva}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, nueva: e.target.value })
              }
              required
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button className="btn-primary text-xs" disabled={saving}>
              {saving ? "Actualizando…" : "Cambiar contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
