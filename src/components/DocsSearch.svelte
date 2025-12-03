<script lang="ts">
    import type { SearchResult } from "pages/docs/search.json";
    import { uid, excerpt, debounce } from "utils";

    let query = $state("");
    let inputElement: HTMLInputElement | undefined = $state(undefined);
    let resultsElement: HTMLDivElement | undefined = $state(undefined);
    let selectedIndex = $state(0);
    let open = $state(false);

    const instanceId = uid();

    async function search(query: string) {
        const response = await fetch(`/docs/search.json/?q=${query}`);

        return await response.json();
    }

    function handleWindowKeydown(event: KeyboardEvent) {
        if ((event.ctrlKey || event.metaKey) && event.key == "k") {
            event.preventDefault();
            inputElement?.focus();
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (!flattenedResults) return;

        if (event.key == "ArrowUp") {
            selectedIndex =
                selectedIndex == 0
                    ? flattenedResults.length - 1
                    : selectedIndex - 1;
        } else if (event.key == "ArrowDown") {
            selectedIndex =
                selectedIndex == flattenedResults.length - 1
                    ? 0
                    : selectedIndex + 1;
        } else if (event.key == "Home") {
            selectedIndex = 0;
        } else if (event.key == "End") {
            selectedIndex =
                flattenedResults.length > 0 ? flattenedResults.length - 1 : 0;
        } else if (event.key == "Enter") {
            event.preventDefault();
            if (flattenedResults.length > 0) {
                window.location.href =
                    flattenedResults[selectedIndex].slug == "index"
                        ? "/docs/"
                        : `/docs/${flattenedResults[selectedIndex].slug}/`;
            }
        } else if (event.key == "Escape") {
            event.preventDefault();
            open = false;
        }
    }

    function handleInput(event: { target: HTMLInputElement }) {
        if (!open) {
            open = true;
        }

        query = event.target.value;
    }

    let results: { [key: string]: SearchResult[] } = $state({});
    let flattenedResults: SearchResult[] | undefined = $derived(
        results ? Object.values(results).flat() : undefined,
    );

    $effect(() => {
        if (open || query != "") {
            search(query).then((val) => {
                results = val;
                selectedIndex = 0;
            });
        }
    });

    $effect(() => {
        if (!resultsElement) return;

        resultsElement
            .querySelectorAll("ul li a")
            [selectedIndex]?.scrollIntoView({
                block: "nearest",
            });
    });
</script>

<form
    class="docs-search"
    method="GET"
    action="/docs/search/"
    onsubmit={(event) => event.preventDefault()}
>
    <svg
        class="search-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        width="16"
        height="16"
        ><path
            d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"
        ></path></svg
    >

    <input
        name="q"
        type="search"
        role="combobox"
        aria-keyshortcuts="Control+K"
        autocomplete="off"
        aria-controls="search-results-{instanceId}"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-activedescendant={open
            ? `search-result-${instanceId}-${selectedIndex}`
            : ""}
        bind:this={inputElement}
        onkeydown={handleKeyDown}
        oninput={debounce(handleInput)}
        onblur={() => {
            open = false;
        }}
        onclick={() => {
            open = !open;
        }}
        placeholder="Search"
        class="search-input"
    />

    {#if typeof window != "undefined"}
        <div class="search-keyboard-hint" aria-hidden="true">
            <kbd>Ctrl</kbd>
            +
            <kbd>K</kbd>
        </div>
    {/if}

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="search-results"
        class:open
        id="search-results-{instanceId}"
        aria-hidden={!open}
        role="listbox"
        aria-label="Search results"
        bind:this={resultsElement}
        onmousedown={(e) => e.preventDefault()}
    >
        {#if results && Object.keys(results).length > 0}
            <div class="search-results-scroller">
                {#each Object.keys(results) as category, i}
                    {@const categoryId = `search-results-${instanceId}-category-${i}`}

                    <strong class="category-title" id={categoryId}
                        >{category}</strong
                    >

                    <ul class="category" role="group" aria-labelledby={categoryId}>
                        {#each results[category] as result}
                            {@const isSelected =
                                result.slug ==
                                flattenedResults?.[selectedIndex].slug}

                            <li
                                role="option"
                                id="search-result-{instanceId}-{flattenedResults?.indexOf(
                                    result,
                                )}"
                                aria-selected={isSelected}
                            >
                                <a
                                    tabindex="-1"
                                    class:selected={isSelected}
                                    href={result.slug == "index"
                                        ? "/docs/"
                                        : `/docs/${result.slug}/`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 16 16"
                                        width="16"
                                        height="16"
                                        ><path
                                            d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z"
                                        ></path></svg
                                    >
                                    <strong
                                        >{@html excerpt(result.title, query) ??
                                            result.title}</strong
                                    >
                                    {#if result.excerpt}
                                        <p class="excerpt">
                                            {@html result.excerpt}
                                        </p>
                                    {/if}
                                </a>
                            </li>
                        {/each}
                    </ul>
                {/each}
            </div>
        {:else}
            <div class="no-results">
                <img
                    src="/docs/no-results.svg"
                    alt="Ferris the crab holding a magnifying glass."
                    width="137"
                    height="122"
                />
                No results.
            </div>
        {/if}
    </div>
</form>

<svelte:window
    onkeydown={handleWindowKeydown}
    onmousedown={(event) => {
        let target = event.target as HTMLElement;

        if (!inputElement || !resultsElement) return;

        if (
            !resultsElement.contains(target) &&
            !inputElement.contains(target)
        ) {
            open = false;
        }
    }}
/>

<style>
    .docs-search {
        margin-inline-start: auto;
        display: flex;
        align-items: center;
        position: relative;
    }

    .search-icon {
        pointer-events: none;
        fill: var(--foreground-secondary);
        position: absolute;
        left: 8px;
    }

    .docs-search input {
        font: inherit;
        inline-size: 100%;
        border-radius: 4px;
        padding: 6px 8px;
        padding-inline-start: 32px;
        border-radius: 4px;
        background-color: transparent;
        border: 1px solid var(--foreground-tertiary);
        font-size: 14px;
        font-weight: 500;
        color: var(--foreground-primary);
    }

    @media screen and (max-width: 480px) {
        .docs-search input {
            font-size: 16px;
        }

        .docs-search:not(:focus-within) {
            justify-content: center;
        }

        .docs-search:focus-within {
            position: absolute;
            margin-inline: 16px;
            left: 0;
            width: calc(100% - 84px);
            background: var(--background-secondary);
        }

        .search-keyboard-hint {
            display: none;
        }

        .docs-search:not(:focus-within) .search-icon {
            left: unset;
        }

        .docs-search input:not(:focus) {
            width: 36px;
            height: 32px;
            padding: 6px 8px;
        }

        .docs-search input:not(:focus) {
            font-size: 0;
        }

        .docs-search .search-results {
            position: fixed;
            left: 8px;
            top: 42px;
            width: calc(100% - 16px);
        }

        .docs-search .search-results::after {
            right: 76px;
        }
    }

    .docs-search input::placeholder {
        color: var(--foreground-secondary);
    }

    .search-keyboard-hint {
        pointer-events: none;
        font-weight: 400;
        font-size: 10px;
        position: absolute;
        right: 8px;
    }

    .search-keyboard-hint kbd {
        font-family: var(--font-monospace);
        background: var(--grid-color);
        padding: 1px 4px;
        border-radius: 2px;
        color: var(--foreground-secondary);
    }

    .docs-search input:not(:placeholder-shown) + .search-keyboard-hint,
    .docs-search input:focus + .search-keyboard-hint {
        display: none;
    }

    .search-results {
        z-index: 100;
        transition:
            150ms ease opacity,
            150ms ease transform;
        position: absolute;
        top: 100%;
        margin-top: 12px;
        width: 400px;
        right: 0;
        background: var(--background-primary);
        border: 1px solid var(--background-secondary);
        border-radius: 8px;
        box-shadow:
            0px 1.2px 2.2px rgba(0, 0, 0, 0.034),
            0px 2.8px 5.3px rgba(0, 0, 0, 0.048),
            0px 5.3px 10px rgba(0, 0, 0, 0.06),
            0px 9.4px 17.9px rgba(0, 0, 0, 0.072),
            0px 17.5px 33.4px rgba(0, 0, 0, 0.086),
            0px 42px 80px rgba(0, 0, 0, 0.12);
    }

    .no-results {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        min-height: 240px;
        font-size: 16px;
        font-weight: 600;
    }

    .search-results-scroller {
        max-height: 65vh;
        border-radius: 7px;
        min-height: 0;
        overflow: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--foreground-tertiary) #282a34;
    }

    .search-results-scroller ul {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px;
        margin: 0;
        margin-block-end: 16px;
        list-style: none;
    }

    .search-results-scroller ul:last-child {
        margin-block-end: 0;
    }

    .category-title {
        position: sticky;
        top: 0;
        background: var(--background-primary);
        z-index: 1;
        font-weight: 600;
        display: block;
        font-size: 12px;
        border-bottom: 1px solid var(--background-secondary);
        text-transform: uppercase;
        padding: 8px 16px;
        color: var(--foreground-tertiary);
    }

    .search-results li a {
        display: grid;
        grid-template-areas:
            "icon title"
            "icon excerpt";
        grid-template-columns: fit-content(100%) auto;
        grid-template-columns: 36px auto;
        color: var(--foreground-secondary);
        padding: 8px;
        border-radius: 4px;
        text-decoration: none;
        scroll-margin-bottom: 8px;
        scroll-margin-top: 42px;
    }

    .search-results li a:hover,
    .search-results li a.selected {
        background: var(--background-secondary);
    }

    .search-results li svg {
        margin-block-start: 4px;
        margin-inline: auto;
        grid-area: icon;
        fill: var(--foreground-primary);
        right: 4px;
        position: relative;
    }

    .search-results li strong {
        grid-area: title;
        font-size: 16px;
        font-weight: 600;
        color: var(--foreground-primary);
    }

    .search-results li p {
        grid-area: excerpt;
        margin: 0;
        margin-block-start: 8px;
    }

    .search-results li :global(mark) {
        color: inherit;
        background-color: hsl(var(--accent-yellow-hue), 73%, 63%, 0.25);
    }

    .search-results::after {
        content: "";
        position: absolute;
        right: 16px;
        top: -8px;
        transform: rotate(45deg);
        width: 16px;
        height: 16px;
        background: inherit;
        border: inherit;
        clip-path: polygon(100% 0, 0% 100%, 0 0);
    }

    .docs-search .search-results:not(.open) {
        opacity: 0;
        transform: translateY(-4px);
        pointer-events: none;
    }
</style>
