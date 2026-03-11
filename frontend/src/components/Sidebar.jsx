import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
    { path: '/', label: 'Dashboard', icon: 'grid_view' },
    { path: '/library', label: 'Library', icon: 'library_books' },
    { path: '/discover', label: 'Discover', icon: 'monitoring' },
    { path: '/profile', label: 'Profile', icon: 'person' },
];

export const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const isActive = (path) => location.pathname === path;
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            {/* Hover trigger zone – always visible */}
            <div
                className="sidebar-trigger"
                onMouseEnter={() => setExpanded(true)}
            />

            {/* Overlay backdrop when sidebar is open */}
            {expanded && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setExpanded(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`sidebar-panel ${expanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
                onMouseEnter={() => setExpanded(true)}
                onMouseLeave={() => setExpanded(false)}
            >
                {/* Logo */}
                <div className="p-6 flex items-center gap-4">
                    <div className="bg-primary aspect-square w-12 rounded flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-navy font-bold text-2xl">sports_esports</span>
                    </div>
                    <div className={`flex flex-col overflow-hidden transition-all duration-300 ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                        <h1 className="text-white text-xl font-bold uppercase tracking-widest leading-none whitespace-nowrap">GAMELOG</h1>
                        <p className="text-primary text-xs font-bold uppercase tracking-wider mt-1 whitespace-nowrap">PRO EDITION</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 flex flex-col gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded font-bold uppercase tracking-wider transition-colors ${isActive(item.path)
                                    ? 'bg-primary text-navy'
                                    : 'text-white hover:bg-graphite hover:text-primary'
                                }`}
                            title={item.label}
                        >
                            <span className="material-symbols-outlined text-xl flex-shrink-0">{item.icon}</span>
                            <span className={`whitespace-nowrap transition-all duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                {/* New Log Button */}
                <div className="p-4 mt-auto">
                    <button className="w-full flex items-center justify-center gap-2 bg-crimson hover:bg-red-700 text-white py-4 rounded font-bold uppercase tracking-widest transition-colors shadow-glow-crimson-lg">
                        <span className="material-symbols-outlined flex-shrink-0">add_box</span>
                        <span className={`text-lg whitespace-nowrap transition-all duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                            NEW LOG
                        </span>
                    </button>
                </div>

                {/* Settings + Logout */}
                <div className="p-4 border-t-2 border-graphite mt-4 space-y-1">
                    <a
                        href="#"
                        className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded font-bold uppercase tracking-wider"
                        title="Settings"
                    >
                        <span className="material-symbols-outlined text-xl flex-shrink-0">settings</span>
                        <span className={`whitespace-nowrap transition-all duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                            Settings
                        </span>
                    </a>
                    <button
                        onClick={logout}
                        className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-crimson transition-colors rounded font-bold uppercase tracking-wider w-full"
                        title="Logout"
                    >
                        <span className="material-symbols-outlined text-xl flex-shrink-0">logout</span>
                        <span className={`whitespace-nowrap transition-all duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
};
