import { useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const useGamepadHaptics = (gamepadConnected, gamepadIndex, hapticSupported) => {
  const { playSound } = useTheme();

  // Vibração aprimorada do controle
  const vibrate = useCallback((pattern = 'short', intensity = 0.8) => {
    if (!gamepadConnected || gamepadIndex === null || !hapticSupported) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[gamepadIndex];

    if (!gamepad?.vibrationActuator) return;

    const patterns = {
      short: { duration: 100, strongMagnitude: intensity, weakMagnitude: intensity * 0.5 },
      medium: { duration: 200, strongMagnitude: intensity, weakMagnitude: intensity * 0.7 },
      long: { duration: 500, strongMagnitude: intensity * 0.8, weakMagnitude: intensity },
      pulse: { duration: 50, strongMagnitude: intensity, weakMagnitude: 0 },
      rumble: { duration: 300, strongMagnitude: 0, weakMagnitude: intensity }
    };

    const effect = patterns[pattern] || patterns.short;

    gamepad.vibrationActuator.playEffect('dual-rumble', effect).catch(() => {
      console.warn('Haptic feedback não suportado');
    });
  }, [gamepadConnected, gamepadIndex, hapticSupported]);

  // Calibrar controle (resetar deadzone e configurações)
  const calibrateController = useCallback((controllerConfig) => {
    if (!controllerConfig) return;

    console.log(`🎮 Calibrando ${controllerConfig.name}...`);
    vibrate('pulse');
    playSound('confirm');
  }, [vibrate, playSound]);

  // Feedback háptico para navegação
  const navigationVibrate = useCallback((action) => {
    const feedbackMap = {
      navigate: { pattern: 'short', intensity: 0.2 },
      confirm: { pattern: 'medium', intensity: 0.5 },
      cancel: { pattern: 'pulse', intensity: 0.3 },
      select: { pattern: 'medium', intensity: 0.4 },
      error: { pattern: 'long', intensity: 0.7 },
      success: { pattern: 'pulse', intensity: 0.6 }
    };

    const feedback = feedbackMap[action];
    if (feedback) {
      vibrate(feedback.pattern, feedback.intensity);
    }
  }, [vibrate]);

  return {
    vibrate,
    calibrateController,
    navigationVibrate
  };
};