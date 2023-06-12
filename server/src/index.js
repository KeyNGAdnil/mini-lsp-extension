const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const generator = require('@babel/generator');

const code = `Page({
  onload(){
    my.tb.getconfigdata({
        
    })
    my.tb.openScuCombination({
        productItems: [{ itemId: 627478204974 }],
        success: (e) => {
            my.tb.getconfigdata({})
          console.log("openScuCombination success");
        },
        complete: (e) => {
          console.log("openScuCombination complee", e);
        },
       })
  },
  methods:{
    click(){
      my.tb.getconfigdata()
    }
  }
});`;

const ast = parser.parse(code, {
  sourceType: 'module',
});

traverse.default(ast, {
  CallExpression(path) {
    if (
      path.node.callee.property &&
      path.node.callee.property.name === 'getconfigdata'
    ) {
      path.node.callee.property.name = 'getConfigData';
    }
  },
});

const transformedCode = generator.default(ast, {}, code).code;
console.log(transformedCode);
