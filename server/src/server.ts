import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  CompletionParams,
  TextDocumentSyncKind,
  InsertTextFormat,
  Position,
  Range
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { config } from './mock/mock'
// 创建连接
const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);


// 监听文档变化
documents.listen(connection);

connection.onInitialize((params: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'.split('')
      },
    },
  };
});


function findChildrenByPath(searchPath: string) {
  const trimmedPath = searchPath.replace(/\.$/, ''); // 去除末尾的点号
  const pathSegments = trimmedPath.split('.');
  let currentChildren: any = config;

  // 每次循环就是在树的一层寻找当前层级节点是否含有下一个层级节点的children
  for (const segment of pathSegments) {
    const foundChild = currentChildren.find((child: any) => child.label === segment);
    if (foundChild && foundChild.children) {
      currentChildren = foundChild.children;
    } else {
      return [];
    }
  }

  return currentChildren;
}


// 提示功能
connection.onCompletion(
  (params: CompletionParams): CompletionItem[] => {
    const document = documents.get(params.textDocument.uri);
    const position = params.position;
    if (document) {

      const lineText = document.getText({
        start: { line: position.line, character: 0 },
        end: position,
      });
      console.log(lineText);
      const res = findChildrenByPath(lineText);

      // 第一层调用，如my直接返回config
      if (res.length === 0 && !lineText.includes('.')) {
        console.log('====>', config);
        return config
      }

      console.log('====>', res);
      return res;
    }

    return [];
  }
);

// 设置选择时 补齐代码文档信息
connection.onCompletionResolve((item) => {
  if (item.label === 'myProperty') {
    // 在这里根据需要设置补全项的详细信息
    item.documentation = 'Documentation for my';
    item.detail = 'Custom Completion - my';
  }

  return item;
});
// 启动 LSP 服务
connection.listen();
