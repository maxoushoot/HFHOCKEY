import { useState, useEffect } from 'react';

export function useCountdown(targetDateStr: string | undefined | null) {
    const [countdown, setCountdown] = useState({ h: '00', m: '00', s: '00' });

    useEffect(() => {
        if (!targetDateStr) return;
        const update = () => {
            const now = new Date().getTime();
            const target = new Date(targetDateStr).getTime();
            const diff = target - now;
            if (diff <= 0) {
                 setCountdown({ h: '00', m: '00', s: '00' });
                 return;
            }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setCountdown({ 
                h: String(h).padStart(2, '0'), 
                m: String(m).padStart(2, '0'), 
                s: String(s).padStart(2, '0') 
            });
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [targetDateStr]);

    return countdown;
}
