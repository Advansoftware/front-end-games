import { useState, useEffect, useCallback } from 'react';

export const useButtonStates = (gamepadConnected, gamepadIndex, controllerConfig) => {
  const [buttonStates, setButtonStates] = useState({});
  const [lastButtonPress, setLastButtonPress] = useState(null);
  const [buttonCooldowns, setButtonCooldowns] = useState({}); // Cooldown por botão

  // Constantes para debounce
  const BUTTON_DEBOUNCE_TIME = 150; // 150ms de cooldown entre presses
  const STICK_DEBOUNCE_TIME = 200; // 200ms para analógicos

  // Polling aprimorado dos botões do controle com debounce
  useEffect(() => {
    if (!gamepadConnected || gamepadIndex === null || !controllerConfig) return;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[gamepadIndex];

      if (!gamepad) return;

      const newButtonStates = {};
      const newCooldowns = { ...buttonCooldowns };
      const currentTime = Date.now();
      const config = controllerConfig;

      // Verificar botões com debounce melhorado
      gamepad.buttons.forEach((button, index) => {
        const buttonName = config.buttonMap[index];
        if (buttonName) {
          const wasPressed = buttonStates[buttonName]?.pressed || false;
          const isPressed = button.pressed && button.value > 0.5; // Threshold mais alto
          const lastCooldown = newCooldowns[buttonName] || 0;
          const isInCooldown = currentTime - lastCooldown < BUTTON_DEBOUNCE_TIME;

          // Detectar justPressed apenas se não estiver em cooldown
          const justPressed = !wasPressed && isPressed && !isInCooldown;
          const justReleased = wasPressed && !isPressed;

          newButtonStates[buttonName] = {
            pressed: isPressed,
            value: button.value,
            justPressed,
            justReleased
          };

          // Atualizar cooldown apenas quando botão é realmente pressionado
          if (justPressed) {
            newCooldowns[buttonName] = currentTime;
            setLastButtonPress({ button: buttonName, timestamp: currentTime });
          }

          // Limpar cooldown quando botão é solto
          if (justReleased) {
            newCooldowns[buttonName] = 0;
          }
        }
      });

      // Verificar analógicos com deadzone e debounce
      const deadzone = config.deadzone;
      const stickThreshold = 0.7; // Threshold para navegação

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

      // Detectar direções do analógico com debounce
      const stickDirections = ['Up', 'Down', 'Left', 'Right'];
      stickDirections.forEach(direction => {
        const wasPressed = buttonStates[direction]?.pressed || false;
        let isPressed = false;

        // Determinar se a direção está pressionada
        switch (direction) {
          case 'Up':
            isPressed = leftStick.y < -stickThreshold;
            break;
          case 'Down':
            isPressed = leftStick.y > stickThreshold;
            break;
          case 'Left':
            isPressed = leftStick.x < -stickThreshold;
            break;
          case 'Right':
            isPressed = leftStick.x > stickThreshold;
            break;
        }

        const lastCooldown = newCooldowns[direction] || 0;
        const isInCooldown = currentTime - lastCooldown < STICK_DEBOUNCE_TIME;
        const justPressed = !wasPressed && isPressed && !isInCooldown;
        const justReleased = wasPressed && !isPressed;

        newButtonStates[direction] = {
          pressed: isPressed,
          value: isPressed ? 1 : 0,
          justPressed,
          justReleased
        };

        // Atualizar cooldown para direções do analógico
        if (justPressed) {
          newCooldowns[direction] = currentTime;
          setLastButtonPress({ button: direction, timestamp: currentTime });
        }

        if (justReleased) {
          newCooldowns[direction] = 0;
        }
      });

      newButtonStates.leftStick = leftStick;
      newButtonStates.rightStick = rightStick;

      // Detectar movimento dos analógicos
      newButtonStates.leftStickMove = Math.abs(leftStick.x) > 0 || Math.abs(leftStick.y) > 0;
      newButtonStates.rightStickMove = Math.abs(rightStick.x) > 0 || Math.abs(rightStick.y) > 0;

      setButtonStates(newButtonStates);
      setButtonCooldowns(newCooldowns);
    };

    const interval = setInterval(pollGamepad, 16); // Manter 60 FPS mas com debounce
    return () => clearInterval(interval);
  }, [gamepadConnected, gamepadIndex, controllerConfig, buttonStates, buttonCooldowns]);

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