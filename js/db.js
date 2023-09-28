import { openDB } from "idb";

class CapivaraNotes {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    try {
      this.db = await openDB('banco', 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
          switch (oldVersion) {
            case 0:
            case 1:
              const store = db.createObjectStore('anotacao', {
                keyPath: 'titulo'
              });
              store.createIndex('id', 'id');
              console.log("Banco de dados criado!");
          }
        }
      });
      console.log("Banco de dados aberto!");
    } catch (e) {
      console.log('Erro ao criar/abrir banco: ' + e.message);
    }

    this.addEventListeners();
  }

  addEventListeners() {
    document.getElementById('btnCadastro').addEventListener('click', () => this.adicionarAnotacao());
    document.getElementById('btnCarregar').addEventListener('click', () => this.buscarTodasAnotacoes());
  }

  async buscarTodasAnotacoes() {
    if (!this.db) {
      console.log("O banco de dados está fechado.");
      return;
    }

    const tx = this.db.transaction('anotacao', 'readonly');
    const store = tx.objectStore('anotacao');
    const anotacoes = await store.getAll();

    if (anotacoes) {
      const divLista = anotacoes.map(anotacao => this.createAnotacaoHTML(anotacao));
      this.listagem(divLista.join(' '));
      this.addExcluirEventListeners(anotacoes);
      this.addAlterarEventListeners(anotacoes);
    }
  }

  createAnotacaoHTML(anotacao) {
    return `
      <div class="item">
        <p>Anotação ⬇</p>
        <p>Título: ${anotacao.titulo} - ${anotacao.data} </p>
        <p>Categoria: ${anotacao.categoria}</p>
        <p>Descrição: ${anotacao.descricao}</p>
        <button class="btnExcluir">Excluir</button>
        <button class="btnAlterar" titulo="${anotacao.titulo}">Alterar</button>
      </div>`;
  }

  addExcluirEventListeners(anotacoes) {
    const excluirAnotacao = document.querySelectorAll('.btnExcluir');
    excluirAnotacao.forEach((excluirAnotacao, index) => {
      excluirAnotacao.addEventListener('click', () => this.excluirAnot(anotacoes[index].titulo));
    });
  }

  addAlterarEventListeners(anotacoes) {
    const alterarAnotacao = document.querySelectorAll('.btnAlterar');
    alterarAnotacao.forEach(altera => {
      altera.addEventListener("click", (event) => {
        const titulo = event.target.getAttribute("titulo");
        this.alteracao(titulo, anotacoes);
      });
    });
  }

  async excluirAnot(titulo) {
    const tx = this.db.transaction('anotacao', 'readwrite');
    const store = tx.objectStore('anotacao');

    try {
      await store.delete(titulo);
      this.buscarTodasAnotacoes();
      console.log('Anotação deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar anotação:', error);
      tx.abort();
    }
  }

  async alterarAnot(titulo, categoria, descricao, data) {
    const tx = this.db.transaction('anotacao', 'readwrite');
    const store = tx.objectStore('anotacao');
    const altanotacao = await store.get(titulo);

    altanotacao.categoria = categoria;
    altanotacao.data = data;
    altanotacao.descricao = descricao;

    await store.put(altanotacao);
    await tx.done;
  }

  alteracao(titulo, anotacoes) {
    const anotacaoAltera = anotacoes.find(param => param.titulo === titulo);
    let div = document.createElement('div');
    div.innerHTML = `
      <input type="text" id="Alteracategoria" placeholder="Categoria" value="${anotacaoAltera.categoria}">
      <textarea id="Alteradescricao" cols="30" rows="10" placeholder="Descrição">${anotacaoAltera.descricao}</textarea>
      <input type="date" id="Alteradata" value="${anotacaoAltera.data}" />
      <button id="btnAlteracao">Alterar</button>
    `;
    const btndaAlteracao = div.querySelector('#btnAlteracao');
    btndaAlteracao.addEventListener('click', () => {
      const categoria = document.getElementById("Alteracategoria").value;
      const descricao = document.getElementById("Alteradescricao").value;
      const data = document.getElementById("Alteradata").value;
      this.alterarAnot(titulo, categoria, descricao, data);
      this.buscarTodasAnotacoes();
    });
    document.getElementById('resultados').appendChild(div);
  }

  async adicionarAnotacao() {
    const titulo = document.getElementById("titulo").value;
    const categoria = document.getElementById("categoria").value;
    const descricao = document.getElementById("descricao").value;
    const data = document.getElementById("data").value;

    const tx = this.db.transaction('anotacao', 'readwrite');
    const store = tx.objectStore('anotacao');

    try {
      await store.add({ titulo, categoria, descricao, data });
      await tx.done;
      this.apagarAnot();
      console.log('Registro adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar registro:', error);
      tx.abort();
    }
  }

  listagem(text) {
    document.getElementById('resultados').innerHTML = text;
  }

}

window.addEventListener('DOMContentLoaded', () => new CapivaraNotes());
