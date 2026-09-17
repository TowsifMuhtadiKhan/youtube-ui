import { useEffect, useRef, useState } from "react";
import { Alert, Box } from "@mui/material";
interface Player {
  destroy: () => void;
  stopVideo: () => void;
  getVideoData: () => { video_id: string };
}
interface PlayerEvent {
  data: number;
  target: Player;
}
declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLIFrameElement, options: unknown) => Player;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}
let apiReady: Promise<void> | undefined;
function loadApi() {
  if (window.YT?.Player) return Promise.resolve();
  if (!apiReady)
    apiReady = new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        apiReady = undefined;
        reject(
          new Error("The video player could not connect. Please try again."),
        );
      }, 20000);
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timer);
        resolve();
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => {
        clearTimeout(timer);
        apiReady = undefined;
        reject(new Error("Unable to load the video player."));
      };
      document.head.appendChild(script);
    });
  return apiReady;
}
export default function SafeYouTubePlayer({
  videoId,
  onPlaying,
  onPaused,
  onEnded,
}: {
  videoId: string;
  onPlaying: () => void;
  onPaused: () => void;
  onEnded: () => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    callbacks = useRef({ onPlaying, onPaused, onEnded });
  const [error, setError] = useState("");
  callbacks.current = { onPlaying, onPaused, onEnded };
  useEffect(() => {
    let active = true;
    let player: Player | undefined;
    setError("");
    const start = async () => {
      try {
        await loadApi();
        if (!active || !host.current || !window.YT) return;
        const iframe = document.createElement("iframe");
        iframe.title = "Video player";
        // Set sandbox BEFORE loading the document. Do not grant popup or top-navigation permissions.
        iframe.setAttribute(
          "sandbox",
          "allow-scripts allow-same-origin allow-presentation",
        );
        iframe.allow =
          "autoplay; encrypted-media; fullscreen; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.style.cssText = "display:block;width:100%;height:100%;border:0";
        const params = new URLSearchParams({
          enablejsapi: "1",
          origin: window.location.origin,
          playsinline: "1",
          rel: "0",
          autoplay: "1",
        });
        iframe.src =
          "https://www.youtube-nocookie.com/embed/" +
          encodeURIComponent(videoId) +
          "?" +
          params;
        host.current.replaceChildren(iframe);
        player = new window.YT.Player(iframe, {
          events: {
            onStateChange: (event: PlayerEvent) => {
              if (!active) return;
              const actualId = event.target.getVideoData()?.video_id;
              if (actualId && actualId !== videoId) {
                event.target.stopVideo();
                callbacks.current.onPaused();
                setError("Choose another video from your saved list.");
                return;
              }
              if (event.data === 1) callbacks.current.onPlaying();
              else {
                callbacks.current.onPaused();
                if (event.data === 0) callbacks.current.onEnded();
              }
            },
            onError: () => {
              if (active) {
                callbacks.current.onPaused();
                setError(
                  "This video cannot be played here. Choose another saved video.",
                );
              }
            },
          },
        });
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : "Unable to load player.");
      }
    };
    void start();
    return () => {
      active = false;
      callbacks.current.onPaused();
      player?.destroy();
      host.current?.replaceChildren();
    };
  }, [videoId]);
  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}
      <Box
        ref={host}
        sx={{
          width: "100%",
          aspectRatio: "16/9",
          minHeight: 200,
          bgcolor: "#000",
          borderRadius: { xs: 2, md: 3 },
          overflow: "hidden",
        }}
      />
    </>
  );
}
