export const GITHUB_ORG_URL = `https://github.com/pros-rs`;
export const GITHUB_REPO_URL = `${GITHUB_ORG_URL}/pros-rs`;

export interface Example {
	name: string;
	code: string;
}

export const EXAMPLES: Example[] = [
	{
		name: "Basic",
		code: `#[derive(Default)]
pub struct Robot;

#[async_trait]
impl AsyncRobot for Robot {
	async fn opcontrol(&mut self) -> pros::Result {
		println!("basic example");

		Ok(())
	}
}
async_robot!(Robot);`,
	},
];
