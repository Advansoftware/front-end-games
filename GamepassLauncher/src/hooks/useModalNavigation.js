import { useEffect, useCallback } from 'react';
import { useGamepadNavigation } from './gamepad/useGamepadNavigation';

/**
 * Hook para navegação de modais com gamepad
 * Fornece controles consistentes para todos os modais da aplicação
 */
export const useModalNavigation = ({
  isOpen,
  onClose,
  onConfirm = null,
  disabled = false
}) => {
  const { getNavigationInput } = useGamepadNavigation();

  const handleGamepadInput = useCallback(() => {
    if (!isOpen || disabled) return;

    const input = getNavigationInput();

    // Botão de cancelar/voltar fecha o modal
    if (input.cancel || input.back) {
      onClose();
      return;
    }

    // ESC também fecha o modal
    if (input.menu) {
      onClose();
      return;
    }

    // Botão de confirmar executa ação se disponível
    if (input.confirm && onConfirm) {
      onConfirm();
      return;
    }
  }, [isOpen, onClose, onConfirm, disabled, getNavigationInput]);

  // Controle por teclado (ESC)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen || disabled) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }

      // Enter para confirmar se disponível
      if (event.key === 'Enter' && onConfirm) {
        event.preventDefault();
        onConfirm();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose, onConfirm, disabled]);

  // Loop de gamepad
  useEffect(() => {
    if (!isOpen || disabled) return;

    const gamepadInterval = setInterval(handleGamepadInput, 100);
    return () => clearInterval(gamepadInterval);
  }, [isOpen, disabled, handleGamepadInput]);

  // Prevenir scroll quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen]);

  return {
    // Funções para usar nos componentes
    handleClose: onClose,
    handleConfirm: onConfirm
  };
};