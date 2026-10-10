import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Button,
    Dialog,
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
    httpErrorToHuman,
    PageContentBlock,
    Table,
    toast,
    useExtensionAction,
} from '@pterodactyl/sdk';
import {
    adminAnnouncementsQuery,
    deleteAnnouncement,
    saveAnnouncement,
    type Announcement,
    type AnnouncementInput,
} from '../api';
import { formatWhen } from '../dates';
import AnnouncementForm from './AnnouncementForm';

const TARGET_LABELS: Record<Announcement['target'], string> = {
    all: 'Everyone',
    nodes: 'Nodes',
    locations: 'Locations',
    eggs: 'Eggs',
};

const LEVEL_LABELS: Record<Announcement['level'], string> = {
    info: 'Information',
    success: 'Good news',
    warning: 'Warning',
    danger: 'Urgent',
};

const status = (a: Announcement): string => {
    const now = Date.now();
    if (a.starts_at && new Date(a.starts_at).getTime() > now) {
        return 'Scheduled';
    }
    if (a.ends_at && new Date(a.ends_at).getTime() <= now) {
        return 'Ended';
    }

    return 'Live';
};

export default function AdminAnnouncementsScreen() {
    const client = useQueryClient();
    const { data = [], isFetching } = useQuery(adminAnnouncementsQuery());
    const [editing, setEditing] = useState<Announcement | null | undefined>(undefined);
    const [deleting, setDeleting] = useState<Announcement | null>(null);

    const refresh = () => client.invalidateQueries({ queryKey: ['announcements'] });

    const save = useMutation({
        mutationFn: ({ input, id }: { input: AnnouncementInput; id?: number }) => saveAnnouncement(input, id),
        onSuccess: async () => {
            toast.success('Announcement saved.');
            setEditing(undefined);
            await refresh();
        },
        onError: (error) => toast.error(httpErrorToHuman(error)),
    });

    const remove = useMutation({
        mutationFn: (id: number) => deleteAnnouncement(id),
        onSuccess: async () => {
            toast.success('Announcement deleted.');
            setDeleting(null);
            await refresh();
        },
        onError: (error) => toast.error(httpErrorToHuman(error)),
    });

    const onSubmit = useExtensionAction('save', async (input: AnnouncementInput) => {
        await save.mutateAsync({ input, id: editing?.id });
    });

    return (
        <PageContentBlock title={'Announcements'}>
            <div className={'rxan:mb-4 rxan:flex rxan:items-center rxan:justify-between rxan:gap-4'}>
                <p className={'rxan:text-sm rxan:text-muted-foreground'}>
                    Banners on the dashboard and server consoles. Target everyone, or only servers on chosen nodes,
                    locations or eggs.
                </p>
                <Button className={'rxan:shrink-0'} onClick={() => setEditing(null)}>
                    New
                </Button>
            </div>

            <Table
                rows={data}
                keyOf={(a) => String(a.id)}
                isFetching={isFetching}
                emptyState={
                    <Empty>
                        <EmptyHeader>
                            <EmptyTitle>No announcements yet</EmptyTitle>
                            <EmptyDescription>Create one to show a banner to your users.</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                }
                columns={[
                    { id: 'title', label: 'Title', cell: (a) => a.title },
                    { id: 'level', label: 'Style', cell: (a) => LEVEL_LABELS[a.level] },
                    {
                        id: 'target',
                        label: 'Shown to',
                        cell: (a) =>
                            a.target === 'all' ? TARGET_LABELS.all : `${TARGET_LABELS[a.target]} (${a.target_ids.length})`,
                    },
                    { id: 'starts', label: 'Starts', cell: (a) => formatWhen(a.starts_at, 'Now') },
                    { id: 'ends', label: 'Ends', cell: (a) => formatWhen(a.ends_at, 'Never') },
                    { id: 'status', label: 'Status', cell: status },
                    {
                        id: 'actions',
                        label: '',
                        cell: (a) => (
                            <div className={'rxan:flex rxan:justify-end rxan:gap-2'}>
                                <Button size={'small'} isSecondary onClick={() => setEditing(a)}>
                                    Edit
                                </Button>
                                <Button.Danger size={'small'} onClick={() => setDeleting(a)}>
                                    Delete
                                </Button.Danger>
                            </div>
                        ),
                    },
                ]}
            />

            <Dialog
                open={editing !== undefined}
                onClose={() => setEditing(undefined)}
                title={editing ? 'Edit announcement' : 'New announcement'}
            >
                {editing !== undefined && (
                    <AnnouncementForm
                        initial={editing}
                        pending={save.isPending}
                        onCancel={() => setEditing(undefined)}
                        onSubmit={onSubmit}
                    />
                )}
            </Dialog>

            <Dialog.Confirm
                open={deleting !== null}
                onClose={() => setDeleting(null)}
                title={'Delete announcement?'}
                confirm={'Delete'}
                pending={remove.isPending}
                onConfirmed={() => deleting && remove.mutate(deleting.id)}
            >
                “{deleting?.title}” will stop showing immediately.
            </Dialog.Confirm>
        </PageContentBlock>
    );
}
