import { useState, type ReactNode } from 'react';
import { OperatorGate } from '../features/operators/components/OperatorGate';
import type { User } from '../features/operators/models/user';

export type ManagerConfig = {
  applicationName: string;
  managerName: string;
  operatorDescription: string;
  footerLabel: string;
};

type ManagerAppProps = {
  config: ManagerConfig;
  storageKey: string;
  renderManager: (operator: User, onChangeOperator: () => void) => ReactNode;
};

function readOperator(storageKey: string): User | null {
  try {
    const value = sessionStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as User) : null;
  } catch {
    return null;
  }
}

export function ManagerApp({ config, storageKey, renderManager }: ManagerAppProps) {
  const [operator, setOperator] = useState<User | null>(() => readOperator(storageKey));

  const selectOperator = (user: User) => {
    sessionStorage.setItem(storageKey, JSON.stringify(user));
    setOperator(user);
  };

  const clearOperator = () => {
    sessionStorage.removeItem(storageKey);
    setOperator(null);
  };

  return operator
    ? renderManager(operator, clearOperator)
    : <OperatorGate applicationName={config.applicationName} description={config.operatorDescription} footerLabel={config.footerLabel} onSelect={selectOperator} />;
}
