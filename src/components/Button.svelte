<script lang="ts">
	export let variant: "default" | "accent-red" | "accent-yellow" = "default";
	export let href = "";
	export let disabled = false;

	let className = "";
	export { className as class };

	export let element: HTMLElement | null = null;
</script>

<svelte:element
	this={href && !disabled ? "a" : "button"}
	bind:this={element}
	role={href && !disabled ? "button" : undefined}
	href={href && !disabled ? href : undefined}
	class="button variant-{variant} {className}"
	class:disabled
	{...$$restProps}
>
	<slot />
</svelte:element>

<style>
	.button {
		user-select: none;
		text-decoration: none;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		text-align: center;
		font-family: inherit;
		border-radius: 0;
		font-family: var(--font-monospace);
		font-size: 1.6rem;
		font-weight: 400;
		padding-inline: 24px;
		padding-block: 12px;
		gap: 8px;
		cursor: pointer;
		border: none;
		outline: none;
		/* text-transform: uppercase; */
		transition: 0.15s ease;
	}

	.button.variant-default {
		background-color: var(--background-secondary);
		color: var(--foreground-primary);
	}

	.button.variant-accent-red {
		background-color: var(--background-accent-red);
		color: #fff;
	}

	.button.variant-accent-yellow {
		background-color: var(--background-accent-yellow);
		color: var(--background-primary);
	}

	.button.variant-accent-yellow:active,
	.button.variant-accent-red:active {
		background-color: #fff;
		color: var(--background-primary);
	}

	.button:focus {
		outline: 2px solid var(--foreground-secondary);
		outline-offset: 2px;
	}

	.button.disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>