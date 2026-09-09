/*
 * Copyright (C) 2026 Garrett Brown
 * This file is part of cinematic.earth - https://github.com/CinematicEarth/cinematic.earth
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * See the file LICENSE.txt for more information.
 */

import type shaka from "shaka-player";

/** iPhone Safari exposes video fullscreen through its own presentation API. */
type FullscreenVideoElement = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
};

/** Connect the single play button to video playback and fullscreen. */
export function launchApp(): void {
  const videoElement: FullscreenVideoElement | null =
    document.querySelector<FullscreenVideoElement>("#background-video");
  const playButton: HTMLButtonElement | null =
    document.querySelector<HTMLButtonElement>("#play-button");

  if (videoElement === null || playButton === null) {
    throw new Error("The video or play button is missing from the page.");
  }

  const streamUrl: string =
    "https://stream.mux.com/dDkIbyl402OA1QkR3CgEMVUQltsjzF1ulB4579ff7sB8.m3u8";
  let shakaPlayer: shaka.Player | null = null;
  let streamLoaded: boolean = false;

  /** Return to the black screen after the video ends or playback fails. */
  const showPlayButton: () => void = (): void => {
    // Tear down the native UI while idle so the next Play initializes it against
    // the visible video, rather than reusing controls created while hidden.
    videoElement.controls = false;
    videoElement.style.visibility = "hidden";
    playButton.hidden = false;

    // The play/retry button lives outside the fullscreen video. Return to the
    // page when finished or after an error so the button remains reachable.
    if (document.fullscreenElement === videoElement) {
      void document.exitFullscreen().catch((error: unknown): void => {
        console.warn("Could not leave fullscreen", error);
      });
    } else if (
      videoElement.webkitDisplayingFullscreen &&
      typeof videoElement.webkitExitFullscreen === "function"
    ) {
      // iPhone video fullscreen is separate from the standard Fullscreen API.
      try {
        videoElement.webkitExitFullscreen();
      } catch (error: unknown) {
        console.warn("Could not leave fullscreen", error);
      }
    }
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

  // Clear retry messaging once playback succeeds. Native controls stay
  // available when the user pauses or seeks through the video.
  videoElement.addEventListener("playing", (): void => {
    playButton.removeAttribute("title");
    playButton.setAttribute("aria-label", "Play video with sound");
  });
  // Native controls handle pause and seeking without hiding the video.
  videoElement.addEventListener("ended", (): void => {
    showPlayButton();
    // Keep Shaka's prepared stream so the next click can replay immediately.
    videoElement.currentTime = 0;
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
    // Firefox builds its native controls when the controls property is enabled.
    // Reveal the video first so those controls initialize in the visible layout,
    // before either inline playback or the transition into video fullscreen.
    videoElement.style.visibility = "visible";
    videoElement.controls = true;
    playButton.hidden = true;

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
        // Native Pause can cancel play() while frames are still buffering. That
        // cancellation is normal: keep the visible video and controls so the
        // user can resume, instead of returning to the initial black screen.
        if (
          error instanceof DOMException &&
          error.name === "AbortError" &&
          videoElement.paused &&
          videoElement.error === null
        ) {
          return;
        }
        handlePlaybackError(error);
      } finally {
        playButton.disabled = false;
      }
    };

    // Start audio first, then request fullscreen in this same click handler.
    // Awaiting playback here would lose the gesture needed for fullscreen.
    void startPlayback();

    // Fullscreen the video itself so the browser provides its built-in video UI
    // and Firefox recognizes fullscreen media.
    // If the browser denies fullscreen, allow Shaka playback to continue inline.
    try {
      if (!document.fullscreenElement) {
        if (
          document.fullscreenEnabled &&
          typeof videoElement.requestFullscreen === "function"
        ) {
          void videoElement
            .requestFullscreen({ navigationUI: "hide" })
            .catch((error: unknown): void => {
              console.warn("Could not enter fullscreen", error);
            });
        } else if (typeof videoElement.webkitEnterFullscreen === "function") {
          // This changes presentation only; Shaka still owns the video stream.
          videoElement.webkitEnterFullscreen();
        }
      }
    } catch (error: unknown) {
      console.warn("Could not enter fullscreen", error);
    }
  });
}
