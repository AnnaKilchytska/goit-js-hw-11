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
let totalPages = 0;

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

const options = {
  root: null,
  rootMargin: '100px',
  threshold: 1.0,
};
let callback = (entries, observer) => {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      page += 1;

      const pictures = await fetchPictures(formEl.elements[0].value, page);

      const markup = createMarkup(pictures);
      gallery.insertAdjacentHTML('beforeend', markup);

      if (page < totalPages) {
        const item = document.querySelector('.photo-link:last-child');
        observer.observe(item);
        lightbox.refresh();
      }
    }
  });
};
let observer = new IntersectionObserver(callback, options);

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
    const query = formEl.elements[0].value.trim();
    if (query !== '' && query !== ' ') {
      page = 1;
      const pictures = await fetchPictures(query, page);
      createInterfaceAfterFirstQuery(pictures);

      page += 1;
    }
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
    // loadMoreBtn.classList.remove('is-hidden');

    totalPages = Math.ceil(data.data.total / 40);
    if (page < totalPages) {
      const item = document.querySelector('.photo-link:last-child');

      observer.observe(item);
    }
    // console.log(page);
    getNotification(data.data.totalHits);
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
    loadMoreBtn.classList.add('is-hidden');
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
    // console.log(page);
    const markup = createMarkup(pictures);
    gallery.insertAdjacentHTML('beforeend', markup);
    // console.log(picturesAmount);
    // console.log(pictures.data.totalHits);
    page += 1;
    // console.log(page);
    lightbox.refresh();

    //// smooth scrolling ///////
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    if (
      pictures.data.hits.length < 40 ||
      picturesAmount >= pictures.data.totalHits
    ) {
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

// так делать не надо //////
// window.addEventListener('scroll', () => {
//   // const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
//   // if (scrollTop + clientHeight >= scrollHeight) {
//   //   loadMorePictures();
//   // }

//   if (
//     window.innerHeight + window.pageYOffset >
//     document.body.offsetHeight - 100
//   ) {
//     console.log('Scroll!');
//     console.log(window.innerHeight);
//     console.log(window.pageYOffset);
//     console.log(document.body.offsetHeight - 100);

//     loadMorePictures();
//   }
// });
