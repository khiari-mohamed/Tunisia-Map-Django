document.addEventListener('DOMContentLoaded', (event) => {
    const map = L.map('map').setView([34.0479, 9.5183], 7); // Tunisia coordinates

    // Use a dark-themed tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
    }).addTo(map);

    const delegations = {
        'Tunis': [36.8065, 10.1815],
        'Ariana': [36.8663, 10.1647],
        'Ben Arous': [36.7477, 10.2264],
        'Manouba': [36.8101, 10.0973],
        'Nabeul': [36.4562, 10.7351],
        'Zaghouan': [36.4009, 10.1456],
        'Bizerte': [37.2744, 9.8739],
        'Beja': [36.7246, 9.1904],
        'Jendouba': [36.502, 8.7801],
        'Kef': [36.1755, 8.7046],
        'Siliana': [36.0839, 9.3754],
        'Sousse': [35.8254, 10.6369],
        'Monastir': [35.7302, 10.7677],
        'Mahdia': [35.5037, 11.0629],
        'Sfax': [34.7487, 10.7613],
        'Kairouan': [35.6781, 10.0963],
        'Kasserine': [35.1675, 8.8365],
        'Sidi Bouzid': [35.0386, 9.4852],
        'Gabès': [33.8811, 10.0982],
        'Medenine': [33.3547, 10.5039],
        'Tataouine': [32.929, 10.4518],
        'Gafsa': [34.425, 8.7842],
        'Tozeur': [33.9197, 8.1335],
        'Kebili': [33.7044, 8.9698],
        'Douz': [33.4572, 9.0212],
        'Djerba': [33.8083, 10.8327],
        'Toukaber': [36.8593, 10.2172]
    };

    // Add glowing markers to the map
    for (let delegation in delegations) {
        let coord = delegations[delegation];
        let marker = L.divIcon({
            className: 'pulse-marker',
            html: '<div></div>',
            iconSize: [24, 24],
        });
        L.marker(coord, {icon: marker}).addTo(map).bindPopup(delegation);
    }

    // Function to create polylines with delay
    function createPolylineWithDelay(coords, delay) {
        setTimeout(() => {
            const polyline = L.polyline(coords, {
                color: 'aqua',
                weight: 2,
                opacity: 0.8
            }).addTo(map);
            const line = document.querySelector('path.leaflet-interactive:last-child');
            line.setAttribute('class', 'path-animate');
        }, delay);
    }


    function dijkstra(graph, startNode) {
        let distances = {};
        let prev = {};
        let pq = new PriorityQueue();

        distances[startNode] = 0;
        pq.enqueue(startNode, 0);

        for (let node in graph) {
            if (node !== startNode) {
                distances[node] = Infinity;
            }
            prev[node] = null;
        }

        while (!pq.isEmpty()) {
            let minNode = pq.dequeue().element;

            for (let neighbor in graph[minNode]) {
                let alt = distances[minNode] + graph[minNode][neighbor];

                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    prev[neighbor] = minNode;
                    pq.enqueue(neighbor, distances[neighbor]);
                }
            }
        }

        return {distances, prev};
    }

    class PriorityQueue {
        constructor() {
            this.collection = [];
        }

        enqueue(element, priority) {
            let newNode = {element, priority};
            if (this.isEmpty()) {
                this.collection.push(newNode);
            } else {
                let added = false;
                for (let i = 0; i < this.collection.length; i++) {
                    if (newNode.priority < this.collection[i].priority) {
                        this.collection.splice(i, 0, newNode);
                        added = true;
                        break;
                    }
                }
                if (!added) {
                    this.collection.push(newNode);
                }
            }
        }

        dequeue() {
            return this.collection.shift();
        }

        isEmpty() {
            return this.collection.length === 0;
        }
    }

    // Create graph from delegations
    let graph = {};
    for (let delegation1 in delegations) {
        graph[delegation1] = {};
        for (let delegation2 in delegations) {
            if (delegation1 !== delegation2) {
                let dist = Math.sqrt(
                    Math.pow(delegations[delegation1][0] - delegations[delegation2][0], 2) +
                    Math.pow(delegations[delegation1][1] - delegations[delegation2][1], 2)
                );
                graph[delegation1][delegation2] = dist;
            }
        }
    }

    let {distances, prev} = dijkstra(graph, 'Tunis'); // Start from Tunis

    // Function to get path from Dijkstra's result
    function getPath(prev, targetNode) {
        let path = [];
        let currentNode = targetNode;
        while (currentNode) {
            path.push(currentNode);
            currentNode = prev[currentNode];
        }
        return path.reverse();
    }

  
    function animatePaths(paths) {
        let delay = 0;
        for (let path of paths) {
            for (let i = 0; i < path.length - 1; i++) {
                let start = delegations[path[i]];
                let end = delegations[path[i + 1]];

                createPolylineWithDelay([start, end], delay);
                delay += 1000; 
            }
        }
    }

    let paths = [];
    for (let delegation in delegations) {
        if (delegation !== 'Tunis') {
            let path = getPath(prev, delegation);
            paths.push(path);
        }
    }

    animatePaths(paths);
});
