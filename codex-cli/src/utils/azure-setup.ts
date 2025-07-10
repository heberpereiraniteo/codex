import type { AzureConfigChoice, AzureConfig } from "./azure-config-components.js";
import type { StoredConfig } from "./config.js";

import { AzureConfigPrompt } from "./azure-config-components.js";
import { render } from "ink";
import React from "react";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import chalk from "chalk";

function promptUserForAzureConfig(): Promise<AzureConfigChoice> {
  return new Promise<AzureConfigChoice>((resolve) => {
    const instance = render(
      React.createElement(AzureConfigPrompt, {
        onDone: (choice: AzureConfigChoice) => {
          resolve(choice);
          instance.unmount();
        }
      })
    );
  });
}

export async function setupAzureOpenAI(): Promise<boolean> {
  console.log(chalk.blue("🔧 Setting up Azure OpenAI for niteo-code CLI"));
  console.log();

  const choice = await promptUserForAzureConfig();

  if (choice.type === "skip") {
    console.log(chalk.yellow("⚠️  Skipping Azure OpenAI configuration."));
    console.log(chalk.dim("You can configure it later by:"));
    console.log(chalk.dim("1. Running: niteo-code --config"));
    console.log(chalk.dim("2. Or setting environment variables:"));
    console.log(chalk.dim("   export AZURE_OPENAI_API_KEY=\"your-key\""));
    console.log(chalk.dim("   export AZURE_OPENAI_BASE_URL=\"https://your-resource.openai.azure.com\""));
    console.log(chalk.dim("   export AZURE_OPENAI_MODEL=\"your-model-deployment\""));
    console.log();
    return false;
  }

  // Save configuration
  const config = choice.config;
  
  try {
    // Save to config file
    await saveAzureConfig(config);
    
    // Save environment variables to ~/.niteo-code.env
    await saveAzureEnvFile(config);

    console.log(chalk.green("✅ Azure OpenAI configuration saved successfully!"));
    console.log();
    console.log(chalk.bold("Configuration saved to:"));
    console.log(chalk.dim("• ~/.niteo-code/config.json"));
    console.log(chalk.dim("• ~/.niteo-code.env"));
    console.log();
    console.log(chalk.bold("You can now use niteo-code with Azure OpenAI:"));
    console.log(chalk.cyan('niteo-code "Hello, how can you help me?"'));
    console.log();
    
    return true;
  } catch (error) {
    console.error(chalk.red("❌ Failed to save Azure OpenAI configuration:"), error);
    return false;
  }
}

async function saveAzureConfig(config: AzureConfig): Promise<void> {
  const configDir = join(homedir(), ".niteo-code");
  const configFile = join(configDir, "config.json");

  // Create directory if it doesn't exist
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  // Load existing config or create new one
  let existingConfig: StoredConfig = {};
  if (existsSync(configFile)) {
    try {
      const configContent = readFileSync(configFile, "utf-8");
      existingConfig = JSON.parse(configContent);
    } catch (error) {
      console.warn(chalk.yellow("Warning: Could not read existing config, creating new one"));
    }
  }

  // Update config with Azure settings
  const updatedConfig: StoredConfig = {
    ...existingConfig,
    provider: "azure",
    model: config.model,
    providers: {
      ...existingConfig.providers,
      azure: {
        name: "Azure OpenAI",
        baseURL: config.baseURL.endsWith('/') ? config.baseURL.slice(0, -1) : config.baseURL,
        envKey: "AZURE_OPENAI_API_KEY",
      },
    },
  };

  // Save config
  writeFileSync(configFile, JSON.stringify(updatedConfig, null, 2) + "\n");
}

async function saveAzureEnvFile(config: AzureConfig): Promise<void> {
  const envFile = join(homedir(), ".niteo-code.env");
  
  // Prepare environment variables
  const envVars = [
    `AZURE_OPENAI_API_KEY=${config.apiKey}`,
    `AZURE_OPENAI_BASE_URL=${config.baseURL.endsWith('/') ? config.baseURL.slice(0, -1) : config.baseURL}`,
    `AZURE_OPENAI_MODEL=${config.model}`,
    `AZURE_OPENAI_API_VERSION=${config.apiVersion}`,
  ];

  let existingContent = "";
  if (existsSync(envFile)) {
    try {
      existingContent = readFileSync(envFile, "utf-8");
    } catch (error) {
      // Ignore read errors, we'll create a new file
    }
  }

  // Remove existing Azure OpenAI variables
  const lines = existingContent.split("\n").filter(line => 
    !line.startsWith("AZURE_OPENAI_") && line.trim() !== ""
  );

  // Add new Azure OpenAI variables
  const newContent = [...lines, ...envVars, ""].join("\n");

  // Save environment file
  writeFileSync(envFile, newContent);
}

export function checkAzureConfig(): { hasConfig: boolean; hasEnvVars: boolean; message?: string } {
  const configDir = join(homedir(), ".niteo-code");
  const configFile = join(configDir, "config.json");

  let hasConfig = false;
  let hasEnvVars = false;

  // Check config file
  if (existsSync(configFile)) {
    try {
      const configContent = readFileSync(configFile, "utf-8");
      const config = JSON.parse(configContent);
      if (config.provider === "azure" && config.providers?.azure) {
        hasConfig = true;
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }

  // Check environment variables
  const hasApiKey = process.env["AZURE_OPENAI_API_KEY"];
  const hasBaseUrl = process.env["AZURE_OPENAI_BASE_URL"];
  const hasModel = process.env["AZURE_OPENAI_MODEL"];

  if (hasApiKey && hasBaseUrl && hasModel) {
    hasEnvVars = true;
  }

  let message = "";
  if (!hasConfig && !hasEnvVars) {
    message = "Azure OpenAI not configured. Run 'niteo-code --setup-azure' to configure.";
  } else if (!hasEnvVars) {
    message = "Azure OpenAI config file found, but environment variables are missing.";
  }

  return { hasConfig, hasEnvVars, message };
}
