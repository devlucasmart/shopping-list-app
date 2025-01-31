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
    listaItens.push({ item, quantidade, unidade, valorTotalItem });
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
    doc.text("Lista de Compras", 10, 10);

    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];

    listaItens.forEach((item) => {
        doc.text(`${item.quantidade} ${item.unidade} de ${item.item} - R$ ${item.valorTotalItem}`, 10, y);
        y += 10;
    });

    doc.text(`Total: R$ ${total.toFixed(2)}`, 10, y + 10);
    doc.save("lista_de_compras.pdf");

    localStorage.removeItem("listaCompras");
    atualizarLista();
}
