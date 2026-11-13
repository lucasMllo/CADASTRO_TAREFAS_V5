class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

const listaDeProdutos = [];
let indiceEdicao = null;
const CHAVE_STORAGE = "sistema_estoque_produtos";

function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos) {
        const produtosObjetos = JSON.parse(dadosSalvos);

        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

const formProduto = document.getElementById("produto-form");
const btnSubmit = formProduto.querySelector("button[type='submit']");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const campoBusca = document.getElementById("campo-busca");
const mensagemErroEl = document.getElementById("mensagem-erro");
const btnConceitoBootstrap = document.getElementById("btn-conceito-bootstrap");

const modalConfirmacao = document.getElementById("modal-confirmacao");
const modalTitulo = document.getElementById("modal-titulo");
const modalMensagem = document.getElementById("modal-mensagem");
const modalBtnConfirmar = document.getElementById("modal-btn-confirmar");
const modalBtnCancelar = document.getElementById("modal-btn-cancelar");

const modalBootstrap = document.getElementById("modal-bootstrap");
const modalBootstrapFechar = document.getElementById("modal-bootstrap-fechar");

let acaoConfirmacaoCallback = null;

function exibirErroInline(mensagem) {
    mensagemErroEl.textContent = mensagem;
    mensagemErroEl.classList.remove("mensagem-erro-oculta");
    mensagemErroEl.classList.add("mensagem-erro-visivel");
}

function limparErroInline() {
    mensagemErroEl.textContent = "";
    mensagemErroEl.classList.remove("mensagem-erro-visivel");
    mensagemErroEl.classList.add("mensagem-erro-oculta");
}

function abrirModalConfirmacao(titulo, mensagem, callback) {
    modalTitulo.textContent = titulo;
    modalMensagem.textContent = mensagem;
    acaoConfirmacaoCallback = callback;
    modalConfirmacao.style.display = "flex";
}

function fecharModalConfirmacao() {
    modalConfirmacao.style.display = "none";
    acaoConfirmacaoCallback = null;
}

modalBtnCancelar.addEventListener("click", () => {
    fecharModalConfirmacao();
});

modalBtnConfirmar.addEventListener("click", () => {
    if (typeof acaoConfirmacaoCallback === "function") {
        acaoConfirmacaoCallback();
    }
    fecharModalConfirmacao();
});

btnConceitoBootstrap.addEventListener("click", () => {
    modalBootstrap.style.display = "flex";
});

modalBootstrapFechar.addEventListener("click", () => {
    modalBootstrap.style.display = "none";
});

function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    indiceEdicao = index;
    btnSubmit.textContent = "Salvar Alterações";
    btnSubmit.classList.add("btn-warning");
    limparErroInline();
}

function obterProdutosFiltrados() {
    const termo = campoBusca.value.trim().toLowerCase();

    if (!termo) {
        return listaDeProdutos;
    }
    
    return listaDeProdutos.filter(produto =>
        produto.nome.toLowerCase().includes(termo)
    );
}

formProduto.addEventListener("submit", function (event) {
    event.preventDefault();
    limparErroInline();

    const nome = document.getElementById("nome").value.trim();
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = parseInt(document.getElementById("quantidade").value);

    if (!nome) {
        exibirErroInline("Por favor, informe um nome válido para o produto.");
        return;
    }

    if (isNaN(preco) || preco <= 0 || isNaN(quantidade) || quantidade <= 0) {
        exibirErroInline("O preço e a quantidade devem ser valores numéricos maiores que zero.");
        return;
    }

    const produtoValido = new Produto(nome, preco, quantidade);

    if (indiceEdicao === null) {
        listaDeProdutos.push(produtoValido);
    } else {
        listaDeProdutos[indiceEdicao] = produtoValido;
        
        indiceEdicao = null;
        btnSubmit.textContent = "Adicionar Produto";
        btnSubmit.classList.remove("btn-warning");
    }

    salvarNoLocalStorage();
    formProduto.reset();
    atualizarInterface();
});

btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        exibirErroInline("A tabela já está vazia!");
        return;
    }

    abrirModalConfirmacao(
        "Limpar Estoque",
        "Tem certeza que deseja remover todos os produtos?",
        () => {
            listaDeProdutos.length = 0;
            localStorage.removeItem(CHAVE_STORAGE);
            
            indiceEdicao = null;
            btnSubmit.textContent = "Adicionar Produto";
            btnSubmit.classList.remove("btn-warning");

            formProduto.reset();
            limparErroInline();
            atualizarInterface();
        }
    );
});

function removerProduto(index) {
    abrirModalConfirmacao(
        "Remover Produto",
        `Tem certeza que deseja excluir o produto "${listaDeProdutos[index].nome}"?`,
        () => {
            listaDeProdutos.splice(index, 1);

            if (indiceEdicao === index) {
                indiceEdicao = null;
                btnSubmit.textContent = "Adicionar Produto";
                btnSubmit.classList.remove("btn-warning");
                formProduto.reset();
            } else if (indiceEdicao !== null && indiceEdicao > index) {
                indiceEdicao--;
            }

            salvarNoLocalStorage();
            limparErroInline();
            atualizarInterface();
        }
    );
}

function atualizarTotalEstoque() {
    const produtosExibidos = obterProdutosFiltrados();
    const total = produtosExibidos.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    const produtosExibidos = obterProdutosFiltrados();

    produtosExibidos.forEach((produto) => {
        const indexReal = listaDeProdutos.indexOf(produto);
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-editar">Editar</button>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        const btnEditar = linha.querySelector(".btn-editar");
        btnEditar.addEventListener("click", () => prepararEdicao(indexReal));

        const btnRemover = linha.querySelector(".btn-remover");
        btnRemover.addEventListener("click", () => removerProduto(indexReal));

        tabelaBody.appendChild(linha);
    });
}

function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

campoBusca.addEventListener("input", () => {
    atualizarInterface();
});

carregarDoLocalStorage();
atualizarInterface();
