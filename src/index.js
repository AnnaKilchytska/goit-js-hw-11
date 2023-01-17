import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import fetchPictures from './fetchPictures';

const formEl = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
loadMoreBtn.classList.add('is-hidden');
// console.log(formEl);
let page = 1;
let picturesAmount = 0;

formEl.addEventListener('submit', renderPictures);
loadMoreBtn.addEventListener('click', loadMorePictures);

const lightbox = new SimpleLightbox('.gallery a', {
  overlay: true,
  captions: true,
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

// const { height: cardHeight } = document
//   .querySelector('.gallery')
//   .firstElementChild.getBoundingClientRect();

// const something = gallery.getBoundingClientRect();

// console.log(something.height);

// window.scrollBy({
//   top: something.height * 2,
//   behavior: 'smooth',
// });

////// Promise syntax /////
// function renderPictures(e) {
//   e.preventDefault();
//   console.log(e);
//   console.log(formEl.elements[0].value);
//   fetchPictures(formEl.elements[0].value, page).then(
//     createInterfaceAfterFirstQuery
//   );
// }

////// async/await syntax ////////
async function renderPictures(e) {
  try {
    e.preventDefault();
    // console.log(formEl.elements[0].value);
    const pictures = await fetchPictures(formEl.elements[0].value, page);
    createInterfaceAfterFirstQuery(pictures);
    // console.log(pictures);
  } catch (error) {
    console.log(error);
  }
}

function createInterfaceAfterFirstQuery(data) {
  gallery.innerHTML = '';
  // console.log('pictures amount:', data.data.hits.length);
  picturesAmount = data.data.hits.length;
  // console.log('this is variable', picturesAmount);

  if (data.data.hits.length !== 0) {
    gallery.innerHTML = '';
    page = 1;
    const markup = createMarkup(data);
    gallery.insertAdjacentHTML('beforeend', markup);
    loadMoreBtn.classList.remove('is-hidden');
    page += 1;
    lightbox.refresh();
  } else {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function createMarkup(data) {
  const picturesArr = data.data.hits;
  const markup = picturesArr
    .map(item => {
      return `<a href="${item.largeImageURL}" class="photo-link"><div class="photo-card">
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
        </div></a>`;
    })
    .join('');
  return markup;
}

/////// Promises /////////
// function loadMorePictures() {
//   fetchPictures(formEl.elements[0].value, page)
//     .then(createMarkup)
//     .then(markup => {
//       gallery.insertAdjacentHTML('beforeend', markup);
//       console.log(page);
//       page += 1;
//     });
// }

///// async/await //////
async function loadMorePictures() {
  try {
    const pictures = await fetchPictures(formEl.elements[0].value, page);
    // console.log('pictures:', pictures);
    const markup = createMarkup(pictures);
    // console.log('this is pictures', pictures.data.hits.length);
    gallery.insertAdjacentHTML('beforeend', markup);
    // console.log(page);
    picturesAmount += pictures.data.hits.length;
    getNotification(picturesAmount);
    page += 1;
    lightbox.refresh();
  } catch (error) {
    console.log(error);
  }
}

function getNotification(number) {
  Notify.info(`Hooray! We found ${number} images.`);
}
