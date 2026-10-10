import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Dialog, Input, Label, Select, Switch, TextArea } from '@pterodactyl/sdk';
import { adminTargetsQuery, type Announcement, type AnnouncementInput, type Level, type Target } from '../api';
import { fromLocalInput, toLocalInput } from '../dates';

const LEVELS: { value: Level; label: string }[] = [
    { value: 'info', label: 'Information' },
    { value: 'success', label: 'Good news' },
    { value: 'warning', label: 'Warning' },
    { value: 'danger', label: 'Urgent' },
];

const TARGETS: { value: Target; label: string }[] = [
    { value: 'all', label: 'Everyone' },
    { value: 'nodes', label: 'Servers on chosen nodes' },
    { value: 'locations', label: 'Servers in chosen locations' },
    { value: 'eggs', label: 'Servers using chosen eggs' },
];

interface Props {
    initial: Announcement | null;
    pending: boolean;
    onCancel: () => void;
    onSubmit: (input: AnnouncementInput) => void;
}

export default function AnnouncementForm({ initial, pending, onCancel, onSubmit }: Props) {
    const { data: targets } = useQuery(adminTargetsQuery());
    const [title, setTitle] = useState(initial?.title ?? '');
    const [body, setBody] = useState(initial?.body ?? '');
    const [level, setLevel] = useState<Level>(initial?.level ?? 'info');
    const [target, setTarget] = useState<Target>(initial?.target ?? 'all');
    const [targetIds, setTargetIds] = useState<number[]>(initial?.target_ids ?? []);
    const [dismissible, setDismissible] = useState(initial?.dismissible ?? true);
    const [startsAt, setStartsAt] = useState(toLocalInput(initial?.starts_at ?? null));
    const [endsAt, setEndsAt] = useState(toLocalInput(initial?.ends_at ?? null));

    const targetOptions = target === 'all' ? [] : (targets?.[target] ?? []);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        onSubmit({
            title: title.trim(),
            body: body.trim(),
            level,
            target,
            target_ids: target === 'all' ? [] : targetIds,
            dismissible,
            starts_at: fromLocalInput(startsAt),
            ends_at: fromLocalInput(endsAt),
        });
    };

    return (
        <form onSubmit={submit} className={'rxan:flex rxan:flex-col rxan:gap-4'}>
            <div>
                <Label htmlFor={'rxan-title'}>Title</Label>
                <Input id={'rxan-title'} value={title} maxLength={120} required onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
                <Label htmlFor={'rxan-body'}>Message</Label>
                <TextArea id={'rxan-body'} value={body} rows={4} maxLength={2000} required onChange={(e) => setBody(e.target.value)} />
            </div>
            <div className={'rxan:grid rxan:gap-4 rxan:sm:grid-cols-2'}>
                <div>
                    <Label htmlFor={'rxan-level'}>Style</Label>
                    <Select id={'rxan-level'} value={level} options={LEVELS} onChange={(v) => setLevel(v as Level)} />
                </div>
                <div>
                    <Label htmlFor={'rxan-target'}>Show to</Label>
                    <Select
                        id={'rxan-target'}
                        value={target}
                        options={TARGETS}
                        onChange={(v) => {
                            setTarget(v as Target);
                            setTargetIds([]);
                        }}
                    />
                </div>
            </div>
            {target !== 'all' && (
                <div>
                    <Label htmlFor={'rxan-targets'}>Choose {target}</Label>
                    <Select
                        id={'rxan-targets'}
                        multiple
                        value={targetIds}
                        placeholder={`Select ${target}`}
                        options={targetOptions.map((o) => ({ value: o.id, label: o.name, textLabel: o.name }))}
                        onChange={(v) => setTargetIds(v.map(Number))}
                    />
                </div>
            )}
            <div className={'rxan:grid rxan:gap-4 rxan:sm:grid-cols-2'}>
                <div>
                    <Label htmlFor={'rxan-starts'}>Starts (empty for now)</Label>
                    <Input id={'rxan-starts'} type={'datetime-local'} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor={'rxan-ends'}>Ends (empty for never)</Label>
                    <Input id={'rxan-ends'} type={'datetime-local'} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                </div>
            </div>
            <Switch
                checked={dismissible}
                onChange={setDismissible}
                label={'Users can dismiss it'}
                description={'Dismissed banners stay hidden in that browser until you edit the announcement.'}
            />
            <Dialog.Footer>
                <Button isSecondary onClick={onCancel} disabled={pending}>
                    Cancel
                </Button>
                <Button type={'submit'} isLoading={pending} disabled={target !== 'all' && targetIds.length === 0}>
                    Save
                </Button>
            </Dialog.Footer>
        </form>
    );
}
