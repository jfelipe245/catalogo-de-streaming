document.addEventListener('DOMContentLoaded', () => {

    const links_saiba_mais = document.querySelectorAll('.Saiba-Mais a, .saiba-mais a');
    const botoes_Filtro = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');

    const Pesquisa = document.getElementById('pesquisa');
    const botao_Pesquisa = document.getElementById('botao-pesquisa');
    const container = document.getElementById('card-container');

    const STORAGE_KEY = 'meu_catalogo_educacional';
    const REMOVIDOS_KEY = 'catalogo_itens_removidos';

    let categoria_Atual = 'todos';


    // =========================================================
    // NORMALIZA TEXTO
    // =========================================================

    function Texto(texto) {
        return String(texto || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }


    // =========================================================
    // LOCALSTORAGE
    // =========================================================

    function lerStorage(chave) {
        try {
            const valor = localStorage.getItem(chave);

            if (!valor) {
                return [];
            }

            const dados = JSON.parse(valor);

            return Array.isArray(dados) ? dados : [];

        } catch (erro) {
            console.error(`Erro ao ler localStorage (${chave}):`, erro);
            return [];
        }
    }


    function salvarStorage(chave, dados) {
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
            return true;

        } catch (erro) {
            console.error(`Erro ao salvar localStorage (${chave}):`, erro);
            return false;
        }
    }


    function obter_Favoritos() {
        return lerStorage(STORAGE_KEY);
    }


    function salvar_Favoritos(favoritos) {
        return salvarStorage(STORAGE_KEY, favoritos);
    }


    function obter_Removidos() {
        return lerStorage(REMOVIDOS_KEY);
    }


    function salvar_Removidos(removidos) {
        return salvarStorage(REMOVIDOS_KEY, removidos);
    }


    // =========================================================
    // DADOS DOS CARDS
    // =========================================================

    function obter_Titulo(card) {
        if (!card) {
            return 'Obra sem título';
        }

        const elemento = card.querySelector('.titulo');

        return elemento
            ? elemento.textContent.trim() || 'Obra sem título'
            : 'Obra sem título';
    }


    function obter_Autor(card) {
        if (!card) {
            return '';
        }

        const elemento = card.querySelector('.Autor');

        if (!elemento) {
            return '';
        }

        return elemento.textContent
            .replace(/Autor\/Diretor:/i, '')
            .trim();
    }


    // =========================================================
    // SAIBA MAIS
    // =========================================================

    links_saiba_mais.forEach(link => {

        link.addEventListener('click', event => {

            const card = link.closest('.card');

            if (!card) {
                return;
            }

            const titulo = obter_Titulo(card);
            const autor = obter_Autor(card);
            const destino = link.getAttribute('href');

            if (!destino || destino === '#') {
                return;
            }

            event.preventDefault();

            try {

                const url = new URL(destino, window.location.href);

                url.searchParams.set('titulo', titulo);

                if (autor) {
                    url.searchParams.set('autor', autor);
                }

                window.location.href = url.href;

            } catch (erro) {

                console.error(
                    'Erro ao abrir a página Saiba Mais:',
                    erro
                );

                window.location.href = destino;
            }
        });

    });


    // =========================================================
    // FILTRAR CARDS
    // =========================================================

    function atualizar_Cards() {

        const texto_Pesquisa = Pesquisa
            ? Texto(Pesquisa.value)
            : '';

        const itens_Removidos = obter_Removidos();

        let quantidadeVisivel = 0;


        cards.forEach(card => {

            const categoria = Texto(
                card.dataset.category ||
                card.getAttribute('data-category') ||
                ''
            );

            const titulo = Texto(
                obter_Titulo(card)
            );

            const autor = Texto(
                obter_Autor(card)
            );


            // Verifica a categoria
            const corresponde_Categoria =
                categoria_Atual === 'todos' ||
                categoria === Texto(categoria_Atual);


            // Verifica a pesquisa
            const corresponde_Pesquisa =
                !texto_Pesquisa ||
                titulo.includes(texto_Pesquisa) ||
                autor.includes(texto_Pesquisa);


            // Verifica se foi removido
            const foi_Removido =
                itens_Removidos.some(
                    item => Texto(item) === titulo
                );


            const deveMostrar =
                corresponde_Categoria &&
                corresponde_Pesquisa &&
                !foi_Removido;


            if (deveMostrar) {

                card.style.display = '';

                quantidadeVisivel++;

            } else {

                card.style.display = 'none';

            }

        });


        verificar_Resultado(quantidadeVisivel);
    }


    // =========================================================
    // MENSAGEM SEM RESULTADOS
    // =========================================================

    function verificar_Resultado(quantidadeVisivel) {

        if (!container) {
            return;
        }


        let mensagem =
            document.getElementById('mensagem-semresultados');


        if (!mensagem) {

            mensagem = document.createElement('p');

            mensagem.id = 'mensagem-semresultados';

            mensagem.style.gridColumn = '1 / -1';
            mensagem.style.textAlign = 'center';
            mensagem.style.padding = '40px';
            mensagem.style.color = '#9ca3af';
            mensagem.style.fontSize = '1.1rem';

            container.appendChild(mensagem);
        }


        if (quantidadeVisivel === 0) {

            mensagem.textContent =
                'Nenhum item encontrado com esses critérios.';

            mensagem.style.display = 'block';

        } else {

            mensagem.textContent = '';

            mensagem.style.display = 'none';
        }
    }


    // =========================================================
    // BOTÕES DO MENU
    // =========================================================

    botoes_Filtro.forEach(botao => {

        botao.addEventListener('click', event => {

            event.preventDefault();


            const filtro = Texto(
                botao.dataset.filter ||
                botao.getAttribute('data-filter') ||
                'todos'
            );


            // Remove o destaque dos outros botões
            botoes_Filtro.forEach(item => {
                item.classList.remove('active');
            });


            // Destaca o botão clicado
            botao.classList.add('active');


            // HOME
            if (filtro === 'home') {

                categoria_Atual = 'todos';

                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

                atualizar_Cards();

                return;
            }


            // CATÁLOGO
            if (filtro === 'catalogo') {

                categoria_Atual = 'todos';

                atualizar_Cards();

                if (container) {

                    container.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                }

                return;
            }


            // FILTROS DOS CARDS
            const filtrosPermitidos = [
                'todos',
                'livro',
                'filme',
                'documentario',
                'curta-metragem'
            ];


            if (filtrosPermitidos.includes(filtro)) {

                categoria_Atual = filtro;

                atualizar_Cards();

                return;
            }

            if (filtro === 'sobre-nosso-site') {

                alert(
                    'A seção "Sobre Nós" ainda não foi criada'
                );

                return;
            }

            if(filtro === 'sobre-mim'){

                alert('a secao sobre mim ainda nao foi criada');
                
                return;
            }

            if(filtro ==='agradecimento'){
                alert("agradecemos pela sua presenca espero que voce  goste");
                return;
            }
        });
    });


    // =========================================================
    // PESQUISA
    // =========================================================

    if (Pesquisa) {

        Pesquisa.addEventListener(
            'input',
            atualizar_Cards
        );


        Pesquisa.addEventListener(
            'keydown',
            event => {

                if (event.key === 'Enter') {

                    event.preventDefault();

                    atualizar_Cards();
                }

            }
        );

    }


    if (botao_Pesquisa) {

        botao_Pesquisa.addEventListener(
            'click',
            event => {

                event.preventDefault();

                atualizar_Cards();
            }
        );

    }


    // =========================================================
    // FAVORITOS
    // =========================================================

    function adicionar_Favorito(card) {

        const titulo = obter_Titulo(card);

        let favoritos = obter_Favoritos();


        if (favoritos.includes(titulo)) {

            alert(
                `"${titulo}" já está nos seus favoritos.`
            );

            return;
        }


        favoritos.push(titulo);


        if (salvar_Favoritos(favoritos)) {

            alert(
                `"${titulo}" foi adicionado aos seus favoritos! ❤️`
            );

        } else {

            alert(
                'Não foi possível salvar o favorito neste navegador.'
            );

        }

    }


    function remover_Favorito(card) {

        const titulo = obter_Titulo(card);

        let favoritos = obter_Favoritos();


        if (!favoritos.includes(titulo)) {

            alert(
                `"${titulo}" não está nos seus favoritos.`
            );

            return;
        }


        favoritos =
            favoritos.filter(item => item !== titulo);


        if (salvar_Favoritos(favoritos)) {

            alert(
                `"${titulo}" foi removido dos seus favoritos.`
            );

        } else {

            alert(
                'Não foi possível atualizar os favoritos neste navegador.'
            );

        }

    }


    // =========================================================
    // REMOVER DO CATÁLOGO
    // =========================================================

    function removerDoCatalogo(card) {

        const titulo = obter_Titulo(card);


        if (
            !confirm(
                `Tem certeza que deseja remover "${titulo}" do catálogo?`
            )
        ) {
            return;
        }


        const removidos = obter_Removidos();


        if (!removidos.includes(titulo)) {

            removidos.push(titulo);
        }


        if (salvar_Removidos(removidos)) {

            card.style.display = 'none';

            atualizar_Cards();

            alert(
                `"${titulo}" foi removido do catálogo.`
            );

        }

    }


    // =========================================================
    // ACESSAR OBRA
    // =========================================================

    function acessar_Obra(card) {

        const titulo = obter_Titulo(card);

        alert(
            `"${titulo}"\n\n` +
            'O botão está funcionando, mas esta obra ainda não possui um endereço de acesso cadastrado.'
        );

    }


    // =========================================================
    // BOTÕES DOS CARDS
    // =========================================================

    cards.forEach(card => {

        const botao_Adicionar =
            card.querySelector(
                '[class*="adicionar-catalogo"]'
            );


        const botao_Remover =
            card.querySelector(
                '[class*="remover-catalogo"]'
            );


        const botao_Acessar =
            card.querySelector(
                '[class*="ler-catalogo"], [class*="assistir-catalogo"]'
            );


        if (botao_Adicionar) {

            botao_Adicionar.addEventListener(
                'click',
                event => {

                    event.preventDefault();

                    adicionar_Favorito(card);

                }
            );

        }


        if (botao_Remover) {

            botao_Remover.addEventListener(
                'click',
                event => {

                    event.preventDefault();

                    remover_Favorito(card);

                }
            );

        }


        if (botao_Acessar) {

            botao_Acessar.addEventListener(
                'click',
                event => {

                    event.preventDefault();

                    acessar_Obra(card);

                }
            );

        }


        const botaoRemoverCatalogo =
            card.querySelector(
                '[class*="remover-do-catalogo"]'
            );


        if (botaoRemoverCatalogo) {

            botaoRemoverCatalogo.addEventListener(
                'click',
                event => {

                    event.preventDefault();

                    removerDoCatalogo(card);

                }
            );

        }

    });

    atualizar_Cards();

});