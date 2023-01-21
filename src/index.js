import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import fetchPictures from './fetchPictures';

const formEl = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
loadMoreBtn.classList.add('is-hidden');
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
  download: 'click here to download',
});

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
    page = 1;
    const pictures = await fetchPictures(formEl.elements[0].value, page);
    createInterfaceAfterFirstQuery(pictures);
    getNotification(pictures.data.totalHits);
    page += 1;
  } catch (error) {
    console.log(error);
  }
}

function createInterfaceAfterFirstQuery(data) {
  gallery.innerHTML = '';
  // console.log(page);
  picturesAmount = data.data.hits.length;
  console.log(picturesAmount);

  if (picturesAmount !== 0) {
    gallery.innerHTML = '';
    const markup = createMarkup(data);
    gallery.insertAdjacentHTML('beforeend', markup);
    loadMoreBtn.classList.remove('is-hidden');
    // console.log(page);
    lightbox.refresh();

    if (picturesAmount < 40) {
      loadMoreBtn.classList.add('is-hidden');
      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } else {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function createMarkup(data) {
  if (data) {
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
    picturesAmount += pictures.data.hits.length;
    if (picturesAmount <= pictures.data.totalHits) {
      // console.log(page);
      // const markup = createMarkup(pictures);
      gallery.insertAdjacentHTML('beforeend', markup);
      // console.log(picturesAmount);
      // console.log(pictures.data.totalHits);
      page += 1;
      // console.log(page);
      lightbox.refresh();
    } else {
      loadMoreBtn.classList.add('is-hidden');
      throw new Error();
    }
  } catch (error) {
    console.log(error);
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function getNotification(number) {
  Notify.info(`Hooray! We found ${number} images.`);
}

window.addEventListener('scroll', () => {
  // const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  // if (scrollTop + clientHeight >= scrollHeight) {
  //   loadMorePictures();
  // }

  if (
    window.innerHeight + window.pageYOffset >=
    document.body.offsetHeight - 100
  ) {
    loadMorePictures();
  }
});
