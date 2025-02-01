document.addEventListener("DOMContentLoaded", carregarLista);

let total = 0;

// Função para atualizar o total do carrinho com base na lista de compras armazenada
function atualizarTotalCarrinho() {
    // Obtém os itens existentes no localStorage
    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    
    // Calcula o total somando os valores de todos os itens
    let totalCarrinho = listaItens.reduce((total, item) => total + parseFloat(item.valorTotalItem), 0);
    
    // Atualiza o valor no localStorage
    localStorage.setItem("totalCarrinho", totalCarrinho.toFixed(2));
    
    // Atualiza todos os elementos com o ID 'totalCarrinho'
    document.querySelectorAll('#totalCarrinho').forEach(element => {
        element.textContent = totalCarrinho.toFixed(2);
    });
}

// Função para adicionar item ao carrinho
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

    // Calcula o valor total do item
    const valorTotalItem = (quantidade * valorUnitario).toFixed(2);

    // Adiciona o novo item à lista
    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    listaItens.push({ item, quantidade, unidade, valorUnitario, valorTotalItem });
    
    // Atualiza o localStorage com a lista de itens
    localStorage.setItem("listaCompras", JSON.stringify(listaItens));

    // Atualiza o total e a lista exibida
    atualizarTotalCarrinho();
    atualizarLista();

    // Limpa os campos do formulário
    itemInput.value = "";
    quantidadeInput.value = "";
    unidadeInput.value = "Selecione uma Unidade";
    valorUnitarioInput.value = "";
}

function converterParaFloat(valor) {
    if (!valor) return 0;
    valor = valor.trim().replace(/^R\$\s*/, "").replace(",", ".");
    const numero = parseFloat(valor);
    return isNaN(numero) ? 0 : numero;
}

function mascaraMoeda(input) {
    let valor = input.value.replace(/\D/g, '');
    valor = (valor / 100).toFixed(2);
    input.value = "R$ " + valor.replace(/(\d)(\d{3})$/, '$1.$2')
        .replace(/(\d)(\d{3})\.(\d{3})$/, '$1.$2.$3')
        .replace(/(\d+)(\d{2})$/, '$1,$2')
        .replace(/^$/, 'R$ 0,00');
}

function removerItem(index) {
    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    listaItens.splice(index, 1);
    localStorage.setItem("listaCompras", JSON.stringify(listaItens));
    atualizarTotalCarrinho();
    atualizarLista();
}

function carregarLista() {
    atualizarLista();
    atualizarTotalCarrinho();
}

function atualizarLista() {
    const listaCarrinho = document.getElementById("listaCarrinho");
    const contadorItens = document.getElementById("contadorItens");
    const totalCarrinhoElemento = document.getElementById("totalCarrinho");
    let totalGeral = 0;
    
    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    listaCarrinho.innerHTML = "";

    listaItens.forEach((el, index) => {
        totalGeral += parseFloat(el.valorTotalItem);
        listaCarrinho.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${el.quantidade} ${el.unidade} - ${el.item}
                <span>R$ ${parseFloat(el.valorTotalItem).toFixed(2)}</span>
                <button class="btn btn-sm btn-danger" onclick="removerItem(${index})">X</button>
            </li>
        `;
    });

    contadorItens.innerText = listaItens.length;
    totalCarrinhoElemento.innerText = totalGeral.toFixed(2);
}

function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    const margin = 10;

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Lista de Compras", margin, y);
    y += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const colunas = ["Item", "Quantidade", "Unidade", "Valor Unitário", "Valor Total"];
    const listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    let total = 0;

    doc.setTextColor(255, 255, 255);
    doc.setFillColor(169, 169, 169);
    doc.rect(margin, y, 190, 10, "F");
    colunas.forEach((coluna, index) => {
        const colX = margin + index * 38;
        doc.text(coluna, colX, y + 7);
    });

    y += 12;

    listaItens.forEach((item) => {
        const valorUnitario = parseFloat(item.valorUnitario) || 0;
        const valorTotalItem = parseFloat(item.valorTotalItem) || 0;

        doc.setTextColor(0, 0, 0);
        doc.rect(margin, y, 190, 8, "S", { radius: 2 });

        const itemX = margin;
        const quantidadeX = margin + 45;
        const unidadeX = margin + 85;
        const valorUnitarioX = margin + 125;
        const valorTotalItemX = margin + 165;

        doc.text(item.item, itemX, y + 5);
        doc.text(item.quantidade.toString(), quantidadeX, y + 5);
        doc.text(item.unidade, unidadeX, y + 5);
        doc.text(`R$ ${valorUnitario.toFixed(2)}`, valorUnitarioX, y + 5);
        doc.text(`R$ ${valorTotalItem.toFixed(2)}`, valorTotalItemX, y + 5);

        y += 10;
        total += valorTotalItem;
    });

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, 200, y);
    y += 5;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: R$ ${total.toFixed(2)}`, margin, y);
    y += 15;

    const dataHora = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(`Gerado em: ${dataHora}`, margin, 285);

    doc.save(`lista_de_compras_${dataHora.replace(/\//g, '-').replace(/:/g, '-')}.pdf`);

    atualizarLista();
    localStorage.removeItem("listaCompras");

    atualizarTotalCarrinho();
    localStorage.removeItem("totalCarrinho");

    atualizarLista();
    localStorage.removeItem("listaCompras");

    atualizarTotalCarrinho();
    localStorage.removeItem("totalCarrinho");
}

// Atualiza o total quando a modal do carrinho é exibida (usando evento do Bootstrap)
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('shown.bs.modal', atualizarTotalCarrinho);
});
