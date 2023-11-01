import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import React, { useEffect, useRef, useMemo } from "react";
import 'leaflet/dist/leaflet.css';
import markIcon from '../images/markicon.png';

function MapComponent({ deliveryAddresses }) {
    const mapRef = useRef(null);
    const waypointsRef = useRef(null);
    
    const customIcon = useMemo(() => {
      return new L.Icon({
        iconUrl: markIcon, 
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    }, []);

    useEffect(() => {
        if (!mapRef.current && deliveryAddresses.length) {
            const map = L.map('map').setView([52.5246, 13.3689], 13);
            mapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        }

        if (mapRef.current) {
            if (waypointsRef.current) {
              waypointsRef.current.remove();

            }

            const validAddresses = deliveryAddresses.filter(address => address && address.coordinates);
            const waypoints = validAddresses.map(address => L.Routing.waypoint(L.latLng(address.coordinates[0], address.coordinates[1]), address.name));
    
            waypointsRef.current = L.Routing.control({
                waypoints: waypoints,
                routeWhileDragging: true,
                addWaypoints: false, 
                createMarker: function(i, wp) {
                    return L.marker(wp.latLng, { icon: customIcon }).bindPopup(wp.name);
                }
            }).addTo(mapRef.current);
        }

    }, [deliveryAddresses, customIcon]);

    return <div id="map" style={{ height: "400px", marginLeft: "5%",width: "90%" }}></div>;
}

export default MapComponent;
