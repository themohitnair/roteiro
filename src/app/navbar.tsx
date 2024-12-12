import Link from 'next/link';
import { Code } from 'lucide-react';
import Image from 'next/image';

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container">
                <Link href="/" className="navbar-brand d-flex align-items-center">
                    <Image
                        src="/roteiro.svg"
                        alt="Logo"
                        width="30"
                        height="30"
                        className="d-inline-block align-text-top me-2"
                    />
                    roteiro
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <a
                        href="https://github.com/themohitnair/roteiro"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary ms-auto d-flex align-items-center"
                    >
                        <Code className="me-2" />
                        <span>Source Code</span>
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;