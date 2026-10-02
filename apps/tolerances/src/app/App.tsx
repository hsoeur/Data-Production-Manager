import { ManagerApp } from '@pdm/shared/app';
import { TolerancesPage } from '../features/tolerances/pages/TolerancesPage';
import { managerConfig } from './managerConfig';

export function App() {
  return <ManagerApp config={managerConfig} storageKey="tolerance-manager.operator" renderManager={(operator, onChangeOperator) => <TolerancesPage operator={operator} onChangeOperator={onChangeOperator} />} />;
}
