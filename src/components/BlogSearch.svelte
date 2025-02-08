<script lang="ts">
    import Chip from "./Chip.svelte";
    import fuzzysort from "fuzzysort";
    import BlogCard from "./BlogCard.svelte";

    let {
        newsFilter = true,
        writeupsFilter = true,
        blogs = [],
    }: Props = $props();

    interface Props {
        newsFilter: boolean;
        writeupsFilter: boolean;
        blogs: Blog[];
    }

    let query: string = $state("");

    interface Blog {
        title: string;
        description: string;
        author: string;
        date: Date;
        url: string;
        thumbnail?: string;
        thumbnailAlt?: string;
        tag: "news" | "writeups";
        style?: string;
    }

    let filteredBlogs: Blog[] = $derived.by(() => {
        let filtered = blogs.filter(
            (blog) =>
                (blog.tag == "news" && newsFilter) ||
                (blog.tag == "writeups" && writeupsFilter),
        );

        if (query == "") return filtered;

        const results = fuzzysort.go(query, filtered, {
            keys: ["title", "description", "author"],
        });

        return results
            .toSorted((a: any, b: any) => a.score - b.score)
            .map((r: any) => r.obj);
    });
</script>

<div class="blogs-search">
    <div class="search-menu">
        <div class="input">
            <!-- svg search icon -->
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

            <input bind:value={query} type="search" placeholder="Search" />
        </div>
        <div class="chips">
            <Chip bind:activated={newsFilter}>News</Chip>
            <Chip bind:activated={writeupsFilter}>Writeups</Chip>
        </div>
    </div>
    <div class="blogs-list">
        {#each filteredBlogs as blog, i}
            <BlogCard style="animation-delay: {i * 0.1 + 0.3}s" {...blog} />
        {/each}
    </div>
</div>

<style>
    .search-menu {
        animation: slide-up-regular 500ms backwards 200ms;
        z-index: 100;
        display: flex;
        gap: 12px;
        width: 100%;
        position: sticky;
        top: 8px;
        padding: 12px;
        border-radius: 8px;
        background-color: var(--background-primary);
        box-shadow: 2.8px 2.8px 2.2px rgba(0, 0, 0, 0.02),
			6.7px 6.7px 5.3px rgba(0, 0, 0, 0.028),
			12.5px 12.5px 10px rgba(0, 0, 0, 0.035),
			22.3px 22.3px 17.9px rgba(0, 0, 0, 0.042),
			41.8px 41.8px 33.4px rgba(0, 0, 0, 0.05),
			100px 100px 80px rgba(0, 0, 0, 0.07);
        border: 1px solid var(--background-secondary);
    }

    @media screen and (max-width: 768px) {
		.search-menu {
            top: 56px;
		}
	}
    
    .input {
        position: relative;
        display: flex;
        justify-content: start;
        align-items: center;
        width: 100%;
    }
    .input input {
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
    .input input::placeholder {
        color: var(--foreground-secondary);
    }
    .input svg {
        pointer-events: none;
        fill: var(--foreground-secondary);
        position: absolute;
        left: 8px;
    }
    .chips {
        display: flex;
        flex-direction: row;
        gap: 12px;
    }

    .blogs-list {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 24px;
    }

    .blogs-list :global(.blog-card) {
        animation: slide-up-blog 500ms backwards;
    }

    .blogs-search {
        display: flex;
        flex-direction: column;
        gap: 30px;
        width: 100%;
    }
</style>
