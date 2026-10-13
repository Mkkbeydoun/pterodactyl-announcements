import { useState } from 'react';
import { Alert } from '@pterodactyl/sdk';
import type { Announcement } from '../api';

const storageKey = (a: Announcement) => `announcements:dismissed:${a.id}:${a.updated_at}`;

const isDismissed = (a: Announcement): boolean => {
    try {
        return a.dismissible && window.localStorage.getItem(storageKey(a)) === '1';
    } catch {
        return false;
    }
};

export default function AnnouncementList({ items }: { items: Announcement[] }) {
    const [, setVersion] = useState(0);
    const visible = items.filter((a) => !isDismissed(a));

    if (visible.length === 0) {
        return null;
    }

    const dismiss = (a: Announcement) => {
        try {
            window.localStorage.setItem(storageKey(a), '1');
        } catch {
            // Storage can be unavailable (private windows); the banner simply stays.
        }
        setVersion((v) => v + 1);
    };

    return (
        <div className={'rxan:mt-0 rxan:mb-3 rxan:flex rxan:flex-col rxan:gap-2'}>
            {visible.map((a) => (
                <Alert key={a.id} type={a.level} title={a.title}>
                    <div className={'rxan:flex rxan:items-start rxan:justify-between rxan:gap-4'}>
                        <p className={'rxan:whitespace-pre-line'}>{a.body}</p>
                        {a.dismissible && (
                            <button
                                type={'button'}
                                onClick={() => dismiss(a)}
                                className={'rxan:shrink-0 rxan:text-sm rxan:underline rxan:opacity-80 rxan:hover:opacity-100'}
                            >
                                Dismiss
                            </button>
                        )}
                    </div>
                </Alert>
            ))}
        </div>
    );
}
