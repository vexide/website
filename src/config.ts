export const CRATE_NAME = `vexide`;

export const GITHUB_ORG_URL = `https://github.com/vexide`;
export const GITHUB_REPO_URL = `${GITHUB_ORG_URL}/vexide`;

export const DISCORD_INVITE_CODE = `y9mcGuQRYz`;
export const DISCORD_INVITE_URL = `https://discord.gg/y9mcGuQRYz`;

export interface Example {
	name: string;
	code: string;
}

export const EXAMPLES: Example[] = [
	{
		name: "Basic",
		code: `#[vexide::main]
async fn main(peripherals: Peripherals) {
	// Create a green motor on port 1.
	let my_motor = Motor::new(
		peripherals.port_1,
		Gearset::Green,
		Direction::Forward,
	);

	// Spin the motor at 10 volts!
	my_motor.set_voltage(10.0).ok();
}`,
	},
];
