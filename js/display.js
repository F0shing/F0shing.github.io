const maxId = 14269;
const apiUrlTemplate = 'https://kitsu.io/api/edge/anime/{id}';
const genresUrlTemplate = 'https://kitsu.io/api/edge/anime/{id}/genres';
const animeGrid = document.getElementById('anime-grid');
const pagination = document.getElementById('pagination');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const pageNumberSpan = document.getElementById('page-number');
const pageInput = document.getElementById('page-input');

pageInput.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
  }
});

let currentPage = 1;
let itemsPerPage = 25; // 5 x 5 images per page

function loadAnimePage(page) {
  animeGrid.innerHTML = ''; // Clear the grid
  const startIndex = (page - 1) * itemsPerPage + 1;
  const endIndex = startIndex + itemsPerPage - 1;
  let animeDataList = [];

  // Fetch all anime data for the current page
  const fetchPromises = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const apiUrl = apiUrlTemplate.replace('{id}', i);
    const fetchPromise = fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.data) {
          const imageUrl = data.data.attributes.posterImage.original;
          const animeName = data.data.attributes.canonicalTitle;
          const averageRating = data.data.attributes.averageRating || 0; // Handle cases with no rating
          const youtubeVideoId = data.data.attributes.youtubeVideoId; // Fetch YouTube video ID

          // Fetch genres
          const genresUrl = genresUrlTemplate.replace('{id}', i);
          return fetch(genresUrl)
            .then(response => response.json())
            .then(genresData => {
              const genres = genresData.data.map(genre => genre.attributes.name).join(', ') || 'Unknown';

              animeDataList.push({
                imageUrl,
                animeName,
                averageRating: parseFloat(averageRating), // Ensure rating is a number
                genres,
                youtubeVideoId, // Add YouTube video ID to the data list
              });
            });
        }
      })
      .catch(error => {
        console.error(`Error fetching anime ${i}:`, error);
      });

    fetchPromises.push(fetchPromise);
  }

  // After all data is fetched, sort it and render
  Promise.all(fetchPromises).then(() => {
    // Sort the animeDataList by rating in descending order
    animeDataList.sort((a, b) => b.averageRating - a.averageRating);

    // Render sorted anime data as cards
    animeDataList.forEach(anime => {
      const animeCard = document.createElement('div');
      animeCard.classList.add('anime-card');

      // Create YouTube link
      const youtubeLink = document.createElement('a');
      if (anime.youtubeVideoId) {
        youtubeLink.href = `https://www.youtube.com/watch?v=${anime.youtubeVideoId}`;
        youtubeLink.target = '_blank';
      }

      const animeImage = document.createElement('img');
      animeImage.src = anime.imageUrl;
      animeImage.alt = anime.animeName;

      const animeTitle = document.createElement('h3');
      animeTitle.textContent = anime.animeName;

      const animeGenres = document.createElement('p');
      animeGenres.textContent = `Genres: ${anime.genres}`;
      animeGenres.classList.add('anime-genres');

      const animeRating = document.createElement('p');
      animeRating.textContent = `Rating: ${anime.averageRating}`;
      animeRating.classList.add('anime-rating');

      // Append image to the link
      youtubeLink.appendChild(animeImage);

      animeCard.appendChild(youtubeLink);
      animeCard.appendChild(animeTitle);
      animeCard.appendChild(animeGenres);
      animeCard.appendChild(animeRating);

      animeGrid.appendChild(animeCard);
    });
  });
}

// Initial load
loadAnimePage(currentPage);

nextPageButton.addEventListener('click', () => {
  currentPage++;
  loadAnimePage(currentPage);
  updatePagination();
  updateUrl();
});

prevPageButton.addEventListener('click', () => {
  currentPage--;
  loadAnimePage(currentPage);
  updatePagination();
  updateUrl();
});

pageInput.addEventListener('change', () => {
  const newPage = parseInt(pageInput.value, 10);
  if (newPage >= 1 && newPage <= Math.ceil(maxId / itemsPerPage)) {
    currentPage = newPage;
    loadAnimePage(currentPage);
    updatePagination();
    updateUrl();
  } else {
    pageInput.value = currentPage; // Reset to current page if out of range
  }
});

function updatePagination() {
  const totalPages = Math.ceil(maxId / itemsPerPage);
  pageNumberSpan.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === totalPages;
  pageInput.value = currentPage;
}

function updateUrl() {
  const newUrl = `${window.location.pathname}?page=${currentPage}`;
  window.history.pushState({ path: newUrl }, '', newUrl);
}