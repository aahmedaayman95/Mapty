'use strict';

//script before refactoring and use the updated project architecture.
// prettier-ignore

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
// let mapEvent;
// let map;
class Workout {
  date = new Date();
  //here we create unique ids using the time, but other applications need different libraries to create unique ids
  id = (Date.now() + '').slice(-10);
  clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords; //[lat , lang]
    this.distance = distance; //in km
    this.duration = duration; // in hours
  }

  _setDescription() {
    //prettier-ignore
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${
      this.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
    }${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//test classes
// const run1 = new Running([30, 30], 5, 5, 5);
// console.log(run1);
// const cyc1 = new Cycling([30, 30], 5, 5, 5);
// console.log(cyc1);

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoomLevel = 13;
  //constructor will containts the methods that will be called once app is started or initizalied
  //constructor will also contain event listeners for this class.
  constructor() {
    //get current position and load the map
    this._getPosition();

    //get data from local storage
    this._getLocalStorage();
    //event for submitting for
    form.addEventListener('submit', this._newWorkout.bind(this));

    //toggle betweem elevation and cadence
    inputType.addEventListener('change', this._toggleElevationField);

    //to hide form if we clicked on wrong location
    form.addEventListener('keydown', this._escapeForm.bind(this));

    //when click on list , move to workout location on map
    containerWorkouts.addEventListener('click', this._moveToWorkout.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      //we put the call back fucntion in case of sucess in a seperate function (loadMap)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Geolocation API is blocked');
        }
      );
    }
  }

  _loadMap(position) {
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
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    //openstreetmap is open source map
    //   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     attribution:
    //       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //   }).addTo(map);

    //google maps
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);

    L.marker(coords).addTo(this.#map).bindPopup('My Home').openPopup();

    //Clicking on map
    this.#map.on('click', this._showForm.bind(this));

    //rendering workouts on map from local storage
    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }
  _showForm(mapE) {
    console.log('Map Click Event');
    //show form
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    console.log('Toggling is called');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    console.log('Submit event listener');
    e.preventDefault();
    const validateInput = function (...inputs) {
      return inputs.every(input => Number.isFinite(input));
    };

    const allPositiveNumebrs = (...inputs) => inputs.every(input => input > 0);

    //get data from the form
    let cadence, elevationGain, workout;
    const { lat: clickedLatitude, lng: clickedLongitude } =
      this.#mapEvent.latlng;
    const type = inputType.value;

    //we use + to convert string to number
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    //validate data from form
    if (type === 'running') {
      cadence = +inputCadence.value;
      if (
        !validateInput(distance, duration, cadence) ||
        !allPositiveNumebrs(distance, duration, cadence)
      ) {
        alert('Please enter valid numbers');
        return;
      }
      workout = new Running(
        [clickedLatitude, clickedLongitude],
        distance,
        duration,
        cadence
      );
      console.log(workout);
    }
    if (type === 'cycling') {
      elevationGain = +inputElevation.value;
      if (
        !validateInput(distance, duration, elevationGain) ||
        !allPositiveNumebrs(distance, duration)
      ) {
        alert('Please Enter Valide Numbers');
        return;
      }
      workout = new Cycling(
        [clickedLatitude, clickedLongitude],
        distance,
        duration,
        elevationGain
      );
      console.log(workout);
    }
    this.#workouts.push(workout);

    // console.log(type, distance, duration, cadence, elevationGain);

    console.log(this.#mapEvent);
    //object destructuring

    console.log(clickedLatitude, clickedLongitude);

    // L.marker([clickedLatitude, clickedLongitude])
    //   .addTo(map)
    //   .bindPopup('WorkOut')
    //   .openPopup();

    //Render Workout on map
    this._renderWorkoutMarker(workout);
    //Render workout list
    this._renderWorkout(workout);
    //Clear input fields after submitting
    this._hideForm();

    //Store workout on local storage
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    console.log('Render Workout method');
    console.log(workout);
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.description} `)
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
  `;

    if (workout.type === 'running')
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
      <div class="all-buttons">
      
      </div>  
    </li>
   
    `;

    if (workout.type === 'cycling')
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details final">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
      <div class="all-buttons">
      
      </div>
     
    </li>
    
    `;

    form.insertAdjacentHTML('afterend', html);
    // const buttons = `<button>Edit</button>`;
    // document.querySelector('.final').insertAdjacentElement('afterend', buttons);
  }

  _hideForm() {
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);

    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }

  _escapeForm(e) {
    console.log(e);
    if (e.key === 'Escape') {
      form.classList.add('hidden');
      inputDistance.value =
        inputCadence.value =
        inputDuration.value =
        inputElevation.value =
          '';
    }
  }

  _moveToWorkout(e) {
    // console.log(e);
    // //this will be equal to e.currentTarget which is the parent element
    // //if we use bind , this will be the APP objects
    // console.log(this);
    // console.log(e.currentTarget);
    // console.log(e.target);
    const workoutEl = e.target.closest('.workout');
    console.log(workoutEl);
    //guard class
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      workout => workout.id === workoutEl.dataset.id
    );
    console.log(workout);

    //to move to workout location
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // workout.click();
  }
  //Store workout on local storage
  //JSON.stringify (convert from object or array of objects to one string)
  _setLocalStorage() {
    localStorage.setItem('Workouts', JSON.stringify(this.#workouts));
  }
  //get data from local storage
  //Json.parse (convert from string to an object or an array of objects)
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('Workouts'));
    console.log(data);
    //guard class
    if (!data) return;
    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
      //will not work here , because map not loaded yet
      // this._renderWorkoutMarker(work);
    });
  }

  //a function to clear locarstorage and reload website
  resetApp() {
    localStorage.clear();
    location.reload();
  }
}
console.log('Start Of App');
const app = new App();
setTimeout(() => console.log(this), 2000);

