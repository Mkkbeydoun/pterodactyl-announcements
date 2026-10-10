/** ISO timestamp -> value for an <input type="datetime-local"> in the viewer's timezone. */
export const toLocalInput = (iso: string | null): string => {
    if (!iso) {
        return '';
    }
    const date = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** Value from an <input type="datetime-local"> -> ISO timestamp, or null when empty. */
export const fromLocalInput = (value: string): string | null => (value ? new Date(value).toISOString() : null);

export const formatWhen = (iso: string | null, fallback: string): string =>
    iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : fallback;
