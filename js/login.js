document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email-login');
    const passwordInput = document.getElementById('password-login') || document.getElementById('senha');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const btnGerarTeste = document.getElementById('btn-teste-login');
    const btnEntrar = document.getElementById('btn-entrar');
    const btnCadastrar = document.getElementById('cadastrar');

    function gerarCPFAleatorio() {
        const rand = n => Math.floor(Math.random() * n);
        const numeros = Array.from({ length: 9 }, () => rand(10));

        let d1 = numeros.reduce((total, numero, indice) => total + numero * (10 - indice), 0) % 11;
        d1 = d1 < 2 ? 0 : 11 - d1;

        let d2 = [...numeros, d1].reduce((total, numero, indice) => total + numero * (11 - indice), 0) % 11;
        d2 = d2 < 2 ? 0 : 11 - d2;

        return [...numeros, d1, d2].join('').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    if (btnGerarTeste) {
        btnGerarTeste.addEventListener('click', event => {
            event.preventDefault();

            const emailsExemplo = [
                'zumbi.palmares@afroedu.com',
                'dandara.alves@afroedu.com',
                'machado.assis@afroedu.com',
                'carolina.jesus@afroedu.com'
            ];

            if (emailInput) {
                const usarCPF = Math.random() > 0.5;
                emailInput.value = usarCPF
                    ? gerarCPFAleatorio()
                    : emailsExemplo[Math.floor(Math.random() * emailsExemplo.length)];
            }

            if (passwordInput) passwordInput.value = 'SenhaSegura123!';
        });
    }

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', event => {
            event.preventDefault();
            const mostrar = passwordInput.type === 'password';
            passwordInput.type = mostrar ? 'text' : 'password';
            togglePasswordBtn.textContent = mostrar ? '🙈' : '👁️';
            togglePasswordBtn.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', event => {
            event.preventDefault();

            const usuario = emailInput ? emailInput.value.trim() : '';
            const senha = passwordInput ? passwordInput.value.trim() : '';

            if (!usuario || !senha) {
                alert('Por favor, preencha todos os campos obrigatórios para entrar.');
                return;
            }

            if (btnEntrar) {
                btnEntrar.textContent = 'Conectando ao AfroEdu...';
                btnEntrar.style.opacity = '0.7';
                btnEntrar.disabled = true;
            }

            setTimeout(() => {
                alert('Login efetuado com sucesso! Redirecionando...');
                window.location.href = 'catalogo.html';
            }, 1200);
        });
    }

    if (btnCadastrar) {
        btnCadastrar.addEventListener('click', event => {
            event.preventDefault();
            alert('Redirecionando para a página de cadastro...');
        });
    }
});
