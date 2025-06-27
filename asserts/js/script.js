document.addEventListener("DOMContentLoaded", function() {
    console.log('DOM carregado, inicializando aplicação...');
    carregarLista();
    atualizarContadorCarrinho(); // Força atualização do contador na inicialização
});

let total = 0;

// Variável para armazenar o índice do item sendo editado
let itemEditandoIndex = -1;

// Função específica para atualizar o contador do carrinho
function atualizarContadorCarrinho() {
    console.log('=== ATUALIZANDO CONTADOR ===');
    
    const listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    const elementoContador = document.getElementById("contadorItens");
    const novoContador = listaItens.length;
    
    console.log('Lista de itens:', listaItens);
    console.log('Quantidade de itens:', novoContador);
    console.log('Elemento contador:', elementoContador);
    
    if (elementoContador) {
        console.log('Atualizando contador de', elementoContador.textContent, 'para', novoContador);
        
        // Atualiza o texto
        elementoContador.textContent = novoContador;
        
        // Controla a visibilidade
        if (novoContador > 0) {
            elementoContador.style.display = 'flex';
            elementoContador.style.visibility = 'visible';
            console.log('Contador visível com', novoContador, 'itens');
        } else {
            // Para debug, vamos deixar sempre visível quando for 0
            elementoContador.style.display = 'flex';
            elementoContador.style.visibility = 'visible';
            console.log('Contador visível com 0 itens (modo debug)');
        }
        
        // Adiciona animação de pulso para feedback visual
        elementoContador.style.animation = 'none';
        setTimeout(() => {
            elementoContador.style.animation = 'pulse 0.3s ease';
        }, 10);
        
    } else {
        console.error('❌ Elemento contadorItens NÃO encontrado no DOM!');
    }
    
    console.log('=== FIM ATUALIZAÇÃO CONTADOR ===');
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

    if (!item || isNaN(quantidade) || quantidade <= 0) {
        mostrarNotificacao("Preencha todos os campos corretamente!", "error");
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
    
    console.log('Item adicionado, atualizando interface...');

    // Feedback visual de sucesso
    mostrarNotificacao(`${item} adicionado com sucesso!`, "success");
    
    // Animação do botão
    const btnAdicionar = document.getElementById("btnAdicionar");
    btnAdicionar.innerHTML = '<i class="bi bi-check-circle me-2"></i>Adicionado!';
    btnAdicionar.classList.add('btn-success');
    btnAdicionar.classList.remove('btn-primary');
    
    setTimeout(() => {
        btnAdicionar.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Add';
        btnAdicionar.classList.remove('btn-success');
        btnAdicionar.classList.add('btn-primary');
    }, 1500);

    // Limpa os campos do formulário
    itemInput.value = "";
    quantidadeInput.value = "";
    unidadeInput.value = "unidade";
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

// Função para mostrar notificações
function mostrarNotificacao(mensagem, tipo = "info") {
    // Remove notificações existentes
    const notificacaoExistente = document.querySelector('.notificacao-toast');
    if (notificacaoExistente) {
        notificacaoExistente.remove();
    }

    const toast = document.createElement('div');
    toast.className = `notificacao-toast alert alert-${tipo === 'success' ? 'success' : tipo === 'error' ? 'danger' : 'info'} position-fixed`;
    toast.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    const icone = tipo === 'success' ? 'bi-check-circle-fill' : 
                  tipo === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';
    
    toast.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${icone} me-2"></i>
            <span>${mensagem}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animação de entrada
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove automaticamente após 3 segundos
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

function removerItem(index) {
    const listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    const itemRemovido = listaItens[index];
    
    if (!itemRemovido) return;
    
    // Confirmação mais elegante
    if (confirm(`Deseja realmente remover "${itemRemovido.item}" da lista?`)) {
        listaItens.splice(index, 1);
        localStorage.setItem("listaCompras", JSON.stringify(listaItens));
        atualizarTotalCarrinho();
        atualizarLista();
        
        mostrarNotificacao(`${itemRemovido.item} removido da lista`, "info");
    }
}

// Função para atualizar o total do carrinho e o contador
function atualizarTotalCarrinho() {
    const listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    let totalGeral = 0;
    
    // Calcula o total
    listaItens.forEach(item => {
        totalGeral += parseFloat(item.valorTotalItem) || 0;
    });
    
    // Atualiza todos os elementos de total
    document.querySelectorAll('#totalCarrinho').forEach(element => {
        element.textContent = totalGeral.toFixed(2);
    });
    
    // Atualiza o localStorage com o total
    localStorage.setItem("totalCarrinho", totalGeral.toFixed(2));
    
    // Atualiza o contador do carrinho
    atualizarContadorCarrinho();
    
    console.log('Total atualizado:', totalGeral.toFixed(2));
}

function carregarLista() {
    console.log('Carregando lista...');
    atualizarLista();
    atualizarTotalCarrinho();
}

function atualizarLista() {
    const listaCarrinho = document.getElementById("listaCarrinho");
    const carrinhoVazio = document.getElementById("carrinhoVazio");
    let totalGeral = 0;
    
    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    listaCarrinho.innerHTML = "";

    if (listaItens.length === 0) {
        carrinhoVazio.style.display = "block";
        listaCarrinho.style.display = "none";
    } else {
        carrinhoVazio.style.display = "none";
        listaCarrinho.style.display = "block";

        listaItens.forEach((el, index) => {
            totalGeral += parseFloat(el.valorTotalItem);
            
            const itemElement = document.createElement('li');
            itemElement.className = 'list-group-item carrinho-item';
            itemElement.innerHTML = `
                <div class="carrinho-item-header">
                    <div class="carrinho-item-info">
                        <div class="carrinho-item-titulo">
                            <i class="bi bi-bag-check-fill text-success me-2"></i>
                            ${el.item}
                        </div>
                        <div class="carrinho-item-detalhes">
                            <div class="carrinho-item-detalhe">
                                <i class="bi bi-123"></i>
                                <span>${el.quantidade} ${el.unidade}</span>
                            </div>
                            <div class="carrinho-item-detalhe">
                                <i class="bi bi-currency-dollar"></i>
                                <span>R$ ${parseFloat(el.valorUnitario).toFixed(2)} cada</span>
                            </div>
                        </div>
                    </div>
                    <div class="carrinho-item-preco">
                        <div class="carrinho-valor-total">
                            R$ ${parseFloat(el.valorTotalItem).toFixed(2)}
                        </div>
                        <div class="carrinho-acoes">
                            <button class="carrinho-btn carrinho-btn-editar" onclick="editarItem(${index})" title="Editar item">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="carrinho-btn carrinho-btn-remover" onclick="removerItem(${index})" title="Remover item">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            listaCarrinho.appendChild(itemElement);
        });
    }
    
    // Atualiza todos os elementos de total
    document.querySelectorAll('#totalCarrinho').forEach(element => {
        element.textContent = totalGeral.toFixed(2);
    });
}

// Função para exportar a lista em PDF
function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    const margin = 10;
    const pageHeight = doc.internal.pageSize.getHeight(); // Altura da página A4

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Lista de Compras", margin, y);
    y += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const colunas = ["Item", "Quantidade", "Unidade", "Valor Unitário", "Valor Total"];
    const listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    let total = 0;

    // Cabeçalho da tabela
    function desenharCabecalho() {
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(169, 169, 169);
        doc.rect(margin, y, 190, 10, "F");
        colunas.forEach((coluna, index) => {
            const colX = margin + index * 38;
            doc.text(coluna, colX, y + 7);
        });
        y += 12;
    }

    desenharCabecalho();

    listaItens.forEach((item, index) => {
        const valorUnitario = parseFloat(item.valorUnitario) || 0;
        const valorTotalItem = parseFloat(item.valorTotalItem) || 0;

        if (y + 15 > pageHeight - margin) {
            doc.addPage();
            y = 20;
            desenharCabecalho();
        }

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

    // Verifica se há espaço para o total
    if (y + 20 > pageHeight - margin) {
        doc.addPage();
        y = 20;
    }

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, 200, y);
    y += 5;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: R$ ${total.toFixed(2)}`, margin, y);
    y += 15;

    // Data e hora no rodapé da última página
    const dataHora = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(`Gerado em: ${dataHora}`, margin, pageHeight - 10);

    doc.save(`lista_de_compras_${dataHora.replace(/\//g, '-').replace(/:/g, '-')}.pdf`);

    // Limpeza e atualização
    localStorage.removeItem("listaCompras");
    localStorage.removeItem("totalCarrinho");
    atualizarLista();
    atualizarTotalCarrinho();
}

// Função para abrir o modal de edição
function editarItem(index) {
    const listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    const item = listaItens[index];
    
    if (!item) return;
    
    // Armazena o índice do item sendo editado
    itemEditandoIndex = index;
    
    // Preenche os campos do modal de edição com os dados do item
    document.getElementById("editItemInput").value = item.item;
    document.getElementById("editQuantidadeInput").value = item.quantidade;
    document.getElementById("editUnidadeInput").value = item.unidade;
    document.getElementById("editValorUnitInput").value = `R$ ${parseFloat(item.valorUnitario).toFixed(2).replace('.', ',')}`;
    
    // Abre o modal de edição
    const editarModal = new bootstrap.Modal(document.getElementById('editarModal'));
    editarModal.show();
}

// Função para salvar a edição
function salvarEdicao() {
    if (itemEditandoIndex === -1) return;
    
    const itemInput = document.getElementById("editItemInput").value.trim();
    const quantidadeInput = parseFloat(document.getElementById("editQuantidadeInput").value);
    const unidadeInput = document.getElementById("editUnidadeInput").value;
    const valorUnitarioInput = converterParaFloat(document.getElementById("editValorUnitInput").value);
    
    // Validação
    if (!itemInput || isNaN(quantidadeInput) || quantidadeInput <= 0) {
        mostrarNotificacao("Preencha todos os campos corretamente!", "error");
        return;
    }
    
    // Calcula o novo valor total
    const valorTotalItem = (quantidadeInput * valorUnitarioInput).toFixed(2);
    
    // Atualiza o item na lista
    let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];
    const itemAnterior = listaItens[itemEditandoIndex].item;
    
    listaItens[itemEditandoIndex] = {
        item: itemInput,
        quantidade: quantidadeInput,
        unidade: unidadeInput,
        valorUnitario: valorUnitarioInput,
        valorTotalItem: valorTotalItem
    };
    
    // Salva a lista atualizada
    localStorage.setItem("listaCompras", JSON.stringify(listaItens));
    
    // Atualiza a interface
    atualizarTotalCarrinho();
    atualizarLista();
    
    // Feedback de sucesso
    mostrarNotificacao(`${itemAnterior} foi atualizado com sucesso!`, "success");
    
    // Fecha o modal de edição
    const editarModal = bootstrap.Modal.getInstance(document.getElementById('editarModal'));
    editarModal.hide();
    
    // Reset do índice
    itemEditandoIndex = -1;
}

// Atualiza o total quando a modal do carrinho é exibida (usando evento do Bootstrap)
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('shown.bs.modal', atualizarTotalCarrinho);
});
