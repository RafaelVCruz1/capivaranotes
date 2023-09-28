import { openDB } from "idb";

let db;
async function criarDB(){
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction){
                switch  (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('anotacao', {
                            keyPath: 'titulo'
                        });
                        store.createIndex('id', 'id');
                        console.log("banco de dados criado!");
                }
            }
        });
        console.log("banco de dados aberto!");
    }catch (e) {
        console.log('Erro ao criar/abrir banco: ' + e.message);
    }
}

window.addEventListener('DOMContentLoaded', async event => {
    criarDB();
    document.getElementById('btnCadastro').addEventListener('click', adicionarAnotacao);
    document.getElementById('btnCarregar').addEventListener('click', buscarTodasAnotacoes);
    document.getElementById('btnAlterar').addEventListener('click', mudarAnotacao);
    document.getElementById('btnExcluir').addEventListener('click', excluirAnot);
});

async function excluirAnot(titulo) {
    try {
        await store.delete(titulo);
        buscarTodasAnotacoes()
        console.log('Anotação deletada com sucesso!');
    } catch (error) {
        console.error('Erro ao deletar anotação:', error);
        tx.abort();
    }
}

async function buscarTodasAnotacoes(){
    if(db == undefined){
        console.log("O banco de dados está fechado.");
    }
    const tx = await db.transaction('anotacao', 'readonly');
    const store = await tx.objectStore('anotacao');
    const anotacoes = await store.getAll();
    if(anotacoes){
        const divLista = anotacoes.map(anotacao => {
            return `<div class="item">
                    <p>Anotação ⬇</p>
                    <p>Título: ${anotacao.titulo} - ${anotacao.data} </p>
                    <p>Categoria: ${anotacao.categoria}</p>
                    <p>Descrição: ${anotacao.descricao}</p>
                    <button class="btnExcluir">Excluir</button>
                    <button class="btnAlterar">Alterar</button>
                   </div>`;
        });
        listagem(divLista.join(' '));
        const excluirAnot = document.querySelectorAll('.btnExcluir') 
        excluirAnot.forEach((excluirAnot, index) => {
            excluirAnot.addEventListener('click', () => excluirAnotacao(anotacoes[index].titulo))
        });
    }
}


async function adicionarAnotacao() {
    let titulo = document.getElementById("titulo").value;
    let categoria = document.getElementById("categoria").value;
    let descricao = document.getElementById("descricao").value;
    let data = document.getElementById("data").value;
    const tx = await db.transaction('anotacao', 'readwrite')
    const store = tx.objectStore('anotacao');
    try {
        await store.add({ titulo: titulo, categoria: categoria, descricao: descricao, data: data });
        await tx.done;
        apagarAnot();
        console.log('Registro adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        tx.abort();
    }
}

function listagem(text){
    document.getElementById('resultados').innerHTML = text;
}


