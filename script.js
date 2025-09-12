const pokemonName = document.querySelector('.pokemon-name');
const pokemonNumber = document.querySelector('.pokemon-number');
const pokemonImage = document.querySelector('.pokemon__image');
const pokemonType = document.querySelector('.pokemon-type');
const pokemonCategory = document.querySelector('.pokemon-category');
const pokemonWeight = document.querySelector('.pokemon-weight');

const form = document.querySelector('.search-form');
const input = document.querySelector('.search-input');
const buttonPrev = document.querySelector('.button-prev');
const buttonNext = document.querySelector('.button-next');

let searchPokemon = 1;
const API_BASE = 'https://pokeapi.co/api/v2';
const errorImg = './error-404.png';


const fetchPokemon = async (pokemon) => {
    try {
        const APIResponse = await fetch(`${API_BASE}/pokemon/${pokemon.toString().toLowerCase()}`);
        if (APIResponse.status === 200) {
            return await APIResponse.json();
        }
    } catch (error) {}
    return null;
};

const fetchCategory = async (speciesUrl) => {
    try {
        const response = await fetch(`${API_BASE}/pokemon-species/${speciesUrl.split('/').slice(-2, -1)}`);
        if (response.status === 200) {
            const data = await response.json();
            const genusObj = data.genera.find(g => g.language.name === "en");
            return genusObj ? genusObj.genus : "Unknown Category";
        }
    } catch (e) {}
    return "Unknown Category";
};
const fetchType = async (typeUrl) => {
    try {
        const typeId = typeUrl.split('/').slice(-2, -1);
        const response = await fetch(`${API_BASE}/type/${typeId}`);
        if (response.status === 200) {
            const data = await response.json();
            return data.names.find(n => n.language.name === "en")?.name || "Unknown Type";
        }
    } catch (e) {}
    return "Unknown Type";
};


const renderPokemon = async (pokemon) => {
    pokemonName.textContent = 'Loading...';
    pokemonNumber.textContent = '';
    pokemonType.textContent = '';
    pokemonCategory.textContent = '';
    pokemonImage.src = '';
    pokemonImage.alt = '';
    pokemonWeight.textContent = '';
    const data = await fetchPokemon(pokemon);

    if (data) {
        pokemonName.textContent = data.name;
        pokemonNumber.textContent = data.id;
        let sprite = (
            data.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default
            || data.sprites?.front_default
            || errorImg
        );
        pokemonImage.src = sprite;
        pokemonImage.alt = data.name;
        searchPokemon = data.id;

        if (data.types && data.types.length > 0) {
            const typePromises = data.types.map(async t => {
            const typeName = await fetchType(t.type.url);
            return typeName;
            });
            const allTypes = await Promise.all(typePromises);
            pokemonType.textContent = `Type: ${allTypes.join(' / ')}`;
        } else {
            pokemonType.textContent = "Type: Unknown";
        }
        const category = await fetchCategory(data.species.url);
        pokemonCategory.textContent = `Category: ${category}`;
        const weightKg = data.weight / 10; 
        pokemonWeight.textContent = `Weight: ${weightKg} kg`;

    } else {
        pokemonNumber.textContent = '';
        pokemonName.textContent = 'Error 404 - Not Found';
        pokemonType.textContent = '';
        pokemonCategory.textContent = '';
        pokemonWeight.textContent = '';
        pokemonImage.src = errorImg;
        pokemonImage.alt = 'Not found';
    }
    input.value = '';
};

form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderPokemon(input.value.trim());
});
buttonPrev.addEventListener('click', () => {
    if (searchPokemon > 1) {
        searchPokemon -= 1;
        renderPokemon(searchPokemon);
    }
});
buttonNext.addEventListener('click', () => {
    searchPokemon += 1;
    renderPokemon(searchPokemon);
});
document.addEventListener('keydown', (e) => {
    if (e.key === "ArrowLeft") buttonPrev.click();
    if (e.key === "ArrowRight") buttonNext.click();
});
renderPokemon(searchPokemon);