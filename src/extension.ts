import * as vscode from "vscode";
import { logger } from "./utils/logger";
import { ExtensionController } from "./core/controller";
import { ProxyServer } from "./server/ProxyServer";

let controller: ExtensionController;
let proxy: ProxyServer;

export async function activate(context: vscode.ExtensionContext) {
  // Only show logger automatically in development mode
  const isDevMode = context.extensionMode === vscode.ExtensionMode.Development;
  if (isDevMode) {
    logger.show();
  }

  // Initialize the extension controller
  controller = new ExtensionController();

  try {
    await controller.initialize();
  } catch (error) {
    logger.error("Failed to initialize extension controller:", error);
    vscode.window.showErrorMessage(
      `Agent Maestro: Failed to initialize - ${(error as Error).message}`,
    );
  }

  proxy = new ProxyServer(controller, isDevMode ? 33333 : undefined);

  // Register commands
  const disposables = [
    vscode.commands.registerCommand("agent-maestro.getStatus", () => {
      const status = controller.getExtensionStatus();
      vscode.window.showInformationMessage(JSON.stringify(status, null, 2));
    }),

    vscode.commands.registerCommand("agent-maestro.startServer", async () => {
      try {
        if (!proxy) {
          vscode.window.showErrorMessage("Proxy server not initialized");
          return;
        }

        const result = await proxy.start();

        if (result.started) {
          vscode.window.showInformationMessage(
            `Agent Maestro server started successfully. View API documentation at ${proxy.getOpenAPIUrl()}`,
          );
        } else {
          // Don't show error message for "another instance running" case
          if (result.reason === "Another instance is already running") {
            logger.info(`Server startup skipped: ${result.reason}`);
          } else {
            vscode.window.showInformationMessage(
              `Server startup: ${result.reason}`,
            );
          }
        }
      } catch (error) {
        logger.error("Failed to start server:", error);
        vscode.window.showErrorMessage(
          `Failed to start server: ${(error as Error).message}`,
        );
      }
    }),

    vscode.commands.registerCommand("agent-maestro.stopServer", async () => {
      try {
        if (!proxy) {
          vscode.window.showErrorMessage("Proxy server not initialized");
          return;
        }

        await proxy.stop();
        vscode.window.showInformationMessage("Proxy server stopped");
      } catch (error) {
        logger.error("Failed to stop server:", error);
        vscode.window.showErrorMessage(
          `Failed to stop server: ${(error as Error).message}`,
        );
      }
    }),

    vscode.commands.registerCommand("agent-maestro.restartServer", async () => {
      try {
        if (!proxy) {
          vscode.window.showErrorMessage("Proxy server not initialized");
          return;
        }

        await proxy.stop();
        const result = await proxy.start();

        if (result.started) {
          const status = proxy.getStatus();
          vscode.window.showInformationMessage(
            `Proxy server restarted on ${status.url}`,
          );
        } else {
          vscode.window.showInformationMessage(
            `Server restart: ${result.reason}`,
          );
        }
      } catch (error) {
        logger.error("Failed to restart server:", error);
        vscode.window.showErrorMessage(
          `Failed to restart server: ${(error as Error).message}`,
        );
      }
    }),

    vscode.commands.registerCommand("agent-maestro.getServerStatus", () => {
      if (!proxy) {
        vscode.window.showErrorMessage("Proxy server not initialized");
        return;
      }

      const status = proxy.getStatus();
      vscode.window.showInformationMessage(
        `Server Status: ${status.isRunning ? "Running" : "Stopped"} | Port: ${status.port} | URL: ${status.url}`,
      );
    }),
  ];

  context.subscriptions.push(...disposables);

  await vscode.commands.executeCommand("agent-maestro.startServer");

  return controller;
}

// This method is called when your extension is deactivated
export async function deactivate() {
  try {
    if (proxy) {
      await proxy.stop();
      logger.info("Proxy server stopped");
    }
    if (controller) {
      await controller.dispose();
      logger.info("Extension controller disposed");
    }
  } catch (error) {
    logger.error("Error during deactivation:", error);
  }
}
