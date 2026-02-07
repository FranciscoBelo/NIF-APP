import React, { useState, useEffect } from 'react';
import {
  reactExtension,
  BlockStack,
  useApplyAttributeChange,
  useBillingAddress,
  useAttributeValues,
} from '@shopify/ui-extensions-react/checkout';
import { NifInput } from './components/NifInput';

/**
 * Componente principal da extensão de checkout para validação de NIF
 * 
 * Funcionalidades:
 * - Campo NIF obrigatório
 * - Validação baseada no país de faturação
 * - Integração com VIES para empresas
 * - Guarda cart attributes para a function processar
 */
export default reactExtension(
  'purchase.checkout.block.render',
  () => <CheckoutExtension />
);

function CheckoutExtension() {
  const applyAttributeChange = useApplyAttributeChange();
  const billingAddress = useBillingAddress();
  const attributeValues = useAttributeValues(['nif_number', 'customer_type']);
  
  const [nifValue, setNifValue] = useState('');
  const [billingCountry, setBillingCountry] = useState('PT');

  // Atualiza país de faturação
  useEffect(() => {
    if (billingAddress?.countryCode) {
      setBillingCountry(billingAddress.countryCode);
    }
  }, [billingAddress]);

  // Restaura valor do NIF se já existe
  useEffect(() => {
    const savedNif = attributeValues.find(attr => attr.key === 'nif_number');
    if (savedNif?.value && typeof savedNif.value === 'string') {
      setNifValue(savedNif.value);
    }
  }, [attributeValues]);

  const handleNifChange = (value: string) => {
    setNifValue(value);
  };

  const handleValidationComplete = async (data: {
    isValid: boolean;
    customerType: 'B2B' | 'B2C';
    viesValidated: boolean;
  }) => {
    // Guarda os dados como cart attributes
    // A function vai ler estes valores para ajustar os impostos
    try {
      await applyAttributeChange({
        type: 'updateAttribute',
        key: 'nif_number',
        value: nifValue,
      });

      await applyAttributeChange({
        type: 'updateAttribute',
        key: 'customer_type',
        value: data.customerType,
      });

      await applyAttributeChange({
        type: 'updateAttribute',
        key: 'vies_validated',
        value: data.viesValidated.toString(),
      });

      await applyAttributeChange({
        type: 'updateAttribute',
        key: 'billing_country',
        value: billingCountry,
      });
    } catch (error) {
      console.error('Error saving cart attributes:', error);
    }
  };

  return (
    <BlockStack spacing="base">
      <NifInput
        value={nifValue}
        onChange={handleNifChange}
        onValidationComplete={handleValidationComplete}
        billingCountry={billingCountry}
      />
    </BlockStack>
  );
}
