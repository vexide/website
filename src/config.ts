export const CRATE_NAME = `vexide`;

export const GITHUB_ORG_URL = `https://github.com/vexide`;
export const GITHUB_REPO_URL = `${GITHUB_ORG_URL}/vexide`;

export const DISCORD_INVITE_CODE = `d4uazRf2Nh`;
export const DISCORD_INVITE_URL = `https://discord.gg/d4uazRf2Nh`;

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
	let mut my_motor = Motor::new(
		peripherals.port_1,
		Gearset::Green,
		Direction::Forward,
	);

	// Spin the motor at 10 volts!
	_ = my_motor.set_voltage(10.0);
}`,
	},
];

export const DOCS_SIDEBAR = {
	"01. Getting Started": [
		"index",
		"prerequisites",
		"program-structure",
		"building-uploading",
		"using-the-terminal",
		"competition",
	],
	"02. Devices": [
		"peripherals",
		"motor",
		"controller",
		"inertial-sensor",
		"rotation-sensor",
		"distance-sensor",
		"optical-sensor",
	],
	"03. Multitasking": [
		"async-introduction",
	],
	"04. Specific Topics": [
		"features",
		"abort",
	]
};