//----------Local Storage-----------//
//local storage is used to store small amount of bad
//if we stored alot of data , there will be blocking and performance will be bad

//----------Local Storage-----------//

// if (navigator.geolocation) {
//   navigator.geolocation.getCurrentPosition(
//     function (position) {
//       alert('Geolocation API is allowed');
//       console.log(position);
//       //   const latitude = position.coords.latitude;
//       const { latitude } = position.coords;
//       //   const longitude = position.coords.longitude;
//       const { longitude } = position.coords;
//       console.log(latitude, longitude);
//       console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
//       const coords = [latitude, longitude];

//       //L is the name space of leaflet API
//       //L is a global variable in leaflet script that we can use at any script.
//       //if a variable is global in one script , it will be accessibile in all scripts !!
//       //the
//       map = L.map('map').setView(coords, 13);

//       //openstreetmap is open source map
//       //   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       //     attribution:
//       //       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       //   }).addTo(map);

//       //google maps
//       L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
//         maxZoom: 20,
//         subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
//       }).addTo(map);

//       L.marker(coords).addTo(map).bindPopup('My Home').openPopup();

//       //Clicking on map
//       map.on('click', function (mapE) {
//         console.log('Map Click Event');
//         //show form
//         mapEvent = mapE;
//         form.classList.remove('hidden');
//         inputDistance.focus();
//       });
//     },
//     function () {
//       alert('Geolocation API is blocked');
//     }
//   );
// }

//if we don't have a submit button , the enter key also fires submit event !

// form.addEventListener('submit', function (e) {
//   console.log('Submit event listener');
//   e.preventDefault();
//   console.log(mapEvent);
//   //object destructuring
//   const { lat: clickedLatitude, lng: clickedLongitude } = mapEvent.latlng;
//   console.log(clickedLatitude, clickedLongitude);

//   // L.marker([clickedLatitude, clickedLongitude])
//   //   .addTo(map)
//   //   .bindPopup('WorkOut')
//   //   .openPopup();

//   L.marker([clickedLatitude, clickedLongitude])
//     .addTo(map)
//     .bindPopup(
//       L.popup({
//         maxWidth: 250,
//         minWidth: 100,
//         autoClose: false,
//         closeOnClick: false,
//         className: 'running-popup',
//       })
//     )
//     .setPopupContent('Workout')
//     .openPopup();

//   //Clear input fields after submitting
//   inputDistance.value =
//     inputCadence.value =
//     inputDuration.value =
//     inputElevation.value =
//       '';
// });

// //toggle betweem elevation and cadence
// inputType.addEventListener('change', function () {
//   console.log('Toggling is called');
//   inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
//   inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
// });

//leflet library (to load google maps inside website)
