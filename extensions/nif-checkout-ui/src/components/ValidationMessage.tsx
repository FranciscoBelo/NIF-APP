import React from 'react';
import {
  Banner,
  Text,
} from '@shopify/ui-extensions-react/checkout';

interface ValidationMessageProps {
  type: 'error' | 'success' | 'info';
  message: string;
}

/**
 * Componente para mostrar mensagens de validação
 */
export function ValidationMessage({ type, message }: ValidationMessageProps) {
  if (!message) return null;

  const status = type === 'error' ? 'critical' : type === 'success' ? 'success' : 'info';

  return (
    <Banner status={status}>
      <Text>{message}</Text>
    </Banner>
  );
}
