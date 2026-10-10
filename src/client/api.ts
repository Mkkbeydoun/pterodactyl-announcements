import { queryOptions } from '@tanstack/react-query';
import { http } from '@pterodactyl/sdk';

export type Level = 'info' | 'success' | 'warning' | 'danger';
export type Target = 'all' | 'nodes' | 'locations' | 'eggs';

export interface Announcement {
    id: number;
    title: string;
    body: string;
    level: Level;
    target: Target;
    target_ids: number[];
    dismissible: boolean;
    starts_at: string | null;
    ends_at: string | null;
    updated_at: string;
}

export type AnnouncementInput = Omit<Announcement, 'id' | 'updated_at'>;

export interface TargetOption {
    id: number;
    name: string;
}

export type TargetOptions = Record<Exclude<Target, 'all'>, TargetOption[]>;

const ADMIN = '/api/admin/extensions/announcements';

export const globalAnnouncementsQuery = () =>
    queryOptions({
        queryKey: ['announcements', 'global'],
        queryFn: async () =>
            (await http.get<{ data: Announcement[] }>('/api/client/extensions/announcements/active')).data.data,
        staleTime: 60_000,
    });

export const serverAnnouncementsQuery = (uuid: string) =>
    queryOptions({
        queryKey: ['announcements', 'server', uuid],
        queryFn: async () =>
            (await http.get<{ data: Announcement[] }>(`/api/client/servers/${uuid}/extensions/announcements/active`))
                .data.data,
        staleTime: 60_000,
    });

export const adminAnnouncementsQuery = () =>
    queryOptions({
        queryKey: ['announcements', 'admin'],
        queryFn: async () => (await http.get<{ data: Announcement[] }>(`${ADMIN}/announcements`)).data.data,
    });

export const adminTargetsQuery = () =>
    queryOptions({
        queryKey: ['announcements', 'targets'],
        queryFn: async () => (await http.get<TargetOptions>(`${ADMIN}/targets`)).data,
    });

export const saveAnnouncement = async (input: AnnouncementInput, id?: number): Promise<Announcement> => {
    const response = id
        ? await http.patch<{ data: Announcement }>(`${ADMIN}/announcements/${id}`, input)
        : await http.post<{ data: Announcement }>(`${ADMIN}/announcements`, input);

    return response.data.data;
};

export const deleteAnnouncement = async (id: number): Promise<void> => {
    await http.delete(`${ADMIN}/announcements/${id}`);
};
