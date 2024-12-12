'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Search, Star, LanguagesIcon as Language } from 'lucide-react';
import Image from 'next/image';

const API_KEY = process.env.NEXT_PUBLIC_KEY;
const API_URL = 'https://api.themoviedb.org/3';

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
    original_language: string;
    overview: string;
}

const Page = () => {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

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
        } catch (err) {
            setError('An error occurred while fetching movies. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
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

            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            {isLoading && <div className="text-center" aria-live="polite">Loading...</div>}

            {hasSearched && !isLoading && movies.length === 0 && (
                <div className="text-center" aria-live="polite">No movies found. Try a different search.</div>
            )}

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {movies.map((movie) => (
                    <div key={movie.id} className="col">
                        <Link href={`/movie/${movie.id}`} className="text-decoration-none">
                            <div className="card h-100">
                                <Image
                                    src={movie.poster_path 
                                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                        : `https://via.placeholder.com/500x750/1a1a1a/ffffff?text=${encodeURIComponent(movie.title)}`}
                                    className="card-img-top"
                                    alt={`${movie.title} poster`}
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