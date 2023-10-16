import axios from 'axios';
import Notiflix from 'notiflix';

const API_KEY = '40082748-c036ae5fcdc09f757ab593e32';
const BASE_URL = 'https://pixabay.com/api/';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

let page = 1;
let searchQuery = '';
let currentHits = 0;

async function serviceGallery(searchQuery, page = 1) {
  const searchParams = new URLSearchParams({
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: 40,
    q: searchQuery,
    key: API_KEY,
    page,
  });
  const resp = await axios.get(`${BASE_URL}?${searchParams}`);
  return resp.data;
}

refs.form.addEventListener('submit', onSearch);

function onSearch(event) {
  event.preventDefault();
  searchQuery = event.currentTarget.searchQuery.value;
  page = 1;
  refs.gallery.innerHTML = '';
  if (searchQuery.trim() === '') {
    Notiflix.Notify.warning('Please enter a search query');
    return;
  }
  refs.loadMore.classList.replace('load-more', 'load-more-hidden');
  serviceGallery(searchQuery, page)
    .then(data => {
      if (data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      refs.gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));
      currentHits = data.hits.length;
      if (data.totalHits > 40) {
        refs.loadMore.classList.replace('load-more-hidden', 'load-more');
      } else {
        refs.loadMore.classList.replace('load-more', 'load-more-hidden');
      }
    })
    .catch(() =>
      Notiflix.Notify.failure('An error occurred while fetching images.')
    )
    .finally(() => refs.form.reset());
}

refs.loadMore.addEventListener('click', onLoadMore);

function onLoadMore({ target }) {
  page += 1;
  target.disabled = true;
  serviceGallery(searchQuery, page)
    .then(data => {
      currentHits += data.hits.length;
      refs.gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));
      if (currentHits > data.totalHits) {
        refs.loadMore.classList.replace('load-more', 'load-more-hidden');
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
    })
    .catch(err => console.log(err))
    .finally(() => (target.disabled = false));
}

function createMarkup(arr) {
  return arr
    .map(
      ({ webformatURL, tags, likes, views, comments, downloads }) => `
    <div class="photo-card">
  <img src="${webformatURL}" alt="${tags[0]}" loading="lazy" width="300" class="card-img">
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</div>
    `
    )
    .join('');
}
