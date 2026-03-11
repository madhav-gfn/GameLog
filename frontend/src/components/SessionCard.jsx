import React from 'react';

/**
 * SessionCard - Game session card component for the eSports Bold dashboard.
 *
 * Props:
 * - title: string (game name, e.g. "VALORANT")
 * - image: string (cover image URL)
 * - imageAlt: string
 * - result: 'victory' | 'defeat' | 'progress'
 * - timeAgo: string (e.g. "2h ago")
 * - platform: string (e.g. "PC", "PS5")
 * - description: string (e.g. "Ranked Match • Bind • Diamond 2")
 * - stats: [{ label: string, value: string, highlight?: boolean }]
 * - footer: { left: string | JSX, right?: string }
 */
export const SessionCard = ({
    title,
    image,
    imageAlt,
    result,
    timeAgo,
    platform,
    description,
    stats = [],
    footer,
}) => {
    const resultConfig = {
        victory: {
            badge: 'VICTORY',
            badgeClass: 'bg-primary text-navy',
            hoverBorder: 'hover:border-primary',
            hoverShadow: 'hover:shadow-glow-yellow',
        },
        defeat: {
            badge: 'DEFEAT',
            badgeClass: 'bg-crimson text-white',
            hoverBorder: 'hover:border-crimson',
            hoverShadow: 'hover:shadow-glow-crimson',
        },
        progress: {
            badge: 'PROGRESS',
            badgeClass: 'bg-gray-600 text-white',
            hoverBorder: 'hover:border-gray-400',
            hoverShadow: '',
        },
    };

    const config = resultConfig[result] || resultConfig.progress;

    return (
        <div
            className={`bg-navy border-2 border-graphite rounded overflow-hidden group ${config.hoverBorder} transition-colors flex flex-col ${config.hoverShadow}`}
        >
            {/* Cover Image */}
            <div
                className="aspect-video bg-gray-800 relative bg-cover bg-center"
                style={{ backgroundImage: `url("${image}")` }}
                role="img"
                aria-label={imageAlt}
            >
                <div className={`absolute top-2 right-2 ${config.badgeClass} text-xs font-bold px-3 py-1.5 rounded uppercase shadow-sm`}>
                    {config.badge}
                </div>
                <div className="absolute bottom-2 left-2 bg-navy/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                    {timeAgo}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-2xl uppercase leading-none">{title}</h3>
                    <span className="text-xs font-bold bg-graphite text-white px-2 py-1 rounded uppercase">{platform}</span>
                </div>
                <p className="text-gray-400 text-sm font-medium mb-4">{description}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-graphite/30 p-2 rounded border border-graphite/50">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">{stat.label}</p>
                            <p className={`font-bold ${stat.highlight ? 'text-xl' : 'text-lg'} ${stat.color === 'primary' ? 'text-primary' :
                                    stat.color === 'crimson' ? 'text-crimson' :
                                        ''
                                }`}>
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-auto flex justify-between items-center pt-4 border-t-2 border-gray-800">
                    <div className="flex items-center gap-2">
                        {footer?.left}
                    </div>
                    <button className="text-primary hover:text-white font-bold text-sm uppercase tracking-wider flex items-center gap-1 transition-colors">
                        <span>Details</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
