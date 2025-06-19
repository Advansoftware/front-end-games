import { useEffect, useCallback } from 'react';
import { useGamepad } from './useGamepad';
import { useGamepadDebounce } from './gamepad/useGamepadDebounce';

// Hook específico para navegação na tela de configurações (apenas entrar/sair)
export const useSettingsNavigation = ({
  onBack,
  router
}) => {
  // Debounce para ações
  const { debounce: debounceAction } = useGamepadDebounce(400);

  const gamepad = useGamepad();
  const navigation = gamepad.getNavigationInput();

  // Ação de cancelar/voltar (botão B)
  const cancelAction = useCallback(() => {
    const executed = debounceAction(() => {
      console.log('🎮 Configurações: Botão B pressionado - voltando para tela inicial');

      if (onBack) {
        onBack();
      } else {
        router.push('/');
      }

      gamepad.navigationVibrate('cancel');
    });

    if (!executed) {
      console.log('⏱️ Configurações: Ação B ignorada devido ao debounce');
    }
  }, [onBack, router, gamepad, debounceAction]);

  // Efeito principal para escutar inputs do gamepad
  useEffect(() => {
    if (!gamepad.gamepadConnected) return;

    // Apenas escutar botão B para voltar
    if (navigation.cancel) {
      cancelAction();
    }

    // Menu/Start também volta
    if (navigation.menu) {
      cancelAction();
    }

  }, [
    navigation,
    gamepad.gamepadConnected,
    cancelAction
  ]);

  return {
    // Informações de navegação
    navigationInfo: {
      gamepadConnected: gamepad.gamepadConnected,
      controllerType: gamepad.controllerType
    }
  };
};