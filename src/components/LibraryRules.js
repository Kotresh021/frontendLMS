import { useState, useEffect, useContext } from 'react';
import API from '../api';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const LibraryRules = () => {
    const { user } = useContext(AuthContext);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Edit Mode States
    const [tempRules, setTempRules] = useState([]);
    const [newRule, setNewRule] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            // Assuming your backend has this endpoint. 
            // If not, you might need to use '/config' or create a new Settings model.
            const { data } = await API.get('/settings');
            const fetchedRules = data.libraryRules || [];
            setRules(fetchedRules);
            setTempRules(fetchedRules);
            setLoading(false);
        } catch (error) {
            // Fallback for demo purposes if API fails initially
            console.error("Failed to load rules", error);
            setLoading(false);
        }
    };

    const handleAddRule = () => {
        if (!newRule.trim()) return;
        setTempRules([...tempRules, newRule]);
        setNewRule('');
    };

    const handleDeleteRule = (index) => {
        setTempRules(tempRules.filter((_, i) => i !== index));
    };

    const saveChanges = async () => {
        try {
            await API.put('/settings/rules', { rules: tempRules });
            setRules(tempRules);
            setIsEditing(false);
            toast.success("✅ Rules Updated Successfully!");
        } catch (error) {
            toast.error("Failed to save rules");
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Rules...</div>;

    return (
        <div>
            {/* Header Card */}
            <div className="card mb-4" style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                color: 'white',
                border: 'none'
            }}>
                <div className="flex-between">
                    <div>
                        <h2 style={{ color: 'white', marginBottom: '5px' }}>📜 Library Rules & Regulations</h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Official guidelines for borrowing and conduct.</p>
                    </div>
                    {user?.role === 'admin' && !isEditing && (
                        <button
                            className="btn"
                            style={{ background: 'white', color: 'var(--primary)', fontWeight: '600', border: 'none' }}
                            onClick={() => setIsEditing(true)}
                        >
                            ✏️ Edit Rules
                        </button>
                    )}
                </div>
            </div>

            {/* --- VIEW MODE --- */}
            {!isEditing ? (
                <div className="card">
                    {rules.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {rules.map((rule, index) => (
                                <li key={index} style={{
                                    padding: '16px',
                                    borderBottom: index !== rules.length - 1 ? '1px solid var(--border)' : 'none',
                                    display: 'flex',
                                    gap: '15px',
                                    alignItems: 'flex-start',
                                    fontSize: '1rem',
                                    lineHeight: '1.6'
                                }}>
                                    <span style={{
                                        background: 'var(--primary-light)', color: 'var(--primary)',
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0
                                    }}>
                                        {index + 1}
                                    </span>
                                    <span style={{ color: 'var(--text-main)' }}>{rule}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No rules currently defined.
                        </div>
                    )}
                </div>
            ) : (
                /* --- EDIT MODE --- */
                <div className="card" style={{ border: '2px solid var(--primary)', position: 'relative' }}>
                    <div className="card-header" style={{ background: 'var(--primary-light)', borderBottom: '1px solid var(--border)', margin: '-1.5rem -1.5rem 1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
                        <h4 style={{ color: 'var(--primary)', margin: 0 }}>Editing Mode</h4>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        {tempRules.map((rule, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--text-muted)', width: '20px' }}>{index + 1}.</span>
                                <input
                                    className="form-control"
                                    value={rule}
                                    onChange={(e) => {
                                        const copy = [...tempRules];
                                        copy[index] = e.target.value;
                                        setTempRules(copy);
                                    }}
                                />
                                <button
                                    className="btn btn-danger btn-icon"
                                    onClick={() => handleDeleteRule(index)}
                                    title="Delete Rule"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add New Rule Section */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding: '15px', background: 'var(--bg-body)', borderRadius: 'var(--radius)' }}>
                        <input
                            className="form-control"
                            placeholder="Type a new rule here..."
                            value={newRule}
                            onChange={(e) => setNewRule(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
                        />
                        <button className="btn btn-success" onClick={handleAddRule}>+ Add</button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => { setTempRules(rules); setIsEditing(false); }}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={saveChanges}>
                            💾 Save Changes
                        </button>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <em>Note: Rules updated here are immediately visible to all students and staff.</em>
            </div>
        </div>
    );
};

export default LibraryRules;