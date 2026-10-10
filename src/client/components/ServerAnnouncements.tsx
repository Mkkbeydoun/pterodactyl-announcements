import { useQuery } from '@tanstack/react-query';
import { useCurrentServerUuid } from '@pterodactyl/sdk';
import { serverAnnouncementsQuery } from '../api';
import AnnouncementList from './AnnouncementList';

export default function ServerAnnouncements() {
    const uuid = useCurrentServerUuid();
    const { data = [] } = useQuery({ ...serverAnnouncementsQuery(uuid ?? ''), enabled: Boolean(uuid) });

    return <AnnouncementList items={data} />;
}
