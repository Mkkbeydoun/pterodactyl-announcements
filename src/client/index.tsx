import './styles.css';
import { definePterodactylExtension } from '@pterodactyl/sdk';
import DashboardAnnouncements from './components/DashboardAnnouncements';
import ServerAnnouncements from './components/ServerAnnouncements';

export default definePterodactylExtension({
    setup({ slots, screens }) {
        slots.register('dashboard.before', DashboardAnnouncements);
        slots.register('server.console.before', ServerAnnouncements);

        screens.register('manage', () => import('./screens/AdminAnnouncementsScreen'));
    },
});
