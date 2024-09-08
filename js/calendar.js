const apiUrl = 'https://api.franime.fr/api/calendrier_data'; // URL de l'API 

          // Fonction pour afficher les animes triés par jour de la semaine
          async function fetchAnimes() {
            try {
              const response = await fetch(apiUrl);
              const data = await response.json();

              if (data.success && Array.isArray(data.data)) {
                const buttonsContainer = document.getElementById('buttonsContainer');
                const animeContainer = document.getElementById('animeContainer');
                animeContainer.innerHTML = ''; // Effacer les anciens résultats

                // Boutton pour chaques jours de la semaine
                const daysOfWeek = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
                daysOfWeek.forEach(day => {
                  const button = document.createElement('button');
                  button.classList.add('day-button');
                  button.textContent = capitalizeFirstLetter(day);
                  button.addEventListener('click', () => {
                    // Supprimer la classe active de tous les boutons
                    const buttons = document.querySelectorAll('.day-button');
                    buttons.forEach(btn => btn.classList.remove('active'));
                    // Ajouter la classe active au bouton cliqué
                    button.classList.add('active');
                    displayAnimesByDay(day);
                  });
                  buttonsContainer.appendChild(button);
                });

                // Organiser les animes par jour
                const animeByDay = {};
                daysOfWeek.forEach(day => {
                  animeByDay[day] = [];
                });

                data.data.forEach(anime => {
                  if (animeByDay[anime.jour]) {
                    animeByDay[anime.jour].push(anime);
                  }
                });

                // Trier les animes par heure et minute pour chaque jour
                Object.keys(animeByDay).forEach(day => {
                  animeByDay[day].sort((a, b) => {
                    const timeA = parseInt(a.heures) * 60 + parseInt(a.minutes);
                    const timeB = parseInt(b.heures) * 60 + parseInt(b.minutes);
                    return timeA - timeB;
                  });

                  // Classer pour chaque jours
                  animeByDay[day].forEach(anime => {
                    createAnimeCard(anime, animeContainer, day);
                  });
                });

                // Ajouter la classe active au bouton du jour actuel
                const today = getTodayDay();
                const buttons = document.querySelectorAll('.day-button');
                buttons.forEach(button => {
                  if (button.textContent.toLowerCase() === today) {
                    button.classList.add('active');
                    displayAnimesByDay(today); // Appeler la fonction pour afficher les cartes
                  }
                });

              } else {
                console.error('Structure inattendue des données de l\'API');
              }

            } catch (error) {
              console.error('Erreur lors du chargement des animes :', error);
            }
          }

          // Fonction pour creer une carte avec l'api
          function createAnimeCard(anime, container, day) {
            const animeCard = document.createElement('div');
            animeCard.classList.add('anime-card');
            animeCard.dataset.day = day;

            // Image d'affiche
            const img = document.createElement('img');
            img.src = anime.affiche;
            animeCard.appendChild(img);

            // Infos de l'anime
            const animeDetails = document.createElement('div');
            animeDetails.classList.add('anime-details');

            // Titre de l'anime
            const title = document.createElement('div');
            title.classList.add('anime-title');
            title.textContent = anime.title_anime;
            animeDetails.appendChild(title);

            // Titre
            const lang = document.createElement('div');
            lang.classList.add('anime-lang');
            lang.textContent = anime.lang.toUpperCase();
            animeDetails.appendChild(lang);

            // Heure de sortie
            const date = document.createElement('div');
            date.classList.add('anime-date');
            date.textContent = `Heure: ${anime.heures}h${anime.minutes}`;
            animeDetails.appendChild(date);

            // Vérifier si l'heure actuelle correspond à l'heure de l'anime
            const currentTime = new Date();
            const currentHour = currentTime.getHours();
            if (currentHour === parseInt(anime.heures)) {
              animeCard.classList.add('highlight');
            }

            animeCard.appendChild(animeDetails);
            container.appendChild(animeCard);

            // URL
            const link = document.createElement('a');
            link.href = anime.url_access_anime_page;
            link.classList.add('anime-link')
            link.textContent = ('Voir plus');
            animeDetails.appendChild(link);

            // Redirection vers le lien lors du clic sur la carte
            animeCard.addEventListener('click', () => {
              window.location.href = link.href;
            });
          }

          // Trier les cartes par jours
          function displayAnimesByDay(day) {
            const cards = document.querySelectorAll('.anime-card');
            const container = document.querySelector('.anime-container');

            cards.forEach(card => {
              card.classList.add('hidden');
              card.classList.remove('show');
            });

            // Delai sur L'affichage des cartes
            let delay = 0;
            cards.forEach((card, index) => {
              if (card.dataset.day === day) {
                card.classList.remove('hidden');
                setTimeout(() => card.classList.add('show'), delay);
                delay += 100; // + 0.1s animation
              }
            });
          }

          // Fonction jours de la semaine
          function getTodayDay() {
            const daysOfWeek = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
            const today = new Date().getDay();
            return daysOfWeek[(today + 6) % 7]; // Debut Lundi
          }

          // Fonction pour capitaliser la première lettre d'un mot
          function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
          }

          // Appeler la fonction pour récupérer les animes au chargement de la page
          fetchAnimes();
