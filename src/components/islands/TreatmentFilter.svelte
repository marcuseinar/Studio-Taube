<script lang="ts">
  /**
   * Filters the server-rendered treatment list.
   *
   * The list itself is rendered by Astro and is complete without JavaScript —
   * this island only hides what does not match, so the page stays indexable
   * and usable if the script never loads. It is therefore mounted with
   * client:idle rather than client:load.
   */
  interface Category {
    slug: string;
    label: string;
  }

  interface Props {
    categories: Category[];
    labels: {
      search: string;
      searchPlaceholder: string;
      all: string;
      /** Contains a {count} placeholder — props to an island must serialise. */
      resultCountOne: string;
      resultCountMany: string;
      noResults: string;
      clear: string;
    };
  }

  const { categories, labels }: Props = $props();

  let query = $state('');
  let activeCategory = $state<string | null>(null);
  let matchCount = $state(0);

  const normalise = (value: string) => value.trim().toLowerCase();

  function matches(card: HTMLElement, term: string, category: string | null): boolean {
    if (category !== null && card.dataset.category !== category) return false;
    if (term === '') return true;
    return (card.dataset.search ?? '').includes(term);
  }

  $effect(() => {
    const term = normalise(query);
    const category = activeCategory;

    let visible = 0;
    for (const card of document.querySelectorAll<HTMLElement>('[data-treatment]')) {
      const shown = matches(card, term, category);
      card.hidden = !shown;
      if (shown) visible += 1;
    }

    // A category heading with nothing under it is noise, so it goes too.
    for (const section of document.querySelectorAll<HTMLElement>('[data-treatment-section]')) {
      const hasVisible = section.querySelector('[data-treatment]:not([hidden])') !== null;
      section.hidden = !hasVisible;
    }

    matchCount = visible;
  });

  function reset() {
    query = '';
    activeCategory = null;
  }

  const isFiltered = $derived(query.trim() !== '' || activeCategory !== null);

  const resultSummary = $derived(
    matchCount === 0
      ? labels.noResults
      : (matchCount === 1 ? labels.resultCountOne : labels.resultCountMany).replace('{count}', String(matchCount)),
  );
</script>

<div class="border-sand/40 border-y py-6">
  <label class="block">
    <span class="wordmark-label text-ink-muted text-[0.65rem]">{labels.search}</span>
    <input
      type="search"
      bind:value={query}
      placeholder={labels.searchPlaceholder}
      class="border-sand-deep/50 bg-cream text-ink placeholder:text-ink-muted/70 focus:border-sand-ink mt-2 w-full max-w-md rounded-pill border px-5 py-3 text-base"
    />
  </label>

  <ul class="mt-5 flex flex-wrap gap-2">
    <li>
      <button
        type="button"
        aria-pressed={activeCategory === null}
        onclick={() => (activeCategory = null)}
        class="wordmark-label min-h-11 rounded-pill border px-4 text-[0.65rem] transition-colors
          {activeCategory === null
          ? 'border-sand-ink bg-sand-ink text-cream'
          : 'border-sand-deep/50 text-ink-muted hover:border-sand-ink hover:text-sand-ink'}"
      >
        {labels.all}
      </button>
    </li>
    {#each categories as category (category.slug)}
      <li>
        <button
          type="button"
          aria-pressed={activeCategory === category.slug}
          onclick={() => (activeCategory = category.slug)}
          class="wordmark-label min-h-11 rounded-pill border px-4 text-[0.65rem] transition-colors
            {activeCategory === category.slug
            ? 'border-sand-ink bg-sand-ink text-cream'
            : 'border-sand-deep/50 text-ink-muted hover:border-sand-ink hover:text-sand-ink'}"
        >
          {category.label}
        </button>
      </li>
    {/each}
  </ul>

  <p class="text-ink-muted mt-4 text-sm" aria-live="polite">
    {resultSummary}
    {#if isFiltered}
      <button type="button" onclick={reset} class="text-sand-ink hover:text-ink ml-3 underline underline-offset-4">
        {labels.clear}
      </button>
    {/if}
  </p>
</div>
