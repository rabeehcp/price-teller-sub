import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { changePasswordApi } from '../services/api';

export function ChangePasswordCard({ minLength = 12 }: { minLength?: number }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < minLength) return setStatus({ ok: false, text: `New password must be at least ${minLength} characters.` });
    if (newPassword !== confirmPassword) return setStatus({ ok: false, text: 'New passwords do not match.' });
    setBusy(true);
    try {
      await changePasswordApi(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatus({ ok: true, text: 'Password changed. Reloading with your new session…' });
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      setStatus({ ok: false, text: err?.message || 'Failed to change password.' });
    } finally {
      setBusy(false);
    }
  };

  const inputClass = 'w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none';
  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 max-w-md">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <KeyRound className="w-4 h-4" /> Change my password
      </div>
      <input type="password" autoComplete="current-password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} required />
      <input type="password" autoComplete="new-password" placeholder={`New password (min ${minLength} characters)`} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} required />
      <input type="password" autoComplete="new-password" placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} required />
      {status && <p className={`text-xs ${status.ok ? 'text-emerald-700' : 'text-red-600'}`}>{status.text}</p>}
      <button type="submit" disabled={busy} className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold disabled:opacity-50">
        {busy ? 'Saving…' : 'Change password'}
      </button>
    </form>
  );
}
