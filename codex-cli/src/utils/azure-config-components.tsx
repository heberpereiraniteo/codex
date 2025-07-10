import SelectInput from "../components/select-input/select-input.js";
import TextInput from "../components/vendor/ink-text-input.js";
import { Box, Text } from "ink";
import React, { useState } from "react";

export type AzureConfigChoice = 
  | { type: "manual"; config: AzureConfig }
  | { type: "skip" };

export type AzureConfig = {
  apiKey: string;
  baseURL: string;
  model: string;
  apiVersion: string;
};

export function AzureConfigPrompt({
  onDone,
}: {
  onDone: (choice: AzureConfigChoice) => void;
}): JSX.Element {
  const [step, setStep] = useState<"select" | "configure">("select");
  const [config, setConfig] = useState<AzureConfig>({
    apiKey: "",
    baseURL: "",
    model: "gpt-4o-mini",
    apiVersion: "2024-10-01-preview",
  });
  const [currentField, setCurrentField] = useState<keyof AzureConfig>("apiKey");

  if (step === "select") {
    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Text>
            Configure Azure OpenAI for niteo-code CLI
          </Text>
          <Text dimColor>[use arrows to move, enter to select]</Text>
        </Box>
        <SelectInput
          items={[
            { label: "Configure Azure OpenAI interactively", value: "configure" },
            { label: "Skip (configure manually later)", value: "skip" },
          ]}
          onSelect={(item: { value: string }) => {
            if (item.value === "configure") {
              setStep("configure");
            } else {
              onDone({ type: "skip" });
            }
          }}
        />
      </Box>
    );
  }

  const fieldLabels: Record<keyof AzureConfig, string> = {
    apiKey: "Azure OpenAI API Key",
    baseURL: "Azure OpenAI Base URL",
    model: "Model Name",
    apiVersion: "API Version",
  };

  const fieldDescriptions: Record<keyof AzureConfig, string> = {
    apiKey: "Your Azure OpenAI API key (found in Azure portal)",
    baseURL: "https://your-resource.openai.azure.com",
    model: "The deployment name of your model (e.g., gpt-4o-mini)",
    apiVersion: "Azure OpenAI API version (e.g., 2024-10-01-preview)",
  };

  const fieldPlaceholders: Record<keyof AzureConfig, string> = {
    apiKey: "sk-...",
    baseURL: "https://your-resource.openai.azure.com",
    model: "gpt-4o-mini",
    apiVersion: "2024-10-01-preview",
  };

  const fields: (keyof AzureConfig)[] = ["apiKey", "baseURL", "model", "apiVersion"];
  const currentIndex = fields.indexOf(currentField);
  const isLastField = currentIndex === fields.length - 1;

  return (
    <Box flexDirection="column" gap={1}>
      <Box flexDirection="column">
        <Text>
          {fieldLabels[currentField]} ({currentIndex + 1}/{fields.length})
        </Text>
        <Text dimColor>{fieldDescriptions[currentField]}</Text>
      </Box>
      
      <TextInput
        value={config[currentField]}
        onChange={(value: string) => {
          setConfig(prev => ({ ...prev, [currentField]: value }));
        }}
        onSubmit={(value: string) => {
          const trimmedValue = value.trim();
          if (trimmedValue !== "") {
            setConfig(prev => ({ ...prev, [currentField]: trimmedValue }));
            
            if (isLastField) {
              // All fields completed
              onDone({ type: "manual", config: { ...config, [currentField]: trimmedValue } });
            } else {
              // Move to next field
              const nextField = fields[currentIndex + 1];
              if (nextField) {
                setCurrentField(nextField);
              }
            }
          }
        }}
        placeholder={fieldPlaceholders[currentField]}
        mask={currentField === "apiKey" ? "*" : undefined}
      />
      
      <Box flexDirection="column" marginTop={1}>
        <Text dimColor>
          Press Enter to continue to next field{isLastField ? " (last field)" : ""}
        </Text>
        <Text dimColor>
          Ctrl+C to cancel
        </Text>
      </Box>
      
      {/* Progress indicator */}
      <Box flexDirection="row" gap={1} marginTop={1}>
        {fields.map((field, index) => (
          <Text key={field} color={index <= currentIndex ? "green" : "gray"}>
            {index <= currentIndex ? "●" : "○"}
          </Text>
        ))}
      </Box>
    </Box>
  );
}
