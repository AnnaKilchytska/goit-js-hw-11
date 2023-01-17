const API_KEY = '32875343-08825ac1bb88acf5968fba766';
const BASE_URL = 'https://pixabay.com/api/';

//http request using async/await syntax
async function fetchPictures() {
  const data = await fetch(
    `${BASE_URL}?key=${API_KEY}&q=cat&image_type=photo&orientation=horizontal&safesearch=true`
  );
  const pictures = await data.json();
  return pictures;
}

// http request using Promises
// function fetchPictures(query, page) {
//   return fetch(
//     `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
//   ).then(response => response.json());
//   // .then(console.log);
// }

export default fetchPictures;
