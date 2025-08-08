// frontend/src/hooks/useInfiniteScroll.ts
import { useEffect, useRef } from 'react';

export function useInfiniteScroll(
    callback: () => void,
    hasMore: boolean
) {
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    callback();
                }
            },
            { threshold: 0.1 }
        );

        const sentinel = sentinelRef.current;
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel);
            }
        };
    }, [callback, hasMore]);

    return { sentinelRef };
} 