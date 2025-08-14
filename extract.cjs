#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

class APIExtractor {
  constructor() {
    this.apiDocs = {
      endpoints: {},
      mockData: {},
      responseFormats: {},
      hooks: {},
      contexts: {},
    };
  }

  // Read file safely
  readFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf8");
      }
    } catch (error) {
      console.warn(`Could not read file: ${filePath}`);
    }
    return null;
  }

  // Extract function definitions and their patterns
  extractFunctions(content, fileName) {
    const functions = [];

    // Match export functions with signatures
    const exportMatches = content.match(/export\s+(?:const|function)\s+(\w+)\s*[=\(]([^{;]*)/g);
    if (exportMatches) {
      exportMatches.forEach((match) => {
        const funcMatch = match.match(/export\s+(?:const|function)\s+(\w+)\s*[=\(]([^{;]*)/);
        if (funcMatch) {
          const funcName = funcMatch[1];
          const signature = funcMatch[2].replace(/\s+/g, " ").trim();
          functions.push({
            name: funcName,
            signature: signature,
            type: "export",
            file: fileName,
            fullMatch: match.replace(/\s+/g, " ").trim(),
          });
        }
      });
    }

    // Match async functions with parameters
    const asyncMatches = content.match(/(?:export\s+)?(?:const\s+)?(\w+)\s*=\s*async\s*\(([^)]*)\)\s*=>/g);
    if (asyncMatches) {
      asyncMatches.forEach((match) => {
        const asyncMatch = match.match(/(\w+)\s*=\s*async\s*\(([^)]*)\)/);
        if (asyncMatch) {
          const funcName = asyncMatch[1];
          const params = asyncMatch[2];
          functions.push({
            name: funcName,
            signature: `async (${params})`,
            type: "async",
            file: fileName,
            fullMatch: match.replace(/\s+/g, " ").trim(),
          });
        }
      });
    }

    // Match arrow functions
    const arrowMatches = content.match(/(?:export\s+)?(?:const\s+)?(\w+)\s*=\s*\(([^)]*)\)\s*=>/g);
    if (arrowMatches) {
      arrowMatches.forEach((match) => {
        const arrowMatch = match.match(/(\w+)\s*=\s*\(([^)]*)\)/);
        if (arrowMatch) {
          const funcName = arrowMatch[1];
          const params = arrowMatch[2];
          functions.push({
            name: funcName,
            signature: `(${params})`,
            type: "arrow",
            file: fileName,
            fullMatch: match.replace(/\s+/g, " ").trim(),
          });
        }
      });
    }

    // Match regular function declarations
    const funcDeclarations = content.match(/(?:export\s+)?function\s+(\w+)\s*\(([^)]*)\)/g);
    if (funcDeclarations) {
      funcDeclarations.forEach((match) => {
        const funcMatch = match.match(/function\s+(\w+)\s*\(([^)]*)\)/);
        if (funcMatch) {
          const funcName = funcMatch[1];
          const params = funcMatch[2];
          functions.push({
            name: funcName,
            signature: `function (${params})`,
            type: "function",
            file: fileName,
            fullMatch: match.replace(/\s+/g, " ").trim(),
          });
        }
      });
    }

    return functions;
  }

  // Extract API endpoints and HTTP methods with more details
  extractEndpoints(content, fileName) {
    const endpoints = [];

    // Match API client calls with method names
    const apiClientMatches = content.match(
      /(?:await\s+)?(?:api\.|client\.)?(\w+)\s*\(\s*[`'"']([^`'"']+)[`'"']([^)]*)\)/g
    );
    if (apiClientMatches) {
      apiClientMatches.forEach((match) => {
        const apiMatch = match.match(/(?:await\s+)?(?:api\.|client\.)?(\w+)\s*\(\s*[`'"']([^`'"']+)[`'"']([^)]*)\)/);
        if (apiMatch) {
          const method = apiMatch[1];
          const url = apiMatch[2];
          const params = apiMatch[3];
          endpoints.push({
            url,
            method: method.toUpperCase(),
            methodName: method,
            parameters: params.trim(),
            file: fileName,
            fullCall: match.replace(/\s+/g, " ").trim(),
          });
        }
      });
    }

    // Match fetch calls
    const fetchMatches = content.match(/fetch\s*\(\s*[`'"']([^`'"']+)[`'"']([^)]*)\)/g);
    if (fetchMatches) {
      fetchMatches.forEach((match) => {
        const fetchMatch = match.match(/fetch\s*\(\s*[`'"']([^`'"']+)[`'"']([^)]*)\)/);
        if (fetchMatch) {
          const url = fetchMatch[1];
          const options = fetchMatch[2];
          const method = options.match(/method:\s*[`'"'](\w+)[`'"']/);
          endpoints.push({
            url,
            method: method ? method[1].toUpperCase() : "GET",
            methodName: "fetch",
            parameters: options.trim(),
            file: fileName,
            fullCall: match.replace(/\s+/g, " ").trim(),
          });
        }
      });
    }

    // Match template literals with endpoints
    const templateMatches = content.match(/`[^`]*\/api\/[^`]*`/g);
    if (templateMatches) {
      templateMatches.forEach((match) => {
        endpoints.push({
          url: match.replace(/`/g, ""),
          method: "TEMPLATE",
          methodName: "template",
          parameters: "",
          file: fileName,
          fullCall: match,
        });
      });
    }

    return endpoints;
  }

  // Extract mock data structures
  extractMockData(content, fileName) {
    const mockData = {};

    // Extract export default objects
    const defaultExportMatch = content.match(/export\s+default\s+(\{[\s\S]*?\});?\s*$/m);
    if (defaultExportMatch) {
      try {
        // Simple extraction - look for object patterns
        const objContent = defaultExportMatch[1];
        mockData.defaultExport = this.parseObjectStructure(objContent);
      } catch (e) {
        mockData.defaultExport = "Complex object - see file";
      }
    }

    // Extract named exports
    const namedExports = content.match(/export\s+const\s+(\w+)\s*=\s*(\{[\s\S]*?\});/g);
    if (namedExports) {
      namedExports.forEach((match) => {
        const nameMatch = match.match(/export\s+const\s+(\w+)/);
        const objMatch = match.match(/=\s*(\{[\s\S]*?\});/);
        if (nameMatch && objMatch) {
          const name = nameMatch[1];
          mockData[name] = this.parseObjectStructure(objMatch[1]);
        }
      });
    }

    return mockData;
  }

  // Parse object structure to get schema
  parseObjectStructure(objStr) {
    const schema = {};

    // Simple property extraction
    const propMatches = objStr.match(/(\w+):\s*([^,\n}]+)/g);
    if (propMatches) {
      propMatches.forEach((match) => {
        const [, key, value] = match.match(/(\w+):\s*(.+)/);
        schema[key] = this.inferType(value.trim());
      });
    }

    return schema;
  }

  // Infer data type from value
  inferType(value) {
    if (value.startsWith('"') || value.startsWith("'") || value.startsWith("`")) {
      return "string";
    }
    if (value.match(/^\d+$/)) {
      return "number";
    }
    if (value === "true" || value === "false") {
      return "boolean";
    }
    if (value.startsWith("[")) {
      return "array";
    }
    if (value.startsWith("{")) {
      return "object";
    }
    return "unknown";
  }

  // Extract hook information including callable methods
  extractHookInfo(content, fileName) {
    const hookInfo = {
      name: fileName.replace(".js", ""),
      exports: [],
      apiCalls: [],
      returnValues: [],
      callableMethods: [],
      stateVariables: [],
    };

    // Extract custom hook exports
    const hookExports = content.match(/export\s+(?:default\s+)?(?:const\s+)?(\w+)/g);
    if (hookExports) {
      hookInfo.exports = hookExports.map((match) => match.match(/(\w+)$/)[1]);
    }

    // Extract API calls within hooks
    hookInfo.apiCalls = this.extractEndpoints(content, fileName);

    // Extract return object methods (what components can call)
    const returnMatches = content.match(/return\s+\{[\s\S]*?\}/g);
    if (returnMatches) {
      returnMatches.forEach((returnMatch) => {
        const returnObj = returnMatch.replace("return ", "");

        // Extract method names from return object
        const methodMatches = returnObj.match(/(\w+)(?:\s*:\s*\w+)?(?:\s*,|\s*})/g);
        if (methodMatches) {
          methodMatches.forEach((method) => {
            const methodName = method.match(/(\w+)/)[1];
            if (!hookInfo.callableMethods.includes(methodName)) {
              hookInfo.callableMethods.push(methodName);
            }
          });
        }

        hookInfo.returnValues.push(this.parseObjectStructure(returnObj));
      });
    }

    // Extract internal method definitions that might be returned
    const internalMethods = content.match(/const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g);
    if (internalMethods) {
      internalMethods.forEach((match) => {
        const methodName = match.match(/const\s+(\w+)/)[1];
        hookInfo.callableMethods.push({
          name: methodName,
          definition: match.replace(/\s+/g, " ").trim(),
        });
      });
    }

    // Extract useState and other state variables
    const stateMatches = content.match(/const\s+\[(\w+),\s*(\w+)\]\s*=\s*useState/g);
    if (stateMatches) {
      stateMatches.forEach((match) => {
        const stateMatch = match.match(/const\s+\[(\w+),\s*(\w+)\]/);
        if (stateMatch) {
          hookInfo.stateVariables.push({
            state: stateMatch[1],
            setter: stateMatch[2],
          });
        }
      });
    }

    return hookInfo;
  }

  // Process API files
  processAPIFiles() {
    const apiPath = "src/lib/api";
    const apiFiles = [
      "auth.js",
      "chat.js",
      "client.js",
      "expenses.js",
      "households.js",
      "notifications.js",
      "tasks.js",
    ];

    apiFiles.forEach((file) => {
      const filePath = path.join(apiPath, file);
      const content = this.readFile(filePath);

      if (content) {
        const functions = this.extractFunctions(content, file);
        const endpoints = this.extractEndpoints(content, file);

        this.apiDocs.endpoints[file] = {
          functions,
          endpoints,
        };
      }
    });
  }

  // Process mock handlers
  processMockHandlers() {
    const mockPath = "src/lib/api/mock-handlers";
    const mockFiles = [
      "auth-mock.js",
      "chat-mock.js",
      "expense-mock.js",
      "household-mock.js",
      "notification-mock.js",
      "task-mock.js",
    ];

    mockFiles.forEach((file) => {
      const filePath = path.join(mockPath, file);
      const content = this.readFile(filePath);

      if (content) {
        const functions = this.extractFunctions(content, file);
        const mockData = this.extractMockData(content, file);

        this.apiDocs.responseFormats[file] = {
          functions,
          mockData,
        };
      }
    });
  }

  // Process mock data
  processMockData() {
    const mockDataPath = "src/mock-data";
    const mockFiles = ["expenses.js", "households.js", "messages.js", "notifications.js", "tasks.js", "users.js"];

    mockFiles.forEach((file) => {
      const filePath = path.join(mockDataPath, file);
      const content = this.readFile(filePath);

      if (content) {
        const mockData = this.extractMockData(content, file);
        this.apiDocs.mockData[file] = mockData;
      }
    });
  }

  // Process custom hooks
  processHooks() {
    const hooksPath = "src/hooks";
    const hookFiles = ["useChat.js", "useExpenses.js", "useTasks.js", "useRealtime.js"];

    hookFiles.forEach((file) => {
      const filePath = path.join(hooksPath, file);
      const content = this.readFile(filePath);

      if (content) {
        const hookInfo = this.extractHookInfo(content, file);
        this.apiDocs.hooks[file] = hookInfo;
      }
    });
  }

  // Process context files and extract callable methods
  processContexts() {
    const contextPath = "src/contexts";
    const contextFiles = ["AuthContext.jsx", "HouseholdContext.jsx", "NotificationContext.jsx", "ThemeContext.jsx"];

    contextFiles.forEach((file) => {
      const filePath = path.join(contextPath, file);
      const content = this.readFile(filePath);

      if (content) {
        const functions = this.extractFunctions(content, file);
        const endpoints = this.extractEndpoints(content, file);
        const contextMethods = this.extractContextMethods(content, file);

        this.apiDocs.contexts[file] = {
          functions,
          endpoints,
          contextMethods,
        };
      }
    });
  }

  // Extract context methods and actions
  extractContextMethods(content, fileName) {
    const contextMethods = {
      providerMethods: [],
      contextValue: [],
      actions: [],
      state: [],
    };

    // Extract context value object (what components can access)
    const contextValueMatches = content.match(/value=\{\{[\s\S]*?\}\}/g);
    if (contextValueMatches) {
      contextValueMatches.forEach((match) => {
        const valueObj = match.replace("value={{", "{").replace("}}", "}");
        const methods = valueObj.match(/(\w+)(?:\s*:\s*\w+)?(?:\s*,|\s*})/g);
        if (methods) {
          methods.forEach((method) => {
            const methodName = method.match(/(\w+)/)[1];
            contextMethods.contextValue.push(methodName);
          });
        }
      });
    }

    // Extract useReducer actions
    const dispatchMatches = content.match(/dispatch\(\{\s*type:\s*[`'"']([^`'"']+)[`'"']/g);
    if (dispatchMatches) {
      dispatchMatches.forEach((match) => {
        const action = match.match(/type:\s*[`'"']([^`'"']+)[`'"']/)[1];
        contextMethods.actions.push(action);
      });
    }

    // Extract useState variables
    const stateMatches = content.match(/const\s+\[(\w+),\s*(\w+)\]\s*=\s*useState/g);
    if (stateMatches) {
      stateMatches.forEach((match) => {
        const stateMatch = match.match(/const\s+\[(\w+),\s*(\w+)\]/);
        if (stateMatch) {
          contextMethods.state.push({
            state: stateMatch[1],
            setter: stateMatch[2],
          });
        }
      });
    }

    // Extract provider methods (functions defined in the context)
    const providerMethods = this.extractFunctions(content, fileName);
    contextMethods.providerMethods = providerMethods;

    return contextMethods;
  }

  // Generate documentation
  generateDocumentation() {
    const docs = {
      title: "API Documentation",
      generated: new Date().toISOString(),
      summary: {
        totalEndpoints: 0,
        totalMockFiles: Object.keys(this.apiDocs.mockData).length,
        totalHooks: Object.keys(this.apiDocs.hooks).length,
        totalContexts: Object.keys(this.apiDocs.contexts).length,
      },
      ...this.apiDocs,
    };

    // Count total endpoints
    Object.values(this.apiDocs.endpoints).forEach((api) => {
      docs.summary.totalEndpoints += api.endpoints?.length || 0;
    });

    return JSON.stringify(docs, null, 2);
  }

  // Main extraction method
  extract() {
    console.log("🔍 Extracting API documentation...");

    this.processAPIFiles();
    console.log("✅ Processed API files");

    this.processMockHandlers();
    console.log("✅ Processed mock handlers");

    this.processMockData();
    console.log("✅ Processed mock data");

    this.processHooks();
    console.log("✅ Processed hooks");

    this.processContexts();
    console.log("✅ Processed contexts");

    const documentation = this.generateDocumentation();

    // Write to file
    fs.writeFileSync("api-documentation.json", documentation);
    console.log("📄 Documentation saved to api-documentation.json");

    // Also create a readable markdown version
    this.generateMarkdownDocs();
    console.log("📄 Markdown documentation saved to api-documentation.md");

    return documentation;
  }

  // Generate readable markdown documentation
  generateMarkdownDocs() {
    let markdown = `# API Documentation for Component Development\n\n`;
    markdown += `Generated: ${new Date().toISOString()}\n\n`;

    // Quick Reference for Components
    markdown += `## 🚀 Quick Reference for Components\n\n`;
    markdown += `### Available Methods to Call:\n\n`;

    // Hook methods
    markdown += `#### From Custom Hooks:\n`;
    Object.entries(this.apiDocs.hooks).forEach(([file, data]) => {
      if (data.callableMethods?.length) {
        markdown += `**${data.name}:**\n`;
        data.callableMethods.forEach((method) => {
          if (typeof method === "object") {
            markdown += `- \`${method.name}\` - ${method.definition}\n`;
          } else {
            markdown += `- \`${method}\`\n`;
          }
        });
        markdown += `\n`;
      }
    });

    // Context methods
    markdown += `#### From Context Providers:\n`;
    Object.entries(this.apiDocs.contexts).forEach(([file, data]) => {
      const contextName = file.replace("Context.jsx", "");
      if (data.contextMethods?.contextValue?.length) {
        markdown += `**${contextName} Context:**\n`;
        data.contextMethods.contextValue.forEach((method) => {
          markdown += `- \`${method}\`\n`;
        });
        markdown += `\n`;
      }
    });

    // API Client methods
    markdown += `#### Direct API Calls:\n`;
    Object.entries(this.apiDocs.endpoints).forEach(([file, data]) => {
      if (data.functions?.length) {
        markdown += `**${file}:**\n`;
        data.functions.forEach((func) => {
          markdown += `- \`${func.name}${func.signature}\` - ${func.type}\n`;
        });
        markdown += `\n`;
      }
    });

    // Summary
    markdown += `## 📊 Summary\n\n`;
    markdown += `- Total API Files: ${Object.keys(this.apiDocs.endpoints).length}\n`;
    markdown += `- Total Mock Data Files: ${Object.keys(this.apiDocs.mockData).length}\n`;
    markdown += `- Total Hooks: ${Object.keys(this.apiDocs.hooks).length}\n`;
    markdown += `- Total Contexts: ${Object.keys(this.apiDocs.contexts).length}\n\n`;

    // API Endpoints with method signatures
    markdown += `## 🔌 API Endpoints\n\n`;
    Object.entries(this.apiDocs.endpoints).forEach(([file, data]) => {
      markdown += `### ${file}\n\n`;

      if (data.functions?.length) {
        markdown += `**Callable Functions:**\n`;
        data.functions.forEach((func) => {
          markdown += `- \`${func.name}${func.signature}\`\n`;
          markdown += `  - Type: ${func.type}\n`;
          markdown += `  - Full: \`${func.fullMatch}\`\n`;
        });
        markdown += `\n`;
      }

      if (data.endpoints?.length) {
        markdown += `**HTTP Endpoints:**\n`;
        data.endpoints.forEach((endpoint) => {
          markdown += `- \`${endpoint.methodName}()\` → \`${endpoint.method} ${endpoint.url}\`\n`;
          if (endpoint.parameters) {
            markdown += `  - Parameters: \`${endpoint.parameters}\`\n`;
          }
          markdown += `  - Full call: \`${endpoint.fullCall}\`\n`;
        });
        markdown += `\n`;
      }
    });

    // Mock Data Structures
    markdown += `## 🎭 Data Structures & Response Formats\n\n`;
    Object.entries(this.apiDocs.mockData).forEach(([file, data]) => {
      markdown += `### ${file}\n\n`;
      markdown += `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\n`;
    });

    // Custom Hooks with callable methods
    markdown += `## 🎣 Custom Hooks - Component Interface\n\n`;
    Object.entries(this.apiDocs.hooks).forEach(([file, data]) => {
      markdown += `### ${data.name}\n\n`;

      markdown += `**How to use in components:**\n`;
      markdown += `\`\`\`javascript\n`;
      markdown += `const { ${data.callableMethods.filter((m) => typeof m === "string").join(", ")} } = ${data.name}();\n`;
      markdown += `\`\`\`\n\n`;

      if (data.callableMethods?.length) {
        markdown += `**Available Methods:**\n`;
        data.callableMethods.forEach((method) => {
          if (typeof method === "object") {
            markdown += `- \`${method.name}\` - ${method.definition}\n`;
          } else {
            markdown += `- \`${method}\`\n`;
          }
        });
        markdown += `\n`;
      }

      if (data.stateVariables?.length) {
        markdown += `**State Variables:**\n`;
        data.stateVariables.forEach((state) => {
          markdown += `- \`${state.state}\` (state) / \`${state.setter}\` (setter)\n`;
        });
        markdown += `\n`;
      }

      if (data.apiCalls?.length) {
        markdown += `**Internal API Calls:**\n`;
        data.apiCalls.forEach((call) => {
          markdown += `- \`${call.methodName}()\` → \`${call.method} ${call.url}\`\n`;
        });
        markdown += `\n`;
      }
    });

    // Context Providers
    markdown += `## 🏗️ Context Providers - Global State\n\n`;
    Object.entries(this.apiDocs.contexts).forEach(([file, data]) => {
      const contextName = file.replace("Context.jsx", "");
      markdown += `### ${contextName} Context\n\n`;

      if (data.contextMethods?.contextValue?.length) {
        markdown += `**How to use in components:**\n`;
        markdown += `\`\`\`javascript\n`;
        markdown += `const { ${data.contextMethods.contextValue.join(", ")} } = use${contextName}();\n`;
        markdown += `\`\`\`\n\n`;

        markdown += `**Available Methods/Values:**\n`;
        data.contextMethods.contextValue.forEach((method) => {
          markdown += `- \`${method}\`\n`;
        });
        markdown += `\n`;
      }

      if (data.contextMethods?.actions?.length) {
        markdown += `**Available Actions:**\n`;
        data.contextMethods.actions.forEach((action) => {
          markdown += `- \`${action}\`\n`;
        });
        markdown += `\n`;
      }

      if (data.contextMethods?.state?.length) {
        markdown += `**State Variables:**\n`;
        data.contextMethods.state.forEach((state) => {
          markdown += `- \`${state.state}\` / \`${state.setter}\`\n`;
        });
        markdown += `\n`;
      }
    });

    fs.writeFileSync("api-documentation.md", markdown);
  }
}

// Run the extractor
if (require.main === module) {
  const extractor = new APIExtractor();
  extractor.extract();
}

module.exports = APIExtractor;
