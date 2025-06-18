import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const useGamepad = () => {
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadIndex, setGamepadIndex] = useState(null);
  const [buttonStates, setButtonStates] = useState({});
  const { playSound } = useTheme();

  // Mapeamento de botões do controle
  const BUTTON_MAP = {
    0: 'A',        // A/Cross
    1: 'B',        // B/Circle
    2: 'X',        // X/Square
    3: 'Y',        // Y/Triangle
    4: 'LB',       // Left Bumper/L1
    5: 'RB',       // Right Bumper/R1
    6: 'LT',       // Left Trigger/L2
    7: 'RT',       // Right Trigger/R2
    8: 'Back',     // Back/Select/Share
    9: 'Start',    // Start/Menu/Options
    10: 'LS',      // Left Stick
    11: 'RS',      // Right Stick
    12: 'Up',      // D-pad Up
    13: 'Down',    // D-pad Down
    14: 'Left',    // D-pad Left
    15: 'Right',   // D-pad Right
    16: 'Home'     // Xbox/PS/Home button
  };

  // Detectar conexão/desconexão de controles
  useEffect(() => {
    const handleGamepadConnected = (e) => {
      console.log('Controle conectado:', e.gamepad.id);
      setGamepadConnected(true);
      setGamepadIndex(e.gamepad.index);
      playSound('controller-connect');
    };

    const handleGamepadDisconnected = (e) => {
      console.log('Controle desconectado:', e.gamepad.id);
      setGamepadConnected(false);
      setGamepadIndex(null);
      playSound('controller-disconnect');
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Verificar controles já conectados
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        setGamepadConnected(true);
        setGamepadIndex(i);
        break;
      }
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [playSound]);

  // Polling dos botões do controle
  useEffect(() => {
    if (!gamepadConnected || gamepadIndex === null) return;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[gamepadIndex];

      if (!gamepad) return;

      const newButtonStates = {};

      // Verificar botões
      gamepad.buttons.forEach((button, index) => {
        const buttonName = BUTTON_MAP[index];
        if (buttonName) {
          newButtonStates[buttonName] = {
            pressed: button.pressed,
            value: button.value
          };
        }
      });

      // Verificar analógicos
      const leftStick = {
        x: gamepad.axes[0] || 0,
        y: gamepad.axes[1] || 0
      };

      const rightStick = {
        x: gamepad.axes[2] || 0,
        y: gamepad.axes[3] || 0
      };

      newButtonStates.leftStick = leftStick;
      newButtonStates.rightStick = rightStick;

      setButtonStates(newButtonStates);
    };

    const interval = setInterval(pollGamepad, 16); // ~60 FPS
    return () => clearInterval(interval);
  }, [gamepadConnected, gamepadIndex]);

  // Função para verificar se um botão foi pressionado
  const isButtonPressed = useCallback((buttonName) => {
    return buttonStates[buttonName]?.pressed || false;
  }, [buttonStates]);

  // Função para obter valor do analógico
  const getStickValue = useCallback((stick) => {
    return buttonStates[stick] || { x: 0, y: 0 };
  }, [buttonStates]);

  // Navegar com D-pad ou analógico esquerdo
  const getNavigationInput = useCallback(() => {
    const leftStick = getStickValue('leftStick');
    const threshold = 0.5;

    return {
      up: isButtonPressed('Up') || leftStick.y < -threshold,
      down: isButtonPressed('Down') || leftStick.y > threshold,
      left: isButtonPressed('Left') || leftStick.x < -threshold,
      right: isButtonPressed('Right') || leftStick.x > threshold,
      confirm: isButtonPressed('A'),
      cancel: isButtonPressed('B'),
      menu: isButtonPressed('Start'),
      back: isButtonPressed('Back')
    };
  }, [isButtonPressed, getStickValue]);

  // Vibração do controle (se suportado)
  const vibrate = useCallback((duration = 200, strongMagnitude = 1.0, weakMagnitude = 1.0) => {
    if (!gamepadConnected || gamepadIndex === null) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[gamepadIndex];

    if (gamepad && gamepad.vibrationActuator) {
      gamepad.vibrationActuator.playEffect('dual-rumble', {
        duration,
        strongMagnitude,
        weakMagnitude
      });
    }
  }, [gamepadConnected, gamepadIndex]);

  return {
    gamepadConnected,
    gamepadIndex,
    buttonStates,
    isButtonPressed,
    getStickValue,
    getNavigationInput,
    vibrate,
    BUTTON_MAP
  };
};