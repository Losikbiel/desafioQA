describe('Testes da Aplicação Login e Produtos', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5500/sistema/login.html');
  });

  // 1. Login com campos vazios (Caixa Preta)
  it('Login deve falhar com campos vazios', () => {
    cy.get('#btn-entrar').click();
    cy.get('div.alert-danger').should('be.visible').and('contain.text', 'Informe usuário e senha');
  });

  // 2. Login com dados incorretos (Caixa Preta)
  it('Login deve falhar com dados incorretos', () => {
    cy.get('#email').type('teste@teste.com');
    cy.get('#senha').type('123456');
    cy.get('#btn-entrar').click();
    cy.get('div.alert-danger').should('be.visible').and('contain.text', 'E-mail ou senha inválidos');
  });

  // 3. Login com dados corretos (Funcional)
  it('Login deve passar com dados corretos', () => {
    cy.get('#email').type('admin@admin.com');
    cy.get('#senha').type('admin@123');
    cy.get('#btn-entrar').click();
    cy.url().should('include', 'produtos.html');
  });

  // Setup para testes de produtos - após login
  context('Testes da tela de produtos', () => {
    beforeEach(() => {
      cy.visit('http://127.0.0.1:5500/sistema/login.html');
      cy.get('#email').type('admin@admin.com');
      cy.get('#senha').type('admin@123');
      cy.get('#btn-entrar').click();
    });

    // 4. Abrir modal e clicar em "Sair" (Usabilidade)
    it('Deve abrir modal e fechar clicando em "Sair"', () => {
      cy.get('#btn-adicionar').click();
      cy.get('#cadastro-produto').should('be.visible');
      cy.get('#btn-sair').click();
      cy.get('#cadastro-produto').should('not.be.visible');
      // Também verifica se os campos foram limpos
      cy.get('#codigo').should('have.value', '');
      cy.get('#nome').should('have.value', '');
    });

    // 5. Salvar produto com campos vazios (Caixa Preta)
    it('Deve mostrar alerta ao tentar salvar produto com campos vazios', () => {
      cy.get('#btn-adicionar').click();
      cy.get('#btn-salvar').click();
      cy.get('div.alert-danger').should('be.visible').and('contain.text', 'Todos os campos são obrigatórios');
    });

    // 6. Cadastrar produto com todos os dados válidos (Funcional)
    it('Deve cadastrar produto corretamente com todos os dados válidos', () => {
      cy.get('#btn-adicionar').click();
      cy.get('#codigo').type('P001');
      cy.get('#nome').type('Produto Teste');
      cy.get('#quantidade').type('10');
      cy.get('#valor').type('150');
      cy.get('#data').type('2025-06-28');
      cy.get('#btn-salvar').click();

      // Verifica se o produto foi adicionado na tabela
      cy.get('table tbody tr').should('contain.text', 'P001');
      cy.get('table tbody tr').should('contain.text', 'Produto Teste');
    });

    // 7. Inserir quantidade negativa (Limite - esperado bug)
    it('Deve aceitar quantidade negativa (BUG)', () => {
      cy.get('#btn-adicionar').click();
      cy.get('#codigo').type('P002');
      cy.get('#nome').type('Produto Negativo');
      cy.get('#quantidade').type('-10');
      cy.get('#valor').type('50');
      cy.get('#data').type('2025-06-28');
      cy.get('#btn-salvar').click();

      // Produto é aceito, mesmo com valor inválido
      cy.get('table tbody tr').should('contain.text', '-10');
    });

    // 8. Testar nome muito longo (Limite)
    it('Deve aceitar nome muito longo', () => {
      const nomeLongo = 'Produto'.repeat(30);
      cy.get('#btn-adicionar').click();
      cy.get('#codigo').type('P003');
      cy.get('#nome').type(nomeLongo);
      cy.get('#quantidade').type('5');
      cy.get('#valor').type('75');
      cy.get('#data').type('2025-06-28');
      cy.get('#btn-salvar').click();

      cy.get('table tbody tr').should('contain.text', nomeLongo);
    });

    // 9. Testar fluxo completo de cadastro (Funcional)
    it('Deve permitir cadastro completo de vários produtos', () => {
      for(let i=4; i<=5; i++){
        cy.get('#btn-adicionar').click();
        cy.get('#codigo').type(`P00${i}`);
        cy.get('#nome').type(`Produto ${i}`);
        cy.get('#quantidade').type(`${i*2}`);
        cy.get('#valor').type(`${i*100}`);
        cy.get('#data').type('2025-06-28');
        cy.get('#btn-salvar').click();
      }
      cy.get('table tbody tr').should('have.length.at.least', 2);
    });

    // 10. Testar responsividade simples (Interface)
    it('Deve ajustar layout em tela pequena', () => {
      cy.viewport(320, 480); // Tamanho de celular
      cy.get('nav.navbar').should('be.visible');
      cy.get('#btn-adicionar').should('be.visible');
    });
  });
});