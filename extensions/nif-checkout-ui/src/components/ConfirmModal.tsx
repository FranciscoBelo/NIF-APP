import React from 'react';
import {
  BlockStack,
  Button,
  InlineLayout,
  Text,
  Modal,
} from '@shopify/ui-extensions-react/checkout';

interface ConfirmModalProps {
  isOpen: boolean;
  onCorrect: () => void;
  onProceedAsConsumer: () => void;
}

/**
 * Modal de confirmação para NIFs portugueses inválidos (consumidor final)
 * Oferece opção de corrigir ou prosseguir como consumidor final (NIF 999999999)
 */
export function ConfirmModal({
  isOpen,
  onCorrect,
  onProceedAsConsumer,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      id="nif-invalid-modal"
      title="NIF inválido"
      padding
    >
      <BlockStack spacing="base">
        <Text>
          O NIF inserido não está num formato válido. Deseja corrigir ou prosseguir como consumidor final?
        </Text>
        
        <InlineLayout
          spacing="base"
          blockAlignment="center"
        >
          <Button
            kind="secondary"
            onPress={onCorrect}
          >
            Corrigir
          </Button>
          
          <Button
            kind="primary"
            onPress={onProceedAsConsumer}
          >
            Prosseguir como consumidor final
          </Button>
        </InlineLayout>
      </BlockStack>
    </Modal>
  );
}
