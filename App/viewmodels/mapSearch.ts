import app = require('durandal/app');
import ko = require('knockout');
import $ = require('jquery');

import ILatLng = require('../interfaces/ILatLng');
import ICrime = require('../interfaces/ICrime');

declare var google: any;

type Marker = any; //google.maps.Marker
type Bounds = any; //google.maps.LatLngBounds
type Map = any; //google.maps.Map

class mapSearch {

    postcode: KnockoutObservable<string>;
    map: Map;
    mapCenter: ILatLng;
    markers: Marker[];
    bounds: Bounds;
    key: string;
    mashapeKey: string;
    geocodingURL: string;
    crimesURL: string;
    date: string;

    constructor(){
        this.postcode = ko.observable('');
        this.mapCenter = {lat: 51.620671, lng: -3.932961};
        this.key = 'AIzaSyDP96fg0o4JSNjnOT69i_9ZquS2vWVcK-A';
        this.mashapeKey = 'U1e9OO4IdamshV44Do3XIX845EVnp1N2rIajsnICoqUR4xz3A0';
        this.geocodingURL = 'https://maps.googleapis.com/maps/api/geocode/json';
        this.crimesURL = 'https://stolenbikes88-datapoliceuk.p.mashape.com/crimes-at-location';
        this.markers = [];
        this.bounds = new google.maps.LatLngBounds;
        this.date = '2017-08';
    }

    postcodeIsValid(): boolean {
        let postcodeRegex = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/gi;
        return postcodeRegex.test(this.postcode());
    }

    getLatLng(): JQueryPromise<any> {
        return $.getJSON(this.geocodingURL, { key: this.key, address: this.postcode()}).then(data => {
            return data.results.length ? data.results[0].geometry.location : false;
        })
    }

    addMarkerToMap(crime: ICrime): void {
        let crimeLatLng: ILatLng = {
            lat: parseFloat(crime.location.latitude), 
            lng: parseFloat(crime.location.longitude)
        };

        let marker = new google.maps.Marker({ 
            position: crimeLatLng,
            map: this.map
        })

        let infowindow = new google.maps.InfoWindow({
            content: ' \
                <div> \
                    <p>Crime Category: ' + crime.category + '</p> \
                    <p>Crime Location: ' + crime.location.street.name + '</p> \
                    <p>Crime Outcome: ' + (crime.outcome_status ? crime.outcome_status.category : 'Not yet known') + ' \
                </div> \
            '
        })

        marker.addListener('click', () => {
            infowindow.open(this.map, marker);
        })

        this.bounds.extend(crimeLatLng);
        this.markers.push(marker);
    }

    fetchCrimesAndDrawMarkers(latlng: ILatLng): void {
        var self = this;

        $.ajax({
            url: self.crimesURL,
            data: { date: self.date, lat: latlng.lat, lng: latlng.lng },
            beforeSend: function(request: JQueryXHR){
                request.setRequestHeader('X-Mashape-Key', self.mashapeKey);
            },
            success: function(crimes: Crime[]){
                if (crimes.length){
                    crimes.forEach((crime: Crime) => {
                        self.addMarkerToMap(crime);
                    })
                    self.map.fitBounds(self.bounds);
                } else {
                    app.showMessage('No results found!');
                }
            },
            error: function(err: JQueryXHR){
                app.showMessage('Something went wrong: ' + err.statusText);
            }
        })
    }

    loadCrimesOnMap(): void {
        this.getLatLng().then(latlng => {
            if (!latlng){
                app.showMessage('Location not found.');
            } else {
                this.fetchCrimesAndDrawMarkers(latlng);
            }
        })
    }

    clearMap(): void {
        this.markers.forEach((marker: Marker) => {
            marker.setMap(null);
        })
        this.markers = [];
        this.bounds = new google.maps.LatLngBounds;
    }

    submitPostcode(): void {
        if (!this.postcodeIsValid()){
            app.showMessage('This isn\'t a valid postcode!');
        } else {
            this.clearMap();
            this.loadCrimesOnMap();
        }
    }

    initMap(): void {
        this.map = new google.maps.Map(document.getElementById('crimes-map'), {
            center: this.mapCenter,
            zoom: 12
        })
    }

    attached() {
        this.initMap();
    }
}

export = mapSearch;