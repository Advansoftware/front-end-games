import { useCallback } from 'react';

export const useGamepadNavigation = (controllerType, isButtonJustPressed, getStickValue) => {
  // Mapear botões universais baseado no tipo de controle
  const getConfirmButton = useCallback(() => {
    switch (controllerType) {
      case 'XBOX': return 'A';
      case 'PLAYSTATION': return 'Cross';
      case 'SWITCH': return 'A';
      case 'BITDO': return 'A';
      case 'DIRECTINPUT': return 'Button1';
      default: return 'A';
    }
  }, [controllerType]);

  const getCancelButton = useCallback(() => {
    switch (controllerType) {
      case 'XBOX': return 'B';
      case 'PLAYSTATION': return 'Circle';
      case 'SWITCH': return 'B';
      case 'BITDO': return 'B';
      case 'DIRECTINPUT': return 'Button2';
      default: return 'B';
    }
  }, [controllerType]);

  const getMenuButton = useCallback(() => {
    switch (controllerType) {
      case 'XBOX': return 'Start';
      case 'PLAYSTATION': return 'Options';
      case 'SWITCH': return 'Plus';
      case 'BITDO': return 'Start';
      case 'DIRECTINPUT': return 'Button10';
      default: return 'Start';
    }
  }, [controllerType]);

  const getBackButton = useCallback(() => {
    switch (controllerType) {
      case 'XBOX': return 'Back';
      case 'PLAYSTATION': return 'Share';
      case 'SWITCH': return 'Minus';
      case 'BITDO': return 'Select';
      case 'DIRECTINPUT': return 'Button9';
      default: return 'Back';
    }
  }, [controllerType]);

  const getLeftBumper = useCallback(() => {
    switch (controllerType) {
      case 'XBOX': return 'LB';
      case 'PLAYSTATION': return 'L1';
      case 'SWITCH': return 'L';
      case 'BITDO': return 'L';
      case 'DIRECTINPUT': return 'Button5';
      default: return 'LB';
    }
  }, [controllerType]);

  const getRightBumper = useCallback(() => {
    switch (controllerType) {
      case 'XBOX': return 'RB';
      case 'PLAYSTATION': return 'R1';
      case 'SWITCH': return 'R';
      case 'BITDO': return 'R';
      case 'DIRECTINPUT': return 'Button6';
      default: return 'RB';
    }
  }, [controllerType]);

  const getRightStickClick = useCallback(() => {
    switch (controllerType) {
      case 'XBOX': return 'RS';
      case 'PLAYSTATION': return 'R3';
      case 'SWITCH': return 'RS';
      case 'BITDO': return 'RS';
      case 'DIRECTINPUT': return 'Button12';
      default: return 'RS';
    }
  }, [controllerType]);

  // Sistema de navegação universal (experiência console)
  const getNavigationInput = useCallback(() => {
    const leftStick = getStickValue('leftStick');
    const threshold = 0.7;

    const getUniversalButton = (action) => {
      if (!controllerType) return false;

      const actionMap = {
        up: isButtonJustPressed('Up') || (leftStick.y < -threshold),
        down: isButtonJustPressed('Down') || (leftStick.y > threshold),
        left: isButtonJustPressed('Left') || (leftStick.x < -threshold),
        right: isButtonJustPressed('Right') || (leftStick.x > threshold),
        confirm: isButtonJustPressed(getConfirmButton()),
        cancel: isButtonJustPressed(getCancelButton()),
        menu: isButtonJustPressed(getMenuButton()),
        back: isButtonJustPressed(getBackButton()),
        leftBumper: isButtonJustPressed(getLeftBumper()),
        rightBumper: isButtonJustPressed(getRightBumper()),
        rightStickClick: isButtonJustPressed(getRightStickClick()) // R3 para sidebar
      };

      return actionMap[action] || false;
    };

    return {
      up: getUniversalButton('up'),
      down: getUniversalButton('down'),
      left: getUniversalButton('left'),
      right: getUniversalButton('right'),
      confirm: getUniversalButton('confirm'),
      cancel: getUniversalButton('cancel'),
      menu: getUniversalButton('menu'),
      back: getUniversalButton('back'),
      leftBumper: getUniversalButton('leftBumper'),
      rightBumper: getUniversalButton('rightBumper'),
      rightStickClick: getUniversalButton('rightStickClick')
    };
  }, [
    isButtonJustPressed,
    getStickValue,
    controllerType,
    getConfirmButton,
    getCancelButton,
    getMenuButton,
    getBackButton,
    getLeftBumper,
    getRightBumper,
    getRightStickClick
  ]);

  return {
    getNavigationInput,
    getConfirmButton,
    getCancelButton,
    getMenuButton,
    getBackButton,
    getLeftBumper,
    getRightBumper,
    getRightStickClick
  };
};