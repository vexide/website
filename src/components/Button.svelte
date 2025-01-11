<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: "default" | "accent" | "outlined",
		element?: HTMLElement | undefined,
		href?: string,
		disabled?: boolean,
	}

	let {
		variant = "default",
		href = "",
		disabled = false,
		class: _class = "",
		element = $bindable(undefined),
		children,
		...rest
	}: Props = $props();
</script>

<svelte:element
	bind:this={element}
	this={href && !disabled ? "a" : "button"}
	role={href && !disabled ? "button" : undefined}
	href={href && !disabled ? href : undefined}
	class={["button", `variant-${variant}`, _class]}
	class:disabled
	{...rest}
>
	{@render children?.()}
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
		border-radius: 2px;
		font-family: var(--font-monospace);
		font-size: 1.6rem;
		font-weight: 400;
		padding-inline: 24px;
		padding-block: 12px;
		gap: 8px;
		cursor: pointer;
		border: none;
		outline: none;
		transition: 0.15s ease;
	}

	.button.variant-default {
		background-color: var(--background-secondary);
		color: var(--foreground-primary);
	}

	.button.variant-outlined {
		background-color: transparent;
		border: 1px solid var(--foreground-tertiary);
		color: var(--foreground-primary);
	}

	.button.variant-accent {
		background-color: var(--background-accent-yellow);
		color: var(--background-primary);
	}

	.button.variant-accent:active {
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