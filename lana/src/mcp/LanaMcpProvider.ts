/*
 * Copyright (c) 2020 Certinia Inc. All rights reserved.
 */
import path from 'path';
import {
  EventEmitter,
  lm,
  workspace,
  type McpServerDefinitionProvider,
  type McpStdioServerDefinition,
} from 'vscode';
import { Context } from '../Context.js';

export class LanaMcpProvider {
  static apply(context: Context): void {
    const provider = new LanaMcpServerDefinitionProvider(context);
    const disposable = lm.registerMcpServerDefinitionProvider('lanaLogAnalyzer', provider);
    context.context.subscriptions.push(disposable);
  }
}

class LanaMcpServerDefinitionProvider implements McpServerDefinitionProvider {
  private _onDidChangeMcpServerDefinitions = new EventEmitter<void>();
  onDidChangeMcpServerDefinitions = this._onDidChangeMcpServerDefinitions.event;
  extensionPath: string;

  constructor(context: Context) {
    this.extensionPath = context.context.extensionPath;
  }

  provideMcpServerDefinitions(): McpStdioServerDefinition[] {
    // Get the extension path

    // Path to the MCP server executable
    const mcpServerPath = path.join(this.extensionPath, 'out', 'mcp-server', 'index.js');

    console.log(`Providing MCP server definition for LANA at: ${mcpServerPath}`);

    return [
      {
        label: 'LANA Apex Log Analyzer',
        command: 'node',
        args: [mcpServerPath],
        env: {},
      },
    ];
  }

  resolveMcpServerDefinition(definition: McpStdioServerDefinition): McpStdioServerDefinition {
    // Perform any additional resolution if needed
    return definition;
  }

  private getExtensionPath(): string | undefined {
    // Try to find the extension path from the workspace
    const workspaceFolders = workspace.workspaceFolders;
    if (workspaceFolders) {
      for (const folder of workspaceFolders) {
        const lanaPath = path.join(folder.uri.fsPath, 'lana');
        try {
          // Check if this looks like the LANA extension workspace
          return lanaPath;
        } catch {
          // Continue to next workspace folder
        }
      }
    }

    // Fallback: try to determine from the current extension context
    // This would need to be passed from the extension context
    return undefined;
  }
}
