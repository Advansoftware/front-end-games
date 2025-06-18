import React, { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon
} from '@mui/icons-material';

const YouTubePlayer = ({ videoId, autoplay = false, muted = true, controls = false, className }) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(muted);
  const [player, setPlayer] = useState(null);

  // Carregar API do YouTube
  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

  const initializePlayer = () => {
    if (window.YT && window.YT.Player) {
      const newPlayer = new window.YT.Player(`youtube-player-${videoId}`, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          mute: muted ? 1 : 0,
          controls: controls ? 1 : 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          loop: 1,
          playlist: videoId // Para loop funcionar
        },
        events: {
          onReady: (event) => {
            setPlayer(event.target);
            if (autoplay) {
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          }
        }
      });
    }
  };

  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
        setIsMuted(false);
      } else {
        player.mute();
        setIsMuted(true);
      }
    }
  };

  return (
    <Box
      className={className}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        '& iframe': {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        }
      }}
    >
      <div id={`youtube-player-${videoId}`} />

      {/* Controles customizados */}
      {controls && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            display: 'flex',
            gap: 1,
            zIndex: 10
          }}
        >
          <IconButton
            onClick={togglePlay}
            sx={{
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.9)'
              }
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>

          <IconButton
            onClick={toggleMute}
            sx={{
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.9)'
              }
            }}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default YouTubePlayer;