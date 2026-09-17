import { quoteShellArg, quoteShellArgs } from "./shellQuote";

export const AGENT_VERSION = "1.2.61";
export type AgentPlatform = "linux" | "docker";

export function generateAgentInstallCommand(
  platform: AgentPlatform,
  args: string[],
  proxy = "",
) {
  if (platform === "docker") {
    const installOnlyFlags = [
      "--install-version",
      "--install-ghproxy",
      "--install-dir",
      "--install-service-name",
    ];
    const dockerArgs: string[] = [];
    for (let i = 0; i < args.length; i++) {
      if (installOnlyFlags.includes(args[i])) {
        i++;
      } else if (!args[i].startsWith("--disable-auto-update")) {
        dockerArgs.push(args[i]);
      }
    }
    dockerArgs.push("--disable-auto-update");
    const discovery = args.includes("--auto-discovery");
    return (
      (discovery ? "touch .komari-auto-discovery.json && chmod 600 .komari-auto-discovery.json && " : "") +
      "docker run -d --name komari-agent --restart=always " +
      (discovery ? '-v "$(pwd)/.komari-auto-discovery.json:/app/auto-discovery.json" ' : "") +
      `ghcr.io/mghts/komari-agent:${AGENT_VERSION} ` +
      quoteShellArgs(dockerArgs)
    );
  }

  let scriptUrl = `https://github.com/mghts/komari-agent/releases/download/${AGENT_VERSION}/install.sh`;
  const installArgs = ["--install-version", AGENT_VERSION, ...args];
  if (proxy.trim()) {
    // The fork installer requires HTTPS and a full upstream URL after the proxy.
    const proxyUrl = `https://${proxy.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
    scriptUrl = `${proxyUrl}/${scriptUrl}`;
    installArgs.push("--install-ghproxy", proxyUrl);
  }
  return `curl -fsSL ${quoteShellArg(scriptUrl)} | sudo bash -s -- ${quoteShellArgs(installArgs)}`;
}
