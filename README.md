# shopping-list-app

Um aplicativo simples de **Lista de Compras** desenvolvido com **HTML, CSS, JavaScript e Bootstrap**, que permite adicionar itens, importar uma lista em **Markdown** e exportar a lista como **PDF**.

## Importacao em Markdown

O app agora aceita a importacao de uma ou mais tabelas Markdown com as colunas abaixo:

| item | quantidade | unidade | valor unitario |
| --- | ---: | --- | ---: |
| Arroz | 0 | kg | 0 |
| Feijao | 0 | kg | 0 |

Use o arquivo [modelo-lista.md](modelo-lista.md) como base. Depois de importar, voce pode editar cada item direto pela interface.

Regras principais:

- A coluna item e obrigatoria.
- Quantidade e valor unitario podem ficar em 0 para voce preencher depois.
- Voce pode organizar o arquivo por categorias, usando varios blocos de tabela no mesmo Markdown.
- A importacao substitui a lista atual quando ja houver itens salvos.

## Exportacao

Ao exportar o PDF, a lista atual e limpa do navegador, mantendo o comportamento original do projeto.

## Estrutura

- [index.html](index.html)
- [asserts/js/script.js](asserts/js/script.js)
- [asserts/css/style.css](asserts/css/style.css)
