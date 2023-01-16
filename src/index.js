import { Notify } from 'notiflix/build/notiflix-notify-aio';
import fetchPictures from './fetchPictures';

const formEl = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
loadMoreBtn.classList.add('is-hidden');
// console.log(formEl);
let page = 1;

formEl.addEventListener('submit', renderPictures);
loadMoreBtn.addEventListener('click', loadMorePictures);

function renderPictures(e) {
  e.preventDefault();
  console.log(e);
  console.log(formEl.elements[0].value);
  fetchPictures(formEl.elements[0].value, page).then(
    createInterfaceAfterFirstQuery
  );
}

function createInterfaceAfterFirstQuery(data) {
  gallery.innerHTML = '';
  console.log(data.hits);

  if (data.hits.length !== 0) {
    gallery.innerHTML = '';
    page = 1;
    const markup = createMarkup(data);
    gallery.insertAdjacentHTML('beforeend', markup);
    loadMoreBtn.classList.remove('is-hidden');
    page += 1;
  } else {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function createMarkup(data) {
  const picturesArr = data.hits;
  const markup = picturesArr
    .map(item => {
      return `<div class="photo-card">
          <img class="card-image" src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
          <div class="info">
            <p class="info-item">
              <b>Likes: </b>${item.likes}
            </p>
            <p class="info-item">
              <b>Views: </b>${item.views}
            </p>
            <p class="info-item">
              <b>Comments: </b>${item.comments}
            </p>
            <p class="info-item">
              <b>Downloads: </b>${item.downloads}
            </p>
          </div>
        </div>`;
    })
    .join('');
  return markup;
}

function loadMorePictures() {
  fetchPictures(formEl.elements[0].value, page)
    .then(createMarkup)
    .then(markup => {
      gallery.insertAdjacentHTML('beforeend', markup);
      console.log(page);
      page += 1;
    });
}

// use async syntax
