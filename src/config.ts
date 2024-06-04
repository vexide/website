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
		code: `struct Robot {
	motor: Motor,
}

impl CompetitionRobot for Robot {
	type Error = !;
	async fn driver(&mut self) -> Result<() !> {
		self.motor.set_voltage(10.0)?;

		Ok(())
	}
}

#[vexide::main]
async fn main(peripherals: Peripherals) {
	let my_robot = Robot {
		motor: Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward)?,
	};

	my_robot.compete().await.unwrap();
}`,
	},
];
