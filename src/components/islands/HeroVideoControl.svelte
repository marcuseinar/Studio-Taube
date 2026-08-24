<script lang="ts">
  /**
   * Starts and controls the hero loop.
   *
   * The video carries no `autoplay` attribute. Playback begins here instead,
   * which is what lets the loop respect `prefers-reduced-motion` — an
   * attribute cannot be conditional, and no amount of CSS stops a video. With
   * scripting unavailable the poster simply stays, which is a good outcome:
   * the poster is what the page is measured on anyway.
   *
   * The button is not a nicety. WCAG 2.2 SC 2.2.2 requires a way to pause
   * motion that starts on its own and runs for more than five seconds, and
   * this loop runs forever.
   */
  interface Props {
    videoId: string;
    labels: { play: string; pause: string };
  }

  const { videoId, labels }: Props = $props();

  let playing = $state(false);
  let ready = $state(false);
  let playable = $state(true);

  const prefersReducedMotion = () =>
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const video = () => document.getElementById(videoId) as HTMLVideoElement | null;

  $effect(() => {
    const element = video();
    if (!element) return;

    ready = true;
    if (prefersReducedMotion()) return;

    element.play().then(
      () => (playing = true),
      (error: DOMException) => {
        playing = false;
        // A blocked autoplay leaves a usable video, so keep the button and let
        // the visitor start it. A source the browser cannot decode does not,
        // so drop the button rather than offer a control that does nothing.
        playable = error.name !== 'NotSupportedError';
      },
    );
  });

  function toggle() {
    const element = video();
    if (!element) return;

    if (element.paused) {
      element.play().then(
        () => (playing = true),
        () => (playing = false),
      );
    } else {
      element.pause();
      playing = false;
    }
  }
</script>

{#if ready && playable}
  <button
    type="button"
    onclick={toggle}
    aria-pressed={playing}
    class="text-ink/80 hover:text-ink focus-visible:text-ink absolute right-3 bottom-3 inline-flex h-11 w-11 items-center justify-center rounded-pill bg-cream/85 backdrop-blur transition-colors"
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
