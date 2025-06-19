import { useState, useEffect, useCallback } from 'react';

export const useButtonStates = (gamepadConnected, gamepadIndex, controllerConfig) => {
  const [buttonStates, setButtonStates] = useState({});
  const [lastButtonPress, setLastButtonPress] = useState(null);

  // Polling aprimorado dos botões do controle
  useEffect(() => {
    if (!gamepadConnected || gamepadIndex === null || !controllerConfig) return;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[gamepadIndex];

      if (!gamepad) return;

      const newButtonStates = {};
      const config = controllerConfig;

      // Verificar botões com debounce
      gamepad.buttons.forEach((button, index) => {
        const buttonName = config.buttonMap[index];
        if (buttonName) {
          const wasPressed = buttonStates[buttonName]?.pressed || false;
          const isPressed = button.pressed;

          newButtonStates[buttonName] = {
            pressed: isPressed,
            value: button.value,
            justPressed: !wasPressed && isPressed,
            justReleased: wasPressed && !isPressed
          };

          // Registrar último botão pressionado
          if (!wasPressed && isPressed) {
            setLastButtonPress({ button: buttonName, timestamp: Date.now() });
          }
        }
      });

      // Verificar analógicos com deadzone
      const deadzone = config.deadzone;

      const applyDeadzone = (value) => {
        return Math.abs(value) < deadzone ? 0 : value;
      };

      const leftStick = {
        x: applyDeadzone(gamepad.axes[config.axes.leftX] || 0),
        y: applyDeadzone(gamepad.axes[config.axes.leftY] || 0)
      };

      const rightStick = {
        x: applyDeadzone(gamepad.axes[config.axes.rightX] || 0),
        y: applyDeadzone(gamepad.axes[config.axes.rightY] || 0)
      };

      newButtonStates.leftStick = leftStick;
      newButtonStates.rightStick = rightStick;

      // Detectar movimento dos analógicos
      newButtonStates.leftStickMove = Math.abs(leftStick.x) > 0 || Math.abs(leftStick.y) > 0;
      newButtonStates.rightStickMove = Math.abs(rightStick.x) > 0 || Math.abs(rightStick.y) > 0;

      setButtonStates(newButtonStates);
    };

    const interval = setInterval(pollGamepad, 16); // ~60 FPS
    return () => clearInterval(interval);
  }, [gamepadConnected, gamepadIndex, controllerConfig, buttonStates]);

  // Função para verificar se um botão foi pressionado
  const isButtonPressed = useCallback((buttonName) => {
    return buttonStates[buttonName]?.pressed || false;
  }, [buttonStates]);

  // Função para verificar se um botão foi pressionado agora
  const isButtonJustPressed = useCallback((buttonName) => {
    return buttonStates[buttonName]?.justPressed || false;
  }, [buttonStates]);

  // Função para obter valor do analógico
  const getStickValue = useCallback((stick) => {
    return buttonStates[stick] || { x: 0, y: 0 };
  }, [buttonStates]);

  return {
    buttonStates,
    lastButtonPress,
    isButtonPressed,
    isButtonJustPressed,
    getStickValue
  };
};