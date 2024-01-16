export const CRATE_NAME = `pros`;

export const GITHUB_ORG_URL = `https://github.com/pros-rs`;
export const GITHUB_REPO_URL = `${GITHUB_ORG_URL}/pros-rs`;

export const DISCORD_INVITE_CODE = `y9mcGuQRYz`;
export const DISCORD_INVITE_URL = `https://discord.gg/y9mcGuQRYz`;

export interface Example {
	name: string;
	code: string;
}

export const EXAMPLES: Example[] = [
	{
		name: "Basic",
		code: `use pros::prelude::*;

#[derive(Default)]
pub struct Robot;

impl AsyncRobot for Robot {
	async fn opcontrol(&mut self) -> pros::Result {
		println!("basic example");

		Ok(())
	}
}
async_robot!(Robot);`,
	},
];
