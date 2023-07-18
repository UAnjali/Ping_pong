describe('Ping Pong Game', () => {
  beforeEach(() => {
    cy.visit('ping-pong-game-default-forked/index.html'); // Replace with the correct path to your game HTML file
  });

  it('should display the game elements correctly', () => {
    cy.get('#container').should('exist');
    cy.get('#ball').should('exist');
    cy.get('#rod1').should('exist');
    cy.get('#rod2').should('exist');
  });

  it('should start the game when Enter key is pressed', () => {
    cy.get('body').type('{enter}');
    cy.get('#ball').should('have.css', 'animation-play-state', 'running');
    cy.get('#rod1').should('have.css', 'left').and('not.be.empty');
    cy.get('#rod2').should('have.css', 'left').and('not.be.empty');
  });

  it('should move the rods when A and D keys are pressed', () => {
    cy.get('body').type('a');
    cy.window().then((win) => {
      const initialLeft = win.getComputedStyle(win.document.getElementById('rod1')).getPropertyValue('left');
      cy.get('body').type('d');
      cy.window().then((win) => {
        const newLeft = win.getComputedStyle(win.document.getElementById('rod1')).getPropertyValue('left');
        expect(parseFloat(newLeft)).to.be.greaterThan(parseFloat(initialLeft));
      });
    });
  });

  it('should handle ball collision with rod1', () => {
    cy.get('body').type('{enter}');
    cy.get('#ball').should('have.css', 'animation-play-state', 'running');
    cy.window().then((win) => {
      const initialScore = win.score;
      cy.get('#rod1').then(($rod1) => {
        const rod1Rect = $rod1[0].getBoundingClientRect();
        cy.get('#ball').trigger('mousemove', {
          clientX: rod1Rect.left + rod1Rect.width / 2,
          clientY: rod1Rect.top,
        });
        cy.on('score', (score) => {
          expect(score).to.be.a('number').and.be.greaterThan(initialScore);
        });
      });
    });
  });
  

  it('should handle ball collision with rod2', () => {
    cy.get('body').type('{enter}');
    cy.get('#ball').should('have.css', 'animation-play-state', 'running');
    cy.window().then((win) => {
      const initialScore = win.score;
      cy.get('#rod2').then(($rod2) => {
        const rod2Rect = $rod2[0].getBoundingClientRect();
        cy.get('#ball').trigger('mousemove', {
          clientX: rod2Rect.left + rod2Rect.width / 2,
          clientY: rod2Rect.top + rod2Rect.height,
        });
        cy.on('score', (score) => {
          expect(score).to.be.greaterThan(initialScore);
        });
      });
    });
  });

  it('should end the game and display winner when a player loses', () => {
    cy.get('body').type('{enter}');
    cy.get('#ball').should('have.css', 'animation-play-state', 'running');
    cy.window().then((win) => {
      const initialScore = win.score;
      cy.get('#rod1').then(($rod1) => {
        const rod1Rect = $rod1[0].getBoundingClientRect();
        cy.get('#ball').trigger('mousemove', {
          clientX: rod1Rect.left - 10,
          clientY: rod1Rect.top,
        });
        cy.wait(500);
        cy.on('score', (score) => {
          if (score > initialScore) {
            cy.on('window:alert', (alertText) => {
              expect(alertText).to.include('wins');
              expect(alertText).to.include(win.rod2_name);
            });
            cy.get('#ball').should('have.css', 'animation-play-state', 'paused');
          }
        });
      });
    });
  });
  
  it('should reverse ball direction after hitting the side wall', () => {
    cy.get('body').type('{enter}');
    cy.get('#ball').should('have.css', 'animation-play-state', 'running');
    cy.window().then((win) => {
      const initialBallX = win.ballX;
      const initialBallY = win.ballY;
      cy.get('#ball').trigger('mousemove', {
        clientX: window.innerWidth - 10,
        clientY: initialBallY,
      });
      cy.on('ballX', (ballX) => {
        expect(ballX).to.be.lessThan(initialBallX);
      });
    });
  });
  // Add more test cases as needed to cover different aspects of the game logic
});
