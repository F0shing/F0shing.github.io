const apiUrl = '/api/franime.json'; // Path to your JSON file
let currentPage = 1; // Start with the first page
const itemsPerPage = 60; // Number of items per page
let animeData = []; // Store the fetched anime data

// Fetch and display animes with pagination and search filtering
async function fetchAnimes(page = 1, searchQuery = '') {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    animeData = data; // Store data for filtering

    if (data && Array.isArray(data)) {
      const animeContainer = document.getElementById('animeContainer');
      animeContainer.innerHTML = ''; // Clear previous content

      // Filter the data based on the search query
      const filteredData = data.filter(anime =>
        anime.titleO.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Get anime ratings for each anime
      const animeDataWithRatings = await Promise.all(filteredData.map(getAnimeRating));

      // Sort the filtered data by rating in descending order
      const sortedData = animeDataWithRatings.sort((a, b) => {
        const ratingA = a.averageRating ? (a.averageRating / 10).toFixed(1) : 0;
        const ratingB = b.averageRating ? (b.averageRating / 10).toFixed(1) : 0;
        return ratingB - ratingA;
      });

      // Calculate the range for the current page
      const start = (page - 1) * itemsPerPage;
      const end = page * itemsPerPage;

      // Get data for the current page
      const paginatedData = sortedData.slice(start, end);

      // Create anime cards for the current page
      await Promise.all(paginatedData.map(async (anime) => {
        createAnimeCard(anime, animeContainer);
      }));

      // Add pagination controls
      createPaginationControls(sortedData.length, page);
    } else {
      console.error('Unexpected API data structure');
    }
  } catch (error) {
    console.error('Error fetching animes:', error);
  }
}

function handleSearch(event) {
  const searchQuery = event.target.value;
  fetchAnimes(1, searchQuery); // Fetch animes with the search query and reset to page 1
}


// Get anime rating from source URL
async function getAnimeRating(anime) {
  try {
    const response = await fetch(anime.source_url);
    const data = await response.json();
    anime.averageRating = data.data.attributes.averageRating;
    return anime;
  } catch (error) {
    console.error(`Error fetching rating for ${anime.titleO}:, error`);
    return anime;
  }
}

// Create anime card
function createAnimeCard(anime, container) {
  const img = new Image();
  img.src = anime.affiche;

  img.onload = function () {
    const animeCard = document.createElement('div');
    animeCard.classList.add('anime-card');

    // Create image, title, and other details
    animeCard.appendChild(img);

    const title = document.createElement('div');
    title.classList.add('anime-title');
    title.textContent = anime.titleO;
    animeCard.appendChild(title);

    // Add rating
    if (anime.averageRating) {
      const rating = document.createElement('div');
      rating.classList.add('anime-rating');
      const ratingValue = (anime.averageRating / 10).toFixed(1); // Convert rating to /10 and round to 1 decimal place
      rating.textContent = (`Rating: ${ratingValue}/10`);
      animeCard.appendChild(rating);
    }

    container.appendChild(animeCard);
  };

  img.onerror = function () {
    console.error(`Error loading image for ${anime.titleO}`);
  };
}

// Create pagination controls
function createPaginationControls(totalItems, currentPage) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationContainer = document.getElementById('paginationContainer');
  paginationContainer.innerHTML = ''; // Clear previous pagination

  // Create pagination buttons
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.classList.add('page-button');
    if (i === currentPage) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => fetchAnimes(i));
    paginationContainer.appendChild(button);
  }
}

// Fetch animes on page load
fetchAnimes(currentPage);