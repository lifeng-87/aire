import { ArrayString } from "@skyra/env-utilities";
declare module "@skyra/env-utilities" {
	export interface Env {
		OWNERS_ID: ArrayString;
		DISCORD_TOKEN: string;
		DEV_GUILDS_ID: ArrayString;
	}
}
