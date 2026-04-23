import React, { useState, useEffect } from 'react';

const FavoriteButton = ({ businessId, iconSize = "20px", className = "" }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await fetch(`/api/bookmarks/check?business_id=${businessId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                setIsBookmarked(json.isBookmarked);
            } catch (err) {
                console.error(err);
            }
        };

        checkStatus();
    }, [businessId]);

    const handleToggle = async (e) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) {
            if (confirm("로그인이 필요한 기능입니다. 로그인 페이지로 이동할까요?")) {
                window.location.href = '/login';
            }
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/bookmarks/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ business_id: businessId })
            });
            const json = await res.json();
            if (json.success) {
                setIsBookmarked(json.isBookmarked);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleToggle}
            disabled={loading}
            className={`transition-all active:scale-90 ${className} ${isBookmarked ? 'text-rose-500' : 'text-slate-300'}`}
        >
            <span 
                className={`material-symbols-outlined ${isBookmarked ? 'fill-1' : ''}`}
                style={{ fontSize: iconSize }}
            >
                favorite
            </span>
        </button>
    );
};

export default FavoriteButton;
