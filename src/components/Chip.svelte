<script lang="ts">
    let {
        text = "",
        disabled = false,
        activated = $bindable(false),
        chip = $bindable(undefined),
        ...rest
    } = $props();

    function handleClick(event: MouseEvent) {
        activated = !activated;
    }
</script>

<button
    type="button"
    bind:this={chip}
    onclick={handleClick}
    class={{
        chip: true,
        "chip-disabled": disabled,
        "chip-activated": activated,
    }}
    {...rest}
>
    {text}
</button>

<style>
    .chip {
        user-select: none;
        text-decoration: none;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        text-align: center;
        font-family: inherit;
        background-color: transparent;
        text-transform: uppercase;
        border-radius: 2px;
        color: var(--foreground-primary);
        font-family: var(--font-monospace);
        font-size: 1.4rem;
        font-weight: 400;
        padding-inline: 16px;
        padding-block: 6px;
        gap: 8px;
        cursor: pointer;
        border: none;
        border: 1px solid var(--foreground-tertiary);
    }

    .chip.chip-disabled {
        pointer-events: none;
        opacity: 0.5;
    }

    .chip.chip-activated {
        border: 1px solid var(--background-accent-yellow);
        color: var(--foreground-accent-yellow);
    }
</style>
