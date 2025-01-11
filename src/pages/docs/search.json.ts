import FlexSearch, { type Id } from "flexsearch";

import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { categorize, excerpt } from "utils";

// Enable server mode for this route.
export const prerender = false;

export interface SearchResult {
    title: string,
    category: string,
    excerpt: string,
    slug: string,
}

const stripMarkdown = (markdown: string): string =>
    markdown
        .replace(/<[^>]+>/g, "") // HTML tags
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // images
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
        .replace(/^#{1,6}\s+/gm, "") // headers
        .replace(/^>\s+/gm, "") // blockquotes
        .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1") // bold/italic
        .replace(/`([^`]+)`/g, "$1") // inline code
        .replace(/^[-*_]{3,}\s*$/gm, "") // horizontal rules
        .replace(/^[\s]*[-*+]\s+/gm, "") // unordered list
        .replace(/^[\s]*\d+\.\s+/gm, ""); // ordered list

const pages: SearchResult[] = (await getCollection("docs")).map((page) => ({
    title: page.data.title,
    category: page.data.category,
    excerpt: page.body,
    slug: page.slug,
}));

const index = new FlexSearch.Document({
    tokenize: "forward",
    document: {
        id: "file",
        index: ["title", "excerpt"],
    },
});

for (let i = 0; i < pages.length; i++) {
    await index.addAsync(i, pages[i]);
}

export const GET: APIRoute = async ({ request }) => {
    const query = new URL(request.url).searchParams.get("q");

    // Need ?q= param
    if (query == null || query == undefined) {
        return new Response(null, {
            status: 400,
            statusText: "missing query parameter",
        });
    }

    if (query != "") {
        // If we have a query, search the index.
        const results = await index.searchAsync(query);
        const resultsSet: Set<Id> = new Set();

        // De-dupe IDs by adding all indexed IDs into a [`Set`].
        for (const { result: matches } of results) {
            for (const match of matches) {
                resultsSet.add(match);
            }
        }

        return new Response(JSON.stringify(
            categorize(
                Array.from(resultsSet).map(id => ({
                    ...pages[id as number],
                    // Create excerpt. pages[id].excerpt is intermediately set
                    // as the entire page body, but that'd be pretty large to
                    // send every page to the client in full every request.
                    excerpt: excerpt(stripMarkdown(pages[id as number].excerpt), query)
                })),
                (result: SearchResult) => result.category,
            )
        ));
    } else {
        // If query is empty, send a list of all pages with no excerpt.
        return new Response(JSON.stringify(
            categorize(
                pages.map(page => ({ ...page, excerpt: "" })),
                (result: SearchResult) => result.category,
            )
        ));
    }
}