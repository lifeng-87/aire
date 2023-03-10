import { AireClient } from "#lib/AireClient";
import "#lib/setup";

const client = new AireClient();

async function main() {
  try {
    client.login();
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
}

void main();
