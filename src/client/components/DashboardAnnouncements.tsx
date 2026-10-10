import { useQuery } from '@tanstack/react-query';
import { globalAnnouncementsQuery } from '../api';
import AnnouncementList from './AnnouncementList';

export default function DashboardAnnouncements() {
    const { data = [] } = useQuery(globalAnnouncementsQuery());

    return <AnnouncementList items={data} />;
}
