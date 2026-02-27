import { useState } from 'react';
import { useAuthStore, useUIStore } from '../stores';
import { api } from '../lib/api';
import { User, Shield, Download, Trash2, LogOut, Zap } from 'lucide-react';

export default function SettingsPage() {
    const { user, logout } = useAuthStore();
    const showToast = useUIStore((s) => s.showToast);
    const [exporting, setExporting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [consent, setConsent] = useState({ allowAITraining: false, dataRetentionDays: 365 });

    const handleExport = async () => {
        setExporting(true);
        try {
            const data = await api.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `urja-data-export-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Data exported successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        }
        setExporting(false);
    };

    const handleDelete = async () => {
        try {
            await api.deleteAccount();
            showToast('Account deleted.', 'info');
            logout();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const handleConsentUpdate = async () => {
        try {
            await api.updateConsent(consent);
            showToast('Privacy settings updated.', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    return (
        <div className="page">
            <h1 className="text-display mb-6 animate-slide-up">Settings</h1>

            {/* Profile */}
            <div className="glass-card p-6 mb-4 animate-slide-up">
                <h2 className="text-heading flex items-center gap-2 mb-4">
                    <User size={20} className="text-accent-primary" />
                    Profile
                </h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-white/50">Email</span>
                        <span className="text-sm">{user?.email || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-white/50">Name</span>
                        <span className="text-sm">{user?.fullName || '—'}</span>
                    </div>
                </div>
            </div>

            {/* Privacy */}
            <div className="glass-card p-6 mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-heading flex items-center gap-2 mb-4">
                    <Shield size={20} className="text-accent-secondary" />
                    Privacy
                </h2>

                <label className="flex items-center justify-between py-3 border-b border-glass-border">
                    <span className="text-sm">Allow AI training on my data</span>
                    <input type="checkbox" checked={consent.allowAITraining} onChange={(e) => setConsent({ ...consent, allowAITraining: e.target.checked })} className="accent-accent-primary" />
                </label>

                <div className="flex items-center justify-between py-3 border-b border-glass-border">
                    <span className="text-sm">Data retention</span>
                    <select value={consent.dataRetentionDays} onChange={(e) => setConsent({ ...consent, dataRetentionDays: +e.target.value })} className="select-glass w-32 py-1 text-sm">
                        <option value={90}>90 days</option>
                        <option value={180}>180 days</option>
                        <option value={365}>1 year</option>
                        <option value={730}>2 years</option>
                    </select>
                </div>

                <button onClick={handleConsentUpdate} className="btn-secondary mt-4 w-full text-sm">Save Privacy Settings</button>

                <button onClick={async () => { const data = await api.getDataPassport(); showToast(JSON.stringify(data, null, 2).slice(0, 200), 'info'); }} className="mt-2 text-micro text-accent-primary hover:underline">View Data Passport</button>
            </div>

            {/* Actions */}
            <div className="glass-card p-6 mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-heading flex items-center gap-2 mb-4">
                    <Zap size={20} className="text-accent-warm" />
                    Actions
                </h2>

                <button onClick={handleExport} disabled={exporting} className="btn-secondary w-full mb-3 flex items-center justify-center gap-2">
                    <Download size={16} />
                    {exporting ? 'Exporting...' : 'Export All Data'}
                </button>

                <button onClick={logout} className="btn-secondary w-full mb-3 flex items-center justify-center gap-2">
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>

            {/* Danger Zone */}
            <div className="glass-card p-6 border-accent-danger/20 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-heading text-accent-danger mb-4">Danger Zone</h2>
                {!deleteConfirm ? (
                    <button onClick={() => setDeleteConfirm(true)} className="btn-danger w-full flex items-center justify-center gap-2">
                        <Trash2 size={16} />
                        Delete Account & All Data
                    </button>
                ) : (
                    <div className="space-y-3 animate-fade-in">
                        <p className="text-sm text-accent-danger">This is permanent. All your data will be destroyed.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(false)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleDelete} className="btn-danger flex-1">Yes, Delete</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
