<script lang="ts">
  /**
   * Pause and play for the hero loop.
   *
   * Playback itself is the browser's job — the video carries `autoplay`, and a
   * reduced-motion visitor has already had it cancelled by the inline guard in
   * HeroMedia.astro before this ever runs. This island only owns the control,
   * and it reads the element's real state rather than assuming its own.
   *
   * The button is required, not decorative: WCAG 2.2 SC 2.2.2 asks for a way
   * to stop motion that starts on its own and runs past five seconds, and this
   * loop runs indefinitely.
   */
  interface Props {
    videoId: string;
    labels: { play: string; pause: string };
  }

  const { videoId, labels }: Props = $props();

  let playing = $state(false);
  let ready = $state(false);
  let playable = $state(true);

  $effect(() => {
    const video = document.getElementById(videoId) as HTMLVideoElement | null;
    if (!video) return;

    const sync = () => (playing = !video.paused);
    // A source the browser cannot decode leaves a control that would do
    // nothing, so the button is withdrawn rather than left to disappoint.
    const fail = () => (playable = false);

    sync();
    ready = true;

    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    video.addEventListener('error', fail);

    return () => {
      video.removeEventListener('play', sync);
      video.removeEventListener('pause', sync);
      video.removeEventListener('error', fail);
    };
  });

  function toggle() {
    const video = document.getElementById(videoId) as HTMLVideoElement | null;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => (playing = false));
    } else {
      video.pause();
    }
  }
</script>

{#if ready && playable}
  <button
    type="button"
    onclick={toggle}
    aria-pressed={playing}
    class="text-ink/80 hover:text-ink focus-visible:text-ink bg-cream/85 rounded-pill absolute right-3 bottom-3 inline-flex h-11 w-11 items-center justify-center backdrop-blur transition-colors"
  >
    <span class="sr-only">{playing ? labels.pause : labels.play}</span>
    <svg viewBox="0 0 16 16" class="h-4 w-4" aria-hidden="true" fill="currentColor">
      {#if playing}
        <rect x="4" y="3" width="3" height="10" rx="1" />
        <rect x="9" y="3" width="3" height="10" rx="1" />
      {:else}
        <path d="M5 3.5v9l8-4.5-8-4.5Z" />
      {/if}
    </svg>
  </button>
{/if}
