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
        border-radius: 2px;
        color: var(--foreground-primary);
        font-family: var(--font-monospace);
        font-size: 1.4rem;
        font-weight: 400;
        padding-inline: 5px;
        padding-block: 5px;
        gap: 8px;
        cursor: pointer;
        border: none;
        outline: none;
    }

    .chip.chip-disabled {
        pointer-events: none;
        opacity: 0.5;
    }

    .chip.chip-activated {
        background-color: var(--background-accent-yellow);
        color: var(--background-primary);
    }
</style>
