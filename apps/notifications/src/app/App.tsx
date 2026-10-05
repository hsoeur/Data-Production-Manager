import { ManagerApp } from '@pdm/shared/app';
import { NotificationsPage } from '../features/notifications/pages/NotificationsPage';
import { managerConfig } from './managerConfig';

export function App() {
  return <ManagerApp config={managerConfig} storageKey="notification-manager.operator" renderManager={(operator, onChangeOperator) => <NotificationsPage operator={operator} onChangeOperator={onChangeOperator} />} />;
}
