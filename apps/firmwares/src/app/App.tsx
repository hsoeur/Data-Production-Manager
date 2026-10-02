import { ManagerApp } from '@pdm/shared/app';
import { FirmwaresPage } from '../features/firmwares/pages/FirmwaresPage';
import { managerConfig } from './managerConfig';

export function App() {
  return <ManagerApp config={managerConfig} storageKey="firmware-manager.operator" renderManager={(operator, onChangeOperator) => <FirmwaresPage operator={operator} onChangeOperator={onChangeOperator} />} />;
}
