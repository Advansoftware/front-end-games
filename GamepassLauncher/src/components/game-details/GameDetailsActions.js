import React from 'react';
import { Stack } from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Update as UpdateIcon,
  YouTube as YouTubeIcon,
  CloudDownload as CloudIcon
} from '@mui/icons-material';

import { useGames } from '../../contexts/GamesContext';
import { useDownloads } from '../../hooks/useDownloads';
import CustomButton from '../CustomButton';

const GameDetailsActions = ({ game, onShowTrailer, getButtonProps }) => {
  const {
    downloadGame,
    updateGame,
    launchGame,
    updateProgress
  } = useGames();

  const { activeDownloads } = useDownloads();

  // Lógica de estado do jogo
  const downloadData = activeDownloads.get(game.id);
  const updatePercent = updateProgress[game.id];
  const isDownloading = downloadData !== undefined;

  const progressPercent = isDownloading ? Math.round(downloadData.progress || 0) : 0;
  const updateProgressPercent = updatePercent ? Math.round(updatePercent) : 0;

  const isInstalling = downloadData?.status === 'installing';
  const isUpdating = game?.installed && isDownloading;

  // Simular atualizações disponíveis
  const hasUpdate = game && [1, 3].includes(game.id) && game.installed && !isDownloading;

  // Função para obter mensagem da operação
  const getOperationMessage = () => {
    if (!isDownloading) return '';
    if (isInstalling) return 'Instalando';
    if (isUpdating) return 'Atualizando';
    return 'Baixando';
  };

  const operationMessage = getOperationMessage();

  // Handlers
  const handlePlay = () => {
    launchGame(game.id);
  };

  const handleDownload = () => {
    downloadGame(game.id);
  };

  const handleUpdate = () => {
    updateGame(game.id);
  };

  // Construir array de botões disponíveis para navegação
  const getAvailableButtons = () => {
    const buttons = [];
    let buttonIndex = 0;

    // Se está baixando/instalando/atualizando - APENAS o botão de progresso
    if (isDownloading || isUpdating) {
      buttons.push({
        index: buttonIndex++,
        type: 'progress',
        element: (
          <CustomButton
            key="progress"
            variant={isUpdating ? "warning" : "info"}
            size="medium"
            startIcon={<CloudIcon />}
            disabled={true}
            downloadProgress={isDownloading ? progressPercent : updateProgressPercent}
            {...(getButtonProps ? getButtonProps(buttonIndex - 1) : {})}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              minWidth: 180,
              ...(getButtonProps ? getButtonProps(buttonIndex - 1).sx : {})
            }}
          >
            {operationMessage}
          </CustomButton>
        )
      });
    } else {
      // Se está instalado E não tem atualização - JOGAR AGORA
      if (game.installed && !hasUpdate) {
        buttons.push({
          index: buttonIndex++,
          type: 'play',
          element: (
            <CustomButton
              key="play"
              variant="success"
              size="medium"
              startIcon={<PlayIcon />}
              onClick={handlePlay}
              {...(getButtonProps ? getButtonProps(buttonIndex - 1) : {})}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                minWidth: 160,
                ...(getButtonProps ? getButtonProps(buttonIndex - 1).sx : {})
              }}
            >
              Jogar Agora
            </CustomButton>
          )
        });
      }

      // Se tem atualização disponível - ATUALIZAR
      if (hasUpdate) {
        buttons.push({
          index: buttonIndex++,
          type: 'update',
          element: (
            <CustomButton
              key="update"
              variant="warning"
              size="medium"
              startIcon={<UpdateIcon />}
              onClick={handleUpdate}
              {...(getButtonProps ? getButtonProps(buttonIndex - 1) : {})}
              sx={{
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                ...(getButtonProps ? getButtonProps(buttonIndex - 1).sx : {})
              }}
            >
              Atualizar
            </CustomButton>
          )
        });
      }

      // Se NÃO está instalado - BAIXAR
      if (!game.installed) {
        buttons.push({
          index: buttonIndex++,
          type: 'download',
          element: (
            <CustomButton
              key="download"
              variant="primary"
              size="medium"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              {...(getButtonProps ? getButtonProps(buttonIndex - 1) : {})}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                minWidth: 180,
                ...(getButtonProps ? getButtonProps(buttonIndex - 1).sx : {})
              }}
            >
              Baixar Jogo
            </CustomButton>
          )
        });
      }
    }

    // Botão de trailer - sempre disponível
    if (game.youtubeVideoId) {
      buttons.push({
        index: buttonIndex++,
        type: 'trailer',
        element: (
          <CustomButton
            key="trailer"
            variant="outlined"
            size="medium"
            startIcon={<YouTubeIcon />}
            onClick={onShowTrailer}
            {...(getButtonProps ? getButtonProps(buttonIndex - 1) : {})}
            sx={{
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
              ...(getButtonProps ? getButtonProps(buttonIndex - 1).sx : {})
            }}
          >
            Ver Trailer
          </CustomButton>
        )
      });
    }

    return buttons;
  };

  const availableButtons = getAvailableButtons();

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
      {availableButtons.map(button => button.element)}
    </Stack>
  );
};

export default GameDetailsActions;