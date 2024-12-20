'use client'

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Search, Star, LanguagesIcon as Language, Filter } from 'lucide-react';
import Image from 'next/image';

const API_KEY = process.env.NEXT_PUBLIC_KEY;
const API_URL = 'https://api.themoviedb.org/3';

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
    vote_count: number;
    original_language: string;
    overview: string;
    genre_ids: number[];
}

interface Genre {
    id: number;
    name: string;
}

const Page = () => {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState<Movie[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [sortBy, setSortBy] = useState('popularity.desc');
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [yearRange, setYearRange] = useState({ min: 1900, max: new Date().getFullYear() });
    const [minVoteCount, setMinVoteCount] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch(`${API_URL}/genre/movie/list?api_key=${API_KEY ?? ''}`);
                if (!response.ok) throw new Error('Failed to fetch genres');
                const data = await response.json();
                setGenres(data.genres);
            } catch (err) {
                console.error('Error fetching genres:', err);
            }
        };
        fetchGenres();
    }, []);

    const searchMovies = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const response = await fetch(`${API_URL}/search/movie?api_key=${API_KEY ?? ''}&query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }
            const data = await response.json();
            setMovies(data.results || []);
            applyFiltersAndSort(data.results || []);
        } catch (err) {
            setError('An error occurred while fetching movies. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFiltersAndSort = useCallback((moviesToFilter: Movie[]) => {
        let filteredResults = moviesToFilter.filter(movie => {
            const releaseYear = new Date(movie.release_date).getFullYear();
            const passesGenreFilter = selectedGenres.length === 0 || selectedGenres.some(genreId => movie.genre_ids.includes(genreId));
            const passesYearFilter = releaseYear >= yearRange.min && releaseYear <= yearRange.max;
            const passesVoteCountFilter = movie.vote_count >= minVoteCount;
            return passesGenreFilter && passesYearFilter && passesVoteCountFilter;
        });

        switch (sortBy) {
            case 'release_date.asc':
                filteredResults.sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());
                break;
            case 'release_date.desc':
                filteredResults.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
                break;
            case 'vote_average.desc':
                filteredResults.sort((a, b) => b.vote_average - a.vote_average);
                break;
            default:
                // Default sorting (by popularity) is already applied by the API
                break;
        }

        setFilteredMovies(filteredResults);
    }, [selectedGenres, yearRange, minVoteCount, sortBy]);

    useEffect(() => {
        applyFiltersAndSort(movies);
    }, [movies, applyFiltersAndSort]);

    const handleSort = (sortOption: string) => {
        setSortBy(sortOption);
    };

    const handleGenreChange = (genreId: number) => {
        setSelectedGenres(prev => 
            prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
        );
    };

    return (
        <main className="container py-4">
            <form onSubmit={searchMovies} className="mb-4">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search for a movie..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search for a movie"
                    />
                    <button className="btn btn-primary d-flex align-items-center gap-2" type="submit" disabled={isLoading}>
                        <Search size={18} />
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {hasSearched && (
                <>
                    <button 
                        className="btn btn-secondary mb-3" 
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} className="me-2" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    {showFilters && (
                        <div className="card mb-4">
                            <div className="card-body">
                                <h5 className="card-title mb-3">Filters</h5>
                                <div className="mb-3">
                                    <label className="form-label">Genres:</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {genres.map(genre => (
                                            <div key={genre.id} className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`genre-${genre.id}`}
                                                    checked={selectedGenres.includes(genre.id)}
                                                    onChange={() => handleGenreChange(genre.id)}
                                                />
                                                <label className="form-check-label" htmlFor={`genre-${genre.id}`}>
                                                    {genre.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Release Year Range:</label>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Min Year"
                                            value={yearRange.min}
                                            onChange={(e) => setYearRange(prev => ({ ...prev, min: parseInt(e.target.value) || 1900 }))}
                                            min="1900"
                                            max={new Date().getFullYear()}
                                        />
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Max Year"
                                            value={yearRange.max}
                                            onChange={(e) => setYearRange(prev => ({ ...prev, max: parseInt(e.target.value) || new Date().getFullYear() }))}
                                            min="1900"
                                            max={new Date().getFullYear()}
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Minimum Vote Count:</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={minVoteCount}
                                        onChange={(e) => setMinVoteCount(parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="me-2">Sort by:</label>
                        <div className="btn-group" role="group" aria-label="Sort options">
                            <button 
                                type="button" 
                                className={`btn btn-outline-primary ${sortBy === 'release_date.asc' ? 'active' : ''}`}
                                onClick={() => handleSort('release_date.asc')}
                            >
                                Oldest First
                            </button>
                            <button 
                                type="button" 
                                className={`btn btn-outline-primary ${sortBy === 'release_date.desc' ? 'active' : ''}`}
                                onClick={() => handleSort('release_date.desc')}
                            >
                                Newest First
                            </button>
                            <button 
                                type="button" 
                                className={`btn btn-outline-primary ${sortBy === 'vote_average.desc' ? 'active' : ''}`}
                                onClick={() => handleSort('vote_average.desc')}
                            >
                                Best Rating
                            </button>
                        </div>
                    </div>
                </>
            )}

            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            {isLoading && <div className="text-center" aria-live="polite">Loading...</div>}

            {hasSearched && !isLoading && filteredMovies.length === 0 && (
                <div className="text-center" aria-live="polite">No movies found. Try adjusting your filters or search query.</div>
            )}

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {filteredMovies.map((movie) => (
                    <div key={movie.id} className="col">
                        <Link href={`/movie/${movie.id}`} className="text-decoration-none">
                            <div className="card h-100">
                                <Image
                                    src={movie.poster_path 
                                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                        : `https://via.placeholder.com/500x750/1a1a1a/ffffff?text=${encodeURIComponent(movie.title)}`}
                                    className="card-img-top"
                                    alt={`${movie.title} poster`}
                                    width={500}
                                    height={750}
                                    loading="lazy"
                                />
                                <div className="card-body">
                                    <h5 className="card-title mb-3">{movie.title}</h5>
                                    <div className="d-flex flex-column gap-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <Calendar size={16} />
                                            <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <Star size={16} />
                                            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <Language size={16} />
                                            <span>{movie.original_language?.toUpperCase() || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <p className="card-text mt-3 small text">
                                        {movie.overview?.slice(0, 100)}
                                        {movie.overview?.length > 100 ? '...' : ''}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </main>
    );
};

export default Page;