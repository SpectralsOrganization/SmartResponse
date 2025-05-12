// const emailBodyValue = document.querySelector('.Am.Al.editable').innerText;
    function generateButton() {
        console.log('Ajout du bouton...');

        const sendButton = document.querySelector('div.T-I.J-J5-Ji.aoO.v7');

        // Vérifier si le bouton "Envoyer" existe déjà
        const existingButton = document.querySelector('#corrigezFrançaisButton');
        if (existingButton) {
            return; 
        }

        if (sendButton) {
            const newButton = document.createElement('button');
            newButton.id = 'templateSelectionButton'; 
            newButton.textContent = 'Liste template';

            newButton.addEventListener('click', async () => {
                console.log("Button smartrepspond clicked");
            })

            sendButton.parentNode.insertBefore(newButton, sendButton.nextSibling);
        } else {
            console.log('Le bouton "Envoyer" n\'a pas été trouvé.');
        }
    }

    const observer = new MutationObserver(() => {
        generateButton();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.onload = () => {
        generateButton();
    };
