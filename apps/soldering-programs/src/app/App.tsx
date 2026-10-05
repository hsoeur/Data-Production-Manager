import { ManagerApp } from '@pdm/shared/app';
import { SolderingProgramsPage } from '../features/soldering-programs/pages/SolderingProgramsPage';
import { managerConfig } from './managerConfig';

export function App() {
  return <ManagerApp config={managerConfig} storageKey="soldering-programs-manager.operator" renderManager={(operator, onChangeOperator) => <SolderingProgramsPage operator={operator} onChangeOperator={onChangeOperator} />} />;
}
