<script lang="ts">
    import { onMount } from "svelte";
    import Button from "./Button.svelte";
    import Chip from "./Chip.svelte";
    import fuzzysort from "fuzzysort";
	import BlogCard from "./BlogCard.svelte";

    export let blogsFilter: boolean = true;
    export let releasesFilter: boolean = true;

    let query: string = "";

    interface Blog {
        title: string;
        description: string;
        author: string;
        date: Date;
        url: string;
        thumbnail: string;
        thumbnailAlt: string;
        tag: "blog" | "release";
        style?: string;
    }

    export let blogs: Blog[] = [];

    onMount(() => {
        blogs.map((blog, n) => {
            setTimeout(() => {
                blog.style = "";
            }, n * 0.1 + 0.3);
        });
    });

    let filteredBlogs: Blog[] = blogs;

    $: {
        filteredBlogs = blogs.filter(
            (blog) =>
                (blog.tag == "blog" && blogsFilter) ||
                (blog.tag == "release" && releasesFilter)
        );
        if (query != "") {
            const results = fuzzysort.go(query, filteredBlogs, {
                keys: ["title", "description", "author"],
            });
            console.log(results);
            filteredBlogs = results
                .toSorted((a: any, b: any) => a.score - b.score)
                .map((r: any) => r.obj);
        }
    }
</script>

<div class="blogs-search">
    <div class="search-menu">
        <div class="input">
            <!-- svg search icon -->
            <svg width="1em" height="1em" viewBox="0 0 24 24"
                ><path
                    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14"
                /></svg
            >
            <input bind:value={query} type="text" placeholder="Search" />
        </div>
        <div class="chips">
            <Chip bind:activated={blogsFilter} text="Blogs" />
            <Chip bind:activated={releasesFilter} text="Releases" />
        </div>
    </div>
    <div class="blogs-list">
        {#each filteredBlogs as blog}
            <BlogCard {...blog} />
        {/each}
    </div>
</div>

<style>
    .search-menu {
        animation: slide-up-regular 500ms backwards 200ms;

        z-index: 100;
        display: flex;
        flex-direction: row;
        gap: 12px;
        padding: 12px;
        border-radius: 5px;
        background-color: var(--background-secondary);
        width: 100%;
        position: sticky;
        top: 30px;
        box-shadow: 0px 2px 5.5px rgba(0, 0, 0, 0.072),
            0px 6.1px 11px rgba(0, 0, 0, 0.103),
            0px 13.2px 16.4px rgba(0, 0, 0, 0.119),
            0px 24.7px 22.4px rgba(0, 0, 0, 0.127),
            0px 43.4px 30.1px rgba(0, 0, 0, 0.133),
            0px 77.6px 43.7px rgba(0, 0, 0, 0.142),
            0px 135px 88px rgba(0, 0, 0, 0.18),
            0px 0px 5.6px rgba(0, 0, 0, 0.014),
            0px 0px 18.7px rgba(0, 0, 0, 0.035),
            0px 0px 35.2px rgba(0, 0, 0, 0.058),
            0px 0px 42px rgba(0, 0, 0, 0.08);
    }
    .input {
        display: flex;
        justify-content: start;
        align-items: center;
        background-color: var(--background-primary);
        border-radius: 5px;
        padding: 2px;
        width: 100%;
    }
    .input:focus-within {
        outline: 2px solid var(--foreground-secondary);
    }
    .input input {
        border: none;
        background-color: inherit;
        color: var(--foreground-primary);
        font-family: var(--font-primary);
        font-weight: 500;
        width: 100%;
    }
    .input input::placeholder {
        color: var(--foreground-secondary);
        opacity: 1;
    }
    .input input:focus {
        outline: none;
    }
    .input svg {
        width: 20px;
        height: 20px;
        fill: var(--foreground-primary);
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

    .blogs-search {
        display: flex;
        flex-direction: column;
        gap: 30px;
        width: 100%;
    }
</style>
