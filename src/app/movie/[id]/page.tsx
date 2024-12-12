'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Clock, Star, Users, LanguagesIcon as Language, Tag, Globe } from 'lucide-react';

const API_KEY = process.env.NEXT_PUBLIC_KEY;
const API_URL = 'https://api.themoviedb.org/3';

interface MovieDetails {
    title: string;
    overview: string;
    release_date: string;
    vote_average: number;
    vote_count: number;
    poster_path: string;
    runtime: number;
    original_language: string;
    genres: Array<{ id: number; name: string }>;
    production_countries: Array<{ iso_3166_1: string; name: string }>;
    budget: number;
    revenue: number;
    tagline: string;
}

const MoviePage = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/movie/${id}?api_key=${API_KEY ?? ''}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch movie details');
                }
                const data = await response.json();
                setMovie(data);
            } catch (err) {
                setError('An error occurred while fetching movie details. Please try again.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    if (isLoading) return <div className="text-center py-4" aria-live="polite">Loading...</div>;
    if (error) return <div className="alert alert-danger m-4" role="alert">{error}</div>;
    if (!movie) return <div className="text-center py-4" aria-live="polite">No movie details found.</div>;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <main className="container py-4">
            <div className="row">
                <div className="col-md-4 mb-4 mb-md-0">
                    <img
                        src={movie.poster_path 
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : `https://via.placeholder.com/500x750/1a1a1a/ffffff?text=${encodeURIComponent(movie.title)}`}
                        alt={`${movie.title} poster`}
                        className="img-fluid rounded"
                        loading="lazy"
                    />
                </div>
                <div className="col-md-8">
                    <h1 className="mb-2">{movie.title}</h1>
                    {movie.tagline && (
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <Tag size={16} />
                            <em>{movie.tagline}</em>
                        </div>
                    )}
                    
                    <div className="d-flex flex-wrap gap-4 mb-4">
                        <div className="d-flex align-items-center gap-2">
                            <Calendar size={18} />
                            <span>{new Date(movie.release_date).toLocaleDateString()}</span>
                        </div>
                        {movie.runtime > 0 && (
                            <div className="d-flex align-items-center gap-2">
                                <Clock size={18} />
                                <span>{movie.runtime} minutes</span>
                            </div>
                        )}
                        <div className="d-flex align-items-center gap-2">
                            <Star size={18} />
                            <span>{movie.vote_average.toFixed(1)} ({movie.vote_count} votes)</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Language size={18} />
                            <span>{movie.original_language.toUpperCase()}</span>
                        </div>
                    </div>

                    <p className="mb-4">{movie.overview}</p>

                    {movie.genres.length > 0 && (
                        <div className="mb-3">
                            <strong className="d-block mb-2">Genres:</strong>
                            <div className="d-flex flex-wrap gap-2">
                                {movie.genres.map(genre => (
                                    <span key={genre.id} className="badge bg-secondary">{genre.name}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {movie.production_countries.length > 0 && (
                        <div className="mb-3">
                            <strong className="d-block mb-2">Production Countries:</strong>
                            <div className="d-flex align-items-center gap-2">
                                <Globe size={18} />
                                <span>{movie.production_countries.map(country => country.name).join(', ')}</span>
                            </div>
                        </div>
                    )}

                    {(movie.budget > 0 || movie.revenue > 0) && (
                        <div className="mt-4">
                            {movie.budget > 0 && (
                                <p><strong>Budget:</strong> {formatCurrency(movie.budget)}</p>
                            )}
                            {movie.revenue > 0 && (
                                <p><strong>Revenue:</strong> {formatCurrency(movie.revenue)}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default MoviePage;