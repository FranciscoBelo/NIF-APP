import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  BlockStack,
  ProgressIndicator,
} from '@shopify/ui-extensions-react/checkout';
import { ValidationMessage } from './ValidationMessage';
import { ConfirmModal } from './ConfirmModal';
import {
  validatePortugueseConsumerNif,
  isPortugueseBusinessNif,
  isPortugueseConsumerNif,
  cleanNif,
} from '../utils/nifValidator';
import { validateVies, needsViesValidation } from '../utils/viesApi';

interface NifInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationComplete: (data: {
    isValid: boolean;
    customerType: 'B2B' | 'B2C';
    viesValidated: boolean;
  }) => void;
  billingCountry: string;
}

/**
 * Componente principal para input e validação de NIF
 * 
 * Lógica de validação:
 * - PT com 1,2,3: Valida formato (9 dígitos), mostra modal se inválido
 * - PT com 5,6,9: Valida via VIES, silencioso se falhar
 * - Outros países UE: Valida via VIES, silencioso se falhar
 */
export function NifInput({
  value,
  onChange,
  onValidationComplete,
  billingCountry,
}: NifInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<{
    type: 'error' | 'success' | 'info';
    text: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validação com debounce
  useEffect(() => {
    if (!value || value.length < 3) {
      setValidationMessage(null);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      validateNif(value);
    }, 800); // Debounce de 800ms

    return () => clearTimeout(timeoutId);
  }, [value, billingCountry]);

  const validateNif = async (nif: string) => {
    setIsValidating(true);
    setValidationMessage(null);
    setError(null);

    const cleaned = cleanNif(nif);

    // PORTUGAL
    if (billingCountry === 'PT') {
      // Consumidor final (1, 2, 3)
      if (isPortugueseConsumerNif(cleaned)) {
        const isValid = validatePortugueseConsumerNif(cleaned);
        
        if (!isValid) {
          // NIF inválido - mostrar modal
          setShowModal(true);
          setIsValidating(false);
          return;
        }
        
        // NIF válido de consumidor
        setValidationMessage(null);
        onValidationComplete({
          isValid: true,
          customerType: 'B2C',
          viesValidated: false,
        });
        setIsValidating(false);
        return;
      }
      
      // Empresa (5, 6, 9) - validar via VIES
      if (isPortugueseBusinessNif(cleaned)) {
        const viesResult = await validateVies(cleaned, 'PT');
        
        if (viesResult.isValid) {
          // VIES válido - é B2B
          setValidationMessage({
            type: 'success',
            text: '✅ NIF de empresa validado via VIES',
          });
          onValidationComplete({
            isValid: true,
            customerType: 'B2B',
            viesValidated: true,
          });
        } else {
          // VIES inválido - silencioso, assume B2C
          setValidationMessage(null);
          onValidationComplete({
            isValid: true,
            customerType: 'B2C',
            viesValidated: false,
          });
        }
        
        setIsValidating(false);
        return;
      }
    }
    
    // OUTROS PAÍSES UE
    if (needsViesValidation(cleaned, billingCountry)) {
      const viesResult = await validateVies(cleaned, billingCountry);
      
      if (viesResult.isValid) {
        // VIES válido - é B2B
        setValidationMessage({
          type: 'success',
          text: '✅ NIF de empresa validado via VIES',
        });
        onValidationComplete({
          isValid: true,
          customerType: 'B2B',
          viesValidated: true,
        });
      } else {
        // VIES inválido - silencioso, assume B2C
        setValidationMessage(null);
        onValidationComplete({
          isValid: true,
          customerType: 'B2C',
          viesValidated: false,
        });
      }
    } else {
      // País não UE - assume B2C
      onValidationComplete({
        isValid: true,
        customerType: 'B2C',
        viesValidated: false,
      });
    }
    
    setIsValidating(false);
  };

  const handleModalCorrect = () => {
    setShowModal(false);
    onChange('');
    setError('O NIF inserido não está num formato válido');
  };

  const handleModalProceedAsConsumer = () => {
    setShowModal(false);
    onChange('999999999');
    setError(null);
    onValidationComplete({
      isValid: true,
      customerType: 'B2C',
      viesValidated: false,
    });
  };

  return (
    <BlockStack spacing="tight">
      <TextField
        label="NIF / NIPC"
        value={value}
        onChange={onChange}
        required
        error={error}
      >
        {isValidating && <ProgressIndicator size="small" />}
      </TextField>
      
      {validationMessage && (
        <ValidationMessage
          type={validationMessage.type}
          message={validationMessage.text}
        />
      )}
      
      <ConfirmModal
        isOpen={showModal}
        onCorrect={handleModalCorrect}
        onProceedAsConsumer={handleModalProceedAsConsumer}
      />
    </BlockStack>
  );
}
