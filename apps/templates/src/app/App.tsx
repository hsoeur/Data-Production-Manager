import { ManagerApp } from '@pdm/shared/app';
import { LabelTemplatesPage } from '../features/label-templates/pages/LabelTemplatesPage';
import { managerConfig } from './managerConfig';

export function App() {
  return <ManagerApp config={managerConfig} storageKey="label-template-manager.operator" renderManager={(operator, onChangeOperator) => <LabelTemplatesPage operator={operator} onChangeOperator={onChangeOperator} />} />;
}
