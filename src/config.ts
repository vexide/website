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
export const TEST_CODE = `[1m[92m   Doc-tests[0m vexide_async

running 11 tests
test packages/vexide-async/src/task.rs - task (line 100) - compile ... [32mok[0m
test packages/vexide-async/src/task.rs - task (line 133) - compile ... [32mok[0m
test packages/vexide-async/src/task.rs - task (line 74) - compile ... [32mok[0m
test packages/vexide-async/src/time.rs - time::sleep (line 74) - compile ... [32mok[0m
test packages/vexide-async/src/time.rs - time::sleep_until (line 100) - compile ... [32mok[0m
test packages/vexide-async/src/local.rs - local::task_local (line 83) ... [32mok[0m
test packages/vexide-async/src/task.rs - task (line 51) ... [32mok[0m
test packages/vexide-async/src/task.rs - task (line 36) ... [32mok[0m
test packages/vexide-async/src/local.rs - local::LocalKey<T>::with (line 135) ... [32mok[0m
test packages/vexide-async/src/local.rs - local::LocalKey (line 36) ... [32mok[0m
test packages/vexide-async/src/task.rs - task::Task (line 197) ... [32mok[0m

test result: [32mok[0m. 11 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.67s`;


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
		"abort",
		"features",
		"ecosystem",
	]
};
