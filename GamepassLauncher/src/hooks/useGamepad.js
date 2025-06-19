import { useControllerDetection } from './gamepad/useControllerDetection';
import { useButtonStates } from './gamepad/useButtonStates';
import { useGamepadNavigation } from './gamepad/useGamepadNavigation';
import { useGamepadHaptics } from './gamepad/useGamepadHaptics';

// Hook principal refatorado que unifica todos os hooks especializados
export const useGamepad = () => {
  // 1. Detecção e configuração do controle
  const {
    gamepadConnected,
    gamepadIndex,
    controllerType,
    controllerConfig,
    hapticSupported,
    getControllerInfo,
    CONTROLLER_CONFIGS
  } = useControllerDetection();

  // 2. Monitoramento de botões e analógicos
  const {
    buttonStates,
    lastButtonPress,
    isButtonPressed,
    isButtonJustPressed,
    getStickValue
  } = useButtonStates(gamepadConnected, gamepadIndex, controllerConfig);

  // 3. Sistema de navegação universal
  const {
    getNavigationInput,
    getConfirmButton,
    getCancelButton,
    getMenuButton,
    getBackButton,
    getLeftBumper,
    getRightBumper,
    getRightStickClick
  } = useGamepadNavigation(controllerType, isButtonJustPressed, getStickValue);

  // 4. Feedback háptico
  const {
    vibrate,
    calibrateController,
    navigationVibrate
  } = useGamepadHaptics(gamepadConnected, gamepadIndex, hapticSupported);

  // Função conveniente para calibração com config
  const calibrate = () => calibrateController(controllerConfig);

  return {
    // Estados básicos
    gamepadConnected,
    gamepadIndex,
    controllerType,
    controllerConfig,
    buttonStates,
    lastButtonPress,
    hapticSupported,

    // Funções de input
    isButtonPressed,
    isButtonJustPressed,
    getStickValue,
    getNavigationInput,

    // Mapeamento universal
    getConfirmButton,
    getCancelButton,
    getMenuButton,
    getBackButton,
    getLeftBumper,
    getRightBumper,
    getRightStickClick,

    // Funcionalidades extras
    vibrate,
    calibrateController: calibrate,
    navigationVibrate,
    getControllerInfo,

    // Configurações disponíveis
    CONTROLLER_CONFIGS
  };
};