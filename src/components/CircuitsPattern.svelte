<script lang="ts">
	let element: HTMLElement | null = null;

	let mouse = {
		x: 0,
		y: 0,
	};

	function handleMouseMove({ target, clientX, clientY }: MouseEvent) {
		let rect = element?.getBoundingClientRect();

		if (rect && clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
			mouse = {
				x: clientX - rect.left,
				y: clientY - rect.top
			};
		}
	}
</script>

<svelte:window on:mousemove={handleMouseMove} />

<div class="circuits-mask" bind:this={element} role="presentation">
	<div class="circuits-pattern" style:--mouse-x="{mouse.x}px" style:--mouse-y="{mouse.y}px"></div>
</div>

<style>
	.circuits-mask {
		mask: linear-gradient(#000, transparent);
		overflow: hidden;
		contain: strict;
		position: absolute;
		inline-size: 100%;
		block-size: 100%;
		inset: 0;
		z-index: -1;
	}

	.circuits-pattern {
		position: relative;
		inline-size: 100%;
		block-size: 100%;
		background-image: linear-gradient(hsl(var(--base-hue), 12%, 30%), var(--background-secondary), transparent);
		mask: url("/images/pattern_circuits.svg");
		-webkit-mask: url("/images/pattern_circuits.svg");
	}

	.circuits-pattern::after {
		content: "";
		position: absolute;
		left: var(--mouse-x);
		top: var(--mouse-y);
		transform: translate(-50%, -50%);
		opacity: 0.25;
		background-image: radial-gradient(var(--foreground-secondary), transparent 50%);
		inline-size: 100vw;
		block-size: 100vw;
		border-radius: 50%;
	}

	@media (prefers-reduced-motion: reduce) {
		.circuits-pattern::after {
			content: none;
		}
	}
</style>