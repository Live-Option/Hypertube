import request from 'request-json';
import _ from 'lodash';
import omdb from 'omdb';
import Movie from './movie_schema';
import Serie from './serie_schema';

const addSerie = async (serie) => {
    const title = serie.title;
    omdb.get({ imdb: serie.imdb_id }, false, (error, movie) => {
        if (error || !movie) return console.log(serie.imdb_id, serie.title);
        Serie.findOne({ title }, (err, found) => {
            if (!found) {
                const episodes = [];
                serie.episodes.forEach((episode) => {
                    const torrent = Object.values(episode.torrents).pop();
                    if (torrent) {
                        episodes.push({
                            magnet: torrent.url,
                            season: episode.season,
                            episode: episode.episode,
                            eptitle: episode.title,
                        });
                    }
                });
                const genres = [];
                serie.genres.forEach((genre) => {
                    if (genre === 'science-fiction') {
                        genres.push('Sci-Fi');
                    } else {
                        genres.push(_.capitalize(genre));
                    }
                });
                const newSerie = new Serie({
                    title,
                    year: serie.year,
                    runtime: serie.runtime,
                    poster: serie.images.poster,
                    genres,
                    plot: serie.synopsis,
                    code: serie.imdb_id,
                    episodes,
                    rating: movie.imdb.rating,
                    pop: serie.rating.percentage, // les seeds sont tous à 0
                });
                newSerie.save();
            }
        });
    });
};

const addMovie = (movie) => {
    const { title } = movie;
    const { year } = movie;
    Movie.findOne({ title, year }, (err, found) => {
        if (!movie.torrents) return;
        movie.torrents.forEach((torrent) => {
            const trackers = '&tr=udp://tracker.internetwarriors.net:1337&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.openbittorrent.com:80&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://glotorrents.pw:6969/announce';
            const name = movie.title.replace(' ', '+');
            const link = encodeURI(`magnet:?xt=urn:btih:${torrent.hash}&dn=${name}${trackers}`);
            torrent.magnet = link;
        });
        if (!found) {
            let pop = 0;
            movie.torrents.forEach((torrent) => {
                pop += torrent.seeds;
            });
            pop /= movie.torrents.length;
            const newMovie = new Movie({
                title: movie.title,
                year: movie.year,
                rated: movie.mpa_rating,
                runtime: movie.runtime,
                poster: movie.large_cover_image,
                genres: movie.genres,
                plot: movie.summary,
                code: movie.imdb_code,
                rating: movie.rating,
                torrents: movie.torrents,
                pop,
            });
            newMovie.save();
        }
    });
};

const yts = () => {
    const client = request.createClient('https://yts.ag/api/v2/');
    client.get('list_movies.json', (error, response, body) => {
        const max = Math.ceil(body.data.movie_count / 50);
        for (let i = 1; i < max; i += 1) {
            client.get(`list_movies.json?limit=50&page=${i}`, (err, res, data) => {
                if (typeof data === 'object') data.data.movies.forEach((movie) => addMovie(movie));
            });
            if (i === max - 1) console.log('Success! Database filled from YTS');
        }
    });
};

const eztvPrepare = (id) => {
    const client = request.createClient('http://eztvapi.ml/');
    client.get(`show/${id}`, (error, response, body) => {
        if (typeof body === 'object') addSerie(body);
    });
};

const eztv = () => {
    const client = request.createClient('http://eztvapi.ml/');
    client.get('shows', (error, response, body) => {
        const max = body.pop().split('/')[1];
        for (let i = 1; i <= max; i += 1) {
            client.get(`shows/${i}`, (err, res, data) => {
                if (data) data.map((serie) => eztvPrepare(serie.imdb_id));
            });
        }
    });
 };

export { yts, eztv };
