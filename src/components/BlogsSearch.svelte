<script lang="ts">
    import Button from "./Button.svelte";
    import Chip from "./Chip.svelte";

    export let blogsFilter: boolean = true;
    export let releasesFilter: boolean = true;

    let query: HTMLInputElement;

    interface Blog {
        title: string;
        description: string;
        author: string;
        date: Date;
        url: string;
        thumbnail: string;
        thumbnail_alt: string;
        tag: "blog" | "release";
        style?: string;
    }

    export let blogs: Blog[] = [];

    let filteredBlogs: Blog[] = blogs;

    $: {
        filteredBlogs = blogs.filter(
            (blog) =>
                (blog.tag == "blog" && blogsFilter) ||
                (blog.tag == "release" && releasesFilter)
        );
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
            <input bind:this={query} type="text" placeholder="Search" />
        </div>
        <div class="chips">
            <Chip bind:activated={blogsFilter} text="Blogs" />
            <Chip bind:activated={releasesFilter} text="Releases" />
        </div>
    </div>
    <div class="blogs-list">
        {#each filteredBlogs as blog}
            <div class="blog-card" style={blog.style}>
                <img
                    class="blog-card-thumbnail"
                    src={blog.thumbnail}
                    alt={blog.thumbnail_alt}
                />
                <a class="blog-card-title" href={blog.url}>
                    <span>{blog.title}</span>
                </a>
                <p class="blog-card-description">{blog.description}</p>
                <div class="blog-card-metadata">
                    <a
                        class="blog-card-author"
                        href={`https://github.com/${blog.author}`}
                        target="_blank"
                        rel="noreferrer noopeners"
                    >
                        <img
                            src={`https://github.com/${blog.author}.png`}
                            alt="Profile"
                        />
                        <span>
                            <strong>{blog.author}</strong> • {blog.date.toLocaleDateString()}
                        </span>
                    </a>
                    <Button
                        class="blog-card-button"
                        variant="accent"
                        href={blog.url}
                    >
                        Read More
                    </Button>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .blog-card {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        flex: 0 0 auto;
        padding: 24px;
        border-radius: 8px;
        background: var(--background-secondary);
        box-shadow: 2.8px 2.8px 2.2px rgba(0, 0, 0, 0.02),
            6.7px 6.7px 5.3px rgba(0, 0, 0, 0.028),
            12.5px 12.5px 10px rgba(0, 0, 0, 0.035),
            22.3px 22.3px 17.9px rgba(0, 0, 0, 0.042),
            41.8px 41.8px 33.4px rgba(0, 0, 0, 0.05),
            100px 100px 80px rgba(0, 0, 0, 0.07);
        animation: slide-up 500ms backwards 650ms;
        z-index: 1;
    }

    .blog-card-thumbnail {
        user-select: none;
        object-fit: cover;
        inset: 0;
        z-index: -1;
        position: absolute;
        inline-size: 100%;
        block-size: 100%;
        mask: radial-gradient(
            circle at top left,
            rgba(0, 0, 0, 0.025),
            rgba(0, 0, 0, 0.15)
        );
    }

    .blog-card-title {
        text-decoration: none;
        margin: 0;
        margin-block-end: 8px;
        font-weight: 400;
        font-size: 1.8rem;
        font-family: var(--font-monospace);
        color: var(--foreground-primary);
    }

    .blog-card-title span {
        border-bottom: 1px solid transparent;
    }

    .blog-card-title:hover span {
        border-color: currentColor;
    }

    .blog-card-description {
        margin: 0;
        color: var(--foreground-secondary);
        font-size: 1.4rem;
    }

    .blog-card-metadata {
        margin-block-start: 16px;
        display: flex;
        gap: 24px;
        justify-content: space-between;
        align-items: flex-end;
    }

    .blog-card-author {
        text-decoration: none;
        display: flex;
        align-items: center;
        font-size: 1.4rem;
        color: var(--foreground-secondary);
    }

    .blog-card-author strong {
        border-bottom: 1px solid transparent;
        font-weight: 600;
        color: var(--foreground-primary);
    }

    .blog-card-author:hover strong {
        border-color: currentColor;
    }

    .blog-card-author img {
        border-radius: 50%;
        margin-inline-end: 8px;
        inline-size: 24px;
        block-size: auto;
    }

    .blog-card-button {
        padding-block: 8px;
        white-space: nowrap;
    }

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
