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
    await criarDB();
    document.getElementById('btnCadastro').addEventListener('click', adicionarAnotacao);
    document.getElementById('btnCarregar').addEventListener('click', buscarTodasAnotacoes);

});



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
                    <button class="btnAlterar" titulo="${anotacao.titulo}">Alterar</button>
                   </div>`;
        });
        listagem(divLista.join(' '));
        const excluirAnotacao = document.querySelectorAll('.btnExcluir') 
        excluirAnotacao.forEach((excluirAnotacao, index) => {
            excluirAnotacao.addEventListener('click', () => excluirAnot(anotacoes[index].titulo))
        });

        const alterarAnotacao = document.querySelectorAll('.btnAlterar') 
        alterarAnotacao.forEach(altera => {
            altera.addEventListener("click", (event) => {
            const titulo = event.target.getAttribute("titulo");
            alteracao(titulo, anotacoes);
        });
    });
        };

      
    }


async function excluirAnot(titulo) {
    const tx = await db.transaction('anotacao', 'readwrite');
    const store = await tx.objectStore('anotacao');
    try {
        await store.delete(titulo);
        buscarTodasAnotacoes()
        console.log('Anotação deletada com sucesso!');
    } catch (error) {
        console.error('Erro ao deletar anotação:', error);
        tx.abort();
    }
}

async function alterarAnot(titulo){
    const tx = await db.transaction('anotacao', 'readwrite');
    const store = await tx.objectStore('anotacao');
    const altanotacao = await store.get(titulo)
    const Alteracategoria = document.getElementById("Alteracategoria").value
    const Alteradescricao = document.getElementById("Alteradescricao").value
    const Alteradata = document.getElementById("Alteradata").value

    altanotacao.categoria =  Alteracategoria
    altanotacao.data = Alteradata
    altanotacao.descricao = Alteradescricao

    await store.put(altanotacao)
    await tx.done
}

function alteracao(titulo, anotacoes) {
    const anotacaoAltera = anotacoes.find(param => param.titulo === titulo)
    let div = document.createElement('div')
    div.innerHTML = `
    
    <input type="text" id="Alteracategoria" placeholder="Categoria" value="${anotacaoAltera.categoria}">
    <textarea id="Alteradescricao" cols="30" rows="10" placeholder="Descrição" value="${anotacaoAltera.descricao}"></textarea>
    <input type="date" id="Alteradata" value="${anotacaoAltera.data}"/>
    <button id="btnAlteracao">Alterar</button>
    `
    const btndaAlteracao = div.querySelector('#btnAlteracao')
    btndaAlteracao.addEventListener('click', () => alterarAnot(titulo))
    document.getElementById('resultados').appendChild(div)
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


