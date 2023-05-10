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
        triggerCharacters: [
          'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
          'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' ', '.'
        ],
      },
    },
  };
});

// 提示项
const completionItems: CompletionItem[] = [
  {
    label: 'tb',
    kind: CompletionItemKind.Method,
    detail: 'My custom method',
    insertText: 'tb',
  },
  {
    label: 'myMethod',
    kind: CompletionItemKind.Method,
    detail: 'My custom method',
    insertText: 'myMethod()',
  },
  {
    label: 'myProperty',
    kind: CompletionItemKind.Method,
    detail: 'My custom property',
    insertText: 'myConfigData()',
  },
];
const myCompletionItems: CompletionItem[] = [
  {
    label: 'my',
    kind: CompletionItemKind.Method,
    detail: 'My custom method',
    insertText: 'my',
  },
];


// 提示功能
connection.onCompletion(
  (params: CompletionParams): CompletionItem[] => {
    const document = documents.get(params.textDocument.uri);
    const position = params.position;

    if (document) {
      // const text = document.getText();

      // 在此处根据具体逻辑判断是否触发代码补全
      // 获取光标前的文本
      const lineText = document.getText({
        start: { line: position.line, character: 0 },
        end: position,
      });
      if (lineText.endsWith('m')) {
        console.log('触发了m');
        console.log('myCompletionItems', myCompletionItems);
        return myCompletionItems;
      }
      // 检查光标前的文本是否以 "my." 结尾
      if (lineText.endsWith('my.')) {
        console.log('触发了my');
        // console.log('completionItems', completionItems);
        return completionItems;
      }
      if (lineText.endsWith('tb.')) {
        console.log('触发了tb');
        return completionItems;
      }

      if (lineText.endsWith('o')) {
        const completionItem1: CompletionItem[] = [];
        const attributes = [
          'onTap',
          'onHover',
          // 添加其他属性
        ];

        attributes.forEach((attr) => {
          const item = CompletionItem.create(attr);
          item.kind = CompletionItemKind.Property;
          item.textEdit = {
            range: Range.create(
              Position.create(position.line, position.character),
              Position.create(position.line, position.character),
            ),
            newText: `${attr}=""`,
          };
          completionItem1.push(item);
        });
        console.log('触发了', completionItem1);
        return completionItem1;
      }
      return []
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
