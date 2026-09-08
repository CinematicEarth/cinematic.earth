/*
 * Copyright (C) 2026 Garrett Brown
 * This file is part of meditation.surf - https://github.com/eigendude/meditation.surf
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * See the file LICENSE.txt for more information.
 */

import type shaka from "shaka-player";

/** Connect the single play button to the inline video. */
export function launchApp(): void {
  const videoElement: HTMLVideoElement | null =
    document.querySelector<HTMLVideoElement>("#background-video");
  const playButton: HTMLButtonElement | null =
    document.querySelector<HTMLButtonElement>("#play-button");

  if (videoElement === null || playButton === null) {
    throw new Error("The video and play button are missing from the page.");
  }

  const streamUrl: string =
    "https://stream.mux.com/7YtWnCpXIt014uMcBK65ZjGfnScdcAneU9TjM9nGAJhk.m3u8";
  let shakaPlayer: shaka.Player | null = null;
  let streamLoaded: boolean = false;

  /** Keep the page black whenever playback is stopped or cannot start. */
  const showPlayButton: () => void = (): void => {
    videoElement.style.visibility = "hidden";
    playButton.hidden = false;
  };

  /** Leave a usable retry button instead of getting stuck on a blank screen. */
  const handlePlaybackError: (errError: unknown) => void = (
    errError: unknown,
  ): void => {
    console.error("Video playback failed", errError);
    // A permission failure does not invalidate the prepared stream. Keep it
    // ready so another click can call play() without awaiting a network load.
    if (!(errError instanceof Error && errError.name === "NotAllowedError")) {
      streamLoaded = false;
    }
    videoElement.pause();
    showPlayButton();
    playButton.disabled = false;
    playButton.setAttribute("aria-label", "Retry video playback with sound");
    playButton.title = "Playback failed. Click to try again.";
  };

  // Reveal the picture only when frames actually start playing, so neither a
  // poster nor a paused first frame can appear on the initial black screen.
  videoElement.addEventListener("playing", (): void => {
    videoElement.style.visibility = "visible";
    playButton.hidden = true;
    playButton.removeAttribute("title");
    playButton.setAttribute("aria-label", "Play video with sound");
  });
  videoElement.addEventListener("pause", (): void => {
    // A completed video stays on its final frame without another overlay.
    if (!videoElement.ended) {
      showPlayButton();
    }
  });
  videoElement.addEventListener("error", (): void => {
    handlePlaybackError(videoElement.error);
  });

  /** Always prepare the stream through Shaka, regardless of native HLS support. */
  const loadShakaStream: () => Promise<void> = async (): Promise<void> => {
    if (shakaPlayer === null) {
      const shakaModule: { default: typeof shaka } =
        await import("shaka-player");
      const shakaLibrary: typeof shaka = shakaModule.default;
      shakaLibrary.polyfill.installAll();

      if (!shakaLibrary.Player.isBrowserSupported()) {
        throw new Error("This browser does not support the video stream.");
      }

      shakaPlayer = new shakaLibrary.Player();
      shakaPlayer.addEventListener("error", (event: Event): void => {
        const playbackError: shaka.util.Error = (
          event as CustomEvent<shaka.util.Error>
        ).detail;

        // Let Shaka retry recoverable network errors without stopping playback.
        if (
          playbackError.severity === shakaLibrary.util.Error.Severity.CRITICAL
        ) {
          handlePlaybackError(playbackError);
        }
      });
    }

    await shakaPlayer.attach(videoElement);
    await shakaPlayer.load(streamUrl);
  };

  // Prepare the hidden video before enabling play. The eventual click can then
  // call play() directly, preserving the user gesture required for Safari audio.
  playButton.disabled = true;
  void loadShakaStream()
    .then((): void => {
      streamLoaded = true;
    })
    .catch(handlePlaybackError)
    .finally((): void => {
      playButton.disabled = false;
    });

  playButton.addEventListener("click", (): void => {
    /** Prevent duplicate loads while the stream is being prepared. */
    const startPlayback: () => Promise<void> = async (): Promise<void> => {
      playButton.disabled = true;

      try {
        if (!streamLoaded) {
          await loadShakaStream();
          streamLoaded = true;
        }

        // Every explicit start includes sound, regardless of old mute settings.
        videoElement.muted = false;
        videoElement.volume = 1;
        await videoElement.play();
      } catch (error: unknown) {
        handlePlaybackError(error);
      } finally {
        playButton.disabled = false;
      }
    };

    void startPlayback();
  });
}
