'use strict';

//script before refactoring and use the updated project architecture.
// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//building a project (thinking - taking a decision - problem solving)
//1-User stories
//2-Features (are created based on user stories)
//3-Flow Chart (are created based on features , and how different features interact with each other)
//4-Architecture
//5-Development step

//Geolocation is browser API like internationalization , timers and another APIS
let mapEvent;
let map;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      alert('Geolocation API is allowed');
      console.log(position);
      //   const latitude = position.coords.latitude;
      const { latitude } = position.coords;
      //   const longitude = position.coords.longitude;
      const { longitude } = position.coords;
      console.log(latitude, longitude);
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
      const coords = [latitude, longitude];

      //L is the name space of leaflet API
      //L is a global variable in leaflet script that we can use at any script.
      //if a variable is global in one script , it will be accessibile in all scripts !!
      //the
      map = L.map('map').setView(coords, 13);

      //openstreetmap is open source map
      //   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      //     attribution:
      //       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      //   }).addTo(map);

      //google maps
      L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      L.marker(coords).addTo(map).bindPopup('My Home').openPopup();

      //Clicking on map
      map.on('click', function (mapE) {
        console.log('Map Click Event');
        //show form
        mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
      });
    },
    function () {
      alert('Geolocation API is blocked');
    }
  );
}

//if we don't have a submit button , the enter key also fires submit event !

form.addEventListener('submit', function (e) {
  console.log('Submit event listener');
  e.preventDefault();
  console.log(mapEvent);
  //object destructuring
  const { lat: clickedLatitude, lng: clickedLongitude } = mapEvent.latlng;
  console.log(clickedLatitude, clickedLongitude);

  // L.marker([clickedLatitude, clickedLongitude])
  //   .addTo(map)
  //   .bindPopup('WorkOut')
  //   .openPopup();

  L.marker([clickedLatitude, clickedLongitude])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('Workout')
    .openPopup();

  //Clear input fields after submitting
  inputDistance.value =
    inputCadence.value =
    inputDuration.value =
    inputElevation.value =
      '';
});

//toggle betweem elevation and cadence
inputType.addEventListener('change', function () {
  console.log('Toggling is called');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});

//leflet library (to load google maps inside website)
