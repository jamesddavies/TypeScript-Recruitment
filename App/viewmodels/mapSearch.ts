declare var google: any;

import app = require('durandal/app');
import ko = require('knockout');
import $ = require('jquery');

type Crime = any;

//type Marker = google.maps.Marker;
type Marker = any;
//type Bounds = google.maps.LatLngBounds;
type Bounds = any;
//type Map = google.maps.Map;
type Map = any;

class mapSearch {

    postcode: KnockoutObservable<string>;
    map: Map;
    markers: Marker[];
    bounds: Bounds;
    key: string;
    mashapeKey: string;
    geocodingURL: string;
    crimesURL: string;
    date: string;

    constructor(){
        this.postcode = ko.observable('');
        this.key = 'AIzaSyDP96fg0o4JSNjnOT69i_9ZquS2vWVcK-A';
        this.mashapeKey = 'U1e9OO4IdamshV44Do3XIX845EVnp1N2rIajsnICoqUR4xz3A0';
        this.geocodingURL = 'https://maps.googleapis.com/maps/api/geocode/json';
        this.crimesURL = 'https://stolenbikes88-datapoliceuk.p.mashape.com/crimes-at-location';
        this.markers = [];
        this.bounds = new google.maps.LatLngBounds;
        this.date = '2014-12';
    }

    postcodeIsValid(): boolean {
        let postcodeRegex = new RegExp('[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}', 'gi');
        return postcodeRegex.test(this.postcode())
    }

    getLatLng(): JQueryPromise<any> {
        return $.getJSON(this.geocodingURL, { key: this.key, address: this.postcode()}).then(data => {
            return data.results.length ? data.results[0].geometry.location : false;
        })
    }

    addMarkerToMap(crime: Crime): void {
        let crimeLatLng = {
            lat: parseFloat(crime.location.latitude), 
            lng: parseFloat(crime.location.longitude)
        };

        let marker = new google.maps.Marker({ 
            position: crimeLatLng,
            map: this.map
        })

        let infowindow = new google.maps.InfoWindow({
            content: `
                <div>
                    <p>Crime Category: ${crime.category}</p>
                    <p>Crime Location: ${crime.location.street.name}</p>
                    <p>Crime Outcome: ${crime.outcome_status ? crime.outcome_status.category : 'Not yet known'}
                </div>
            `
        })

        marker.addListener('click', () => {
            infowindow.open(this.map, marker);
        })

        this.bounds.extend(crimeLatLng)
        this.markers.push(marker)
    }

    loadCrimesOnMap(): void {
        var self = this;

        this.getLatLng().then(latlng => {
            if (!latlng){
                app.showMessage('Location not found.');
            } else {
                $.ajax({
                    url: this.crimesURL,
                    data: { date: this.date, lat: latlng.lat, lng: latlng.lng },
                    beforeSend: function(request){
                        request.setRequestHeader('X-Mashape-Key', self.mashapeKey);
                    },
                    success: function(crimes){
                        if (crimes.length){
                            crimes.forEach(crime => {
                                this.addMarkerToMap(crime);
                            })
                            this.map.fitBounds(this.bounds);
                        } else {
                            app.showMessage('No results found!');
                        }
                    },
                    error: function(err, textStatus, errMessage){
                        app.showMessage('Something went wrong: ' + textStatus);
                    }
                })
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
            center: {lat: 51.620671, lng: -3.932961},
            zoom: 12
        })
    }

    attached() {
        this.initMap();
    }
}

export = mapSearch;