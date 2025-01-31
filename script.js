document.addEventListener("DOMContentLoaded", carregarLista);

let total = 0;

function adicionarItem() {
    const itemInput = document.getElementById("itemInput");
    const quantidadeInput = document.getElementById("quantidadeInput");
    const unidadeInput = document.getElementById("unidadeInput");
    const valorUnitarioInput = document.getElementById("valorUnitInput");

    const item = itemInput.value.trim();
    const quantidade = parseFloat(quantidadeInput.value);
    const unidade = unidadeInput.value;
    const valorUnitario = converterParaFloat(valorUnitarioInput.value);

    if (!item || isNaN(quantidade)) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    const valorTotalItem = (quantidade * valorUnitario).toFixed(2);
    total += parseFloat(valorTotalItem);

    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    listaItens.push({ item, quantidade, unidade, valorUnitario , valorTotalItem });
    localStorage.setItem("listaCompras", JSON.stringify(listaItens));

    atualizarLista();

    itemInput.value = "";
    quantidadeInput.value = "";
    valorUnitarioInput.value = "";
}

function converterParaFloat(valor) {
    if (!valor) return 0; // Se for vazio ou null, retorna 0

    // Remove espaços extras e "R$"
    valor = valor.trim().replace(/^R\$\s*/, "");

    // Substitui todas as vírgulas por pontos
    valor = valor.replace(",", ".");

    // Converte para float corretamente
    const numero = parseFloat(valor);

    // Retorna 0 se não for um número válido
    return isNaN(numero) ? 0 : numero;
}

function mascaraMoeda(input) {
    let valor = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    valor = (valor / 100).toFixed(2); // Converte para formato decimal com 2 casas

    // Adiciona o "R$" no começo e formata o número
    input.value = "R$ " + valor.replace(/(\d)(\d{3})$/, '$1.$2')
                               .replace(/(\d)(\d{3})\.(\d{3})$/, '$1.$2.$3')
                               .replace(/(\d)(\d{3})\.(\d{3})\.(\d{3})$/, '$1.$2.$3.$4')
                               .replace(/(\d)(\d{3})\.(\d{3})\.(\d{3})\.(\d{3})$/, '$1.$2.$3.$4.$5')
                               .replace(/(\d+)(\d{2})$/, '$1,$2')
                               .replace(/^(?=\d)(\d{1,2})$/, '$1,00')
                               .replace(/^(?=\d)(\d{1,3})(\d{1,2})$/, '$1,$2')
                               .replace(/^$/, 'R$ 0,00');
}

function removerItem(index) {
    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    total -= parseFloat(listaItens[index].valorTotalItem);
    listaItens.splice(index, 1);
    localStorage.setItem("listaCompras", JSON.stringify(listaItens));
    atualizarLista();
}

function carregarLista() {
    atualizarLista();
}

function atualizarLista() {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";
    let total = 0;

    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];

    listaItens.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        
        // Formatar o valor total do item como moeda
        let valorTotalFormatado = parseFloat(item.valorTotalItem).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        li.innerHTML = `${item.quantidade} ${item.unidade} de ${item.item} - ${valorTotalFormatado}
            <button class='btn btn-danger btn-sm' onclick='removerItem(${index})'>Remover</button>`;
        
        lista.appendChild(li);
        total += parseFloat(item.valorTotalItem);
    });

    // Formatar o valor total final
    let totalFormatado = total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    document.getElementById("valorTotal").innerText = totalFormatado;
}

function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    const margin = 10;

    // Título
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Lista de Compras", margin, y);
    y += 15;

    // Definindo a fonte para o restante do documento
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Desenhando o cabeçalho
    const colunas = ["Item", "Quantidade", "Unidade", "Valor Unitário", "Valor Total"];
    const listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    let total = 0;

    // Cabeçalho da tabela com fundo cinza e texto branco
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(169, 169, 169); // Cor cinza (RGB)
    doc.rect(margin, y, 190, 10, "F");
    colunas.forEach((coluna, index) => {
        const colX = margin + index * 38;
        doc.text(coluna, colX, y + 7);
    });

    y += 12; // Deslocando para a próxima linha após o cabeçalho

    // Preenchendo a tabela com os itens
    listaItens.forEach((item) => {
        // Garantir que o valor unitário é um número válido
        const valorUnitario = parseFloat(item.valorUnitario);
        const valorTotalItem = parseFloat(item.valorTotalItem);

        // Verifica se os valores são NaN e substitui por 0 caso necessário
        const valorUnitarioFormatado = isNaN(valorUnitario) ? 0 : valorUnitario;
        const valorTotalItemFormatado = isNaN(valorTotalItem) ? 0 : valorTotalItem;

        // Adicionando borda arredondada e sombra suave
        doc.setTextColor(0, 0, 0);
        doc.rect(margin, y, 190, 8, "S", { radius: 2 });

        // Ajuste de posição (X) para garantir o alinhamento correto
        const itemX = margin + 0;
        const quantidadeX = margin + 45;
        const unidadeX = margin + 85;
        const valorUnitarioX = margin + 125;
        const valorTotalItemX = margin + 165;

        // Alinhando o texto nas colunas
        doc.text(item.item, itemX, y + 5);
        doc.text(item.quantidade.toString(), quantidadeX, y + 5);
        doc.text(item.unidade, unidadeX, y + 5);
        doc.text(`R$ ${valorUnitarioFormatado.toFixed(2)}`, valorUnitarioX, y + 5);
        doc.text(`R$ ${valorTotalItemFormatado.toFixed(2)}`, valorTotalItemX, y + 5);
        
        y += 10;
        total += valorTotalItemFormatado;
    });

    // Linha separadora mais fina
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, 200, y);
    y += 5;

    // Exibindo o total
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: R$ ${total.toFixed(2)}`, margin, y);
    y += 15;

    // Rodapé com data e hora
    const dataHora = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(`Gerado em: ${dataHora}`, margin, 285);

    // Salva o PDF com nome dinâmico
    doc.save(`lista_de_compras_${dataHora.replace(/\//g, '-').replace(/:/g, '-')}.pdf`);

    // Limpa os itens do localStorage e atualiza a lista
    localStorage.removeItem("listaCompras");
    atualizarLista();
}
