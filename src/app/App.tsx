import { useState } from 'react';
import { LabelTemplatesPage } from '../features/label-templates/pages/LabelTemplatesPage';
import { OperatorGate } from '../features/operators/components/OperatorGate';
import type { User } from '../features/operators/models/user';

const STORAGE_KEY = 'label-template-manager.operator';

function readOperator(): User | null {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as User) : null;
  } catch {
    return null;
  }
}

export function App() {
  const [operator, setOperator] = useState<User | null>(readOperator);
  const selectOperator = (user: User) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setOperator(user);
  };
  const clearOperator = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setOperator(null);
  };
  return operator
    ? <LabelTemplatesPage operator={operator} onChangeOperator={clearOperator} />
    : <OperatorGate onSelect={selectOperator} />;
}
