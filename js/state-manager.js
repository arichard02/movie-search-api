/*
The state manager's job is to:
    (a) manage the application's data,
    (b) notify components when critical changes have happened, and
    (c) allow components to notify it that data has changed.
    */

import Database from "./database.js";

export default class StateManager {
  constructor() {
    // initialize the data store.
    // This is our state. When anything changes
    // with any of these variables, we need to
    // notify out components:
    this.movies = [];
    this.searchResults = [];
    this.favorites = [];
    this.subscribers = [];
    this.searchMode = true;
    this.showNotes = false;
    this.database = new Database();
    this.loadFavorites();

    // Liztening so that any time a "like-requested" event happens, it
    // will call the 'saveMovieToFavorites" method.

    this.subscribe("like-requested", this.saveMovieToFavorites.bind(this));
    this.subscribe("movie-found", this.setSearchResults.bind(this));
    this.subscribe("favorites-loaded", this.setFavorites.bind(this));
    this.subscribe("show-notes", this.toggleNotes.bind(this));
    this.subscribe("save-requested", this.saveMovieToFavorites.bind(this));
  }

  setSearchResults(movieDataList) {
    this.searchResults = movieDataList;
    this.movies = this.searchResults;
  }

  setFavorites(movieDataList) {
    this.favorites = movieDataList;
    this.movies = this.favorites;
  }

  toggleNotes(val) {
    this.showNotes = val;
    this.notify("redraw", this.movies);
  }

  // A method to read a user's favorites from IndexedDB  when the page first loads.
  loadFavorites() {
    // reads from IndexDB and stores the
    // data to "this.favorites." Then,
    // notifies any interested componenets.
    const callbackFunction = function (movieDataList) {
      this.notify("favorites-loaded", movieDataList);
    };
    // invoke the getAll function
    // going to load all the records and then notify everyone
    this.database.getAll(callbackFunction.bind(this));
  }

  // A method to add a new movie to the user's
  // favorites and save it to IndexedDB.
  saveMovieToFavorites(movieData) {
    // appends the movie to this.favorites and
    // stores it in the DB.
    console.log("I am about to save the movie to the DB!");
    console.log(movieData);
    this.database.addOrUpdate(movieData, function () {
      console.log("Successfully added to the database");
    });
  }

  // A method to notify components that something has changed.
  notify(eventName, data) {
    // loops through all of the subscribers and invokes the subscribers's function
    // if they're interested in the particular event
    for (let i = 0; i < this.subscribers.length; i++) {
      const subscriber = this.subscribers[i];

      const subscriberEvent = subscriber[0];
      const callbackFunction = subscriber[1];
      // is event that was just fired someth

      if (eventName == subscriberEvent) {
        callbackFunction(data);
      }
    }
  }

  subscribe(eventName, callbackFunction) {
    // when a components wants to scbsxribe to the stateManager,
    // they need to tell the sataeManager which event they're interested in,
    // and what should happen if that event is fired (callback function).
    this.subscribers.push([eventName, callbackFunction]);
  }
}
