document.addEventListener("DOMContentLoaded", carregarLista);

function adicionarItem() {
    const itemInput = document.getElementById("itemInput");
    const quantidadeInput = document.getElementById("quantidadeInput");
    const unidadeInput = document.getElementById("unidadeInput");

    if (itemInput.value.trim() === "" || quantidadeInput.value.trim() === "") return;

    const item = {
        nome: itemInput.value,
        quantidade: quantidadeInput.value,
        unidade: unidadeInput.value
    };

    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    listaItens.push(item);
    localStorage.setItem("listaCompras", JSON.stringify(listaItens));

    atualizarLista();
    itemInput.value = "";
    quantidadeInput.value = "";
    unidadeInput.value = "unidade"; // Reseta o select para a opção padrão
}

function removerItem(index) {
    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
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

    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];

    listaItens.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `${item.nome} (x${item.quantidade} ${item.unidade}) 
            <button class='btn btn-danger btn-sm' onclick='removerItem(${index})'>Remover</button>`;
        lista.appendChild(li);
    });
}

function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    doc.text("Lista de Compras", 10, 10);

    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];

    listaItens.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.nome} (x${item.quantidade} ${item.unidade})`, 10, y);
        y += 10;
    });

    doc.save("lista_de_compras.pdf");

    localStorage.removeItem("listaCompras");
    atualizarLista();
}
