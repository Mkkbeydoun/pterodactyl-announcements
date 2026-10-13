import { afterEach, beforeEach, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createExtensionTestHost, createTestServer } from '@pterodactyl/sdk/testing';
import AnnouncementList from './components/AnnouncementList';
import ServerAnnouncements from './components/ServerAnnouncements';
import { serverAnnouncementsQuery, type Announcement } from './api';
import { fromLocalInput, toLocalInput } from './dates';

const server = createTestServer({ uuid: 'f1a1b2c3-0000-4000-8000-000000000001' });
let host: ReturnType<typeof createExtensionTestHost>;

beforeEach(() => {
    host = createExtensionTestHost({ extensionId: 'announcements', prefix: 'rxan', server });
});

afterEach(() => {
    cleanup();
    host.dispose();
    window.localStorage.clear();
});

const announcement = (overrides: Partial<Announcement> = {}): Announcement => ({
    id: 1,
    title: 'Node maintenance',
    body: 'Servers on node 2 restart at 03:00 UTC.',
    level: 'warning',
    target: 'all',
    target_ids: [],
    dismissible: true,
    starts_at: null,
    ends_at: null,
    updated_at: '2026-10-10T07:00:00+00:00',
    ...overrides,
});

test('shows announcements and hides one when dismissed', async () => {
    render(<AnnouncementList items={[announcement()]} />, { wrapper: host.Wrapper });

    expect(await screen.findByText('Node maintenance')).toBeTruthy();
    fireEvent.click(screen.getByText('Dismiss'));
    expect(screen.queryByText('Node maintenance')).toBeNull();
});

test('a dismissed announcement shows again after it is edited', async () => {
    window.localStorage.setItem('announcements:dismissed:1:2026-10-10T07:00:00+00:00', '1');
    render(<AnnouncementList items={[announcement({ updated_at: '2026-10-10T08:00:00+00:00' })]} />, {
        wrapper: host.Wrapper,
    });

    expect(await screen.findByText('Node maintenance')).toBeTruthy();
});

test('non-dismissible announcements have no dismiss button', async () => {
    render(<AnnouncementList items={[announcement({ dismissible: false })]} />, { wrapper: host.Wrapper });

    expect(await screen.findByText('Node maintenance')).toBeTruthy();
    expect(screen.queryByText('Dismiss')).toBeNull();
});

test('the server banner reads the server announcements query', async () => {
    host.queryClient.setQueryData(serverAnnouncementsQuery(server.attributes.uuid).queryKey, [
        announcement({ id: 2, title: 'Egg update', target: 'eggs', target_ids: [5] }),
    ]);
    render(<ServerAnnouncements />, { wrapper: host.Wrapper });

    expect(await screen.findByText('Egg update')).toBeTruthy();
});

test('the banner block has 12px below it and no top margin, like the other console rows', async () => {
    render(<AnnouncementList items={[announcement()]} />, { wrapper: host.Wrapper });

    const block = (await screen.findByText('Dismiss')).closest('div.rxan\\:flex-col')!;
    expect(block.className).toContain('rxan:mb-3');
    expect(block.className).toContain('rxan:mt-0');
});

test('datetime-local values round-trip through ISO', () => {
    const iso = fromLocalInput('2026-11-05T14:30');
    expect(iso).not.toBeNull();
    expect(toLocalInput(iso)).toBe('2026-11-05T14:30');
    expect(fromLocalInput('')).toBeNull();
});
